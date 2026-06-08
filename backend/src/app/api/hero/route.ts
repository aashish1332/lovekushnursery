export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, created, badRequest, handleApiError } from '@/lib/response'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/github'
import { z } from 'zod'

const heroSlideSchema = z.object({
  title: z.string().min(1).max(255),
  subtitle: z.string().min(1).max(500),
  ctaText: z.string().max(100).default('Explore Collection'),
  ctaLink: z.string().max(255).default('#products'),
  sortOrder: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
})

// GET /api/hero
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return success(slides)
  } catch (err) {
    return handleApiError(err)
  }
}

// POST /api/hero
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const ctaText = formData.get('ctaText') as string || 'Explore Collection'
    const ctaLink = formData.get('ctaLink') as string || '#products'
    const sortOrder = parseInt(formData.get('sortOrder') as string || '0', 10)
    const active = formData.get('active') !== 'false'
    const imageFile = formData.get('image') as File | null

    const validated = heroSlideSchema.parse({ title, subtitle, ctaText, ctaLink, sortOrder, active })

    if (!imageFile || imageFile.size === 0) {
      return badRequest('Image is required for hero slide')
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    const metadata = await validateImage(imageBuffer)
    const processed = await processImage(imageBuffer, { maxWidth: 1920, maxHeight: 1080, quality: 85 }, metadata)
    const upload = await uploadToGitHub(processed.buffer, processed.filename, `Hero slide: ${validated.title}`)

    const slide = await prisma.heroSlide.create({
      data: {
        ...validated,
        imageUrl: upload.cdnUrl,
        imageKey: upload.filePath,
      },
    })

    return created(slide)
  } catch (err) {
    return handleApiError(err)
  }
}
