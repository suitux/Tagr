'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ClockIcon, MusicIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Song } from '@/features/songs/domain'
import { formatDate, formatFileSize, getExtensionVariant } from '../utils'

function NameCell({ song }: { song: Song }) {
  const displayName = song.title || song.fileName

  return (
    <div className='flex items-center gap-3 min-w-0'>
      <div className='flex-shrink-0'>
        <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
          <MusicIcon className='w-5 h-5 text-muted-foreground' />
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-foreground truncate'>{displayName}</p>
        <div className='flex items-center gap-2 mt-0.5'>
          <Badge variant={getExtensionVariant(song.extension)} className='text-[10px] h-4'>
            {song.extension.toUpperCase()}
          </Badge>
          {song.artist && <span className='text-xs text-muted-foreground truncate'>{song.artist}</span>}
        </div>
      </div>
    </div>
  )
}

export function useSongColumns(): ColumnDef<Song, unknown>[] {
  const tCommon = useTranslations('common')

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant='ghost' className='-ml-4' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {tCommon('name')}
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => <NameCell song={row.original} />,
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original.title || rowA.original.fileName).toLowerCase()
        const b = (rowB.original.title || rowB.original.fileName).toLowerCase()
        return a.localeCompare(b)
      }
    },
    {
      accessorKey: 'fileSize',
      header: ({ column }) => (
        <Button
          variant='ghost'
          className='w-full justify-end'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {tCommon('size')}
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground text-right block'>{formatFileSize(row.original.fileSize)}</span>
      ),
      size: 120
    },
    {
      accessorKey: 'modifiedAt',
      header: ({ column }) => (
        <Button
          variant='ghost'
          className='w-full justify-end'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {tCommon('modified')}
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
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
