import { Truck, Shield, Package, Headphones } from 'lucide-react'

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    subtitle: 'On orders above ₹999',
  },
  {
    icon: Shield,
    title: 'Plant Health Guarantee',
    subtitle: '7-day replacement promise',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    subtitle: 'Safe & eco-friendly transit',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    subtitle: 'Mon-Sat, 8AM-8PM',
  },
]

export default function TrustBadges() {
  return (
    <section className="py-8 sm:py-10 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {badges.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-forest-50">
                <Icon size={18} className="text-forest-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h4>
                <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
