/* Build-time favicon / app-icon generator (run: `npm run gen:favicons`).
   Produces a full icon set in icons/ from images/logo.png (1024x1024), including
   a maskable icon (logo inset on the brand background) for installable PWAs. */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'images/logo.png';
const OUT = 'icons';
const BG = { r: 5, g: 6, b: 10, alpha: 1 };          // --bg #05060a
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(OUT, { recursive: true });

// transparent, contained icons (browser favicons + Android any-purpose)
const plain = [
  [16, 'favicon-16.png'], [32, 'favicon-32.png'], [48, 'favicon-48.png'],
  [192, 'icon-192.png'], [512, 'icon-512.png'],
];
for (const [size, name] of plain) {
  await sharp(SRC).resize(size, size, { fit: 'contain', background: CLEAR }).png().toFile(`${OUT}/${name}`);
}

// apple-touch-icon: flattened on the brand bg (iOS dislikes transparency)
await sharp(SRC).resize(180, 180, { fit: 'contain', background: BG })
  .flatten({ background: BG }).png().toFile(`${OUT}/apple-touch-icon.png`);

// maskable: logo in the central safe zone on the brand bg
const inner = Math.round(512 * 0.66);
await sharp(SRC)
  .resize(inner, inner, { fit: 'contain', background: CLEAR })
  .extend({
    top: (512 - inner) >> 1, bottom: 512 - inner - ((512 - inner) >> 1),
    left: (512 - inner) >> 1, right: 512 - inner - ((512 - inner) >> 1),
    background: BG,
  })
  .flatten({ background: BG })
  .png().toFile(`${OUT}/maskable-512.png`);

// Open Graph / Twitter share image — logo centered on the brand background
const ogLogo = await sharp(SRC).resize(320, 320, { fit: 'contain', background: CLEAR }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
  .composite([{ input: ogLogo, gravity: 'center' }])
  .png().toFile(`${OUT}/og-image.png`);

console.log('favicons + app icons + og-image written to icons/');
