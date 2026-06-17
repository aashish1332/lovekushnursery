import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, User, Package, LogOut, Save, X } from 'lucide-react'

import { API_BASE } from '../lib/api';
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

interface Order {
  id: string
  totalAmount: number
  discountAmount: number
  offerCode: string | null
  status: string
  rejectionReason: string | null
  createdAt: string
  items: {
    plantName: string
    plantImage: string
    price: number
    quantity: number
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'qty_high', label: 'Quantity: High to Low' },
  { value: 'qty_low', label: 'Quantity: Low to High' },
]

const FILTER_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Approved' },
  { value: 'shipped', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'rejected', label: 'Rejected' },
]

interface AccountPageProps {
  onBack: () => void
  onComplete?: () => void
}

export default function AccountPage({ onBack, onComplete }: AccountPageProps) {
  const { user, updateUser, logout } = useAuth()
  const [tab, setTab] = useState<'profile' | 'orders'>(!user?.profileComplete ? 'profile' : 'orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [filterStatus, setFilterStatus] = useState('')
  const [editing, setEditing] = useState(!user?.profileComplete)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  // Load orders
  useEffect(() => {
    if (tab !== 'orders') return
    setLoadingOrders(true)
    fetch(`${API_BASE}/api/orders`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data.success) setOrders(data.data) })
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [tab])

  // Listen for order-placed events
  useEffect(() => {
    const handler = () => {
      if (tab === 'orders') {
        setLoadingOrders(true)
        fetch(`${API_BASE}/api/orders`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => { if (data.success) setOrders(data.data) })
          .catch(() => {})
          .finally(() => setLoadingOrders(false))
      }
    }
    window.addEventListener('order-placed', handler)
    return () => window.removeEventListener('order-placed', handler)
  }, [tab])

  // Sync form with user
  useEffect(() => {
    if (user) {
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
    }
  }, [user])

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSaveProfile() {
    setError('')
    setSuccess('')

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
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Invalid pincode. Must be 6 digits')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/auth/user/profile', {
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
      setEditing(false)
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
      onComplete?.()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    onBack()
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </button>
          <h1 className="font-serif text-lg text-[var(--color-text)]">My Account</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              tab === 'profile'
                ? 'border-forest-900 text-forest-900'
                : 'border-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              tab === 'orders'
                ? 'border-forest-900 text-forest-900'
                : 'border-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            <Package size={16} />
            Orders
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-forest-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-forest-700 hover:text-forest-900 underline"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false)
                    setError('')
                    if (user) {
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
                    }
                  }}
                  className="text-sm text-sage-500 hover:text-sage-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  disabled={!editing}
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none bg-white' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-sage-50 border border-r-0 border-sage-200 text-sage-600 text-sm select-none">+91</span>
                  <input
                    type="tel"
                    value={form.phone}
                    readOnly
                    className="flex-1 px-3 py-2.5 border border-sage-200 text-sm bg-sage-50 text-sage-600"
                  />
                </div>
                <p className="text-[10px] text-sage-400 mt-1">Phone number is your account identifier</p>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                  Address Line 1 {editing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={e => updateField('addressLine1', e.target.value)}
                  disabled={!editing}
                  placeholder="House/Flat No., Street, Area"
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none bg-white' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Address Line 2</label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={e => updateField('addressLine2', e.target.value)}
                  disabled={!editing}
                  placeholder="Landmark, Colony (optional)"
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none bg-white' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                    City {editing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                    disabled={!editing}
                    placeholder="Gurugram"
                    className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                      editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none bg-white' : 'border-transparent bg-sage-50 text-sage-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                    Pincode {editing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={!editing}
                    placeholder="122001"
                    className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                      editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none bg-white' : 'border-transparent bg-sage-50 text-sage-700'
                    }`}
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                  State {editing && <span className="text-red-500">*</span>}
                </label>
                {editing ? (
                  <select
                    value={form.state}
                    onChange={e => updateField('state', e.target.value)}
                    className="w-full px-3 py-2.5 border border-sage-200 text-sm focus:border-forest-600 focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.state}
                    disabled
                    className="w-full px-3 py-2.5 border border-transparent bg-sage-50 text-sage-700 text-sm"
                  />
                )}
              </div>

              {/* Country */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Country</label>
                <input
                  type="text"
                  value={form.country}
                  readOnly
                  className="w-full px-3 py-2.5 border border-transparent bg-sage-50 text-sage-600 text-sm"
                />
              </div>

              {/* Save button */}
              {editing && (
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full btn-premium justify-center mt-4"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={16} />
                      Save Profile
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="pt-8 mt-8 border-t border-sage-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                  <Package size={28} className="text-sage-300" />
                </div>
                <h3 className="font-serif text-lg text-forest-900 mb-1">No Orders Yet</h3>
                <p className="text-sm text-sage-500">Start shopping to see your orders here</p>
                <button onClick={onBack} className="btn-premium mt-6 text-xs">
                  Browse Collection
                </button>
              </div>
            ) : (
              <>
                {/* Sort & Filter */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-xs px-3 py-2 border border-sage-200 bg-white text-sage-700 focus:outline-none focus:border-forest-600"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="text-xs px-3 py-2 border border-sage-200 bg-white text-sage-700 focus:outline-none focus:border-forest-600"
                  >
                    {FILTER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {orders
                    .filter(o => !filterStatus || o.status === filterStatus)
                    .sort((a, b) => {
                      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                      const aQty = a.items.reduce((sum, i) => sum + i.quantity, 0)
                      const bQty = b.items.reduce((sum, i) => sum + i.quantity, 0)
                      if (sortBy === 'qty_high') return bQty - aQty
                      if (sortBy === 'qty_low') return aQty - bQty
                      return 0
                    })
                    .map(order => {
                      const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0)
                      return (
                        <div key={order.id} className="border border-sage-100 p-4 bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-sage-500">Order #{order.id.slice(0, 8)}...</p>
                              <p className="text-xs text-sage-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              <p className="text-[10px] text-sage-400 mt-0.5">{totalQty} item{totalQty !== 1 ? 's' : ''}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 uppercase font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </div>

                          {order.status === 'rejected' && order.rejectionReason && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-100 text-xs text-red-700">
                              <span className="font-medium">Reason:</span> {order.rejectionReason}
                            </div>
                          )}

                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sage-50 overflow-hidden flex-shrink-0">
                                  {item.plantImage ? (
                                    <img src={item.plantImage} alt={item.plantName} className="w-full h-full object-cover" loading="lazy" />
                                  ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-forest-900 truncate">{item.plantName}</p>
                                  <p className="text-xs text-sage-500">Qty: {item.quantity}</p>
                                </div>
                                <span className="text-sm text-forest-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-sage-100 space-y-1">
                            {order.offerCode && (
                              <div className="flex justify-between text-xs">
                                <span className="text-green-600">🏷️ {order.offerCode}{order.discountAmount > 0 ? ` (-₹${order.discountAmount.toLocaleString('en-IN')})` : ''}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-sage-600">Total</span>
                              <span className="font-serif text-forest-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
