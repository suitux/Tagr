'use client'

import { useTranslations } from 'next-intl'
import { type SongMetadataUpdate } from '@/features/metadata/domain'

interface PatchSummaryProps {
  patch: Partial<SongMetadataUpdate>
}

export function PatchSummary({ patch }: PatchSummaryProps) {
  const tFields = useTranslations('fields')
  const entries = Object.entries(patch)
  if (entries.length === 0) return null
  return (
    <div className='rounded-md border bg-muted/30 divide-y text-xs'>
      {entries.map(([k, v]) => (
        <div key={k} className='flex justify-between gap-2 px-2.5 py-1.5'>
          <span className='font-medium'>{tFields(k as never)}</span>
          <span className='text-muted-foreground truncate max-w-[60%]'>
            {v === null || v === undefined || v === '' ? '—' : String(v as string | number | boolean)}
          </span>
        </div>
      ))}
    </div>
  )
}
