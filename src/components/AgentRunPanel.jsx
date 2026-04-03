import EmptyState from './EmptyState'
import RunHeader from './RunHeader'
import CoordinatorThoughts from './CoordinatorThoughts'
import TaskList from './TaskList'
import FinalOutput from './FinalOutput'

export default function AgentRunPanel({ state }) {
  const { runStatus, run, startTime, endTime, tasks, taskOrder, coordinatorThoughts, finalOutput, error } = state

  if (runStatus === 'idle') {
    return <EmptyState />
  }

  return (
    <div className="min-h-screen">
      <RunHeader
        run={run}
        runStatus={runStatus}
        startTime={startTime}
        endTime={endTime}
      />

      <CoordinatorThoughts thoughts={coordinatorThoughts} />

      <TaskList taskOrder={taskOrder} tasks={tasks} />

      {(runStatus === 'complete' || runStatus === 'failed') && (
        <FinalOutput
          output={finalOutput}
          runStatus={runStatus}
          error={error}
        />
      )}
    </div>
  )
}
