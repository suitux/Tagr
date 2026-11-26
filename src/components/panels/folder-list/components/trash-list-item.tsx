'use client'

import { Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { useTrashSummary } from '@/features/trash/hooks/use-trash-summary'
import { ListItem } from './list-item'

interface TrashListItemProps {
  isSelected: boolean
  onSelect: () => void
}

export function TrashListItem({ isSelected, onSelect }: TrashListItemProps) {
  const t = useTranslations('trash')
  const { data: summary } = useTrashSummary()

  return (
    <ListItem
      isSelected={isSelected}
      onClick={onSelect}
      hideExpandSpacer
      icon={<Trash2Icon className='w-5 h-5' />}
      label={t('title')}
      trailing={summary && summary.count > 0 ? <Badge variant='secondary'>{summary.count}</Badge> : null}
    />
  )
}
