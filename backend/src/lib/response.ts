import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ── API Response Helpers ────────────────────────────────────

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function error(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function notFound(message = 'Resource not found') {
  return error(message, 404)
}

export function badRequest(message = 'Bad request', details?: unknown) {
  return error(message, 400, details)
}

export function unauthorized(message = 'Unauthorized') {
  return error(message, 401)
}

export function validationError(err: ZodError) {
  return error('Validation failed', 400, err.flatten().fieldErrors)
}

export function handleApiError(err: unknown): NextResponse {
  console.error('[API Error]', err)

  if (err instanceof ZodError) {
    return validationError(err)
  }

  if (err instanceof Error) {
    // Known error types
    if (err.message.includes('GITHUB_TOKEN')) {
      return error('Server configuration error: GitHub not configured', 500)
    }
    if (err.message.includes('DATABASE_URL')) {
      return error('Server configuration error: Database not configured', 500)
    }
    if (err.message.includes('Invalid image')) {
      return error(err.message, 400)
    }
    if (err.message.includes('Unsupported image format')) {
      return error(err.message, 400)
    }
    if (err.message.includes('too large')) {
      return error(err.message, 400)
    }

    return error(err.message, 500)
  }

  return error('An unexpected error occurred', 500)
}
