'use client'

import { FolderIcon, InfoIcon, MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

interface MobileBottomNavProps {
  hasDetail: boolean
}

export function MobileBottomNav({ hasDetail }: MobileBottomNavProps) {
  const t = useTranslations('navigation')
  const { folderSheetOpen, detailSheetOpen, setFolderSheetOpen, setDetailSheetOpen } = useMobileNavStore()

  const isSongsActive = !folderSheetOpen && !detailSheetOpen

  return (
    <div className='fixed bottom-0 inset-x-0 z-40 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur-sm'>
      <Button variant='ghost' size='sm' className={cn('flex-col gap-0.5 h-12', folderSheetOpen && 'text-primary')} onClick={() => { setFolderSheetOpen(true); setDetailSheetOpen(false) }}>
        <FolderIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('folders')}</span>
      </Button>
      <Button variant='ghost' size='sm' className={cn('flex-col gap-0.5 h-12', isSongsActive && 'text-primary')} onClick={() => { setFolderSheetOpen(false); setDetailSheetOpen(false) }}>
        <MusicIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('songs')}</span>
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={cn('flex-col gap-0.5 h-12', detailSheetOpen && 'text-primary')}
        disabled={!hasDetail}
        onClick={() => { setDetailSheetOpen(true); setFolderSheetOpen(false) }}>
        <InfoIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('details')}</span>
      </Button>
    </div>
  )
}
