'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cardStyle } from '@/lib/admin-styles'

interface Stats {
  totalPlants: number
  totalHeroSlides: number
  totalOffers: number
  totalOrders: number
  categories: { category: string; _count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [plantsRes, heroRes, offersRes, ordersRes] = await Promise.all([
          fetch('/api/plants?limit=1'),
          fetch('/api/hero'),
          fetch('/api/offers'),
          fetch('/api/admin/orders?limit=1'),
        ])
        const plants = await plantsRes.json()
        const hero = await heroRes.json()
        const offers = await offersRes.json()
        const orders = await ordersRes.json()

        setStats({
          totalPlants: plants.data?.pagination?.total || 0,
          totalHeroSlides: hero.data?.length || 0,
          totalOffers: offers.data?.length || 0,
          totalOrders: orders.data?.pagination?.total || 0,
          categories: [],
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const quickLinks = [
    { href: '/admin/plants', label: 'Manage Plants', icon: '🌿', desc: 'Add, edit, delete plants', color: '#2d6a3f' },
    { href: '/admin/orders', label: 'Orders', icon: '📦', desc: 'View & manage orders', color: '#6a2d4c' },
    { href: '/admin/hero', label: 'Hero Slides', icon: '🖼️', desc: 'Homepage hero carousel', color: '#6a4c2d' },
    { href: '/admin/offers', label: 'Offers & Deals', icon: '🏷️', desc: 'Discount codes & promos', color: '#c4a265' },
    { href: '/admin/settings', label: 'Site Settings', icon: '⚙️', desc: 'Name, email, phone, hours', color: '#4a4a4a' },
    { href: '/admin/contact', label: 'Contact Info', icon: '📞', desc: 'Address, map, socials', color: '#2d5a6a' },
  ]

  const statCards = [
    { icon: '🌿', label: 'Total Plants', value: stats?.totalPlants, color: '#2d6a3f', bg: '#f0f5f3' },
    { icon: '📦', label: 'Total Orders', value: stats?.totalOrders, color: '#6a2d4c', bg: '#f5f0f3' },
    { icon: '🖼️', label: 'Hero Slides', value: stats?.totalHeroSlides, color: '#6a4c2d', bg: '#f5f0e8' },
    { icon: '🏷️', label: 'Active Offers', value: stats?.totalOffers, color: '#c4a265', bg: '#faf5e8' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Dashboard</h2>
        <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>Welcome back! Here&apos;s your nursery overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ ...cardStyle, background: card.bg, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{card.label}</span>
                <div style={{ fontSize: 36, fontWeight: 700, color: card.color, marginTop: 4 }}>
                  {loading ? '...' : card.value}
                </div>
              </div>
              <span style={{ fontSize: 40, opacity: 0.3 }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {quickLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              ...cardStyle,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: `3px solid ${link.color}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{link.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1a3c34' }}>{link.label}</span>
            </div>
            <span style={{ fontSize: 13, color: '#666' }}>{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
