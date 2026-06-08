import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

import { API_BASE } from '../lib/api';
interface SiteSettings {
  phone: string
  altPhone: string | null
  email: string
  address: string
  openHours: string
  mapUrl: string | null
  whatsapp: string | null
}

export default function Contact() {
  const { ref, isVisible } = useScrollReveal(0.1)
  const [submitted, setSubmitted] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.data)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const phone = settings?.phone || '+91 98765 43210'
  const altPhone = settings?.altPhone
  const email = settings?.email || 'hello@lovekushnursery.com'
  const address = settings?.address || 'Near Sector 15, Old Delhi Road, Gurugram, Haryana 122001'
  const openHours = settings?.openHours || 'Mon-Sat: 8AM-8PM | Sun: 9AM-6PM'
  const mapUrl = settings?.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`

  // Parse address into lines
  const addressParts = address.split(',').map(s => s.trim()).filter(Boolean)
  const addressLine1 = addressParts[0] || address
  const addressLine2 = addressParts.length > 1 ? addressParts.slice(1).join(', ') : null

  // Parse hours into lines
  const hoursLines = openHours.split('|').map(s => s.trim()).filter(Boolean)

  // Build phone lines
  const phoneLines = [phone]
  if (altPhone) phoneLines.push(altPhone)

  return (
    <section id="contact" className="relative py-20 sm:py-28 md:py-32 bg-forest-900 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 right-1/4 w-60 sm:w-96 h-60 sm:h-96 bg-gold-400 rounded-full blur-[100px] sm:blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-400 font-medium">Get In Touch</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream-50 mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline">
              Let's Grow <span className="italic gradient-text">Together</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'rgba(237,229,216,0.6)' }}>
              Visit our nursery in Gurugram or reach out for a consultation.
            </p>
          </div>

          {/* Stack on mobile, side-by-side on lg */}
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
            {/* Info */}
            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: MapPin, title: 'Visit Our Nursery', lines: [addressLine1, addressLine2].filter(Boolean) as string[] },
                { icon: Phone, title: 'Call Us', lines: phoneLines },
                { icon: Mail, title: 'Email', lines: [email] },
                { icon: Clock, title: 'Hours', lines: hoursLines },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 sm:gap-5 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gold-400/10 text-gold-400 group-hover:bg-gold-400 group-hover:text-forest-900 transition-all duration-300 shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-base sm:text-lg mb-1" style={{ color: 'var(--color-nav-text)' }}>{item.title}</h4>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-xs sm:text-sm" style={{ color: 'rgba(237,229,216,0.5)' }}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="aspect-video bg-forest-800 border border-white/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={28} className="text-gold-400/30 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm" style={{ color: 'rgba(237,229,216,0.5)' }}>{addressLine2 || addressLine1}</p>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold-400 text-[10px] sm:text-xs mt-2 hover:text-gold-300 transition-colors"
                  >
                    Open in Maps →
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-5 sm:p-8 lg:p-10">
              <h3 className="font-serif text-xl sm:text-2xl text-cream-100 mb-5 sm:mb-6">Request a Quote</h3>
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-cream-300/50 mb-1.5 sm:mb-2 block">Name</label>
                    <input type="text" placeholder="Your name" className="w-full bg-transparent border-b border-white/10 text-cream-100 py-2.5 sm:py-3 text-sm focus:border-gold-400 focus:outline-none transition-colors placeholder:text-cream-300/20" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-cream-300/50 mb-1.5 sm:mb-2 block">Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full bg-transparent border-b border-white/10 text-cream-100 py-2.5 sm:py-3 text-sm focus:border-gold-400 focus:outline-none transition-colors placeholder:text-cream-300/20" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-cream-300/50 mb-1.5 sm:mb-2 block">Email</label>
                  <input type="email" placeholder="your@email.com" className="w-full bg-transparent border-b border-white/10 text-cream-100 py-2.5 sm:py-3 text-sm focus:border-gold-400 focus:outline-none transition-colors placeholder:text-cream-300/20" />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-cream-300/50 mb-1.5 sm:mb-2 block">Service</label>
                  <select className="w-full bg-transparent border-b border-white/10 text-cream-100 py-2.5 sm:py-3 text-sm focus:border-gold-400 focus:outline-none transition-colors cursor-pointer">
                    <option value="" className="bg-forest-900">Select a service</option>
                    <option value="plants" className="bg-forest-900">Plant Purchase</option>
                    <option value="delivery" className="bg-forest-900">Bulk Order / Delivery</option>
                    <option value="landscape" className="bg-forest-900">Landscape Design</option>
                    <option value="maintenance" className="bg-forest-900">Garden Maintenance</option>
                    <option value="corporate" className="bg-forest-900">Corporate Greening</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs tracking-[0.1em] uppercase text-cream-300/50 mb-1.5 sm:mb-2 block">Message</label>
                  <textarea rows={3} placeholder="Tell us about your requirements..." className="w-full bg-transparent border-b border-white/10 text-cream-100 py-2.5 sm:py-3 text-sm focus:border-gold-400 focus:outline-none transition-colors resize-none placeholder:text-cream-300/20" />
                </div>

                <button type="submit" className="btn-premium w-full gap-2 group mt-2 sm:mt-4">
                  <span>Send Inquiry</span>
                  <Send size={14} className="transition-transform group-hover:translate-x-1" />
                </button>

                {submitted && (
                  <p className="text-gold-400 text-sm text-center">Thank you! We'll get back to you within 24 hours.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
