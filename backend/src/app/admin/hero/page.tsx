'use client'

import { useState, useEffect, FormEvent } from 'react'
import { inputStyle, btnPrimary, btnDanger, btnSecondary, messageStyle, modalOverlay, modalContent } from '@/lib/admin-styles'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  sortOrder: number
  active: boolean
}

export default function HeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', subtitle: '', ctaText: 'Explore Collection', ctaLink: '#products', sortOrder: '0', active: true })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hero?_t=${Date.now()}`, { cache: 'no-store' })
      const data = await res.json()
      setSlides(data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', ctaText: 'Explore Collection', ctaLink: '#products', sortOrder: '0', active: true })
    setImageFile(null); setPreview(null); setEditingId(null); setShowForm(false); setMessage(null)
  }

  const handleEdit = (slide: HeroSlide) => {
    setFormData({ title: slide.title, subtitle: slide.subtitle, ctaText: slide.ctaText, ctaLink: slide.ctaLink, sortOrder: String(slide.sortOrder), active: slide.active })
    setPreview(slide.imageUrl); setEditingId(slide.id); setShowForm(true); setMessage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(null)
    try {
      const body = new FormData()
      body.append('title', formData.title); body.append('subtitle', formData.subtitle)
      body.append('ctaText', formData.ctaText); body.append('ctaLink', formData.ctaLink)
      body.append('sortOrder', formData.sortOrder); body.append('active', String(formData.active))
      if (imageFile) body.append('image', imageFile)

      const url = editingId ? `/api/hero/${editingId}` : '/api/hero'
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', body })
      const data = await res.json()

      if (data.success) { setMessage({ type: 'success', text: `Slide ${editingId ? 'updated' : 'created'}!` }); resetForm(); load() }
      else { setMessage({ type: 'error', text: data.error || 'Failed' }) }
    } catch { setMessage({ type: 'error', text: 'Network error' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return
    await fetch(`/api/hero/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Hero Slides</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={btnPrimary}>+ Add Slide</button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>{editingId ? 'Edit Slide' : 'Add Hero Slide'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Background Image *</label>
                <div style={{ border: '2px dashed #ddd', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('hero-image')?.click()}>
                  {preview ? <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'cover' }} /> : <div><span style={{ fontSize: 36 }}>🖼️</span><p style={{ fontSize: 13, color: '#666' }}>Click to upload</p></div>}
                </div>
                <input id="hero-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)) } }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Title *</label>
                <input style={inputStyle} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required placeholder="Where Nature Meets Elegance" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Subtitle *</label>
                <input style={inputStyle} value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} required placeholder="Premium plants for your space" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>CTA Text</label>
                  <input style={inputStyle} value={formData.ctaText} onChange={e => setFormData(p => ({ ...p, ctaText: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>CTA Link</label>
                  <input style={inputStyle} value={formData.ctaLink} onChange={e => setFormData(p => ({ ...p, ctaLink: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Sort Order</label>
                  <input style={inputStyle} type="number" value={formData.sortOrder} onChange={e => setFormData(p => ({ ...p, sortOrder: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', paddingBottom: 10 }}>
                    <input type="checkbox" checked={formData.active} onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))} /> Active
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading...</p> : slides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5' }}>
          <span style={{ fontSize: 48 }}>🖼️</span>
          <p style={{ fontSize: 16, color: '#666', marginTop: 12 }}>No hero slides yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {slides.map(slide => (
            <div key={slide.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
              <img src={slide.imageUrl} alt={slide.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{slide.title}</h4>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: slide.active ? '#d4edda' : '#f8d7da', color: slide.active ? '#155724' : '#721c24' }}>{slide.active ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{slide.subtitle}</p>
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px' }}>Order: {slide.sortOrder} | CTA: {slide.ctaText}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(slide)} style={btnSecondary}>Edit</button>
                  <button onClick={() => handleDelete(slide.id)} style={btnDanger}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
