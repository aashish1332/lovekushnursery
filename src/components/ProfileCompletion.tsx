import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStopLenis } from '../hooks/useLenis'

interface ProfileCompletionProps {
  isOpen: boolean
  onClose: () => void
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Andaman and Nicobar Islands',
]

export default function ProfileCompletion({ isOpen, onClose }: ProfileCompletionProps) {
  const { user, updateUser } = useAuth()
  useStopLenis(isOpen)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    country: user?.country || 'India',
  })

  // Reset form when modal opens / user changes
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
      })
      setError('')
      setLoading(false)
    }
  }, [isOpen, user])

  // Escape to close. Body scroll lock is handled by useStopLenis
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

  const updateField = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  function validatePincode(pincode: string): boolean {
    return /^\d{6}$/.test(pincode)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.addressLine1) {
      setError('Address is required')
      return
    }
    if (!form.city) {
      setError('City is required')
      return
    }
    if (!form.state) {
      setError('State is required')
      return
    }
    if (!form.pincode) {
      setError('Pincode is required')
      return
    }
    if (!validatePincode(form.pincode)) {
      setError('Invalid pincode. Must be 6 digits')
      return
    }

    setLoading(true)

    try {
      const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || ''
      const res = await fetch(`${apiBase}/api/auth/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile')
      }

      updateUser(data.data)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      data-lenis-prevent-wheel
      onWheel={(e) => {
        // Block vertical scroll from propagating to Lenis/page below
        e.stopPropagation()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-completion-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] my-auto overflow-y-auto bg-white shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease' }}
        data-lenis-prevent-wheel
        onWheel={(e) => {
          // Manually scroll this container when wheel arrives.
          // NOTE: do NOT call e.preventDefault() — Chrome 73+ treats
          // wheel listeners as passive by default, and calling it throws
          // "Unable to preventDefault inside passive event listener",
          // which halts React's event processing and breaks keypress
          // handling in inputs.
          const el = e.currentTarget
          if (el.scrollHeight <= el.clientHeight) return
          el.scrollTop += e.deltaY
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sage-100 p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="profile-completion-title" className="font-serif text-xl text-forest-900">Complete Your Profile</h2>
              <p className="text-sm text-sage-600 mt-1">Required for placing orders</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-sage-50 border border-r-0 border-sage-200 text-sage-600 text-sm select-none">
                +91
              </span>
              <input
                type="tel"
                value={form.phone}
                readOnly
                className="flex-1 px-3 py-2.5 border border-sage-200 text-sm bg-sage-50 text-sage-600"
              />
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="profile-address1" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              id="profile-address1"
              type="text"
              value={form.addressLine1}
              onChange={e => updateField('addressLine1', e.target.value)}
              placeholder="House/Flat No., Street, Area"
              className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="profile-address2" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Address Line 2
            </label>
            <input
              id="profile-address2"
              type="text"
              value={form.addressLine2}
              onChange={e => updateField('addressLine2', e.target.value)}
              placeholder="Landmark, Colony (optional)"
              className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
            />
          </div>

          {/* City, Pincode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-city" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-city"
                type="text"
                value={form.city}
                onChange={e => updateField('city', e.target.value)}
                placeholder="Gurugram"
                className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
              />
            </div>
            <div>
              <label htmlFor="profile-pincode" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-pincode"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="122001"
                className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label htmlFor="profile-state" className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="profile-state"
              value={form.state}
              onChange={e => updateField('state', e.target.value)}
              className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
              Country
            </label>
            <input
              type="text"
              value={form.country}
              readOnly
              className="w-full px-3 py-2.5 border border-sage-200 text-sm bg-sage-50 text-sage-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium justify-center mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
