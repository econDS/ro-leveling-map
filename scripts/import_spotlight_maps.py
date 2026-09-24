"""Import all missing explicit Spotlight maps from Divine Pride's thRO view.
Normal stats/EXP come from map rows and the monster's 100% EXP row.
Event EXP remains in its original official snapshot, never in the normal base.
"""
import argparse, concurrent.futures, hashlib, json, re, subprocess, sys, time
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

SITE = Path(__file__).resolve().parents[1]
CACHE = SITE / '.cache/spotlight-maps/thROG'
DP = 'https://www.divine-pride.net'

# Divine Pride's map heading can fall back to the Korean locale even when the
# thRO region cookie is selected. Keep the public catalog on the English names
# used by the thRO map and monster references.
MAP_NAME_OVERRIDES = {
    'ba_lost': 'Lost Farm Valley',
    'jor_dun02': 'Warmth of the Snake God 2F',
}

def fetch(url, path):
    if path.exists() and path.stat().st_size: return path.read_bytes()
    for attempt in range(3):
        try:
            req = Request(url, headers={'User-Agent':'Mozilla/5.0', 'Cookie':'dp_region=thROG'})
            with urlopen(req, timeout=40) as response: data = response.read()
            if not data: raise ValueError('Empty response '+url)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            return data
        except Exception:
            if attempt==2: raise
            time.sleep(1+attempt)

def soup(url, filename):
    page = BeautifulSoup(fetch(url,CACHE/filename),'html.parser')
    region = page.select_one('.region-option.active')
    if region is None or region.get('data-region')!='thROG':
        raise ValueError('Response is not the requested thRO region: '+url)
    return page
def number(s): return int(re.sub(r'[^0-9]', '', s))
def has_korean(s): return bool(re.search(r'[\uac00-\ud7af]', s or ''))

def read_map(code):
    url=f'{DP}/database/map/{code}'
    page=soup(url,code+'.html')
    table=next((t for t in page.select('table') if [h.get_text(strip=True) for h in t.select('th')][:3]==['Level','Name','Health']),None)
    if table is None: raise ValueError('Missing spawn table '+code)
    monsters,excluded,excluded_ids=[],[],[]
    for tr in table.select('tbody tr'):
        td=tr.find_all('td',recursive=False)
        if len(td)!=12: raise ValueError((code,'columns',len(td)))
        cells=[c.get_text(' ',strip=True) for c in td]
        mid=int(re.search(r'/monster/(\d+)',td[1].a['href'])[1])
        entry=dict(id=mid,name=cells[1],level=number(cells[0]),hp=number(cells[2]),race={'Human':'Demi-Human'}.get(cells[3],cells[3]),amount=number(cells[11]))
        if has_korean(entry['name']): raise ValueError((code,'Korean monster name requires an English override',entry['name']))
        if cells[10]=='MVP': excluded.append(entry['name']); excluded_ids.append(mid); continue
        if entry['amount']<=0: raise ValueError((code,'unknown count',entry))
        monsters.append(entry)
    if not monsters: raise ValueError('Empty map '+code)
    heading=page.select_one('h1').get_text(' ',strip=True)
    if code not in MAP_NAME_OVERRIDES and has_korean(heading): raise ValueError((code,'Korean map name requires an English override',heading))
    return dict(code=code,name=MAP_NAME_OVERRIDES.get(code,heading),group='spotlight',min=1,source='Divine Pride thRO · No event',sourceUrl=url,accessNote='ยังไม่ยืนยันเลเวลและเงื่อนไขเข้าแมพนี้; ไม่ใช้เลเวลมอนเป็นเกณฑ์เข้า กรุณาตรวจเควสและเส้นทางในเกม',entryRequirementVerified=False,monsters=monsters,excludedBosses=excluded,excludedMonsterIds=excluded_ids)

def read_exp(mid):
    url=f'{DP}/database/monster/{mid}'
    page=soup(url,f'mob-{mid}.html')
    values=[]
    for tr in page.select('#exp tr'):
        cells=[c.get_text(' ',strip=True) for c in tr.select('td')]
        if len(cells)==4 and cells[1]=='100': values.append((number(cells[2]),number(cells[3])))
    if not values or len(set(values))!=1: raise ValueError(('No unique 100% EXP row',mid,values))
    return dict(baseExp=values[0][0],jobExp=values[0][1],sourceUrl=url)

