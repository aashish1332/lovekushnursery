export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth'
import { success, unauthorized } from '@/lib/response'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return unauthorized('Not authenticated')
  }
  return success({ username: session.username })
}
