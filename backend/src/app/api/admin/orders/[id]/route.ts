import { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, notFound, badRequest, unauthorized } from '@/lib/response'
import { logAudit } from '@/lib/audit'

// ── GET /api/admin/orders/[id] ─────────────────────────────
// Get order details (admin only)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
          },
        },
      },
    })

    if (!order) {
      return notFound('Order not found')
    }

    return success(order)
  } catch (err) {
    console.error('[Admin Get Order Error]', err)
    return notFound('Order not found')
  }
}

// ── PUT /api/admin/orders/[id] ─────────────────────────────
// Update order status (admin only) with audit trail

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const { id } = await params
    const body = await request.json()
    const { status, rejectionReason } = body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected']
    if (!status || !validStatuses.includes(status)) {
      return badRequest(`Status must be one of: ${validStatuses.join(', ')}`)
    }

    // Get current order to log old status
    const currentOrder = await prisma.order.findUnique({ where: { id } })
    if (!currentOrder) {
      return notFound('Order not found')
    }

    // Update order status + rejection reason + create history entry in transaction
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === 'rejected' && rejectionReason ? { rejectionReason } : {}),
        },
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      })

      // Log status change
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          oldStatus: currentOrder.status,
          newStatus: status,
          changedBy: session.username || 'admin',
          reason: status === 'rejected' ? rejectionReason : null,
        },
      })

      return updated
    })

    // Log audit
    await logAudit({
      action: 'order.status_changed',
      entity: 'order',
      entityId: id,
      details: { oldStatus: currentOrder.status, newStatus: status, rejectionReason: rejectionReason || null },
      performedBy: session.username || 'admin',
    })

    return success(order)
  } catch (err) {
    console.error('[Admin Update Order Error]', err)
    return badRequest('Failed to update order')
  }
}
