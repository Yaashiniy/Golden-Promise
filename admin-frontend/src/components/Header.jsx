import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Logo } from './Logo.jsx'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-burgundy-900/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <Logo className="h-8" logoOnly={true} />
          <span className="font-display text-xl text-burgundy-900 tracking-tight">Admin Portal</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-burgundy-700 font-medium hidden sm:block">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-burgundy-900/5 transition text-sm font-medium text-burgundy-900 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
