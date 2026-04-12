'use client'

import { Trash2Icon } from 'lucide-react'
import { type Control, Controller, useFormContext, useWatch } from 'react-hook-form'
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
  type SmartPlaylistOperator
} from '@/features/smart-playlists/domain'
import type { SmartPlaylistFormData } from '@/features/smart-playlists/rules-schema'
import { type ColumnField, METADATA_COLUMN_PREFIX } from '@/features/songs/domain'
import { SONG_FIELD_OPTIONS } from './constants'

interface SmartPlaylistRuleRowProps {
  index: number
  control: Control<SmartPlaylistFormData>
  canDelete: boolean
  metadataKeys: string[]
  onRemove: () => void
}

export function SmartPlaylistRuleRow({ index, control, canDelete, metadataKeys, onRemove }: SmartPlaylistRuleRowProps) {
  const t = useTranslations('smartPlaylists')
  const tFields = useTranslations('fields')
  const { setValue } = useFormContext<SmartPlaylistFormData>()

  const field = useWatch({ control, name: `rules.${index}.field` })
  const operator = useWatch({ control, name: `rules.${index}.operator` })

  const fieldType = getSmartlistFieldType(field as ColumnField)
  const ops = getOperatorsForField(field as ColumnField)
  const showValue = operatorNeedsValue(operator as SmartPlaylistOperator)

  const fieldLabel = (f: ColumnField): string => {
    if (f.startsWith(METADATA_COLUMN_PREFIX)) return f.slice(METADATA_COLUMN_PREFIX.length)
    try {
      return tFields(f as never)
    } catch {
      return f
    }
  }

  const operatorLabel = (op: SmartPlaylistOperator) => t(`operators.${op}`)

  return (
    <div className='grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center'>
      <Controller
        control={control}
        name={`rules.${index}.field`}
        render={({ field: { value, onChange } }) => (
          <Select
            value={value}
            onValueChange={newField => {
              onChange(newField)
              const newOps = getOperatorsForField(newField as ColumnField)
              if (!newOps.includes(operator as SmartPlaylistOperator)) {
                setValue(`rules.${index}.operator`, newOps[0])
              }
              if (getSmartlistFieldType(newField as ColumnField) === 'boolean') {
                setValue(`rules.${index}.value`, '')
              }
            }}>
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
        )}
      />

      <Controller
        control={control}
        name={`rules.${index}.operator`}
        render={({ field: { value, onChange } }) => (
          <Select value={value} onValueChange={onChange}>
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
        )}
      />

      {showValue ? (
        <Controller
          control={control}
          name={`rules.${index}.value`}
          render={({ field: { value, onChange } }) =>
            fieldType === 'number' ? (
              <Input type='number' value={value} onChange={e => onChange(e.target.value)} />
            ) : fieldType === 'date' ? (
              <Input type='date' value={value} onChange={e => onChange(e.target.value)} />
            ) : (
              <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={t('create.valuePlaceholder')}
              />
            )
          }
        />
      ) : (
        <div />
      )}

      <Button type='button' variant='ghost' size='icon' onClick={onRemove} disabled={!canDelete}>
        <Trash2Icon className='w-4 h-4' />
      </Button>
    </div>
  )
}
