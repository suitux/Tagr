'use client'

import { MoreVerticalIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useDeleteSmartPlaylist } from '@/features/smart-playlists/hooks/use-delete-smart-playlist'
import { cn } from '@/lib/utils'
import { SmartPlaylistModal } from './smart-playlist-modal'

interface SmartPlaylistListItemProps {
  playlist: SmartPlaylist
  isSelected: boolean
  onSelect: () => void
}

export function SmartPlaylistListItem({ playlist, isSelected, onSelect }: SmartPlaylistListItemProps) {
  const t = useTranslations('smartPlaylists')
  const tCommon = useTranslations('common')
  const [editOpen, setEditOpen] = useState(false)
  const { mutate: deletePlaylist } = useDeleteSmartPlaylist()

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
          <SparklesIcon className='w-4 h-4' />
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
              <DropdownMenuItem onClick={() => setEditOpen(true)}>{tCommon('edit')}</DropdownMenuItem>
              <DropdownMenuItem
                variant='destructive'
                onClick={() => {
                  if (confirm(t('confirmDelete', { name: playlist.name }))) {
                    deletePlaylist(playlist.id)
                  }
                }}>
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {editOpen && <SmartPlaylistModal open={editOpen} onOpenChange={setEditOpen} playlist={playlist} />}
    </>
  )
}
