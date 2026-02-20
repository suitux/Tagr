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
      {song.title && (
        <DetailPanelRow
          icon={<MusicIcon className='w-4 h-4' />}
          label='Title'
          value={song.title}
          songId={song.id}
          fieldName='title'
        />
      )}
      {song.artist && (
        <DetailPanelRow
          icon={<UserIcon className='w-4 h-4' />}
          label='Artist'
          value={song.artist}
          songId={song.id}
          fieldName='artist'
        />
      )}
      {song.album && (
        <DetailPanelRow
          icon={<DiscIcon className='w-4 h-4' />}
          label='Album'
          value={song.album}
          songId={song.id}
          fieldName='album'
        />
      )}
      {song.albumArtist && song.albumArtist !== song.artist && (
        <DetailPanelRow
          icon={<UserIcon className='w-4 h-4' />}
          label='Album Artist'
          value={song.albumArtist}
          songId={song.id}
          fieldName='albumArtist'
        />
      )}
      {song.year && (
        <DetailPanelRow
          icon={<CalendarIcon className='w-4 h-4' />}
          label='Year'
          value={song.year.toString()}
          songId={song.id}
          fieldName='year'
        />
      )}
      {song.genre && (
        <DetailPanelRow
          icon={<TagIcon className='w-4 h-4' />}
          label='Genre'
          value={song.genre}
          songId={song.id}
          fieldName='genre'
        />
      )}
      {song.composer && (
        <DetailPanelRow
          icon={<PenLineIcon className='w-4 h-4' />}
          label='Composer'
          value={song.composer}
          songId={song.id}
          fieldName='composer'
        />
      )}
    </DetailPanelSection>
  )
}
