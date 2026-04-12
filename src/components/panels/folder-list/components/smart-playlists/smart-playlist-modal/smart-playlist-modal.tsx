'use client'

import { useForm, FormProvider, Controller } from 'react-hook-form'
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
import type { SmartPlaylist, SmartPlaylistRules } from '@/features/smart-playlists/domain'
import { useCreateSmartPlaylist } from '@/features/smart-playlists/hooks/use-create-smart-playlist'
import { useUpdateSmartPlaylist } from '@/features/smart-playlists/hooks/use-update-smart-playlist'
import { smartPlaylistFormSchema, type SmartPlaylistFormData } from '@/features/smart-playlists/rules-schema'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { SmartPlaylistRulesEditor } from './smart-playlist-rules-editor'

interface SmartPlaylistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist?: SmartPlaylist
}

export function SmartPlaylistModal({ open, onOpenChange, playlist }: SmartPlaylistModalProps) {
  const t = useTranslations('smartPlaylists')
  const tCommon = useTranslations('common')
  const { data: metadataKeys = [] } = useMetadataKeys()

  const isEdit = !!playlist

  const form = useForm<SmartPlaylistFormData>({
    resolver: zodResolver(smartPlaylistFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: playlist?.name ?? '',
      isPublic: playlist?.isPublic ?? false,
      match: playlist?.rules.match ?? 'all',
      rules: !!playlist?.rules.rules.length
        ? playlist.rules.rules
        : [{ field: 'title', operator: 'contains', value: '' }]
    }
  })

  const { mutate: create, isPending: isCreating } = useCreateSmartPlaylist()
  const { mutate: update, isPending: isUpdating } = useUpdateSmartPlaylist()
  const isSaving = isCreating || isUpdating

  function onValid(data: SmartPlaylistFormData) {
    const payload: SmartPlaylistRules = {
      match: data.match,
      rules: data.rules.map(r => ({
        field: r.field as SmartPlaylistRules['rules'][number]['field'],
        operator: r.operator as SmartPlaylistRules['rules'][number]['operator'],
        value: r.value
      }))
    }
    if (isEdit && playlist) {
      update(
        { id: playlist.id, name: data.name.trim(), rules: payload, isPublic: data.isPublic },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create(
        { name: data.name.trim(), rules: payload, isPublic: data.isPublic },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onValid)}>
            <DialogHeader>
              <DialogTitle>{isEdit ? t('edit.title') : t('create.title')}</DialogTitle>
              <DialogDescription>{t('create.description')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='smart-playlist-name'>{t('create.name')}</Label>
                <Input
                  id='smart-playlist-name'
                  {...form.register('name')}
                  placeholder={t('create.namePlaceholder')}
                  autoFocus
                />
              </div>

              <div className='flex items-center gap-2'>
                <Controller
                  render={({ field: { value, onChange } }) => {
                    return <Checkbox id='smart-playlist-public' checked={value} onCheckedChange={onChange} />
                  }}
                  name={'isPublic'}
                />

                <Label htmlFor='smart-playlist-public' className='cursor-pointer'>
                  {t('create.isPublic')}
                </Label>
              </div>

              <SmartPlaylistRulesEditor control={form.control} metadataKeys={metadataKeys} />
            </div>

            <DialogFooter>
              <Button type='button' variant='ghost' onClick={() => onOpenChange(false)} disabled={isSaving}>
                {tCommon('cancel')}
              </Button>
              <Button type='submit' disabled={!form.formState.isValid || isSaving}>
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
