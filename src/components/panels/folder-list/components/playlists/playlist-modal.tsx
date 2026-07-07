'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Playlist } from '@/features/playlists/domain'
import { useCreatePlaylist } from '@/features/playlists/hooks/use-create-playlist'
import { useUpdatePlaylist } from '@/features/playlists/hooks/use-update-playlist'

interface PlaylistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist?: Playlist
  onCreated?: (playlistId: number) => void
}

export function PlaylistModal({ open, onOpenChange, playlist, onCreated }: PlaylistModalProps) {
  const t = useTranslations('playlists')
  const tCommon = useTranslations('common')

  const isEdit = !!playlist
  const [name, setName] = useState(playlist?.name ?? '')
  const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? false)

  const { mutate: create, isPending: isCreating } = useCreatePlaylist()
  const { mutate: update, isPending: isUpdating } = useUpdatePlaylist()
  const isSaving = isCreating || isUpdating

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (isEdit && playlist) {
      update({ id: playlist.id, name: trimmed, isPublic }, { onSuccess: () => onOpenChange(false) })
    } else {
      create(
        { name: trimmed, isPublic },
        {
          onSuccess: created => {
            onOpenChange(false)
            onCreated?.(created.id)
          }
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? t('edit.title') : t('create.title')}</DialogTitle>
            <DialogDescription>{t('create.description')}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='playlist-name'>{t('create.name')}</Label>
              <Input
                id='playlist-name'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('create.namePlaceholder')}
                autoFocus
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='playlist-public'
                checked={isPublic}
                onCheckedChange={checked => setIsPublic(checked === true)}
              />
              <Label htmlFor='playlist-public' className='cursor-pointer'>
                {t('create.isPublic')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='ghost' onClick={() => onOpenChange(false)} disabled={isSaving}>
              {tCommon('cancel')}
            </Button>
            <Button type='submit' disabled={!name.trim() || isSaving}>
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
