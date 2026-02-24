type ParamType = 'string' | 'number' | 'boolean'

type ParsedValue<T extends ParamType> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : never

export function getSearchParam<T extends ParamType>(
  searchParams: URLSearchParams,
  key: string,
  type: T,
  defaultValue: ParsedValue<T>
): ParsedValue<T> {
  const raw = searchParams.get(key)

  if (raw === null) return defaultValue

  switch (type) {
    case 'string':
      return raw as ParsedValue<T>
    case 'number': {
      const num = Number(raw)
      return (Number.isNaN(num) ? defaultValue : num) as ParsedValue<T>
    }
    case 'boolean':
      return (raw === 'true' || raw === '1') as ParsedValue<T>
  }

  return defaultValue
}
