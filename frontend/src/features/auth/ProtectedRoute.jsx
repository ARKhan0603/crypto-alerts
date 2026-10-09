import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAuthenticated } from './authSlice'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
