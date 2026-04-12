'use client'

import { Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  type SmartPlaylistOperator,
  type SmartPlaylistRule
} from '@/features/smart-playlists/domain'
import { type ColumnField, METADATA_COLUMN_PREFIX } from '@/features/songs/domain'
import { SONG_FIELD_OPTIONS } from './constants'

interface SmartPlaylistRuleRowProps {
  rule: SmartPlaylistRule
  metadataKeys: string[]
  canDelete: boolean
  onUpdate: (patch: Partial<SmartPlaylistRule>) => void
  onRemove: () => void
}

export function SmartPlaylistRuleRow({ rule, metadataKeys, canDelete, onUpdate, onRemove }: SmartPlaylistRuleRowProps) {
  const t = useTranslations('smartPlaylists')
  const tFields = useTranslations('fields')

  const type = getSmartlistFieldType(rule.field)
  const ops = getOperatorsForField(rule.field)
  const showValue = operatorNeedsValue(rule.operator)

  const fieldLabel = (field: ColumnField): string => {
    if (field.startsWith(METADATA_COLUMN_PREFIX)) return field.slice(METADATA_COLUMN_PREFIX.length)
    try {
      return tFields(field as never)
    } catch {
      return field
    }
  }

  const operatorLabel = (op: SmartPlaylistOperator) => t(`operators.${op}`)

  return (
    <div className='grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center'>
      <Select value={rule.field} onValueChange={v => onUpdate({ field: v as ColumnField })}>
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

      <Select value={rule.operator} onValueChange={v => onUpdate({ operator: v as SmartPlaylistOperator })}>
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
          <Input type='number' value={rule.value} onChange={e => onUpdate({ value: e.target.value })} />
        ) : type === 'date' ? (
          <Input type='date' value={rule.value} onChange={e => onUpdate({ value: e.target.value })} />
        ) : (
          <Input
            value={rule.value}
            onChange={e => onUpdate({ value: e.target.value })}
            placeholder={t('create.valuePlaceholder')}
          />
        )
      ) : (
        <div />
      )}

      <Button type='button' variant='ghost' size='icon' onClick={onRemove} disabled={!canDelete}>
        <Trash2Icon className='w-4 h-4' />
      </Button>
    </div>
  )
}
