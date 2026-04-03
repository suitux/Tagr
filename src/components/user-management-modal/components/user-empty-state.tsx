'use client'

import { PlusIcon, UserPlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface UserEmptyStateProps {
  onCreateUser: () => void
}

export function UserEmptyState({ onCreateUser }: UserEmptyStateProps) {
  const t = useTranslations('users')

  return (
    <div className='flex flex-col items-center justify-center rounded-md border border-dashed py-10 text-center'>
      <UserPlusIcon className='h-10 w-10 text-muted-foreground/50' />
      <p className='mt-3 text-sm font-medium'>{t('noUsers')}</p>
      <p className='mt-1 text-xs text-muted-foreground'>{t('noUsersDescription')}</p>
      <Button variant='outline' size='sm' className='mt-4' onClick={onCreateUser}>
        <PlusIcon className='h-4 w-4' />
        {t('createUser')}
      </Button>
    </div>
  )
}
