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

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortableHeader column={column} label={tCommon('name')} className='w-auto justify-start -ml-4' />
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
