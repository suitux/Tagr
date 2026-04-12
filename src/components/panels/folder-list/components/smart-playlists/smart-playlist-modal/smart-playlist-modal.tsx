'use client'

import { useMemo, useState } from 'react'
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
import {
  operatorNeedsValue,
  type SmartPlaylist,
  type SmartPlaylistRule,
  type SmartPlaylistRules
} from '@/features/smart-playlists/domain'
import { useCreateSmartPlaylist } from '@/features/smart-playlists/hooks/use-create-smart-playlist'
import { useUpdateSmartPlaylist } from '@/features/smart-playlists/hooks/use-update-smart-playlist'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'
import { SmartPlaylistRulesEditor } from './smart-playlist-rules-editor'

interface SmartPlaylistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist?: SmartPlaylist
}

function emptyRule(): SmartPlaylistRule {
  return { field: 'title', operator: 'contains', value: '' }
}

function ruleIsComplete(rule: SmartPlaylistRule): boolean {
  return !operatorNeedsValue(rule.operator) || rule.value.trim().length > 0
}

export function SmartPlaylistModal({ open, onOpenChange, playlist }: SmartPlaylistModalProps) {
  const t = useTranslations('smartPlaylists')
  const tCommon = useTranslations('common')
  const { data: metadataKeys = [] } = useMetadataKeys()

  const isEdit = !!playlist
  const [name, setName] = useState(() => playlist?.name ?? '')
  const [isPublic, setIsPublic] = useState(() => playlist?.isPublic ?? false)
  const [match, setMatch] = useState<'all' | 'any'>(() => playlist?.rules.match ?? 'all')
  const [rules, setRules] = useState<SmartPlaylistRule[]>(() =>
    playlist && playlist.rules.rules.length > 0 ? playlist.rules.rules : [emptyRule()]
  )

  const { mutate: create, isPending: isCreating } = useCreateSmartPlaylist()
  const { mutate: update, isPending: isUpdating } = useUpdateSmartPlaylist()
  const isSaving = isCreating || isUpdating

  const allRulesComplete = useMemo(() => rules.length > 0 && rules.every(ruleIsComplete), [rules])
  const canSave = name.trim().length > 0 && allRulesComplete && !isSaving

  function handleSave() {
    const payload: SmartPlaylistRules = { match, rules }
    if (isEdit && playlist) {
      update({ id: playlist.id, name: name.trim(), rules: payload, isPublic }, { onSuccess: () => onOpenChange(false) })
    } else {
      create({ name: name.trim(), rules: payload, isPublic }, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('edit.title') : t('create.title')}</DialogTitle>
          <DialogDescription>{t('create.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='smart-playlist-name'>{t('create.name')}</Label>
            <Input
              id='smart-playlist-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('create.namePlaceholder')}
              autoFocus
            />
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox id='smart-playlist-public' checked={isPublic} onCheckedChange={v => setIsPublic(Boolean(v))} />
            <Label htmlFor='smart-playlist-public' className='cursor-pointer'>
              {t('create.isPublic')}
            </Label>
          </div>

          <SmartPlaylistRulesEditor
            match={match}
            onMatchChange={setMatch}
            rules={rules}
            onRulesChange={setRules}
            metadataKeys={metadataKeys}
          />
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)} disabled={isSaving}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
