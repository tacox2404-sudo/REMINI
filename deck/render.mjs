// Renders each slide of a deck file to PNG for review.
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || 'design-draft.html';
const outDir = process.argv[3] || resolve(here, 'render');
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(resolve(here, file)).href);
await p.waitForTimeout(2500);
const n = await p.locator('.frame').count();
await p.evaluate(() => window.present(0));
for (let i = 0; i < n; i++) {
  await p.evaluate((k) => window.present(k), i);
  await p.waitForTimeout(300);
  await p.screenshot({ path: resolve(outDir, `s${String(i + 1).padStart(2, '0')}.png`) });
}
console.log(n, 'slides');
await b.close();
