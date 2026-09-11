import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <NavLink to="/" className="logo">
          TaskFlow
        </NavLink>

        <div className="layout-user">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout