import { NextRequest } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { unauthorized, badRequest } from '@/lib/response'

function toCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    const format = searchParams.get('format') || 'json'

    if (!type) {
      return badRequest('Export type is required (orders, users, plants, all)')
    }

    const validTypes = ['orders', 'users', 'plants', 'categories', 'all']
    if (!validTypes.includes(type)) {
      return badRequest(`Invalid type. Must be one of: ${validTypes.join(', ')}`)
    }

    const exportData: Record<string, any> = {}
    const timestamp = new Date().toISOString().split('T')[0]

    if (type === 'orders' || type === 'all') {
      const orders = await prisma.order.findMany({
        include: {
          items: true,
          statusHistory: true,
          user: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      exportData.orders = orders.map(o => ({
        id: o.id,
        customerName: o.user?.name || '',
        phone: o.phone,
        addressLine1: o.addressLine1,
        addressLine2: o.addressLine2 || '',
        city: o.city,
        state: o.state,
        pincode: o.pincode,
        totalAmount: o.totalAmount,
        status: o.status,
        rejectionReason: o.rejectionReason || '',
        notes: o.notes || '',
        itemCount: o.items.length,
        items: o.items.map(i => `${i.plantName} (x${i.quantity})`).join('; '),
        statusChanges: o.statusHistory.map(h => `${h.oldStatus || 'created'}→${h.newStatus} by ${h.changedBy} at ${h.createdAt}`).join('; '),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }))
    }

    if (type === 'users' || type === 'all') {
      const users = await prisma.user.findMany({
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
      })
      exportData.users = users.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        addressLine1: u.addressLine1 || '',
        city: u.city || '',
        state: u.state || '',
        pincode: u.pincode || '',
        orderCount: u._count.orders,
        createdAt: u.createdAt,
      }))
    }

    if (type === 'plants' || type === 'all') {
      const plants = await prisma.plant.findMany({
        orderBy: { createdAt: 'desc' },
      })
      exportData.plants = plants.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        offerPrice: p.offerPrice || '',
        category: p.category,
        stockQuantity: p.stockQuantity,
        inStock: p.inStock,
        featured: p.featured,
        tags: p.tags || '',
        createdAt: p.createdAt,
      }))
    }

    if (type === 'categories' || type === 'all') {
      const categories = await prisma.plant.groupBy({
        by: ['category'],
        _count: true,
        _avg: { price: true },
      })
      exportData.categories = categories.map(c => ({
        category: c.category,
        count: c._count,
        averagePrice: c._avg.price?.toFixed(2) || '0',
      }))
    }

    if (format === 'csv') {
      const key = Object.keys(exportData)[0]
      const csv = toCSV(exportData[key] || [])
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_${timestamp}.csv"`,
        },
      })
    }

    // JSON format
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${type}_${timestamp}.json"`,
      },
    })
  } catch (err) {
    console.error('[Export Error]', err)
    return badRequest('Export failed')
  }
}
