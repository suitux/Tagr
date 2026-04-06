import { describe, it, expect } from 'vitest'
import type { UserRole } from '@/features/users/domain'
import { hasMinimumRole } from './hasMinimumRole'

describe('hasMinimumRole', () => {
  const roles: UserRole[] = ['admin', 'tagger', 'listener']

  it('admin has minimum role for all roles', () => {
    for (const role of roles) {
      expect(hasMinimumRole('admin', role)).toBe(true)
    }
  })

  it('tagger has minimum role for tagger and listener', () => {
    expect(hasMinimumRole('tagger', 'listener')).toBe(true)
    expect(hasMinimumRole('tagger', 'tagger')).toBe(true)
  })

  it('tagger does not have minimum role for admin', () => {
    expect(hasMinimumRole('tagger', 'admin')).toBe(false)
  })

  it('listener only has minimum role for listener', () => {
    expect(hasMinimumRole('listener', 'listener')).toBe(true)
  })

  it('listener does not have minimum role for tagger or admin', () => {
    expect(hasMinimumRole('listener', 'tagger')).toBe(false)
    expect(hasMinimumRole('listener', 'admin')).toBe(false)
  })

  it('same role always returns true', () => {
    for (const role of roles) {
      expect(hasMinimumRole(role, role)).toBe(true)
    }
  })
})
