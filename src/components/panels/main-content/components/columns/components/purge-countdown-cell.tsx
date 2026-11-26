'use client'

import { HourglassIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DEFAULT_TRASH_RETENTION_DAYS } from '@/features/trash/domain'
import { useTrashSettings } from '@/features/trash/hooks/use-trash-settings'

const DAY_MS = 24 * 60 * 60 * 1000

export function PurgeCountdownCell({ deletedAt }: { deletedAt: Date | string | null }) {
  const t = useTranslations('trash')
  const { data: settings } = useTrashSettings()
  // Day granularity: the moment the row first rendered is close enough.
  const [now] = useState(Date.now)

  if (!deletedAt) return null

  const retentionDays = settings?.retentionDays ?? DEFAULT_TRASH_RETENTION_DAYS
  const purgeAt = new Date(deletedAt).getTime() + retentionDays * DAY_MS
  const daysLeft = Math.max(0, Math.ceil((purgeAt - now) / DAY_MS))

  return (
    <div className='flex items-center justify-end gap-1.5 text-sm text-muted-foreground'>
      <HourglassIcon className='w-3.5 h-3.5' />
      <span>{t('daysLeft', { count: daysLeft })}</span>
    </div>
  )
}
