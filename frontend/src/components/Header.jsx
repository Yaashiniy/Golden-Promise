import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Heart, User, ChevronDown, LogOut, LayoutDashboard, Menu, X,
  Briefcase, Shield, FileCheck, TrendingUp, SlidersHorizontal,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Logo } from './Logo.jsx'

const planLinks = [
  { to: '/venues', label: 'Wedding Venues' },
  { to: '/vendors', label: 'Wedding Vendors' },
  { to: '/dashboard/budget', label: 'Wedding Budget' },
  { to: '/dashboard/checklist', label: 'Checklist' },
]

/**
 * Floating glassmorphism pill navbar — inspired by Avery Estate on Framer.
 * Sits at the top with generous margin, white glass background, backdrop-blur.
 * Golden CTA on the right for high visibility.
 */
export function Header() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  
  const [mobileOpen, setMobileOpen] = useState(false)

  const [chatOpen, setChatOpen] = useState(() => localStorage.getItem('goldie_chat_open') !== 'false')
  const [sidebarLeftOpen, setSidebarLeftOpen] = useState(() => localStorage.getItem('sidebar_left_open') !== 'false')

  const [listingFilterCount, setListingFilterCount] = useState(0)
  const isListingPage = location.pathname === '/venues' || location.pathname === '/vendors' || location.pathname.startsWith('/vendors/')

  useEffect(() => {
    setListingFilterCount(0)
  }, [location.pathname])

  useEffect(() => {
    const handleCount = (e) => setListingFilterCount(e.detail ?? 0)
    window.addEventListener('listing_filter_count', handleCount)
    return () => window.removeEventListener('listing_filter_count', handleCount)
  }, [])

  const openListingFilters = () => window.dispatchEvent(new Event('open_listing_filters'))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleToggle = () => {
      setChatOpen(localStorage.getItem('goldie_chat_open') !== 'false')
    }
    window.addEventListener('goldie_chat_toggle', handleToggle)
    return () => window.removeEventListener('goldie_chat_toggle', handleToggle)
  }, [])

  useEffect(() => {
    const handleToggle = () => {
      setSidebarLeftOpen(localStorage.getItem('sidebar_left_open') !== 'false')
    }
    window.addEventListener('sidebar_left_toggle', handleToggle)
    return () => window.removeEventListener('sidebar_left_toggle', handleToggle)
  }, [])

  const toggleSidebarLeft = () => {
    const next = !sidebarLeftOpen
    localStorage.setItem('sidebar_left_open', String(next))
    window.dispatchEvent(new Event('sidebar_left_toggle'))
  }

  const isDashboard = location.pathname.startsWith('/dashboard')
    || location.pathname.startsWith('/vendor-portal')
    || location.pathname.startsWith('/admin')
  const isBudget = location.pathname === '/dashboard/budget'

  const glassStyle = {
    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: '1px solid rgba(123, 31, 42, 0.08)',
    boxShadow: scrolled
      ? '0 10px 40px -12px rgba(78, 18, 24, 0.20)'
      : '0 6px 24px -12px rgba(78, 18, 24, 0.12)',
  }

  return (
    <header
      className="fixed top-0 z-50 pointer-events-none transition-all duration-300"
      style={{ left: '0px', right: '0px' }}
    >
      {/* Full-bleed on mobile so the logo sits hard-left and the hamburger hard-right;
          shrink-to-fit + centred from xl up, where the nav links are visible.
          xl (not lg) because Logo + 5 nav links + icons + CTA don't fit in one
          row until ~1280px — at 1024-1279px it wrapped/overflowed the pill. */}
      <div className="w-full xl:max-w-max mx-auto px-4 xl:px-6 pt-4 xl:pt-5">
        {/* Listing pages keep only the menu at the top on smaller screens. */}
        {isListingPage && (
          <div className="xl:hidden flex items-center justify-end">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full transition"
              style={glassStyle}
            >
              {mobileOpen ? <X className="w-5 h-5" style={{ color: '#4E1218' }} /> : <Menu className="w-5 h-5" style={{ color: '#4E1218' }} />}
            </button>
          </div>
        )}

        {isListingPage && (
          <button
            onClick={openListingFilters}
            aria-label="Open filters"
            className="xl:hidden pointer-events-auto fixed bottom-6 right-4 sm:right-6 w-12 h-12 flex items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5"
            style={glassStyle}
          >
            <SlidersHorizontal className="w-5 h-5" style={{ color: '#4E1218' }} />
            {listingFilterCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C08E3F] text-white text-[9px] font-bold grid place-items-center">
                {listingFilterCount}
              </span>
            )}
          </button>
        )}

        <div
          className={`pointer-events-auto relative items-center gap-4 rounded-full pl-5 pr-2 py-2 transition-all duration-500 ${isListingPage ? 'hidden xl:flex' : 'flex'}`}
          style={glassStyle}
        >
          {/* Sidebar Toggle — mobile only (hidden on desktop) */}
          {isDashboard && (
            <>
              {/* Mobile: always visible */}
              <button
                onClick={toggleSidebarLeft}
                className="lg:hidden p-1.5 rounded-full hover:bg-burgundy-900/5 cursor-pointer text-burgundy-900 mr-2 shrink-0"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2 pr-2 xl:mr-2">
            <Logo className="h-10 xl:h-14" logoOnly={isDashboard} />
          </Link>

          {/* Center nav */}
          <nav className="hidden xl:flex items-center gap-1.5 mx-auto text-sm" style={{ color: '#4E1218' }}>
            <NavLink to="/"              className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Home</NavLink>
            <NavLink to="/our-story"     className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Our Story</NavLink>
            <NavLink to="/venues"        className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Venues</NavLink>
            <NavLink to="/vendors"       className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Vendors</NavLink>
            <NavLink to="/goldie-ai" className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Goldie AI</NavLink>
            <NavLink to="/become-vendor" className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>For Vendors</NavLink>
            <NavLink to="/community"     className={({ isActive }) => `px-4 py-2 rounded-full hover:bg-[#7B1F2A]/5 transition font-medium ${isActive ? 'text-[#7B1F2A] font-bold bg-[#7B1F2A]/5' : ''}`}>Community</NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto xl:ml-0">
            <Link
              to={user ? '/dashboard/favorites' : '/login'}
              aria-label="Favorites"
              className="hidden xl:flex w-10 h-10 items-center justify-center rounded-full hover:bg-burgundy-900/5 transition"
            >
              <Heart className="w-4 h-4" style={{ color: '#4E1218' }} />
            </Link>

            <div className="relative hidden xl:flex items-center gap-2">
              {authLoading ? (
                <div className="w-10 h-10 rounded-full bg-burgundy-900/5 animate-pulse" />
              ) : (
                <>
                  {user ? (
                    <button
                      onClick={() => {
                        if (user?.role === 'vendor') navigate('/vendor-portal')
                        else navigate('/dashboard')
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition transform hover:scale-105 hover:shadow-md hover:opacity-95 cursor-pointer"
                      style={{ backgroundColor: '#7B1F2A', color: '#FAEDE6' }}
                      aria-label="Go to dashboard"
                      title="Go to dashboard"
                    >
                      {user.name?.[0]?.toUpperCase() ?? 'U'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      aria-label="Account"
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-burgundy-900/5 transition"
                    >
                      <User className="w-4 h-4" style={{ color: '#4E1218' }} />
                    </Link>
                  )}
                </>
              )}
            </div>


            {/* Primary CTA — gold pill.
                Visibility lives on the wrapper: `.golden-button` declares its own
                `display`, which has equal specificity to Tailwind's `hidden` and wins
                on source order, so `hidden` on the Link itself has no effect. */}
            {(!authLoading && !user) && (
              <span className="hidden xl:block">
                <Link
                  to="/login"
                  className="golden-button"
                  style={{ height: '2.5rem', fontSize: '0.75rem', padding: '0 1.5rem', borderRadius: '9999px' }}
                >
                  Login
                </Link>
              </span>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-burgundy-900/5 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="xl:hidden mt-2 rounded-2xl p-3 pointer-events-auto"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(123, 31, 42, 0.08)',
              boxShadow: '0 24px 60px -20px rgba(78, 18, 24, 0.25)',
            }}
          >
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Home</Link>
            <Link to="/our-story" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Our Story</Link>
            <Link to="/venues" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Venues</Link>
            <Link to="/vendors" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Vendors</Link>
            <Link to="/goldie-ai" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Goldie AI</Link>
            <Link to="/become-vendor" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">For Vendors</Link>
            <Link to="/community" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">Community</Link>

            {/* Account actions live here on mobile, since the icon buttons are lg-only */}
            <div className="mt-2 pt-2 border-t border-burgundy-900/10">
              <Link to={user ? '/dashboard/favorites' : '/login'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">
                <Heart className="w-4 h-4" /> Favourites
              </Link>
              {user && (
                <>
                  <Link to={user?.role === 'vendor' ? '/vendor-portal' : '/dashboard'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout() }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium hover:bg-burgundy-900 hover:text-blush-100 text-sm cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              )}
            </div>

            {(!authLoading && !user) && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="golden-button mt-2 text-center"
                style={{ height: '2.5rem', fontSize: '0.75rem', padding: '0 1.5rem', borderRadius: '9999px', display: 'flex', width: '100%' }}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function MenuLink({ to, Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-burgundy-900 hover:text-blush-100 transition text-sm"
    >
      <Icon className="w-4 h-4" /> {children}
    </Link>
  )
}
