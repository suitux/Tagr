'use client'

import { AlertCircleIcon, CheckCircleIcon, FilePlusIcon, FileXIcon, PencilIcon, SkipForwardIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScanSummaryResult, useHomeStore } from '@/stores/home-store'

function basename(filePath: string) {
  return filePath.split('/').pop() || filePath
}

function FileList({ files }: { files: string[] }) {
  return (
    <ul className='space-y-0.5'>
      {files.map(filePath => (
        <li key={filePath} className='text-xs text-muted-foreground truncate' title={filePath}>
          {basename(filePath)}
        </li>
      ))}
    </ul>
  )
}

function ErrorList({ errors }: { errors: Array<{ path: string; error: string }> }) {
  return (
    <ul className='space-y-1'>
      {errors.map(({ path: filePath, error }) => (
        <li key={filePath} className='text-xs'>
          <span className='text-muted-foreground truncate block' title={filePath}>
            {basename(filePath)}
          </span>
          <span className='text-destructive'>{error}</span>
        </li>
      ))}
    </ul>
  )
}

export function ScanSummaryModal() {
  const t = useTranslations('scanSummary')
  const { scanLastResult, scanSummaryOpen, setScanSummaryOpen } = useHomeStore()

  if (!scanLastResult) return null

  const totalFiles = scanLastResult.totalScanned + scanLastResult.totalSkipped

  const sections = [
    {
      id: 'added',
      icon: FilePlusIcon,
      label: t('added'),
      count: scanLastResult.totalAdded,
      color: 'text-green-500',
      content: <FileList files={scanLastResult.addedFiles} />
    },
    {
      id: 'updated',
      icon: PencilIcon,
      label: t('updated'),
      count: scanLastResult.totalUpdated,
      color: 'text-blue-500',
      content: <FileList files={scanLastResult.updatedFiles} />
    },
    {
      id: 'deleted',
      icon: FileXIcon,
      label: t('deleted'),
      count: scanLastResult.totalDeleted,
      color: 'text-orange-500',
      content: <FileList files={scanLastResult.deletedFiles} />
    },
    {
      id: 'skipped',
      icon: SkipForwardIcon,
      label: t('skipped'),
      count: scanLastResult.totalSkipped,
      color: 'text-muted-foreground',
      content: <FileList files={scanLastResult.skippedFiles} />
    },
    {
      id: 'errors',
      icon: AlertCircleIcon,
      label: t('errors'),
      count: scanLastResult.totalErrors,
      color: 'text-destructive',
      content: <ErrorList errors={scanLastResult.errors} />
    }
  ].filter(s => s.count > 0)

  return (
    <Dialog open={scanSummaryOpen} onOpenChange={setScanSummaryOpen}>
      <DialogContent className='max-w-md max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-500' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>{t('totalFiles', { count: totalFiles })}</p>

        <div className='overflow-y-auto -mx-4 px-4'>
          <Accordion type='multiple'>
            {sections.map(({ id, icon: Icon, label, count, color, content }) => (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger>
                  <span className='flex items-center gap-2'>
                    <Icon className={`h-4 w-4 ${color}`} />
                    {label}
                    <span className='text-muted-foreground font-normal'>({count})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>{content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
