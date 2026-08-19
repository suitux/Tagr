'use client'

import { MusicIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import type { RecentlyListenedSongRow } from '@/features/scrobbling/domain'
import { useRecentListens } from '@/features/scrobbling/hooks/use-recent-listens'
import type { Song } from '@/features/songs/domain'
import { useSortOrder } from '@/features/songs/hooks/use-sort-order'
import { useHomeStore } from '@/stores/home-store'
import { SongsDataTable } from './songs-data-table'
import { SongsTableHeader } from './songs-table-header'

export function MainContentRecentListensView() {
  const t = useTranslations('listens')
  const tFiles = useTranslations('files')
  const tFolders = useTranslations('folders')

  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const { sorting } = useSortOrder({ allowListenFields: true })
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined

  const { rows, totalListens, totalSongs, isLoading, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecentListens({ search, sorting, filters: activeFilters })

  const [selectedListenId, setSelectedListenId] = useState<number | null>(null)

  return (
    <div className='flex flex-col h-full'>
      <SongsTableHeader
        title={t('title')}
        mobileTitle={t('title')}
        variant='recent'
        badges={
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: totalListens ?? rows.length })}
          </Badge>
        }
        searchKey='recent'
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFiles('searchPlaceholder')}
      />

      <SongsDataTable
        songs={rows}
        totalSongs={totalSongs}
        isLoadingSongs={isLoading}
        isRefetching={isRefetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        showSavedFiltersDropdown={false}
        includeListenedAt
        getRowId={(song: Song) => String((song as RecentlyListenedSongRow).listenId)}
        selectedRowId={selectedListenId != null ? String(selectedListenId) : null}
        onRowSelect={(song: Song) => setSelectedListenId((song as RecentlyListenedSongRow).listenId)}
      />
    </div>
  )
}
