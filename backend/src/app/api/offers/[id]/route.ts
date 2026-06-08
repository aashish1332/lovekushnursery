import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, notFound, handleApiError } from '@/lib/response'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/github'
import { z } from 'zod'

interface Params { params: { id: string } }

const offerUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(5000).optional(),
  discount: z.string().min(1).max(50).optional(),
  code: z.string().max(50).optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  active: z.coerce.boolean().optional(),
})

// GET /api/offers/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const offer = await prisma.offer.findUnique({ where: { id: params.id } })
    if (!offer) return notFound('Offer not found')
    return success(offer)
  } catch (err) {
    return handleApiError(err)
  }
}

// PUT /api/offers/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const existing = await prisma.offer.findUnique({ where: { id: params.id } })
    if (!existing) return notFound('Offer not found')

    const formData = await request.formData()
    const raw: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') raw[key] = value
    }

    const validated = offerUpdateSchema.parse(raw)

    const updateData: Record<string, any> = {
      ...validated,
      validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
      validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
    }

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, {}, metadata)
      const upload = await uploadToGitHub(processed.buffer, processed.filename, `Offer: ${existing.title}`)

      if (existing.imageKey) {
        try { await deleteFromGitHub(existing.imageKey) } catch {}
      }

      updateData.imageUrl = upload.cdnUrl
      updateData.imageKey = upload.filePath
    }

    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: updateData,
    })

    return success(offer)
  } catch (err) {
    return handleApiError(err)
  }
}

// DELETE /api/offers/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const existing = await prisma.offer.findUnique({ where: { id: params.id } })
    if (!existing) return notFound('Offer not found')

    await prisma.offer.delete({ where: { id: params.id } })

    if (existing.imageKey) {
      try { await deleteFromGitHub(existing.imageKey) } catch {}
    }

    return success({ message: 'Offer deleted' })
  } catch (err) {
    return handleApiError(err)
  }
}
