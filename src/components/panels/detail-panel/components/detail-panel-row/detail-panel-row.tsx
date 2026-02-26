'use client'

import { PencilIcon } from 'lucide-react'
import { HTMLInputTypeAttribute, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import { cn } from '@/lib/utils'
import { DatePickerEdit } from './components/date-picker-edit'
import { StarRatingEdit } from './components/star-rating-edit'
import { TextEdit } from './components/text-edit'

interface DetailPanelRowProps {
  icon: React.ReactNode
  label: string
  value?: string | number | boolean | null
  type?: HTMLInputTypeAttribute | 'date' | 'rating' | 'boolean'
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
  const { mutate: updateSong, isPending } = useUpdateSong()

  const canEdit = songId !== undefined && fieldName !== undefined

  const handleSave = (saveValue: string | number | boolean | null) => {
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

  function renderContent() {
    if (type === 'boolean') {
      return (
        <div className='flex flex-col items-start h-full gap-2'>
          <label className='text-xs text-muted-foreground'>{label}</label>
          <Checkbox
            checked={!!value}
            disabled={!canEdit || isPending}
            onCheckedChange={checked => handleSave(!!checked)}
          />
        </div>
      )
    }

    if (type === 'rating') {
      return (
        <>
          <p className='text-xs text-muted-foreground'>{label}</p>
          <StarRatingEdit
            value={typeof value === 'number' ? value : Number(value) || null}
            onSave={handleSave}
            isPending={isPending}
            canEdit={canEdit}
          />
        </>
      )
    }

    if (isEditing && type !== 'date') {
      return (
        <>
          <p className='text-xs text-muted-foreground'>{label}</p>
          <TextEdit
            value={value as string | number | null}
            type={type as HTMLInputTypeAttribute}
            isPending={isPending}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </>
      )
    }

    return (
      <>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <div className='flex items-center gap-2'>
          <p
            className={cn('text-sm font-medium text-foreground mt-0.5 flex-1 break-all', {
              'text-xs': isPath
            })}>
            {typeof value === 'boolean' ? '' : value}
          </p>
          {canEdit && type === 'date' && <DatePickerEdit value={value as string | number | null} onSave={handleSave} />}
          {canEdit && type !== 'date' && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => setIsEditing(true)}>
              <PencilIcon className='w-3 h-3' />
            </Button>
          )}
        </div>
      </>
    )
  }

  return (
    <div className={'group flex items-start gap-3 p-3'}>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>{renderContent()}</div>
    </div>
  )
}
