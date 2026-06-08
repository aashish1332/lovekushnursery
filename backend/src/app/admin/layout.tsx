'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/plants', label: 'Plants', icon: '🌿' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/hero', label: 'Hero Slides', icon: '🖼️' },
  { href: '/admin/offers', label: 'Offers', icon: '🏷️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/contact', label: 'Contact Info', icon: '📞' },
  { href: '/admin/system', label: 'System', icon: '🗄️' },
  { href: '/admin/audit', label: 'Audit Logs', icon: '📋' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Auth check
  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true)
      return
    }

    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) {
          setAuthorized(true)
        } else {
          router.replace('/admin/login')
        }
      })
      .catch(() => router.replace('/admin/login'))
  }, [pathname, router])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  // Don't render layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Don't render until auth check completes
  if (!authorized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ color: '#666', fontSize: 14 }}>Verifying access...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f5f5f5' }}>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: 'linear-gradient(180deg, #0f2a22 0%, #1a3c34 100%)',
        color: '#f9f5ef',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        bottom: 0,
        zIndex: 50,
        transition: 'left 0.3s ease',
        boxShadow: sidebarOpen && isMobile ? '4px 0 20px rgba(0,0,0,0.2)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 style={{ fontSize: 20, fontFamily: 'Georgia, serif', fontWeight: 600, margin: 0 }}>🌿 Admin Panel</h1>
          <p style={{ fontSize: 11, color: '#95b59e', margin: '4px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Love Kush Nursery</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 4,
                  textDecoration: 'none',
                  color: isActive ? '#f9f5ef' : '#95b59e',
                  background: isActive ? 'rgba(196,162,101,0.15)' : 'transparent',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: '#6b8f71', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleLogout}
            style={{
              color: '#e8b4b8',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            <span>⏻</span> Logout
          </button>
          <Link href="/" style={{ color: '#c4a265', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>←</span> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Bar */}
        <header style={{
          background: '#fff',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e5e5',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: '4px 8px' }}
            >
              ☰
            </button>
          )}
          <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Love Kush Nursery — Admin</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={handleLogout}
              style={{
                fontSize: 12,
                color: '#b91c1c',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '4px 8px',
                fontFamily: 'inherit',
              }}
            >
              Logout
            </button>
            <a
              href="/"
              target="_blank"
              style={{ fontSize: 12, color: '#c4a265', textDecoration: 'none', fontWeight: 500 }}
            >
              View Site ↗
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: isMobile ? 16 : 24, maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
