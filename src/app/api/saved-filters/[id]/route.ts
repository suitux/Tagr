import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteSavedFilter, findSavedFilterById } from '@/features/saved-filters/saved-filters.repository'

interface SuccessResponse {
  success: true
}

interface ErrorResponse {
  success: false
  error: string
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const session = await auth()
  const userId = session?.user.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const numericId = Number(id)
  if (isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid filter ID' }, { status: 400 })
  }

  try {
    const filter = await findSavedFilterById(numericId)
    if (!filter || filter.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Filter not found' }, { status: 404 })
    }

    await deleteSavedFilter(numericId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting saved filter:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
