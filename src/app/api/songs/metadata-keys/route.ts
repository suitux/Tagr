import { NextResponse } from 'next/server'
import { getDistinctMetadataKeys } from '@/features/metadata/metadata-scan.service'

interface MetadataKeysResponse {
  keys: string[]
}

interface ErrorResponse {
  error: string
}

export async function GET(): Promise<NextResponse<MetadataKeysResponse | ErrorResponse>> {
  try {
    const keys = await getDistinctMetadataKeys()
    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Error fetching metadata keys:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
