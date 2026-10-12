import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminVenues from './pages/admin/AdminVenues.jsx'
import AdminVendors from './pages/admin/AdminVendors.jsx'
import AdminCommission from './pages/admin/AdminCommission.jsx'
import AdminApplications from './pages/admin/AdminApplications.jsx'
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<AdminLogin />} />

      <Route element={<Layout />}>
        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/venues" element={<ProtectedRoute roles={['admin']}><AdminVenues /></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute roles={['admin']}><AdminVendors /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute roles={['admin']}><AdminCommission /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>} />
        <Route path="/admin/applications/:id" element={<ProtectedRoute roles={['admin']}><AdminApplicationDetail /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default App
