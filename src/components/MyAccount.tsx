import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

import { API_BASE } from '../lib/api';
interface Order {
  id: string
  totalAmount: number
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

interface MyAccountProps {
  isOpen: boolean
  onClose: () => void
}

export default function MyAccount({ isOpen, onClose }: MyAccountProps) {
  const { user, updateUser, logout } = useAuth()
  const [tab, setTab] = useState<'profile' | 'orders'>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [filterStatus, setFilterStatus] = useState('')
  const [editing, setEditing] = useState(false)
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
  })

  // Load orders when switching to orders tab OR when an order is placed
  // (App.tsx dispatches 'order-placed' after Checkout succeeds).
  useEffect(() => {
    if (tab !== 'orders' || !isOpen) return
    setLoadingOrders(true)
    fetch('/api/orders', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data)
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [tab, isOpen])

  // Listen for order-placed events so the orders list stays in sync
  // even if MyAccount is open in the background when Checkout completes.
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen, tab])

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
      })
    }
  }, [user])

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSaveProfile() {
    setError('')
    setSuccess('')

    // Validate
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      setError('Invalid pincode')
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
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sage-100 p-6 pb-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-xl text-forest-900">My Account</h2>
            <p className="text-sm text-sage-500">+91 {user?.phone}</p>
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

        {/* Tabs */}
        <div className="flex border-b border-sage-100">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'profile'
                ? 'text-forest-900 border-b-2 border-forest-900'
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'orders'
                ? 'text-forest-900 border-b-2 border-forest-900'
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="sticky top-0 z-10 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="sticky top-0 z-10 mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm shadow-sm flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-forest-900">Personal Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-forest-700 hover:text-forest-900 underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  disabled={!editing}
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-sage-50 border border-r-0 border-sage-200 text-sage-600 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    disabled
                    className="flex-1 px-3 py-2.5 border border-sage-200 text-sm bg-sage-50 text-sage-600"
                  />
                </div>
                <p className="text-[10px] text-sage-400 mt-1">Phone number is your account identifier</p>
              </div>

              {/* Address */}
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={e => updateField('addressLine1', e.target.value)}
                  disabled={!editing}
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Address Line 2</label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={e => updateField('addressLine2', e.target.value)}
                  disabled={!editing}
                  className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                    editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none' : 'border-transparent bg-sage-50 text-sage-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                      editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none' : 'border-transparent bg-sage-50 text-sage-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={e => updateField('pincode', e.target.value)}
                    disabled={!editing}
                    className={`w-full px-3 py-2.5 border text-sm transition-colors ${
                      editing ? 'border-sage-200 focus:border-forest-600 focus:outline-none' : 'border-transparent bg-sage-50 text-sage-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-sage-600 font-medium mb-1.5 block">State</label>
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

              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 btn-premium justify-center"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
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
                        })
                      }
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-sage-100">
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-300">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-forest-900 mb-1">No Orders Yet</h3>
                  <p className="text-sm text-sage-500">Start shopping to see your orders here</p>
                </div>
              ) : (
                <>
                  {/* Sort & Filter Controls */}
                  <div className="flex flex-wrap gap-3 mb-4">
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
                          <div key={order.id} className="border border-sage-100 p-4">
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

                            {/* Rejection reason */}
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
                            <div className="mt-3 pt-3 border-t border-sage-100 flex justify-between">
                              <span className="text-sm text-sage-600">Total</span>
                              <span className="font-serif text-forest-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
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
    </div>
  )
}
