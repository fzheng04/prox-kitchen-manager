#!/usr/bin/env node
/**
 * Draws the app icon, Android adaptive layers, splash image and favicon.
 *
 *   node scripts/generate-icons.js
 *
 * There is no logo: the icon and splash are the words "Kitchen Manager" in Bricolage Grotesque
 * ExtraBold (the bundled title font). Expo Go shows the app icon while the app loads, so the icon
 * carries the name too. Rendered from SVG with @resvg/resvg-js (dev dependency) using the font file
 * from node_modules, so the output doesn't depend on system fonts and is deterministic.
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const NIGHT = '#1C2233';
const OAT = '#F5F0E6';
const INK = '#1E1E24';
const WHITE = '#FFFFFF';

const FONT_FILE = require.resolve(
  '@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf',
);

/** Two centered lines, "Kitchen" over "Manager". `size` is the font size in px. */
function words(canvasW, canvasH, size, color) {
  const gap = size * 1.02;
  const top = canvasH / 2 - gap / 2 + size * 0.35;
  const line = (text, y) =>
    `<text x="${canvasW / 2}" y="${y}" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="${size}" fill="${color}">${text}</text>`;
  return line('Kitchen', top) + line('Manager', top + gap);
}

function svg(w, h, background, content = '') {
  const bg = background ? `<rect width="${w}" height="${h}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg}${content}</svg>`;
}

function png(markup) {
  return new Resvg(markup, {
    font: { fontFiles: [FONT_FILE], loadSystemFonts: false, defaultFontFamily: 'Bricolage Grotesque' },
  })
    .render()
    .asPng();
}

const out = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(out, { recursive: true });
const write = (name, markup) => {
  fs.writeFileSync(path.join(out, name), png(markup));
  console.log(`assets/images/${name}`);
};

write('icon.png', svg(1024, 1024, NIGHT, words(1024, 1024, 200, OAT)));
// Android adaptive icons crop to a circle or squircle: keep the words inside the central safe zone.
write('android-icon-foreground.png', svg(1024, 1024, null, words(1024, 1024, 130, OAT)));
write('android-icon-background.png', svg(1024, 1024, NIGHT));
write('android-icon-monochrome.png', svg(1024, 1024, null, words(1024, 1024, 130, WHITE)));
// Splash: dark words on the oat splash background (set in app.json). Shown in real builds, not Expo Go.
write('splash-icon.png', svg(1200, 600, null, words(1200, 600, 230, INK)));
// 48 px is too small for words to read, so the favicon stays a plain square.
write('favicon.png', svg(48, 48, NIGHT));
