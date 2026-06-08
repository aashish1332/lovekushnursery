export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/response'

export async function PUT(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return unauthorized('Not authenticated')
    }

    const body = await request.json()
    const { name, addressLine1, addressLine2, city, state, pincode, country } = body

    // Validate required fields
    if (!name || !addressLine1 || !city || !state || !pincode) {
      return badRequest('Name, address, city, state, and pincode are required')
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return badRequest('Invalid pincode. Must be 6 digits')
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        pincode,
        country: country || 'India',
      },
      select: {
        id: true,
        phone: true,
        name: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
      },
    })

    const profileComplete = !!(user.name && user.addressLine1 && user.city && user.state && user.pincode)

    return success({ ...user, profileComplete })
  } catch (err) {
    console.error('[User Profile Error]', err)
    return badRequest('Failed to update profile')
  }
}
