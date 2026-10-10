export const locales = ['en', 'de'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * Picks the UI language from an `Accept-Language` header, e.g. `de-DE,de;q=0.9,en;q=0.8`.
 * Languages are tried in the order of their quality value; a regional tag (`de-AT`) matches its base
 * language. Anything unsupported or malformed falls back to the default locale.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale

  const preferred = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const qParam = params.map(param => param.trim()).find(param => param.startsWith('q='))
      const quality = qParam ? Number(qParam.slice(2)) : 1
      return { language: tag.trim().toLowerCase().split('-')[0], quality, index }
    })
    .filter(entry => entry.language && entry.language !== '*' && Number.isFinite(entry.quality) && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)

  return preferred.map(entry => entry.language).find(isLocale) ?? defaultLocale
}
