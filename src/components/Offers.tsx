import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { Tag, Clock, Copy, Check } from 'lucide-react'

import { API_BASE } from '../lib/api';
interface Offer {
  id: string
  title: string
  description: string
  discount: string
  imageUrl: string | null
  code: string | null
  validFrom: string | null
  validUntil: string | null
  active: boolean
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { ref, isVisible } = useScrollReveal(0.05)

  useEffect(() => {
    fetch(`${API_BASE}/api/offers?active=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOffers(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading || offers.length === 0) return null

  return (
    <section className="relative pt-2 pb-4 sm:pt-3 sm:pb-6 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Special Offers</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 sm:mt-4 mb-4 sm:mb-6" style={{ color: 'var(--color-text)' }}>
              Deals & <span className="italic gradient-text-forest">Discounts</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              Grab these limited-time offers on our curated plant collection.
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="group border overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {/* Image */}
                {offer.imageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-600 text-white text-[10px] sm:text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 font-bold shadow-lg">
                        {offer.discount} OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {!offer.imageUrl && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-600 text-white text-[10px] sm:text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 font-bold">
                        {offer.discount} OFF
                      </span>
                    </div>
                  )}

                  <h3 className="font-serif text-lg sm:text-xl mb-2" style={{ color: 'var(--color-text)' }}>
                    {offer.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    {offer.description}
                  </p>

                  {/* Validity */}
                  {(offer.validFrom || offer.validUntil) && (
                    <div className="flex items-center gap-1.5 mb-4 text-[11px] text-sage-500">
                      <Clock size={12} />
                      <span>
                        Valid{' '}
                        {offer.validFrom && `from ${formatDate(offer.validFrom)}`}
                        {offer.validFrom && offer.validUntil && ' — '}
                        {offer.validUntil && `until ${formatDate(offer.validUntil)}`}
                      </span>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {offer.code && (
                    <div className="flex items-center gap-2 p-3 border border-dashed" style={{ background: 'var(--color-bg-alt)', borderColor: 'var(--color-border)' }}>
                      <Tag size={14} style={{ color: 'var(--color-text-muted)' }} className="flex-shrink-0" />
                      <span className="text-[11px] tracking-[0.15em] uppercase font-medium" style={{ color: 'var(--color-text-subtle)' }}>Code:</span>
                      <span className="font-mono text-sm font-bold tracking-wider flex-1" style={{ color: 'var(--color-text)' }}>{offer.code}</span>
                      <button
                        onClick={() => copyCode(offer.code!, offer.id)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {copiedId === offer.id ? (
                          <>
                            <Check size={12} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
