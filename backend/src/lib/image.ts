import sharp from 'sharp'

// ── Types ───────────────────────────────────────────────────

interface ProcessedImage {
  buffer: Buffer
  filename: string
  width: number
  height: number
  size: number
}

interface ImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  prefix?: string
}

// ── Constants ───────────────────────────────────────────────

const DEFAULT_MAX_WIDTH = parseInt(process.env.MAX_IMAGE_WIDTH || '1920', 10)
const DEFAULT_MAX_HEIGHT = parseInt(process.env.MAX_IMAGE_HEIGHT || '1080', 10)
const DEFAULT_QUALITY = parseInt(process.env.WEBP_QUALITY || '82', 10)

// ── Image Processing ────────────────────────────────────────

export async function processImage(
  inputBuffer: Buffer,
  options: ImageOptions = {},
  metadata?: sharp.Metadata
): Promise<ProcessedImage> {
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT
  const quality = options.quality ?? DEFAULT_QUALITY
  const prefix = options.prefix ?? 'plants'

  // Reuse metadata if already fetched by validateImage
  const meta = metadata || await sharp(inputBuffer).metadata()
  if (!meta.width || !meta.height) {
    throw new Error('Could not read image dimensions')
  }

  let pipeline = sharp(inputBuffer)

  if (meta.width > maxWidth || meta.height > maxHeight) {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  const processedBuffer = await pipeline
    .webp({ quality, effort: 4, smartSubsample: true })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: processedBuffer.data,
    filename: `${prefix}/${crypto.randomUUID()}.webp`,
    width: processedBuffer.info.width,
    height: processedBuffer.info.height,
    size: processedBuffer.info.size,
  }
}

export async function validateImage(buffer: Buffer): Promise<sharp.Metadata> {
  const metadata = await sharp(buffer).metadata()

  if (!metadata.format) {
    throw new Error('Invalid image file')
  }

  const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'bmp']
  if (!allowedFormats.includes(metadata.format)) {
    throw new Error(
      `Unsupported image format: ${metadata.format}. Allowed: ${allowedFormats.join(', ')}`
    )
  }

  if (buffer.length > 20 * 1024 * 1024) {
    throw new Error('Image file too large (max 20MB)')
  }

  return metadata
}
