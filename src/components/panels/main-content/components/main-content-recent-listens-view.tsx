'use client'

import { MusicIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { useRecentListens } from '@/features/scrobbling/hooks/use-recent-listens'
import { SongsDataTable } from './songs-data-table'
import { SongsTableHeader } from './songs-table-header'

/** Matches the already-loaded listens; the endpoint returns plain history, not a search. */
function matchesSearch(haystack: (string | null)[], needle: string): boolean {
  const lowered = needle.toLowerCase()
  return haystack.some(value => value?.toLowerCase().includes(lowered))
}

export function MainContentRecentListensView() {
  const t = useTranslations('listens')
  const tFiles = useTranslations('files')
  const tFolders = useTranslations('folders')

  const [search, setSearch] = useState('')
  const { songs, isLoading, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecentListens()

  const visibleSongs = search
    ? songs.filter(song => matchesSearch([song.title, song.artist, song.album], search))
    : songs

  return (
    <div className='flex flex-col h-full'>
      <SongsTableHeader
        title={t('title')}
        mobileTitle={t('title')}
        variant='recent'
        badges={
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: visibleSongs.length })}
          </Badge>
        }
        searchKey='recent'
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFiles('searchPlaceholder')}
      />

      <SongsDataTable
        songs={visibleSongs}
        totalSongs={visibleSongs.length}
        isLoadingSongs={isLoading}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        showSavedFiltersDropdown={false}
      />
    </div>
  )
}
