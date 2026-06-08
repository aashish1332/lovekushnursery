import { getUserSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized, notFound } from '@/lib/response'

export async function GET() {
  try {
    const session = await getUserSession()
    if (!session) {
      return unauthorized('Not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
        createdAt: true,
      },
    })

    if (!user) {
      return notFound('User not found')
    }

    const profileComplete = !!(user.name && user.addressLine1 && user.city && user.state && user.pincode)

    return success({ ...user, profileComplete })
  } catch (err) {
    console.error('[User Me Error]', err)
    return unauthorized('Not authenticated')
  }
}
