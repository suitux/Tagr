'use client'

import { HistoryIcon, Loader2Icon, SearchIcon, Undo2Icon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useHome } from '@/contexts/home-context'
import { useHistory } from '@/features/history/hooks/use-history'
import { useRevertChanges } from '@/features/history/hooks/use-revert-changes'
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
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const lastSelectedRef = useRef<number | null>(null)

  const filters = { search: search || undefined, songId }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useHistory(open, filters)
  const { mutate: revertChanges, isPending: isReverting } = useRevertChanges()

  const entries = data?.pages.flatMap(p => p.entries) ?? []

  const handleSelect = (id: number, shiftKey: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)

      if (shiftKey && lastSelectedRef.current !== null) {
        const lastIndex = entries.findIndex(e => e.id === lastSelectedRef.current)
        const currentIndex = entries.findIndex(e => e.id === id)
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex)
          const end = Math.max(lastIndex, currentIndex)
          for (let i = start; i <= end; i++) {
            next.add(entries[i].id)
          }
          return next
        }
      }

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      lastSelectedRef.current = id
      return next
    })
  }

  const handleSongClick = (clickedSongId: number) => {
    setSelectedSongId(clickedSongId)
    onOpenChange(false)
  }

  const handleRevertSelected = () => {
    const items = entries.filter(e => selectedIds.has(e.id)).map(e => ({ songId: e.songId, historyId: e.id }))

    revertChanges(items, {
      onSuccess: () => setSelectedIds(new Set())
    })
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

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
                <HistoryEntry
                  key={entry.id}
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onSelect={handleSelect}
                  onSongClick={handleSongClick}
                />
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
        {selectedIds.size > 0 && (
          <div className='border-t px-6 py-3 flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>{t('revertSelected', { count: selectedIds.size })}</span>
            <div className='flex items-center gap-2'>
              <Button size='sm' variant='outline' onClick={() => setSelectedIds(new Set())}>
                <XIcon className='h-4 w-4' />
                {t('clearSelection')}
              </Button>
              <Button size='sm' onClick={handleRevertSelected} disabled={isReverting}>
                {isReverting ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <Undo2Icon className='h-4 w-4' />}
                {t('revert')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
