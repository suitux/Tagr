import { ClockIcon, DiscIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import LosslessBadge from '@/components/lossless-badge'
import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'

interface ShareFooterProps {
  expiresAt?: string
  lossless: boolean
}

export function ShareFooter({ expiresAt, lossless }: ShareFooterProps) {
  const t = useTranslations('share')

  return (
    <div className='flex items-center justify-between text-xs text-muted-foreground'>
      <div className='flex items-center gap-1.5'>
        <DiscIcon className='h-3 w-3' />
        <span>
          {t('sharedVia')}{' '}
          <Link href={'https://github.com/suitux/tagr'} className='text-primary hover:underline'>
            Tagr
          </Link>
        </span>
      </div>
      {expiresAt && (
        <div className='flex items-center gap-1.5'>
          <ClockIcon className='h-3 w-3' />
          <span>
            {t('expiresAt', {
              date: formatDate(expiresAt, FULL_DATE_FORMAT)!
            })}
          </span>
        </div>
      )}
      {lossless && <LosslessBadge />}
    </div>
  )
}
