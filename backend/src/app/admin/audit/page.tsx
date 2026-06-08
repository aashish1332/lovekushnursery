'use client'

import { useState, useEffect } from 'react'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  details: string | null
  performedBy: string
  createdAt: string
}

const ACTION_LABELS: Record<string, string> = {
  'plant.created': 'Plant Created',
  'plant.updated': 'Plant Updated',
  'plant.deleted': 'Plant Deleted',
  'order.status_changed': 'Order Status Changed',
}

const ENTITY_COLORS: Record<string, { bg: string; text: string }> = {
  plant: { bg: '#d1fae5', text: '#065f46' },
  order: { bg: '#dbeafe', text: '#1e40af' },
  user: { bg: '#ede9fe', text: '#5b21b6' },
  settings: { bg: '#fef3c7', text: '#92400e' },
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadLogs()
  }, [filter])

  async function loadLogs() {
    setLoading(true)
    try {
      const url = filter ? `/api/admin/audit?entity=${filter}` : '/api/admin/audit'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setLogs(data.data)
    } catch (e) {
      console.error('Failed to load audit logs', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Audit Logs</h2>
        <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>Track all important actions</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'plant', 'order', 'user', 'settings'].map(entity => (
          <button
            key={entity}
            onClick={() => setFilter(entity)}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid #e5e5e5',
              borderRadius: 6,
              cursor: 'pointer',
              background: filter === entity ? '#1a3c34' : '#fff',
              color: filter === entity ? '#fff' : '#666',
              borderColor: filter === entity ? '#1a3c34' : '#e5e5e5',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >
            {entity || 'All'}
          </button>
        ))}
      </div>

      {/* Logs */}
      {loading ? (
        <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5' }}>
          <span style={{ fontSize: 48 }}>📋</span>
          <p style={{ fontSize: 16, color: '#666', marginTop: 12 }}>No audit logs yet</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Entity</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>By</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const colors = ENTITY_COLORS[log.entity] || { bg: '#f3f4f6', text: '#374151' }
                let details = ''
                if (log.details) {
                  try {
                    const parsed = JSON.parse(log.details)
                    details = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ')
                  } catch {
                    details = log.details
                  }
                }
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1a1a1a' }}>
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: colors.bg,
                        color: colors.text,
                        textTransform: 'capitalize',
                      }}>
                        {log.entity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {details || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{log.performedBy}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#999', fontSize: 12 }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
