import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, Image, FileText, Sparkles, ChevronRight, Settings,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'
import { Logo } from './Logo.jsx'
import LogoutButton from './LogoutButton.jsx'

const NAV_ITEMS = [
  { to: '/vendor-portal',              label: 'Dashboard',         Icon: LayoutDashboard, end: true },
  { to: '/vendor-portal/profile',      label: 'Edit Profile',      Icon: User },
  { to: '/vendor-portal/portfolio',    label: 'Portfolio Gallery', Icon: Image },
  { to: '/vendor-portal/application',  label: 'My Application',    Icon: FileText },
  { to: '/vendor-portal/subscription', label: 'My Plan',           Icon: Sparkles },
  { to: '/vendor-portal/settings',      label: 'Settings',          Icon: Settings },
]

/**
 * Vendor portal sidebar — mirrors DashboardSidebar (the couple side) so both
 * consoles share one visual language: an icon rail that expands on hover,
 * the same logo treatment, nav item styling and floating logout button.
 */
export function VendorSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_left_open')
    return window.innerWidth >= 1024 ? saved !== 'false' : false
  })

  const { data: analytics } = useQuery({
    queryKey: ['vendor-analytics-sidebar'],
    queryFn: async () => (await api.get('/vendor-portal/analytics')).data,
  })

  const tier = analytics?.subscription?.tier ?? 'free'

  useEffect(() => {
    const handleToggle = () => {
      setSidebarOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    }
    window.addEventListener('sidebar_left_toggle', handleToggle)

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleBreakpoint = (event) => {
      if (!event.matches && sidebarOpen) setSidebarOpen(false)
    }

    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handleBreakpoint)
    else mediaQuery.addListener(handleBreakpoint)

    return () => {
      window.removeEventListener('sidebar_left_toggle', handleToggle)
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', handleBreakpoint)
      else mediaQuery.removeListener(handleBreakpoint)
    }
  }, [sidebarOpen])

  const toggleSidebar = () => {
    const next = !sidebarOpen
    localStorage.setItem('sidebar_left_open', String(next))
    window.dispatchEvent(new Event('sidebar_left_toggle'))
  }

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { try { logout() } catch (e) { /* ignore */ } navigate('/') }

  const TIERS = {
    free:    { label: 'Free Account',   color: 'text-burgundy-700 bg-burgundy-900/5 border-burgundy-900/10' },
    premium: { label: 'Premium Member', color: 'text-gold-700 bg-gold-500/10 border-gold-500/20' },
    elite:   { label: 'Elite Partner',  color: 'text-white bg-burgundy-800 border-burgundy-900/40' },
  }
  const currentTier = TIERS[tier] ?? TIERS.free

  return (
    <>
      {/* Mobile backdrop — tap to close */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-[50]"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className="group flex fixed top-0 left-0 h-screen flex-col overflow-hidden overflow-y-auto z-[51] transition-all duration-300 ease-in-out w-full max-w-[270px] lg:w-20 lg:hover:w-[270px]"
        style={{
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(123, 31, 42, 0.08)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
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
            Vendor console
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 pb-6">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} onNavigate={toggleSidebar} />
            ))}
          </div>

          <div className="my-4 mx-2 h-px bg-[#C8B2A8] opacity-100" />
        </nav>

        {/* Plan status — pinned below the nav (which is flex-1) and above the floating
            logout button; pb-20 clears the button's 45px footprint at bottom-4. */}
        <div className="px-4 pb-20 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-[230px] p-4 rounded-2xl bg-white border border-burgundy-900/5 shadow-[0_2px_10px_rgba(123,31,42,0.06)] hover:shadow-[0_8px_24px_rgba(123,31,42,0.12)] transition-shadow duration-300 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-burgundy-600 font-bold truncate">{user?.name}</p>
              <div className="mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentTier.color}`}>
                  {currentTier.label}
                </span>
              </div>
            </div>

            {tier !== 'elite' ? (
              <Link
                to="/vendor-portal/subscription"
                className="group/btn flex items-center justify-between w-full px-3 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-burgundy-950 text-xs font-bold transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                <span>Change Plan</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </Link>
            ) : (
              <div className="text-[11px] text-green-700 font-semibold">
                All features unlocked
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ item, muted = false, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={() => { if (window.innerWidth < 1024) onNavigate?.() }}
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
