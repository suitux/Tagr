'use client'

import { ChartNoAxesColumnIcon, ChevronDownIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useInsights, useInsightsNotice, useUpdateInsights } from '@/features/insights/hooks/use-insights'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'
import { cn } from '@/lib/utils'

const INSIGHTS_DASHBOARD_URL = 'https://tagr.xavirincon.com/insights/'

/**
 * Asks an admin once, after installing or upgrading, whether to send usage statistics.
 * Reports are held back until it is answered. Closing it without answering only hides it
 * until the next visit.
 */
export function InsightsNoticeDialog() {
  const t = useTranslations('insights')
  const { data: session } = useSession()
  const isAdmin = hasMinimumRole(session?.user?.role as UserRole, 'admin')
  const { data: notice } = useInsightsNotice(isAdmin)
  const updateInsights = useUpdateInsights()

  const [closedForNow, setClosedForNow] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  // The full report runs every counter, so it is only fetched when asked for
  const { data: status, isLoading: isPreviewLoading } = useInsights(detailsOpen)

  const open = isAdmin && !!notice?.pending && !closedForNow

  const answer = (enabled: boolean) => {
    updateInsights.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? t('enabledToast') : t('disabledToast')),
      onError: error => toast.error(error.message)
    })
  }

  return (
    <Dialog open={open} onOpenChange={value => !value && setClosedForNow(true)}>
      <DialogContent className='max-h-[90dvh] overflow-y-auto md:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ChartNoAxesColumnIcon className='h-5 w-5 text-primary' />
            {t('noticeTitle')}
          </DialogTitle>
          <DialogDescription>{t('noticeBody')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 text-sm'>
          <div>
            <p className='font-medium'>{t('noticeSentTitle')}</p>
            <p className='text-muted-foreground'>{t('noticeSent')}</p>
          </div>
          <div>
            <p className='font-medium'>{t('noticeNeverTitle')}</p>
            <p className='text-muted-foreground'>{t('noticeNever')}</p>
          </div>
          <p className='text-xs text-muted-foreground'>
            {t.rich('dashboard', {
              link: chunks => (
                <Link href={INSIGHTS_DASHBOARD_URL} target='_blank' rel='noopener noreferrer' className='underline'>
                  {chunks}
                </Link>
              )
            })}{' '}
            {t('noticeLater')}
          </p>

          {/* Not an Accordion: it locks its height when opened, before the report has loaded */}
          <div>
            <Button
              variant='ghost'
              size='sm'
              className='-ml-2 text-xs'
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen(value => !value)}>
              <ChevronDownIcon className={cn('h-4 w-4 transition-transform', detailsOpen && 'rotate-180')} />
              {t('noticeDetails')}
            </Button>
            {detailsOpen &&
              (isPreviewLoading || !status ? (
                <div className='flex justify-center py-4'>
                  <Loader2Icon className='h-4 w-4 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <pre className='mt-2 max-h-[50dvh] overflow-auto rounded-md bg-muted p-3 text-xs'>
                  {JSON.stringify(status.preview, null, 2)}
                </pre>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' disabled={updateInsights.isPending} onClick={() => answer(false)}>
            {t('noticeDisable')}
          </Button>
          <Button disabled={updateInsights.isPending} onClick={() => answer(true)}>
            {updateInsights.isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
            {t('noticeKeep')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
