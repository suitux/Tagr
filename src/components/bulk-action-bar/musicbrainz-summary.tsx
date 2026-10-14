'use client'

import { useTranslations } from 'next-intl'
import { type BulkMusicBrainzSubmission } from '@/components/bulk-musicbrainz-modal/bulk-musicbrainz-modal'

interface MusicBrainzSummaryProps {
  submission: BulkMusicBrainzSubmission
}

export function MusicBrainzSummary({ submission }: MusicBrainzSummaryProps) {
  const t = useTranslations('bulkMusicbrainz')
  const tFields = useTranslations('fields')

  const rows: [string, string][] = [
    [t('summary.release'), submission.releaseTitle],
    [t('summary.fields'), submission.fields.map(field => tFields(field)).join(', ') || '—'],
    [t('summary.cover'), submission.coverReleaseId ? t('summary.yes') : t('summary.no')]
  ]

  return (
    <div className='space-y-2 text-sm'>
      <p className='text-muted-foreground'>{t('summary.description')}</p>
      <div className='divide-y rounded-md border bg-muted/30 text-xs'>
        {rows.map(([label, value]) => (
          <div key={label} className='flex justify-between gap-2 px-2.5 py-1.5'>
            <span className='font-medium'>{label}</span>
            <span className='max-w-[60%] text-right text-muted-foreground'>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
