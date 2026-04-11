import {
  BOOLEAN_SONG_FIELDS,
  type ColumnField,
  DATE_SONG_FIELDS,
  DURATION_SONG_FIELDS,
  isMetadataColumnId,
  NUMERIC_SONG_FIELDS
} from '@/features/songs/domain'

export type StringOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'

export type NumberOperator = 'equals' | 'notEquals' | 'gt' | 'gte' | 'lt' | 'lte' | 'isEmpty' | 'isNotEmpty'

export type DateOperator = 'before' | 'after' | 'on' | 'isEmpty' | 'isNotEmpty'

export type BooleanOperator = 'isTrue' | 'isFalse'

export type SmartPlaylistOperator = StringOperator | NumberOperator | DateOperator | BooleanOperator

export type SmartPlaylistFieldType = 'string' | 'number' | 'date' | 'boolean'

export interface SmartPlaylistRule {
  field: ColumnField
  operator: SmartPlaylistOperator
  value: string
}

export type SmartPlaylistMatch = 'all' | 'any'

export interface SmartPlaylistRules {
  match: SmartPlaylistMatch
  rules: SmartPlaylistRule[]
}

export interface SmartPlaylist {
  id: number
  name: string
  isPublic: boolean
  ownerId: string
  isOwner: boolean
  rules: SmartPlaylistRules
  createdAt: string
  updatedAt: string
}

export interface SmartPlaylistListResponse {
  success: true
  private: SmartPlaylist[]
  public: SmartPlaylist[]
}

export function getSmartlistFieldType(field: ColumnField): SmartPlaylistFieldType {
  if (isMetadataColumnId(field)) return 'string'
  if (BOOLEAN_SONG_FIELDS.has(field)) return 'boolean'
  if (DATE_SONG_FIELDS.has(field)) return 'date'
  if (NUMERIC_SONG_FIELDS.has(field) || DURATION_SONG_FIELDS.has(field)) return 'number'
  return 'string'
}

const STRING_OPERATORS: StringOperator[] = [
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty'
]

const NUMBER_OPERATORS: NumberOperator[] = ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'isEmpty', 'isNotEmpty']

const DATE_OPERATORS: DateOperator[] = ['before', 'after', 'on', 'isEmpty', 'isNotEmpty']

const BOOLEAN_OPERATORS: BooleanOperator[] = ['isTrue', 'isFalse']

export function getOperatorsForField(field: ColumnField): SmartPlaylistOperator[] {
  const type = getSmartlistFieldType(field)
  switch (type) {
    case 'string':
      return STRING_OPERATORS
    case 'number':
      return NUMBER_OPERATORS
    case 'date':
      return DATE_OPERATORS
    case 'boolean':
      return BOOLEAN_OPERATORS
  }
}

export function operatorNeedsValue(operator: SmartPlaylistOperator): boolean {
  return operator !== 'isEmpty' && operator !== 'isNotEmpty' && operator !== 'isTrue' && operator !== 'isFalse'
}

export function isValidRules(value: unknown): value is SmartPlaylistRules {
  if (!value || typeof value !== 'object') return false
  const v = value as { match?: unknown; rules?: unknown }
  if (v.match !== 'all' && v.match !== 'any') return false
  if (!Array.isArray(v.rules)) return false
  return v.rules.every(r => {
    if (!r || typeof r !== 'object') return false
    const rule = r as { field?: unknown; operator?: unknown; value?: unknown }
    return typeof rule.field === 'string' && typeof rule.operator === 'string' && typeof rule.value === 'string'
  })
}

export function parseRules(raw: string): SmartPlaylistRules {
  try {
    const parsed = JSON.parse(raw)
    if (isValidRules(parsed)) return parsed
  } catch {
    // fallthrough
  }
  return { match: 'all', rules: [] }
}
