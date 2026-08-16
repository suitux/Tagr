'use client'

import { SettingsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ListenBrainzSettings } from './components/listenbrainz-settings'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const t = useTranslations('settings')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <SettingsIcon className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <ListenBrainzSettings />
      </DialogContent>
    </Dialog>
  )
}
