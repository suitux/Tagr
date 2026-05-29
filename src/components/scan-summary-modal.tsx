'use client'

import { useTranslations } from 'next-intl'
import { SummaryModal, type SummarySection } from '@/components/summary-modal/summary-modal'
import { useHomeStore } from '@/stores/home-store'

export function ScanSummaryModal() {
  const t = useTranslations('scanSummary')
  const { scanLastResult, scanSummaryOpen, setScanSummaryOpen } = useHomeStore()

  if (!scanLastResult) return null

  const { added, updated, deleted, skipped, errors } = scanLastResult
  const totalFiles = added.count + updated.count + deleted.count + skipped.count + errors.length

  const sections: SummarySection[] = [
    { variant: 'added', count: added.count, files: added.files },
    { variant: 'updated', count: updated.count, files: updated.files },
    { variant: 'deleted', count: deleted.count, files: deleted.files },
    { variant: 'skipped', count: skipped.count },
    { variant: 'errors', count: errors.length, errors }
  ]

  return (
    <SummaryModal
      open={scanSummaryOpen}
      onOpenChange={setScanSummaryOpen}
      title={t('title')}
      totalLabel={t('totalFiles', { count: totalFiles })}
      sections={sections}
    />
  )
}
