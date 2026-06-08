const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3001')

/** Build a fetch URL that works whether API_BASE is a full origin (prod)
 *  or an empty string (dev, where Vite proxies /api to the backend).
 *  Avoids `new URL()` which throws on relative paths. */
function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const qs = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  // Ensure exactly one slash between base and path.
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}${qs}`
}

export interface Plant {
  id: string
  name: string
  price: number
  offerPrice: number | null
  category: string
  description: string
  howToPlant: string
  imageUrl: string
  imageKey: string | null
  featured: boolean
  inStock: boolean
  stockQuantity: number
  lightRequirement: string | null
  waterFrequency: string | null
  size: string | null
  temperature: string | null
  tags: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PlantsResponse {
  plants: Plant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function fetchPlants(params?: {
  category?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}): Promise<PlantsResponse> {
  const url = buildUrl('/api/plants', params as Record<string, string | number | undefined>)

  const res = await fetch(url)
  const data: ApiResponse<PlantsResponse> = await res.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch plants')
  }

  return data.data
}
