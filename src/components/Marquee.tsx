const words = [
  'Monstera', '✦', 'Orchids', '✦', 'Bonsai', '✦',
  'Succulents', '✦', 'Ferns', '✦', 'Cacti', '✦',
  'Palms', '✦', 'Roses', '✦', 'Jasmine', '✦', 'Lavender', '✦',
]

export default function Marquee() {
  return (
    <section className="py-4 sm:py-5 border-y overflow-hidden" style={{ background: 'var(--color-forest)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex whitespace-nowrap marquee-track">
        {[...words, ...words].map((word, i) => (
          <span
            key={i}
            className={`mx-4 sm:mx-6 text-xs sm:text-sm tracking-[0.2em] uppercase font-light ${
              word === '✦'
                ? 'text-gold-400 text-[10px]'
                : ''
            }`}
            style={word !== '✦' ? { color: 'rgba(249,245,239,0.4)' } : undefined}
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  )
}
