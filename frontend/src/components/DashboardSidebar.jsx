import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Home as HomeIcon, Building2, User, Wallet, CheckSquare, Heart,
  Newspaper, X, Settings, Sparkles,
} from 'lucide-react'
import { Logo } from './Logo.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import LogoutButton from './LogoutButton.jsx'

const PRIMARY_NAV = [
  { to: '/dashboard',            label: 'Your wedding', Icon: HomeIcon,     end: true },
  { to: '/venues',               label: 'Venues',       Icon: Building2 },
  { to: '/vendors',              label: 'Vendors',      Icon: User },
  { to: '/dashboard/budget',     label: 'Budget',       Icon: Wallet },
  { to: '/dashboard/checklist',  label: 'Checklist',    Icon: CheckSquare },
  { to: '/dashboard/goldie',     label: 'Goldie AI',    Icon: Sparkles },
  { to: '/dashboard/favorites',  label: 'Favourites',   Icon: Heart },
  { to: '/dashboard/settings',   label: 'Settings',     Icon: Settings },
]
const SECONDARY_NAV = [
  { to: '/our-story', label: 'Our story', Icon: Newspaper },
]

/** Shared left sidebar for all /dashboard/* pages. */
export function DashboardSidebar() {
  const [sidebarLeftOpen, setSidebarLeftOpen] = useState(() => {
    return window.innerWidth >= 1024 ? true : localStorage.getItem('sidebar_left_open') === 'true'
  })

  useEffect(() => {
    const handleToggle = () => {
      setSidebarLeftOpen(localStorage.getItem('sidebar_left_open') === 'true')
    }
    window.addEventListener('sidebar_left_toggle', handleToggle)

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleBreakpoint = (event) => {
      setSidebarLeftOpen(event.matches ? true : localStorage.getItem('sidebar_left_open') === 'true')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleBreakpoint)
    } else {
      mediaQuery.addListener(handleBreakpoint)
    }

    return () => {
      window.removeEventListener('sidebar_left_toggle', handleToggle)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleBreakpoint)
      } else {
        mediaQuery.removeListener(handleBreakpoint)
      }
    }
  }, [sidebarLeftOpen])

  const toggleSidebarLeft = () => {
    const current = localStorage.getItem('sidebar_left_open')
    const defaultOpen = window.innerWidth >= 1024
    const isOpen = current ? current === 'true' : defaultOpen
    localStorage.setItem('sidebar_left_open', String(!isOpen))
    window.dispatchEvent(new Event('sidebar_left_toggle'))
  }

  const { logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { try { logout() } catch (e) { /* ignore */ } navigate('/') }

  return (
    <>
      {/* Mobile backdrop — tap to close */}
      {sidebarLeftOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-[50]"
          onClick={toggleSidebarLeft}
        />
      )}

      <aside
        className="group flex fixed top-0 left-0 h-screen flex-col overflow-hidden overflow-y-auto z-[51] transition-all duration-300 ease-in-out w-full max-w-[270px] lg:w-20 lg:hover:w-[270px]"
        style={{
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(123, 31, 42, 0.08)',
          transform: sidebarLeftOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logout button anchored bottom-right */}
        <LogoutButton onClick={handleLogout} />
        <div className="px-6 py-5 border-b border-burgundy-900/10 relative flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 w-full justify-start text-4xl leading-none text-[#7b1f2a]"
            style={{ fontFamily: 'var(--font-script)' }}
          >
            <Logo className="h-12 scale-110" logoOnly />
            <span className="hidden lg:group-hover:inline-flex transition-opacity duration-200 whitespace-nowrap">
              Golden Promise
            </span>
          </Link>
        </div>

        <div className="px-5 pt-6 pb-4">
          <p className="hidden lg:group-hover:block text-[10px] uppercase tracking-[0.28em] text-[#8A6A6E] transition-opacity duration-200">
            Your profile
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 pb-6">
          <div className="space-y-1">
            {PRIMARY_NAV.map((item) => <NavItem key={item.label} item={item} />)}
          </div>

          <div className="my-4 mx-2 h-px bg-[#C8B2A8] opacity-100" />

          <div className="space-y-1">
            {SECONDARY_NAV.map((item) => <NavItem key={item.label} item={item} muted />)}
          </div>

          <div className="my-4 mx-2 h-px bg-[#C8B2A8] opacity-100" />
        </nav>
      </aside>
    </>
  )
}

function NavItem({ item, muted = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => {
        const base = 'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm transition justify-start'
        return isActive ? `${base} font-semibold bg-[#F7F0EA]` : `${base} hover:bg-[#FBF7F4]`
      }}
      style={({ isActive }) => ({
        color: isActive ? '#4E1218' : (muted ? '#8A6A6E' : '#4E1218'),
        boxShadow: isActive ? '0 4px 14px -6px rgba(78, 18, 24, 0.2)' : 'none',
        border: isActive ? '1px solid rgba(123, 31, 42, 0.08)' : '1px solid transparent',
      })}
    >
      <item.Icon className="w-5 h-5 shrink-0" strokeWidth={1.7} />
      <span className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {item.label}
      </span>
    </NavLink>
  )
}
