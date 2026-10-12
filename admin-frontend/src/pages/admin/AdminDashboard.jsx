import { Link } from 'react-router-dom'
import { Users, Building2, Store, FileCheck, TrendingUp, ArrowRight, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Reveal } from '../../components/Reveal.jsx'

const tiles = [
  { Icon: FileCheck, label: 'Vendor Applications', to: '/admin/applications', body: 'Review SSM docs, ID, banking. Approve or reject.' },
  { Icon: TrendingUp, label: 'Advertising Revenue', to: '/admin/revenue', body: 'Monthly recurring revenue from vendor subscriptions.' },
  { Icon: Users, label: 'Users', to: '/admin/users', body: 'All couples, vendors, and admins.' },
  { Icon: Building2, label: 'Venues', to: '/admin/venues', body: 'Manage venue listings.' },
  { Icon: Store, label: 'Vendors', to: '/admin/vendors', body: 'Approved vendor accounts.' },
]

export default function AdminDashboard() {
  const { logout } = useAuth()
  
  return (
    <div className="bg-blush-100 min-h-[calc(100vh-5rem)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-script text-2xl text-burgundy-700">Admin</p>
              <h1 className="font-display text-4xl text-burgundy-900 mt-1">Operations dashboard</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-burgundy-900 text-blush-100 hover:bg-burgundy-950 transition font-medium text-sm shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.06}>
              <Link to={t.to} className="card-surface !bg-blush-50 p-6 group block h-full">
                <span className="w-12 h-12 rounded-full bg-burgundy-800/10 grid place-items-center group-hover:bg-burgundy-800 group-hover:text-blush-100 transition">
                  <t.Icon className="w-5 h-5 text-burgundy-800 group-hover:text-blush-100 transition" />
                </span>
                <p className="font-display text-2xl text-burgundy-900 mt-4">{t.label}</p>
                <p className="text-burgundy-700 mt-1 text-sm">{t.body}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-burgundy-800 font-medium">Open <ArrowRight className="w-4 h-4" /></div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
