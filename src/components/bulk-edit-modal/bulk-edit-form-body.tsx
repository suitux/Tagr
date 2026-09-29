'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { FieldVisibilityMenu } from '@/components/field-visibility-menu'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { useBulkEditFields } from '@/features/songs/hooks/use-bulk-edit-fields'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'
import { stripKeyPrefix } from '@/features/songs/metadata-helpers'
import { type Song } from '@/features/songs/domain'
import {
  BULK_EDITABLE_FIELDS,
  buildCustomFieldDescriptor,
  getCustomTagKey,
  isCustomBulkField,
  type BulkFieldDescriptor,
  type BulkFieldSection,
  type BulkFormFieldKey
} from '@/features/songs/song-fields'
import { type AggregateValue, MIXED, computeAggregate, computeCustomAggregate } from './aggregate-helpers'
import { AddCustomFieldForm } from './add-custom-field-form'
import { buildBulkPatch, type BulkPatch, type FormShape } from './build-patch'
import { FieldRow } from './field-row'

const SECTION_ORDER: BulkFieldSection[] = ['music', 'track', 'misc', 'custom']

interface BulkEditFormBodyProps {
  loadedSongs: Song[]
  totalAffected: number
  onSubmit: (patch: BulkPatch) => void
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

  const { fields: savedFields, saveFields } = useBulkEditFields()
  const { data: libraryKeys = [] } = useMetadataKeys()

  const hidden = useMemo(() => new Set(savedFields.hidden ?? []), [savedFields.hidden])
  const customKeys = useMemo(() => savedFields.custom ?? [], [savedFields.custom])

  /** Standard fields plus every extended tag key the user can pick from. */
  const menuFields = useMemo(() => {
    const knownKeys = new Set([...libraryKeys.map(stripKeyPrefix), ...customKeys])
    const custom = Array.from(knownKeys).sort((a, b) => a.localeCompare(b)).map(buildCustomFieldDescriptor)
    return [...BULK_EDITABLE_FIELDS, ...custom]
  }, [libraryKeys, customKeys])

  const visibleFields = useMemo<BulkFieldDescriptor[]>(
    () => [
      ...BULK_EDITABLE_FIELDS.filter(field => !hidden.has(field.key)),
      ...customKeys.map(buildCustomFieldDescriptor)
    ],
    [hidden, customKeys]
  )

  const aggregates = useMemo(() => {
    const map = new Map<BulkFormFieldKey, AggregateValue>()
    for (const f of visibleFields) {
      map.set(
        f.key,
        f.custom
          ? computeCustomAggregate(loadedSongs, getCustomTagKey(f.key), hasUnloadedSamples)
          : computeAggregate(loadedSongs, f.key, f.type, hasUnloadedSamples)
      )
    }
    return map
  }, [visibleFields, loadedSongs, hasUnloadedSamples])

  const defaultValue = (key: BulkFormFieldKey) => {
    const agg = aggregates.get(key)
    return agg === MIXED || agg === null || agg === undefined ? '' : String(agg)
  }

  const defaultValues = useMemo<FormShape>(() => {
    const obj = {} as FormShape
    for (const [key, agg] of aggregates) {
      obj[key] = agg === MIXED || agg === null ? '' : String(agg)
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
  const [touched, setTouched] = useState<Set<BulkFormFieldKey>>(() => new Set())

  const markTouched = (key: BulkFormFieldKey) => {
    setTouched(prev => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const forgetTouched = (key: BulkFormFieldKey) => {
    setTouched(prev => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const fieldsBySection = useMemo(() => {
    const map = new Map<BulkFieldSection, BulkFieldDescriptor[]>()
    for (const f of visibleFields) {
      const arr = map.get(f.section) ?? []
      arr.push(f)
      map.set(f.section, arr)
    }
    return map
  }, [visibleFields])

  const fieldLabel = (f: BulkFieldDescriptor) => (f.custom ? f.label : tFields(f.labelKey))

  const toggleField = (key: BulkFormFieldKey, visible: boolean) => {
    // A hidden row can no longer be submitted, so its pending edit goes with it.
    if (!visible) forgetTouched(key)

    if (isCustomBulkField(key)) {
      const tagKey = getCustomTagKey(key)
      const next = visible ? [...customKeys, tagKey] : customKeys.filter(k => k !== tagKey)
      saveFields({ ...savedFields, custom: next })
      return
    }

    const nextHidden = visible ? [...hidden].filter(k => k !== key) : [...hidden, key]
    saveFields({ ...savedFields, hidden: nextHidden })
  }

  const addCustomKey = (rawKey: string) => {
    const tagKey = stripKeyPrefix(rawKey.trim()).toUpperCase()
    if (!tagKey || customKeys.includes(tagKey)) return
    saveFields({ ...savedFields, custom: [...customKeys, tagKey] })
  }

  const handleValid = (values: FormShape) => {
    if (touched.size === 0) return
    onSubmit(buildBulkPatch(values, touched))
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className='flex min-h-0 flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4'>
        <div className='flex items-center justify-between gap-2'>
          <FieldVisibilityMenu
            fields={menuFields.map(f => f.key)}
            isVisible={key => visibleFields.some(f => f.key === key)}
            onToggle={toggleField}
            label={key => {
              const field = menuFields.find(f => f.key === key)
              return field ? fieldLabel(field) : key
            }}
            triggerLabel={tBulk('edit.fieldsMenu')}
            footer={<AddCustomFieldForm onAdd={addCustomKey} />}
          />
        </div>

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
                    defaultValue={defaultValue(f.key)}
                    render={({ field }) => (
                      <FieldRow
                        field={f}
                        aggregate={aggregates.get(f.key) ?? null}
                        value={field.value ?? ''}
                        isTouched={touched.has(f.key)}
                        placeholderText={placeholderText}
                        label={fieldLabel(f)}
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
