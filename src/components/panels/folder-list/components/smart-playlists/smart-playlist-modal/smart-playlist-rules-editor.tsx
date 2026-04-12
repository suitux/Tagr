'use client'

import { type Control, Controller, useFieldArray } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SmartPlaylistRuleRow } from './smart-playlist-rule-row'
import type { SmartPlaylistFormData } from './schema'

interface SmartPlaylistRulesEditorProps {
  control: Control<SmartPlaylistFormData>
  metadataKeys: string[]
}

export function SmartPlaylistRulesEditor({ control, metadataKeys }: SmartPlaylistRulesEditorProps) {
  const t = useTranslations('smartPlaylists')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules'
  })

  return (
    <>
      <div className='space-y-2'>
        <Label>{t('create.matchLabel')}</Label>
        <Controller
          control={control}
          name='match'
          render={({ field: { value, onChange } }) => (
            <RadioGroup value={value} onValueChange={onChange} className='flex gap-4'>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='all' id='match-all' />
                <Label htmlFor='match-all' className='cursor-pointer font-normal'>
                  {t('create.matchAll')}
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='any' id='match-any' />
                <Label htmlFor='match-any' className='cursor-pointer font-normal'>
                  {t('create.matchAny')}
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <div className='space-y-2'>
        <Label>{t('create.rulesLabel')}</Label>
        <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
          {fields.map((field, i) => (
            <SmartPlaylistRuleRow
              key={field.id}
              index={i}
              control={control}
              metadataKeys={metadataKeys}
              canDelete={fields.length > 1}
              onRemove={() => remove(i)}
            />
          ))}
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append({ field: 'title', operator: 'contains', value: '' })}>
          {t('create.addRule')}
        </Button>
      </div>
    </>
  )
}
