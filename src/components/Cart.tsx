import { useState } from 'react'
import { useCart, CartItem } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

interface CartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()
  const { user } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Cart Panel */}
      <div
        className="relative w-full max-w-md bg-white flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.3s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-sage-100">
          <div>
            <h2 className="font-serif text-lg text-forest-900">Your Cart</h2>
            <p className="text-xs text-sage-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-sage-400 hover:text-sage-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-300">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-forest-900 mb-1">Cart is Empty</h3>
              <p className="text-sm text-sage-500">Add some beautiful plants to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <CartItemCard key={item.plantId} item={item} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-sage-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage-600">Subtotal</span>
              <span className="font-serif text-lg text-forest-900">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-sage-400">Shipping calculated at checkout</p>
            <button
              onClick={onCheckout}
              className="w-full btn-premium justify-center"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

function CartItemCard({ item, onRemove, onUpdateQuantity }: {
  item: CartItem
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, qty: number) => void
}) {
  const price = item.offerPrice && item.offerPrice < item.price ? item.offerPrice : item.price

  return (
    <div className="flex gap-3 p-3 border border-sage-100">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-sage-50 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-sage-300">
              <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-sm text-forest-900 truncate">{item.name}</h4>
        <p className="text-xs text-sage-500 capitalize">{item.category}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.plantId, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center border border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors text-xs"
            >
              -
            </button>
            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.plantId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center border border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors text-xs"
            >
              +
            </button>
          </div>
          <span className="font-serif text-sm text-forest-900">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.plantId)}
        className="self-start text-sage-400 hover:text-red-500 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
