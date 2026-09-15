'use client'

import { CheckIcon, FileTextIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface TextareaEditProps {
  value: string | null | undefined
  isPending: boolean
  onSave: (value: string | null) => void
  onCancel: () => void
  /** When set, shows a button that loads a plain text file into the editor (e.g. `.txt,.lrc`). */
  fileAccept?: string
}

export function TextareaEdit({ value, isPending, onSave, onCancel, fileAccept }: TextareaEditProps) {
  const t = useTranslations('textareaEdit')
  const [editValue, setEditValue] = useState(value ?? '')
  // The file picker has to stay a native input, hidden behind the button; no ui/ primitive covers it.
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSave(editValue || null)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      setEditValue(await file.text())
    } catch {
      toast.error(t('importError'))
    }
  }

  return (
    <div className='flex flex-col gap-2 mt-0.5'>
      <Textarea
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className='min-h-48 max-h-96 text-sm'
        autoFocus
        disabled={isPending}
      />
      <div className='flex items-center gap-2'>
        {fileAccept && (
          <>
            <Button
              variant='outline'
              size='sm'
              className='h-7'
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}>
              <FileTextIcon className='w-3.5 h-3.5' />
              {t('importFromFile')}
            </Button>
            <input ref={fileInputRef} type='file' accept={fileAccept} className='sr-only' onChange={handleFileChange} />
          </>
        )}
        <span className='text-xs text-muted-foreground'>{t('saveHint')}</span>
        <div className='flex-1' />
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100'
          onClick={() => onSave(editValue || null)}
          disabled={isPending}>
          <CheckIcon className='w-4 h-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100'
          onClick={onCancel}
          disabled={isPending}>
          <XIcon className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
