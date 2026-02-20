import { ClockIcon, HashIcon, Music2Icon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { formatDuration } from '../utils'
import { DetailRow } from './detail-row'
import { DetailSection } from './detail-section'

interface TrackInfoSectionProps {
  song: Song
}

export function TrackInfoSection({ song }: TrackInfoSectionProps) {
  const hasContent = song.trackNumber || song.discNumber || song.duration

  if (!hasContent) return null

  return (
    <DetailSection title='Track Info'>
      {song.duration && (
        <DetailRow icon={<ClockIcon className='w-4 h-4' />} label='Duration' value={formatDuration(song.duration)!} />
      )}
      {song.trackNumber && (
        <DetailRow
          icon={<HashIcon className='w-4 h-4' />}
          label='Track'
          value={song.trackTotal ? `${song.trackNumber} of ${song.trackTotal}` : song.trackNumber.toString()}
        />
      )}
      {song.discNumber && (
        <DetailRow
          icon={<Music2Icon className='w-4 h-4' />}
          label='Disc'
          value={song.discTotal ? `${song.discNumber} of ${song.discTotal}` : song.discNumber.toString()}
        />
      )}
    </DetailSection>
  )
}
