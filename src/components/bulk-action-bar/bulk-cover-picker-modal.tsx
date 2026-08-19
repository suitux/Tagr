'use client'

import { ImagePlusIcon, UploadIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { MAX_COVER_IMAGE_BYTES } from '@/features/songs/domain'
import { formatFileSize } from '@/lib/formatters'
import { CoverFilePreview } from './cover-file-preview'

interface BulkCoverPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Total number of songs the picked image will be written to. */
  totalAffected: number
  onSubmit: (file: File) => void
}

export function BulkCoverPickerModal({ open, onOpenChange, totalAffected, onSubmit }: BulkCoverPickerModalProps) {
  const tBulk = useTranslations('bulkEdit')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{tBulk('setCover.title')}</DialogTitle>
          <DialogDescription>{tBulk('setCover.description', { count: totalAffected })}</DialogDescription>
        </DialogHeader>

        {/* Mounted only while open so the picked file resets on every close. */}
        {open ? <BulkCoverPickerBody onSubmit={onSubmit} onCancel={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

interface BulkCoverPickerBodyProps {
  onSubmit: (file: File) => void
  onCancel: () => void
}

function BulkCoverPickerBody({ onSubmit, onCancel }: BulkCoverPickerBodyProps) {
  const tBulk = useTranslations('bulkEdit')
  const tCommon = useTranslations('common')

  const inputId = useId()
  const hintId = useId()
  const dragDepth = useRef(0)

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const acceptFile = (picked: File | null | undefined) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setError(tBulk('setCover.errorNotImage'))
      return
    }
    if (picked.size > MAX_COVER_IMAGE_BYTES) {
      setError(tBulk('setCover.errorTooLarge', { size: formatFileSize(MAX_COVER_IMAGE_BYTES) }))
      return
    }
    setError(null)
    setFile(picked)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    acceptFile(e.dataTransfer.files?.[0])
  }

  return (
    <>
      <div className='space-y-3 py-2'>
        <Card
          size='sm'
          onDragEnter={handleDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-dragging={dragging || undefined}
          className='border border-dashed transition-colors data-[dragging]:border-primary data-[dragging]:bg-primary/5'>
          <CardContent className='flex items-center gap-3'>
            {file ? (
              <CoverFilePreview file={file} />
            ) : (
              <>
                <div className='flex size-20 shrink-0 items-center justify-center rounded-md bg-muted'>
                  <ImagePlusIcon className='size-6 text-muted-foreground' aria-hidden='true' />
                </div>
                <p id={hintId} className='text-sm text-muted-foreground'>
                  {tBulk('setCover.dropHint')}
                </p>
              </>
            )}
          </CardContent>

          <CardContent className='flex flex-wrap items-center gap-2'>
            <input
              id={inputId}
              type='file'
              accept='image/*'
              aria-describedby={file ? undefined : hintId}
              className='peer sr-only'
              onChange={e => {
                acceptFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <Button
              asChild
              variant='outline'
              size='sm'
              className='peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50'>
              <label htmlFor={inputId}>
                <UploadIcon aria-hidden='true' />
                {file ? tBulk('setCover.replaceFile') : tBulk('setCover.upload')}
              </label>
            </Button>
            {file && (
              <Button variant='ghost' size='sm' onClick={() => setFile(null)}>
                {tBulk('setCover.removeFile')}
              </Button>
            )}
          </CardContent>
        </Card>

        <p aria-live='polite' className='sr-only'>
          {file ? tBulk('setCover.selectedAnnounce', { name: file.name }) : ''}
        </p>

        {error && (
          <p role='alert' className='text-xs text-destructive'>
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button disabled={!file} onClick={() => file && onSubmit(file)}>
          {tBulk('edit.next')}
        </Button>
      </DialogFooter>
    </>
  )
}
