'use client'

import { FileAudioIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

export function EmptyFilesState() {
  const tFiles = useTranslations('files')

  return (
    <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8'>
      <Card className='max-w-sm'>
        <CardContent className='pt-6'>
          <div className='mx-auto w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4'>
            <FileAudioIcon className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground'>{tFiles('empty')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
