'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { HTMLInputTypeAttribute, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SongMetadataUpdate } from '@/features/metadata/domain'
import { useUpdateSong } from '@/features/songs/hooks/use-update-song'
import { cn } from '@/lib/utils'
import { DatePickerEdit } from './components/date-picker-edit'
import { ExpandableText } from './components/expandable-text'
import { StarRatingEdit } from './components/star-rating-edit'
import { TextEdit } from './components/text-edit'

interface BaseRowProps {
  icon: React.ReactNode
  label: string
  value?: string | number | boolean | null
  type?: HTMLInputTypeAttribute | 'date' | 'rating' | 'boolean'
  isAPath?: boolean
  songId?: number
}

interface StandardRowProps extends BaseRowProps {
  fieldName?: keyof SongMetadataUpdate
  isExtraMetadata?: never
}

interface ExtraMetadataRowProps extends BaseRowProps {
  fieldName: string
  isExtraMetadata: true
}

type DetailPanelRowProps = StandardRowProps | ExtraMetadataRowProps

export function DetailPanelRow(props: DetailPanelRowProps) {
  const { icon, label, value = '', isAPath, songId, fieldName, type = 'text' } = props
  const isExtraMetadata = 'isExtraMetadata' in props && props.isExtraMetadata

  const { data: session } = useSession()
  const isListener = session?.user?.role === 'listener'
  const [isEditing, setIsEditing] = useState(false)
  const { mutate: updateSong, isPending } = useUpdateSong()

  const canEdit = !isListener && (isExtraMetadata ? songId !== undefined : songId !== undefined && fieldName !== undefined)

  const handleSave = (saveValue: string | number | boolean | null) => {
    if (!songId || !fieldName) return

    if (isExtraMetadata) {
      updateSong(
        { id: songId, metadata: { customMetadata: [{ key: fieldName, value: (saveValue as string) || null }] } },
        { onSuccess: () => setIsEditing(false) }
      )
      return
    }

    updateSong({ id: songId, metadata: { [fieldName]: saveValue } }, { onSuccess: () => setIsEditing(false) })
  }

  const handleDelete = () => {
    if (!songId || !fieldName || !isExtraMetadata) return
    updateSong({ id: songId, metadata: { customMetadata: [{ key: fieldName, value: null }] } })
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

    const isEmpty = value === '' || value === null || value === undefined
    const clickToEdit = canEdit && isEmpty && type !== 'date' && type !== 'boolean'
    const displayValue = type === 'boolean' ? '' : value

    return (
      <>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <div
          className={cn('flex items-start gap-2', { 'cursor-pointer': clickToEdit })}
          onClick={clickToEdit ? () => setIsEditing(true) : undefined}>
          <ExpandableText value={displayValue} isPath={isAPath} />
          {canEdit && type === 'date' && <DatePickerEdit value={value as string | number | null} onSave={handleSave} />}
          {canEdit && type !== 'date' && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity'
              disabled={isPending}
              onClick={() => setIsEditing(true)}>
              <PencilIcon className='w-3 h-3' />
            </Button>
          )}
          {isExtraMetadata && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-destructive'
              disabled={isPending}
              onClick={handleDelete}>
              <TrashIcon className='w-3 h-3' />
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
