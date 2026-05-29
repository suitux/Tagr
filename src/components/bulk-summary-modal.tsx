'use client'

import { useTranslations } from 'next-intl'
import { SummaryModal, type SummarySection } from '@/components/summary-modal/summary-modal'
import { useHomeStore } from '@/stores/home-store'

export function BulkSummaryModal() {
  const t = useTranslations('bulkSummary')
  const { bulkLastResult, bulkSummaryOpen, setBulkSummaryOpen } = useHomeStore()

  if (!bulkLastResult) return null

  const { kind, updated, failed } = bulkLastResult
  const totalFiles = updated.count + failed.count
  const updatedVariant = kind === 'cover' ? 'cover' : 'updated'

  const sections: SummarySection[] = [
    { variant: updatedVariant, count: updated.count, files: updated.files },
    { variant: 'errors', count: failed.count, errors: failed.errors }
  ]

  return (
    <SummaryModal
      open={bulkSummaryOpen}
      onOpenChange={setBulkSummaryOpen}
      title={t(kind === 'cover' ? 'titleCover' : 'titleEdit')}
      totalLabel={t('totalFiles', { count: totalFiles })}
      sections={sections}
    />
  )
}
