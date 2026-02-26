'use client'

import { HistoryIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import { useHistory } from '@/features/history/hooks/use-history'
import { HistoryEntry } from './history-entry'

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  songId?: number
  songTitle?: string
}

export function HistoryModal({ open, onOpenChange, songId, songTitle }: HistoryModalProps) {
  const t = useTranslations('history')
  const { setSelectedSongId } = useHome()

  const handleSongClick = useCallback(
    (clickedSongId: number) => {
      setSelectedSongId(clickedSongId)
      onOpenChange(false)
    },
    [setSelectedSongId, onOpenChange]
  )
  const [search, setSearch] = useState('')
  const filters = { search: search || undefined, songId }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useHistory(open, filters)

  const entries = data?.pages.flatMap(p => p.entries) ?? []

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex flex-col p-0 w-full max-w-2xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2 leading-normal'>
            <HistoryIcon className='h-4 w-4 shrink-0' />
            {songTitle ? t('titleForSong', { songTitle }) : t('title')}
          </DialogTitle>
        </DialogHeader>
        <div className='relative px-6'>
          <SearchIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-9 h-4 w-4 -translate-y-1/2' />
          <Input
            debounceMs={300}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className='pl-9'
          />
        </div>
        <div className='h-[60vh] overflow-hidden'>
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          )}
          {!isLoading && entries.length === 0 && (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <HistoryIcon className='h-8 w-8 opacity-40' />
              <p className='text-sm'>{t('empty')}</p>
            </div>
          )}
          {!isLoading && entries.length > 0 && (
            <Virtuoso
              style={{ height: '100%' }}
              data={entries}
              endReached={loadMore}
              overscan={200}
              itemContent={(_index, entry) => (
                <HistoryEntry key={entry.id} entry={entry} onSongClick={handleSongClick} />
              )}
              components={{
                Footer: () =>
                  isFetchingNextPage ? (
                    <div className='flex justify-center py-4'>
                      <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
                    </div>
                  ) : null
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
