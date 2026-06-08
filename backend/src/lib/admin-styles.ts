import { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8,
  fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

export const btnPrimary: CSSProperties = {
  padding: '10px 20px', background: '#1a3c34', color: '#f9f5ef', border: 'none',
  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
}

export const btnDanger: CSSProperties = {
  padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none',
  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
}

export const btnSecondary: CSSProperties = {
  padding: '8px 16px', background: '#e5e5e5', color: '#333', border: 'none',
  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
}

export const cardStyle: CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e5e5',
}

export const messageStyle = (type: 'success' | 'error'): CSSProperties => ({
  padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14,
  background: type === 'success' ? '#d4edda' : '#f8d7da',
  color: type === 'success' ? '#155724' : '#721c24',
})

export const modalOverlay: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
}

export const modalContent: CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '100%',
  maxHeight: '90vh', overflow: 'auto',
}
