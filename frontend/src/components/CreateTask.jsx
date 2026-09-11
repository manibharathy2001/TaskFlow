import { useState } from 'react'
import { createTask } from '../services/taskService'
import './CreateTask.css'

function CreateTask({ onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

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
    setSuccess('')

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

      const response = await createTask(taskData)

      onTaskCreated(response.data.task)

      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      })

      setSuccess('Task created successfully.')

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (error) {
      console.error('Failed to create task:', error)

      setError(
        error.response?.data?.message ||
          'Failed to create task. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-task-card">
      <div className="create-task-header">
        <div>
          <h2>Create Task</h2>

          <p>
            Add a new task to your TaskFlow account.
          </p>
        </div>
      </div>

      {error && (
        <div className="create-task-error">
          {error}
        </div>
      )}

      {success && (
        <div className="create-task-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="create-task-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
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
            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
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
            <label htmlFor="dueDate">
              Due Date
            </label>

            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="create-task-button"
          disabled={loading}
        >
          {loading
            ? 'Creating Task...'
            : 'Create Task'}
        </button>
      </form>
    </div>
  )
}

export default CreateTask