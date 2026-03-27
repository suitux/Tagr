'use client'

import { StarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConfig } from '@/features/config/hooks/use-config'
import { useUpdateConfig } from '@/features/config/hooks/use-update-config'

const GITHUB_URL = 'https://github.com/suitux/Tagr'
const EDIT_COUNT_KEY = 'tagr-edit-count'
const EDITS_THRESHOLD = 5

function getEditCount(): number {
  try {
    return parseInt(localStorage.getItem(EDIT_COUNT_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

export function incrementEditCount() {
  try {
    const count = getEditCount() + 1
    localStorage.setItem(EDIT_COUNT_KEY, String(count))
    return count
  } catch {
    return 0
  }
}

export function StarPromptDialog() {
  const t = useTranslations('starPrompt')
  const [open, setOpen] = useState(false)
  const { data: dismissed, isSuccess } = useConfig({ key: 'starPromptDismissed', parser: v => v === 'true' })
  const { mutate: updateConfig } = useUpdateConfig({ parser: v => v === 'true' })

  useEffect(() => {
    if (isSuccess && !dismissed && getEditCount() >= EDITS_THRESHOLD) {
      setOpen(true)
    }
  }, [isSuccess, dismissed])

  const handleDismiss = () => {
    setOpen(false)
    updateConfig({ key: 'starPromptDismissed', value: 'true' })
  }

  const handleStar = () => {
    window.open(GITHUB_URL, '_blank', 'noopener')
    handleDismiss()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleDismiss()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <StarIcon className='h-5 w-5 text-yellow-500' />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={handleDismiss}>
            {t('maybeLater')}
          </Button>
          <Button onClick={handleStar}>
            <StarIcon className='h-4 w-4' />
            {t('starOnGithub')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
