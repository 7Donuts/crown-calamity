from pathlib import Path
import base64,re,zipfile,json
p=Path('dist')
engine=(p/'engine.js').read_text()
exports=re.findall(r'export (?:const|function) (\w+)',engine)
engine=engine.replace('export ','')
app=(p/'app.js').read_text().replace("import * as G from './engine.js';",'const G=(()=>{'+engine+';return {'+','.join(exports)+'};})();')
css=(p/'style.css').read_text()
css=re.sub(r"@import url\([^;]+;",'',css)
bg='data:image/png;base64,'+base64.b64encode((p/'assets/bracken-quay.png').read_bytes()).decode()
css=css.replace('assets/bracken-quay.png',bg)
html=(p/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script type="module" src="app.js"></script>','<script type="module">'+app+'</script>')
html=re.sub(r'<link rel="icon"[^>]+>','',html)
version=json.loads(Path('package.json').read_text())['version']
Path('Crown-and-Calamity.html').write_text(html)
Path(f'Crown-and-Calamity-v{version}.html').write_text(html)
with zipfile.ZipFile(f'Crown-and-Calamity-v{version}.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in Path('.').rglob('*'):
  if f.name.startswith('Crown-and-Calamity-v') and f.suffix=='.html':continue
  if f.is_file() and not any(x in f.parts for x in ['.git','.openai','node_modules']) and f.suffix!='.zip' and 'artifacts' not in f.parts:z.write(f)
print('Standalone game and complete source ZIP ready.')
