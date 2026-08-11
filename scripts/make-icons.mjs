// Rasterizes public/icon.svg into the PNG sizes browsers need for bookmarks and
// home screens. public/icon.svg is the single source of art. Run: npm run icons
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const art = await fs.readFile(path.join(pub, 'icon.svg'), 'utf8');

// Maskable icons get extra padding so Android can crop to a circle without
// clipping the glove; everything else fills the canvas.
const BG = '#0d1522';
const TARGETS = [
  ['favicon-32.png', 32, 1],
  ['apple-touch-icon.png', 180, 1],
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-maskable-512.png', 512, 0.72],
];

function padded(svg, scale) {
  if (scale === 1) return svg;
  const offset = ((1 - scale) / 2) * 64;
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <rect width="64" height="64" fill="${BG}" />
    <g transform="translate(${offset} ${offset}) scale(${scale})">${inner}</g>
  </svg>`;
}

for (const [name, size, scale] of TARGETS) {
  const svg = padded(art, scale);
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: BG,
  })
    .render()
    .asPng();
  await fs.writeFile(path.join(pub, name), png);
  console.log(`${name.padEnd(26)} ${size}x${size}`);
}
