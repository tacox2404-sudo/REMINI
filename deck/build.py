"""Build the decks as self-contained HTML files (CSS, fonts and prototype screens inlined).

    python3 deck/build.py            -> deck/Remini-Studio-deck.html and deck/Remini-Studio-Pitch.html
    python3 deck/build.py draft      -> deck/design-draft.html (the approved style test)
"""
import base64, pathlib, re, sys

here = pathlib.Path(__file__).parent


def fonts():
    faces = []
    for f in sorted((here / 'fonts').glob('*.woff2')):
        fam = 'Instrument Serif' if 'serif' in f.name else 'Instrument Sans'
        w = re.search(r'-(\d{3})-', f.name).group(1)
        st = 'italic' if 'italic' in f.name else 'normal'
        data = base64.b64encode(f.read_bytes()).decode()
        faces.append(f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2')}}")
    return ''.join(faces)


def images(html):
    def img(m):
        return 'data:image/jpeg;base64,' + base64.b64encode((here / 'assets' / f'{m.group(1)}.jpg').read_bytes()).decode()
    return re.sub(r'\{\{img:([a-z0-9]+)\}\}', img, html)


def write(name, html):
    (here / name).write_text(html)
    print(name, round(len(html) / 1e6, 2), 'MB')


def decks():
    src = (here / 'src' / 'deck.html').read_text()
    css = fonts() + (here / 'src' / 'deck.css').read_text()
    base = images(src.replace('{{css}}', css))
    full = base.replace('{{doctitle}}', 'Remini Studio').replace('{{bartitle}}', 'Remini Studio · full deck')
    write('Remini-Studio-deck.html', full)
    # Pitch: the executive summary on its own, numbered from 1.
    frames = re.findall(r'<div class="frame" data-part="(\w+)">.*?</section></div>\n', full, flags=re.S)
    assert frames, 'no frames found'
    start = full.index('<div class="frame"')
    end = full.index('</div>\n<script>')
    body = ''.join(m.group(0) for m in re.finditer(r'<div class="frame" data-part="(?:exec|end)">.*?</section></div>\n', full, flags=re.S))
    pitch = full[:start] + body + full[end:]
    pitch = pitch.replace('<title>Remini Studio</title>', '<title>Remini Studio Pitch</title>').replace('Remini Studio · full deck', 'Remini Studio · Pitch')
    write('Remini-Studio-Pitch.html', pitch)


def draft():
    src = (here / 'src' / 'design-draft.html').read_text()
    write('design-draft.html', images(src.replace('<style>', '<style>' + fonts(), 1)))


if 'draft' in sys.argv[1:]:
    draft()
else:
    decks()
