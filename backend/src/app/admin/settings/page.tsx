'use client'

import { useState, useEffect, FormEvent } from 'react'
import { inputStyle, btnPrimary, messageStyle } from '@/lib/admin-styles'

interface Settings {
  nurseryName: string; tagline: string; email: string; phone: string; altPhone: string | null
  address: string; openHours: string; instagram: string | null; facebook: string | null
  twitter: string | null; youtube: string | null; whatsapp: string | null
  googleRating: number | null; totalReviews: number | null
  latitude: number | null; longitude: number | null
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    nurseryName: '', tagline: '', email: '', phone: '', altPhone: '', address: '',
    openHours: '', instagram: '', facebook: '', twitter: '', youtube: '', whatsapp: '',
    googleRating: 4.9, totalReviews: 2000, latitude: null, longitude: null,
  })
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
      if (data.success) setMessage({ type: 'success', text: 'Settings saved!' })
      else setMessage({ type: 'error', text: data.error || 'Failed' })
    } catch { setMessage({ type: 'error', text: 'Network error' }) } finally { setSaving(false) }
  }

  if (loading) return <p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading settings...</p>

  const sectionTitle = (title: string) => <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '24px 0 12px', paddingBottom: 8, borderBottom: '1px solid #e5e5e5' }}>{title}</h3>

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>Site Settings</h2>

      {message && <div style={messageStyle(message.type)}>{message.text}</div>}

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e5e5e5', maxWidth: 700 }}>
        {sectionTitle('Business Info')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nursery Name</label><input style={inputStyle} value={form.nurseryName} onChange={e => setForm(p => ({ ...p, nurseryName: e.target.value }))} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tagline</label><input style={inputStyle} value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Address</label><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Latitude</label><input style={inputStyle} type="number" step="any" value={form.latitude ?? ''} onChange={e => setForm(p => ({ ...p, latitude: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Longitude</label><input style={inputStyle} type="number" step="any" value={form.longitude ?? ''} onChange={e => setForm(p => ({ ...p, longitude: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
          </div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Opening Hours</label><input style={inputStyle} value={form.openHours} onChange={e => setForm(p => ({ ...p, openHours: e.target.value }))} /></div>
        </div>

        {sectionTitle('Contact')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Alt Phone</label><input style={inputStyle} value={form.altPhone ?? ''} onChange={e => setForm(p => ({ ...p, altPhone: e.target.value || null }))} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>WhatsApp</label><input style={inputStyle} value={form.whatsapp ?? ''} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value || null }))} /></div>
          </div>
        </div>

        {sectionTitle('Social Media')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Instagram</label><input style={inputStyle} value={form.instagram ?? ''} onChange={e => setForm(p => ({ ...p, instagram: e.target.value || null }))} placeholder="https://instagram.com/..." /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Facebook</label><input style={inputStyle} value={form.facebook ?? ''} onChange={e => setForm(p => ({ ...p, facebook: e.target.value || null }))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Twitter</label><input style={inputStyle} value={form.twitter ?? ''} onChange={e => setForm(p => ({ ...p, twitter: e.target.value || null }))} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>YouTube</label><input style={inputStyle} value={form.youtube ?? ''} onChange={e => setForm(p => ({ ...p, youtube: e.target.value || null }))} /></div>
          </div>
        </div>

        {sectionTitle('Reputation')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Google Rating</label><input style={inputStyle} type="number" step="0.1" min="0" max="5" value={form.googleRating ?? ''} onChange={e => setForm(p => ({ ...p, googleRating: e.target.value ? parseFloat(e.target.value) : null }))} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Total Reviews</label><input style={inputStyle} type="number" value={form.totalReviews ?? ''} onChange={e => setForm(p => ({ ...p, totalReviews: e.target.value ? parseInt(e.target.value) : null }))} /></div>
        </div>

        <div style={{ marginTop: 28 }}>
          <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </form>
    </div>
  )
}
