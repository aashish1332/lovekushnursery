'use client'

import { useState, useEffect } from 'react'
import { cardStyle } from '@/lib/admin-styles'

interface OrderItem {
  plantName: string
  plantImage: string
  price: number
  quantity: number
}

interface Order {
  id: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  country: string
  totalAmount: number
  discountAmount: number
  offerCode: string | null
  status: string
  rejectionReason: string | null
  notes: string | null
  createdAt: string
  items: OrderItem[]
  user: {
    name: string
    phone: string
  } | null
  statusHistory?: {
    id: string
    oldStatus: string | null
    newStatus: string
    changedBy: string
    reason: string | null
    createdAt: string
  }[]
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected']

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#ede9fe', text: '#5b21b6' },
  delivered: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
}

const REJECTION_REASONS = [
  'Delivery unavailable in this area',
  'Out of stock',
  'Service unavailable',
  'Incorrect information',
  'Customer requested cancellation',
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<string>('')
  const [showArchived, setShowArchived] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [updating, setUpdating] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ orderId: string; reason: string; customReason: string } | null>(null)

  useEffect(() => {
    loadOrders()
  }, [filter, showArchived])

  async function loadOrders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      if (showArchived) params.set('archived', 'true')
      const url = `/api/admin/orders?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data.orders)
      }
    } catch (e) {
      console.error('Failed to load orders', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, newStatus: string, rejectionReason?: string) {
    setUpdating(orderId)
    try {
      const body: Record<string, string> = { status: newStatus }
      if (newStatus === 'rejected' && rejectionReason) {
        body.rejectionReason = rejectionReason
      }
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, rejectionReason: newStatus === 'rejected' ? (rejectionReason || null) : o.rejectionReason } : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.data)
        }
      }
    } catch (e) {
      console.error('Failed to update order', e)
    } finally {
      setUpdating(null)
      setRejectModal(null)
    }
  }

  async function toggleArchive(orderId: string, archived: boolean) {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/admin/orders/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: [orderId], archived }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedOrder(null)
        loadOrders()
      }
    } catch (e) {
      console.error('Failed to archive order', e)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Orders</h2>
        <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>Manage customer orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setFilter('')}
          style={{
            ...filterButtonStyle,
            background: !filter ? '#1a3c34' : '#fff',
            color: !filter ? '#fff' : '#666',
            borderColor: !filter ? '#1a3c34' : '#e5e5e5',
          }}
        >
          All
        </button>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...filterButtonStyle,
              background: filter === status ? STATUS_COLORS[status].bg : '#fff',
              color: filter === status ? STATUS_COLORS[status].text : '#666',
              borderColor: filter === status ? STATUS_COLORS[status].text + '40' : '#e5e5e5',
              textTransform: 'capitalize',
            }}
          >
            {status}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fff', color: '#666', fontFamily: 'inherit' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Amount: High to Low</option>
            <option value="amount_low">Amount: Low to High</option>
            <option value="status">Status</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show Archived
          </label>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No orders found</p>
          <p style={{ fontSize: 13 }}>Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {[...orders]
            .sort((a, b) => {
              if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              if (sortBy === 'amount_high') return b.totalAmount - a.totalAmount
              if (sortBy === 'amount_low') return a.totalAmount - b.totalAmount
              if (sortBy === 'status') return a.status.localeCompare(b.status)
              return 0
            })
            .map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `3px solid ${STATUS_COLORS[order.status]?.text || '#ccc'}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3c34', marginBottom: 2 }}>
                      {order.user?.name || order.phone}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} — {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                    {order.offerCode && (
                      <span style={{ fontSize: 10, padding: '2px 6px', background: '#dcfce7', color: '#166534', borderRadius: 4, fontWeight: 600 }}>
                        🏷️ {order.offerCode}
                      </span>
                    )}
                    <span style={{
                      display: 'inline-block',
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: STATUS_COLORS[order.status]?.bg || '#f3f4f6',
                      color: STATUS_COLORS[order.status]?.text || '#374151',
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {order.items.map(i => i.plantName).join(', ')}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div
            onClick={() => setSelectedOrder(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a3c34' }}>Order Details</h3>
                <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>#{selectedOrder.id.slice(0, 8)}...</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, color: '#666' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Status Update */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        if (status === 'rejected') {
                          setRejectModal({ orderId: selectedOrder.id, reason: '', customReason: '' })
                        } else {
                          updateStatus(selectedOrder.id, status)
                        }
                      }}
                      disabled={updating === selectedOrder.id || selectedOrder.status === status}
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        border: `1px solid ${STATUS_COLORS[status]?.text || '#ccc'}40`,
                        background: selectedOrder.status === status ? STATUS_COLORS[status]?.bg : '#fff',
                        color: selectedOrder.status === status ? STATUS_COLORS[status]?.text : '#666',
                        cursor: updating === selectedOrder.id ? 'not-allowed' : 'pointer',
                        opacity: updating === selectedOrder.id ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Customer</h4>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                  <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Shipping Address</h4>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                  <p>{selectedOrder.addressLine1}</p>
                  {selectedOrder.addressLine2 && <p>{selectedOrder.addressLine2}</p>}
                  <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}</p>
                  <p>{selectedOrder.country}</p>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Items</h4>
                <div style={{ display: 'grid', gap: 8 }}>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                      <div style={{ width: 48, height: 48, background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                        {item.plantImage && (
                          <img src={item.plantImage} alt={item.plantName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{item.plantName}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3c34' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount & Total */}
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 16 }}>
                {selectedOrder.offerCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11 }}>🏷️</span>
                      Coupon: {selectedOrder.offerCode}
                    </span>
                    {selectedOrder.discountAmount > 0 && (
                      <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                        -₹{selectedOrder.discountAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1a3c34' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes</h4>
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{selectedOrder.notes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedOrder.status === 'rejected' && selectedOrder.rejectionReason && (
                <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>Rejection Reason</h4>
                  <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{selectedOrder.rejectionReason}</p>
                </div>
              )}

              {/* Status History / Audit Trail */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Action History</h4>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {selectedOrder.statusHistory.map(entry => (
                      <div key={entry.id} style={{ padding: '8px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', fontSize: 12, color: '#555' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {entry.oldStatus && <span style={{ color: '#999' }}>{entry.oldStatus}</span>}
                            {entry.oldStatus && <span style={{ margin: '0 4px', color: '#ccc' }}>→</span>}
                            <span style={{ fontWeight: 600, color: '#1a3c34' }}>{entry.newStatus}</span>
                          </span>
                          <span style={{ fontSize: 11, color: '#999' }}>
                            {new Date(entry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                          by {entry.changedBy}
                          {entry.reason && <span style={{ color: '#999' }}> — {entry.reason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Archive/Restore Button */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', gap: 8 }}>
                {showArchived ? (
                  <button
                    onClick={() => toggleArchive(selectedOrder.id, false)}
                    disabled={updating === selectedOrder.id}
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 500,
                      border: '1px solid #16a34a',
                      borderRadius: 6,
                      background: '#fff',
                      color: '#16a34a',
                      cursor: updating === selectedOrder.id ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {updating === selectedOrder.id ? 'Restoring...' : 'Restore Order'}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleArchive(selectedOrder.id, true)}
                    disabled={updating === selectedOrder.id}
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 500,
                      border: '1px solid #f59e0b',
                      borderRadius: 6,
                      background: '#fff',
                      color: '#f59e0b',
                      cursor: updating === selectedOrder.id ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {updating === selectedOrder.id ? 'Archiving...' : 'Archive Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div
            onClick={() => setRejectModal(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            background: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            padding: 24,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#1a3c34' }}>Reject Order</h3>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>Select a reason for rejection:</p>

            {/* Quick Options */}
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {REJECTION_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setRejectModal(prev => prev ? { ...prev, reason, customReason: '' } : null)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 13,
                    border: `1px solid ${rejectModal.reason === reason ? '#dc2626' : '#e5e7eb'}`,
                    background: rejectModal.reason === reason ? '#fef2f2' : '#fff',
                    color: rejectModal.reason === reason ? '#991b1b' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderRadius: 6,
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Custom Reason */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Or enter custom reason:</label>
              <textarea
                value={rejectModal.customReason}
                onChange={e => setRejectModal(prev => prev ? { ...prev, customReason: e.target.value, reason: '' } : null)}
                placeholder="Type rejection reason..."
                rows={3}
                style={{ width: '100%', padding: 10, fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRejectModal(null)}
                style={{ padding: '8px 20px', fontSize: 13, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', borderRadius: 6 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finalReason = rejectModal.reason || rejectModal.customReason
                  if (finalReason) {
                    updateStatus(rejectModal.orderId, 'rejected', finalReason)
                  }
                }}
                disabled={!rejectModal.reason && !rejectModal.customReason}
                style={{
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  background: rejectModal.reason || rejectModal.customReason ? '#dc2626' : '#ccc',
                  color: '#fff',
                  cursor: rejectModal.reason || rejectModal.customReason ? 'pointer' : 'not-allowed',
                  borderRadius: 6,
                }}
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const filterButtonStyle: React.CSSProperties = {
  padding: '6px 16px',
  fontSize: 12,
  fontWeight: 500,
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
}
