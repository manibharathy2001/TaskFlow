import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './Profile.css'

function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h1>Profile</h1>
          <p>Unable to load your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>View your TaskFlow account information.</p>
        </div>

        <Link
          to="/dashboard"
          className="profile-back-button"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <div className="profile-details">
          <div className="profile-field">
            <span className="profile-label">
              Name
            </span>

            <span className="profile-value">
              {user.name}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">
              Email
            </span>

            <span className="profile-value">
              {user.email}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">
              Role
            </span>

            <span className="profile-badge">
              {user.role || 'user'}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-label">
              Account Status
            </span>

            <span className="profile-badge">
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile