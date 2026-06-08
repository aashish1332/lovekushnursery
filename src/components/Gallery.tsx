import { useScrollReveal } from '../hooks/useScrollReveal'

const galleryItems = [
  { grad: 'from-forest-200 via-sage-100 to-gold-50', label: 'Tropical Corner', tall: true },
  { grad: 'from-cream-100 to-gold-50', label: 'Flower Wall' },
  { grad: 'from-sage-100 to-forest-50', label: 'Succulent Garden', tall: true },
  { grad: 'from-gold-50 to-cream-100', label: 'Balcony Setup' },
  { grad: 'from-forest-100 to-sage-50', label: 'Office Green' },
  { grad: 'from-cream-50 to-sage-100', label: 'Ceramic Pots' },
  { grad: 'from-sage-50 to-gold-50', label: 'Zen Garden' },
  { grad: 'from-gold-50 to-forest-50', label: 'Wedding Decor' },
]

export default function Gallery() {
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <section id="gallery" className="relative py-20 sm:py-28 md:py-32 floral-accent-left" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Our Work</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline" style={{ color: 'var(--color-text)' }}>
              Green <span className="italic gradient-text-forest">Spaces</span> We've Created
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              From intimate balcony gardens to sprawling commercial landscapes.
            </p>
          </div>

          {/* Masonry grid — 2 cols mobile, 3 cols md, 4 cols lg */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 auto-rows-[160px] sm:auto-rows-[200px]">
            {galleryItems.map((item, i) => (
              <div
                key={i}
                className={`gallery-item group relative overflow-hidden cursor-pointer ${item.tall ? 'row-span-2' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.grad} transition-transform duration-700 group-hover:scale-110`} />

                {/* Plant SVG placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-forest-700 sm:w-20 sm:h-20">
                    <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
                    <path d="M12 22V10" />
                    <path d="M7 11c2-2 5-3 5-3s3 1 5 3" />
                  </svg>
                </div>

                {/* Hover overlay */}
                <div className="gallery-overlay absolute inset-0 bg-forest-900/60 flex items-center justify-center">
                  <p className="font-serif text-cream-100 text-sm sm:text-lg">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
