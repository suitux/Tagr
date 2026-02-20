'use client'

import { AlertTriangleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderListHeader } from './folder-list-header'

export function FolderListErrorState() {
  const t = useTranslations('folders')

  return (
    <div className='flex flex-col h-full'>
      <FolderListHeader />
      <div className='flex-1 flex items-center justify-center p-4'>
        <Card className='w-full'>
          <CardHeader className='text-center pb-2'>
            <div className='mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2'>
              <AlertTriangleIcon className='w-6 h-6 text-destructive' />
            </div>
            <CardTitle className='text-base'>{t('errorLoading')}</CardTitle>
            <CardDescription>{t('errorLoadingDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

