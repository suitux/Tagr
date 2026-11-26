'use client'

import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { isTrashRetentionDays, TRASH_RETENTION_OPTIONS, type TrashRetentionDays } from '@/features/trash/domain'
import { useTrashSettings, useUpdateTrashSettings } from '@/features/trash/hooks/use-trash-settings'
import { fetchExpiredCount } from '@/features/trash/hooks/use-trash-summary'

export function TrashSettings() {
  const t = useTranslations('trash.settings')
  const tCommon = useTranslations('common')
  const { confirm } = useAlertDialog()
  const { data: settings, isLoading } = useTrashSettings()
  const { mutate, isPending } = useUpdateTrashSettings()

  const save = (retentionDays: TrashRetentionDays) => {
    mutate(retentionDays, {
      onSuccess: () => toast.success(t('savedToast')),
      onError: error => toast.error(error.message)
    })
  }

  const handleChange = async (value: string) => {
    const retentionDays = Number(value)
    if (!isTrashRetentionDays(retentionDays) || !settings) return

    // A shorter retention reaches back to what is already in the trash: say how much goes right now.
    const expired = retentionDays < settings.retentionDays ? await fetchExpiredCount(retentionDays).catch(() => 0) : 0
    if (expired === 0) return save(retentionDays)

    confirm({
      title: t('confirmTitle', { days: retentionDays }),
      description: t('confirmDescription', { count: expired, days: retentionDays }),
      cancel: { label: tCommon('cancel') },
      action: { label: t('confirmAction'), variant: 'destructive', onClick: () => save(retentionDays) }
    })
  }

  if (isLoading || !settings) {
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

      <div className='flex flex-col gap-2'>
        <Label htmlFor='trash-retention-select'>{t('retentionLabel')}</Label>
        <Select
          value={String(settings.retentionDays)}
          onValueChange={value => void handleChange(value)}
          disabled={isPending}
        >
          <SelectTrigger id='trash-retention-select' className='w-56'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRASH_RETENTION_OPTIONS.map(days => (
              <SelectItem key={days} value={String(days)}>
                {t('retentionOption', { count: days })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-xs text-muted-foreground'>{t('retentionHelp')}</p>
      </div>
    </div>
  )
}
