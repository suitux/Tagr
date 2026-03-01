import { NextResponse } from 'next/server'
import { getDistinctValues } from '@/features/metadata/metadata-scan.service'
import { SELECT_SONG_FIELDS, type SongSortField } from '@/features/songs/domain'
import { getSearchParam } from '@/lib/api/search-params'

interface DistinctResponse {
  values: string[]
}

interface ErrorResponse {
  error: string
}

export async function GET(request: Request): Promise<NextResponse<DistinctResponse | ErrorResponse>> {
  const { searchParams } = new URL(request.url)
  const field = getSearchParam(searchParams, 'field', 'string') as SongSortField | undefined

  if (!field || !SELECT_SONG_FIELDS.has(field)) {
    return NextResponse.json({ error: 'Invalid or missing field parameter' }, { status: 400 })
  }

  try {
    const values = await getDistinctValues(field)
    return NextResponse.json({ values })
  } catch (error) {
    console.error('Error fetching distinct values:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
