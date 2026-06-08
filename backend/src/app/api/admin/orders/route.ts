import { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized, badRequest } from '@/lib/response'

// ── GET /api/admin/orders ──────────────────────────────────
// List all orders (admin only)

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || undefined
    const showArchived = searchParams.get('archived') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    // Filter out archived by default
    where.archived = showArchived ? true : { not: true }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return success({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('[Admin Get Orders Error]', err)
    return badRequest('Failed to fetch orders')
  }
}
