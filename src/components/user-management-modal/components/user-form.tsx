'use client'

import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserFormProps {
  initialValues?: { username: string; role: string }
  onSubmit: (data: { username: string; password: string; role: string }) => void
  onCancel: () => void
  isPending: boolean
}

export function UserForm({ initialValues, onSubmit, onCancel, isPending }: UserFormProps) {
  const t = useTranslations('users')
  const tRoles = useTranslations('users.roles')
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
      <Input
        placeholder={t('username')}
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        autoFocus
      />
      <Input
        type='password'
        placeholder={isEditing ? t('passwordHint') : t('password')}
        value={password}
        onChange={e => setPassword(e.target.value)}
        required={!isEditing}
      />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='tagger'>{tRoles('tagger')}</SelectItem>
          <SelectItem value='listener'>{tRoles('listener')}</SelectItem>
        </SelectContent>
      </Select>
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
