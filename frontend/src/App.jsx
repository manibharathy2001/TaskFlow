import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="login" element={<Login />} />

          <Route path="register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="profile"
              element={<Profile />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App