def batch(fn, values):
    result={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(fn,v):v for v in values}
        for f in concurrent.futures.as_completed(futures):
            v=futures[f]
            try: result[v]=f.result()
            except Exception as e: print('FAILED',v,str(e),flush=True);raise
            if len(result)%20==0:print(fn.__name__,len(result),'/',len(values),flush=True)
    return result

def main():
    global CACHE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=CACHE, help='Saved thRO map and monster HTML')
    args = parser.parse_args()
    CACHE = args.cache
    export = r"""const fs=require('fs'),vm=require('vm'),c=vm.createContext({});
    for(const f of ['ep20','spotlight-maps','spotlight-2026','spotlight-2025']){const p='assets/data/'+f+'.js';if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c);}
    vm.runInContext(fs.readFileSync('assets/calculator.js','utf8'),c);
    vm.runInContext(fs.readFileSync('assets/data/maps.js','utf8'),c);
    process.stdout.write(vm.runInContext('JSON.stringify({maps:MAPS.filter(m=>m.group!=="spotlight"),events:SPOTLIGHT_EVENTS})',c));"""
    catalog=json.loads(subprocess.run(['node','-e',export],cwd=SITE,capture_output=True,encoding='utf-8',check=True).stdout)
    existing={m['code'] for m in catalog['maps']}
    codes=sorted({r['map'] for e in catalog['events'] for r in e['rules']} - existing - {'*'})
    maps=batch(read_map,codes)
    (CACHE/'spawns.json').write_text(json.dumps(maps,ensure_ascii=False,indent=2),encoding='utf-8')
    ids=sorted({m['id'] for row in maps.values() for m in row['monsters']})
    stats=batch(read_exp,ids)
    notes=json.loads((SITE/'assets/data/spotlight-map-notes.json').read_text(encoding='utf-8'))
    for row in maps.values():
        for mob in row['monsters']:
            mob.update(stats[mob['id']])
            mob['image']=f"assets/monsters/{mob['id']}.png"
        row.update(notes.get(row['code'],{}))
        row['sourceSha256']=hashlib.sha256((CACHE/(row['code']+'.html')).read_bytes()).hexdigest()
        for mob in row['monsters']:
            mob['sourceSha256']=hashlib.sha256((CACHE/('mob-'+str(mob['id'])+'.html')).read_bytes()).hexdigest()
            if row['code']=='ba_lost':
                names={20649:'Red Pitaya',20650:'Yellow Pitaya',20651:'Blue Pitaya',20652:'Violet Pitaya',20653:'Green Pitaya'}
                # The official table identifies each color by its distinct normal EXP and level.
                mob['sourceName']=mob['name'];mob['name']=names[mob['id']]
        row['amount']=sum(m['amount'] for m in row['monsters'])
        for key in ['level','hp','baseExp']:
            row[key]=sum(m[key]*m['amount'] for m in row['monsters'])/row['amount']
    document=dict(checkedOn='2026-09-16',server='thRO',sourceDescription='Map population and monster 100% Base/Job EXP rows from Divine Pride thRO; excludes MVP only. Entry requirements not inferred from monster levels.',maps=[maps[c] for c in codes])
    dest=SITE/'assets/data/spotlight-maps.json'
    dest.write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    (dest.with_suffix('.js')).write_text('// Generated by scripts/import_spotlight_maps.py. Normal map data; event values remain separate.\nconst SPOTLIGHT_MAPS = '+json.dumps(document['maps'],ensure_ascii=False,indent=2)+';\n',encoding='utf-8',newline='\n')
    queue=[(f'{DP}/img/map/original/{c}',SITE/f'assets/maps/{c}.png') for c in codes]
    queue += [(f'https://static.divine-pride.net/images/mobs/png/{mid}.png',SITE/f'assets/monsters/{mid}.png') for mid in ids]
    batch(lambda pair:fetch(*pair) and True,queue)
    print('DONE',len(maps),'maps',sum(len(m['monsters']) for m in maps.values()),'monster rows',len(ids),'unique monsters',flush=True)

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
