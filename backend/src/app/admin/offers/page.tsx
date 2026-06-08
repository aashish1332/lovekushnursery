'use client'

import { useState, useEffect, FormEvent } from 'react'
import { inputStyle, btnPrimary, btnDanger, btnSecondary, messageStyle, modalOverlay, modalContent } from '@/lib/admin-styles'

interface Offer {
  id: string; title: string; description: string; discount: string
  imageUrl: string | null; code: string | null; validFrom: string | null
  validUntil: string | null; active: boolean
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', discount: '', code: '', validFrom: '', validUntil: '', active: true })

  const load = async () => {
    setLoading(true)
    try { const res = await fetch(`/api/offers?_t=${Date.now()}`, { cache: 'no-store' }); const data = await res.json(); setOffers(data.data || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setFormData({ title: '', description: '', discount: '', code: '', validFrom: '', validUntil: '', active: true })
    setImageFile(null); setPreview(null); setEditingId(null); setShowForm(false); setMessage(null)
  }

  const handleEdit = (offer: Offer) => {
    setFormData({ title: offer.title, description: offer.description, discount: offer.discount, code: offer.code || '', validFrom: offer.validFrom?.split('T')[0] || '', validUntil: offer.validUntil?.split('T')[0] || '', active: offer.active })
    setPreview(offer.imageUrl); setEditingId(offer.id); setShowForm(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const body = new FormData()
      Object.entries(formData).forEach(([k, v]) => { if (k !== 'image') body.append(k, String(v)) })
      if (imageFile) body.append('image', imageFile)
      const url = editingId ? `/api/offers/${editingId}` : '/api/offers'
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', body })
      const data = await res.json()
      if (data.success) { setMessage({ type: 'success', text: 'Saved!' }); resetForm(); load() }
      else { setMessage({ type: 'error', text: data.error || 'Failed' }) }
    } catch { setMessage({ type: 'error', text: 'Network error' }) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return
    await fetch(`/api/offers/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Offers & Deals</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={btnPrimary}>+ Add Offer</button>
      </div>

      {message && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>{message.text}</div>}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editingId ? 'Edit Offer' : 'Add Offer'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Offer Image</label>
                <div style={{ border: '2px dashed #ddd', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('offer-img')?.click()}>
                  {preview ? <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }} /> : <span style={{ fontSize: 32 }}>🏷️</span>}
                </div>
                <input id="offer-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)) } }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Title *</label><input style={inputStyle} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Discount *</label><input style={inputStyle} value={formData.discount} onChange={e => setFormData(p => ({ ...p, discount: e.target.value }))} required placeholder="20% OFF" /></div>
              </div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description *</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Coupon Code</label><input style={inputStyle} value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="GREEN20" /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Valid From</label><input style={inputStyle} type="date" value={formData.validFrom} onChange={e => setFormData(p => ({ ...p, validFrom: e.target.value }))} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Valid Until</label><input style={inputStyle} type="date" value={formData.validUntil} onChange={e => setFormData(p => ({ ...p, validUntil: e.target.value }))} /></div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={formData.active} onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))} /> Active</label>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save Offer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading...</p> : offers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5' }}><span style={{ fontSize: 48 }}>🏷️</span><p style={{ fontSize: 16, color: '#666', marginTop: 12 }}>No offers yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {offers.map(offer => (
            <div key={offer.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{offer.title}</h4>
                <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: '#c4a265', color: '#fff' }}>{offer.discount}</span>
              </div>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{offer.description}</p>
              {offer.code && <p style={{ fontSize: 13, color: '#1a3c34', margin: '0 0 8px', fontWeight: 600 }}>Code: {offer.code}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => handleEdit(offer)} style={btnSecondary}>Edit</button>
                <button onClick={() => handleDelete(offer.id)} style={btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
