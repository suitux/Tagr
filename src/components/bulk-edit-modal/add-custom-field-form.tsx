'use client'

import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddCustomFieldFormProps {
  onAdd: (key: string) => void
}

/** Adds an extended tag row for a key the library does not have yet. Lives in the field menu. */
export function AddCustomFieldForm({ onAdd }: AddCustomFieldFormProps) {
  const tBulk = useTranslations('bulkEdit')
  const [key, setKey] = useState('')

  const submit = () => {
    if (!key.trim()) return
    onAdd(key)
    setKey('')
  }

  return (
    <div className='flex items-center gap-1 p-1'>
      <Input
        value={key}
        placeholder={tBulk('edit.customKeyPlaceholder')}
        aria-label={tBulk('edit.addCustomKey')}
        className='h-8 text-sm'
        onChange={e => setKey(e.target.value)}
        // The dropdown menu treats typing as typeahead and would steal the keystrokes.
        onKeyDown={e => {
          e.stopPropagation()
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={!key.trim()}
        aria-label={tBulk('edit.addCustomKey')}
        onClick={submit}>
        <PlusIcon />
      </Button>
    </div>
  )
}
