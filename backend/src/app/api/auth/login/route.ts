import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { setUserSessionCookie } from '@/lib/auth'
import { success, badRequest, unauthorized } from '@/lib/response'

// POST /api/auth/login
// Phone-based login: user provides phone number, we find or create user, set session

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return badRequest('Phone number is required')
    }

    // Validate Indian phone number
    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return badRequest('Invalid Indian phone number. Must be 10 digits starting with 6-9')
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: '', // Will be filled during checkout/profile
        },
      })
    }

    // Set session cookie
    await setUserSessionCookie(user.id)

    const profileComplete = !!(user.name && user.addressLine1 && user.city && user.state && user.pincode)

    return success({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileComplete,
      },
      isNewUser: !user.name,
    })
  } catch (err) {
    console.error('[Login Error]', err)
    return unauthorized('Login failed')
  }
}
