import { useEffect, useRef } from 'react'
import { X, Sun, Droplets, Ruler, Thermometer, ShoppingBag, Check } from 'lucide-react'
import type { Plant } from '../lib/api'

interface QuickViewProps {
  plant: Plant | null
  onClose: () => void
  onAddToCart: (plant: Plant) => void
  addedToCart: boolean
}

export default function QuickView({ plant, onClose, onAddToCart, addedToCart }: QuickViewProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plant) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [plant, onClose])

  if (!plant) return null

  const hasDiscount = plant.offerPrice != null && plant.offerPrice < plant.price
  const discountPercent = hasDiscount ? Math.round(((plant.price - plant.offerPrice!) / plant.price) * 100) : 0
  const tags = plant.tags ? plant.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const isOutOfStock = plant.stockQuantity <= 0

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-1/2">
            <div className="aspect-square bg-gradient-to-br from-forest-50 to-sage-50">
              {plant.imageUrl ? (
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-forest-300/25">
                    <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
                    <path d="M12 22V10" />
                    <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
                  </svg>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <span className="text-xs tracking-wider uppercase bg-red-600 text-white px-3 py-1.5 font-semibold">
                  {discountPercent}% OFF
                </span>
              )}
              {plant.featured && (
                <span className="text-xs tracking-wider uppercase bg-gold-600 text-white px-3 py-1.5 font-semibold">
                  Bestseller
                </span>
              )}
              {isOutOfStock && (
                <span className="text-xs tracking-wider uppercase bg-gray-600 text-white px-3 py-1.5 font-semibold">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 md:p-8">
            <span className="text-[10px] tracking-[0.2em] uppercase text-gold-500 font-medium">
              {plant.category}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl mt-2 mb-3" style={{ color: 'var(--color-text)' }}>
              {plant.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-forest-800">
                    ₹{plant.offerPrice!.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{plant.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 font-semibold">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  ₹{plant.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-1.5 mb-4">
              {isOutOfStock ? (
                <span className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Out of Stock
                </span>
              ) : plant.stockQuantity <= 5 ? (
                <span className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Only {plant.stockQuantity} left in stock
                </span>
              ) : (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  In Stock ({plant.stockQuantity} available)
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-muted)' }}>
              {plant.description}
            </p>

            {/* Care Info */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {plant.lightRequirement && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Sun size={14} className="text-gold-500" />
                  <span>{plant.lightRequirement}</span>
                </div>
              )}
              {plant.waterFrequency && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Droplets size={14} className="text-sky-500" />
                  <span>{plant.waterFrequency}</span>
                </div>
              )}
              {plant.size && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Ruler size={14} className="text-forest-500" />
                  <span>{plant.size}</span>
                </div>
              )}
              {plant.temperature && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Thermometer size={14} className="text-orange-500" />
                  <span>{plant.temperature}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 bg-gold-50 text-gold-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* How to Plant */}
            {plant.howToPlant && (
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text)' }}>
                  How to Plant
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {plant.howToPlant}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => !isOutOfStock && onAddToCart(plant)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-forest-900 text-cream-100 text-xs uppercase tracking-wider font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isOutOfStock || addedToCart}
              >
                {addedToCart ? (
                  <>
                    <Check size={14} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </button>
              <a
                href="#contact"
                className="px-6 py-3 border border-forest-900 text-forest-900 text-xs uppercase tracking-wider font-semibold hover:bg-forest-900 hover:text-cream-100 transition-colors"
              >
                Enquire
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
