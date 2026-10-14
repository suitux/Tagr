'use client'

import { incrementEditCount } from '@/components/star-prompt-dialog'
import { invalidateAllHistoryQueryKeys } from '@/features/history/hooks/use-history'
import type { BulkMusicBrainzApplyItem, BulkMusicBrainzSong } from '@/features/musicbrainz/bulk-lookup'
import {
  MUSICBRAINZ_SEARCH_PAGE_SIZE,
  type MusicBrainzReleaseSearchParams,
  type MusicBrainzReleaseSearchResult,
  type MusicBrainzReleaseTrack
} from '@/features/musicbrainz/domain'
import { type BulkTarget } from '@/features/songs/bulk-target'
import { type SongWithMetadata } from '@/features/songs/domain'
import { applySongUpdates, invalidateBulkTargetQueries } from '@/features/songs/hooks/bulk-cache-sync'
import { api } from '@/lib/axios'
import { collectNdjsonBulkResponse, type NdjsonBulkProgress } from '@/lib/ndjson-stream'
import { useBulkSelectionStore } from '@/stores/bulk-selection-store'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** The selected songs; the server resolves "whole folder" or "whole playlist" selections. */
export function useBulkMusicBrainzSongs(target: BulkTarget | null) {
  return useQuery({
    queryKey: ['musicbrainz', 'bulk-songs', target],
    queryFn: async () => {
      const response = await api.post<{ success: true; songs: BulkMusicBrainzSong[] }>(
        '/songs/bulk/musicbrainz/songs',
        {
          target
        }
      )
      return response.data.songs
    },
    enabled: !!target,
    retry: false,
    staleTime: 0,
    gcTime: 0
  })
}

interface ReleaseSearchResponse {
  success: true
  releases: MusicBrainzReleaseSearchResult[]
  count: number
  offset: number
}

export function useMusicBrainzReleaseSearch(params: MusicBrainzReleaseSearchParams) {
  return useInfiniteQuery({
    queryKey: ['musicbrainz', 'release-search', params],
    queryFn: async ({ pageParam }) => {
      const response = await api.get<ReleaseSearchResponse>('/musicbrainz/releases', {
        params: { album: params.album, artist: params.artist, limit: MUSICBRAINZ_SEARCH_PAGE_SIZE, offset: pageParam }
      })
      return response.data
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const seen = lastPage.offset + lastPage.releases.length
      return seen < lastPage.count ? seen : undefined
    },
    enabled: !!params.album?.trim() || !!params.artist?.trim()
  })
}

interface ReleaseTracksResponse {
  success: true
  release: { id: string; title: string; date?: string; country?: string; mediaCount: number }
  tracks: MusicBrainzReleaseTrack[]
}

export function useMusicBrainzReleaseTracks(releaseId: string | null) {
  return useQuery({
    queryKey: ['musicbrainz', 'release-tracks', releaseId],
    queryFn: async () => {
      const response = await api.get<ReleaseTracksResponse>(`/musicbrainz/release/${releaseId}/tracks`)
      return response.data
    },
    enabled: !!releaseId
  })
}

type ApplyResult = { songId: number; ok: true; song: SongWithMetadata } | { songId: number; ok: false; error: string }

export type BulkMusicBrainzProgress = NdjsonBulkProgress<ApplyResult>

interface ApplyParams {
  target: BulkTarget
  items: BulkMusicBrainzApplyItem[]
  coverReleaseId?: string
  onProgress?: (progress: BulkMusicBrainzProgress) => void
}

async function applyBulkMusicBrainz({ items, coverReleaseId, onProgress }: ApplyParams) {
  const response = await fetch('/api/songs/bulk/musicbrainz/apply', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ items, ...(coverReleaseId && { coverReleaseId }) })
  })

  return collectNdjsonBulkResponse<ApplyResult>(response, onProgress)
}

export function useBulkApplyMusicBrainz() {
  const queryClient = useQueryClient()
  const clear = useBulkSelectionStore(s => s.clear)

  return useMutation({
    mutationFn: applyBulkMusicBrainz,
    onSuccess: (data, variables) => {
      const updatedSongs = data.results.filter(result => result.ok).map(result => result.song)

      if (updatedSongs.length > 0) {
        applySongUpdates(queryClient, updatedSongs)
        invalidateAllHistoryQueryKeys(queryClient)
        incrementEditCount()
      }

      invalidateBulkTargetQueries(queryClient, variables.target)

      clear()
    }
  })
}
