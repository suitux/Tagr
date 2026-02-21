'use client'

import { ClockIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import NameCell from '@/components/panels/main-content/components/columns/components/name-cell'
import type { Song } from '@/features/songs/domain'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate, formatFileSize } from '../../utils'
import { SortableHeader } from './components/sortable-header'

export function useSongColumns(): ColumnDef<Song>[] {
  const tCommon = useTranslations('common')
  const tMusicInfo = useTranslations('musicInfo')
  const tNotes = useTranslations('notes')

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortableHeader column={column} label={tCommon('name')} className='w-auto justify-start -ml-4' />
      ),
      cell: ({ row }) => <NameCell song={row.original} />
    },
    {
      accessorKey: 'artist',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('artist')} />,
      cell: ({ row }) => <span className='text-sm text-muted-foreground'>{row.original.artist ?? ''}</span>,
      size: 160
    },
    {
      accessorKey: 'year',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('year')} />,
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground text-right block'>{row.original.year ?? ''}</span>
      ),
      size: 80
    },
    {
      accessorKey: 'genre',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('genre')} />,
      cell: ({ row }) => <span className='text-sm text-muted-foreground'>{row.original.genre ?? ''}</span>,
      size: 120
    },
    {
      accessorKey: 'bpm',
      header: ({ column }) => <SortableHeader column={column} label={tMusicInfo('bpm')} />,
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground text-center block'>{row.original.bpm ?? ''}</span>
      ),
      size: 80
    },
    {
      accessorKey: 'comment',
      header: ({ column }) => <SortableHeader column={column} label={tNotes('comment')} />,
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground truncate block max-w-[200px] text-right'>
          {row.original.comment ?? ''}
        </span>
      ),
      size: 200
    },
    {
      accessorKey: 'fileSize',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('size')} />,
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground text-right block'>{formatFileSize(row.original.fileSize)}</span>
      ),
      size: 120
    },
    {
      accessorKey: 'modifiedAt',
      header: ({ column }) => <SortableHeader column={column} label={tCommon('modified')} />,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
          <ClockIcon className='w-3.5 h-3.5' />
          <span>{formatDate(row.original.modifiedAt)}</span>
        </div>
      ),
      size: 160
    }
  ]
}
