'use client'

import { useState } from 'react'
import { HistoryIcon, Loader2Icon, MoreVerticalIcon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NextImage from 'next/image'
import { HistoryDrawer } from '@/components/history-drawer'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useScan } from '@/features/scan/hooks/use-scan'

export function FolderListHeader() {
  const t = useTranslations('folders')
  const { mutate: scan, isPending } = useScan()
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className='px-4 py-5'>
      <div className='flex items-center gap-3'>
        <NextImage src='/icons/tagr-logo.webp' alt='Tagr' width={40} height={40} className='rounded-xl' unoptimized />
        <div className='flex-1'>
          <h2 className='text-base font-semibold text-foreground'>{t('title')}</h2>
          <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreVerticalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => scan()} disabled={isPending}>
              {isPending ? <Loader2Icon className='h-4 w-4 animate-spin' /> : <RefreshCwIcon className='h-4 w-4' />}
              {t('rescan')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
              <HistoryIcon className='h-4 w-4' />
              {t('history')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  )
}
