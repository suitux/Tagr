import { ActivityIcon, CalendarIcon, DiscIcon, MusicIcon, PenLineIcon, TagIcon, UserIcon } from 'lucide-react'
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
      <DetailPanelRow
        icon={<MusicIcon className='w-4 h-4' />}
        label='Title'
        value={song.title}
        songId={song.id}
        fieldName='title'
      />

      <DetailPanelRow
        icon={<UserIcon className='w-4 h-4' />}
        label='Artist'
        value={song.artist}
        songId={song.id}
        fieldName='artist'
      />

      <DetailPanelRow
        icon={<DiscIcon className='w-4 h-4' />}
        label='Album'
        value={song.album}
        songId={song.id}
        fieldName='album'
      />

      <DetailPanelRow
        icon={<UserIcon className='w-4 h-4' />}
        label='Album Artist'
        value={song.albumArtist}
        songId={song.id}
        fieldName='albumArtist'
      />

      <DetailPanelRow
        icon={<CalendarIcon className='w-4 h-4' />}
        label='Year'
        value={song.year?.toString()}
        songId={song.id}
        fieldName='year'
        type={'number'}
      />

      <DetailPanelRow
        icon={<TagIcon className='w-4 h-4' />}
        label='Genre'
        value={song.genre}
        songId={song.id}
        fieldName='genre'
      />

      <DetailPanelRow
        icon={<PenLineIcon className='w-4 h-4' />}
        label='Composer'
        value={song.composer}
        songId={song.id}
        fieldName='composer'
      />

      <DetailPanelRow
        icon={<ActivityIcon className='w-4 h-4' />}
        label='Bpm'
        value={song.bpm}
        songId={song.id}
        fieldName='bpm'
        type={'number'}
      />
    </DetailPanelSection>
  )
}
