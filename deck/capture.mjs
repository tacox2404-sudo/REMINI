// Captures clean phone screens (no demo highlight) for the deck.
//   npm run build && node deck/capture.mjs
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'deck/assets');
const SHOTS = { 2: 'keep', 3: 'welcome', 5: 'suggest', 6: 'project', 7: 'paywall', 8: 'trend', 9: 'y2kset', 10: 'me', 12: 'invite', 13: 'joined', 14: 'shared', 16: 'duo', 17: 'chats', 18: 'chat', 20: 'back' };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(resolve(root, 'dist/index.html')).href);
await page.addStyleTag({ content: '.spot-ring{display:none!important}' });
await page.waitForTimeout(1800);
await page.click('[data-ctl="start-demo"]');
const last = Math.max(...Object.keys(SHOTS).map(Number));
for (let i = 0; i <= last; i++) {
  if (SHOTS[i]) {
    await page.waitForTimeout(1700);
    await page.locator('.phone-screen').screenshot({ path: resolve(out, `${SHOTS[i]}.png`) });
    console.log(SHOTS[i]);
  }
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
}
await browser.close();
