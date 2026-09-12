"""Import normal (non-event) EP20 field data from a saved official article.
Run from any directory: python scripts/import_ep20.py path/to/ro-ep20.html
Download the resulting asset queue before running build/verification.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://ro.gnjoy.in.th/episode-20-the-immortal-map-monster/'


def largest_image(img):
    candidates = [(int(img.get('width', 0)), img['src'])]
    for part in img.get('srcset', '').split(','):
        parts = part.strip().split()
        if len(parts) == 2 and parts[1].endswith('w'):
            candidates.append((int(parts[1][:-1]), parts[0]))
    return max(candidates)[1]


def main():
    soup = BeautifulSoup(Path(sys.argv[1]).read_bytes(), 'html.parser')
    maps, downloads = [], {}
    excluded = {'Snowstorm Angel', 'Sanctuary Cleaning Chief'}
    for table in soup.select('.entry-content table'):
        heading = table.select_one('thead')
        if not heading:
            continue
        title = heading.get_text(' ', strip=True)
        match = re.search(r'(.+?)\s*\((jor_\w+)\)', title)
        if not match:
            continue
        name, code = match.groups()
        rows = table.select('tbody > tr')
        mobs, bosses = [], []
        for n in range(0, len(rows), 4):
            group = rows[n:n + 4]
            assert len(group) == 4
            cells = [[c.get_text(' ', strip=True) for c in r.find_all(['td', 'th'], recursive=False)] for r in group]
            assert cells[0][1:] == ['Level', 'HP', 'Def', 'Mdef', 'EXP', 'JEXP']
            numeric = [int(x.replace(',', '')) for x in cells[1][1:]]
            level, hp, defense, mdef, exp, job = numeric
            img = group[1].select_one('img')
            url = largest_image(img)
            file = 'assets/monsters/ep20_' + Path(urlparse(url).path).name
            mob = dict(name=cells[0][0], level=level, hp=hp, baseExp=exp, jobExp=job,
                       amount=int(cells[3][-1]), image=file, def_=defense, mdef=mdef)
            if mob['name'] in excluded:
                bosses.append(mob)
                continue
            downloads[file] = url
            mobs.append(mob)
        assert mobs
        amount = sum(m['amount'] for m in mobs)
        item = dict(code=code, name=name.strip(), group='ep20', min=200, amount=amount,
                    level=sum(m['level'] * m['amount'] for m in mobs) / amount,
                    hp=sum(m['hp'] * m['amount'] for m in mobs) / amount,
                    baseExp=sum(m['baseExp'] * m['amount'] for m in mobs) / amount,
                    source='RO Thailand EP20 · No event', sourceUrl=SOURCE,
                    aliases=f'EP20 Episode 20 The Immortal Issgard อิสการ์ด {code}',
                    accessNote='Lv 200+ ตามหน้า Map & Monster; ต้องผ่านเควส EP19 / EP20 ของพื้นที่ (เควสหลัก EP20 เริ่ม Lv 215)',
                    monsters=mobs, excludedBosses=[m['name'] for m in bosses])
        # Use the same raw map format as existing density measurements, not
        # official minimaps (some reverse the walkable/background colors).
        downloads[f'assets/maps/{code}.png'] = f'https://www.divine-pride.net/img/map/original/{code}'
        maps.append(item)
    assert len(maps) == 9, f'Unexpected map count: {len(maps)}'
    dest = ROOT / 'assets/data'
    dest.mkdir(parents=True, exist_ok=True)
    data = dict(checkedOn='2026-09-12', sourceUrl=SOURCE, maps=maps)
    (dest / 'ep20.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (dest / 'ep20-downloads.json').write_text(json.dumps([dict(file=f, url=u) for f, u in downloads.items()], indent=2), encoding='utf-8')
    print(f'Imported {len(maps)} maps / {sum(len(m["monsters"]) for m in maps)} monster rows / {len(downloads)} assets')


if __name__ == '__main__':
    main()
