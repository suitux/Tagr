'use client'

import { PencilIcon } from 'lucide-react'
import { HTMLInputTypeAttribute, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import { cn } from '@/lib/utils'
import { DatePickerEdit } from './components/date-picker-edit'
import { StarRatingEdit } from './components/star-rating-edit'
import { TextEdit } from './components/text-edit'

interface DetailPanelRowProps {
  icon: React.ReactNode
  label: string
  value?: string | number | null
  type?: HTMLInputTypeAttribute | 'date' | 'rating'
  isPath?: boolean
  songId?: number
  fieldName?: keyof SongMetadataUpdate
}

export function DetailPanelRow({ icon, label, value = '', isPath, songId, fieldName, type = 'text' }: DetailPanelRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { mutate: updateSong, isPending } = useUpdateSong()

  const canEdit = songId !== undefined && fieldName !== undefined
  const isDate = type === 'date'
  const isRating = type === 'rating'

  const handleSave = (saveValue: string | number | null) => {
    if (!songId || !fieldName) return

    updateSong(
      { id: songId, metadata: { [fieldName]: saveValue } },
      {
        onSuccess: () => {
          setIsEditing(false)
        }
      }
    )
  }

  return (
    <div className='group flex items-start gap-3 p-3'>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        {isRating ? (
          <StarRatingEdit
            value={typeof value === 'number' ? value : Number(value) || null}
            onSave={handleSave}
            isPending={isPending}
            canEdit={canEdit}
          />
        ) : isEditing && !isDate ? (
          <TextEdit
            value={value}
            type={type as HTMLInputTypeAttribute}
            isPending={isPending}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className='flex items-center gap-2'>
            <p className={cn('text-sm font-medium text-foreground mt-0.5 flex-1', isPath && 'break-all text-xs')}>
              {value}
            </p>
            {canEdit && isDate ? (
              <DatePickerEdit value={value} onSave={handleSave} />
            ) : canEdit ? (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={() => setIsEditing(true)}>
                <PencilIcon className='w-3 h-3' />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
