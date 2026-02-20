'use client'

import { ClockIcon, HashIcon, Music2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDuration } from '../utils'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelTrackInfoSectionProps {
  song: Song
}

export function DetailPanelTrackInfoSection({ song }: DetailPanelTrackInfoSectionProps) {
  const t = useTranslations('trackInfo')
  const hasContent = song.trackNumber || song.discNumber || song.duration

  if (!hasContent) return null

  return (
    <DetailPanelSection title={t('title')}>
      {song.duration && (
        <DetailPanelRow
          icon={<ClockIcon className='w-4 h-4' />}
          label={t('duration')}
          value={formatDuration(song.duration)!}
        />
      )}
      {song.trackNumber && (
        <DetailPanelRow
          icon={<HashIcon className='w-4 h-4' />}
          label={t('track')}
          value={song.trackTotal ? `${song.trackNumber} ${t('of')} ${song.trackTotal}` : song.trackNumber.toString()}
          songId={song.id}
          fieldName='trackNumber'
        />
      )}
      {song.discNumber && (
        <DetailPanelRow
          icon={<Music2Icon className='w-4 h-4' />}
          label={t('disc')}
          value={song.discTotal ? `${song.discNumber} ${t('of')} ${song.discTotal}` : song.discNumber.toString()}
          songId={song.id}
          fieldName='discNumber'
        />
      )}
    </DetailPanelSection>
  )
}
