'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  getSmartlistFieldType,
  getOperatorsForField,
  type SmartPlaylistRule
} from '@/features/smart-playlists/domain'
import { SmartPlaylistRuleRow } from './smart-playlist-rule-row'

interface SmartPlaylistRulesEditorProps {
  match: 'all' | 'any'
  onMatchChange: (match: 'all' | 'any') => void
  rules: SmartPlaylistRule[]
  onRulesChange: (rules: SmartPlaylistRule[]) => void
  metadataKeys: string[]
}

function emptyRule(): SmartPlaylistRule {
  return { field: 'title', operator: 'contains', value: '' }
}

export function SmartPlaylistRulesEditor({
  match,
  onMatchChange,
  rules,
  onRulesChange,
  metadataKeys
}: SmartPlaylistRulesEditorProps) {
  const t = useTranslations('smartPlaylists')

  function updateRule(index: number, patch: Partial<SmartPlaylistRule>) {
    onRulesChange(
      rules.map((r, i) => {
        if (i !== index) return r
        const next = { ...r, ...patch }
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
    onRulesChange([...rules, emptyRule()])
  }

  function removeRule(index: number) {
    if (rules.length > 1) onRulesChange(rules.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className='space-y-2'>
        <Label>{t('create.matchLabel')}</Label>
        <RadioGroup value={match} onValueChange={v => onMatchChange(v as 'all' | 'any')} className='flex gap-4'>
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
      </div>

      <div className='space-y-2'>
        <Label>{t('create.rulesLabel')}</Label>
        <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
          {rules.map((rule, i) => (
            <SmartPlaylistRuleRow
              key={i}
              rule={rule}
              metadataKeys={metadataKeys}
              canDelete={rules.length > 1}
              onUpdate={patch => updateRule(i, patch)}
              onRemove={() => removeRule(i)}
            />
          ))}
        </div>
        <Button type='button' variant='outline' size='sm' onClick={addRule}>
          {t('create.addRule')}
        </Button>
      </div>
    </>
  )
}
