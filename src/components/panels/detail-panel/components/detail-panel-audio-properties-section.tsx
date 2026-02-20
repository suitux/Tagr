import { FileTypeIcon, HashIcon, MicIcon, RadioIcon, ScanLineIcon, WavesIcon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { formatBitrate, formatChannels, formatSampleRate } from '../utils'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelAudioPropertiesSectionProps {
  song: Song
  extName: string
}

export function DetailPanelAudioPropertiesSection({ song, extName }: DetailPanelAudioPropertiesSectionProps) {
  return (
    <DetailPanelSection title='Audio Properties'>
      <DetailPanelRow icon={<FileTypeIcon className='w-4 h-4' />} label='Format' value={extName} />
      {song.codec && <DetailPanelRow icon={<RadioIcon className='w-4 h-4' />} label='Codec' value={song.codec} />}
      {song.bitrate && (
        <DetailPanelRow icon={<WavesIcon className='w-4 h-4' />} label='Bitrate' value={formatBitrate(song.bitrate)!} />
      )}
      {song.sampleRate && (
        <DetailPanelRow
          icon={<ScanLineIcon className='w-4 h-4' />}
          label='Sample Rate'
          value={formatSampleRate(song.sampleRate)!}
        />
      )}
      {song.channels && (
        <DetailPanelRow
          icon={<MicIcon className='w-4 h-4' />}
          label='Channels'
          value={formatChannels(song.channels)!}
        />
      )}
      {song.bitsPerSample && (
        <DetailPanelRow icon={<HashIcon className='w-4 h-4' />} label='Bit Depth' value={`${song.bitsPerSample}-bit`} />
      )}
    </DetailPanelSection>
  )
}
