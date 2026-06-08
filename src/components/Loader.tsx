import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setFadeOut(true), 300)
          setTimeout(() => setIsLoading(false), 1100)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 120)
    return () => clearInterval(interval)
  }, [])

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-opacity duration-700 ease-out"
      style={{
        background: 'var(--color-forest)',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center animate-fade-in-up">
        <div className="loader-leaf mb-4">
          <Leaf className="w-12 h-12" style={{ color: 'var(--color-gold)' }} />
        </div>
        <span className="font-serif text-2xl font-semibold tracking-wide" style={{ color: '#f9f5ef' }}>Love Kush</span>
        <span className="text-[10px] uppercase tracking-[0.4em] font-medium mt-1" style={{ color: 'var(--color-gold)' }}>Nursery</span>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-linear"
          style={{ background: 'var(--color-gold)', width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Progress text */}
      <p className="mt-4 text-xs tracking-[0.2em] uppercase opacity-60" style={{ color: '#f9f5ef', animation: 'fadeInUp 0.5s ease 0.3s both' }}>
        {Math.min(Math.round(progress), 100)}%
      </p>
    </div>
  )
}
