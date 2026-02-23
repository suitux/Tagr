'use client'

import { FolderIcon, Loader2Icon, MoreVerticalIcon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useScan } from '@/features/scan/hooks/use-scan'

export function FolderListHeader() {
  const t = useTranslations('folders')
  const { mutate: scan, isPending } = useScan()

  return (
    <div className='px-4 py-5'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20'>
          <FolderIcon className='w-5 h-5 text-primary-foreground' />
        </div>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
