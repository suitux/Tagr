'use client'

import { HistoryIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ListItem } from './list-item'

interface RecentListensListItemProps {
  isSelected: boolean
  onSelect: () => void
}

export function RecentListensListItem({ isSelected, onSelect }: RecentListensListItemProps) {
  const t = useTranslations('listens')

  return (
    <ListItem
      isSelected={isSelected}
      onClick={onSelect}
      hideExpandSpacer
      icon={<HistoryIcon className='w-5 h-5' />}
      label={t('title')}
    />
  )
}
