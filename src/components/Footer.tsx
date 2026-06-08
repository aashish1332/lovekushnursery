import { useState, useEffect } from 'react'
import { Heart, ArrowUp, Leaf, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

import { API_BASE } from '../lib/api';
interface SiteSettings {
  nurseryName: string
  tagline: string
  instagram: string | null
  facebook: string | null
  twitter: string | null
  youtube: string | null
}

const footerLinks = {
  'Quick Links': [
    { label: 'About Us', href: '#about' },
    { label: 'Our Collection', href: '#products' },
    { label: 'Services', href: '#services' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ],
  'Popular Plants': [
    { label: 'Monstera', href: '#products' },
    { label: 'Peace Lily', href: '#products' },
    { label: 'Snake Plant', href: '#products' },
    { label: 'Areca Palm', href: '#products' },
    { label: 'Jade Plant', href: '#products' },
  ],
  'Services': [
    { label: 'Free Delivery', href: '#services' },
    { label: 'Landscape Design', href: '#services' },
    { label: 'Garden Maintenance', href: '#services' },
    { label: 'Corporate Greening', href: '#services' },
    { label: 'Plant Workshops', href: '#services' },
  ],
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.data)
      })
      .catch(() => {})
  }, [])

  const socials = [
    settings?.instagram ? { icon: Instagram, href: settings.instagram, label: 'Instagram' } : null,
    settings?.facebook ? { icon: Facebook, href: settings.facebook, label: 'Facebook' } : null,
    settings?.twitter ? { icon: Twitter, href: settings.twitter, label: 'Twitter' } : null,
    settings?.youtube ? { icon: Youtube, href: settings.youtube, label: 'YouTube' } : null,
  ].filter(Boolean) as { icon: any; href: string; label: string }[]

  return (
    <footer className="bg-forest-950 relative">
      <div className="h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-10">
        {/* Main grid — stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8 mb-12 sm:mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#hero" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400 sm:w-7 sm:h-7">
                <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
                <path d="M12 22V10" />
                <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
              </svg>
              <div>
                <span className="font-serif text-base sm:text-lg text-cream-100">Love Kush</span>
                <span className="block text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-gold-400/80">Nursery</span>
              </div>
            </a>
            <p className="text-cream-300/40 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs">
              {settings?.tagline || "Gurugram's most trusted nursery since 2014. Premium plants, exotic flowers & expert landscaping."}
            </p>
            <div className="flex gap-2.5 sm:gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-white/8 text-cream-300/40 hover:border-gold-400/40 hover:text-gold-400 transition-all duration-300">
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-serif text-xs sm:text-sm text-cream-100 mb-4 sm:mb-5">{title}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-cream-300/40 text-[11px] sm:text-xs hover:text-gold-400 transition-colors duration-300">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="py-8 sm:py-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="text-center sm:text-left">
            <h4 className="font-serif text-cream-100 text-sm sm:text-base mb-1">Join Our Green Community</h4>
            <p className="text-cream-300/40 text-[11px] sm:text-xs">Get plant care tips, exclusive offers & nursery updates.</p>
          </div>
          <form className="flex w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 sm:w-56 bg-transparent border border-white/10 text-cream-100 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-gold-400 focus:outline-none transition-colors placeholder:text-cream-300/20" />
            <button type="submit" className="btn-premium px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs">Subscribe</button>
          </form>
        </div>

        {/* Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-cream-300/30 text-[10px] sm:text-xs text-center sm:text-left">&copy; {new Date().getFullYear()} Love Kush Nursery, Gurugram. All rights reserved.</p>
          <div className="flex items-center gap-1 text-cream-300/30 text-[10px] sm:text-xs">
            <span>Made with</span>
            <Heart size={10} fill="#c4a265" className="text-gold-400 sm:w-3 sm:h-3" />
            <span>in India</span>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-forest-900 border border-white/10 text-gold-400 flex items-center justify-center hover:bg-gold-400 hover:text-forest-900 transition-all duration-300 z-50"
        aria-label="Back to top">
        <ArrowUp size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </footer>
  )
}
