import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header.jsx'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen text-burgundy-900 flex flex-col bg-[#FAF8F5]">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  )
}
