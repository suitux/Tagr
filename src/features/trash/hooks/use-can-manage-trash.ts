'use client'

import { useSession } from 'next-auth/react'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'

/** Deleting and restoring songs moves files on disk, so it takes the same role as editing their tags. */
export function useCanManageTrash(): boolean {
  const { data: session } = useSession()
  return hasMinimumRole(session?.user?.role as UserRole, 'tagger')
}

/** Removing files for good cannot be undone, so only an admin may do it. */
export function useCanPurgeTrash(): boolean {
  const { data: session } = useSession()
  return hasMinimumRole(session?.user?.role as UserRole, 'admin')
}
