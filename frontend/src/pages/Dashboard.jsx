import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getTasks, getTaskStats } from '../services/taskService'
import CreateTask from '../components/CreateTask'
import TaskCard from '../components/TaskCard'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  })

  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard data from the backend
  const fetchDashboardData = async () => {
    const [statsResponse, tasksResponse] =
      await Promise.all([
        getTaskStats(),
        getTasks(),
      ])

    setStats(statsResponse.data.stats)
    setTasks(tasksResponse.data.tasks)
  }

  // Initial dashboard loading
  useEffect(() => {
    let cancelled = false

    const loadInitialData = async () => {
      try {
        const [statsResponse, tasksResponse] =
          await Promise.all([
            getTaskStats(),
            getTasks(),
          ])

        if (cancelled) {
          return
        }

        setStats(statsResponse.data.stats)
        setTasks(tasksResponse.data.tasks)
      } catch (error) {
        if (cancelled) {
          return
        }

        console.error(
          'Failed to load dashboard data:',
          error
        )

        setError(
          error.response?.data?.message ||
            'Failed to load dashboard data.'
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      cancelled = true
    }
  }, [])

  // Retry dashboard loading
  const handleRetry = async () => {
    try {
      setLoading(true)
      setError('')

      await fetchDashboardData()
    } catch (error) {
      console.error(
        'Failed to reload dashboard data:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to load dashboard data.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle newly created task
  const handleTaskCreated = (newTask) => {
    setTasks((previousTasks) => [
      newTask,
      ...previousTasks,
    ])

    setStats((previousStats) => {
      const updatedStats = {
        ...previousStats,
        totalTasks: previousStats.totalTasks + 1,
      }

      if (newTask.status === 'todo') {
        updatedStats.todo += 1
      }

      if (newTask.status === 'in-progress') {
        updatedStats.inProgress += 1
      }

      if (newTask.status === 'completed') {
        updatedStats.completed += 1
      }

      if (newTask.priority === 'low') {
        updatedStats.lowPriority += 1
      }

      if (newTask.priority === 'medium') {
        updatedStats.mediumPriority += 1
      }

      if (newTask.priority === 'high') {
        updatedStats.highPriority += 1
      }

      return updatedStats
    })
  }

  // Handle updated task
  const handleTaskUpdated = (updatedTask) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task._id === updatedTask._id
          ? updatedTask
          : task
      )
    )
  }

  // Handle deleted task
  const handleTaskDeleted = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task._id !== taskId
      )
    )

    setStats((previousStats) => ({
      ...previousStats,
      totalTasks: Math.max(
        0,
        previousStats.totalTasks - 1
      ),
    }))
  }

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>TaskFlow</h2>
          <p>Task Management</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="sidebar-link active">
            Dashboard
          </a>

          <a href="#tasks" className="sidebar-link">
            Tasks
          </a>

          <Link to="/profile" className="sidebar-link">
            Profile
          </Link>
        </nav>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>

            <p>Welcome to your TaskFlow dashboard.</p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="dashboard-error">
            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={handleRetry}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry"}
            </button>
          </div>
        )}

        {/* Dashboard statistics */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>

            <p>{loading ? "..." : stats.totalTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Pending Tasks</h3>

            <p>{loading ? "..." : stats.todo + stats.inProgress}</p>
          </div>

          <div className="stat-card">
            <h3>Completed Tasks</h3>

            <p>{loading ? "..." : stats.completed}</p>
          </div>
        </div>

        {/* Create task */}
        <CreateTask onTaskCreated={handleTaskCreated} />

        {/* Task list */}
        <div className="tasks-section" id="tasks">
          <div className="tasks-section-header">
            <div>
              <h2>Your Tasks</h2>

              <p>Tasks created by your account.</p>
            </div>

            {!loading && (
              <span className="task-count">
                {tasks.length} task
                {tasks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="tasks-message">
              <h3>Loading tasks...</h3>

              <p>Please wait while we load your tasks.</p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="tasks-message">
              <h3>Unable to load tasks</h3>

              <p>Something went wrong while loading your tasks.</p>

              <button
                type="button"
                className="retry-button"
                onClick={handleRetry}
              >
                Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            /* Empty state */
            <div className="tasks-message">
              <h3>No tasks yet</h3>

              <p>Create your first task to get started.</p>
            </div>
          ) : (
            /* Task list */
            <div className="task-list">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard