import { restoreSongFromTrash } from '@/features/trash/trash.service'
import { requireRole } from '@/lib/api/auth-guard'
import { streamTrashOperation } from '../helpers'

/** Moves the target trashed songs back to where they were deleted from. */
export async function POST(request: Request): Promise<Response> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  return streamTrashOperation(request, restoreSongFromTrash, { userId: guard.session.user?.id })
}
