import { useState, useEffect } from 'react'
import { Menu, X, Leaf, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Collection', href: '#products' },
  { name: 'Services', href: '#services' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Contact', href: '#contact' },
]

interface NavbarProps {
  cartItemCount: number
  onCartClick: () => void
  onAccountClick: () => void
  onLoginClick: () => void
}

export default function Navbar({ cartItemCount, onCartClick, onAccountClick, onLoginClick }: NavbarProps) {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? 'glass-dark py-2.5 sm:py-3' : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo('#hero') }} className="flex items-center gap-2 sm:gap-3 group">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400 transition-transform duration-500 group-hover:rotate-12" />
            <div>
              <span className="text-base sm:text-lg font-serif font-semibold tracking-wide leading-tight" style={{ color: 'var(--color-nav-text)' }}>Love Kush</span>
              <span className="block text-[8px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold-400 font-medium leading-tight">Nursery</span>
            </div>
          </a>

          {/* Desktop Links — hidden below lg */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                className="relative text-xs xl:text-sm font-medium transition-colors duration-300 group"
                style={{ color: 'rgba(249, 245, 239, 0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f9f5ef')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(249, 245, 239, 0.7)')}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Cart button */}
            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center w-9 h-9 transition-colors"
              style={{ color: 'rgba(249, 245, 239, 0.7)' }}
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Dark mode toggle */}
            <button onClick={toggleDark} className="theme-toggle" aria-label="Toggle dark mode" />

            {/* Account / Login button */}
            {user ? (
              <button
                onClick={onAccountClick}
                className="flex items-center gap-2 text-xs xl:text-sm font-medium transition-colors duration-300"
                style={{ color: 'rgba(249, 245, 239, 0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f9f5ef')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(249, 245, 239, 0.7)')}
              >
                <User size={16} />
                <span className="hidden xl:inline">{user.name?.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="btn-premium text-[11px] px-5 py-2.5"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle — visible below lg */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile cart */}
            <button
              onClick={onCartClick}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center"
              style={{ color: 'var(--color-nav-text)' }}
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={toggleDark} className="theme-toggle" aria-label="Toggle dark mode" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center"
              style={{ color: 'var(--color-nav-text)' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[99] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] sm:w-80 flex flex-col pt-20 sm:pt-24 px-6 sm:px-8 transition-transform duration-500 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: 'var(--color-surface)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
              className="py-3.5 sm:py-4 border-b font-serif text-base sm:text-lg transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              {link.name}
            </a>
          ))}

          {/* Mobile account */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); onAccountClick() }}
                className="w-full py-3 text-left font-serif text-base sm:text-lg transition-colors flex items-center gap-3"
                style={{ color: 'var(--color-text)' }}
              >
                <User size={18} />
                My Account
              </button>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); onLoginClick() }}
                className="btn-premium w-full text-center text-xs"
              >
                Sign In
              </button>
            )}
          </div>

          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('#contact') }} className="btn-premium mt-6 sm:mt-8 text-center text-xs">
            Visit Nursery
          </a>
        </div>
      </div>
    </>
  )
}
