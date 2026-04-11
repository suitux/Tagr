'use client'

import { useSongsList } from '@/features/songs/hooks/use-songs-list'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { SongsDataTable } from './songs-data-table'

export function MainContentFileList() {
  const activeExtraMetadataColumns = useActiveCustomMetadataKeys()

  const { songs, isLoadingSongs, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useSongsList({
    metadataKeys: activeExtraMetadataColumns
  })

  return (
    <SongsDataTable
      songs={songs}
      isLoadingSongs={isLoadingSongs}
      isRefetching={isRefetching}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  )
}
