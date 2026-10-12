import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export function Layout() {
  const { pathname } = useLocation()
  // Both consoles (couple + vendor) use their own left sidebar for navigation,
  // so the floating top navbar is replaced by a sidebar toggle button.
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/vendor-portal')
  const hasBlushPageBackground = pathname === '/login' || pathname === '/vendor-login'

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])

  const toggleSidebarLeft = () => {
    const current = localStorage.getItem('sidebar_left_open')
    const defaultOpen = window.innerWidth >= 1024
    const isOpen = current ? current === 'true' : defaultOpen
    localStorage.setItem('sidebar_left_open', String(!isOpen))
    window.dispatchEvent(new Event('sidebar_left_toggle'))
  }

  return (
    <div className={`relative min-h-screen text-burgundy-900 flex flex-col bg-[#FAF8F5] ${hasBlushPageBackground ? 'isolate overflow-hidden' : ''}`}>
      {hasBlushPageBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAF8F5]" aria-hidden="true">
          <div className="absolute -top-[8rem] -left-[18rem] h-[48rem] w-[48rem] rounded-full bg-[#FAEDE6] blur-[115px] opacity-95 animate-mesh-blob-1" />
          <div className="absolute top-[34%] -right-[20rem] h-[52rem] w-[52rem] rounded-full bg-[#E8C7BD]/55 blur-[135px] opacity-75 animate-mesh-blob-2" />
          <div className="absolute -bottom-[16rem] -left-[14rem] h-[44rem] w-[44rem] rounded-full bg-[#FAEDE6] blur-[120px] opacity-90 animate-mesh-blob-1" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        {!isDashboard && <Header />}
        {isDashboard && (
          <button
            type="button"
            onClick={toggleSidebarLeft}
            className="fixed top-4 left-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E8C7BD] bg-white text-[#4E1218] shadow-sm transition hover:bg-[#FAEDE6] lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <main className={`flex-1 ${isDashboard ? 'pt-0' : 'pt-24'}`}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
