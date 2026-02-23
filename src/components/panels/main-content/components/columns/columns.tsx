'use client'

import { ClockIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NameCell from '@/components/panels/main-content/components/columns/components/name-cell'
import type { Song } from '@/features/songs/domain'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate, formatDuration, formatFileSize } from '../../utils'
import { SortableHeader } from './components/sortable-header'

const textCell = (value: string | null | undefined) => (
  <span className='text-sm text-muted-foreground'>{value ?? ''}</span>
)

const numericCell = (value: number | null | undefined) => (
  <span className='text-sm text-muted-foreground text-right block'>{value ?? ''}</span>
)

const booleanCell = (value: boolean | null | undefined) => (
  <span className='text-sm text-muted-foreground'>{value ? 'Yes' : ''}</span>
)

const dateCell = (value: Date | null | undefined) => (
  <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
    <ClockIcon className='w-3.5 h-3.5' />
    <span>{formatDate(value ?? null)}</span>
  </div>
)

export function useSongColumns(): ColumnDef<Song>[] {
  const tCommon = useTranslations('common')
  const tMusicInfo = useTranslations('musicInfo')
  const tTrackInfo = useTranslations('trackInfo')
  const tAudio = useTranslations('audioProperties')
  const tNotes = useTranslations('notes')
  const tPlayback = useTranslations('playback')
  const tStats = useTranslations('stats')

  return [
    // --- Name (always visible, not hideable) ---
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => (
        <SortableHeader column={column} label={tCommon('name')} className='w-auto justify-start -ml-4' />
      ),
      cell: ({ row }) => <NameCell song={row.original} />,
      enableHiding: false
    },
    // --- Music Info ---
    {
      id: 'artist',
      accessorKey: 'artist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('artist')} />,
      cell: ({ row }) => textCell(row.original.artist),
      size: 160
    },
    {
      id: 'sortArtist',
      accessorKey: 'sortArtist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('sortArtist')} />,
      cell: ({ row }) => textCell(row.original.sortArtist),
      size: 160
    },
    {
      id: 'album',
      accessorKey: 'album',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('album')} />,
      cell: ({ row }) => textCell(row.original.album),
      size: 180
    },
    {
      id: 'sortAlbum',
      accessorKey: 'sortAlbum',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('sortAlbum')} />,
      cell: ({ row }) => textCell(row.original.sortAlbum),
      size: 180
    },
    {
      id: 'trackNumber',
      accessorKey: 'trackNumber',
      header: ({ column }) => <SortableHeader column={column} label={tTrackInfo('track')} />,
      cell: ({ row }) => numericCell(row.original.trackNumber),
      size: 80
    },
    {
      id: 'trackTotal',
      accessorKey: 'trackTotal',
      header: ({ column }) => <SortableHeader column={column} label={tTrackInfo('totalTracks')} />,
      cell: ({ row }) => numericCell(row.original.trackTotal),
      size: 100
    },
    {
      id: 'discNumber',
      accessorKey: 'discNumber',
      header: ({ column }) => <SortableHeader column={column} label={tTrackInfo('disc')} />,
      cell: ({ row }) => numericCell(row.original.discNumber),
      size: 80
    },
    {
      id: 'discTotal',
      accessorKey: 'discTotal',
      header: ({ column }) => <SortableHeader column={column} label={tTrackInfo('totalDiscs')} />,
      cell: ({ row }) => numericCell(row.original.discTotal),
      size: 100
    },
    {
      id: 'year',
      accessorKey: 'year',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('year')} />,
      cell: ({ row }) => numericCell(row.original.year),
      size: 80
    },
    {
      id: 'bpm',
      accessorKey: 'bpm',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('bpm')} />,
      cell: ({ row }) => numericCell(row.original.bpm),
      size: 80
    },
    {
      id: 'genre',
      accessorKey: 'genre',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('genre')} />,
      cell: ({ row }) => textCell(row.original.genre),
      size: 120
    },
    {
      id: 'albumArtist',
      accessorKey: 'albumArtist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('albumArtist')} />,
      cell: ({ row }) => textCell(row.original.albumArtist),
      size: 160
    },
    {
      id: 'sortAlbumArtist',
      accessorKey: 'sortAlbumArtist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('sortAlbumArtist')} />,
      cell: ({ row }) => textCell(row.original.sortAlbumArtist),
      size: 160
    },
    {
      id: 'composer',
      accessorKey: 'composer',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('composer')} />,
      cell: ({ row }) => textCell(row.original.composer),
      size: 160
    },
    {
      id: 'conductor',
      accessorKey: 'conductor',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('conductor')} />,
      cell: ({ row }) => textCell(row.original.conductor),
      size: 160
    },
    {
      id: 'comment',
      accessorKey: 'comment',
      header: ({ column }) => <SortableHeader column={column} label={tNotes('comment')} />,
      cell: ({ row }) => textCell(row.original.comment),
      size: 200
    },
    {
      id: 'grouping',
      accessorKey: 'grouping',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('grouping')} />,
      cell: ({ row }) => textCell(row.original.grouping),
      size: 140
    },
    {
      id: 'publisher',
      accessorKey: 'publisher',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('publisher')} />,
      cell: ({ row }) => textCell(row.original.publisher),
      size: 160
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => <SortableHeader column={column} label={tNotes('description')} />,
      cell: ({ row }) => textCell(row.original.description),
      size: 200
    },
    {
      id: 'catalogNumber',
      accessorKey: 'catalogNumber',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('catalogNumber')} />,
      cell: ({ row }) => textCell(row.original.catalogNumber),
      size: 140
    },
    {
      id: 'discSubtitle',
      accessorKey: 'discSubtitle',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('discSubtitle')} />,
      cell: ({ row }) => textCell(row.original.discSubtitle),
      size: 160
    },
    {
      id: 'lyricist',
      accessorKey: 'lyricist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('lyricist')} />,
      cell: ({ row }) => textCell(row.original.lyricist),
      size: 160
    },
    {
      id: 'barcode',
      accessorKey: 'barcode',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('barcode')} />,
      cell: ({ row }) => textCell(row.original.barcode),
      size: 140
    },
    {
      id: 'work',
      accessorKey: 'work',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('work')} />,
      cell: ({ row }) => textCell(row.original.work),
      size: 160
    },
    {
      id: 'movementName',
      accessorKey: 'movementName',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('movementName')} />,
      cell: ({ row }) => textCell(row.original.movementName),
      size: 160
    },
    {
      id: 'movement',
      accessorKey: 'movement',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('movement')} />,
      cell: ({ row }) => numericCell(row.original.movement),
      size: 100
    },
    {
      id: 'originalReleaseDate',
      accessorKey: 'originalReleaseDate',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('originalReleaseDate')} />,
      cell: ({ row }) => textCell(row.original.originalReleaseDate),
      size: 160
    },
    {
      id: 'copyright',
      accessorKey: 'copyright',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('copyright')} />,
      cell: ({ row }) => textCell(row.original.copyright),
      size: 180
    },
    {
      id: 'rating',
      accessorKey: 'rating',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('rating')} />,
      cell: ({ row }) => numericCell(row.original.rating),
      size: 80
    },
    {
      id: 'lyrics',
      accessorKey: 'lyrics',
      header: ({ column }) => <SortableHeader column={column} label={tNotes('lyrics')} />,
      cell: ({ row }) => textCell(row.original.lyrics ? row.original.lyrics.slice(0, 60) + '...' : ''),
      size: 200
    },
    {
      id: 'compilation',
      accessorKey: 'compilation',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('compilation')} />,
      cell: ({ row }) => booleanCell(row.original.compilation),
      size: 100
    },
    // --- Playback ---
    {
      id: 'volume',
      accessorKey: 'volume',
      header: ({ column }) => <SortableHeader column={column} label={tPlayback('volume')} />,
      cell: ({ row }) => numericCell(row.original.volume),
      size: 80
    },
    {
      id: 'startTime',
      accessorKey: 'startTime',
      header: ({ column }) => <SortableHeader column={column} label={tPlayback('startTime')} />,
      cell: ({ row }) => textCell(row.original.startTime != null ? formatDuration(row.original.startTime) : ''),
      size: 100
    },
    {
      id: 'stopTime',
      accessorKey: 'stopTime',
      header: ({ column }) => <SortableHeader column={column} label={tPlayback('stopTime')} />,
      cell: ({ row }) => textCell(row.original.stopTime != null ? formatDuration(row.original.stopTime) : ''),
      size: 100
    },
    {
      id: 'gapless',
      accessorKey: 'gapless',
      header: ({ column }) => <SortableHeader column={column} label={tPlayback('gapless')} />,
      cell: ({ row }) => booleanCell(row.original.gapless),
      size: 80
    },
    // --- Stats ---
    {
      id: 'dateAdded',
      accessorKey: 'dateAdded',
      header: ({ column }) => <SortableHeader column={column} label={tStats('dateAdded')} />,
      cell: ({ row }) => dateCell(row.original.dateAdded),
      size: 160
    },
    {
      id: 'lastPlayed',
      accessorKey: 'lastPlayed',
      header: ({ column }) => <SortableHeader column={column} label={tStats('lastPlayed')} />,
      cell: ({ row }) => dateCell(row.original.lastPlayed),
      size: 160
    },
    {
      id: 'playCount',
      accessorKey: 'playCount',
      header: ({ column }) => <SortableHeader column={column} label={tStats('playCount')} />,
      cell: ({ row }) => numericCell(row.original.playCount),
      size: 100
    },
    // --- File info ---
    {
      id: 'modifiedAt',
      accessorKey: 'modifiedAt',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('modified')} />,
      cell: ({ row }) => dateCell(row.original.modifiedAt),
      size: 160
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('created')} />,
      cell: ({ row }) => dateCell(row.original.createdAt),
      size: 160
    },
    {
      id: 'fileSize',
      accessorKey: 'fileSize',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('size')} />,
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground text-right block'>{formatFileSize(row.original.fileSize)}</span>
      ),
      size: 120
    },
    {
      id: 'duration',
      accessorKey: 'duration',
      header: ({ column }) => <SortableHeader column={column} label={tTrackInfo('duration')} />,
      cell: ({ row }) => textCell(formatDuration(row.original.duration)),
      size: 80
    },
    {
      id: 'bitrate',
      accessorKey: 'bitrate',
      header: ({ column }) => <SortableHeader column={column} label={tAudio('bitrate')} />,
      cell: ({ row }) => textCell(row.original.bitrate ? `${Math.round(row.original.bitrate / 1000)} kbps` : ''),
      size: 100
    },
    {
      id: 'bitsPerSample',
      accessorKey: 'bitsPerSample',
      header: ({ column }) => <SortableHeader column={column} label={tAudio('bitDepth')} />,
      cell: ({ row }) => textCell(row.original.bitsPerSample ? `${row.original.bitsPerSample}-bit` : ''),
      size: 80
    },
    {
      id: 'sampleRate',
      accessorKey: 'sampleRate',
      header: ({ column }) => <SortableHeader column={column} label={tAudio('sampleRate')} />,
      cell: ({ row }) => textCell(row.original.sampleRate ? `${(row.original.sampleRate / 1000).toFixed(1)} kHz` : ''),
      size: 100
    },
    {
      id: 'channels',
      accessorKey: 'channels',
      header: ({ column }) => <SortableHeader column={column} label={tAudio('channels')} />,
      cell: ({ row }) => numericCell(row.original.channels),
      size: 80
    },
    {
      id: 'extension',
      accessorKey: 'extension',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('format')} />,
      cell: ({ row }) => textCell(row.original.extension.toUpperCase()),
      size: 80
    },
    {
      id: 'encoder',
      accessorKey: 'encoder',
      header: ({ column }) => <SortableHeader column={column} label={tAudio('encoder')} />,
      cell: ({ row }) => textCell(row.original.encoder),
      size: 140
    },
    {
      id: 'fileName',
      accessorKey: 'fileName',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('name') + ' (file)'} />,
      cell: ({ row }) => textCell(row.original.fileName),
      size: 200
    },
    {
      id: 'filePath',
      accessorKey: 'filePath',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('location')} />,
      cell: ({ row }) => textCell(row.original.filePath),
      size: 300,
      enableSorting: false
    }
  ]
}

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  title: true,
  artist: true,
  album: true,
  year: true,
  genre: true,
  bpm: true,
  duration: true,
  fileSize: true,
  modifiedAt: true
}
