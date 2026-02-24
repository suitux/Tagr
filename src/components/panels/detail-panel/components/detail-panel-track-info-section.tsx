'use client'

import { ClockIcon, HashIcon, Music2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatDuration } from '../utils'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelTrackInfoSectionProps {
  song: Song
}

export function DetailPanelTrackInfoSection({ song }: DetailPanelTrackInfoSectionProps) {
  const t = useTranslations('trackInfo')

  return (
    <DetailPanelSection title={t('title')}>
      {song.duration && (
        <DetailPanelRow
          icon={<ClockIcon className='w-4 h-4' />}
          label={t('duration')}
          value={formatDuration(song.duration)!}
        />
      )}
      <DetailPanelRow
        icon={<HashIcon className='w-4 h-4' />}
        label={t('track')}
        value={song.trackNumber}
        songId={song.id}
        fieldName='trackNumber'
        type='number'
      />
      <DetailPanelRow
        icon={<HashIcon className='w-4 h-4' />}
        label={t('totalTracks')}
        value={song.trackTotal}
        songId={song.id}
        fieldName='trackTotal'
        type='number'
      />
      <DetailPanelRow
        icon={<Music2Icon className='w-4 h-4' />}
        label={t('disc')}
        value={song.discNumber}
        songId={song.id}
        fieldName='discNumber'
        type='number'
      />
      <DetailPanelRow
        icon={<Music2Icon className='w-4 h-4' />}
        label={t('totalDiscs')}
        value={song.discTotal}
        songId={song.id}
        fieldName='discTotal'
        type='number'
      />
    </DetailPanelSection>
  )
}
