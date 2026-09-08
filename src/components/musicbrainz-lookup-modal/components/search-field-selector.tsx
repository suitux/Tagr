'use client'

import { SlidersHorizontalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { MusicBrainzSearchField } from '@/features/musicbrainz/domain'

interface SearchFieldSelectorProps {
  fields: readonly MusicBrainzSearchField[]
  visible: Record<MusicBrainzSearchField, boolean>
  onToggle: (field: MusicBrainzSearchField, visible: boolean) => void
  label: (field: MusicBrainzSearchField) => string
}

/** Picks which inputs the search form shows. A hidden field takes no part in the query. */
export function SearchFieldSelector({ fields, visible, onToggle, label }: SearchFieldSelectorProps) {
  const t = useTranslations('musicbrainzLookup')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type='button' variant='outline' size='sm' className='gap-1.5'>
          <SlidersHorizontalIcon className='h-4 w-4' />
          {t('searchFields')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel>{t('searchFields')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fields.map(field => (
          <DropdownMenuCheckboxItem
            key={field}
            checked={visible[field]}
            // Without this the menu closes on every pick, so choosing several fields means
            // reopening it each time.
            onSelect={e => e.preventDefault()}
            onCheckedChange={checked => onToggle(field, checked)}>
            {label(field)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
