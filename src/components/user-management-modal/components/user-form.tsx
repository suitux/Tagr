'use client'

import { KeyRoundIcon, Loader2Icon, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const ROLES = ['tagger', 'listener'] as const

interface UserFormProps {
  initialValues?: { username: string; role: string }
  onSubmit: (data: { username: string; password: string; role: string }) => void
  onCancel: () => void
  isPending: boolean
}

export function UserForm({ initialValues, onSubmit, onCancel, isPending }: UserFormProps) {
  const t = useTranslations('users')
  const tRoles = useTranslations('users.roles')
  const tDesc = useTranslations('users.roleDescriptions')
  const [username, setUsername] = useState(initialValues?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initialValues?.role ?? 'listener')

  const isEditing = !!initialValues

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ username, password, role })
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3 p-4 border rounded-lg bg-muted/30'>
      <div className='relative'>
        <UserIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder={t('username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className='relative'>
        <KeyRoundIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          type='password'
          placeholder={isEditing ? t('passwordHint') : t('password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required={!isEditing}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label className='text-xs text-muted-foreground'>{t('role')}</Label>
        <div className='grid grid-cols-2 gap-2'>
          {ROLES.map(r => (
            <button
              key={r}
              type='button'
              onClick={() => setRole(r)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
                role === r ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/50'
              )}>
              <span className='text-sm font-medium'>{tRoles(r)}</span>
              <span className='text-xs text-muted-foreground leading-snug'>{tDesc(r)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className='flex gap-2 justify-end'>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type='submit' size='sm' disabled={isPending}>
          {isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isEditing ? t('save') : t('createUser')}
        </Button>
      </div>
    </form>
  )
}
