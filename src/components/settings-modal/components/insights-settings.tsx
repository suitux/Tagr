'use client'

import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useInsights, useUpdateInsights } from '@/features/insights/hooks/use-insights'
import { formatDate, FULL_DATE_FORMAT } from '@/lib/date'

const INSIGHTS_DASHBOARD_URL = 'https://tagr.xavirincon.com/analytics/'

export function InsightsSettings() {
  const t = useTranslations('insights')
  const { data: status, isLoading } = useInsights()
  const updateInsights = useUpdateInsights()

  const handleToggle = (enabled: boolean) => {
    updateInsights.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? t('enabledToast') : t('disabledToast')),
      onError: error => toast.error(error.message)
    })
  }

  if (isLoading || !status) {
    return (
      <div className='flex justify-center py-8'>
        <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h3 className='text-sm font-semibold'>{t('title')}</h3>
        <p className='text-xs text-muted-foreground'>{t('description')}</p>
      </div>

      <div className='flex items-center gap-2'>
        <Checkbox
          id='insights-enabled'
          checked={status.enabled}
          disabled={status.forcedByEnv || updateInsights.isPending}
          onCheckedChange={value => handleToggle(!!value)}
        />
        <Label htmlFor='insights-enabled'>{t('enable')}</Label>
      </div>

      {status.forcedByEnv && <p className='text-xs text-muted-foreground'>{t('forcedByEnv')}</p>}

      <p className='text-xs text-muted-foreground'>
        {status.lastSentAt
          ? t('lastSent', { date: formatDate(status.lastSentAt, FULL_DATE_FORMAT) ?? '' })
          : t('neverSent')}
      </p>

      <p className='text-xs text-muted-foreground'>
        {t.rich('dashboard', {
          link: chunks => (
            <Link href={INSIGHTS_DASHBOARD_URL} target='_blank' rel='noopener noreferrer' className='underline'>
              {chunks}
            </Link>
          )
        })}
      </p>

      <Accordion type='single' collapsible>
        <AccordionItem value='payload'>
          <AccordionTrigger className='text-xs'>{t('preview')}</AccordionTrigger>
          <AccordionContent>
            <p className='mb-2 text-xs text-muted-foreground'>{t('previewHelp', { endpoint: status.endpoint })}</p>
            <pre className='max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs'>
              {JSON.stringify(status.preview, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
