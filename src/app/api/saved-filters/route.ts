import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api/auth-guard'
import { prisma } from '@/infrastructure/prisma/dbClient'

interface SavedFilterResponse {
  id: number
  name: string
  filters: string
  createdAt: string
}

interface ListResponse {
  success: true
  filters: SavedFilterResponse[]
}

interface CreateResponse {
  success: true
  filter: SavedFilterResponse
}

interface ErrorResponse {
  success: false
  error: string
}

export async function GET(): Promise<NextResponse<ListResponse | ErrorResponse>> {
  try {
    const filters = await prisma.savedFilter.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      filters: filters.map(f => ({
        ...f,
        createdAt: f.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching saved filters:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request): Promise<NextResponse<CreateResponse | ErrorResponse>> {
  const guard = await requireRole('tagger')
  if (!guard.authorized) return guard.response

  try {
    const body = await request.json()
    const { name, filters } = body as { name?: string; filters?: string }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    if (!filters || typeof filters !== 'string') {
      return NextResponse.json({ success: false, error: 'Filters are required' }, { status: 400 })
    }

    // Validate that filters is valid JSON
    try {
      JSON.parse(filters)
    } catch {
      return NextResponse.json({ success: false, error: 'Filters must be valid JSON' }, { status: 400 })
    }

    const filter = await prisma.savedFilter.create({
      data: { name: name.trim(), filters }
    })

    return NextResponse.json({
      success: true,
      filter: {
        ...filter,
        createdAt: filter.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating saved filter:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
