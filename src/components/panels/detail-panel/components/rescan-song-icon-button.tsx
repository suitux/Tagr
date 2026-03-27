'use client'

import { RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useRescanSong } from '@/features/songs/hooks/use-rescan-song'

interface RescanSongIconButtonProps {
  songId: number
}

export function RescanSongIconButton({ songId }: RescanSongIconButtonProps) {
  const t = useTranslations('history')
  const { mutate: rescanSong, isPending } = useRescanSong()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9 md:h-7 md:w-7' disabled={isPending} onClick={() => rescanSong(songId)}>
          <RefreshCwIcon className={`h-5 w-5 md:h-4 md:w-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('rescanSong')}</TooltipContent>
    </Tooltip>
  )
}
