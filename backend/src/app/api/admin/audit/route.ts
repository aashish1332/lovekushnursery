import { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const { searchParams } = request.nextUrl
    const entity = searchParams.get('entity') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    if (entity) where.entity = entity

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return success(logs)
  } catch (err) {
    console.error('[Audit Logs Error]', err)
    return success([])
  }
}
