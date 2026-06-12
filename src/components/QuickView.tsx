import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Sun, Droplets, Ruler, Thermometer, ShoppingBag, Check, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import type { Plant } from '../lib/api'

interface QuickViewProps {
  plant: Plant | null
  onClose: () => void
  onAddToCart: (plant: Plant) => void
  addedToCart: boolean
}

export default function QuickView({ plant, onClose, onAddToCart, addedToCart }: QuickViewProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number>(0)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const lightboxImageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!plant) return
    setCurrentImageIndex(0)

    window.history.pushState({ modal: true }, '')
    let poppedByBack = false
    const handlePopState = () => { poppedByBack = true; onCloseRef.current() }
    window.addEventListener('popstate', handlePopState)

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      if (!poppedByBack && window.history.state?.modal) {
        window.history.back()
      }
    }
  }, [plant])

  const handleWheel = (e: React.WheelEvent) => {
    if (lightboxOpen) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    const modal = modalRef.current
    if (!modal) return
    const { scrollTop, scrollHeight, clientHeight } = modal
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault()
    }
    e.stopPropagation()
  }

  const resetLightbox = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    resetLightbox()
  }, [resetLightbox])

  const toggleZoom = useCallback(() => {
    if (zoom > 1) {
      resetLightbox()
    } else {
      setZoom(2)
    }
  }, [zoom, resetLightbox])

  const zoomIn = useCallback(() => {
    setZoom(z => Math.min(z + 0.5, 4))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(z => {
      const next = Math.max(z - 0.5, 1)
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])

  // Lightbox wheel zoom
  const handleLightboxWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z + 0.15, 4))
    } else {
      setZoom(z => {
        const next = Math.max(z - 0.15, 1)
        if (next === 1) setPan({ x: 0, y: 0 })
        return next
      })
    }
  }, [])

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy)
    } else if (e.touches.length === 1 && zoom > 1) {
      isDragging.current = true
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panStart.current = { ...pan }
    }
  }, [zoom, pan])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (lastTouchDistance.current > 0) {
        const scale = distance / lastTouchDistance.current
        setZoom(z => {
          const next = Math.min(Math.max(z * scale, 1), 4)
          if (next === 1) setPan({ x: 0, y: 0 })
          return next
        })
      }
      lastTouchDistance.current = distance
    } else if (e.touches.length === 1 && isDragging.current && zoom > 1) {
      e.preventDefault()
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
    }
  }, [zoom])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = 0
    isDragging.current = false
  }, [])

  // Mouse drag for panning when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      isDragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      panStart.current = { ...pan }
      e.preventDefault()
    }
  }, [zoom, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current && zoom > 1) {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
    }
  }, [zoom])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  if (!plant) return null

  const hasDiscount = plant.offerPrice != null && plant.offerPrice < plant.price
  const discountPercent = hasDiscount ? Math.round(((plant.price - plant.offerPrice!) / plant.price) * 100) : 0
  const tags = plant.tags ? plant.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const isOutOfStock = plant.stockQuantity <= 0
  const allImages = plant.images && plant.images.length > 0
    ? plant.images.sort((a, b) => a.order - b.order).map(img => img.imageUrl)
    : [plant.imageUrl]

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        onWheel={handleWheel}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-3 float-right mr-3 mt-3 z-10 w-9 h-9 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors shadow-lg"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row clear-both">
          {/* Image Carousel */}
          <div className="relative md:w-1/2">
            <div className="bg-gradient-to-br from-forest-50 to-sage-50 relative">
              {plant.imageUrl ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={plant.name}
                    className="w-full max-h-[50vh] object-contain cursor-zoom-in"
                    onClick={() => { setLightboxOpen(true); resetLightbox() }}
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i > 0 ? i - 1 : allImages.length - 1) }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i < allImages.length - 1 ? i + 1 : 0) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i) }}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-forest-800' : 'bg-forest-800/30'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
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

      {/* ── Image Lightbox ──────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex flex-col select-none"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
          onWheel={handleLightboxWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/60 text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white/50 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={zoomIn}
                className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ZoomIn size={18} />
              </button>
              {zoom > 1 && (
                <button
                  onClick={resetLightbox}
                  className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                onClick={closeLightbox}
                className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden relative"
            style={{ cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={toggleZoom}
          >
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => { setCurrentImageIndex(i => i > 0 ? i - 1 : allImages.length - 1); resetLightbox() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => { setCurrentImageIndex(i => i < allImages.length - 1 ? i + 1 : 0); resetLightbox() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <img
              ref={lightboxImageRef}
              src={allImages[currentImageIndex]}
              alt={plant.name}
              className="max-w-full max-h-full object-contain transition-transform duration-150"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                touchAction: 'none',
              }}
              draggable={false}
            />
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0 overflow-x-auto">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentImageIndex(i); resetLightbox() }}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors shrink-0 ${i === currentImageIndex ? 'border-white' : 'border-white/30 opacity-60'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
