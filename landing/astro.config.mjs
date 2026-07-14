// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deployed as a GitHub Pages project site: https://suitux.github.io/Tagr/
// If a custom domain is ever added, set SITE to it and BASE to '/', and nothing else changes:
// every internal link, asset and canonical is built from these two values.
export const SITE = 'https://suitux.github.io';
export const BASE = '/Tagr';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es' },
      },
    }),
  ],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
