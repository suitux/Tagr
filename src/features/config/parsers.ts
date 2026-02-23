export const genericJsonObjectParser = <T>(value: string | null): T | undefined => {
  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}
