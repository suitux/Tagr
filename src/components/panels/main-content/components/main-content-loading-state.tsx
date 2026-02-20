'use client'

import { Loader2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function MainContentLoadingState() {
  const tFolders = useTranslations('folders')

  return (
    <div className='flex flex-col h-full items-center justify-center'>
      <Loader2Icon className='w-8 h-8 animate-spin text-muted-foreground' />
      <p className='text-sm text-muted-foreground mt-2'>{tFolders('loadingFolders')}</p>
    </div>
  )
}
