import TaskCard from './TaskCard'

export default function ParallelGroup({ groupId, taskIds, tasks }) {
  const groupTasks = taskIds.map((id) => tasks[id]).filter(Boolean)
  const runningCount = groupTasks.filter((t) => t.status === 'running').length
  const doneCount = groupTasks.filter(
    (t) => t.status === 'complete' || t.status === 'cancelled'
  ).length

  return (
    <div className="border border-indigo-900 rounded-xl bg-indigo-950/20 overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-indigo-900 bg-indigo-950/40">
        {/* Parallel lanes icon */}
        <svg className="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V4z" />
        </svg>
        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Parallel execution
        </span>
        <span className="text-xs text-indigo-500 ml-1">
          {taskIds.length} tasks running simultaneously
        </span>
        {runningCount > 0 && (
          <span className="ml-auto text-xs text-indigo-400 animate-pulse">
            {runningCount} in flight
          </span>
        )}
        {runningCount === 0 && doneCount > 0 && (
          <span className="ml-auto text-xs text-indigo-400">
            {doneCount}/{taskIds.length} finished
          </span>
        )}
      </div>

      {/* Task grid */}
      <div className={`p-3 grid gap-3 ${
        taskIds.length === 1 ? 'grid-cols-1' :
        taskIds.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {taskIds.map((id) =>
          tasks[id] ? (
            <TaskCard key={id} task={tasks[id]} allTasks={tasks} />
          ) : null
        )}
      </div>
    </div>
  )
}
