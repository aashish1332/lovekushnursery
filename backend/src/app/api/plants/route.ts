export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createPlantSchema, plantQuerySchema } from '@/lib/validation'
import { processImage, validateImage } from '@/lib/image'
import { uploadToGitHub } from '@/lib/github'
import { success, created, badRequest, handleApiError } from '@/lib/response'
import { logAudit } from '@/lib/audit'

// Allow up to 20MB body for image uploads
export const runtime = 'nodejs'

// ── GET /api/plants ─────────────────────────────────────────
// List all plants with filtering, search, pagination, sorting.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse and validate query params
    const query = plantQuerySchema.parse({
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    })

    // Build Prisma where clause
    const where: any = {}

    if (query.category) {
      where.category = query.category
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ]
    }

    // Calculate pagination
    const skip = (query.page - 1) * query.limit

    // Execute queries in parallel
    const [plants, total] = await Promise.all([
      prisma.plant.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: query.limit,
        include: { images: { orderBy: { order: 'asc' } } },
      }),
      prisma.plant.count({ where }),
    ])

    return success({
      plants,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

// ── POST /api/plants ────────────────────────────────────────
// Create a new plant with image upload.
// Flow: validate → parse form → process image → upload to GitHub → save to DB

export async function POST(request: NextRequest) {
  try {
    // 1. Parse multipart form data
    const formData = await request.formData()

    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const offerPrice = formData.get('offerPrice') as string | null
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const howToPlant = formData.get('howToPlant') as string
    const featured = formData.get('featured') === 'true'
    const inStock = formData.get('inStock') !== 'false'
    const stockQuantity = parseInt(formData.get('stockQuantity') as string || '0', 10) || 0
    const lightRequirement = formData.get('lightRequirement') as string | null
    const waterFrequency = formData.get('waterFrequency') as string | null
    const size = formData.get('size') as string | null
    const temperature = formData.get('temperature') as string | null
    const tags = formData.get('tags') as string | null

    // Collect all image files (keyed as 'images' or legacy 'image')
    const imageFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if ((key === 'images' || key === 'image') && value instanceof File && value.size > 0) {
        imageFiles.push(value)
      }
    }

    // 2. Validate text fields
    const validated = createPlantSchema.parse({
      name,
      price,
      category,
      description,
      howToPlant,
    })

    // 3. At least one image required
    if (imageFiles.length === 0) {
      return badRequest('At least one image is required')
    }

    // 4. Process and upload all images
    const imageResults: { cdnUrl: string; filePath: string }[] = []
    for (const file of imageFiles) {
      const imageBuffer = Buffer.from(await file.arrayBuffer())
      const metadata = await validateImage(imageBuffer)
      const processed = await processImage(imageBuffer, {}, metadata)
      const upload = await uploadToGitHub(
        processed.buffer,
        processed.filename,
        `Add plant image: ${validated.name}`
      )
      imageResults.push({ cdnUrl: upload.cdnUrl, filePath: upload.filePath })
    }

    // 5. Save to TiDB Cloud (first image is primary)
    const plant = await prisma.plant.create({
      data: {
        name: validated.name,
        price: validated.price,
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        category: validated.category,
        description: validated.description,
        howToPlant: validated.howToPlant,
        imageUrl: imageResults[0].cdnUrl,
        imageKey: imageResults[0].filePath,
        featured,
        inStock,
        stockQuantity,
        lightRequirement: lightRequirement || null,
        waterFrequency: waterFrequency || null,
        size: size || null,
        temperature: temperature || null,
        tags: tags || null,
        images: {
          create: imageResults.map((r, i) => ({
            imageUrl: r.cdnUrl,
            imageKey: r.filePath,
            order: i,
          })),
        },
      },
      include: { images: true },
    })

    // Log audit
    await logAudit({
      action: 'plant.created',
      entity: 'plant',
      entityId: plant.id,
      details: { name: plant.name, category: plant.category, price: plant.price, imageCount: imageResults.length },
      performedBy: 'admin',
    })

    return created(plant)
  } catch (err) {
    return handleApiError(err)
  }
}
