import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserPublic } from '@/features/users/domain'

import { UserTable } from './user-table'

const mockUsers: UserPublic[] = [
  { id: 1, username: 'alice', role: 'tagger', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, username: 'bob', role: 'listener', createdAt: '2024-01-02', updatedAt: '2024-01-02' }
]

describe('UserTable', () => {
  it('renders all users', () => {
    render(<UserTable users={mockUsers} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('bob')).toBeInTheDocument()
  })

  it('renders role badges', () => {
    render(<UserTable users={mockUsers} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('users.roles.tagger')).toBeInTheDocument()
    expect(screen.getByText('users.roles.listener')).toBeInTheDocument()
  })

  it('renders edit and delete buttons for each user', () => {
    render(<UserTable users={mockUsers} onEdit={() => {}} onDelete={() => {}} />)

    // Each user row has 2 buttons (edit + delete)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('calls onEdit with the correct user when edit is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<UserTable users={mockUsers} onEdit={onEdit} onDelete={() => {}} />)

    // First edit button (alice)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDelete with the correct user when delete is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<UserTable users={mockUsers} onEdit={() => {}} onDelete={onDelete} />)

    // Second button is delete for first user
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    expect(onDelete).toHaveBeenCalledWith(mockUsers[0])
  })

  it('renders empty table body when no users', () => {
    render(<UserTable users={[]} onEdit={() => {}} onDelete={() => {}} />)

    const rows = screen.queryAllByRole('row')
    // Only header row
    expect(rows).toHaveLength(1)
  })
})
