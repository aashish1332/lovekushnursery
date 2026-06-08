import { useState, useRef, useCallback } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { Tag, X, Loader2 } from 'lucide-react'

import { API_BASE } from '../lib/api';
interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
  onOrderComplete: () => void
  onLoginRequired: () => void
  onProfileRequired: () => void
}

interface CouponData {
  id: string
  title: string
  code: string
  discount: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  description: string
}

export default function Checkout({ isOpen, onClose, onOrderComplete, onLoginRequired, onProfileRequired }: CheckoutProps) {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  // Calculate discount
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percent'
      ? Math.round(total * appliedCoupon.discountValue / 100)
      : Math.min(appliedCoupon.discountValue, total)
    : 0

  const finalTotal = Math.max(0, total - discountAmount)

  if (!isOpen) return null

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)

    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid coupon code')
      }

      setAppliedCoupon(data.data)
      setCouponError('')
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  async function handlePlaceOrder() {
    // Check auth
    if (!user) {
      onLoginRequired()
      return
    }

    // Check profile
    if (!user.profileComplete) {
      onProfileRequired()
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map(item => ({
            plantId: item.plantId,
            quantity: item.quantity,
          })),
          notes: notes || undefined,
          offerCode: appliedCoupon?.code || undefined,
          discountAmount: discountAmount || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order')
      }

      clearCart()
      window.dispatchEvent(new CustomEvent('order-placed'))
      onOrderComplete()
    } catch (err: any) {
      const msg = String(err?.message || '')
      const isNetworkError =
        err instanceof TypeError ||
        /failed to fetch|networkerror|load failed|offline|net::err_/i.test(msg)

      if (isNetworkError) {
        setError(
          'Cannot reach our servers right now. Please check your connection, disable any ad-blocker for this site, and try again.'
        )
      } else if (/5\d\d|server|timeout|timed out/i.test(msg)) {
        setError('Our servers are having a moment. Please try again in a few seconds.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      data-lenis-prevent-wheel
      onWheel={(e) => {
        const el = overlayRef.current
        if (!el) return
        if (el.scrollHeight <= el.clientHeight) return
        e.stopPropagation()
        el.scrollTop += e.deltaY
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] my-auto overflow-y-auto bg-white shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease' }}
        data-lenis-prevent-wheel
        onWheel={(e) => {
          const el = e.currentTarget
          if (el.scrollHeight <= el.clientHeight) return
          el.scrollTop += e.deltaY
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sage-100 p-6 pb-4 flex items-center justify-between z-10">
          <h2 id="checkout-title" className="font-serif text-xl text-forest-900">Checkout</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-sage-400 hover:text-sage-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="sticky top-0 z-10 mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
              <div className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {user?.profileComplete && (
            <div className="mb-6 p-4 bg-sage-50 border border-sage-100">
              <h3 className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-2">Shipping To</h3>
              <p className="text-sm text-forest-900 font-medium">{user.name}</p>
              <p className="text-sm text-sage-600">{user.addressLine1}</p>
              {user.addressLine2 && <p className="text-sm text-sage-600">{user.addressLine2}</p>}
              <p className="text-sm text-sage-600">{user.city}, {user.state} {user.pincode}</p>
              <p className="text-sm text-sage-600">{user.country}</p>
              <p className="text-xs text-sage-500 mt-2">Phone: {user.phone}</p>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-3">Order Items</h3>
            <div className="space-y-3">
              {items.map(item => {
                const price = item.offerPrice && item.offerPrice < item.price ? item.offerPrice : item.price
                return (
                  <div key={item.plantId} className="flex items-center gap-3 p-3 border border-sage-100">
                    <div className="w-12 h-12 flex-shrink-0 bg-sage-50 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-sage-300">
                            <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-forest-900 truncate">{item.name}</h4>
                      <p className="text-xs text-sage-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-serif text-sm text-forest-900">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mb-6">
            <h3 className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-3">Have a Coupon?</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-700" />
                  <div>
                    <span className="font-mono text-sm font-bold text-green-800 tracking-wider uppercase">{appliedCoupon.code}</span>
                    <span className="text-xs text-green-600 ml-2">— {appliedCoupon.discount} OFF</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2.5 border border-sage-200 text-sm font-mono tracking-wider uppercase focus:border-forest-600 focus:outline-none transition-colors"
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2.5 bg-forest-900 text-cream-100 text-sm font-medium hover:bg-forest-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-xs text-red-600 mt-2">{couponError}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Order Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={2}
              className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Summary */}
          <div className="border-t border-sage-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-sage-600">Subtotal</span>
              <span className="text-forest-900">₹{total.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <Tag size={12} />
                  Discount ({appliedCoupon?.discount})
                </span>
                <span className="text-green-600 font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-sage-600">Shipping</span>
              <span className="text-sage-500">Free</span>
            </div>
            <div className="flex justify-between text-lg font-serif border-t border-sage-100 pt-2">
              <span className="text-forest-900">Total</span>
              <span className="text-forest-900">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Place Order */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0}
            className="w-full btn-premium justify-center mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Placing Order...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
