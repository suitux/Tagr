'use client'

import { MusicIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { usePlaylistSongs } from '@/features/playlists/hooks/use-playlist-songs'
import { usePlaylists } from '@/features/playlists/hooks/use-playlists'
import { useReorderPlaylistItems } from '@/features/playlists/hooks/use-reorder-playlist-items'
import { useHomeStore, useIsAnyFilterActive } from '@/stores/home-store'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { PlaylistReorderBar } from './playlist-reorder-bar'
import { PlaylistReorderContext } from './playlist-reorder-context'
import { SongsDataTable } from './songs-data-table'
import { SongsTableHeader } from './songs-table-header'

interface Props {
  playlistId: number
}

export function MainContentCustomPlaylistView({ playlistId }: Props) {
  const t = useTranslations('playlists')
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { data } = usePlaylists()
  const playlist = data?.private.find(p => p.id === playlistId) ?? data?.public.find(p => p.id === playlistId)

  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)
  const isAnyFilterActive = useIsAnyFilterActive()
  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined
  const activeExtraMetadataColumns = useActiveCustomMetadataKeys()

  const { mutate: reorderItems } = useReorderPlaylistItems()

  const {
    data: songsData,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePlaylistSongs({
    playlistId,
    search,
    sorting,
    filters: activeFilters,
    metadataKeys: activeExtraMetadataColumns
  })

  const songs = songsData?.pages.flatMap(p => (p.success ? p.files : [])) ?? []
  const totalSongs = (songsData?.pages[0]?.success === true && songsData.pages[0].totalFiles) || null

  // Reordering only makes sense in manual (sortIndex) order, i.e. no column sort/search/filter.
  const canReorder = playlist?.isOwner === true && !sorting.sortField && !search && !isAnyFilterActive

  const [isReordering, setIsReordering] = useState(false)

  const handleReorder = useCallback(
    (orderedRowIds: string[]) => {
      reorderItems({ playlistId, orderedSongIds: orderedRowIds.map(Number) })
    },
    [reorderItems, playlistId]
  )

  return (
    <PlaylistReorderContext.Provider value={{ canReorder, isReordering, setIsReordering }}>
      <div className='flex flex-col h-full'>
        <SongsTableHeader
          title={playlist?.name}
          mobileTitle={playlist?.name}
          variant={'playlist'}
          badges={
            <>
              <Badge variant='secondary' className='uppercase text-[10px] tracking-wide'>
                {t('viewing.label')}
              </Badge>
              {playlist?.isPublic && <Badge variant='outline'>{t('publicBadge')}</Badge>}
              <Badge variant='secondary' className='gap-1.5'>
                <MusicIcon className='w-3.5 h-3.5' />
                {tFolders('files', { count: totalSongs || '?' })}
              </Badge>
            </>
          }
          searchKey={playlistId}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={tFiles('searchPlaceholder')}
        />

        <SongsDataTable
          songs={songs}
          totalSongs={totalSongs}
          isLoadingSongs={isLoading}
          isRefetching={isRefetching}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          showSavedFiltersDropdown={false}
          enableRowReorder={canReorder && isReordering}
          onRowReorder={handleReorder}
        />
        {canReorder && isReordering && <PlaylistReorderBar onDone={() => setIsReordering(false)} />}
      </div>
    </PlaylistReorderContext.Provider>
  )
}
