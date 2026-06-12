import { useState, useEffect, useMemo } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { ArrowRight, Heart, Leaf, Sprout, TreePine, Flower2, Loader2, Search } from 'lucide-react'
import { VineCorner, VineHanging } from './VineCorner'
import { fetchPlants, Plant } from '../lib/api'
import { useWishlist } from '../hooks/useWishlist'
import QuickView from './QuickView'

const categories = [
  { id: 'all', label: 'All', icon: Leaf },
  { id: 'indoor', label: 'Indoor', icon: Sprout },
  { id: 'outdoor', label: 'Outdoor', icon: TreePine },
  { id: 'flowering', label: 'Flowering', icon: Flower2 },
  { id: 'succulents', label: 'Succulents', icon: Leaf },
  { id: 'rare', label: 'Rare', icon: Flower2 },
  { id: 'herbs', label: 'Herbs', icon: Sprout },
  { id: 'trees', label: 'Trees', icon: TreePine },
]

// Gradient map for categories
const categoryGradients: Record<string, string> = {
  indoor: 'from-forest-100 to-sage-50',
  outdoor: 'from-gold-50 to-cream-50',
  flowering: 'from-cream-100 to-gold-50',
  succulents: 'from-forest-50 to-sage-50',
  rare: 'from-sage-50 to-cream-100',
  herbs: 'from-gold-50 to-cream-100',
  trees: 'from-forest-100 to-sage-50',
}

