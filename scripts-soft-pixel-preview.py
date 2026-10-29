"""Embed unchanged pixel art studies into an independent offline animation preview."""
from pathlib import Path
import base64
import re
root = Path(__file__).resolve().parent
source = root / 'design' / 'soft-pixel'
html = (source / 'index.html').read_text()
for name in ['ledger-rat-idle.png', 'bracken-stall.png']:
    data = 'data:image/png;base64,' + base64.b64encode((source / name).read_bytes()).decode()
    html = html.replace("url('" + name + "')", 'url("' + data + '")')
    html = html.replace('src="' + name + '"', 'src="' + data + '"')
if re.search(r'''(?:src=|url\()['"]?(?:ledger-rat-idle|bracken-stall)\.png''', html):
    raise ValueError('Unresolved local art in soft pixel preview')
(root / 'Crown-and-Calamity-Soft-Pixel-Preview.html').write_text(html)
print('Generated independent offline soft-pixel preview.')
