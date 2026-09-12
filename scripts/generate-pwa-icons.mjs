// Generates the PWA icon set from the app's pin-marker brand mark (see components/shared/Logopin.tsx)
// in the brand blue used across the app (Tailwind blue-600 / #2563EB, matching the BE email templates).
//
// Usage: node scripts/generate-pwa-icons.mjs
// Rerun after any change to the brand color or mark below; nothing else reads this file at runtime.

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BRAND_BLUE = "#2563EB";
// Path data for the pin glyph, from components/shared/Logopin.tsx (viewBox 0 0 24 24).
const PIN_PATH =
  "M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.713-4.912 3.713-8.287a8 8 0 10-16 0c0 3.375 1.77 6.274 3.713 8.287a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z";

/**
 * @param {number} size canvas width/height in px
 * @param {number} glyphScale glyph size as a fraction of the canvas (smaller = more padding,
 *   which maskable icons need so OS-applied shape masks don't clip the pin)
 */
function iconSvg(size, glyphScale) {
  const glyphSize = size * glyphScale;
  const offset = (size - glyphSize) / 2;
  // PIN_PATH is drawn in a 24x24 box.
  const scale = glyphSize / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND_BLUE}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path fill="#ffffff" fill-rule="evenodd" clip-rule="evenodd" d="${PIN_PATH}"/>
  </g>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, glyphScale: 0.62 },
  { file: "icon-512.png", size: 512, glyphScale: 0.62 },
  { file: "maskable-512.png", size: 512, glyphScale: 0.45 },
  { file: "apple-touch-icon.png", size: 180, glyphScale: 0.62 },
];

for (const { file, size, glyphScale } of targets) {
  const svg = iconSvg(size, glyphScale);
  const outPath = path.join(outDir, file);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`wrote ${path.relative(process.cwd(), outPath)} (${size}x${size})`);
}
