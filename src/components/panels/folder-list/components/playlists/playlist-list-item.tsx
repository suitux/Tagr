'use client'

import { ListMusicIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Playlist } from '@/features/playlists/domain'
import { useDeletePlaylist } from '@/features/playlists/hooks/use-delete-playlist'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { cn } from '@/lib/utils'
import { PlaylistModal } from './playlist-modal'

interface PlaylistListItemProps {
  playlist: Playlist
  isSelected: boolean
  onSelect: () => void
}

export function PlaylistListItem({ playlist, isSelected, onSelect }: PlaylistListItemProps) {
  const t = useTranslations('playlists')
  const tCommon = useTranslations('common')
  const [editOpen, setEditOpen] = useState(false)
  const { mutate: deletePlaylist } = useDeletePlaylist()
  const { confirm } = useAlertDialog()

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-2 w-full rounded-md pl-3 pr-1 py-2 cursor-pointer',
          isSelected ? 'bg-accent shadow-sm' : 'hover:bg-accent/50'
        )}
        onClick={onSelect}>
        <div
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
          <ListMusicIcon className='w-4 h-4' />
        </div>
        <span className='flex-1 text-sm font-medium truncate text-left'>{playlist.name}</span>
        {playlist.isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100'
                onClick={e => e.stopPropagation()}>
                <MoreVerticalIcon className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <PencilIcon />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant='destructive'
                onClick={() => {
                  confirm({
                    title: tCommon('delete'),
                    description: t('confirmDelete', { name: playlist.name }),
                    cancel: { label: tCommon('cancel') },
                    action: {
                      label: tCommon('delete'),
                      variant: 'destructive',
                      onClick: () => deletePlaylist(playlist.id)
                    }
                  })
                }}>
                <TrashIcon />
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {editOpen && <PlaylistModal open={editOpen} onOpenChange={setEditOpen} playlist={playlist} />}
    </>
  )
}
