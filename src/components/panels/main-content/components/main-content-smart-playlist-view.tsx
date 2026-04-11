'use client'

import { MusicIcon, PencilIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SmartPlaylistModal } from '@/components/panels/folder-list/components/smart-playlists/smart-playlist-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useDeleteSmartPlaylist } from '@/features/smart-playlists/hooks/use-delete-smart-playlist'
import { useSmartPlaylistSongs } from '@/features/smart-playlists/hooks/use-smart-playlist-songs'
import { SmartPlaylistsResult, useSmartPlaylists } from '@/features/smart-playlists/hooks/use-smart-playlists'
import { useSelectedPlaylist } from '@/hooks/use-selected-playlist'
import { useHomeStore } from '@/stores/home-store'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { SongsDataTable } from './songs-data-table'

interface Props {
  playlistId: number
}

export function MainContentSmartPlaylistView({ playlistId }: Props) {
  const t = useTranslations('smartPlaylists')
  const tCommon = useTranslations('common')
  const tFolders = useTranslations('folders')
  const tFiles = useTranslations('files')

  const { data } = useSmartPlaylists()
  const playlist = data?.private.find(p => p.id === playlistId) ?? data?.public.find(p => p.id === playlistId)

  const { setSelectedPlaylistId } = useSelectedPlaylist()
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
  const { mutate: deletePlaylist } = useDeleteSmartPlaylist()

  function handleDelete() {
    if (!playlist) return
    if (confirm(t('confirmDelete', { name: playlist.name }))) {
      deletePlaylist(playlist.id, {
        onSuccess: () => setSelectedPlaylistId(null)
      })
    }
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 px-2 py-3 md:px-6 md:py-5 bg-gradient-to-r from-background to-muted/20'>
        <div className='hidden md:flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary'>
              <SparklesIcon className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl md:text-2xl font-bold text-foreground mt-1'>{playlist?.name ?? '—'}</h1>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='uppercase text-[10px] tracking-wide'>
              {t('viewing.label')}
            </Badge>
            {playlist?.isPublic && <Badge variant='outline'>{t('publicBadge')}</Badge>}

            <Badge variant='secondary' className='gap-1.5'>
              <MusicIcon className='w-3.5 h-3.5' />
              {tFolders('files', { count: totalSongs || '?' })}
            </Badge>
          </div>
        </div>
        <div className='md:hidden flex items-center gap-2 mb-3'>
          <SparklesIcon className='w-5 h-5 text-primary' />
          <span className='text-sm font-semibold truncate'>{playlist?.name ?? '—'}</span>
        </div>
        <div className='relative md:mt-4'>
          <Input
            key={playlistId}
            debounceMs={300}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tFiles('searchPlaceholder')}
          />
        </div>
      </div>
      <Separator />
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
