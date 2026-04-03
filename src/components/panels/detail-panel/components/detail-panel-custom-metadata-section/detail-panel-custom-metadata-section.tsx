'use client'

import { PlusIcon, TagIcon } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from '@/features/users/lib/hasMinimumRole'
import type { SongMetadata } from '@/generated/prisma/client'
import { DetailPanelRow } from '../detail-panel-row/detail-panel-row'
import { AddCustomTagForm } from './components/add-custom-tag-form'

interface DetailPanelCustomMetadataSectionProps {
  songId: number
  metadata: SongMetadata[]
}

function stripKeyPrefix(key: string): string {
  const parts = key.split(':')
  return parts[parts.length - 1].toUpperCase()
}

function deduplicateMetadata(metadata: SongMetadata[]): { key: string; value: string | null }[] {
  const seen = new Map<string, string | null>()
  for (const m of metadata) {
    const stripped = stripKeyPrefix(m.key)
    if (!seen.has(stripped)) {
      seen.set(stripped, m.value)
    }
  }
  return Array.from(seen.entries()).map(([key, value]) => ({ key, value }))
}

export function DetailPanelCustomMetadataSection({ songId, metadata }: DetailPanelCustomMetadataSectionProps) {
  const t = useTranslations('customTags')
  const { data: session } = useSession()
  const [isAdding, setIsAdding] = useState(false)

  const entries = deduplicateMetadata(metadata)

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('title')}</h3>
        {hasMinimumRole(session?.user?.role as UserRole, 'tagger') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => setIsAdding(true)}
                disabled={isAdding}>
                <PlusIcon className='w-3.5 h-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('addTag')}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Card className='p-0'>
        <CardContent className='p-0 divide-y divide-border'>
          {entries.length === 0 && !isAdding && <p className='p-3 text-xs text-muted-foreground'>{t('empty')}</p>}
          {entries.map(({ key, value }) => (
            <DetailPanelRow
              key={key}
              icon={<TagIcon className='w-4 h-4' />}
              label={key}
              value={value}
              songId={songId}
              fieldName={key}
              isExtraMetadata
            />
          ))}
          {isAdding && <AddCustomTagForm songId={songId} onClose={() => setIsAdding(false)} />}
        </CardContent>
      </Card>
    </div>
  )
}
