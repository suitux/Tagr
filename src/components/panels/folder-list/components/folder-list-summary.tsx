'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

interface FolderListSummaryProps {
  totalFolders: number
  totalFiles: number
}

export function FolderListSummary({ totalFolders, totalFiles }: FolderListSummaryProps) {
  const t = useTranslations('folders')

  return (
    <div className='px-3 pb-3 flex gap-2'>
      <Badge variant='secondary'>{t('totalFolders', { count: totalFolders })}</Badge>
      <Badge variant='outline'>{t('files', { count: totalFiles })}</Badge>
    </div>
  )
}
