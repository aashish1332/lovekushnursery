import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { updatePlantSchema, plantIdSchema } from '@/lib/validation'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/github'
import { logAudit } from '@/lib/audit'
import { success, notFound, badRequest, handleApiError } from '@/lib/response'

interface RouteParams {
  params: { id: string }
}

// ── GET /api/plants/[id] ────────────────────────────────────
// Get a single plant by ID.

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = plantIdSchema.parse(params)

    const plant = await prisma.plant.findUnique({
      where: { id },
    })

    if (!plant) {
      return notFound('Plant not found')
    }

    return success(plant)
  } catch (err) {
    return handleApiError(err)
  }
}

// ── PUT /api/plants/[id] ────────────────────────────────────
// Update a plant. Supports partial updates.
// If new image provided: process → upload to GitHub → replace old.

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = plantIdSchema.parse(params)

    // Check plant exists
    const existing = await prisma.plant.findUnique({
      where: { id },
    })

    if (!existing) {
      return notFound('Plant not found')
    }

    // Parse form data
    const formData = await request.formData()

    // Extract optional fields
    const raw: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image') {
        raw[key] = value
      }
    }

    // Parse price as number if present
    if (raw.price !== undefined) {
      raw.price = parseFloat(raw.price as string)
    }

    // Validate text fields
    const validated = updatePlantSchema.parse(raw)

    // Handle image update
    const updateData: Record<string, any> = { ...validated }

    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, {}, metadata)
      const upload = await uploadToGitHub(
        processed.buffer,
        processed.filename,
        `Update plant image: ${existing.name}`
      )

      if (existing.imageKey) {
        try { await deleteFromGitHub(existing.imageKey) } catch (err) {
          console.warn(`Failed to delete old image: ${existing.imageKey}`, err)
        }
      }

      updateData.imageUrl = upload.cdnUrl
      updateData.imageKey = upload.filePath
    }

    const plant = await prisma.plant.update({
      where: { id },
      data: updateData,
    })

    await logAudit({
      action: 'plant.updated',
      entity: 'plant',
      entityId: plant.id,
      details: { name: plant.name, changes: Object.keys(updateData) },
      performedBy: 'admin',
    })

    return success(plant)
  } catch (err) {
    return handleApiError(err)
  }
}

// ── DELETE /api/plants/[id] ─────────────────────────────────
// Delete a plant and its image from GitHub.

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = plantIdSchema.parse(params)

    // Find the plant
    const plant = await prisma.plant.findUnique({
      where: { id },
    })

    if (!plant) {
      return notFound('Plant not found')
    }

    // Delete image from GitHub (best-effort)
    if (plant.imageKey) {
      try {
        await deleteFromGitHub(plant.imageKey)
      } catch (err) {
        console.warn(`Failed to delete image from GitHub: ${plant.imageKey}`, err)
      }
    }

    // Delete from database
    await prisma.plant.delete({
      where: { id },
    })

    await logAudit({
      action: 'plant.deleted',
      entity: 'plant',
      entityId: id,
      details: { name: plant.name },
      performedBy: 'admin',
    })

    return success({ message: 'Plant deleted successfully' })
  } catch (err) {
    return handleApiError(err)
  }
}
