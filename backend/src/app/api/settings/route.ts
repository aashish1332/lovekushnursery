export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, handleApiError } from '@/lib/response'
import { z } from 'zod'

const settingsSchema = z.object({
  nurseryName: z.string().max(255).optional(),
  tagline: z.string().max(500).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  altPhone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional(),
  mapUrl: z.string().max(500).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  openHours: z.string().max(255).optional(),
  instagram: z.string().max(255).optional().nullable(),
  facebook: z.string().max(255).optional().nullable(),
  twitter: z.string().max(255).optional().nullable(),
  youtube: z.string().max(255).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  googleRating: z.number().optional().nullable(),
  totalReviews: z.number().int().optional().nullable(),
})

// GET /api/settings
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'singleton' },
      })
    }

    return success(settings)
  } catch (err) {
    return handleApiError(err)
  }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = settingsSchema.parse(body)

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: validated,
      create: { id: 'singleton', ...validated },
    })

    return success(settings)
  } catch (err) {
    return handleApiError(err)
  }
}
