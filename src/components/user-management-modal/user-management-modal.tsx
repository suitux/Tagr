'use client'

import { Loader2Icon, PlusIcon, UserPlusIcon, UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import type { UserPublic } from '@/features/users/domain'
import { useCreateUser } from '@/features/users/hooks/use-create-user'
import { useDeleteUser } from '@/features/users/hooks/use-delete-user'
import { useUpdateUser } from '@/features/users/hooks/use-update-user'
import { useUsers } from '@/features/users/hooks/use-users'
import { UserForm } from './components/user-form'
import { UserTable } from './components/user-table'

interface UserManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserManagementModal({ open, onOpenChange }: UserManagementModalProps) {
  const t = useTranslations('users')
  const { confirm } = useAlertDialog()
  const { data: users, isLoading } = useUsers(open)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserPublic | null>(null)

  const handleCreate = (data: { username: string; password: string; role: string }) => {
    createUser.mutate(data, {
      onSuccess: () => {
        toast.success(t('userCreated'))
        setShowForm(false)
      },
      onError: error => {
        toast.error(error.message)
      }
    })
  }

  const handleUpdate = (data: { username: string; password: string; role: string }) => {
    if (!editingUser) return
    updateUser.mutate(
      {
        id: editingUser.id,
        username: data.username !== editingUser.username ? data.username : undefined,
        password: data.password || undefined,
        role: data.role !== editingUser.role ? data.role : undefined
      },
      {
        onSuccess: () => {
          toast.success(t('userUpdated'))
          setEditingUser(null)
        },
        onError: error => {
          toast.error(error.message)
        }
      }
    )
  }

  const handleDelete = (user: UserPublic) => {
    confirm({
      title: t('deleteUser'),
      description: t('deleteConfirm', { username: user.username }),
      cancel: { label: t('cancel') },
      action: {
        label: t('deleteUser'),
        variant: 'destructive',
        onClick: () => {
          deleteUser.mutate(user.id, {
            onSuccess: () => toast.success(t('userDeleted')),
            onError: error => toast.error(error.message)
          })
        }
      }
    })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setShowForm(false)
      setEditingUser(null)
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UsersIcon className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : users && users.length > 0 ? (
            <UserTable
              users={users}
              onEdit={u => {
                setShowForm(false)
                setEditingUser(u)
              }}
              onDelete={handleDelete}
            />
          ) : (
            <div className='flex flex-col items-center justify-center rounded-md border border-dashed py-10 text-center'>
              <UserPlusIcon className='h-10 w-10 text-muted-foreground/50' />
              <p className='mt-3 text-sm font-medium'>{t('noUsers')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('noUsersDescription')}</p>
            </div>
          )}

          {showForm && (
            <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isPending={createUser.isPending} />
          )}

          {editingUser && (
            <UserForm
              initialValues={{ username: editingUser.username, role: editingUser.role }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
              isPending={updateUser.isPending}
            />
          )}

          {!showForm && !editingUser && (
            <Button variant='outline' size='sm' className='self-start' onClick={() => setShowForm(true)}>
              <PlusIcon className='h-4 w-4' />
              {t('createUser')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
