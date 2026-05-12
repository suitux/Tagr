'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { type Song } from '@/features/songs/domain'
import {
  BULK_EDITABLE_FIELDS,
  type BulkEditableField,
  type BulkFieldDescriptor,
  type BulkFieldSection
} from '@/features/songs/song-fields'
import { type AggregateValue, MIXED, computeAggregate } from './aggregate-helpers'
import { buildBulkPatch, type FormShape } from './build-patch'
import { FieldRow } from './field-row'

const SECTION_ORDER: BulkFieldSection[] = ['music', 'track', 'misc']

interface BulkEditFormBodyProps {
  loadedSongs: Song[]
  totalAffected: number
  onSubmit: (patch: Partial<SongMetadataUpdate>) => void
  onCancel: () => void
  cancelLabel: string
  continueLabel: string
}

export function BulkEditFormBody({
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
    onSubmit(buildBulkPatch(values, touched))
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className='flex min-h-0 flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4'>
        {hasUnloadedSamples && (
          <p className='text-xs rounded-md border border-yellow-500/30 bg-yellow-500/5 px-2.5 py-2 text-yellow-700 dark:text-yellow-400'>
            {tBulk('edit.partialSampleNote', { loaded: loadedSongs.length, total: totalAffected })}
          </p>
        )}

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

      <DialogFooter className='shrink-0 py-4 m-0'>
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
