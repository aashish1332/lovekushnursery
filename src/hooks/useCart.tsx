import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react'

export interface CartItem {
  plantId: string
  name: string
  price: number
  offerPrice: number | null
  imageUrl: string
  quantity: number
  category: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (plantId: string) => void
  updateQuantity: (plantId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = 'love-kush-cart'

function getStoredCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.plantId === item.plantId)
      if (existing) {
        return prev.map(i =>
          i.plantId === item.plantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((plantId: string) => {
    setItems(prev => prev.filter(i => i.plantId !== plantId))
  }, [])

  const updateQuantity = useCallback((plantId: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.plantId !== plantId))
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.plantId === plantId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => {
    const price = item.offerPrice && item.offerPrice < item.price ? item.offerPrice : item.price
    return sum + price * item.quantity
  }, 0)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
