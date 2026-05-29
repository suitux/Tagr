'use client'

import {
  AlertCircleIcon,
  CheckCircleIcon,
  FilePlusIcon,
  FileXIcon,
  ImageIcon,
  type LucideIcon,
  PencilIcon,
  SkipForwardIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SummaryErrorList } from './summary-error-list'
import { SummaryFileList } from './summary-file-list'

export type SummarySection =
  | { variant: 'added' | 'updated' | 'cover' | 'deleted'; count: number; files: string[] }
  | { variant: 'skipped'; count: number }
  | { variant: 'errors'; count: number; errors: Array<{ path: string; error: string }> }

type VariantConfig = {
  icon: LucideIcon
  color: string
  labelKey: 'added' | 'updated' | 'cover' | 'deleted' | 'skipped' | 'errors'
}

const VARIANT_CONFIG: Record<SummarySection['variant'], VariantConfig> = {
  added: { icon: FilePlusIcon, color: 'text-green-500', labelKey: 'added' },
  updated: { icon: PencilIcon, color: 'text-blue-500', labelKey: 'updated' },
  cover: { icon: ImageIcon, color: 'text-blue-500', labelKey: 'cover' },
  deleted: { icon: FileXIcon, color: 'text-orange-500', labelKey: 'deleted' },
  skipped: { icon: SkipForwardIcon, color: 'text-muted-foreground', labelKey: 'skipped' },
  errors: { icon: AlertCircleIcon, color: 'text-destructive', labelKey: 'errors' }
}

function renderSectionContent(section: SummarySection) {
  switch (section.variant) {
    case 'added':
    case 'updated':
    case 'cover':
    case 'deleted':
      return <SummaryFileList files={section.files} total={section.count} />
    case 'errors':
      return <SummaryErrorList errors={section.errors} />
    case 'skipped':
      return null
  }
}

interface SummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  titleIcon?: LucideIcon
  totalLabel: string
  sections: SummarySection[]
}

export function SummaryModal({
  open,
  onOpenChange,
  title,
  titleIcon: TitleIcon = CheckCircleIcon,
  totalLabel,
  sections
}: SummaryModalProps) {
  const t = useTranslations('summary')
  const visibleSections = sections.filter(s => s.count > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <TitleIcon className='h-5 w-5 text-green-500' />
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className='text-sm text-muted-foreground'>{totalLabel}</p>

        <div className='overflow-y-auto -mx-4 px-4'>
          <Accordion type='multiple'>
            {visibleSections.map(section => {
              const config = VARIANT_CONFIG[section.variant]
              const Icon = config.icon
              const label = t(config.labelKey)
              const content = renderSectionContent(section)
              if (content) {
                return (
                  <AccordionItem key={section.variant} value={section.variant}>
                    <AccordionTrigger>
                      <span className='flex items-center gap-2'>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {label}
                        <span className='text-muted-foreground font-normal'>({section.count})</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>{content}</AccordionContent>
                  </AccordionItem>
                )
              }
              return (
                <div
                  key={section.variant}
                  className='flex items-center gap-2 py-2.5 text-sm font-medium not-last:border-b'>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  {label}
                  <span className='text-muted-foreground font-normal'>({section.count})</span>
                </div>
              )
            })}
          </Accordion>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
