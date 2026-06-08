import { z } from 'zod'

// ── Plant Validation Schemas ────────────────────────────────

export const createPlantSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be under 255 characters')
    .trim(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999, 'Price is too high'),
  category: z
    .enum(['indoor', 'outdoor', 'flowering', 'succulents', 'rare', 'herbs', 'trees'], {
      errorMap: () => ({
        message: 'Category must be one of: indoor, outdoor, flowering, succulents, rare, herbs, trees',
      }),
    }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be under 5000 characters')
    .trim(),
  howToPlant: z
    .string()
    .min(1, 'How to plant instructions are required')
    .max(10000, 'How to plant must be under 10000 characters')
    .trim(),
})

export const updatePlantSchema = createPlantSchema.partial().extend({
  imageUrl: z.string().url().optional(),
  imageKey: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  offerPrice: z.coerce.number().positive().nullable().optional(),
  lightRequirement: z.string().max(100).nullable().optional(),
  waterFrequency: z.string().max(100).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
  temperature: z.string().max(50).nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
})

export const plantIdSchema = z.object({
  id: z.string().uuid('Invalid plant ID format'),
})

// ── Query Params ────────────────────────────────────────────

export const plantQuerySchema = z.object({
  category: z
    .enum(['indoor', 'outdoor', 'flowering', 'succulents', 'rare', 'herbs', 'trees'])
    .optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  sortBy: z
    .enum(['name', 'price', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ── Types (inferred from schemas) ───────────────────────────

export type CreatePlantInput = z.infer<typeof createPlantSchema>
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>
export type PlantQueryParams = z.infer<typeof plantQuerySchema>
