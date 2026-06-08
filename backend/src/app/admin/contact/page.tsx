'use client'

import { useState, useEffect, FormEvent } from 'react'
import { inputStyle, btnPrimary, cardStyle, messageStyle } from '@/lib/admin-styles'

interface Settings {
  email: string; phone: string; altPhone: string | null; address: string
  openHours: string; whatsapp: string | null; latitude: number | null; longitude: number | null
  instagram: string | null; facebook: string | null; twitter: string | null; youtube: string | null
}

export default function ContactPage() {
  const [form, setForm] = useState<Settings>({ email: '', phone: '', altPhone: '', address: '', openHours: '', whatsapp: '', latitude: null, longitude: null, instagram: '', facebook: '', twitter: '', youtube: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success) setForm(data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(null)
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) setMessage({ type: 'success', text: 'Contact info saved!' })
      else setMessage({ type: 'error', text: data.error || 'Failed' })
    } catch { setMessage({ type: 'error', text: 'Network error' }) } finally { setSaving(false) }
  }

  if (loading) return <p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading...</p>

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>Contact Information</h2>

      {message && <div style={messageStyle(message.type)}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        {/* Current values preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={cardStyle}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📧</span>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Email</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '4px 0 0' }}>{form.email || '—'}</p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📞</span>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Phone</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '4px 0 0' }}>{form.phone || '—'}</p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📍</span>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Address</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '4px 0 0' }}>{form.address || '—'}</p>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>⏰</span>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Hours</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '4px 0 0' }}>{form.openHours || '—'}</p>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e5e5e5', maxWidth: 700 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', marginBottom: 16 }}>Edit Contact Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Alt Phone</label><input style={inputStyle} value={form.altPhone ?? ''} onChange={e => setForm(p => ({ ...p, altPhone: e.target.value || null }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>WhatsApp</label><input style={inputStyle} value={form.whatsapp ?? ''} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value || null }))} /></div>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Address</label><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Opening Hours</label><input style={inputStyle} value={form.openHours} onChange={e => setForm(p => ({ ...p, openHours: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Latitude</label><input style={inputStyle} type="number" step="any" value={form.latitude ?? ''} onChange={e => setForm(p => ({ ...p, latitude: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Longitude</label><input style={inputStyle} type="number" step="any" value={form.longitude ?? ''} onChange={e => setForm(p => ({ ...p, longitude: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '8px 0 0' }}>Social Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Instagram</label><input style={inputStyle} value={form.instagram ?? ''} onChange={e => setForm(p => ({ ...p, instagram: e.target.value || null }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Facebook</label><input style={inputStyle} value={form.facebook ?? ''} onChange={e => setForm(p => ({ ...p, facebook: e.target.value || null }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Twitter</label><input style={inputStyle} value={form.twitter ?? ''} onChange={e => setForm(p => ({ ...p, twitter: e.target.value || null }))} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>YouTube</label><input style={inputStyle} value={form.youtube ?? ''} onChange={e => setForm(p => ({ ...p, youtube: e.target.value || null }))} /></div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save Contact Info'}</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
