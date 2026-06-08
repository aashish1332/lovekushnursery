import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, notFound, badRequest, handleApiError } from '@/lib/response'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/github'
import { z } from 'zod'

interface Params { params: { id: string } }

const heroUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  subtitle: z.string().min(1).max(500).optional(),
  ctaText: z.string().max(100).optional(),
  ctaLink: z.string().max(255).optional(),
  sortOrder: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
})

// GET /api/hero/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const slide = await prisma.heroSlide.findUnique({ where: { id: params.id } })
    if (!slide) return notFound('Hero slide not found')
    return success(slide)
  } catch (err) {
    return handleApiError(err)
  }
}

// PUT /api/hero/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id: params.id } })
    if (!existing) return notFound('Hero slide not found')

    const formData = await request.formData()
    const raw: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') raw[key] = value
    }
    if (raw.sortOrder !== undefined) raw.sortOrder = parseInt(raw.sortOrder, 10)
    if (raw.active !== undefined) raw.active = raw.active !== 'false'

    const validated = heroUpdateSchema.parse(raw)

    const updateData: Record<string, any> = { ...validated }

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, { maxWidth: 1920, maxHeight: 1080, quality: 85 }, metadata)
      const upload = await uploadToGitHub(processed.buffer, processed.filename, `Update hero: ${existing.title}`)

      if (existing.imageKey) {
        try { await deleteFromGitHub(existing.imageKey) } catch {}
      }

      updateData.imageUrl = upload.cdnUrl
      updateData.imageKey = upload.filePath
    }

    const slide = await prisma.heroSlide.update({
      where: { id: params.id },
      data: updateData,
    })

    return success(slide)
  } catch (err) {
    return handleApiError(err)
  }
}

// DELETE /api/hero/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id: params.id } })
    if (!existing) return notFound('Hero slide not found')

    await prisma.heroSlide.delete({ where: { id: params.id } })

    if (existing.imageKey) {
      try { await deleteFromGitHub(existing.imageKey) } catch {}
    }

    return success({ message: 'Hero slide deleted' })
  } catch (err) {
    return handleApiError(err)
  }
}
