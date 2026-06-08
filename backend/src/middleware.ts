import { NextRequest, NextResponse } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/admin/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/google',
  '/api/auth/user/logout',
]

// Paths that require admin authentication
const ADMIN_PREFIXES = ['/admin', '/api/admin']

// Paths that require user authentication
const USER_PREFIXES = ['/api/orders']

// Public API paths (no auth needed)
const PUBLIC_API_PREFIXES = ['/api/plants', '/api/hero', '/api/offers', '/api/settings', '/api/auth/google', '/api/auth/user']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some(p => pathname.startsWith(p))
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some(p => pathname.startsWith(p))
}

function isUserApiPath(pathname: string): boolean {
  return USER_PREFIXES.some(p => pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(request),
    })
  }

  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  const headers = corsHeaders(request)

  headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  // Skip auth for public paths
  if (isPublicPath(pathname)) {
    return response
  }

  // Admin paths require admin_session cookie
  if (isAdminPath(pathname)) {
    // Allow login page without auth
    if (pathname === '/admin/login') {
      return response
    }

    const adminSession = request.cookies.get('admin_session')?.value
    if (!adminSession) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // User API paths require user_session cookie
  if (isUserApiPath(pathname)) {
    // GET requests to /api/plants are public (for frontend)
    if (pathname === '/api/plants' && request.method === 'GET') {
      return response
    }

    // POST to /api/auth/user/logout needs user session
    if (pathname === '/api/auth/user/logout' && request.method === 'POST') {
      const userSession = request.cookies.get('user_session')?.value
      if (!userSession) {
        return NextResponse.json(
          { success: false, error: 'Not authenticated' },
          { status: 401 }
        )
      }
    }
  }

  // Order paths require user_session cookie
  if (isUserApiPath(pathname) && pathname.startsWith('/api/orders')) {
    const userSession = request.cookies.get('user_session')?.value
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Please login to access orders' },
        { status: 401 }
      )
    }
  }

  return response
}

function corsHeaders(request: NextRequest) {
  const headers = new Headers()
  const origin = request.headers.get('origin')

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
  ]

  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', '86400')

  return headers
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
