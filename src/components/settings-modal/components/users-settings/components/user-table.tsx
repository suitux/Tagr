'use client'

import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { UserPublic } from '@/features/users/domain'

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  tagger: 'default',
  listener: 'secondary'
}

interface UserTableProps {
  users: UserPublic[]
  onEdit: (user: UserPublic) => void
  onDelete: (user: UserPublic) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const t = useTranslations('users')
  const tRoles = useTranslations('users.roles')

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('username')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead className='w-[80px] text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => {
            const roleLabel = tRoles(user.role)
            return (
              <TableRow key={user.id}>
                <TableCell className='font-medium'>{user.username}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role] ?? 'outline'}>{roleLabel}</Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-1'>
                    <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onEdit(user)}>
                      <PencilIcon className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive'
                      onClick={() => onDelete(user)}>
                      <Trash2Icon className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
