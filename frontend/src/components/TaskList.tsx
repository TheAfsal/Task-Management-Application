import axios from 'axios'

interface Task {
  _id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
}

interface TaskListProps {
  tasks: Task[]
  fetchTasks: () => Promise<void>
}

function TaskList({ tasks, fetchTasks }: TaskListProps) {
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`)
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await axios.put(`/api/tasks/${id}`, { completed: !completed })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="border p-6 rounded-lg bg-white shadow-md flex justify-between items-center"
        >
          <div>
            <h3
              className={`text-lg font-semibold ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            >
              {task.title}
            </h3>
            {task.description && <p className="text-gray-600 mt-1">{task.description}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleToggle(task._id, task.completed)}
              className={`p-2 rounded-lg text-white ${
                task.completed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
              } transition-colors`}
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList