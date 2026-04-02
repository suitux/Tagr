'use client'

import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserPublic } from '@/features/users/domain'

interface UserListItemProps {
  user: UserPublic
  onEdit: (user: UserPublic) => void
  onDelete: (user: UserPublic) => void
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  tagger: 'default',
  listener: 'secondary'
}

export function UserListItem({ user, onEdit, onDelete }: UserListItemProps) {
  const t = useTranslations('users')
  const roleLabel = user.role === 'tagger' ? t('roleTagger') : t('roleListener')

  return (
    <div className='flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50'>
      <div className='flex items-center gap-3'>
        <span className='font-medium text-sm'>{user.username}</span>
        <Badge variant={ROLE_VARIANT[user.role] ?? 'outline'}>{roleLabel}</Badge>
      </div>
      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(user)}>
          <PencilIcon className='h-3.5 w-3.5' />
        </Button>
        <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive' onClick={() => onDelete(user)}>
          <Trash2Icon className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  )
}
