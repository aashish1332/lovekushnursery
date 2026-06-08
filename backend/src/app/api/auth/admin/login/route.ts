export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import { setAdminSessionCookie } from '@/lib/auth'
import { success, badRequest, unauthorized } from '@/lib/response'

// POST /api/auth/admin/login
// Admin login: validates username/password against env credentials,
// then sets an admin_session cookie.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return badRequest('Username and password are required')
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return unauthorized('Admin login is not configured on the server')
    }

    // Constant-time comparison to avoid timing side-channels
    const usernameMatch = safeEqual(username, adminUsername)
    const passwordMatch = safeEqual(password, adminPassword)

    if (!usernameMatch || !passwordMatch) {
      return unauthorized('Invalid credentials')
    }

    await setAdminSessionCookie(username)
    return success({ username })
  } catch (err) {
    console.error('[Admin Login Error]', err)
    return unauthorized('Login failed')
  }
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  let diff = 0
  for (let i = 0; i < aBuf.length; i++) {
    diff |= aBuf[i] ^ bBuf[i]
  }
  return diff === 0
}
