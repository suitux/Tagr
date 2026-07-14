# Tagr landing site

The marketing site for [Tagr](https://github.com/suitux/Tagr): a landing page and an install and
configuration docs page, in English and Spanish. Astro 5, static output, Tailwind CSS 4, deployed
to Vercel as a static site.

Self contained. It has its own `package.json` and does not share the app's dependency tree.

## Run it

```bash
pnpm install --ignore-workspace   # the flag keeps this out of the app's pnpm workspace
pnpm dev                          # http://localhost:4321
pnpm build                        # generates the OG image, then builds to dist/
pnpm preview                      # serve the production build
```

Node 22 or newer.

`pnpm build` runs `scripts/generate-og.mjs` first. That script composes the 1200x630 Open Graph
card (dark canvas, violet glow, the H1, a crop of the three panel UI) with satori and resvg, and
derives `favicon.png` and `apple-touch-icon.png` from the logo. Its output lands in `public/` and
is committed, so a deploy that skips the script still ships the right images.

## Where things live

```
src/
  i18n/
    en.ts          every English string on the site
    es.ts          every Spanish string, typed against en.ts so nothing can drift
    snippets.ts    the code blocks (compose file, docker run, env vars), lifted from the app README
    index.ts       t(locale), localePath(), and the shared external links
  components/      one component per section, all locale aware
  layouts/
    BaseLayout.astro   head, meta, hreflang, JSON-LD slot, header, footer, copy to clipboard script
  pages/
    index.astro    landing (EN)          /
    docs.astro     install docs (EN)     /docs/
    es/index.astro landing (ES)          /es/
    es/docs.astro  install docs (ES)     /es/docs/
    404.astro
  assets/          the logo and the eleven product screenshots, optimized at build by astro:assets
  styles/global.css  design tokens, lifted from the app's own dark theme
public/            robots.txt, llms.txt, fonts, and the generated OG image and icons
```

**No copy lives inside a component.** Every visible string comes from `src/i18n/`. If you find
yourself typing English into a `.astro` file, put it in `en.ts` and `es.ts` instead.

## Editing copy

Change `src/i18n/en.ts`, then change the matching key in `src/i18n/es.ts`. `es.ts` is typed as
`Dict` (the shape of `en.ts`), so a missing or misspelled key fails the build rather than shipping
a hole in the Spanish page.

Two content rules the build depends on:

- **No em-dashes and no en-dashes** (U+2014, U+2013) anywhere, including alt text and meta
  descriptions. Use a comma, a colon, parentheses or a full stop. Check with:
  `grep -rl '—\|–' dist src`  (it should print nothing)
- **Never claim a feature Tagr does not have**, and never claim a competitor lacks one it has. The
  comparison table in `en.ts` was verified against each project's source. This audience checks.

## Adding a locale

1. Copy `src/i18n/es.ts` to `src/i18n/<code>.ts` and translate it. It is typed, so TypeScript tells
   you what is missing.
2. Register it in `src/i18n/index.ts`: add the code to `LOCALES`, the dictionary to `dicts`, and a
   label to `LOCALE_LABELS`.
3. Add the locale to `i18n.locales` and to the sitemap's `i18n.locales` map in `astro.config.mjs`.
4. Copy `src/pages/es/index.astro` and `src/pages/es/docs.astro` into `src/pages/<code>/`, changing
   only the `locale` constant.
5. `localePath()` prefixes every non default locale automatically, so the header, footer, language
   switcher, canonicals and hreflang tags pick it up with no further work.

The language switcher currently renders two locales side by side. With three or more, swap it for a
dropdown in `Header.astro` and `Footer.astro`.

## Deploying

GitHub Pages, as a project site at `https://suitux.github.io/Tagr/`. Pushing to `main` with changes
under `landing/` triggers `.github/workflows/landing.yml`, which builds and deploys. In the repo
settings, **Settings > Pages > Source** must be set to **GitHub Actions** (not "Deploy from a
branch"), once.

`public/.nojekyll` is required and must stay: GitHub Pages runs Jekyll by default, and Jekyll skips
directories starting with an underscore, which would drop every asset Astro emits into `_astro/`.

Two consequences of living under a subpath rather than a domain root:

- `robots.txt` is only honoured at the domain root (`suitux.github.io/robots.txt`), which belongs to
  a different repo. The one here is served but ignored by crawlers. Submit the sitemap
  (`https://suitux.github.io/Tagr/sitemap-index.xml`) directly in Google Search Console instead.
- The same applies to `llms.txt`, whose convention expects the root.

## Swapping the domain

Two values in `astro.config.mjs` drive every URL on the site: canonicals, hreflang, the sitemap, the
OG tags, the absolute JSON-LD URLs, and every internal link and asset (through `localePath()` and
`asset()` in `src/i18n/index.ts`).

```js
export const SITE = 'https://suitux.github.io';
export const BASE = '/Tagr';
```

To move to a custom domain: set `SITE` to it, set `BASE` to `'/'`, add a `CNAME` file with the
domain in `public/`, and point the DNS at GitHub Pages. Then update the `Sitemap:` line in
`public/robots.txt` and the links at the bottom of `public/llms.txt`, which are plain text and
cannot read the config. Nothing else in the source needs touching, and GitHub redirects the old
`github.io` URLs to the new domain.

Never hardcode a site relative path (`/og.png`, `/docs/`) in a component. Use `asset()` or
`localePath()`, or it will 404 under the base path.

## Constraints worth keeping

- **Dark only.** No theme toggle. The app has a light theme; the site does not.
- **Zero client JS by default.** The only scripts are the mobile nav, the gallery tabs and
  lightbox, the install tabs, copy to clipboard, and the docs table of contents. All of them are
  vanilla `<script>` islands. The FAQ is `<details>` and `<summary>`, so it works with JS disabled.
  There is no React, Vue or Svelte here, and no scroll listener anywhere: the sticky header and the
  docs table of contents both use IntersectionObserver, and the scroll reveals are CSS
  `animation-timeline: view()`, disabled under `prefers-reduced-motion`.
- **Real screenshots only.** The eleven images in `src/assets/screenshots/` are the entire visual
  payload. No stock photography, no generated imagery, no placeholder services.
- **Lighthouse on mobile: 100 / 100 / 100 / 100** on the landing page and the docs page, measured
  against the production build. Treat a regression as a bug.