function PlantCard({ plant, onClick, isWishlisted, onToggleWishlist }: {
  plant: Plant
  onClick: () => void
  isWishlisted: boolean
  onToggleWishlist: (e: React.MouseEvent) => void
}) {
  const gradient = categoryGradients[plant.category] || 'from-forest-100 to-sage-50'
  const hasDiscount = plant.offerPrice != null && plant.offerPrice < plant.price
  const discountPercent = hasDiscount ? Math.round(((plant.price - plant.offerPrice!) / plant.price) * 100) : 0
  const tags = plant.tags ? plant.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const isOutOfStock = plant.stockQuantity <= 0
  const isLowStock = plant.stockQuantity > 0 && plant.stockQuantity <= 5

  const allImages = plant.images && plant.images.length > 0
    ? plant.images.sort((a, b) => a.order - b.order).map(img => img.imageUrl)
    : [plant.imageUrl]
  const [hoverIndex, setHoverIndex] = useState(0)

  return (
    <div onClick={onClick} className="plant-card petal-border group border overflow-hidden cursor-pointer" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {/* Image */}
      <div
        className={`plant-card-image relative aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
        onMouseEnter={() => { if (allImages.length > 1) setHoverIndex(1) }}
        onMouseLeave={() => setHoverIndex(0)}
      >
        {plant.imageUrl ? (
          <img
            src={allImages[Math.min(hoverIndex, allImages.length - 1)]}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-forest-300/25">
            <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
            <path d="M12 22V10" />
            <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
          </svg>
        )}

        {/* Badges - top left */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="text-[9px] sm:text-[10px] tracking-[0.1em] uppercase bg-red-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 font-semibold">
              {discountPercent}% OFF
            </span>
          )}
          {plant.featured && (
            <span className="text-[9px] sm:text-[10px] tracking-[0.1em] uppercase bg-gold-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 font-semibold">
              Bestseller
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[9px] sm:text-[10px] tracking-[0.1em] uppercase bg-gray-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 font-semibold">
              Sold Out
            </span>
          )}
          {isLowStock && (
            <span className="text-[9px] sm:text-[10px] tracking-[0.1em] uppercase bg-amber-500 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 font-semibold">
              Low Stock
            </span>
          )}
        </div>

        {/* Category + Wishlist - top right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          <span className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase bg-forest-900/80 text-cream-100 px-2.5 py-1 sm:px-3 sm:py-1.5 backdrop-blur-sm">
            {plant.category}
          </span>
          <button
            onClick={onToggleWishlist}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-forest-900/80 text-cream-100 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={12} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Quick view button */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-forest-900 text-cream-100 flex items-center justify-center hover:bg-gold-600 transition-colors">
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase bg-black/50 px-4 py-2">
              Out of Stock
            </span>
          </div>
        )}

        {/* Image count dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === Math.min(hoverIndex, allImages.length - 1) ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-sm sm:text-base md:text-lg group-hover:text-gold-700 transition-colors leading-snug mb-1.5 sm:mb-2" style={{ color: 'var(--color-text)' }}>
          {plant.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-forest-800 text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
                ₹{plant.offerPrice!.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{plant.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-bold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
              ₹{plant.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1.5 mb-2">
          {isOutOfStock ? (
            <span className="text-[10px] sm:text-[11px] text-red-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] sm:text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Only {plant.stockQuantity} left
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              In Stock ({plant.stockQuantity})
            </span>
          )}
        </div>

        {/* Care info tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {plant.lightRequirement && (
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-forest-50 text-forest-700 rounded-full">
              {plant.lightRequirement}
            </span>
          )}
          {plant.waterFrequency && (
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full">
              {plant.waterFrequency}
            </span>
          )}
          {plant.size && (
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-sage-50 text-sage-700 rounded-full">
              {plant.size}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-gold-50 text-gold-700 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] sm:text-xs leading-relaxed line-clamp-2 mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {plant.description}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 sm:py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-forest-50 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-forest-300">
          <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
          <path d="M12 22V10" />
          <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
          <path d="M7 11c2-2 5-3 5-3s3 1 5 3" />
        </svg>
      </div>
      <h3 className="font-serif text-xl sm:text-2xl mb-3" style={{ color: 'var(--color-text)' }}>Collection Coming Soon</h3>
      <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--color-text-muted)' }}>
        We're preparing our curated plant collection. Check back soon or contact us for availability.
      </p>
      <a href="#contact" className="btn-outline inline-flex items-center gap-2">
        <span>Contact Us</span>
        <ArrowRight size={14} />
      </a>
    </div>
  )
}

interface CollectionProps {
  onAddToCart: (plant: Plant) => void
  addedPlantId: string | null
}

export default function Collection({ onAddToCart, addedPlantId }: CollectionProps) {
  const [active, setActive] = useState('all')
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [search, setSearch] = useState('')
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { ref, isVisible } = useScrollReveal(0.05)

  const filteredPlants = useMemo(() => {
    if (!search.trim()) return plants
    const q = search.toLowerCase()
    return plants.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tags?.toLowerCase().includes(q)
    )
  }, [plants, search])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPlants({
          category: active === 'all' ? undefined : active,
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        if (!cancelled) {
          setPlants(data.plants)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load plants')
          console.error(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [active])

  return (
    <section id="products" className="relative pt-6 sm:pt-8 pb-20 sm:pb-28 md:pb-32 floral-accent-right overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <VineCorner position="tr" opacity={0.08} />
      <VineCorner position="bl" opacity={0.06} />
      <VineHanging offset="85%" opacity={0.07} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ref} className={`section-reveal ${isVisible ? 'visible' : ''}`}>
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-500 font-medium">Our Collection</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 sm:mt-4 mb-4 sm:mb-6 floral-underline" style={{ color: 'var(--color-text)' }}>
              Handpicked <span className="italic gradient-text-forest">with Love</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base px-2" style={{ color: 'var(--color-text-muted)' }}>
              Every plant is nurtured with care and selected for health and beauty.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 mb-6 sm:mb-8 sm:justify-center sm:flex-wrap">
            {categories.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs tracking-[0.1em] uppercase transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    active === cat.id
                      ? 'bg-forest-900 text-cream-100 border border-forest-900'
                      : 'border border-sage-200 text-sage-600 hover:bg-forest-900 hover:text-cream-100 hover:border-forest-900'
                  }`}
                >
                  <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8 sm:mb-10">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search plants by name, category, or tag..."
                className="w-full pl-10 pr-4 py-2.5 border border-sage-200 text-sm bg-white focus:border-forest-600 focus:outline-none transition-colors"
                style={{ color: 'var(--color-text)' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              <button
                onClick={() => setActive(active)}
                className="btn-outline mt-4 text-xs px-6 py-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products grid or empty state */}
          {!loading && !error && (
            filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onClick={() => setSelectedPlant(plant)}
                    isWishlisted={isWishlisted(plant.id)}
                    onToggleWishlist={(e) => { e.stopPropagation(); toggleWishlist(plant.id) }}
                  />
                ))}
              </div>
            ) : search.trim() ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                  <Search size={24} className="text-sage-300" />
                </div>
                <h3 className="font-serif text-lg mb-1" style={{ color: 'var(--color-text)' }}>No plants found</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Try a different search term</p>
                <button onClick={() => setSearch('')} className="btn-outline mt-4 text-xs px-5 py-2">Clear Search</button>
              </div>
            ) : (
              <EmptyState />
            )
          )}

          {!loading && filteredPlants.length > 0 && (
            <div className="text-center mt-10 sm:mt-14">
              <a href="#contact" className="btn-outline gap-2 group inline-flex items-center">
                <span>View Full Catalog</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          )}
        </div>
      </div>

      <QuickView
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onAddToCart={onAddToCart}
        addedToCart={selectedPlant ? addedPlantId === selectedPlant.id : false}
      />
    </section>
  )
}
