'use client'

import { FileTypeIcon, HashIcon, MicIcon, RadioIcon, ScanLineIcon, WavesIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { formatBitrate, formatChannels, formatSampleRate } from '../utils'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelAudioPropertiesSectionProps {
  song: Song
  extName: string
}

export function DetailPanelAudioPropertiesSection({ song, extName }: DetailPanelAudioPropertiesSectionProps) {
  const t = useTranslations('audioProperties')
  const tCommon = useTranslations('common')

  return (
    <DetailPanelSection title={t('title')}>
      <DetailPanelRow icon={<FileTypeIcon className='w-4 h-4' />} label={tCommon('format')} value={extName} />
      {song.codec && <DetailPanelRow icon={<RadioIcon className='w-4 h-4' />} label={t('codec')} value={song.codec} />}
      {song.bitrate && (
        <DetailPanelRow icon={<WavesIcon className='w-4 h-4' />} label={t('bitrate')} value={formatBitrate(song.bitrate)!} />
      )}
      {song.sampleRate && (
        <DetailPanelRow
          icon={<ScanLineIcon className='w-4 h-4' />}
          label={t('sampleRate')}
          value={formatSampleRate(song.sampleRate)!}
        />
      )}
      {song.channels && (
        <DetailPanelRow
          icon={<MicIcon className='w-4 h-4' />}
          label={t('channels')}
          value={formatChannels(song.channels)!}
        />
      )}
      {song.bitsPerSample && (
        <DetailPanelRow icon={<HashIcon className='w-4 h-4' />} label={t('bitDepth')} value={`${song.bitsPerSample}-bit`} />
      )}
    </DetailPanelSection>
  )
}
