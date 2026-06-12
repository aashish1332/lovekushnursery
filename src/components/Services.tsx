import { useScrollReveal } from '../hooks/useScrollReveal'
import { Truck, Palette, Scissors, GraduationCap, Building2, Stethoscope } from 'lucide-react'
import { VineCorner } from './VineCorner'

const services = [
  { icon: Truck, title: 'Free Delivery', desc: 'Free delivery across Gurugram on orders above ₹999. Same-day available.' },
  { icon: Palette, title: 'Landscape Design', desc: 'Custom garden design by our expert landscapers. Concept to reality.' },
  { icon: Scissors, title: 'Garden Maintenance', desc: 'Regular pruning, fertilizing, and care packages year-round.' },
  { icon: GraduationCap, title: 'Plant Workshops', desc: 'Learn plant care, terrarium building, and urban gardening.' },
  { icon: Building2, title: 'Corporate Greening', desc: 'Transform your office with curated plant installations.' },
  { icon: Stethoscope, title: 'Plant Doctor', desc: 'Expert diagnosis and treatment for sick plants. Revive your greens.' },
]

export default function Services() {
  const { ref, isVisible } = useScrollReveal(0.1)

  return (
    <section id="services" className="relative py-20 sm:py-28 md:py-32 bg-forest-900 overflow-hidden">
      {/* Subtle decorative bg */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-60 sm:w-96 h-60 sm:h-96 bg-gold-400 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-sage-400 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      {/* Floral vine SVG decorations on dark section */}
      <div className="absolute top-0 right-0 opacity-[0.06] pointer-events-none">
        <svg width="160" height="260" viewBox="0 0 160 260" fill="none" className="w-28 sm:w-40">
          <path d="M155 0 C155 50 140 100 120 130 C100 160 110 200 120 240" stroke="var(--color-gold)" strokeWidth="1"/>
          <path d="M120 80 C130 70 145 75 150 85" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <path d="M115 140 C105 130 90 135 85 145" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <path d="M120 200 C130 190 145 195 150 205" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <ellipse cx="150" cy="85" rx="5" ry="8" transform="rotate(25 150 85)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <ellipse cx="85" cy="145" rx="5" ry="8" transform="rotate(-25 85 145)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <ellipse cx="150" cy="205" rx="5" ry="8" transform="rotate(25 150 205)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <circle cx="120" cy="245" r="3" fill="var(--color-gold)" opacity="0.5"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 opacity-[0.06] pointer-events-none">
        <svg width="160" height="260" viewBox="0 0 160 260" fill="none" className="w-28 sm:w-40">
          <path d="M5 260 C5 210 20 160 40 130 C60 100 50 60 40 20" stroke="var(--color-gold)" strokeWidth="1"/>
          <path d="M40 180 C30 190 15 185 10 175" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <path d="M45 120 C55 130 70 125 75 115" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <path d="M40 60 C30 70 15 65 10 55" stroke="var(--color-gold)" strokeWidth="0.7"/>
          <ellipse cx="10" cy="175" rx="5" ry="8" transform="rotate(-25 10 175)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <ellipse cx="75" cy="115" rx="5" ry="8" transform="rotate(25 75 115)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <ellipse cx="10" cy="55" rx="5" ry="8" transform="rotate(-25 10 55)" stroke="var(--color-gold)" strokeWidth="0.6" fill="none"/>
          <circle cx="40" cy="15" r="3" fill="var(--color-gold)" opacity="0.5"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-400 font-medium">What We Offer</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream-50 mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline">
              Beyond <span className="italic gradient-text">Just Plants</span>
            </h2>
            <p className="text-cream-300/60 max-w-xl mx-auto text-sm sm:text-base px-2">
              End-to-end green solutions for homes, offices, and commercial spaces across Gurugram.
            </p>
          </div>

          {/* Grid — 1 col mobile, 2 col sm, 3 col lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <div
                  key={i}
                  className="group p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/5 hover:border-gold-400/20 transition-all duration-500"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gold-400/10 text-gold-400 group-hover:bg-gold-400 group-hover:text-forest-900 transition-all duration-500 mb-5">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-cream-100 mb-2 sm:mb-3">{service.title}</h3>
                  <p className="text-cream-300/50 text-xs sm:text-sm leading-relaxed">{service.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
