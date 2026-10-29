"""Embed the art-direction proposal boards in one offline HTML gallery."""
from base64 import b64encode
from pathlib import Path
import re

root = Path(__file__).resolve().parent
source = root / 'design' / 'art-proposals' / 'index.html'
html = source.read_text(encoding='utf-8')
for image in sorted(source.parent.glob('*.png')):
    encoded = b64encode(image.read_bytes()).decode('ascii')
    url = f'data:image/png;base64,{encoded}'
    html = html.replace(f'src="{image.name}"', f'src="{url}"')
if re.search(r'src="\d\d-[^"]+\.png"', html):
    raise RuntimeError('A proposal image was not embedded in the gallery.')
output = root / 'Crown-and-Calamity-Art-Directions.html'
output.write_text(html, encoding='utf-8')
print(f'Generated {output.name} with embedded proposal images.')
