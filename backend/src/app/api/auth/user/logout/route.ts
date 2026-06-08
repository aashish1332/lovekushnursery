export const dynamic = 'force-dynamic';
import { clearUserSessionCookie } from '@/lib/auth'
import { success } from '@/lib/response'

export async function POST() {
  await clearUserSessionCookie()
  return success({ message: 'Logged out' })
}
