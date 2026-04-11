'use client'

import { Trash2Icon } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  getSmartlistFieldType,
  getOperatorsForField,
  operatorNeedsValue,
  type SmartPlaylist,
  type SmartPlaylistOperator,
  type SmartPlaylistRule,
  type SmartPlaylistRules
} from '@/features/smart-playlists/domain'
import { useCreateSmartPlaylist } from '@/features/smart-playlists/hooks/use-create-smart-playlist'
import { useUpdateSmartPlaylist } from '@/features/smart-playlists/hooks/use-update-smart-playlist'
import { type ColumnField, METADATA_COLUMN_PREFIX } from '@/features/songs/domain'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'

interface SmartPlaylistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist?: SmartPlaylist
}

const SONG_FIELD_OPTIONS: ColumnField[] = [
  'title',
  'artist',
  'album',
  'albumArtist',
  'genre',
  'year',
  'bpm',
  'composer',
  'conductor',
  'publisher',
  'catalogNumber',
  'lyricist',
  'barcode',
  'work',
  'grouping',
  'comment',
  'copyright',
  'rating',
  'trackNumber',
  'trackTotal',
  'discNumber',
  'discTotal',
  'compilation',
  'duration',
  'bitrate',
  'sampleRate',
  'channels',
  'bitsPerSample',
  'encoder',
  'extension',
  'fileName',
  'fileSize',
  'createdAt',
  'modifiedAt',
  'dateAdded',
  'lastPlayed',
  'playCount',
  'originalReleaseDate'
]

function emptyRule(): SmartPlaylistRule {
  return { field: 'title', operator: 'contains', value: '' }
}

function ruleIsComplete(rule: SmartPlaylistRule): boolean {
  return !operatorNeedsValue(rule.operator) || rule.value.trim().length > 0
}

export function SmartPlaylistModal({ open, onOpenChange, playlist }: SmartPlaylistModalProps) {
  const t = useTranslations('smartPlaylists')
  const tFields = useTranslations('fields')
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

  const fieldLabel = (field: ColumnField): string => {
    if (field.startsWith(METADATA_COLUMN_PREFIX)) return field.slice(METADATA_COLUMN_PREFIX.length)
    try {
      return tFields(field as never)
    } catch {
      return field
    }
  }

  const operatorLabel = (op: SmartPlaylistOperator) => t(`operators.${op}`)

  const allRulesComplete = useMemo(() => rules.length > 0 && rules.every(ruleIsComplete), [rules])
  const canSave = name.trim().length > 0 && allRulesComplete && !isSaving

  function updateRule(index: number, patch: Partial<SmartPlaylistRule>) {
    setRules(prev =>
      prev.map((r, i) => {
        if (i !== index) return r
        const next = { ...r, ...patch }
        // When the field changes, reset operator to the first valid op for that type
        if (patch.field && patch.field !== r.field) {
          const ops = getOperatorsForField(patch.field)
          if (!ops.includes(next.operator)) next.operator = ops[0]
          if (getSmartlistFieldType(patch.field) === 'boolean') next.value = ''
        }
        return next
      })
    )
  }

  function addRule() {
    setRules(prev => [...prev, emptyRule()])
  }

  function removeRule(index: number) {
    setRules(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

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

          <div className='space-y-2'>
            <Label>{t('create.matchLabel')}</Label>
            <div className='flex gap-4'>
              <label className='flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type='radio'
                  name='match'
                  value='all'
                  checked={match === 'all'}
                  onChange={() => setMatch('all')}
                />
                {t('create.matchAll')}
              </label>
              <label className='flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type='radio'
                  name='match'
                  value='any'
                  checked={match === 'any'}
                  onChange={() => setMatch('any')}
                />
                {t('create.matchAny')}
              </label>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>{t('create.rulesLabel')}</Label>
            <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
              {rules.map((rule, i) => {
                const type = getSmartlistFieldType(rule.field)
                const ops = getOperatorsForField(rule.field)
                const showValue = operatorNeedsValue(rule.operator)
                return (
                  <div key={i} className='grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center'>
                    <Select value={rule.field} onValueChange={v => updateRule(i, { field: v as ColumnField })}>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t('create.standardFields')}</SelectLabel>
                          {SONG_FIELD_OPTIONS.map(f => (
                            <SelectItem key={f} value={f}>
                              {fieldLabel(f)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        {metadataKeys.length > 0 && (
                          <>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>{t('create.customFields')}</SelectLabel>
                              {metadataKeys.map(k => (
                                <SelectItem key={k} value={`${METADATA_COLUMN_PREFIX}${k}`}>
                                  {k}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.operator}
                      onValueChange={v => updateRule(i, { operator: v as SmartPlaylistOperator })}>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ops.map(op => (
                          <SelectItem key={op} value={op}>
                            {operatorLabel(op)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {showValue ? (
                      type === 'number' ? (
                        <Input
                          type='number'
                          value={rule.value}
                          onChange={e => updateRule(i, { value: e.target.value })}
                        />
                      ) : type === 'date' ? (
                        <Input
                          type='date'
                          value={rule.value}
                          onChange={e => updateRule(i, { value: e.target.value })}
                        />
                      ) : (
                        <Input
                          value={rule.value}
                          onChange={e => updateRule(i, { value: e.target.value })}
                          placeholder={t('create.valuePlaceholder')}
                        />
                      )
                    ) : (
                      <div />
                    )}

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeRule(i)}
                      disabled={rules.length === 1}>
                      <Trash2Icon className='w-4 h-4' />
                    </Button>
                  </div>
                )
              })}
            </div>
            <Button type='button' variant='outline' size='sm' onClick={addRule}>
              {t('create.addRule')}
            </Button>
          </div>
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
