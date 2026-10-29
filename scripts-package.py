"""Package the dependency-free ESM source as a single offline HTML game."""
from pathlib import Path
import base64
import json
import re
import zipfile

root = Path(__file__).resolve().parent
source = root / 'dist'
modules = []
seen = set()

def module_id(path):
    return str(path.relative_to(source))

def bundle(path):
    path = path.resolve()
    if path in seen:
        return
    # Module paths must remain within the app source tree.
    path.relative_to(source)
    seen.add(path)
    code = path.read_text()
    dependencies = []
    def named_import(match):
        dependency = (path.parent / match.group(2)).resolve()
        bundle(dependency)
        bindings = []
        for binding in match.group(1).split(','):
            names = re.split(r'\s+as\s+', binding.strip())
            if names[0]:
                bindings.append(names[0] if len(names) == 1 else f'{names[0]}:{names[1]}')
        return 'const {' + ','.join(bindings) + '}=__crownModules[' + json.dumps(module_id(dependency)) + '];'
    code = re.sub(r"import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?", named_import, code)
    exports = {name:name for name in re.findall(r'export\s+(?:const|let|var|function|class)\s+(\w+)', code)}
    def named_export(match):
        for entry in match.group(1).split(','):
            names = re.split(r'\s+as\s+', entry.strip())
            if names[0]:
                exports[names[-1]] = names[0]
        return ''
    code = re.sub(r'export\s*\{([^}]+)\};?', named_export, code)
    code = re.sub(r'\bexport\s+(?=(?:const|let|var|function|class)\b)', '', code)
    if re.search(r'^\s*(?:import|export)\s', code, re.M):
        raise ValueError(f'Unsupported module syntax in {path.name}')
    result = ','.join(f'{json.dumps(name)}:{value}' for name,value in exports.items())
    modules.append('__crownModules[' + json.dumps(module_id(path)) + ']=(()=>{\n' + code + '\nreturn {' + result + '};})();')

bundle(source / 'engine.js')
app = (source / 'app.js').read_text()
app = app.replace("import * as G from './engine.js';", 'const G=__crownModules["engine.js"];')
if re.search(r'^\s*(?:import|export)\s', app, re.M):
    raise ValueError('App imports must be explicitly bundled.')
app = 'const __crownModules={};\n' + '\n'.join(modules) + '\n' + app
css = (source / 'style.css').read_text()
css = re.sub(r"@import\s+url\((?:'[^']*'|\"[^\"]*\"|[^)]*)\)\s*;", '', css)

def data_url(path):
    mime = {'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'}[path.suffix]
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

# One copy of the environment image is enough for both scene backgrounds.
scene = data_url(source / 'assets/bracken-quay.png')
css = css.replace("url('assets/bracken-quay.png')", 'var(--bracken-scene)')
css = ':root,body,#app,#modal{--bracken-scene:url("' + scene + '")}\n' + css
html = (source / 'index.html').read_text()
for asset in sorted((source / 'assets').rglob('*')):
    if asset.is_file() and asset.suffix in ['.png','.jpg','.webp','.svg']:
        name = str(asset.relative_to(source))
        # Scene is already embedded once in the stylesheet.
        if name == 'assets/bracken-quay.png':
            continue
        if name in app or name in css or name in html:
            url = data_url(asset)
            app = app.replace(name, url)
            css = css.replace(name, url)
            html = html.replace(name, url)
app = app.replace('</script', '<\\/script')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
html = html.replace('<script type="module" src="app.js"></script>', '<script type="module">' + app + '</script>')
version = json.loads((root / 'package.json').read_text())['version']
(root / 'Crown-and-Calamity.html').write_text(html)
(root / f'Crown-and-Calamity-v{version}.html').write_text(html)
with zipfile.ZipFile(root / f'Crown-and-Calamity-v{version}.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if file.name.startswith('Crown-and-Calamity-v') and file.suffix == '.html':
            continue
        if file.is_file() and not any(part in relative.parts for part in ['.git','.openai','node_modules','artifacts','__pycache__']) and file.suffix not in ['.zip','.pyc'] and not file.name.startswith('.env'):
            archive.write(file, relative)
print(f'Packaged v{version}: {len(modules)} local modules, embedded artwork, offline HTML, and source ZIP.')
