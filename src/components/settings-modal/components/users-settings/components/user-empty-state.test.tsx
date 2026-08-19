import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserEmptyState } from './user-empty-state'

describe('UserEmptyState', () => {
  it('renders empty state message', () => {
    render(<UserEmptyState onCreateUser={() => {}} />)

    expect(screen.getByText('users.noUsers')).toBeInTheDocument()
    expect(screen.getByText('users.noUsersDescription')).toBeInTheDocument()
  })

  it('renders create user button', () => {
    render(<UserEmptyState onCreateUser={() => {}} />)

    expect(screen.getByRole('button', { name: /createUser/i })).toBeInTheDocument()
  })

  it('calls onCreateUser when button is clicked', async () => {
    const user = userEvent.setup()
    const onCreateUser = vi.fn()

    render(<UserEmptyState onCreateUser={onCreateUser} />)

    await user.click(screen.getByRole('button', { name: /createUser/i }))

    expect(onCreateUser).toHaveBeenCalledOnce()
  })
})
