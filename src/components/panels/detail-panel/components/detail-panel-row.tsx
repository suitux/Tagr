'use client'

import { CheckIcon, PencilIcon, XIcon } from 'lucide-react'
import { HTMLInputTypeAttribute, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import { cn } from '@/lib/utils'

interface DetailPanelRowProps {
  icon: React.ReactNode
  label: string
  value?: string | number | null
  type?: HTMLInputTypeAttribute
  isPath?: boolean
  songId?: number
  fieldName?: keyof SongMetadataUpdate
}

export function DetailPanelRow({
  icon,
  label,
  value = '',
  isPath,
  songId,
  fieldName,
  type = 'text'
}: DetailPanelRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const { mutate: updateSong, isPending } = useUpdateSong()

  const canEdit = songId !== undefined && fieldName !== undefined

  const handleEdit = () => {
    setEditValue(value)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!songId || !fieldName) return

    updateSong(
      { id: songId, metadata: { [fieldName]: type === 'number' ? Number(editValue) : editValue || null } },
      {
        onSuccess: () => {
          setIsEditing(false)
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className='group flex items-start gap-3 p-3'>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        {isEditing ? (
          <div className='flex items-center gap-2 mt-0.5'>
            <Input
              value={editValue ?? ''}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className='h-7 text-sm'
              autoFocus
              disabled={isPending}
              type={type}
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100'
              onClick={handleSave}
              disabled={isPending}>
              <CheckIcon className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100'
              onClick={handleCancel}
              disabled={isPending}>
              <XIcon className='w-4 h-4' />
            </Button>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <p className={cn('text-sm font-medium text-foreground mt-0.5 flex-1', isPath && 'break-all text-xs')}>
              {value}
            </p>
            {canEdit && (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={handleEdit}>
                <PencilIcon className='w-3 h-3' />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
