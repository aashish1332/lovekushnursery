export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, badRequest } from '@/lib/response'

// POST /api/offers/validate
// Validate a coupon code and return discount info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return badRequest('Coupon code is required')
    }

    const offer = await prisma.offer.findFirst({
      where: {
        code: code.trim(),
        active: true,
      },
    })

    if (!offer) {
      return badRequest('Invalid coupon code')
    }

    // Check date validity
    const now = new Date()
    if (offer.validFrom && now < offer.validFrom) {
      return badRequest('This coupon is not yet valid')
    }
    if (offer.validUntil && now > offer.validUntil) {
      return badRequest('This coupon has expired')
    }

    // Parse discount value
    const discountStr = offer.discount.trim()
    let discountType: 'percent' | 'fixed' = 'percent'
    let discountValue = 0

    const percentMatch = discountStr.match(/(\d+)\s*%/)
    const fixedMatch = discountStr.match(/₹?\s*(\d+)/)

    if (percentMatch) {
      discountType = 'percent'
      discountValue = parseInt(percentMatch[1])
    } else if (fixedMatch) {
      discountType = 'fixed'
      discountValue = parseInt(fixedMatch[1])
    }

    return success({
      id: offer.id,
      title: offer.title,
      code: offer.code,
      discount: offer.discount,
      discountType,
      discountValue,
      description: offer.description,
    })
  } catch (err) {
    console.error('[Validate Coupon Error]', err)
    return badRequest('Failed to validate coupon')
  }
}
