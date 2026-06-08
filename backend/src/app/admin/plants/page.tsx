'use client'

import { useState, useEffect, FormEvent } from 'react'
import { inputStyle, btnPrimary, btnDanger, btnSecondary, messageStyle, modalOverlay, modalContent } from '@/lib/admin-styles'

interface Plant {
  id: string
  name: string
  price: number
  offerPrice: number | null
  category: string
  description: string
  howToPlant: string
  imageUrl: string
  featured: boolean
  inStock: boolean
  stockQuantity: number
  lightRequirement: string | null
  waterFrequency: string | null
  size: string | null
  temperature: string | null
  tags: string | null
  createdAt: string
}

const CATEGORIES = ['indoor', 'outdoor', 'flowering', 'succulents', 'rare', 'herbs', 'trees']

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '', price: '', offerPrice: '', category: 'indoor',
    description: '', howToPlant: '', featured: false, inStock: true, stockQuantity: '0',
    lightRequirement: '', waterFrequency: '', size: '', temperature: '', tags: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const loadPlants = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/plants?limit=50&_t=${Date.now()}`, { cache: 'no-store' })
      const data = await res.json()
      setPlants(data.data?.plants || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadPlants() }, [])

  const resetForm = () => {
    setFormData({ name: '', price: '', offerPrice: '', category: 'indoor', description: '', howToPlant: '', featured: false, inStock: true, stockQuantity: '0', lightRequirement: '', waterFrequency: '', size: '', temperature: '', tags: '' })
    setImageFile(null)
    setPreview(null)
    setEditingId(null)
    setShowForm(false)
    setMessage(null)
  }

  const handleEdit = (plant: Plant) => {
    setFormData({
      name: plant.name, price: String(plant.price), offerPrice: plant.offerPrice ? String(plant.offerPrice) : '',
      category: plant.category, description: plant.description, howToPlant: plant.howToPlant,
      featured: plant.featured, inStock: plant.inStock, stockQuantity: String(plant.stockQuantity ?? 0),
      lightRequirement: plant.lightRequirement || '', waterFrequency: plant.waterFrequency || '',
      size: plant.size || '', temperature: plant.temperature || '', tags: plant.tags || '',
    })
    setPreview(plant.imageUrl)
    setEditingId(plant.id)
    setShowForm(true)
    setMessage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const body = new FormData()
      body.append('name', formData.name)
      body.append('price', formData.price)
      if (formData.offerPrice) body.append('offerPrice', formData.offerPrice)
      body.append('category', formData.category)
      body.append('description', formData.description)
      body.append('howToPlant', formData.howToPlant)
      body.append('featured', String(formData.featured))
      body.append('stockQuantity', formData.stockQuantity)
      body.append('inStock', String(Number(formData.stockQuantity) > 0))
      if (formData.lightRequirement) body.append('lightRequirement', formData.lightRequirement)
      if (formData.waterFrequency) body.append('waterFrequency', formData.waterFrequency)
      if (formData.size) body.append('size', formData.size)
      if (formData.temperature) body.append('temperature', formData.temperature)
      if (formData.tags) body.append('tags', formData.tags)
      if (imageFile) body.append('image', imageFile)

      const url = editingId ? `/api/plants/${editingId}` : '/api/plants'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, { method, body })
      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Plant ${editingId ? 'updated' : 'created'} successfully!` })
        resetForm()
        loadPlants()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await fetch(`/api/plants/${id}`, { method: 'DELETE' })
      loadPlants()
    } catch (e) { console.error(e) }
  }

  const filteredPlants = search.trim()
    ? plants.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : plants

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Plants</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={btnPrimary}>
          + Add Plant
        </button>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search plants by name, category, or description..."
          style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}
          >
            ×
          </button>
        )}
      </div>

      {message && (
        <div style={messageStyle(message.type)}>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, maxWidth: 640 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>
              {editingId ? 'Edit Plant' : 'Add New Plant'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Image Upload */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Plant Image</label>
                <div style={{
                  border: '2px dashed #ddd', borderRadius: 12, padding: 24, textAlign: 'center',
                  background: preview ? '#f9f9f9' : '#fafafa', cursor: 'pointer',
                }} onClick={() => document.getElementById('plant-image')?.click()}>
                  {preview ? (
                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <span style={{ fontSize: 36 }}>📷</span>
                      <p style={{ fontSize: 13, color: '#666', margin: '8px 0 0' }}>Click to upload image</p>
                    </div>
                  )}
                </div>
                <input
                  id="plant-image"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)) }
                  }}
                />
              </div>

              {/* Name + Price row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Plant Name *</label>
                  <input style={inputStyle} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Monstera Deliciosa" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Price (₹) *</label>
                  <input style={inputStyle} type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} required placeholder="1299" />
                </div>
              </div>

              {/* Offer Price + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Offer Price (₹)</label>
                  <input style={inputStyle} type="number" value={formData.offerPrice} onChange={e => setFormData(p => ({ ...p, offerPrice: e.target.value }))} placeholder="Leave empty if no offer" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Category *</label>
                  <select style={inputStyle} value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required placeholder="Brief description of the plant..." />
              </div>

              {/* How to Plant */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, display: 'block' }}>How to Plant *</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={formData.howToPlant} onChange={e => setFormData(p => ({ ...p, howToPlant: e.target.value }))} required placeholder="Step-by-step planting instructions..." />
              </div>

              {/* Care Info */}
              <div style={{ background: '#f8faf8', borderRadius: 8, padding: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1a3c34', marginBottom: 12, display: 'block' }}>Plant Care Info</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Light Requirement</label>
                    <select style={inputStyle} value={formData.lightRequirement} onChange={e => setFormData(p => ({ ...p, lightRequirement: e.target.value }))}>
                      <option value="">Select...</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="Bright Indirect">Bright Indirect</option>
                      <option value="Direct Sunlight">Direct Sunlight</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Water Frequency</label>
                    <select style={inputStyle} value={formData.waterFrequency} onChange={e => setFormData(p => ({ ...p, waterFrequency: e.target.value }))}>
                      <option value="">Select...</option>
                      <option value="Every 3-5 days">Every 3-5 days</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Size</label>
                    <select style={inputStyle} value={formData.size} onChange={e => setFormData(p => ({ ...p, size: e.target.value }))}>
                      <option value="">Select...</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Temperature</label>
                    <input style={inputStyle} value={formData.temperature} onChange={e => setFormData(p => ({ ...p, temperature: e.target.value }))} placeholder="e.g. 15-30°C" />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, display: 'block' }}>Tags (comma-separated)</label>
                  <input style={inputStyle} value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} placeholder="air-purifying, pet-safe, bestseller" />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))} />
                  Featured
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Stock Quantity:</label>
                  <input
                    style={{ ...inputStyle, width: 100 }}
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={e => {
                      const qty = e.target.value
                      setFormData(p => ({ ...p, stockQuantity: qty }))
                    }}
                  />
                  <span style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: Number(formData.stockQuantity) > 0 ? '#d4edda' : '#f8d7da',
                    color: Number(formData.stockQuantity) > 0 ? '#155724' : '#721c24',
                  }}>
                    {Number(formData.stockQuantity) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : editingId ? 'Update Plant' : 'Create Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plants List */}
      {loading ? (
        <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading plants...</p>
      ) : filteredPlants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5' }}>
          <span style={{ fontSize: 48 }}>{search ? '🔍' : '🌱'}</span>
          <p style={{ fontSize: 16, color: '#666', marginTop: 12 }}>{search ? 'No plants match your search' : 'No plants yet. Add your first plant!'}</p>
          {search && <button onClick={() => setSearch('')} style={{ ...btnSecondary, marginTop: 12 }}>Clear Search</button>}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Image</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlants.map(plant => (
                <tr key={plant.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <img src={plant.imageUrl} alt={plant.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1a1a' }}>{plant.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', background: '#f0f5f3', borderRadius: 12, fontSize: 12, color: '#2d6a3f' }}>{plant.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {plant.offerPrice && <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6, fontSize: 12 }}>₹{plant.price}</span>}
                    <span style={{ fontWeight: 700, color: '#c4a265' }}>₹{plant.offerPrice || plant.price}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: (plant.stockQuantity ?? 0) > 0 ? '#d4edda' : '#f8d7da',
                      color: (plant.stockQuantity ?? 0) > 0 ? '#155724' : '#721c24',
                    }}>
                      {(plant.stockQuantity ?? 0) > 0 ? `In Stock (${plant.stockQuantity})` : 'Out of Stock'}
                    </span>
                    {plant.featured && <span style={{ marginLeft: 6, padding: '3px 8px', background: '#fff3cd', borderRadius: 12, fontSize: 11, fontWeight: 600, color: '#856404' }}>★</span>}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(plant)} style={{ ...btnSecondary, marginRight: 8 }}>Edit</button>
                    <button onClick={() => handleDelete(plant.id, plant.name)} style={btnDanger}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
