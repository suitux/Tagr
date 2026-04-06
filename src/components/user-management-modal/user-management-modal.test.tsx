import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UserPublic } from '@/features/users/domain'

const mockConfirm = vi.fn()
vi.mock('@/contexts/alert-dialog-context', () => ({
  useAlertDialog: () => ({ confirm: mockConfirm })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

const { mockUseUsers, mockCreateMutate, mockUpdateMutate, mockDeleteMutate } = vi.hoisted(() => ({
  mockUseUsers: vi.fn(),
  mockCreateMutate: vi.fn(),
  mockUpdateMutate: vi.fn(),
  mockDeleteMutate: vi.fn()
}))

vi.mock('@/features/users/hooks/use-users', () => ({
  useUsers: () => mockUseUsers()
}))

vi.mock('@/features/users/hooks/use-create-user', () => ({
  useCreateUser: () => ({ mutate: mockCreateMutate, isPending: false })
}))

vi.mock('@/features/users/hooks/use-update-user', () => ({
  useUpdateUser: () => ({ mutate: mockUpdateMutate, isPending: false })
}))

vi.mock('@/features/users/hooks/use-delete-user', () => ({
  useDeleteUser: () => ({ mutate: mockDeleteMutate, isPending: false })
}))

import { UserManagementModal } from './user-management-modal'

const mockUsers: UserPublic[] = [
  { id: 1, username: 'alice', role: 'tagger', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, username: 'bob', role: 'listener', createdAt: '2024-01-02', updatedAt: '2024-01-02' }
]

function renderModal(open = true) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onOpenChange = vi.fn()

  render(
    <QueryClientProvider client={queryClient}>
      <UserManagementModal open={open} onOpenChange={onOpenChange} />
    </QueryClientProvider>
  )

  return { onOpenChange }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UserManagementModal', () => {
  it('shows loading state', () => {
    mockUseUsers.mockReturnValue({ data: undefined, isLoading: true })

    renderModal()

    expect(screen.getByText('users.title')).toBeInTheDocument()
  })

  it('shows empty state when no users', () => {
    mockUseUsers.mockReturnValue({ data: [], isLoading: false })

    renderModal()

    expect(screen.getByText('users.noUsers')).toBeInTheDocument()
  })

  it('shows user table when users exist', () => {
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('shows create button when users exist and no form is open', () => {
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    expect(screen.getByRole('button', { name: /createUser/i })).toBeInTheDocument()
  })

  it('shows create form when create button is clicked', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    await user.click(screen.getByRole('button', { name: /createUser/i }))

    expect(screen.getByPlaceholderText('users.username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('users.password')).toBeInTheDocument()
  })

  it('calls createUser.mutate on form submit', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    await user.click(screen.getByRole('button', { name: /createUser/i }))
    await user.type(screen.getByPlaceholderText('users.username'), 'newuser')
    await user.type(screen.getByPlaceholderText('users.password'), 'pass123')

    // Submit the form - there are now two createUser buttons (the original + form submit)
    const submitButtons = screen.getAllByRole('button', { name: /createUser/i })
    await user.click(submitButtons[submitButtons.length - 1])

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { username: 'newuser', password: 'pass123', role: 'listener' },
      expect.any(Object)
    )
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    // Click edit on first user (alice)
    const buttons = screen.getAllByRole('button')
    const editButton = buttons.find(b => b.querySelector('.lucide-pencil'))!
    await user.click(editButton)

    expect(screen.getByDisplayValue('alice')).toBeInTheDocument()
  })

  it('calls confirm dialog on delete', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })

    renderModal()

    // Click delete on first user
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(b => b.querySelector('.lucide-trash-2'))!
    await user.click(deleteButton)

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'users.deleteUser',
        action: expect.objectContaining({ variant: 'destructive' })
      })
    )
  })

  it('calls deleteUser.mutate when delete is confirmed', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false })
    mockConfirm.mockImplementation(({ action }: { action: { onClick: () => void } }) => {
      action.onClick()
    })

    renderModal()

    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(b => b.querySelector('.lucide-trash-2'))!
    await user.click(deleteButton)

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object))
  })

  it('shows empty state create form when clicking create in empty state', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockReturnValue({ data: [], isLoading: false })

    renderModal()

    await user.click(screen.getByRole('button', { name: /createUser/i }))

    expect(screen.getByPlaceholderText('users.username')).toBeInTheDocument()
  })
})
