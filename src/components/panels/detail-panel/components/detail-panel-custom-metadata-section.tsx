'use client'

import { PlusIcon, TagIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import type { SongMetadata } from '@/generated/prisma/client'
import { DetailPanelRow } from './detail-panel-row/detail-panel-row'

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
  const { mutate: updateSong, isPending } = useUpdateSong()
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const entries = deduplicateMetadata(metadata)

  const handleAdd = () => {
    if (!newKey.trim()) return
    updateSong(
      {
        id: songId,
        metadata: { customMetadata: [{ key: newKey.trim().toUpperCase(), value: newValue || null }] }
      },
      {
        onSuccess: () => {
          setIsAdding(false)
          setNewKey('')
          setNewValue('')
        }
      }
    )
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('title')}</h3>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={() => setIsAdding(true)}
          disabled={isAdding || isPending}>
          <PlusIcon className='w-3.5 h-3.5' />
        </Button>
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
          {isAdding && (
            <div className='p-3 space-y-2'>
              <Input
                placeholder={t('keyPlaceholder')}
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className='h-7 text-sm'
                disabled={isPending}
                autoFocus
              />
              <Input
                placeholder={t('valuePlaceholder')}
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                className='h-7 text-sm'
                disabled={isPending}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') setIsAdding(false)
                }}
              />
              <div className='flex gap-1'>
                <Button size='sm' variant='outline' onClick={handleAdd} disabled={!newKey.trim() || isPending}>
                  {t('addTag')}
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    setIsAdding(false)
                    setNewKey('')
                    setNewValue('')
                  }}>
                  <XIcon className='w-3 h-3' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
