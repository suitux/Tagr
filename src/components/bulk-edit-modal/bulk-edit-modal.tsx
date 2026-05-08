'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { type Song } from '@/features/songs/domain'
import {
  BULK_EDITABLE_FIELDS,
  type BulkEditableField,
  type BulkFieldDescriptor,
  type BulkFieldSection
} from '@/features/songs/song-fields'
import { cn } from '@/lib/utils'
import { type AggregateValue, MIXED, computeAggregate } from './aggregate-helpers'

type FormShape = Record<BulkEditableField, string>

interface BulkEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Subset of selected songs available in the cache. */
  loadedSongs: Song[]
  /** Total number of songs the bulk operation will affect. */
  totalAffected: number
  onSubmit: (patch: Partial<SongMetadataUpdate>) => void
}

const SECTION_ORDER: BulkFieldSection[] = ['music', 'track', 'misc']

export function BulkEditModal({ open, onOpenChange, loadedSongs, totalAffected, onSubmit }: BulkEditModalProps) {
  const tBulk = useTranslations('bulkEdit')
  const tCommon = useTranslations('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{tBulk('edit.title')}</DialogTitle>
          <DialogDescription>{tBulk('edit.description')}</DialogDescription>
        </DialogHeader>

        {open ? (
          <BulkEditFormBody
            loadedSongs={loadedSongs}
            totalAffected={totalAffected}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            cancelLabel={tCommon('cancel')}
            continueLabel={tBulk('edit.next')}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

interface BulkEditFormBodyProps {
  loadedSongs: Song[]
  totalAffected: number
  onSubmit: (patch: Partial<SongMetadataUpdate>) => void
  onCancel: () => void
  cancelLabel: string
  continueLabel: string
}

function BulkEditFormBody({
  loadedSongs,
  totalAffected,
  onSubmit,
  onCancel,
  cancelLabel,
  continueLabel
}: BulkEditFormBodyProps) {
  const tBulk = useTranslations('bulkEdit')
  const tFields = useTranslations('fields')

  const hasUnloadedSamples = loadedSongs.length < totalAffected
  const placeholderText = tBulk('edit.variousPlaceholder')

  const aggregates = useMemo(() => {
    const map = new Map<BulkEditableField, AggregateValue>()
    for (const f of BULK_EDITABLE_FIELDS) {
      map.set(f.key, computeAggregate(loadedSongs, f.key, f.type, hasUnloadedSamples))
    }
    return map
  }, [loadedSongs, hasUnloadedSamples])

  const defaultValues = useMemo<FormShape>(() => {
    const obj = {} as FormShape
    for (const f of BULK_EDITABLE_FIELDS) {
      const agg = aggregates.get(f.key)
      obj[f.key] = agg === MIXED || agg === null ? '' : String(agg)
    }
    return obj
  }, [aggregates])

  const { control, handleSubmit } = useForm<FormShape>({
    defaultValues,
    mode: 'onChange'
  })

  // Custom touched-set tracking. RHF's dirtyFields flips back to false when
  // a user re-types the original value, but we need an explicit "user
  // intentionally edited this field" signal even if the resulting value
  // matches the aggregate (notably: clearing a shared field to remove it).
  const [touched, setTouched] = useState<Set<BulkEditableField>>(() => new Set())

  const markTouched = (key: BulkEditableField) => {
    setTouched(prev => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const fieldsBySection = useMemo(() => {
    const map = new Map<BulkFieldSection, BulkFieldDescriptor[]>()
    for (const f of BULK_EDITABLE_FIELDS) {
      const arr = map.get(f.section) ?? []
      arr.push(f)
      map.set(f.section, arr)
    }
    return map
  }, [])

  const handleValid = (values: FormShape) => {
    if (touched.size === 0) return
    const patch: Partial<SongMetadataUpdate> = {}
    for (const key of touched) {
      const f = BULK_EDITABLE_FIELDS.find(field => field.key === key)
      if (!f) continue
      const v = values[key] ?? ''
      if (v === '') {
        ;(patch as Record<string, unknown>)[key] = null
        continue
      }
      switch (f.type) {
        case 'number':
        case 'rating': {
          const n = Number(v)
          if (Number.isFinite(n)) (patch as Record<string, unknown>)[key] = n
          break
        }
        case 'boolean':
          ;(patch as Record<string, unknown>)[key] = v === 'true'
          break
        case 'date':
          ;(patch as Record<string, unknown>)[key] = v
          break
        default:
          ;(patch as Record<string, unknown>)[key] = v
      }
    }
    onSubmit(patch)
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className='contents'>
      {hasUnloadedSamples && (
        <p className='text-xs rounded-md border border-yellow-500/30 bg-yellow-500/5 px-2.5 py-2 text-yellow-700 dark:text-yellow-400'>
          {tBulk('edit.partialSampleNote', { loaded: loadedSongs.length, total: totalAffected })}
        </p>
      )}

      <div className='space-y-5 py-2'>
        {SECTION_ORDER.map(section => {
          const fields = fieldsBySection.get(section) ?? []
          if (fields.length === 0) return null
          return (
            <div key={section} className='space-y-2'>
              <h4 className='text-xs uppercase tracking-wide font-medium text-muted-foreground'>
                {tBulk(`edit.sections.${section}`)}
              </h4>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {fields.map(f => (
                  <Controller
                    key={f.key}
                    control={control}
                    name={f.key}
                    render={({ field }) => (
                      <FieldRow
                        field={f}
                        aggregate={aggregates.get(f.key) ?? null}
                        value={field.value}
                        isTouched={touched.has(f.key)}
                        placeholderText={placeholderText}
                        label={tFields(f.labelKey)}
                        onChange={v => {
                          field.onChange(v)
                          markTouched(f.key)
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type='submit' disabled={touched.size === 0}>
          {continueLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

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

function FieldRow({ field, aggregate, value, isTouched, placeholderText, label, onChange, onBlur }: FieldRowProps) {
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
