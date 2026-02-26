'use client'

import { useCallback, useEffect, useRef } from 'react'
import { HistoryIcon, Loader2Icon, Undo2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useHistory } from '@/features/history/hooks/use-history'
import { useRevertChange } from '@/features/history/hooks/use-revert-change'
import { SongChangeHistoryEntry } from '@/features/history/domain'
import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatTimestamp(iso: string) {
  return formatDate(new Date(iso), FULL_DATE_FORMAT) ?? ''
}

function truncate(value: string | null, max = 40) {
  if (!value) return '—'
  return value.length > max ? value.slice(0, max) + '…' : value
}

function HistoryEntry({ entry }: { entry: SongChangeHistoryEntry }) {
  const t = useTranslations('fields')
  const { mutate: revert, isPending } = useRevertChange()

  const fieldLabel = (() => {
    try {
      return t(entry.field)
    } catch {
      return entry.field
    }
  })()

  return (
    <div className='group flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-b-0'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='truncate text-sm font-medium text-foreground'>
            {entry.songTitle || 'Unknown'}
          </span>
          {entry.songArtist && (
            <span className='truncate text-xs text-muted-foreground'>— {entry.songArtist}</span>
          )}
        </div>
        <div className='mt-1 text-xs text-muted-foreground'>
          <span className='font-medium text-foreground/80'>{fieldLabel}</span>
          {': '}
          <span className='text-red-400 line-through'>{truncate(entry.oldValue)}</span>
          {' → '}
          <span className='text-green-400'>{truncate(entry.newValue)}</span>
        </div>
        <div className='mt-0.5 text-[11px] text-muted-foreground/60'>
          {formatTimestamp(entry.changedAt)}
        </div>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
        onClick={() => revert({ songId: entry.songId, historyId: entry.id })}
        disabled={isPending}
        title='Revert'
      >
        {isPending ? (
          <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
        ) : (
          <Undo2Icon className='h-3.5 w-3.5' />
        )}
      </Button>
    </div>
  )
}

export function HistoryDrawer({ open, onOpenChange }: HistoryDrawerProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useHistory(open)
  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = data?.pages.flatMap(p => p.entries) ?? []

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='flex w-[400px] flex-col p-0 sm:w-[440px]'>
        <SheetHeader className='border-b px-4 py-4'>
          <SheetTitle className='flex items-center gap-2'>
            <HistoryIcon className='h-4 w-4' />
            Change History
          </SheetTitle>
        </SheetHeader>
        <div ref={scrollRef} className='flex-1 overflow-y-auto'>
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          )}
          {!isLoading && entries.length === 0 && (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <HistoryIcon className='h-8 w-8 opacity-40' />
              <p className='text-sm'>No changes recorded yet</p>
            </div>
          )}
          {entries.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
          {isFetchingNextPage && (
            <div className='flex justify-center py-4'>
              <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
