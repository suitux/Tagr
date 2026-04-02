'use client'

import { Loader2Icon, PlusIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import { useCreateUser } from '@/features/users/hooks/use-create-user'
import { useDeleteUser } from '@/features/users/hooks/use-delete-user'
import { useUpdateUser } from '@/features/users/hooks/use-update-user'
import { useUsers } from '@/features/users/hooks/use-users'
import type { UserPublic } from '@/features/users/domain'
import { UserForm } from './components/user-form'
import { UserListItem } from './components/user-list-item'

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
      onError: (error) => {
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
        onError: (error) => {
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
            onError: (error) => toast.error(error.message)
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
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UsersIcon className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3'>
          {!showForm && !editingUser && (
            <Button variant='outline' size='sm' className='self-start' onClick={() => setShowForm(true)}>
              <PlusIcon className='h-4 w-4' />
              {t('createUser')}
            </Button>
          )}

          {showForm && (
            <UserForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isPending={createUser.isPending}
            />
          )}

          {editingUser && (
            <UserForm
              initialValues={{ username: editingUser.username, role: editingUser.role }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
              isPending={updateUser.isPending}
            />
          )}

          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : users && users.length > 0 ? (
            <div className='flex flex-col gap-1'>
              {users.map(user => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onEdit={u => {
                    setShowForm(false)
                    setEditingUser(u)
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground text-center py-4'>{t('noUsers')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
