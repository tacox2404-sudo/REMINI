// Builds an editable PowerPoint from pptx-extract.mjs output: each slide is its background picture
// with the text as real text boxes (Times New Roman for the serif, Arial for the sans).
//   node deck/pptx-build.cjs <extract-dir> <out.pptx>
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const [dir, out] = process.argv.slice(2);
const slides = JSON.parse(fs.readFileSync(path.join(dir, 'slides.json'), 'utf8'));

const IN = 120; // 1600 px = 13.333 in
const PT = 0.6; // 1 px = 0.6 pt at this scale
const pres = new pptxgen();
pres.defineLayout({ name: 'DECK', width: 1600 / IN, height: 900 / IN });
pres.layout = 'DECK';
pres.title = 'Remini Studio';
pres.author = 'Riccardo Cara';

const same = (a, b) => a.color === b.color && a.bold === b.bold && a.italic === b.italic && a.size === b.size && a.serif === b.serif && a.ls === b.ls;

slides.forEach((s, i) => {
  const slide = pres.addSlide();
  slide.background = { path: path.join(dir, `bg${String(i + 1).padStart(2, '0')}.jpg`) };
  for (const bl of s.blocks) {
    const runs = [];
    bl.lines.forEach((line, li) => {
      const merged = [];
      for (const w of line) {
        const last = merged[merged.length - 1];
        if (last && same(last, w)) last.t += ' ' + w.t;
        else { if (last) last.t += ' '; merged.push({ ...w }); }
      }
      merged.forEach((w, wi) => {
        const opts = {
          fontFace: w.serif ? 'Times New Roman' : 'Arial', fontSize: +(w.size * PT).toFixed(1),
          color: w.color, bold: w.bold, italic: w.italic,
        };
        if (w.ls) opts.charSpacing = +(w.ls * PT).toFixed(2);
        if (wi === merged.length - 1 && li < bl.lines.length - 1) opts.breakLine = true;
        runs.push({ text: w.t, options: opts });
      });
    });
    const size = Math.max(...bl.lines.flat().map((w) => w.size));
    const multi = bl.lines.length > 1;
    // Widen the box a little so small metric differences never wrap; keep the alignment edge fixed.
    const extra = Math.max(bl.w * 0.08, size * 0.6);
    let x = bl.x, w = bl.w + extra;
    if (bl.align === 'center') x -= extra / 2;
    else if (bl.align === 'right') x -= extra;
    // Office puts the first line a little lower than the browser; these offsets were measured
    // against the HTML, per font, for single lines and for exact line spacing.
    const serif = bl.lines[0][0].serif;
    let y = bl.y - size * 0.11, h = bl.h;
    if (multi) { y -= (bl.lh - size * 1.15) * (serif ? 1.3 : 0.7); h = bl.lh * bl.lines.length; }
    const o = {
      x: x / IN, y: y / IN, w: w / IN, h: h / IN, margin: 0, valign: 'top', align: bl.align,
      wrap: false, isTextBox: true, fit: 'none',
    };
    if (multi) o.lineSpacing = +(bl.lh * PT).toFixed(1);
    slide.addText(runs, o);
  }
});

pres.writeFile({ fileName: out }).then((f) => console.log(f));
