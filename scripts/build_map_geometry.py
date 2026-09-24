"""Build auditable cell masks from Divine Pride's public GAT viewer assets.

python scripts/build_map_geometry.py --cache PATH --checked-on YYYY-MM-DD
Cache: CODE.gat (public viewer response), CODE.raw (PNG), asset-crypto.js.
No brightness threshold, morphological cleanup, or largest-island filtering.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess

from PIL import Image

WALK_TYPES = {0, 2, 3, 4, 6}
KNOWN_TYPES = set(range(7))
SOURCE = 'https://www.divine-pride.net'


def parse_gat(data):
    if len(data) < 14 or data[:4] != b'GRAT':
        raise ValueError('Invalid GAT header')
    if data[4:6] not in (b'\x01\x02', b'\x01\x03'):
        raise ValueError('Unsupported GAT version')
    width, height = struct.unpack_from('<ii', data, 6)
    if not (1 <= width <= 2048 and 1 <= height <= 2048):
        raise ValueError('Invalid GAT dimensions')
    if len(data) != 14 + 20 * width * height:
        raise ValueError('Truncated or oversized GAT')
    types = [cell[4] & 0x7fffffff for cell in struct.iter_unpack('<4fI', data[14:])]
    counts = Counter(types)
    if set(counts) - KNOWN_TYPES:
        raise ValueError(f'Unsupported GAT cell types: {sorted(set(counts) - KNOWN_TYPES)}')
    # map_getcell excludes the last GAT row and column (server boundary).
    # GAT origin is bottom-left; PNG origin is top-left.
    mask = bytes(255 if x < width - 1 and y < height - 1 and types[y * width + x] in WALK_TYPES else 0
                 for y in range(height - 1, -1, -1) for x in range(width))
    return width, height, counts, mask


def components(mask, width, height):
    """Four-neighbour connectivity; keep ALL components, including warp rooms."""
    remaining = bytearray(mask)
    sizes = []
    for start in range(len(remaining)):
        if not remaining[start]:
            continue
        stack, size = [start], 0
        remaining[start] = 0
        while stack:
            i = stack.pop()
            size += 1
            x, y = i % width, i // width
            neighbours = []
            if x > 0: neighbours.append(i - 1)
            if x + 1 < width: neighbours.append(i + 1)
            if y > 0: neighbours.append(i - width)
            if y + 1 < height: neighbours.append(i + width)
            for j in neighbours:
                if remaining[j]:
                    remaining[j] = 0
                    stack.append(j)
        sizes.append(size)
    return sorted(sizes, reverse=True)


def export_maps(site):
    js = r"""const fs=require('fs'),vm=require('vm'),c=vm.createContext({});
    vm.runInContext(fs.readFileSync('assets/data/ep20.js','utf8'),c);
    vm.runInContext(fs.readFileSync('assets/data/spotlight-maps.js','utf8'),c);
    vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>\s*(const MAPS =[\s\S]*?)<\/script>/)[1]+';this.maps=MAPS;',c);
    process.stdout.write(JSON.stringify(c.maps));"""
    return json.loads(subprocess.run(['node', '-e', js], cwd=site, capture_output=True,
                                     encoding='utf-8', check=True).stdout)


def build(cache, site, checked_on, only=None):
    key_js = (cache / 'asset-crypto.js').read_text(encoding='utf-8')
    key = bytes(int(x, 16) for x in re.findall(r'0x([0-9a-fA-F]{2})', key_js.split(']);')[0]))
    if len(key) != 32:
        raise ValueError('Public viewer XOR key changed; inspect asset-crypto.js')
    output = site / 'assets/maps/geometry'
    output.mkdir(parents=True, exist_ok=True)
    result = {}
    previous = json.loads((site / 'assets/data/map-geometry.json').read_text(encoding='utf-8'))['maps'] if only else {}
    for map_data in export_maps(site):
        code = map_data['code']
        if only is not None and code not in only:
            if code not in previous: raise ValueError('Missing existing geometry: '+code)
            result[code] = previous[code]
            continue
        if map_data.get('archivedEvent'):
            result[code] = {'status': 'unavailable', 'reason': 'ไม่มี GAT ยืนยันสำหรับ Daily Dungeon รอบนี้; ภาพประกอบยืมจาก Biosphere'}
            continue
        source_url = f'{SOURCE}/Tools/MapViewerAsset?mapname={code}&ext=gat'
        record = {'status': 'unavailable', 'sourceUrl': f'{SOURCE}/database/map/{code}',
                  'gatUrl': source_url, 'rawUrl': f'{SOURCE}/img/map/raw/{code}', 'checkedOn': checked_on}
        try:
            encoded = (cache / f'{code}.gat').read_bytes()
            decoded = bytes(v ^ key[i % len(key)] for i, v in enumerate(encoded))
            width, height, counts, mask = parse_gat(decoded)
            raw = Image.open(cache / f'{code}.raw').convert('RGB')
            if raw.size != (width, height):
                raise ValueError('Raw image and GAT dimensions differ')
            walkable = mask.count(255)
            if not walkable:
                raise ValueError('No walkable cells')
            sizes = components(mask, width, height)
            prefix = f'assets/maps/geometry/{code}'
            mask_image = Image.frombytes('L', (width, height), mask)
            mask_image.convert('1').save(site / f'{prefix}-mask.png', optimize=True)
            raw.save(site / f'{prefix}-raw.png', optimize=True)
            overlay = Image.new('RGBA', raw.size, (25, 220, 135, 0))
            overlay.putalpha(mask_image.point(lambda p: 150 if p else 0))
            Image.alpha_composite(raw.convert('RGBA'), overlay).convert('RGB').save(
                site / f'{prefix}-overlay.png', optimize=True)
            record.update(status='verified-gat', method='gat-cell-types', version=f'{decoded[4]}.{decoded[5]}',
                          width=width, height=height, totalCells=width*height, walkableCells=walkable,
                          walkableRatio=walkable/(width*height), cellTypes=dict(sorted(counts.items())),
                          excludedBoundaryCells=sum(counts[t] for t in WALK_TYPES)-walkable,
                          components=len(sizes), largestComponentCells=sizes[0],
                          smallComponentCells=sum(n for n in sizes if n <= 4),
                          borderWalkableCells=sum(bool(mask[y*width+x]) for y in range(height)
                              for x in range(width) if x in (0,width-1) or y in (0,height-1)),
                          maskImage=f'{prefix}-mask.png', rawImage=f'{prefix}-raw.png',
                          overlayImage=f'{prefix}-overlay.png',
                          sourceSha256=hashlib.sha256(encoded).hexdigest(),
                          gatSha256=hashlib.sha256(decoded).hexdigest(),
                          rawSha256=hashlib.sha256((cache / f'{code}.raw').read_bytes()).hexdigest(),
                          maskSha256=hashlib.sha256(mask).hexdigest())
        except (OSError, ValueError) as error:
            record['reason'] = str(error)
        result[code] = record
    document = {'schemaVersion': 1, 'walkableTypes': sorted(WALK_TYPES),
                'boundaryRule': 'Exclude GAT x=width-1 and y=height-1, following rAthena map_getcell; keep all other components.',
                'classificationSource': 'https://github.com/rathena/rathena/blob/master/src/map/map.cpp',
                'scope': 'Public reference GAT, not a live thRO server or spawn-area verification. All walkable components retained.',
                'maps': result}
    (site / 'assets/data/map-geometry.json').write_text(json.dumps(document, ensure_ascii=False, indent=2)+'\n', encoding='utf-8',newline='\n')
    (site / 'assets/data/map-geometry.js').write_text('// Generated by scripts/build_map_geometry.py; do not use legacy brightness areas.\nconst MAP_GEOMETRY = '+json.dumps(result, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8',newline='\n')
    print(json.dumps({'available': sum(r['status']=='verified-gat' for r in result.values()),
                      'unavailable': {c:r['reason'] for c,r in result.items() if r['status']!='verified-gat'}}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--checked-on', required=True)
    parser.add_argument('--only', nargs='+', help='Build these maps and preserve existing geometry for other maps')
    args = parser.parse_args()
    build(args.cache, Path(__file__).resolve().parents[1], args.checked_on, set(args.only) if args.only else None)
