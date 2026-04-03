import { useReducer, useCallback } from 'react'

const initialState = {
  runStatus: 'idle', // 'idle' | 'running' | 'complete' | 'failed'
  run: null,         // { id, query }
  startTime: null,
  endTime: null,
  tasks: {},         // taskId -> TaskObject
  taskOrder: [],     // [{type:'task',id} | {type:'group',groupId,taskIds:[]}]
  coordinatorThoughts: [],  // [{thought, timestamp}]
  systemThoughts: [],       // [{thought, timestamp}] for task_id: null
  finalOutput: null, // {summary, citations}
  error: null,
}

function runReducer(state, action) {
  if (action.type === 'RESET') return { ...initialState }

  const event = action.payload

  switch (event.type) {
    case 'run_started': {
      return {
        ...initialState,
        runStatus: 'running',
        run: { id: event.run_id, query: event.query },
        startTime: Date.now(),
      }
    }

    case 'agent_thought': {
      const thought = { thought: event.thought, timestamp: event.timestamp }

      if (event.task_id === null) {
        return { ...state, systemThoughts: [...state.systemThoughts, thought] }
      }

      if (event.task_id === 'coordinator') {
        return { ...state, coordinatorThoughts: [...state.coordinatorThoughts, thought] }
      }

      const task = state.tasks[event.task_id]
      if (!task) return state
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [event.task_id]: { ...task, thoughts: [...task.thoughts, thought] },
        },
      }
    }

    case 'task_spawned': {
      const newTask = {
        id: event.task_id,
        label: event.label,
        agent: event.agent,
        status: 'running',
        parallel_group: event.parallel_group || null,
        depends_on: event.depends_on || [],
        toolCalls: [],
        partialOutputs: [],
        finalOutput: null,
        thoughts: [],
        hadFailure: false,
        retryCount: 0,
        cancelReason: null,
        cancelMessage: null,
        error: null,
        spawnTime: event.timestamp,
      }

      let newTaskOrder = [...state.taskOrder]

      if (event.parallel_group) {
        const groupIdx = newTaskOrder.findIndex(
          (item) => item.type === 'group' && item.groupId === event.parallel_group
        )
        if (groupIdx >= 0) {
          newTaskOrder = newTaskOrder.map((item, i) =>
            i === groupIdx ? { ...item, taskIds: [...item.taskIds, event.task_id] } : item
          )
        } else {
          newTaskOrder.push({
            type: 'group',
            groupId: event.parallel_group,
            taskIds: [event.task_id],
          })
        }
      } else {
        newTaskOrder.push({ type: 'task', id: event.task_id })
      }

      return {
        ...state,
        tasks: { ...state.tasks, [event.task_id]: newTask },
        taskOrder: newTaskOrder,
      }
    }

    case 'tool_call': {
      const task = state.tasks[event.task_id]
      if (!task) return state
      const newCall = {
        id: `${event.task_id}-${event.tool}-${event.timestamp}`,
        tool: event.tool,
        input_summary: event.input_summary,
        output_summary: null,
        callTime: event.timestamp,
        resultTime: null,
        pending: true,
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [event.task_id]: { ...task, toolCalls: [...task.toolCalls, newCall] },
        },
      }
    }

    case 'tool_result': {
      const task = state.tasks[event.task_id]
      if (!task) return state
      const toolCalls = [...task.toolCalls]
      // Find the last pending call for this tool
      let lastPendingIdx = -1
      toolCalls.forEach((call, i) => {
        if (call.tool === event.tool && call.pending) lastPendingIdx = i
      })
      if (lastPendingIdx >= 0) {
        toolCalls[lastPendingIdx] = {
          ...toolCalls[lastPendingIdx],
          output_summary: event.output_summary,
          resultTime: event.timestamp,
          pending: false,
        }
      }
      return {
        ...state,
        tasks: { ...state.tasks, [event.task_id]: { ...task, toolCalls } },
      }
    }

    case 'partial_output': {
      const task = state.tasks[event.task_id]
      if (!task) return state
      const output = {
        content: event.content,
        is_final: event.is_final,
        quality_score: event.quality_score,
        timestamp: event.timestamp,
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [event.task_id]: {
            ...task,
            partialOutputs: [...task.partialOutputs, output],
            finalOutput: event.is_final ? output : task.finalOutput,
          },
        },
      }
    }

    case 'task_update': {
      const task = state.tasks[event.task_id]
      if (!task) return state
      const updates = { status: event.status }

      if (event.status === 'failed') {
        updates.error = event.error
        updates.hadFailure = true
      }
      if (event.status === 'running') {
        // This is a retry — increment retryCount, clear error
        updates.retryCount = task.retryCount + 1
        updates.error = null
      }
      if (event.status === 'cancelled') {
        updates.cancelReason = event.reason
        updates.cancelMessage = event.message
      }
      if (event.status === 'complete') {
        updates.error = null
      }

      return {
        ...state,
        tasks: { ...state.tasks, [event.task_id]: { ...task, ...updates } },
      }
    }

    case 'run_complete': {
      return {
        ...state,
        runStatus: 'complete',
        endTime: Date.now(),
        finalOutput: event.output,
      }
    }

    case 'run_error': {
      return {
        ...state,
        runStatus: 'failed',
        endTime: Date.now(),
        error: event.message,
      }
    }

    default:
      return state
  }
}

export function useRunState() {
  const [state, dispatch] = useReducer(runReducer, initialState)

  const processEvent = useCallback((event) => {
    dispatch({ type: 'PROCESS_EVENT', payload: event })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return { state, processEvent, reset }
}
