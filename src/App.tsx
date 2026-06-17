import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { LenisProvider, useStopLenis } from './hooks/useLenis'

import Loader from './components/Loader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import TrustBadges from './components/TrustBadges'
const About = React.lazy(() => import('./components/About'))
import Collection from './components/Collection'
const PlantCare = React.lazy(() => import('./components/PlantCare'))
const Services = React.lazy(() => import('./components/Services'))
const Gallery = React.lazy(() => import('./components/Gallery'))
const Testimonials = React.lazy(() => import('./components/Testimonials'))
const Contact = React.lazy(() => import('./components/Contact'))
import Footer from './components/Footer'
import { FloralDivider } from './components/VineCorner'
import { useScrollProgress } from './hooks/useScrollReveal'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { CartProvider, useCart } from './hooks/useCart'
import LoginModal from './components/LoginModal'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import AccountPage from './pages/AccountPage'
import Offers from './components/Offers'
import type { Plant } from './lib/api'

function AppContent() {
  const scrollProgress = useScrollProgress()
  const { user } = useAuth()
  const { addItem, itemCount } = useCart()

  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [accountPageOpen, setAccountPageOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [addedPlantId, setAddedPlantId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Body scroll lock for modals
  useStopLenis(cartOpen || checkoutOpen)

  const handleAddToCart = useCallback((plant: Plant) => {
    addItem({
      plantId: plant.id,
      name: plant.name,
      price: plant.price,
      offerPrice: plant.offerPrice,
      imageUrl: plant.imageUrl,
      category: plant.category,
    })
    setAddedPlantId(plant.id)
    setTimeout(() => setAddedPlantId(null), 2000)
    setToastMessage(`${plant.name} added to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [addItem])

  const handleCheckout = useCallback(() => {
    setCartOpen(false)
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    if (!user.profileComplete) {
      setAccountPageOpen(true)
      return
    }
    setCheckoutOpen(true)
  }, [user])

  const handleOrderComplete = useCallback(() => {
    setCheckoutOpen(false)
    setOrderComplete(true)
    setTimeout(() => setOrderComplete(false), 5000)
  }, [])

  // If account page is open, render it instead of main content
  if (accountPageOpen) {
    return (
      <AccountPage
        onBack={() => setAccountPageOpen(false)}
        onComplete={() => {}}
      />
    )
  }

  return (
    <>
      <Loader />
      <div className="noise-overlay" />
      <div className="floating-petals" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <svg key={i} className="petal" viewBox="0 0 12 18" fill="none">
            <path d="M6 0 C2 4 0 9 0 12 C0 16 3 18 6 18 C9 18 12 16 12 12 C12 9 10 4 6 0Z" fill="#c4a265" opacity="0.6" />
          </svg>
        ))}
      </div>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      <Navbar
        cartItemCount={itemCount}
        onCartClick={() => setCartOpen(true)}
        onAccountClick={() => setAccountPageOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
      />
      <main>
        <Hero />
        <Offers />
        <Collection onAddToCart={handleAddToCart} addedPlantId={addedPlantId} />
        <FloralDivider />
        <Marquee />
        <TrustBadges />
        <FloralDivider />
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-sage-600">Loading section...</div>}>
          <About />
          <FloralDivider />
          <PlantCare />
          <FloralDivider />
          <Services />
          <FloralDivider />
          <Gallery />
          <FloralDivider />
          <Testimonials />
          <Contact />
        </Suspense>
      </main>
      <Footer />

      {/* Order success notification */}
      {orderComplete && (
        <div className="fixed bottom-6 right-6 z-[150] bg-green-600 text-white px-6 py-4 shadow-lg" style={{ animation: 'fadeInUp 0.3s ease' }}>
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p className="font-medium">Order Placed Successfully!</p>
              <p className="text-sm opacity-80">We'll contact you soon to confirm.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add to cart toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-forest-900 text-white px-5 py-3 shadow-lg flex items-center gap-2" style={{ animation: 'fadeInUp 0.3s ease' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <Checkout
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
        onLoginRequired={() => { setCheckoutOpen(false); setLoginModalOpen(true) }}
        onProfileRequired={() => { setCheckoutOpen(false); setAccountPageOpen(true) }}
      />
    </>
  )
}

export default function App() {
  return (
    <LenisProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </LenisProvider>
  )
}
