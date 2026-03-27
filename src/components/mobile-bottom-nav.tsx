'use client'

import { FolderIcon, InfoIcon, MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useSelectedSong } from '@/hooks/use-selected-song'
import { cn } from '@/lib/utils'
import { useMobileNavStore } from '@/stores/mobile-nav-store'

interface MobileBottomNavProps {
  hasDetail: boolean
}

export function MobileBottomNav({ hasDetail }: MobileBottomNavProps) {
  const t = useTranslations('navigation')
  const { folderSheetOpen, setFolderSheetOpen } = useMobileNavStore()
  const { setSelectedSongId, isSongSelected } = useSelectedSong()
  const isSongsActive = !folderSheetOpen && !isSongSelected

  return (
    <div className='fixed bottom-0 inset-x-0 z-50 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur-sm'>
      <Button
        variant='ghost'
        size='sm'
        className={cn('flex-col gap-0.5 h-12', folderSheetOpen && 'text-primary')}
        onClick={() => {
          setFolderSheetOpen(true)
          setSelectedSongId(null)
        }}>
        <FolderIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('folders')}</span>
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={cn('flex-col gap-0.5 h-12', isSongsActive && 'text-primary')}
        onClick={() => {
          setFolderSheetOpen(false)
          setSelectedSongId(null)
        }}>
        <MusicIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('songs')}</span>
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={cn('flex-col gap-0.5 h-12', isSongSelected && 'text-primary')}
        disabled={!hasDetail}
        onClick={() => {
          setFolderSheetOpen(false)
        }}>
        <InfoIcon className='w-5 h-5' />
        <span className='text-[10px]'>{t('details')}</span>
      </Button>
    </div>
  )
}
