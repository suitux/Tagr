'use client'

import { PencilIcon, PlusIcon, TagIcon, TrashIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import type { SongMetadata } from '@/generated/prisma/client'

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
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

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

  const handleEdit = (key: string) => {
    updateSong(
      {
        id: songId,
        metadata: { customMetadata: [{ key, value: editValue || null }] }
      },
      {
        onSuccess: () => {
          setEditingKey(null)
          setEditValue('')
        }
      }
    )
  }

  const handleDelete = (key: string) => {
    updateSong({
      id: songId,
      metadata: { customMetadata: [{ key, value: null }] }
    })
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
            <div key={key} className='group flex items-start gap-3 p-3'>
              <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
                <TagIcon className='w-4 h-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-muted-foreground'>{key}</p>
                {editingKey === key ? (
                  <div className='flex items-center gap-1 mt-0.5'>
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className='h-7 text-sm'
                      disabled={isPending}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEdit(key)
                        if (e.key === 'Escape') setEditingKey(null)
                      }}
                      autoFocus
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => handleEdit(key)}
                      disabled={isPending}>
                      <PencilIcon className='w-3 h-3' />
                    </Button>
                    <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setEditingKey(null)}>
                      <XIcon className='w-3 h-3' />
                    </Button>
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-foreground mt-0.5 flex-1 whitespace-break-spaces max-w-[10px] line-clamp-4'>
                      {value || ''}
                    </p>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                      onClick={() => {
                        setEditingKey(key)
                        setEditValue(value || '')
                      }}>
                      <PencilIcon className='w-3 h-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive'
                      onClick={() => handleDelete(key)}>
                      <TrashIcon className='w-3 h-3' />
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
