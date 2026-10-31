"""Package the campaign and isolated playtest lab as separate offline HTML files."""
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
    def namespace_import(match):
        dependency = (path.parent / match.group(2)).resolve()
        bundle(dependency)
        return 'const ' + match.group(1) + '=__crownModules[' + json.dumps(module_id(dependency)) + '];'
    code = re.sub(r"import\s+\*\s+as\s+(\w+)\s+from\s*['\"]([^'\"]+)['\"];?", namespace_import, code)
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

def app_namespace(match):
    dependency = (source / match.group(2)).resolve()
    bundle(dependency)
    return 'const ' + match.group(1) + '=__crownModules[' + json.dumps(module_id(dependency)) + '];'
def app_named(match):
    dependency = (source / match.group(2)).resolve()
    bundle(dependency)
    bindings = [re.sub(r'\s+as\s+', ':', entry.strip()) for entry in match.group(1).split(',') if entry.strip()]
    return 'const {' + ','.join(bindings) + '}=__crownModules[' + json.dumps(module_id(dependency)) + '];'

def data_url(path):
    mime = {'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'}[path.suffix]
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

def standalone(html_name, entry_name):
    # Each entry gets its own registry: the lab never loads the campaign app.
    modules.clear()
    seen.clear()
    app = (source / entry_name).read_text()
    app = re.sub(r"import\s+\*\s+as\s+(\w+)\s+from\s*['\"]([^'\"]+)['\"];?", app_namespace, app)
    app = re.sub(r"import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?", app_named, app)
    if re.search(r'^\s*(?:import|export)\s', app, re.M):
        raise ValueError(f'{entry_name} imports must be explicitly bundled.')
    app = 'const __crownModules={};\n' + '\n'.join(modules) + '\n' + app
    html = (source / html_name).read_text()
    styles = re.findall(r'<link rel="stylesheet" href="([^"]+)">', html)
    css = '\n'.join((source / name).read_text() for name in styles)
    css = re.sub(r"@import\s+url\((?:'[^']*'|\"[^\"]*\"|[^)]*)\)\s*;", '', css)
    # One scene image serves all the campaign's backgrounds. No scene in the lab.
    if 'assets/bracken-quay.png' in css:
        scene = data_url(source / 'assets/bracken-quay.png')
        css = re.sub(r'''url\(["']?assets/bracken-quay\.png["']?\)''', 'var(--bracken-scene)', css)
        css = ':root,body,#app,#modal{--bracken-scene:url("' + scene + '")}\n' + css
    for asset in sorted((source / 'assets').rglob('*')):
        if asset.is_file() and asset.suffix in ['.png','.jpg','.webp','.svg']:
            name = asset.relative_to(source).as_posix()
            if name in app or name in css or name in html:
                url = data_url(asset)
                app = app.replace(name, url)
                css = css.replace(name, url)
                html = html.replace(name, url)
    app = app.replace('</script', '<\\/script')
    for name in styles:
        html = html.replace(f'<link rel="stylesheet" href="{name}">', '', 1)
    html = html.replace('</head>', '<style>' + css + '</style>\n</head>')
    html = html.replace(f'<script type="module" src="{entry_name}"></script>', '<script type="module">' + app + '</script>')
    html = html.replace('href="lab.html"', 'href="Crown-and-Calamity-Playtest-Lab.html"')
    return html

version = json.loads((root / 'package.json').read_text())['version']
html = standalone('index.html', 'app.js')
(root / 'Crown-and-Calamity.html').write_text(html)
(root / f'Crown-and-Calamity-v{version}.html').write_text(html)
lab = standalone('lab.html', 'lab-ui.js')
(root / 'Crown-and-Calamity-Playtest-Lab.html').write_text(lab)
with zipfile.ZipFile(root / f'Crown-and-Calamity-v{version}.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if file.name.startswith('Crown-and-Calamity-v') and file.suffix == '.html':
            continue
        if file.name in {'Crown-and-Calamity-Art-Directions.html', 'Crown-and-Calamity-Soft-Pixel-Preview.html'}:
            continue
        if file.is_file() and not any(part in relative.parts for part in ['.git','.openai','node_modules','artifacts','__pycache__']) and file.suffix not in ['.zip','.pyc'] and not file.name.startswith('.env'):
            archive.write(file, relative)
print(f'Packaged v{version}: offline campaign, isolated playtest lab, embedded artwork, and source ZIP.')
