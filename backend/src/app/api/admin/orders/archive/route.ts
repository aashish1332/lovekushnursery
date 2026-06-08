export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/response'

// POST /api/admin/orders/archive
// Archive or unarchive orders

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const body = await request.json()
    const { orderIds, archived } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return badRequest('Order IDs are required')
    }

    if (typeof archived !== 'boolean') {
      return badRequest('archived must be a boolean')
    }

    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { archived },
    })

    return success({
      message: archived ? `${result.count} orders archived` : `${result.count} orders restored`,
      count: result.count,
    })
  } catch (err) {
    console.error('[Archive Error]', err)
    return badRequest('Failed to archive orders')
  }
}
