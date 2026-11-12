export const locales = ['en', 'es', 'ca', 'fr', 'de', 'uk', 'ru', 'be'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Each locale's name in its own language, as offered in the language setting. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
  fr: 'Français',
  de: 'Deutsch',
  uk: 'Українська',
  ru: 'Русский',
  be: 'Беларуская'
}

/** Stored under the `locale` config key when the user lets the browser decide. */
export const AUTOMATIC_LOCALE = 'auto'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * The UI language for a request: the user's saved choice when it names a supported locale, otherwise
 * the language the browser asks for. "auto", an empty value or a locale that was removed all fall
 * through to the browser.
 */
export function resolveLocale(saved: string | null | undefined, acceptLanguage: string | null | undefined): Locale {
  return saved && isLocale(saved) ? saved : negotiateLocale(acceptLanguage)
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
