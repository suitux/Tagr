import { ClockIcon, HashIcon, Music2Icon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { formatDuration } from '../utils'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelTrackInfoSectionProps {
  song: Song
}

export function DetailPanelTrackInfoSection({ song }: DetailPanelTrackInfoSectionProps) {
  const hasContent = song.trackNumber || song.discNumber || song.duration

  if (!hasContent) return null

  return (
    <DetailPanelSection title='Track Info'>
      {song.duration && (
        <DetailPanelRow
          icon={<ClockIcon className='w-4 h-4' />}
          label='Duration'
          value={formatDuration(song.duration)!}
        />
      )}
      {song.trackNumber && (
        <DetailPanelRow
          icon={<HashIcon className='w-4 h-4' />}
          label='Track'
          value={song.trackTotal ? `${song.trackNumber} of ${song.trackTotal}` : song.trackNumber.toString()}
          songId={song.id}
          fieldName='trackNumber'
        />
      )}
      {song.discNumber && (
        <DetailPanelRow
          icon={<Music2Icon className='w-4 h-4' />}
          label='Disc'
          value={song.discTotal ? `${song.discNumber} of ${song.discTotal}` : song.discNumber.toString()}
          songId={song.id}
          fieldName='discNumber'
        />
      )}
    </DetailPanelSection>
  )
}
