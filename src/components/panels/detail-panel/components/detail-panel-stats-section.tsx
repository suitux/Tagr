'use client'

import { CalendarIcon, PlayIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDate } from '../utils'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelStatsSectionProps {
  song: Song
}

export function DetailPanelStatsSection({ song }: DetailPanelStatsSectionProps) {
  const t = useTranslations('fields')

  const hasContent = song.dateAdded || song.lastPlayed || song.playCount

  if (!hasContent) return null

  return (
    <DetailPanelSection title='Stats'>
      {song.dateAdded && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label={t('dateAdded')}
          value={formatDate(song.dateAdded)!}
        />
      )}
      {song.lastPlayed && (
        <DetailPanelRow
          icon={<PlayIcon className='w-4 h-4' />}
          label={t('lastPlayed')}
          value={formatDate(song.lastPlayed)!}
        />
      )}
    </DetailPanelSection>
  )
}
