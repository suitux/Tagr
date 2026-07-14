import { getImage } from 'astro:assets';
import mainScreen from '../assets/screenshots/main-screen.png';

/** Shared by the rendered hero <picture> and by the <link rel="preload"> in the head.
 *  Both must describe the same transform, otherwise the browser downloads the LCP image twice. */
export const HERO_WIDTHS = [640, 960, 1280, 1600];
export const HERO_SIZES = '(min-width: 1024px) 55vw, 100vw';

export { mainScreen };

export async function heroPreload() {
  const avif = await getImage({
    src: mainScreen,
    widths: HERO_WIDTHS,
    sizes: HERO_SIZES,
    format: 'avif',
  });

  return {
    imagesrcset: avif.srcSet.attribute,
    imagesizes: HERO_SIZES,
  };
}
