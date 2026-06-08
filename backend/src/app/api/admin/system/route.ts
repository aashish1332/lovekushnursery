export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/response'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) {
      return unauthorized('Admin access required')
    }

    // Check database connection
    let connected = false
    try {
      await prisma.$queryRaw`SELECT 1`
      connected = true
    } catch {
      connected = false
    }

    // Get counts
    const [plantCount, orderCount, userCount, heroCount, offerCount] = await Promise.all([
      prisma.plant.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.heroSlide.count(),
      prisma.offer.count(),
    ])

    // Parse host from DATABASE_URL (without revealing credentials)
    const dbUrl = process.env.DATABASE_URL || ''
    let host = 'unknown'
    try {
      const match = dbUrl.match(/@([^:]+):\d+/)
      if (match) host = match[1]
    } catch {}

    // Estimate database storage based on row counts (rough estimates per row)
    const estimatedBytes =
      plantCount * 5000 +      // ~5KB per plant (with description, images metadata)
      orderCount * 2000 +      // ~2KB per order
      userCount * 500 +        // ~500B per user
      heroCount * 3000 +       // ~3KB per hero slide
      offerCount * 1000        // ~1KB per offer

    const usedMB = (estimatedBytes / (1024 * 1024)).toFixed(1)
    const totalMB = 5120 // 5GB TiDB Cloud free tier
    const usagePercent = Math.min(100, (estimatedBytes / (totalMB * 1024 * 1024)) * 100)

    // GitHub image storage info
    const githubOwner = process.env.GITHUB_OWNER || ''
    const githubRepo = process.env.GITHUB_REPO || ''
    let github = {
      owner: githubOwner,
      repo: githubRepo,
      imageCount: 0,
      estimatedSizeMB: 0,
      totalLimitMB: 1024, // 1GB GitHub repo soft limit for raw files
      usagePercent: 0,
      connected: false,
      repoUrl: `https://github.com/${githubOwner}/${githubRepo}`,
    }

    if (githubOwner && githubRepo) {
      try {
        // Count plant images
        const plantsWithImages = await prisma.plant.findMany({
          where: { imageUrl: { not: '' } },
          select: { imageUrl: true },
        })

        // Count hero slide images
        const heroWithImages = await prisma.heroSlide.findMany({
          where: { imageUrl: { not: '' } },
          select: { imageUrl: true },
        })

        // Count offer images
        const offerWithImages = await prisma.offer.findMany({
          where: { imageUrl: { not: '' } },
          select: { imageUrl: true },
        })

        const totalImages = plantsWithImages.length + heroWithImages.length + offerWithImages.length

        // Estimate image sizes (avg ~200KB per compressed webp/jpg)
        const estimatedSizeMB = (totalImages * 200) / 1024 // 200KB per image

        github = {
          ...github,
          imageCount: totalImages,
          estimatedSizeMB: parseFloat(estimatedSizeMB.toFixed(2)),
          usagePercent: parseFloat(((estimatedSizeMB / 1024) * 100).toFixed(2)),
          connected: true,
        }
      } catch (err) {
        console.error('[GitHub Storage Error]', err)
      }
    }

    return success({
      database: {
        provider: 'TiDB Cloud',
        type: 'MySQL (MySQL compatible)',
        host,
        connected,
      },
      storage: {
        usedMB: parseFloat(usedMB),
        totalMB,
        usagePercent: parseFloat(usagePercent.toFixed(1)),
        lastUpdated: new Date().toISOString(),
      },
      github,
      counts: {
        plants: plantCount,
        orders: orderCount,
        users: userCount,
        heroSlides: heroCount,
        offers: offerCount,
      },
    })
  } catch (err) {
    console.error('[System Info Error]', err)
    return success({
      database: { provider: 'TiDB Cloud', type: 'MySQL', host: 'unknown', connected: false },
      counts: { plants: 0, orders: 0, users: 0, heroSlides: 0, offers: 0 },
    })
  }
}
