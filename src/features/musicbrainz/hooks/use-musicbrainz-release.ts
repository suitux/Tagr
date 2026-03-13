'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { MusicBrainzMappedMetadata, MusicBrainzReleaseDetail } from '@/features/musicbrainz/domain'

interface ReleaseResponse {
  success: true
  release: MusicBrainzReleaseDetail
  mapped: MusicBrainzMappedMetadata
}

async function fetchRelease(releaseId: string, recordingId: string): Promise<ReleaseResponse> {
  const response = await api.get<ReleaseResponse>(`/musicbrainz/release/${releaseId}`, {
    params: { recordingId }
  })

  if (!response.data.success) {
    throw new Error('Failed to fetch release')
  }

  return response.data
}

export function useMusicBrainzRelease(releaseId: string | null, recordingId: string | null) {
  return useQuery({
    queryKey: ['musicbrainz', 'release', releaseId, recordingId],
    queryFn: () => fetchRelease(releaseId!, recordingId!),
    enabled: !!releaseId && !!recordingId
  })
}
