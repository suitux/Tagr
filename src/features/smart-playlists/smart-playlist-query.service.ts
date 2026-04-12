import {
  BOOLEAN_SONG_FIELDS,
  type ColumnField,
  DATE_SONG_FIELDS,
  DURATION_SONG_FIELDS,
  getMetadataKeyFromColumnId,
  isMetadataColumnId,
  NUMERIC_SONG_FIELDS
} from '@/features/songs/domain'
import type { SmartPlaylistOperator, SmartPlaylistRule, SmartPlaylistRules } from './domain'

type PrismaCondition = Record<string, unknown>

function buildStringFieldCondition(operator: SmartPlaylistOperator, value: string): PrismaCondition | null {
  switch (operator) {
    case 'equals':
      return { equals: value }
    case 'notEquals':
      return { not: value }
    case 'contains':
      return { contains: value }
    case 'notContains':
      return { not: { contains: value } }
    case 'startsWith':
      return { startsWith: value }
    case 'endsWith':
      return { endsWith: value }
    default:
      return null
  }
}

function buildNumberFieldCondition(operator: SmartPlaylistOperator, value: string): PrismaCondition | null {
  const num = Number(value)
  if (Number.isNaN(num)) return null
  switch (operator) {
    case 'equals':
      return { equals: num }
    case 'notEquals':
      return { not: num }
    case 'gt':
      return { gt: num }
    case 'gte':
      return { gte: num }
    case 'lt':
      return { lt: num }
    case 'lte':
      return { lte: num }
    default:
      return null
  }
}

function buildDateFieldCondition(operator: SmartPlaylistOperator, value: string): PrismaCondition | null {
  const asDate = value ? new Date(value) : null
  if (asDate && Number.isNaN(asDate.getTime())) return null
  switch (operator) {
    case 'before':
      return asDate ? { lt: asDate } : null
    case 'after':
      return asDate ? { gt: asDate } : null
    case 'on': {
      if (!asDate) return null
      const start = new Date(value + 'T00:00:00')
      const end = new Date(value + 'T23:59:59.999')
      return { gte: start, lte: end }
    }
    default:
      return null
  }
}

function buildRuleCondition(rule: SmartPlaylistRule): PrismaCondition | null {
  const { field, operator, value } = rule

  // Metadata (custom) fields — always treated as strings, matched via relation.
  if (isMetadataColumnId(field)) {
    const metaKey = getMetadataKeyFromColumnId(field)
    const keyMatch = { endsWith: `:${metaKey}` }

    if (operator === 'isEmpty') {
      return {
        NOT: {
          metadata: {
            some: {
              key: keyMatch,
              NOT: [{ value: null }, { value: '' }]
            }
          }
        }
      }
    }
    if (operator === 'isNotEmpty') {
      return {
        metadata: {
          some: {
            key: keyMatch,
            NOT: [{ value: null }, { value: '' }]
          }
        }
      }
    }

    const valueCondition = buildStringFieldCondition(operator, value)
    if (!valueCondition) return null

    if (operator === 'notEquals' || operator === 'notContains') {
      return {
        NOT: {
          metadata: {
            some: {
              key: keyMatch,
              value: operator === 'notEquals' ? { equals: value } : { contains: value }
            }
          }
        }
      }
    }

    return {
      metadata: {
        some: {
          key: keyMatch,
          value: valueCondition
        }
      }
    }
  }

  // isEmpty / isNotEmpty for scalar fields
  if (operator === 'isEmpty') {
    if (BOOLEAN_SONG_FIELDS.has(field)) return { [field]: null }
    if (NUMERIC_SONG_FIELDS.has(field) || DURATION_SONG_FIELDS.has(field) || DATE_SONG_FIELDS.has(field)) {
      return { [field]: null }
    }
    return { OR: [{ [field]: null }, { [field]: '' }] }
  }
  if (operator === 'isNotEmpty') {
    if (BOOLEAN_SONG_FIELDS.has(field)) return { [field]: { not: null } }
    if (NUMERIC_SONG_FIELDS.has(field) || DURATION_SONG_FIELDS.has(field) || DATE_SONG_FIELDS.has(field)) {
      return { [field]: { not: null } }
    }
    return { AND: [{ [field]: { not: null } }, { [field]: { not: '' } }] }
  }

  // Boolean
  if (BOOLEAN_SONG_FIELDS.has(field)) {
    if (operator === 'isTrue') return { [field]: { equals: true } }
    if (operator === 'isFalse') return { [field]: { equals: false } }
    return null
  }

  // Numeric / duration
  if (NUMERIC_SONG_FIELDS.has(field) || DURATION_SONG_FIELDS.has(field)) {
    const cond = buildNumberFieldCondition(operator, value)
    return cond ? { [field]: cond } : null
  }

  // Date
  if (DATE_SONG_FIELDS.has(field)) {
    const cond = buildDateFieldCondition(operator, value)
    return cond ? { [field]: cond } : null
  }

  // String (default)
  const strCond = buildStringFieldCondition(operator, value)
  if (!strCond) return null
  return { [field]: strCond }
}

export function buildSmartPlaylistWhere(rules: SmartPlaylistRules | undefined): PrismaCondition | null {
  if (!rules || rules.rules.length === 0) return null
  const conditions: PrismaCondition[] = []
  for (const rule of rules.rules) {
    const cond = buildRuleCondition(rule)
    if (cond) conditions.push(cond)
  }
  if (conditions.length === 0) return null
  if (conditions.length === 1) return conditions[0]
  return rules.match === 'any' ? { OR: conditions } : { AND: conditions }
}

export function rulesUseMetadata(rules: SmartPlaylistRules | undefined): boolean {
  if (!rules) return false
  return rules.rules.some(r => isMetadataColumnId(r.field as ColumnField))
}
