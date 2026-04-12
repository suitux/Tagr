'use client'

import { MoreVerticalIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { SmartPlaylist } from '@/features/smart-playlists/domain'
import { useDeleteSmartPlaylist } from '@/features/smart-playlists/hooks/use-delete-smart-playlist'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { cn } from '@/lib/utils'
import { SmartPlaylistModal } from './smart-playlist-modal/smart-playlist-modal'

interface SmartPlaylistListItemProps {
  playlist: SmartPlaylist
  isSelected: boolean
  onSelect: () => void
}

export function SmartPlaylistListItem({ playlist, isSelected, onSelect }: SmartPlaylistListItemProps) {
  const t = useTranslations('smartPlaylists')
  const tCommon = useTranslations('common')
  const [editOpen, setEditOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const { mutate: deletePlaylist } = useDeleteSmartPlaylist()
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
              <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>{tCommon('duplicate')}</DropdownMenuItem>
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
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {editOpen && <SmartPlaylistModal open={editOpen} onOpenChange={setEditOpen} playlist={playlist} />}
      {duplicateOpen && (
        <SmartPlaylistModal
          open={duplicateOpen}
          onOpenChange={setDuplicateOpen}
          duplicateFrom={playlist}
        />
      )}
    </>
  )
}
