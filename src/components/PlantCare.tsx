import { useScrollReveal } from '../hooks/useScrollReveal'
import { Sun, Droplets, Wind, Thermometer, Leaf, Sprout } from 'lucide-react'

const tips = [
  {
    icon: Sun,
    title: 'Light Requirements',
    description: 'Most indoor plants thrive in bright, indirect light. Avoid direct sunlight which can scorch leaves. Rotate plants weekly for even growth.',
    color: 'text-gold-500',
    bg: 'bg-gold-50',
  },
  {
    icon: Droplets,
    title: 'Watering Guide',
    description: 'Check soil moisture before watering. Most plants prefer soil that dries out slightly between waterings. Overwatering is the #1 killer of houseplants.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Wind,
    title: 'Air Circulation',
    description: 'Good airflow prevents fungal diseases. Avoid placing plants in cold drafts or near heating/cooling vents. Gentle air movement is ideal.',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
  },
  {
    icon: Thermometer,
    title: 'Temperature',
    description: 'Most houseplants prefer 15-30°C. Avoid sudden temperature changes. Keep plants away from windows during extreme weather.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Leaf,
    title: 'Feeding',
    description: 'Feed plants during growing season (spring-summer) with balanced fertilizer. Reduce feeding in winter when growth slows.',
    color: 'text-forest-500',
    bg: 'bg-forest-50',
  },
  {
    icon: Sprout,
    title: 'Repotting',
    description: 'Repot when roots emerge from drainage holes. Choose a pot 1-2 inches larger. Best done in spring when plants are actively growing.',
    color: 'text-sage-500',
    bg: 'bg-sage-50',
  },
]

export default function PlantCare() {
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <section id="plant-care" className="relative py-20 sm:py-28 md:py-32 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Expert Tips</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 mb-4 sm:mb-6" style={{ color: 'var(--color-text)' }}>
              Plant Care <span className="italic gradient-text-forest">Guide</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              Keep your plants thriving with these essential care tips from our experts.
            </p>
          </div>

          {/* Tips grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tips.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="p-6 sm:p-8 rounded-lg border transition-all hover:shadow-lg"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-serif text-lg sm:text-xl mb-3" style={{ color: 'var(--color-text)' }}>
                  {title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
