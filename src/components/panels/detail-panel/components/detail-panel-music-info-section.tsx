'use client'

import {
  ActivityIcon,
  BarcodeIcon,
  BookOpenIcon,
  CalendarIcon,
  CopyrightIcon,
  DiscIcon,
  FolderIcon,
  LibraryIcon,
  ListMusicIcon,
  MusicIcon,
  PenLineIcon,
  StarIcon,
  TagIcon,
  ToggleLeftIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Song } from '@/features/songs/domain'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'
import { DetailPanelSection } from './detail-panel-section'

interface DetailPanelMusicInfoSectionProps {
  song: Song
}

export function DetailPanelMusicInfoSection({ song }: DetailPanelMusicInfoSectionProps) {
  const t = useTranslations('musicInfo')

  return (
    <DetailPanelSection title={t('title')}>
      <DetailPanelRow
        icon={<MusicIcon className='w-4 h-4' />}
        label={t('songTitle')}
        value={song.title}
        songId={song.id}
        fieldName='title'
      />
      <DetailPanelRow
        icon={<UserIcon className='w-4 h-4' />}
        label={t('artist')}
        value={song.artist}
        songId={song.id}
        fieldName='artist'
      />
      <DetailPanelRow
        icon={<UserIcon className='w-4 h-4' />}
        label={t('sortArtist')}
        value={song.sortArtist}
        songId={song.id}
        fieldName='sortArtist'
      />
      <DetailPanelRow
        icon={<DiscIcon className='w-4 h-4' />}
        label={t('album')}
        value={song.album}
        songId={song.id}
        fieldName='album'
      />
      <DetailPanelRow
        icon={<DiscIcon className='w-4 h-4' />}
        label={t('sortAlbum')}
        value={song.sortAlbum}
        songId={song.id}
        fieldName='sortAlbum'
      />
      <DetailPanelRow
        icon={<UsersIcon className='w-4 h-4' />}
        label={t('albumArtist')}
        value={song.albumArtist}
        songId={song.id}
        fieldName='albumArtist'
      />
      <DetailPanelRow
        icon={<UsersIcon className='w-4 h-4' />}
        label={t('sortAlbumArtist')}
        value={song.sortAlbumArtist}
        songId={song.id}
        fieldName='sortAlbumArtist'
      />
      <DetailPanelRow
        icon={<CalendarIcon className='w-4 h-4' />}
        label={t('year')}
        value={song.year?.toString()}
        songId={song.id}
        fieldName='year'
        type='number'
      />
      <DetailPanelRow
        icon={<TagIcon className='w-4 h-4' />}
        label={t('genre')}
        value={song.genre}
        songId={song.id}
        fieldName='genre'
      />
      <DetailPanelRow
        icon={<PenLineIcon className='w-4 h-4' />}
        label={t('composer')}
        value={song.composer}
        songId={song.id}
        fieldName='composer'
      />
      <DetailPanelRow
        icon={<UserIcon className='w-4 h-4' />}
        label={t('conductor')}
        value={song.conductor}
        songId={song.id}
        fieldName='conductor'
      />
      <DetailPanelRow
        icon={<ActivityIcon className='w-4 h-4' />}
        label={t('bpm')}
        value={song.bpm}
        songId={song.id}
        fieldName='bpm'
        type='number'
      />
      <DetailPanelRow
        icon={<FolderIcon className='w-4 h-4' />}
        label={t('grouping')}
        value={song.grouping}
        songId={song.id}
        fieldName='grouping'
      />
      <DetailPanelRow
        icon={<LibraryIcon className='w-4 h-4' />}
        label={t('publisher')}
        value={song.publisher}
        songId={song.id}
        fieldName='publisher'
      />
      <DetailPanelRow
        icon={<TagIcon className='w-4 h-4' />}
        label={t('catalogNumber')}
        value={song.catalogNumber}
        songId={song.id}
        fieldName='catalogNumber'
      />
      <DetailPanelRow
        icon={<DiscIcon className='w-4 h-4' />}
        label={t('discSubtitle')}
        value={song.discSubtitle}
        songId={song.id}
        fieldName='discSubtitle'
      />
      <DetailPanelRow
        icon={<PenLineIcon className='w-4 h-4' />}
        label={t('lyricist')}
        value={song.lyricist}
        songId={song.id}
        fieldName='lyricist'
      />
      <DetailPanelRow
        icon={<BarcodeIcon className='w-4 h-4' />}
        label={t('barcode')}
        value={song.barcode}
        songId={song.id}
        fieldName='barcode'
      />
      <DetailPanelRow
        icon={<BookOpenIcon className='w-4 h-4' />}
        label={t('work')}
        value={song.work}
        songId={song.id}
        fieldName='work'
      />
      <DetailPanelRow
        icon={<ListMusicIcon className='w-4 h-4' />}
        label={t('movementName')}
        value={song.movementName}
        songId={song.id}
        fieldName='movementName'
      />
      <DetailPanelRow
        icon={<ListMusicIcon className='w-4 h-4' />}
        label={t('movement')}
        value={song.movement}
        songId={song.id}
        fieldName='movement'
        type='number'
      />
      <DetailPanelRow
        icon={<CalendarIcon className='w-4 h-4' />}
        label={t('originalReleaseDate')}
        value={song.originalReleaseDate}
        songId={song.id}
        fieldName='originalReleaseDate'
        type='date'
      />
      <DetailPanelRow
        icon={<CopyrightIcon className='w-4 h-4' />}
        label={t('copyright')}
        value={song.copyright}
        songId={song.id}
        fieldName='copyright'
      />
      <DetailPanelRow
        icon={<StarIcon className='w-4 h-4' />}
        label={t('rating')}
        value={song.rating}
        songId={song.id}
        fieldName='rating'
        type='number'
      />
      <DetailPanelRow
        icon={<ToggleLeftIcon className='w-4 h-4' />}
        label={t('compilation')}
        value={song.compilation ? 'Yes' : ''}
        songId={song.id}
        fieldName='compilation'
      />
    </DetailPanelSection>
  )
}
