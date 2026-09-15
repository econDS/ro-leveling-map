"""Build race metadata from local references, official EP20 HTML and rAthena.
Usage: python scripts/import_races.py mob_db.yml ro-ep20.html
Additional Divine Pride pages can be saved beside mob_db.yml as ro-race-ID.html.
"""
import json
import re
import sys
import subprocess
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT.parents[1] / 'reference/maps'
def norm(s):
    return re.sub('[^a-z0-9]', '', s.lower().replace('chaotic', 'chaos').replace('dollocaris', 'dolocaris'))
def race(s):
    return {'Human': 'Demi-Human', 'Demihuman': 'Demi-Human', 'Demi Human': 'Demi-Human'}.get(s, s)

by_id, by_name, refs = {}, {}, {}
for chunk in re.split(r'(?m)^  - Id: ', Path(sys.argv[1]).read_text(encoding='utf-8'))[1:]:
    mid = chunk.splitlines()[0]
    fields = dict(re.findall(r'(?m)^    (Name|Race): (.+)$', chunk))
    r = race(fields.get('Race', 'Formless').strip())
    by_id[mid] = (r, fields.get('Name', ''))
    by_name[norm(fields.get('Name', ''))] = r
for file in sorted(REF.glob('*.md')):
    header = []
    for line in file.read_text(encoding='utf-8').splitlines():
        if not line.startswith('|'):
            header = []
            continue
        cells = [c.strip().strip('`') for c in line.strip('|').split('|')]
        if 'Monster' in cells and 'Race' in cells:
            header = cells
        elif header and len(cells) == len(header):
            r = race(cells[header.index('Race')])
            if r in ['Formless','Undead','Brute','Plant','Insect','Fish','Demon','Demi-Human','Angel','Dragon']:
                refs[norm(cells[header.index('Monster')])] = (r, 'reference/maps/' + file.name)
soup = BeautifulSoup(Path(sys.argv[2]).read_bytes(), 'html.parser')
official = {}
for table in soup.select('.entry-content table'):
    rows = table.select('tbody > tr')
    for n in range(0, len(rows)-3, 4):
        cells = [[c.get_text(' ', strip=True) for c in row.find_all(['td','th'], recursive=False)] for row in rows[n:n+4]]
        if 'Race' in cells[2]:
            official[norm(cells[0][0])] = race(cells[3][cells[2].index('Race')])
export = """const fs=require('fs'),vm=require('vm');const c=vm.createContext({});
vm.runInContext(fs.readFileSync('assets/data/ep20.js','utf8'),c);
    vm.runInContext(fs.readFileSync('assets/data/spotlight-maps.js','utf8'),c);
const h=fs.readFileSync('index.html','utf8');
vm.runInContext(h.match(/<script>\\s*(const MAPS =[\\s\\S]*?)<\\/script>/)[1]+';this.maps=MAPS',c);
process.stdout.write(JSON.stringify(c.maps));"""
maps = json.loads(subprocess.run(['node','-e',export],cwd=ROOT,check=True,capture_output=True,encoding='utf-8').stdout)
result, unresolved = {}, []
for m in maps:
    for mob in m['monsters']:
        name = norm(mob['name'])
        key = m['code'] + ':' + mob['name']
        if mob.get('race') in ['Formless','Undead','Brute','Plant','Insect','Fish','Demon','Demi-Human','Angel','Dragon']:
            r, source = mob['race'], mob.get('sourceUrl', m.get('sourceUrl', 'map data'))
        elif m['group'] == 'ep20' and name in official:
            r, source = official[name], 'https://ro.gnjoy.in.th/episode-20-the-immortal-map-monster/'
        elif name in refs:
            r, source = refs[name]
        elif name in by_name:
            r, source = by_name[name], 'rAthena db/re/mob_db.yml (name)'
        else:
            mid = re.search(r'/(\d+)\.png$', mob.get('image',''))
            dpfile = Path(sys.argv[1]).parent / f'ro-race-{mid[1]}.html' if mid else None
            if dpfile and dpfile.exists():
                page = BeautifulSoup(dpfile.read_bytes(), 'html.parser')
                r = race(page.select_one('[class*=badge-race-]').get_text(' ', strip=True))
                source = f'https://www.divine-pride.net/database/monster/{mid[1]}'
                result[key] = dict(race=r, source=source)
                continue
            if not mid or mid[1] not in by_id:
                unresolved.append((key, mob.get('image')))
                continue
            r, dbname = by_id[mid[1]]
            source = f'rAthena db/re/mob_db.yml #{mid[1]} ({dbname})'
        result[key] = dict(race=r, source=source)
print('Resolved', len(result), 'Unresolved', unresolved)
if unresolved:
    raise SystemExit('Missing races: download the listed Divine Pride pages before rebuilding.')
dest = ROOT/'assets/data'
(dest/'monster-races.json').write_text(json.dumps(dict(sourceUrl='https://github.com/rathena/rathena/blob/master/db/re/mob_db.yml', monsters=result), ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
(dest/'monster-races.js').write_text('// Race metadata; sources recorded in monster-races.json.\nconst MONSTER_RACES = '+json.dumps({k:v['race'] for k,v in result.items()},ensure_ascii=False,indent=2)+';\n', encoding='utf-8', newline='\n')
