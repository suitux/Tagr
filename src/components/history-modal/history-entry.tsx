'use client'

import { Loader2Icon, Undo2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { SongChangeHistoryEntry } from '@/features/history/domain'
import { useRevertChange } from '@/features/history/hooks/use-revert-change'
import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'

export function HistoryEntry({ entry }: { entry: SongChangeHistoryEntry }) {
  const tFields = useTranslations('fields')
  const tHistory = useTranslations('history')
  const { mutate: revert, isPending } = useRevertChange()

  const fieldLabel = (() => {
    try {
      return tFields(entry.field)
    } catch {
      return entry.field
    }
  })()

  return (
    <div className='group flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-b-0'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='truncate text-sm font-medium text-foreground'>
            {entry.songTitle || tHistory('unknownSong')}
          </span>
          {entry.songArtist && <span className='truncate text-xs text-muted-foreground'>— {entry.songArtist}</span>}
        </div>
        <div className='mt-1 text-xs text-muted-foreground truncate'>
          <span className='font-medium text-foreground/80'>{fieldLabel}</span>
          {': '}
          <span className='text-red-400 line-through'>{entry.oldValue}</span>
          {' → '}
          <span className='text-green-400'>{entry.newValue}</span>
        </div>
        <div className='mt-0.5 text-[11px] text-muted-foreground/60'>
          {formatDate(new Date(entry.changedAt), FULL_DATE_FORMAT)}
        </div>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
        onClick={() => revert({ songId: entry.songId, historyId: entry.id })}
        disabled={isPending}
        title={tHistory('revert')}>
        {isPending ? <Loader2Icon className='h-3.5 w-3.5 animate-spin' /> : <Undo2Icon className='h-3.5 w-3.5' />}
      </Button>
    </div>
  )
}
