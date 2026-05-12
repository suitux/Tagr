'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type SongMetadataUpdate } from '@/features/metadata/domain'
import { type Song } from '@/features/songs/domain'
import { BulkEditFormBody } from './bulk-edit-form-body'

interface BulkEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Subset of selected songs available in the cache. */
  loadedSongs: Song[]
  /** Total number of songs the bulk operation will affect. */
  totalAffected: number
  onSubmit: (patch: Partial<SongMetadataUpdate>) => void
}

export function BulkEditModal({ open, onOpenChange, loadedSongs, totalAffected, onSubmit }: BulkEditModalProps) {
  const tBulk = useTranslations('bulkEdit')
  const tCommon = useTranslations('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden'>
        <DialogHeader className='shrink-0 border-b px-4 pt-4 pb-3'>
          <DialogTitle>{tBulk('edit.title')}</DialogTitle>
          <DialogDescription>{tBulk('edit.description')}</DialogDescription>
        </DialogHeader>

        {open ? (
          <BulkEditFormBody
            loadedSongs={loadedSongs}
            totalAffected={totalAffected}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            cancelLabel={tCommon('cancel')}
            continueLabel={tBulk('edit.next')}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
