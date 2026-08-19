'use client'

import { Loader2Icon, PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useAlertDialog } from '@/contexts/alert-dialog-context'
import type { UserPublic } from '@/features/users/domain'
import { useCreateUser } from '@/features/users/hooks/use-create-user'
import { useDeleteUser } from '@/features/users/hooks/use-delete-user'
import { useUpdateUser } from '@/features/users/hooks/use-update-user'
import { useUsers } from '@/features/users/hooks/use-users'
import { UserEmptyState } from './components/user-empty-state'
import { UserForm } from './components/user-form'
import { UserTable } from './components/user-table'

export function UsersSettings() {
  const t = useTranslations('users')
  const { confirm } = useAlertDialog()
  const { data: users, isLoading } = useUsers()
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

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h3 className='text-sm font-semibold'>{t('title')}</h3>
        <p className='text-xs text-muted-foreground'>{t('description')}</p>
      </div>

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
      ) : !showForm ? (
        <UserEmptyState onCreateUser={() => setShowForm(true)} />
      ) : null}

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

      {!showForm && !editingUser && users && users.length > 0 && (
        <Button variant='outline' size='sm' className='self-start' onClick={() => setShowForm(true)}>
          <PlusIcon className='h-4 w-4' />
          {t('createUser')}
        </Button>
      )}
    </div>
  )
}
