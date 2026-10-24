/**
 * Extract a short, loggable reason from a thrown error for inclusion in an API response.
 *
 * For a failed `fetch`, the useful detail lives on `error.cause` (the underlying system
 * error, e.g. `ETIMEDOUT` / `ENETUNREACH`), which the generic message hides.
 */
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause
    if (cause instanceof Error && cause.message) return cause.message
    if (typeof cause === 'string' && cause) return cause
    if (cause && typeof cause === 'object' && 'code' in cause) {
      return String((cause as { code?: unknown }).code ?? error.message)
    }
    return error.message
  }
  return String(error)
}
