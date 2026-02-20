import { FileTypeIcon, HashIcon, MicIcon, RadioIcon, ScanLineIcon, WavesIcon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { formatBitrate, formatChannels, formatSampleRate } from '../utils'
import { DetailRow } from './detail-row'
import { DetailSection } from './detail-section'

interface AudioPropertiesSectionProps {
  song: Song
  extName: string
}

export function AudioPropertiesSection({ song, extName }: AudioPropertiesSectionProps) {
  return (
    <DetailSection title='Audio Properties'>
      <DetailRow icon={<FileTypeIcon className='w-4 h-4' />} label='Format' value={extName} />
      {song.codec && <DetailRow icon={<RadioIcon className='w-4 h-4' />} label='Codec' value={song.codec} />}
      {song.bitrate && (
        <DetailRow icon={<WavesIcon className='w-4 h-4' />} label='Bitrate' value={formatBitrate(song.bitrate)!} />
      )}
      {song.sampleRate && (
        <DetailRow
          icon={<ScanLineIcon className='w-4 h-4' />}
          label='Sample Rate'
          value={formatSampleRate(song.sampleRate)!}
        />
      )}
      {song.channels && (
        <DetailRow icon={<MicIcon className='w-4 h-4' />} label='Channels' value={formatChannels(song.channels)!} />
      )}
      {song.bitsPerSample && (
        <DetailRow icon={<HashIcon className='w-4 h-4' />} label='Bit Depth' value={`${song.bitsPerSample}-bit`} />
      )}
    </DetailSection>
  )
}
