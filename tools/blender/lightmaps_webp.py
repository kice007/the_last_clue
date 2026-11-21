"""Après bake_study.py : convertit les lightmaps PNG en WebP (≈ 5× plus léger) et met le manifeste à jour.

  python tools/blender/lightmaps_webp.py
"""
import json
import os

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'assets', 'scenes', 'whitmore')
MANIFEST = os.path.join(ROOT, 'src', 'game', 'scenes', 'study', 'bakedStudy.json')

with open(MANIFEST, encoding='utf-8') as f:
    manifest = json.load(f)
for group, name in list(manifest['lightmaps'].items()):
    src = os.path.join(OUT, name)
    if not name.endswith('.png') or not os.path.exists(src):
        continue
    dst = name[:-4] + '.webp'
    Image.open(src).convert('RGB').save(os.path.join(OUT, dst), 'WEBP', quality=92, method=6)
    os.remove(src)
    manifest['lightmaps'][group] = dst
    print(group, '->', dst)
with open(MANIFEST, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)
