export const dynamic = 'force-dynamic';
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
      include: { images: { orderBy: { order: 'asc' } } },
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
      include: { images: true },
    })

    if (!existing) {
      return notFound('Plant not found')
    }

    // Parse form data
    const formData = await request.formData()

    // Extract optional fields
    const raw: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'image' && key !== 'images' && key !== 'removeImages') {
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

    // Collect new image files
    const newImageFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if ((key === 'images' || key === 'image') && value instanceof File && value.size > 0) {
        newImageFiles.push(value)
      }
    }

    // Handle removed images (comma-separated IDs)
    const removeImagesRaw = formData.get('removeImages') as string | null
    const removeImageIds = removeImagesRaw ? removeImagesRaw.split(',').filter(Boolean) : []

    // Delete removed images from GitHub
    if (removeImageIds.length > 0) {
      const imagesToRemove = existing.images.filter(img => removeImageIds.includes(img.id))
      for (const img of imagesToRemove) {
        if (img.imageKey) {
          try { await deleteFromGitHub(img.imageKey) } catch (err) {
            console.warn(`Failed to delete image from GitHub: ${img.imageKey}`, err)
          }
        }
      }
      await prisma.plantImage.deleteMany({
        where: { id: { in: removeImageIds }, plantId: id },
      })
    }

    // Upload new images
    const newImageResults: { cdnUrl: string; filePath: string }[] = []
    for (const file of newImageFiles) {
      const imageBuffer = Buffer.from(await file.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, {}, metadata)
      const upload = await uploadToGitHub(
        processed.buffer,
        processed.filename,
        `Update plant image: ${existing.name}`
      )
      newImageResults.push({ cdnUrl: upload.cdnUrl, filePath: upload.filePath })
    }

    // If new images uploaded, create PlantImage records
    if (newImageResults.length > 0) {
      const maxOrder = existing.images.length > 0
        ? Math.max(...existing.images.map(img => img.order)) + 1
        : 0

      await prisma.plantImage.createMany({
        data: newImageResults.map((r, i) => ({
          plantId: id,
          imageUrl: r.cdnUrl,
          imageKey: r.filePath,
          order: maxOrder + i,
        })),
      })

      // If this is the first image (no existing images after removals), update primary
      const remainingImages = await prisma.plantImage.findMany({
        where: { plantId: id },
        orderBy: { order: 'asc' },
      })
      if (remainingImages.length > 0) {
        updateData.imageUrl = remainingImages[0].imageUrl
        updateData.imageKey = remainingImages[0].imageKey
      }
    }

    const plant = await prisma.plant.update({
      where: { id },
      data: updateData,
      include: { images: { orderBy: { order: 'asc' } } },
    })

    await logAudit({
      action: 'plant.updated',
      entity: 'plant',
      entityId: plant.id,
      details: { name: plant.name, changes: Object.keys(updateData), newImages: newImageResults.length, removedImages: removeImageIds.length },
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

    // Find the plant with all images
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!plant) {
      return notFound('Plant not found')
    }

    // Delete all images from GitHub (best-effort)
    const allImageKeys = [
      plant.imageKey,
      ...plant.images.map(img => img.imageKey),
    ].filter(Boolean) as string[]

    for (const key of allImageKeys) {
      try {
        await deleteFromGitHub(key)
      } catch (err) {
        console.warn(`Failed to delete image from GitHub: ${key}`, err)
      }
    }

    // Delete from database (cascade deletes PlantImage records)
    await prisma.plant.delete({
      where: { id },
    })

    await logAudit({
      action: 'plant.deleted',
      entity: 'plant',
      entityId: id,
      details: { name: plant.name, imagesDeleted: allImageKeys.length },
      performedBy: 'admin',
    })

    return success({ message: 'Plant deleted successfully' })
  } catch (err) {
    return handleApiError(err)
  }
}
