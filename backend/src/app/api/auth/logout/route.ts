import { clearAdminSessionCookie } from '@/lib/auth'
import { success } from '@/lib/response'

export async function POST() {
  await clearAdminSessionCookie()
  return success({ message: 'Logged out' })
}
