import { CalendarIcon, DiscIcon, MusicIcon, PenLineIcon, TagIcon, UserIcon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { DetailRow } from './detail-row'
import { DetailSection } from './detail-section'

interface MusicInfoSectionProps {
  song: Song
}

export function MusicInfoSection({ song }: MusicInfoSectionProps) {
  const hasContent = song.title || song.artist || song.album || song.albumArtist || song.year || song.genre

  if (!hasContent) return null

  return (
    <DetailSection title='Music Info'>
      {song.title && <DetailRow icon={<MusicIcon className='w-4 h-4' />} label='Title' value={song.title} />}
      {song.artist && <DetailRow icon={<UserIcon className='w-4 h-4' />} label='Artist' value={song.artist} />}
      {song.album && <DetailRow icon={<DiscIcon className='w-4 h-4' />} label='Album' value={song.album} />}
      {song.albumArtist && song.albumArtist !== song.artist && (
        <DetailRow icon={<UserIcon className='w-4 h-4' />} label='Album Artist' value={song.albumArtist} />
      )}
      {song.year && <DetailRow icon={<CalendarIcon className='w-4 h-4' />} label='Year' value={song.year.toString()} />}
      {song.genre && <DetailRow icon={<TagIcon className='w-4 h-4' />} label='Genre' value={song.genre} />}
      {song.composer && <DetailRow icon={<PenLineIcon className='w-4 h-4' />} label='Composer' value={song.composer} />}
    </DetailSection>
  )
}
