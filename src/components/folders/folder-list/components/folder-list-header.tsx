'use client'

import { FolderIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FolderListHeader() {
  const t = useTranslations('folders')

  return (
    <div className='px-4 py-5'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20'>
          <FolderIcon className='w-5 h-5 text-primary-foreground' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-foreground'>{t('title')}</h2>
          <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
        </div>
      </div>
    </div>
  )
}
