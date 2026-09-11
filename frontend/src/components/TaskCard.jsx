import { useState } from 'react'
import { deleteTask } from '../services/taskService'
import EditTask from './EditTask'
import './TaskCard.css'

function TaskCard({
  task,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleTaskUpdated = (updatedTask) => {
    setIsEditing(false)
    onTaskUpdated(updatedTask)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await deleteTask(task._id)

      onTaskDeleted(task._id)
    } catch (error) {
      console.error('Failed to delete task:', error)

      setError(
        error.response?.data?.message ||
          'Failed to delete task. Please try again.'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="task-card">
      {isEditing ? (
        <EditTask
          task={task}
          onTaskUpdated={handleTaskUpdated}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="task-card-header">
            <h3>{task.title}</h3>

            <span
              className={`task-status status-${task.status}`}
            >
              {task.status}
            </span>
          </div>

          {task.description && (
            <p className="task-description">
              {task.description}
            </p>
          )}

          <div className="task-card-details">
            <div className="task-detail">
              <span className="task-detail-label">
                Priority
              </span>

              <span
                className={`task-priority priority-${task.priority}`}
              >
                {task.priority}
              </span>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">
                Due Date
              </span>

              <span>
                {task.dueDate
                  ? new Date(
                      task.dueDate
                    ).toLocaleDateString()
                  : 'No due date'}
              </span>
            </div>
          </div>

          {error && (
            <div className="task-card-error">
              {error}
            </div>
          )}

          <div className="task-card-actions">
            <button
              type="button"
              className="edit-task-button"
              onClick={() => setIsEditing(true)}
              disabled={deleting}
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-task-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? 'Deleting Task...'
                : 'Delete'}
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default TaskCard