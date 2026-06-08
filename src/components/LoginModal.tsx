import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStopLenis } from '../hooks/useLenis'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { loginWithPhone } = useAuth()
  // Defense in depth: stop Lenis when this specific modal mounts,
  // even if the parent forgot to register it.
  useStopLenis(isOpen)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverReachable, setServerReachable] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhone('')
      setError('')
      setLoading(false)
      setServerReachable(typeof navigator !== 'undefined' ? navigator.onLine : true)
      // Focus after the modal mounts
      const t = window.setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
      }, 50)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])

  // Escape key when open. Body scroll lock is handled by useStopLenis
  // (position:fixed freezes the body so Lenis ignores wheel events).
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setServerReachable(true)
    const goOffline = () => setServerReachable(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Filter to digits and cap at 10 — pure React state update,
    // never mutate the input value directly (that desyncs controlled input
    // and can drop keystrokes).
    const next = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(next)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('You appear to be offline. Please check your internet connection and try again.')
      return
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian phone number')
      return
    }

    setLoading(true)
    try {
      const result = await loginWithPhone(cleanPhone)
      onSuccess?.()
      onClose()

      if (!result.profileComplete) {
        // Dispatch event to show profile completion
        window.dispatchEvent(new CustomEvent('show-profile-completion'))
      }
    } catch (err: any) {
      // Translate fetch / network failures into a friendly message
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
      } else if (/4\d\d|invalid|unauthor|forbidden|not found/i.test(msg)) {
        setError(msg || 'We could not process that phone number. Please double-check it and try again.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      data-lenis-prevent-wheel
      onWheel={(e) => {
        // Manually scroll the overlay when wheel events arrive.
        // NOTE: do NOT call e.preventDefault() — Chrome 73+ treats
        // wheel listeners as passive by default, and calling it throws
        // "Unable to preventDefault inside passive event listener",
        // which halts React's event processing and breaks keypress
        // handling in inputs.
        const el = overlayRef.current
        if (!el) return
        if (el.scrollHeight <= el.clientHeight) return
        e.stopPropagation()
        el.scrollTop += e.deltaY
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto bg-white p-8 shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-forest-50 flex items-center justify-center rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest-600">
              <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
              <path d="M12 22V10" />
              <path d="M9 13c1.5-1 3-1.5 3-1.5s1.5.5 3 1.5" />
            </svg>
          </div>
          <h2 id="login-modal-title" className="font-serif text-2xl text-forest-900 mb-2">Welcome to Love Kush</h2>
          <p className="text-sm text-sage-600">Enter your phone number to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!serverReachable && !error && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
            <span className="font-semibold uppercase tracking-wide text-[10px] mt-0.5">
              Offline
            </span>
            <span className="text-xs">
              You appear to be offline. Reconnect to continue.
            </span>
          </div>
        )}

        {/* Phone Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lk-login-phone-input" className="block text-xs font-medium text-sage-700 mb-1.5 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-sage-50 border border-r-0 border-sage-200 text-sage-600 text-sm select-none">
                +91
              </span>
              <input
                id="lk-login-phone-input"
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                name="lk-login-phone"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                className="flex-1 px-3 py-2.5 border border-sage-200 text-sm text-sage-900 placeholder:text-sage-300 placeholder:font-normal focus:outline-none focus:border-forest-600 transition-colors bg-white relative z-10"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full py-3 bg-forest-900 text-white text-sm tracking-wide hover:bg-forest-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Continuing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[11px] text-sage-400 mt-6">
          We'll use this to confirm your plant orders
        </p>
      </div>
    </div>
  )
}
