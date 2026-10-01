// Reads every slide of a deck HTML for an editable PowerPoint version.
// Text is laid out with Office-metric fonts (Liberation Serif = Times New Roman, Liberation Sans = Arial),
// so the line breaks match PowerPoint. Writes slides.json with each text block and one background
// image per slide with that text hidden.
//   node deck/pptx-extract.mjs Remini-Studio-Pitch.html <out-dir>
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const [src, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(resolve(here, src)).href);
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: `
  :root { --serif: 'Liberation Serif', serif !important; --sans: 'Liberation Sans', sans-serif !important; }
  svg g, svg text { font-family: 'Liberation Sans', sans-serif; }
  svg g[font-family*="Serif"], svg text[font-family*="Serif"] { font-family: 'Liberation Serif', serif; }
  html, body { background: #fff !important; margin: 0 !important; }
  .bar { display: none !important; }
  .deck { display: block !important; padding: 0 !important; gap: 0 !important; }
  .frame { width: 1600px !important; height: 900px !important; aspect-ratio: auto !important; border-radius: 0 !important; box-shadow: none !important; display: block !important; }
  .slide { transform: none !important; }
` });
await p.waitForTimeout(800);

const slides = await p.evaluate(() => {
  const isInline = (el) => getComputedStyle(el).display === 'inline' && el.tagName !== 'BR';
  const hex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return { rgb: [0, 0, 0], a: 1 };
    const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { rgb: v.slice(0, 3), a: v.length > 3 ? v[3] : 1 };
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = hex(getComputedStyle(e).backgroundColor);
      if (c.a > 0.5) return c.rgb;
    }
    return [255, 255, 255];
  };
  const toHex = (rgb) => rgb.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
  const colorOf = (el) => {
    const cs = getComputedStyle(el);
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return 'FF4466';
    const c = hex(cs.color); const bg = bgOf(el);
    return toHex(c.rgb.map((x, i) => x * c.a + bg[i] * (1 - c.a)));
  };
  const transform = (t, tt) => tt === 'uppercase' ? t.toUpperCase() : tt === 'lowercase' ? t.toLowerCase() : t;

  // A block owns text directly or through inline children; inline-block badges are their own blocks.
  const owners = (root) => {
    const list = [];
    const walk = (el) => {
      if (el.closest('svg')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (!isInline(el)) {
        const has = [...el.childNodes].some((n) =>
          (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && isInline(n) && n.textContent.trim()));
        if (has) list.push(el);
      }
      [...el.children].forEach(walk);
    };
    walk(root);
    return list;
  };

  return [...document.querySelectorAll('.frame')].map((frame, fi) => {
    const fr = frame.getBoundingClientRect();
    const blocks = owners(frame).map((el) => {
      const cs = getComputedStyle(el);
      // Collect words with their style and on-screen line, so the browser's line breaks carry over.
      const words = [];
      const visit = (node, styleEl) => {
        if (node.nodeType === 3) {
          const s = getComputedStyle(styleEl);
          const parts = node.textContent.split(/(\s+)/);
          let off = 0;
          for (const part of parts) {
            if (part && !/^\s+$/.test(part)) {
              const r = document.createRange(); r.setStart(node, off); r.setEnd(node, off + part.length);
              const rect = r.getClientRects()[0];
              if (rect) words.push({
                t: transform(part, s.textTransform), top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom,
                color: colorOf(styleEl), bold: Number(s.fontWeight) >= 600, italic: s.fontStyle === 'italic',
                size: parseFloat(s.fontSize), serif: /Serif/.test(s.fontFamily), ls: parseFloat(s.letterSpacing) || 0,
              });
            }
            off += part.length;
          }
        } else if (node.nodeType === 1) {
          if (node.tagName === 'BR') { words.push({ br: true }); return; }
          if (!isInline(node) || node.closest('svg')) return;
          [...node.childNodes].forEach((c) => visit(c, node));
        }
      };
      [...el.childNodes].forEach((c) => visit(c, el));
      const real = words.filter((w) => !w.br);
      if (!real.length) return null;
      // Group into lines by vertical position.
      const lines = []; let cur = null;
      for (const w of words) {
        if (w.br) { cur = null; continue; }
        if (!cur || w.top > cur.top + w.size * 0.5) { cur = { top: w.top, words: [] }; lines.push(cur); }
        cur.words.push(w);
      }
      const left = Math.min(...real.map((w) => w.left)), right = Math.max(...real.map((w) => w.right));
      const top = Math.min(...real.map((w) => w.top)), bottom = Math.max(...real.map((w) => w.bottom));
      let lh = parseFloat(cs.lineHeight);
      if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.15;
      if (lines.length > 1) lh = (lines[lines.length - 1].top - lines[0].top) / (lines.length - 1);
      const align = ['center', 'right', 'end'].includes(cs.textAlign) ? (cs.textAlign === 'end' ? 'right' : cs.textAlign) : 'left';
      return {
        x: left - fr.left, y: top - fr.top, w: right - left, h: bottom - top, align, lh,
        lines: lines.map((l) => l.words.map(({ t, color, bold, italic, size, serif, ls }) => ({ t, color, bold, italic, size, serif, ls }))),
        el,
      };
    }).filter(Boolean);
    frame.dataset.fi = fi;
    return { blocks: blocks.map(({ el, ...rest }) => { el.dataset.pptx = '1'; return rest; }) };
  });
});

const ref = await p.$$('.frame');
if (process.env.REF) for (let i = 0; i < ref.length; i++) await ref[i].screenshot({ path: resolve(out, `ref${String(i + 1).padStart(2, '0')}.png`), scale: 'css' });

// Hide the extracted text and capture each slide's background.
await p.addStyleTag({ content: `
  [data-pptx], [data-pptx] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }
  [data-pptx].grad-text, [data-pptx] .grad-text { background: none !important; }
  [data-pptx] svg, [data-pptx] svg * { color: initial !important; -webkit-text-fill-color: initial !important; }
` });
const frames = await p.$$('.frame');
for (let i = 0; i < frames.length; i++) {
  await frames[i].screenshot({ path: resolve(out, `bg${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
}
writeFileSync(resolve(out, 'slides.json'), JSON.stringify(slides, null, 1));
await b.close();
console.log(slides.length, 'slides,', slides.reduce((n, s) => n + s.blocks.length, 0), 'text blocks');
