// Exports a deck HTML to PDF: one 16:9 slide per page, vector text, fonts and images embedded.
//   node deck/pdf.mjs Remini-Studio-deck.html Remini-Studio-deck.pdf
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const [src, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(resolve(here, src)).href);
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: `
  @page { size: 1600px 900px; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; }
  .bar { display: none !important; }
  .deck { display: block !important; padding: 0 !important; gap: 0 !important; }
  .frame { width: 1600px !important; height: 900px !important; aspect-ratio: auto !important; border-radius: 0 !important; box-shadow: none !important; display: block !important; page-break-after: always; break-after: page; }
  .frame:last-child { page-break-after: auto; break-after: auto; }
  .slide { transform: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  /* Gradient-clipped text leaves box edges in print: use the gradient's middle colour instead. */
  .grad-text { background: none !important; color: #FF4466 !important; -webkit-text-fill-color: #FF4466 !important; }
` });
await p.emulateMedia({ media: 'print' });
await p.waitForTimeout(800);
await p.pdf({ path: resolve(here, out), width: '1600px', height: '900px', printBackground: true, preferCSSPageSize: true });
await b.close();
console.log(out);
