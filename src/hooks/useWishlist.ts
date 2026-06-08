import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'love-kush-wishlist'

function loadWishlist(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(loadWishlist)

  useEffect(() => {
    saveWishlist(wishlistIds)
  }, [wishlistIds])

  const toggleWishlist = useCallback((plantId: string) => {
    setWishlistIds(prev =>
      prev.includes(plantId)
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    )
  }, [])

  const isWishlisted = useCallback((plantId: string) => {
    return wishlistIds.includes(plantId)
  }, [wishlistIds])

  const clearWishlist = useCallback(() => {
    setWishlistIds([])
  }, [])

  return { wishlistIds, toggleWishlist, isWishlisted, clearWishlist }
}
