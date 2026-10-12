import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  const isAdminOnly = roles?.length === 1 && roles[0] === 'admin'

  if (!user) {
    return <Navigate to={isAdminOnly ? '/admin-login' : '/login'} state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-10 h-10 rounded-full border-2 border-burgundy-300 border-t-burgundy-800 animate-spin" />
    </div>
  )
}
