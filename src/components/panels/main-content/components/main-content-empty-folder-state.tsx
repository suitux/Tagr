'use client'

import { FolderOpenIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MainContentEmptyFolderState() {
  const tFolders = useTranslations('folders')

  return (
    <div className='flex flex-col h-full items-center justify-center text-center p-8'>
      <Card className='max-w-sm w-full'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4'>
            <FolderOpenIcon className='w-10 h-10 text-muted-foreground/50' />
          </div>
          <CardTitle>{tFolders('selectFolder')}</CardTitle>
          <CardDescription>{tFolders('selectFolderDescription')}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
