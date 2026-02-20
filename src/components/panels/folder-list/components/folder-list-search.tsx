'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'

interface FolderListSearchProps {
  value: string
  onChange: (value: string) => void
}

export function FolderListSearch({ value, onChange }: FolderListSearchProps) {
  const t = useTranslations('folders')

  return (
    <div className='px-3 pb-3'>
      <div className='relative'>
        <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <Input
          type='text'
          placeholder={t('searchPlaceholder')}
          value={value}
          onChange={e => onChange(e.target.value)}
          className='pl-9 h-9'
        />
      </div>
    </div>
  )
}
