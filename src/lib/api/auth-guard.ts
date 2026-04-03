import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'

export async function requireRole(minimumRole: UserRole) {
  const session = await auth()

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ success: false as const, error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!hasMinimumRole(session.user.role, minimumRole)) {
    return {
      authorized: false,
      response: NextResponse.json({ success: false as const, error: 'Forbidden' }, { status: 403 })
    }
  }

  return {
    authorized: true,
    session
  }
}
