'use client'

import { useCallback, useEffect, useRef } from 'react'
import { HistoryIcon, Loader2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useHistory } from '@/features/history/hooks/use-history'
import { HistoryEntry } from './history-entry'

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const t = useTranslations('history')
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[80vh] max-w-2xl flex-col p-0'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle className='flex items-center gap-2'>
            <HistoryIcon className='h-4 w-4' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>
        <div ref={scrollRef} className='flex-1 overflow-y-auto'>
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
          {entries.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
          {isFetchingNextPage && (
            <div className='flex justify-center py-4'>
              <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
