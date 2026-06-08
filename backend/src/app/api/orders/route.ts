import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/response'

// ── POST /api/orders ────────────────────────────────────────
// Create a new order

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return unauthorized('Please login to place an order')
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return unauthorized('User not found')
    }

    // Verify profile is complete
    if (!user.addressLine1 || !user.city || !user.state || !user.pincode || !user.name) {
      return badRequest('Please complete your details before placing an order')
    }

    const body = await request.json()
    const { items, notes, offerCode, discountAmount } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return badRequest('Order must contain at least one item')
    }

    // Validate items and calculate total
    let totalAmount = 0
    const orderItems: { plantId: string; plantName: string; plantImage: string; price: number; quantity: number }[] = []

    for (const item of items) {
      if (!item.plantId || !item.quantity || item.quantity < 1) {
        return badRequest('Invalid item in order')
      }

      const plant = await prisma.plant.findUnique({
        where: { id: item.plantId },
      })

      if (!plant) {
        return badRequest(`Plant not found: ${item.plantId}`)
      }

      if (!plant.inStock) {
        return badRequest(`${plant.name} is out of stock`)
      }

      const price = plant.offerPrice && plant.offerPrice < plant.price ? plant.offerPrice : plant.price
      totalAmount += price * item.quantity

      orderItems.push({
        plantId: plant.id,
        plantName: plant.name,
        plantImage: plant.imageUrl,
        price,
        quantity: item.quantity,
      })
    }

    // Validate and apply coupon if provided
    let finalDiscount = 0
    let appliedOfferCode: string | null = null

    if (offerCode && typeof offerCode === 'string') {
      const offer = await prisma.offer.findFirst({
        where: {
          code: offerCode.trim(),
          active: true,
        },
      })

      if (offer) {
        const now = new Date()
        const isValid = (!offer.validFrom || now >= offer.validFrom) && (!offer.validUntil || now <= offer.validUntil)

        if (isValid) {
          const discountStr = offer.discount.trim()
          const percentMatch = discountStr.match(/(\d+)\s*%/)
          const fixedMatch = discountStr.match(/₹?\s*(\d+)/)

          if (percentMatch) {
            finalDiscount = Math.round(totalAmount * parseInt(percentMatch[1]) / 100)
          } else if (fixedMatch) {
            finalDiscount = Math.min(parseInt(fixedMatch[1]), totalAmount)
          }

          appliedOfferCode = offer.code
        }
      }
    }

    // Use client-sent discount as fallback (but cap at calculated amount)
    if (finalDiscount === 0 && discountAmount && typeof discountAmount === 'number' && discountAmount > 0) {
      finalDiscount = Math.min(discountAmount, totalAmount)
    }

    const finalAmount = Math.max(0, totalAmount - finalDiscount)

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          phone: user.phone,
          addressLine1: user.addressLine1!,
          addressLine2: user.addressLine2,
          city: user.city!,
          state: user.state!,
          pincode: user.pincode!,
          country: user.country || 'India',
          totalAmount: finalAmount,
          discountAmount: finalDiscount,
          offerCode: appliedOfferCode,
          notes: (notes as string) || null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      })

      return newOrder
    })

    return success(order)
  } catch (err) {
    console.error('[Create Order Error]', err)
    return badRequest('Failed to create order')
  }
}

// ── GET /api/orders ─────────────────────────────────────────
// Get current user's orders

export async function GET() {
  try {
    const session = await getUserSession()
    if (!session) {
      return unauthorized('Not authenticated')
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return success(orders)
  } catch (err) {
    console.error('[Get Orders Error]', err)
    return badRequest('Failed to fetch orders')
  }
}
