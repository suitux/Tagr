'use client'

import { Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ListItem } from './list-item'

interface TrashListItemProps {
  isSelected: boolean
  onSelect: () => void
}

export function TrashListItem({ isSelected, onSelect }: TrashListItemProps) {
  const t = useTranslations('trash')

  return (
    <ListItem
      isSelected={isSelected}
      onClick={onSelect}
      hideExpandSpacer
      icon={<Trash2Icon className='w-5 h-5' />}
      label={t('title')}
    />
  )
}
