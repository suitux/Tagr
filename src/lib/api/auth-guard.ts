import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserRole } from '@/features/users/domain'

const ROLE_LEVEL: Record<UserRole, number> = { admin: 3, tagger: 2, listener: 1 }

export async function requireRole(minimumRole: UserRole) {
  const session = await auth()

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ success: false as const, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const userLevel = ROLE_LEVEL[session.user.role as UserRole] ?? 0
  const requiredLevel = ROLE_LEVEL[minimumRole]

  if (userLevel < requiredLevel) {
    return {
      authorized: false as const,
      response: NextResponse.json({ success: false as const, error: 'Forbidden' }, { status: 403 })
    }
  }

  return { authorized: true as const, session }
}
