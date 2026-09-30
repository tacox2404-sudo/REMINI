"""Inline the prototype screens into the deck so it is one self-contained HTML file."""
import base64, pathlib, re, sys
here = pathlib.Path(__file__).parent
def build(name):
    src = (here / 'src' / name).read_text()
    def img(m):
        p = here / 'assets' / f'{m.group(1)}.jpg'
        return 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()
    out = re.sub(r'\{\{img:([a-z0-9]+)\}\}', img, src)
    # Embed the fonts (Instrument Sans and Serif, OFL) so the deck works offline and prints the same everywhere.
    faces = []
    for f in sorted((here / 'fonts').glob('*.woff2')):
        fam = 'Instrument Serif' if 'serif' in f.name else 'Instrument Sans'
        w = re.search(r'-(\d{3})-', f.name).group(1)
        st = 'italic' if 'italic' in f.name else 'normal'
        data = base64.b64encode(f.read_bytes()).decode()
        faces.append(f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2')}}")
    out = out.replace('<style>', '<style>' + ''.join(faces), 1)
    (here / name).write_text(out)
    print(name, round(len(out) / 1e6, 2), 'MB')
for n in sys.argv[1:] or ['design-draft.html']:
    build(n)
