import type { UserRole } from '@/features/users/domain'

const ROLE_LEVEL: Record<UserRole, number> = { admin: 3, tagger: 2, listener: 1 }

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return (ROLE_LEVEL[userRole] ?? 0) >= ROLE_LEVEL[minimumRole]
}
