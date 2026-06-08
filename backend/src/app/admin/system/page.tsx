'use client'

import { useState, useEffect } from 'react'

interface SystemInfo {
  database: {
    provider: string
    type: string
    host: string
    connected: boolean
  }
  storage: {
    usedMB: number
    totalMB: number
    usagePercent: number
    lastUpdated: string
  }
  github: {
    owner: string
    repo: string
    imageCount: number
    estimatedSizeMB: number
    totalLimitMB: number
    usagePercent: number
    connected: boolean
    repoUrl: string
  }
  counts: {
    plants: number
    orders: number
    users: number
    heroSlides: number
    offers: number
  }
}

export default function SystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemInfo()
  }, [])

  async function loadSystemInfo() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/system')
      const data = await res.json()
      if (data.success) setInfo(data.data)
    } catch (e) {
      console.error('Failed to load system info', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading system info...</p>
  }

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>System</h2>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px' }}>Database information and system status</p>

      {/* Database Info */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '0 0 16px' }}>Database Information</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <InfoRow label="Provider" value={info?.database.provider || 'TiDB Cloud'} />
          <InfoRow label="Type" value={info?.database.type || 'MySQL (MySQL compatible)'} />
          <InfoRow label="Host" value={info?.database.host || 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com'} />
          <InfoRow
            label="Connection Status"
            value={info?.database.connected ? 'Connected' : 'Disconnected'}
            valueColor={info?.database.connected ? '#16a34a' : '#dc2626'}
          />
        </div>
      </div>

      {/* Storage Monitor */}
      {info?.storage && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '0 0 16px' }}>Storage Usage</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Database Storage</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3c34' }}>
                {info.storage.usedMB} MB / {(info.storage.totalMB / 1024).toFixed(0)} GB
              </span>
            </div>
            <div style={{ width: '100%', height: 12, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${info.storage.usagePercent}%`,
                  height: '100%',
                  background: info.storage.usagePercent > 80 ? '#dc2626' : info.storage.usagePercent > 60 ? '#f59e0b' : '#16a34a',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: '#999' }}>
                {info.storage.usagePercent}% used
              </span>
              <span style={{ fontSize: 11, color: '#999' }}>
                {(info.storage.totalMB / 1024 - info.storage.usedMB / 1024).toFixed(1)} GB remaining
              </span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
            Last updated: {new Date(info.storage.lastUpdated).toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {/* GitHub Image Storage */}
      {info?.github && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a1a1a">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: 0 }}>GitHub Image Storage</h3>
            <span style={{
              padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
              background: info.github.connected ? '#d4edda' : '#f8d7da',
              color: info.github.connected ? '#155724' : '#721c24',
            }}>
              {info.github.connected ? 'Connected' : 'Not Configured'}
            </span>
          </div>

          {info.github.connected ? (
            <>
              {/* Image Storage Bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Image Storage (jsDelivr CDN)</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3c34' }}>
                    {info.github.estimatedSizeMB} MB / {(info.github.totalLimitMB / 1024).toFixed(0)} GB
                  </span>
                </div>
                <div style={{ width: '100%', height: 12, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(0.5, info.github.usagePercent)}%`,
                      height: '100%',
                      background: info.github.usagePercent > 80 ? '#dc2626' : info.github.usagePercent > 60 ? '#f59e0b' : '#238636',
                      borderRadius: 6,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#999' }}>
                    {info.github.usagePercent}% used
                  </span>
                  <span style={{ fontSize: 11, color: '#999' }}>
                    {(info.github.totalLimitMB / 1024 - info.github.estimatedSizeMB / 1024).toFixed(1)} GB remaining
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 14, background: '#f6f8fa', borderRadius: 8, border: '1px solid #e5e5e5' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Repository</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{info.github.owner}/{info.github.repo}</div>
                </div>
                <div style={{ padding: 14, background: '#f6f8fa', borderRadius: 8, border: '1px solid #e5e5e5' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Total Images</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{info.github.imageCount}</div>
                </div>
                <div style={{ padding: 14, background: '#f6f8fa', borderRadius: 8, border: '1px solid #e5e5e5' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Avg Image Size</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>~200 KB</div>
                </div>
                <div style={{ padding: 14, background: '#f6f8fa', borderRadius: 8, border: '1px solid #e5e5e5' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>CDN Provider</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>jsDelivr</div>
                </div>
              </div>

              <a
                href={info.github.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 500,
                }}
              >
                View Repository
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </>
          ) : (
            <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px dashed #d1d5db' }}>
              <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
                Configure <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>GITHUB_OWNER</code>, <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>GITHUB_REPO</code>, and <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>GITHUB_TOKEN</code> environment variables to enable GitHub image storage.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Data Counts */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '0 0 16px' }}>Data Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          <StatCard label="Plants" value={info?.counts.plants ?? 0} icon="🌿" />
          <StatCard label="Orders" value={info?.counts.orders ?? 0} icon="📦" />
          <StatCard label="Users" value={info?.counts.users ?? 0} icon="👤" />
          <StatCard label="Hero Slides" value={info?.counts.heroSlides ?? 0} icon="🖼️" />
          <StatCard label="Offers" value={info?.counts.offers ?? 0} icon="🏷️" />
        </div>
      </div>

      {/* Security Notice */}
      <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '0 0 8px' }}>Security</h3>
        <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
          Database credentials, API tokens, and private keys are stored securely in environment variables and are never displayed in plain text.
        </p>
      </div>

      {/* Data Export */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3c34', margin: '0 0 8px' }}>Data Export</h3>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>Download backup of your data</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ExportButton label="Orders (JSON)" type="orders" format="json" />
          <ExportButton label="Orders (CSV)" type="orders" format="csv" />
          <ExportButton label="Users (JSON)" type="users" format="json" />
          <ExportButton label="Users (CSV)" type="users" format="csv" />
          <ExportButton label="Plants (JSON)" type="plants" format="json" />
          <ExportButton label="Plants (CSV)" type="plants" format="csv" />
          <ExportButton label="All Data (JSON)" type="all" format="json" />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || '#1a1a1a' }}>{value}</span>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3c34' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function ExportButton({ label, type, format }: { label: string; type: string; format: string }) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=${format}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_export.${format === 'csv' ? 'csv' : 'json'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        background: '#fff',
        color: '#374151',
        cursor: exporting ? 'not-allowed' : 'pointer',
        opacity: exporting ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {exporting ? 'Exporting...' : label}
    </button>
  )
}
