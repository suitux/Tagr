'use client'

import { PlusIcon, TagIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCanEditSong } from '@/features/songs/hooks/use-can-edit-song'
import { useDetailPanelFields } from '@/features/songs/hooks/use-detail-panel-fields'
import { useMetadataKeys } from '@/features/songs/hooks/use-metadata-keys'
import { joinMultiValue, stripKeyPrefix } from '@/features/songs/metadata-helpers'
import type { SongMetadata } from '@/generated/prisma/client'
import { DetailPanelRow } from '../detail-panel-row/detail-panel-row'
import { AddCustomTagForm } from './components/add-custom-tag-form'

interface DetailPanelCustomMetadataSectionProps {
  songId: number
  metadata: SongMetadata[]
}

function groupMetadata(metadata: SongMetadata[]): { key: string; value: string | null }[] {
  const groups = new Map<string, (string | null)[]>()
  for (const m of metadata) {
    const stripped = stripKeyPrefix(m.key)
    const arr = groups.get(stripped) ?? []
    arr.push(m.value)
    groups.set(stripped, arr)
  }
  return Array.from(groups.entries()).map(([key, values]) => ({
    key,
    value: joinMultiValue(values)
  }))
}

export function DetailPanelCustomMetadataSection({ songId, metadata }: DetailPanelCustomMetadataSectionProps) {
  const t = useTranslations('customTags')
  const canEdit = useCanEditSong()
  const [isAdding, setIsAdding] = useState(false)
  const { isCustomTagVisible } = useDetailPanelFields()
  const { data: metadataKeys = [] } = useMetadataKeys()

  const entries = groupMetadata(metadata)
  const visibleEntries = entries.filter(({ key }) => isCustomTagVisible(key))

  if (metadataKeys.length > 0 && !metadataKeys.some(isCustomTagVisible)) return null

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('title')}</h3>
        {canEdit && (
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
          {entries.length > 0 && visibleEntries.length === 0 && !isAdding && (
            <p className='p-3 text-xs text-muted-foreground'>{t('allHidden')}</p>
          )}
          {visibleEntries.map(({ key, value }) => (
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
