'use client'

import { useTranslations } from 'next-intl'
import { formatSecondsAsDuration } from '@/lib/date'

interface CoverSummaryProps {
  count: number
}

export function CoverSummary({ count }: CoverSummaryProps) {
  const tBulk = useTranslations('bulkEdit')
  const duration = formatSecondsAsDuration(Math.max(1, count)) // ~1s per req
  return (
    <div className='space-y-2 text-sm'>
      <p className='text-muted-foreground'>{tBulk('cover.description')}</p>
      <p className='text-muted-foreground'>{tBulk('cover.estimate', { duration, count })}</p>
    </div>
  )
}
