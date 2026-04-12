import { describe, it, expect } from 'vitest'
import { smartPlaylistRulesSchema, smartPlaylistFormSchema } from './rules-schema'

const validRule = { field: 'title', operator: 'contains', value: 'rock' }

describe('smartPlaylistRulesSchema', () => {
  it('accepts valid rules with match "all"', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [validRule]
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid rules with match "any"', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'any',
      rules: [validRule, { field: 'artist', operator: 'equals', value: 'Queen' }]
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid match value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'none',
      rules: [validRule]
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty rules array', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: []
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with empty field', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: '', operator: 'contains', value: 'test' }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with empty operator', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: 'title', operator: '', value: 'test' }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with empty value when operator needs value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: 'title', operator: 'contains', value: '' }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with whitespace-only value when operator needs value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: 'title', operator: 'equals', value: '   ' }]
    })
    expect(result.success).toBe(false)
  })

  it('accepts rule with empty value when operator does not need value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: 'title', operator: 'isEmpty', value: '' }]
    })
    expect(result.success).toBe(true)
  })

  it('accepts boolean operator with empty value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [{ field: 'compilation', operator: 'isTrue', value: '' }]
    })
    expect(result.success).toBe(true)
  })

  it('reports error on the specific rule with missing value', () => {
    const result = smartPlaylistRulesSchema.safeParse({
      match: 'all',
      rules: [
        validRule,
        { field: 'artist', operator: 'contains', value: '' }
      ]
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const valuePaths = result.error.issues.map(i => i.path)
      expect(valuePaths).toContainEqual(['rules', 1, 'value'])
    }
  })
})

describe('smartPlaylistFormSchema', () => {
  it('accepts a complete valid form', () => {
    const result = smartPlaylistFormSchema.safeParse({
      name: 'My Playlist',
      isPublic: false,
      match: 'all',
      rules: [validRule]
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = smartPlaylistFormSchema.safeParse({
      name: '',
      isPublic: false,
      match: 'all',
      rules: [validRule]
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing isPublic', () => {
    const result = smartPlaylistFormSchema.safeParse({
      name: 'Test',
      match: 'all',
      rules: [validRule]
    })
    expect(result.success).toBe(false)
  })

  it('applies the same rules validation as rulesSchema', () => {
    const result = smartPlaylistFormSchema.safeParse({
      name: 'Test',
      isPublic: true,
      match: 'all',
      rules: [{ field: 'title', operator: 'contains', value: '' }]
    })
    expect(result.success).toBe(false)
  })
})
