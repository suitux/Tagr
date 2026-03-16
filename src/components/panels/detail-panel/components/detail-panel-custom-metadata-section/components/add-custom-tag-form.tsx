'use client'

import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'

interface AddCustomTagFormProps {
  songId: number
  onClose: () => void
}

export function AddCustomTagForm({ songId, onClose }: AddCustomTagFormProps) {
  const t = useTranslations('customTags')
  const { mutate: updateSong, isPending } = useUpdateSong()
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    if (!newKey.trim()) return
    updateSong(
      {
        id: songId,
        metadata: { customMetadata: [{ key: newKey.trim().toUpperCase(), value: newValue || null }] }
      },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  return (
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
          if (e.key === 'Escape') onClose()
        }}
      />
      <div className='flex gap-1'>
        <Button size='sm' variant='outline' onClick={handleAdd} disabled={!newKey.trim() || isPending}>
          {t('addTag')}
        </Button>
        <Button size='sm' variant='ghost' onClick={onClose}>
          <XIcon className='w-3 h-3' />
        </Button>
      </div>
    </div>
  )
}
