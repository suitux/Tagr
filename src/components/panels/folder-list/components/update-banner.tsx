'use client'

import { ArrowUpCircleIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useVersionCheck } from '@/features/version/hooks/use-version-check'

export function UpdateBanner() {
  const t = useTranslations('version')
  const { showNotification, latest, releaseUrl, dismiss } = useVersionCheck()

  if (!showNotification || !latest) return null

  return (
    <div className='mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
      <ArrowUpCircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
      <div className='flex-1 text-xs'>
        <p className='font-medium text-foreground'>{t('updateAvailable', { version: latest })}</p>
        {releaseUrl && (
          <a
            href={releaseUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary underline-offset-2 hover:underline'
          >
            {t('viewRelease')}
          </a>
        )}
      </div>
      <button onClick={dismiss} className='shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground'>
        <XIcon className='h-3.5 w-3.5' />
        <span className='sr-only'>{t('dismiss')}</span>
      </button>
    </div>
  )
}
