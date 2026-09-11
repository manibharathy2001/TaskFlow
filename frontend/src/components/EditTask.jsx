import { useState } from 'react'
import { updateTask } from '../services/taskService'
import './EditTask.css'

function EditTask({
  task,
  onTaskUpdated,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    dueDate: task.dueDate
      ? new Date(task.dueDate)
          .toISOString()
          .split('T')[0]
      : '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!formData.title.trim()) {
      setError('Task title is required.')
      return
    }

    try {
      setLoading(true)

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      }

      const response = await updateTask(
        task._id,
        taskData
      )

      onTaskUpdated(response.data.task)
    } catch (error) {
      console.error('Failed to update task:', error)

      setError(
        error.response?.data?.message ||
          'Failed to update task. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edit-task">
      <h3>Edit Task</h3>

      {error && (
        <div className="edit-task-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={`edit-title-${task._id}`}>
            Title
          </label>

          <input
            id={`edit-title-${task._id}`}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor={`edit-description-${task._id}`}
          >
            Description
          </label>

          <textarea
            id={`edit-description-${task._id}`}
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="edit-task-row">
          <div className="form-group">
            <label
              htmlFor={`edit-status-${task._id}`}
            >
              Status
            </label>

            <select
              id={`edit-status-${task._id}`}
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="todo">To Do</option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor={`edit-priority-${task._id}`}
            >
              Priority
            </label>

            <select
              id={`edit-priority-${task._id}`}
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor={`edit-dueDate-${task._id}`}
            >
              Due Date
            </label>

            <input
              id={`edit-dueDate-${task._id}`}
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="edit-task-actions">
          <button
            type="submit"
            className="save-task-button"
            disabled={loading}
          >
            {loading
              ? 'Saving Changes...'
              : 'Save Changes'}
          </button>

          <button
            type="button"
            className="cancel-task-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditTask