import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, notFound, unauthorized } from '@/lib/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession()
    if (!session) {
      return unauthorized('Not authenticated')
    }

    const { id } = await params

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      return notFound('Order not found')
    }

    return success(order)
  } catch (err) {
    console.error('[Get Order Error]', err)
    return notFound('Order not found')
  }
}
