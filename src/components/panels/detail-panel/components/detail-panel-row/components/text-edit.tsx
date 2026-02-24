'use client'

import { CheckIcon, XIcon } from 'lucide-react'
import { HTMLInputTypeAttribute, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TextEditProps {
  value: string | number | null | undefined
  type: HTMLInputTypeAttribute
  isPending: boolean
  onSave: (value: string | number | null) => void
  onCancel: () => void
}

export function TextEdit({ value, type, isPending, onSave, onCancel }: TextEditProps) {
  const [editValue, setEditValue] = useState(value ?? '')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(type === 'number' ? Number(editValue) : editValue || null)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
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
        onClick={() => onSave(type === 'number' ? Number(editValue) : editValue || null)}
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
  )
}
