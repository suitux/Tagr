'use client'

import { LoaderCircle } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BulkConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  affectedCount: number
  contextLabel: string
  changes: ReactNode
  warning?: string
  busy?: boolean
}

export function BulkConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  affectedCount,
  contextLabel,
  changes,
  warning,
  busy = false
}: BulkConfirmModalProps) {
  const tCommon = useTranslations('common')
  const tBulk = useTranslations('bulkEdit')

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {tBulk('confirm.affecting', { count: affectedCount })} · {contextLabel}
          </DialogDescription>
        </DialogHeader>

        <div className='py-2 text-sm space-y-3'>
          {changes}
          {warning && (
            <p className='text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-md px-2.5 py-2'>
              {warning}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {busy && <LoaderCircle className='animate-spin' />}
            {tBulk('confirm.applyToCount', { count: affectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
