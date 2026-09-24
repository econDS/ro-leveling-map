"""Parser edge cases and independent validation of every generated mask."""
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('geometry', ROOT / 'scripts/build_map_geometry.py')
geometry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(geometry)

def gat(width, height, types, version=b'\x01\x03'):
    return b'GRAT' + version + struct.pack('<ii', width, height) + b''.join(
        struct.pack('<4fI', 0, 0, 0, 0, t) for t in types)

class GeometryTests(unittest.TestCase):
    def test_types_flags_orientation_and_boundary(self):
        # Bottom GAT row contains every type; final row/column are server boundaries.
        types = [0, 1, 2, 3, 4, 5, 6, 0x80000000, 0] + [1]*9 + [0]*9
        for version in (b'\x01\x02', b'\x01\x03'):
            w,h,counts,mask = geometry.parse_gat(gat(9,3,types,version))
            self.assertEqual(mask[:18], bytes(18))
            self.assertEqual(list(mask[18:]), [255,0,255,255,255,0,255,255,0])
            self.assertEqual(sum(counts.values()),27)

    def test_reject_corruption_and_unknown_types(self):
        good = gat(2,2,[0,1,1,1])
        for bad in (b'bad', good[:-1], good+b'x', gat(2,2,[7,1,1,1]),
                    gat(2,2,[8,1,1,1]), gat(2,2,[0,1,1,1],b'\x02\x00'),
                    b'GRAT\x01\x03'+struct.pack('<ii',-1,2)):
            with self.assertRaises(ValueError): geometry.parse_gat(bad)

    def test_keep_thin_corridors_and_disconnected_rooms(self):
        # Two islands (sizes 7 and 1); diagonal contact must not merge components.
        mask=bytes(255 if c=='1' else 0 for c in '111000010011101')
        before=bytes(mask)
        self.assertEqual(geometry.components(mask,5,3), [7,1])
        self.assertEqual(mask,before)
        self.assertEqual(geometry.components(bytes([255,0,0,255]),2,2),[1,1])

    def test_every_mask_matches_metadata_and_sources(self):
        document=json.loads((ROOT/'assets/data/map-geometry.json').read_text(encoding='utf-8'))
        available=0
        for code,g in document['maps'].items():
            if g['status']=='unavailable':
                self.assertTrue(code.startswith('daily_'))
                continue
            available+=1
            mask_image=Image.open(ROOT/g['maskImage']).convert('L')
            mask=mask_image.tobytes()
            self.assertEqual(mask_image.size,(g['width'],g['height']),code)
            self.assertEqual(set(mask),{0,255},code)
            self.assertEqual(mask.count(255),g['walkableCells'],code)
            self.assertEqual(hashlib.sha256(mask).hexdigest(),g['maskSha256'],code)
            types=g['cellTypes']
            self.assertEqual(sum(types.values()),g['totalCells'],code)
            flagged=sum(types.get(str(t),0) for t in geometry.WALK_TYPES)
            self.assertEqual(flagged-g['excludedBoundaryCells'],g['walkableCells'],code)
            self.assertEqual(sum(mask[:g['width']]),0,code)
            self.assertFalse(any(mask[g['width']-1::g['width']]),code)
            sizes=geometry.components(mask,g['width'],g['height'])
            self.assertEqual(len(sizes),g['components'],code)
            self.assertEqual(sizes[0],g['largestComponentCells'],code)
            raw=Image.open(ROOT/g['rawImage']).convert('RGB')
            overlay=Image.open(ROOT/g['overlayImage']).convert('RGB')
            self.assertEqual(raw.size,mask_image.size,code)
            self.assertEqual(overlay.size,mask_image.size,code)
            # Overlay must change only counted pixels, without shifting the mask.
            for before,after,counted in zip(raw.get_flattened_data(),overlay.get_flattened_data(),mask):
                self.assertEqual(before!=after,bool(counted),code)
            for field in ['sourceSha256','gatSha256','rawSha256']:
                self.assertEqual(len(g[field]),64)
        self.assertEqual(available,129)

if __name__=='__main__': unittest.main()
