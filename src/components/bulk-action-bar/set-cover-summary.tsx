'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { CoverFilePreview } from './cover-file-preview'

interface SetCoverSummaryProps {
  file: File
  count: number
}

export function SetCoverSummary({ file, count }: SetCoverSummaryProps) {
  const tBulk = useTranslations('bulkEdit')

  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <CoverFilePreview file={file} note={tBulk('setCover.applyNote', { count })} />
      </CardContent>
    </Card>
  )
}
