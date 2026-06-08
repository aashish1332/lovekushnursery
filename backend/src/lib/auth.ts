import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_SESSION_COOKIE = 'admin_session'
const USER_SESSION_COOKIE = 'user_session'
const SESSION_SECRET = process.env.ADMIN_PASSWORD || 'lovekush-fallback-secret'
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

// ── Token helpers ─────────────────────────────────────────

export function createSessionToken(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify({ ...payload, createdAt: Date.now() })).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url')
  return `${data}.${signature}`
}

export function verifySessionToken(token: string): Record<string, unknown> | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null

    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url')

    if (signature !== expected) return null

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())

    // Check expiry
    if (Date.now() - payload.createdAt > SESSION_MAX_AGE * 1000) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

// ── Admin session ─────────────────────────────────────────

export async function setAdminSessionCookie(username: string) {
  const token = createSessionToken({ username })
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getAdminSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || typeof payload.username !== 'string') return null
  return { username: payload.username }
}

// ── User session ──────────────────────────────────────────

export async function setUserSessionCookie(userId: string) {
  const token = createSessionToken({ userId })
  const cookieStore = await cookies()
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearUserSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(USER_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getUserSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || typeof payload.userId !== 'string') return null
  return { userId: payload.userId }
}
