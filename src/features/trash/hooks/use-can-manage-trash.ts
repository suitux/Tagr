'use client'

import { useSession } from 'next-auth/react'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'

/** Deleting songs moves files on disk, so it takes the same role as editing their tags. */
export function useCanManageTrash(): boolean {
  const { data: session } = useSession()
  return hasMinimumRole(session?.user?.role as UserRole, 'tagger')
}
