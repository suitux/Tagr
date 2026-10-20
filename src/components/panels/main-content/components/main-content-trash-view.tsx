'use client'

import { MusicIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSortOrder } from '@/features/songs/hooks/use-sort-order'
import { useTrashActions } from '@/features/trash/hooks/use-trash-actions'
import { useTrashSongs } from '@/features/trash/hooks/use-trash-songs'
import { useHomeStore } from '@/stores/home-store'
import { useActiveCustomMetadataKeys } from './columns/hooks/use-active-custom-metadata-keys'
import { SongsDataTable } from './songs-data-table'
import { SongsTableHeader } from './songs-table-header'

function TrashEmptyState() {
  const t = useTranslations('trash')

  return (
    <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8'>
      <Card className='max-w-sm'>
        <CardContent className='pt-6'>
          <div className='mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
            <Trash2Icon className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium mb-1'>{t('empty')}</p>
          <p className='text-xs text-muted-foreground'>{t('emptyDescription')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function MainContentTrashView() {
  const t = useTranslations('trash')
  const tFiles = useTranslations('files')
  const tFolders = useTranslations('folders')
  const activeExtraMetadataColumns = useActiveCustomMetadataKeys()

  const search = useHomeStore(s => s.search)
  const setSearch = useHomeStore(s => s.setSearch)
  const { sorting } = useSortOrder()
  const columnFilters = useHomeStore(s => s.columnFilters)

  const activeFilterEntries = Object.entries(columnFilters).filter(([, v]) => v)
  const activeFilters = activeFilterEntries.length > 0 ? Object.fromEntries(activeFilterEntries) : undefined

  const { songs, totalSongs, isLoading, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useTrashSongs({
    search,
    sorting,
    filters: activeFilters,
    metadataKeys: activeExtraMetadataColumns
  })

  const { emptyTrash } = useTrashActions()

  return (
    <div className='flex flex-col h-full'>
      <SongsTableHeader
        title={t('title')}
        mobileTitle={t('title')}
        variant='trash'
        badges={
          <Badge variant='secondary' className='gap-1.5'>
            <MusicIcon className='w-3.5 h-3.5' />
            {tFolders('files', { count: totalSongs ?? 0 })}
          </Badge>
        }
        actions={
          // Emptying ignores search and filters, so it is offered only while the whole trash is listed.
          <Button
            variant='destructive'
            size='sm'
            onClick={() => emptyTrash(totalSongs ?? 0)}
            disabled={!totalSongs || !!search || !!activeFilters}
          >
            <Trash2Icon />
            {t('actions.empty')}
          </Button>
        }
        searchKey='trash'
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
        includePurgeCountdown
        EmptyState={TrashEmptyState}
      />
    </div>
  )
}
