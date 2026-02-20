'use client'

import { FolderIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

interface FolderListEmptyStateProps {
  hasSearchQuery: boolean
}

export function FolderListEmptyState({ hasSearchQuery }: FolderListEmptyStateProps) {
  const t = useTranslations('folders')

  return (
    <Card className='m-2'>
      <CardContent className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
          <FolderIcon className='w-6 h-6 text-muted-foreground' />
        </div>
        <p className='text-sm text-muted-foreground'>{hasSearchQuery ? t('notFound') : t('empty')}</p>
      </CardContent>
    </Card>
  )
}
