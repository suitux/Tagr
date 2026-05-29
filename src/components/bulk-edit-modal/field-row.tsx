'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type BulkFieldDescriptor } from '@/features/songs/song-fields'
import { cn } from '@/lib/utils'
import { type AggregateValue, MIXED } from './aggregate-helpers'

interface FieldRowProps {
  field: BulkFieldDescriptor
  aggregate: AggregateValue
  value: string
  isTouched: boolean
  placeholderText: string
  label: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function FieldRow({ field, aggregate, value, isTouched, placeholderText, label, onChange, onBlur }: FieldRowProps) {
  const isMixed = aggregate === MIXED
  const placeholder = isMixed ? placeholderText : ''

  if (field.type === 'boolean') {
    const selectValue = isTouched ? value || '__noop__' : '__noop__'
    return (
      <div className='space-y-1'>
        <Label className={cn('text-xs', isTouched && 'text-primary')}>{label}</Label>
        <Select
          value={selectValue}
          onValueChange={v => {
            if (v === '__noop__') return
            onChange(v)
          }}>
          <SelectTrigger className='w-full' onBlur={onBlur}>
            <SelectValue placeholder={isMixed ? placeholderText : ''} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__noop__' disabled>
              {isMixed ? placeholderText : aggregate === true ? 'Yes' : aggregate === false ? 'No' : '—'}
            </SelectItem>
            <SelectItem value='true'>Yes</SelectItem>
            <SelectItem value='false'>No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  const inputType =
    field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'rating' ? 'number' : 'text'

  return (
    <div className='space-y-1'>
      <Label className={cn('text-xs', isTouched && 'text-primary')}>{label}</Label>
      <Input
        type={inputType}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        {...(field.type === 'rating' && { min: 0, max: 100 })}
      />
    </div>
  )
}
