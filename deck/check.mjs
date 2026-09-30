// Flags slides where content runs past the footer line or off the slide.
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(resolve(here, process.argv[2])).href);
await p.waitForTimeout(1500);
const issues = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.frame').forEach((f, i) => {
    window.present(i);
    const s = f.querySelector('.slide');
    const foot = s.querySelector('.foot');
    const sr = s.getBoundingClientRect();
    const scale = sr.width / 1600;
    const footTop = foot ? foot.getBoundingClientRect().top : sr.bottom;
    s.querySelectorAll('.pad > :not(.foot) *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.height || getComputedStyle(el).position === 'absolute' && el.classList.contains('glow')) return;
      if (r.bottom > footTop + 2 && !foot.contains(el)) out.push(`slide ${i + 1}: ${el.tagName}.${el.className?.baseVal ?? el.className} over footer by ${Math.round((r.bottom - footTop) / scale)}px`);
      if (r.right > sr.right + 1) out.push(`slide ${i + 1}: ${el.tagName} off right edge`);
    });
    // footer text wrapping onto two lines
    if (foot && foot.getBoundingClientRect().height / scale > 60) out.push(`slide ${i + 1}: footer wraps`);
  });
  return [...new Set(out)].slice(0, 60);
});
console.log(issues.length ? issues.join('\n') : 'no overflow');
await b.close();
