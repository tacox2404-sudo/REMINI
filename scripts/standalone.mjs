// Builds dist/remini-studio-standalone.html: the whole prototype, photos included, in one file.
// Share it by email or Google Drive; it opens in any browser with no install.
//   npm run build && npm run standalone
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const assets = resolve(dist, 'assets');
const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

const map = {};
for (const f of readdirSync(assets)) {
  const ext = f.split('.').pop().toLowerCase();
  if (!types[ext]) continue;
  map[f] = `data:${types[ext]};base64,${readFileSync(resolve(assets, f)).toString('base64')}`;
}
const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const inject = `<script>window.__ASSETS=${JSON.stringify(map)};</script>`;
const out = html.replace('<head>', `<head>${inject}`);
const file = resolve(dist, 'remini-studio-standalone.html');
writeFileSync(file, out);
console.log(`${Object.keys(map).length} images embedded → ${file} (${(statSync(file).size / 1e6).toFixed(1)} MB)`);
