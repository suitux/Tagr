/**
 * Builds the 1200x630 Open Graph card, the favicon and the apple touch icon.
 *
 * The OG card is a purpose built composition (dark canvas, violet glow, logo, the H1, and a crop
 * of the three panel UI), not a raw screenshot. Satori lays it out and converts the text to paths,
 * so resvg needs no font of its own at render time.
 *
 * Run with `pnpm og`. It also runs automatically as part of `pnpm build`.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const logoPath = join(root, 'src/assets/tagr-logo.webp');
const shotPath = join(root, 'src/assets/screenshots/main-screen.png');

const geistSemibold = join(root, 'node_modules/@fontsource/geist/files/geist-latin-600-normal.woff');
const geistRegular = join(root, 'node_modules/@fontsource/geist/files/geist-latin-400-normal.woff');

const dataUri = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`;

const h = (type, props = {}, ...children) => ({
  type,
  props:
    children.length === 0
      ? props
      : { ...props, children: children.length === 1 ? children[0] : children },
});

async function main() {
  await mkdir(publicDir, { recursive: true });

  const logoPng = await sharp(logoPath).resize(96, 96).png().toBuffer();

  // Crop the top left of the three panel UI: folder tree plus the song table, which is the part
  // of the product that reads at OG card size.
  const shotJpg = await sharp(shotPath)
    .extract({ left: 0, top: 0, width: 2000, height: 1000 })
    .resize(1100)
    .jpeg({ quality: 82 })
    .toBuffer();

  const svg = await satori(
    h(
      'div',
      {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#1c1c1c',
          fontFamily: 'Geist',
          overflow: 'hidden',
        },
      },
      // Violet glow, the same one that sits behind the hero.
      h('div', {
        style: {
          position: 'absolute',
          top: -260,
          left: -120,
          width: 900,
          height: 700,
          borderRadius: 9999,
          background: 'radial-gradient(closest-side, #7c3aed, #2b5fd9 55%, rgba(28,28,28,0) 100%)',
          opacity: 0.38,
        },
      }),
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 64px 0 64px',
            position: 'relative',
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 16 } },
          h('img', {
            src: dataUri(logoPng, 'image/png'),
            width: 56,
            height: 56,
            style: { borderRadius: 12 },
          }),
          h('div', { style: { fontSize: 34, fontWeight: 600, color: '#fafafa' } }, 'Tagr')
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginTop: 32,
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#fafafa',
              maxWidth: 760,
            },
          },
          'The self hosted music metadata editor for your whole library'
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginTop: 20,
              fontSize: 24,
              fontWeight: 400,
              color: '#a3a3a3',
            },
          },
          'MP3, FLAC, M4A, Opus. Runs in Docker. AGPL-3.0.'
        )
      ),
      // Product crop, bleeding off the bottom right corner.
      h('img', {
        src: dataUri(shotJpg, 'image/jpeg'),
        width: 1100,
        height: 550,
        style: {
          position: 'absolute',
          top: 380,
          left: 300,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
        },
      })
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: await readFile(geistRegular), weight: 400, style: 'normal' },
        { name: 'Geist', data: await readFile(geistSemibold), weight: 600, style: 'normal' },
      ],
    }
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  await writeFile(join(publicDir, 'og.png'), png);

  await sharp(logoPath).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'));
  await sharp(logoPath).resize(64, 64).png().toFile(join(publicDir, 'favicon.png'));

  console.log('generated public/og.png, public/favicon.png, public/apple-touch-icon.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
