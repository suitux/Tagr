'use client'

import { InfoIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmptyState() {
  const tFiles = useTranslations('files')

  return (
    <div className='flex flex-col h-full items-center justify-center text-center p-6'>
      <Card>
        <CardHeader className='text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-2'>
            <InfoIcon className='w-8 h-8 text-muted-foreground/50' />
          </div>
          <CardTitle className='text-base'>{tFiles('details')}</CardTitle>
          <CardDescription>{tFiles('selectFile')}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
