'use client'

import { CheckIcon, CopyIcon, LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SHARE_EXPIRATION_OPTIONS } from '@/features/share/domain'
import { useCreateShare } from '@/features/share/hooks/use-create-share'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  songId: number
  songTitle: string
}

export function ShareDialog({ open, onOpenChange, songId, songTitle }: ShareDialogProps) {
  const t = useTranslations('share')
  const tTime = useTranslations('time')
  const [expiresInSeconds, setExpiresInSeconds] = useState(86400)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { mutate: createShare, isPending } = useCreateShare()

  function handleGenerate() {
    createShare(
      { songId, expiresInSeconds },
      {
        onSuccess: share => {
          const url = `${window.location.origin}/share/${share.token}`
          setShareUrl(url)
        }
      }
    )
  }

  function handleCopy() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setShareUrl(null)
      setCopied(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground truncate'>{songTitle}</p>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>{t('expiration')}</label>
            <Select value={String(expiresInSeconds)} onValueChange={v => setExpiresInSeconds(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHARE_EXPIRATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.seconds} value={String(opt.seconds)}>
                    {tTime(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!shareUrl ? (
            <Button onClick={handleGenerate} disabled={isPending} className='w-full'>
              <LinkIcon className='h-4 w-4 mr-2' />
              {isPending ? t('generating') : t('generate')}
            </Button>
          ) : (
            <div className='flex gap-2'>
              <Input readOnly value={shareUrl} className='text-xs' />
              <Button variant='outline' size='icon' onClick={handleCopy} className='shrink-0'>
                {copied ? <CheckIcon className='h-4 w-4' /> : <CopyIcon className='h-4 w-4' />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
