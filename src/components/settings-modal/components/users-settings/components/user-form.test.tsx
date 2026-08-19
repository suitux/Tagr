import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserForm } from './user-form'

describe('UserForm', () => {
  describe('create mode', () => {
    it('renders username and password inputs', () => {
      render(<UserForm onSubmit={() => {}} onCancel={() => {}} isPending={false} />)

      expect(screen.getByPlaceholderText('users.username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('users.password')).toBeInTheDocument()
    })

    it('renders role selector with tagger and listener', () => {
      render(<UserForm onSubmit={() => {}} onCancel={() => {}} isPending={false} />)

      expect(screen.getByText('users.roles.tagger')).toBeInTheDocument()
      expect(screen.getByText('users.roles.listener')).toBeInTheDocument()
    })

    it('defaults to listener role', () => {
      render(<UserForm onSubmit={() => {}} onCancel={() => {}} isPending={false} />)

      const listenerButton = screen.getByText('users.roles.listener').closest('button')!
      expect(listenerButton.className).toContain('border-primary')
    })

    it('renders create button text', () => {
      render(<UserForm onSubmit={() => {}} onCancel={() => {}} isPending={false} />)

      expect(screen.getByRole('button', { name: /createUser/i })).toBeInTheDocument()
    })

    it('submits form with entered data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<UserForm onSubmit={onSubmit} onCancel={() => {}} isPending={false} />)

      await user.type(screen.getByPlaceholderText('users.username'), 'newuser')
      await user.type(screen.getByPlaceholderText('users.password'), 'secret123')
      await user.click(screen.getByText('users.roles.tagger'))
      await user.click(screen.getByRole('button', { name: /createUser/i }))

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'secret123',
        role: 'tagger'
      })
    })

    it('calls onCancel when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<UserForm onSubmit={() => {}} onCancel={onCancel} isPending={false} />)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onCancel).toHaveBeenCalledOnce()
    })

    it('disables submit button when pending', () => {
      render(<UserForm onSubmit={() => {}} onCancel={() => {}} isPending={true} />)

      expect(screen.getByRole('button', { name: /createUser/i })).toBeDisabled()
    })
  })

  describe('edit mode', () => {
    const initialValues = { username: 'existing', role: 'tagger' }

    it('pre-fills username from initial values', () => {
      render(
        <UserForm initialValues={initialValues} onSubmit={() => {}} onCancel={() => {}} isPending={false} />
      )

      expect(screen.getByDisplayValue('existing')).toBeInTheDocument()
    })

    it('shows password hint placeholder instead of password', () => {
      render(
        <UserForm initialValues={initialValues} onSubmit={() => {}} onCancel={() => {}} isPending={false} />
      )

      expect(screen.getByPlaceholderText('users.passwordHint')).toBeInTheDocument()
    })

    it('pre-selects initial role', () => {
      render(
        <UserForm initialValues={initialValues} onSubmit={() => {}} onCancel={() => {}} isPending={false} />
      )

      const taggerButton = screen.getByText('users.roles.tagger').closest('button')!
      expect(taggerButton.className).toContain('border-primary')
    })

    it('renders save button text instead of create', () => {
      render(
        <UserForm initialValues={initialValues} onSubmit={() => {}} onCancel={() => {}} isPending={false} />
      )

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    it('submits with empty password when not changed', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <UserForm initialValues={initialValues} onSubmit={onSubmit} onCancel={() => {}} isPending={false} />
      )

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'existing',
        password: '',
        role: 'tagger'
      })
    })

    it('allows changing role', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <UserForm initialValues={initialValues} onSubmit={onSubmit} onCancel={() => {}} isPending={false} />
      )

      await user.click(screen.getByText('users.roles.listener'))
      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'existing',
        password: '',
        role: 'listener'
      })
    })
  })
})
