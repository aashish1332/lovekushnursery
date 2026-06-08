import { useScrollReveal } from '../hooks/useScrollReveal'
import { Leaf, Sun, Droplets, Heart } from 'lucide-react'

export default function About() {
  const { ref, isVisible } = useScrollReveal(0.1)

  const features = [
    { icon: Leaf, title: 'Rare Species', desc: 'Curated collection of 500+ plant species from across India and beyond.' },
    { icon: Sun, title: 'Expert Nurture', desc: 'Every plant is grown with 10+ years of horticultural expertise and love.' },
    { icon: Droplets, title: 'Sustainable', desc: 'Eco-friendly practices, organic fertilizers, and water-efficient growing.' },
    { icon: Heart, title: 'Guaranteed', desc: "Health guarantee on every plant. We replace if it doesn't thrive." },
  ]

  return (
    <section id="about" className="relative py-20 sm:py-28 md:py-32 floral-accent-left botanical-bg overflow-hidden" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Our Story</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline" style={{ color: 'var(--color-text)' }}>
              Rooted in <span className="italic gradient-text-forest">Passion</span>
            </h2>
            <p className="max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              Love Kush Nursery began as a small garden in Gurugram with a simple belief: everyone deserves
              to be surrounded by nature's beauty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="group p-6 sm:p-8 border hover:border-gold-300 transition-all duration-500" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-forest-50 text-forest-600 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors duration-500 mb-4 sm:mb-5">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl mb-2 sm:mb-3" style={{ color: 'var(--color-text)' }}>{feature.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{feature.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-16 sm:mt-20 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium mb-3 sm:mb-4 block">Our Mission</span>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>
                Bringing nature closer<br />to every home in <span className="italic text-gold-600">Gurugram</span>
              </h3>
              <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
                From Cyber City to DLF Phase 5, we've helped transform balconies, terraces, offices,
                and gardens into living, breathing spaces of green.
              </p>
              <p className="leading-relaxed text-sm sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
                We believe plants aren't just decor — they're companions that purify your air,
                lift your mood, and connect you to something larger than yourself.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] sm:aspect-[4/5] overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div className="w-full h-full bg-gradient-to-br from-forest-100 via-sage-100 to-gold-50 flex items-center justify-center">
                  <div className="text-center p-6 sm:p-8">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-forest-300 mx-auto mb-3 sm:mb-4">
                      <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
                      <path d="M12 22V10" />
                      <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
                    </svg>
                    <p className="font-serif text-forest-400 text-base sm:text-lg italic">10+ Years of</p>
                    <p className="font-serif text-forest-600 text-2xl sm:text-3xl italic mt-1">Growing Joy</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-24 h-24 sm:w-32 sm:h-32 border border-gold-300/40 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
