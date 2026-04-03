import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/infrastructure/prisma/dbClient'

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
    const filter = await prisma.savedFilter.findUnique({ where: { id: numericId } })
    if (!filter || filter.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Filter not found' }, { status: 404 })
    }

    await prisma.savedFilter.delete({ where: { id: numericId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting saved filter:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
