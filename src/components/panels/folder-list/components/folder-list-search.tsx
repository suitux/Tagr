'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'

interface FolderListSearchProps {
  value: string
  onChange: (value: string) => void
}

export function FolderListSearch({ value, onChange }: FolderListSearchProps) {
  const t = useTranslations('folders')

  return (
    <div className='px-3 pb-3'>
      <InputGroup>
        <InputGroupAddon align='inline-start'>
          <InputGroupText>
            <SearchIcon />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type='text'
          placeholder={t('searchPlaceholder')}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </InputGroup>
    </div>
  )
}
