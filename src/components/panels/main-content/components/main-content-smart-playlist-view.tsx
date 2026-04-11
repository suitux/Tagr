'use client'

import { MusicIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SmartPlaylistModal } from '@/components/panels/folder-list/components/smart-playlists/smart-playlist-modal'
import { Badge } from '@/components/ui/badge'
import { useSmartPlaylistSongs } from '@/features/smart-playlists/hooks/use-smart-playlist-songs'
import { useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { useHomeStore } from '@/stores/home-store'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { SongsDataTable } from './songs-data-table'
import { SongsTableHeader } from './songs-table-header'

interface Props {
  playlistId: number
}

export function MainContentSmartPlaylistView({ playlistId }: Props) {
  const t = useTranslations('smartPlaylists')
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { data } = useSmartPlaylists()
  const playlist = data?.private.find(p => p.id === playlistId) ?? data?.public.find(p => p.id === playlistId)

  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const sorting = useHomeStore(s => s.sorting)
  const columnFilters = useHomeStore(s => s.columnFilters)
  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined
  const activeExtraMetadataColumns = useActiveCustomMetadataKeys()

  const {
    data: songsData,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSmartPlaylistSongs({
    playlistId,
    search,
    sorting,
    filters: activeFilters,
    metadataKeys: activeExtraMetadataColumns
  })

  const songs = songsData?.pages.flatMap(p => (p.success ? p.files : [])) ?? []
  const totalSongs = (songsData?.pages[0]?.success === true && songsData.pages[0].totalFiles) || null

  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className='flex flex-col h-full'>
      <SongsTableHeader
        title={playlist?.name}
        mobileTitle={playlist?.name}
        variant={'smart-playlist'}
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
        isLoadingSongs={isLoading}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        showSavedFiltersDropdown={false}
      />
      {editOpen && playlist && <SmartPlaylistModal open={editOpen} onOpenChange={setEditOpen} playlist={playlist} />}
    </div>
  )
}
