import { en, type Dict } from './en';
import { es } from './es';

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const dicts: Record<Locale, Dict> = { en, es };

export function t(locale: Locale): Dict {
  return dicts[locale];
}

/** The site's base path, without a trailing slash. "" at a domain root, "/Tagr" on a
 *  GitHub Pages project page. Every internal link goes through this. */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Base aware, locale prefixed path. English lives at the root, Spanish under /es/. */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const localized = locale === DEFAULT_LOCALE ? clean : `/es${clean === '/' ? '/' : clean}`;
  return `${BASE}${localized}`;
}

/** Base aware path for a file served straight out of public/, e.g. asset('/og.png'). */
export function asset(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}

export const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', es: 'ES' };

export const LINKS = {
  repo: 'https://github.com/suitux/Tagr',
  demo: 'https://tagr-demo.fly.dev/',
  bmc: 'https://buymeacoffee.com/suitux',
  image: 'ghcr.io/suitux/tagr:latest',
  version: '1.8.6',
  license: 'https://www.gnu.org/licenses/agpl-3.0.html',
} as const;
