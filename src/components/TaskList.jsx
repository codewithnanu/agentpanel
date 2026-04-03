import TaskCard from './TaskCard'
import ParallelGroup from './ParallelGroup'

export default function TaskList({ taskOrder, tasks }) {
  if (taskOrder.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">
        Task execution
      </div>
      {taskOrder.map((item, idx) => {
        if (item.type === 'task') {
          const task = tasks[item.id]
          if (!task) return null
          return <TaskCard key={item.id} task={task} allTasks={tasks} />
        }
        if (item.type === 'group') {
          return (
            <ParallelGroup
              key={item.groupId}
              groupId={item.groupId}
              taskIds={item.taskIds}
              tasks={tasks}
            />
          )
        }
        return null
      })}
    </div>
  )
}
