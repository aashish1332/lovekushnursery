import { useScrollReveal } from '../hooks/useScrollReveal'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Interior Designer, DLF Phase 3',
    text: "Love Kush Nursery transformed our client's terrace into a stunning green retreat. The quality of plants and the design sensibility is unmatched in Gurugram.",
  },
  {
    name: 'Arjun Mehta',
    role: 'Homeowner, Sector 56',
    text: "I've been buying from them for 3 years. Every plant arrives healthy. Their after-sale care advice has made my balcony garden the envy of the neighborhood.",
  },
  {
    name: 'Neha Kapoor',
    role: 'CEO, Tech Startup Cyber Hub',
    text: "We hired Love Kush for our office greenery. Productivity went up, stress went down. Best investment we made for our workspace. Highly recommended.",
  },
  {
    name: 'Vikram Singh',
    role: 'Gardener, Sohna Road',
    text: 'As someone who knows plants well, their stock is genuinely premium. Rare varieties, fair prices, and honest advice. A real nursery, not just a shop.',
  },
]

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal(0.1)

  return (
    <section id="testimonials" className="relative py-20 sm:py-28 md:py-32 overflow-hidden floral-accent-right" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Testimonials</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline" style={{ color: 'var(--color-text)' }}>
              Loved by <span className="italic gradient-text-forest">Thousands</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              Don't take our word for it. Here's what our plant family says.
            </p>
          </div>

          {/* Grid — 1 col mobile, 2 col md */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="group p-6 sm:p-8 lg:p-10 border hover:border-gold-200 transition-all duration-500 floral-quote" style={{ background: 'var(--color-bg-alt)', borderColor: 'var(--color-border)' }}>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} fill="#c4a265" className="text-gold-400" />
                  ))}
                </div>
                <p className="leading-relaxed mb-5 sm:mb-6 text-[13px] sm:text-[15px]" style={{ color: 'var(--color-text)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-serif text-xs sm:text-sm" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>{t.name}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-subtle)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust bar — 2x2 mobile, 4x1 sm+ */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { value: '4.9', label: 'Google Rating' },
              { value: '2000+', label: 'Happy Clients' },
              { value: '98%', label: 'Repeat Customers' },
              { value: '10+', label: 'Years Trusted' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-2xl sm:text-3xl" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-1" style={{ color: 'var(--color-text-subtle)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
