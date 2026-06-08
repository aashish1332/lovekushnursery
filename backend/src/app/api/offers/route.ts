export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, created, badRequest, handleApiError } from '@/lib/response'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/github'
import { z } from 'zod'

const offerSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  discount: z.string().min(1).max(50),
  code: z.string().max(50).optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  active: z.coerce.boolean().default(true),
})

// GET /api/offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const offers = await prisma.offer.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { createdAt: 'desc' },
    })

    return success(offers)
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/offers
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const raw: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') raw[key] = value
    }

    const validated = offerSchema.parse(raw)

    let imageUrl: string | null = null
    let imageKey: string | null = null

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, {}, metadata)
      const upload = await uploadToGitHub(processed.buffer, processed.filename, `Offer: ${validated.title}`)
      imageUrl = upload.cdnUrl
      imageKey = upload.filePath
    }

    const offer = await prisma.offer.create({
      data: {
        ...validated,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : null,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
        imageUrl,
        imageKey,
      },
    })

    return created(offer)
  } catch (err) {
    return handleApiError(err)
  }
}
