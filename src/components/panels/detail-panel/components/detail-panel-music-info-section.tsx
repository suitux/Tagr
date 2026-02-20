import { CalendarIcon, DiscIcon, MusicIcon, PenLineIcon, TagIcon, UserIcon } from 'lucide-react'
import { Song } from '@/features/songs/domain'
import { DetailPanelRow } from './detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelMusicInfoSectionProps {
  song: Song
}

export function DetailPanelMusicInfoSection({ song }: DetailPanelMusicInfoSectionProps) {
  const hasContent = song.title || song.artist || song.album || song.albumArtist || song.year || song.genre

  if (!hasContent) return null

  return (
    <DetailPanelSection title='Music Info'>
      {song.title && <DetailPanelRow icon={<MusicIcon className='w-4 h-4' />} label='Title' value={song.title} />}
      {song.artist && <DetailPanelRow icon={<UserIcon className='w-4 h-4' />} label='Artist' value={song.artist} />}
      {song.album && <DetailPanelRow icon={<DiscIcon className='w-4 h-4' />} label='Album' value={song.album} />}
      {song.albumArtist && song.albumArtist !== song.artist && (
        <DetailPanelRow icon={<UserIcon className='w-4 h-4' />} label='Album Artist' value={song.albumArtist} />
      )}
      {song.year && (
        <DetailPanelRow icon={<CalendarIcon className='w-4 h-4' />} label='Year' value={song.year.toString()} />
      )}
      {song.genre && <DetailPanelRow icon={<TagIcon className='w-4 h-4' />} label='Genre' value={song.genre} />}
      {song.composer && (
        <DetailPanelRow icon={<PenLineIcon className='w-4 h-4' />} label='Composer' value={song.composer} />
      )}
    </DetailPanelSection>
  )
}
