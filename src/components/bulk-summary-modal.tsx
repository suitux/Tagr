'use client'

import { useTranslations } from 'next-intl'
import { SummaryModal, type SummarySection } from '@/components/summary-modal/summary-modal'
import { type BulkSummaryKind, useHomeStore } from '@/stores/home-store'

const KIND_CONFIG = {
  edit: { titleKey: 'titleEdit', updatedVariant: 'updated' },
  cover: { titleKey: 'titleCover', updatedVariant: 'cover' },
  'set-cover': { titleKey: 'titleSetCover', updatedVariant: 'cover' }
} as const satisfies Record<BulkSummaryKind, { titleKey: string; updatedVariant: SummarySection['variant'] }>

export function BulkSummaryModal() {
  const t = useTranslations('bulkSummary')
  const { bulkLastResult, bulkSummaryOpen, setBulkSummaryOpen } = useHomeStore()

  if (!bulkLastResult) return null

  const { kind, updated, failed } = bulkLastResult
  const totalFiles = updated.count + failed.count
  const { titleKey, updatedVariant } = KIND_CONFIG[kind]

  const sections: SummarySection[] = [
    { variant: updatedVariant, count: updated.count, files: updated.files },
    { variant: 'errors', count: failed.count, errors: failed.errors }
  ]

  return (
    <SummaryModal
      open={bulkSummaryOpen}
      onOpenChange={setBulkSummaryOpen}
      title={t(titleKey)}
      totalLabel={t('totalFiles', { count: totalFiles })}
      sections={sections}
    />
  )
}
