'use client'

import { useTranslations } from 'next-intl'
import { type BulkPatch } from '@/components/bulk-edit-modal/build-patch'

interface PatchSummaryProps {
  patch: BulkPatch
}

export function PatchSummary({ patch }: PatchSummaryProps) {
  const tFields = useTranslations('fields')
  // Extended tag keys have no translation, so they are labelled with the raw key.
  const entries: [string, unknown][] = [
    ...Object.entries(patch.metadata).map(([key, value]): [string, unknown] => [tFields(key as never), value]),
    ...patch.customMetadata.map((row): [string, unknown] => [row.key, row.value])
  ]
  if (entries.length === 0) return null
  return (
    <div className='rounded-md border bg-muted/30 divide-y text-xs'>
      {entries.map(([k, v]) => (
        <div key={k} className='flex justify-between gap-2 px-2.5 py-1.5'>
          <span className='font-medium'>{k}</span>
          <span className='text-muted-foreground truncate max-w-[60%]'>
            {v === null || v === undefined || v === '' ? '—' : String(v as string | number | boolean)}
          </span>
        </div>
      ))}
    </div>
  )
}
