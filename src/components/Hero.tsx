import { useRef, useEffect } from 'react'
import { ArrowDown, Leaf } from 'lucide-react'
import { VineCorner, VineHanging } from './VineCorner'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = el.offsetHeight
      if (scrollY > heroHeight) return

      const progress = scrollY / heroHeight
      const text = el.querySelector('.hero-text') as HTMLElement
      const overlay = el.querySelector('.hero-overlay') as HTMLElement
      if (text) {
        text.style.transform = `translateY(${scrollY * 0.35}px)`
        text.style.opacity = `${1 - progress * 1.8}`
      }
      if (overlay) {
        overlay.style.opacity = `${0.2 + progress * 0.6}`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-mesh-gradient hero-overlay opacity-100" />

      {/* Vine & climber decorations */}
      <VineCorner position="tl" opacity={0.15} />
      <VineCorner position="tr" opacity={0.1} />
      <VineCorner position="br" opacity={0.08} />
      <VineHanging offset="20%" opacity={0.1} />
      <VineHanging offset="75%" opacity={0.07} />

      {/* Content */}
      <div className="hero-text relative z-10 text-center px-5 sm:px-8 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
          <span className="hr-premium" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-gold-400">
            <Leaf size={12} className="hidden sm:block" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-medium">Est. Gurugram, India</span>
            <Leaf size={12} className="hidden sm:block" />
          </div>
          <span className="hr-premium" />
        </div>

        {/* Title — mobile-first sizing */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] mb-5 sm:mb-6" style={{ color: 'var(--color-hero-text)' }}>
          <span className="block overflow-hidden">
            <span className="block animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Where Nature</span>
          </span>
          <span className="block overflow-hidden">
            <span className="block animate-fade-in-up gradient-text font-medium italic" style={{ animationDelay: '0.5s' }}>Meets Elegance</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 animate-fade-in-up px-2" style={{ animationDelay: '0.7s', color: 'var(--color-hero-subtext)' }}>
          Premium plants, exotic flowers & expert landscaping.
          <br className="hidden md:block" />
          Transforming spaces across Gurugram with nature's finest.
        </p>

        {/* CTAs — stack on mobile, row on tablet+ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <a href="#products" className="btn-premium w-full sm:w-auto">
            <span>Explore Collection</span>
            <Leaf size={14} />
          </a>
          <a href="#about" className="btn-outline w-full sm:w-auto" style={{ borderColor: 'var(--color-hero-subtext)', color: 'var(--color-hero-subtext)' }}>
            Our Story
          </a>
        </div>

        {/* Stats — 2x2 on mobile, 4x1 on desktop */}
        <div className="mt-14 sm:mt-16 md:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-10 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
          {[
            { value: '5000+', label: 'Plants' },
            { value: '2000+', label: 'Happy Clients' },
            { value: '500+', label: 'Species' },
            { value: '10+', label: 'Years' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-xl sm:text-2xl md:text-3xl text-gold-400">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: 'var(--color-hero-label)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3 animate-fade-in-up z-10" style={{ animationDelay: '1.3s' }}>
        <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--color-hero-label)' }}>Scroll</span>
        <div className="w-px h-8 sm:h-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold-400/50" style={{ animation: 'slideDown 1.5s ease-in-out infinite' }} />
        </div>
        <ArrowDown size={12} className="text-gold-400/40 animate-bounce" />
      </div>
    </section>
  )
}
