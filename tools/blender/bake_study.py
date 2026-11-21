"""
Précalcul de la lumière du bureau de Whitmore et export vers le jeu.

À lancer APRÈS whitmore_study.py, dans la même session Blender :
  blender -b --factory-startup --python tools/blender/whitmore_study.py --python tools/blender/bake_study.py -- <dossier_tmp> none [échantillons_bake]

Produit dans public/assets/scenes/whitmore/ :
  room.glb            pièce statique (3 maillages : room, furniture, small), textures de couleur seules, Draco
  lm_<groupe>.png     lightmaps (éclairement diffus, sRGB, divisé par SCALE)
et src/game/scenes/study/bakedStudy.json (échelle et fichiers).

Les objets examinables (propriété tlc_ex) ne sont pas exportés : le jeu les rend lui-même
(survol, contour, examen). Ils restent dans la scène pendant le calcul pour porter leurs ombres.
"""
import bpy
import json
import math
import os
import sys

import numpy as np
import time

T0 = time.time()
_print = print


def print(*a):
    _print(f'[{time.time() - T0:6.0f} s]', *a, flush=True)


ROOT = os.path.abspath(os.path.join(os.path.dirname(bpy.data.filepath or __file__), '..', '..'))
if not os.path.exists(os.path.join(ROOT, 'package.json')):
    ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
TMP = argv[0] if argv else os.path.join(ROOT, 'tools', 'blender', 'out')
BAKE_SAMPLES = int(argv[2]) if len(argv) > 2 else 512
OUT = os.path.join(ROOT, 'public', 'assets', 'scenes', 'whitmore')
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

GROUPS = {'room': 4096, 'furniture': 2048, 'small': 2048}
MAX_FACES = 25000  # au-delà, on simplifie (tapis scanné, cheminée sculptée)
MAX_TEX = 2048

scene = bpy.context.scene
view_layer = bpy.context.view_layer


def ancestors(o):
    while o:
        yield o
        o = o.parent


def tag(o, key):
    for a in ancestors(o):
        if key in a.keys():
            return a[key]
    return None


EXCLUDE = ('Vitre', 'Ciel')
static = [o for o in scene.objects if o.type == 'MESH' and not tag(o, 'tlc_ex') and not o.name.startswith(EXCLUDE)]
groups = {o.name: (tag(o, 'tlc_group') or 'room') for o in static}
print('STATIQUES', len(static))

# ————————————————————————————————————————— 1. maillages indépendants, modificateurs appliqués, sans parents
bpy.ops.object.select_all(action='DESELECT')
for o in static:
    o.select_set(True)
view_layer.objects.active = static[0]
bpy.ops.object.make_single_user(object=True, obdata=True, material=False)
bpy.ops.object.convert(target='MESH')
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
static = [o for o in bpy.context.selected_objects if o.type == 'MESH']
for o in static:
    o['tlc_group'] = groups.get(o.name, 'room')

# ————————————————————————————————————————— 2. simplification des maillages trop lourds
for o in static:
    n = len(o.data.polygons)
    if n > MAX_FACES:
        md = o.modifiers.new('Simplifier', 'DECIMATE')
        md.ratio = max(0.04, MAX_FACES / n)
        view_layer.objects.active = o
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.ops.object.modifier_apply(modifier=md.name)
        print('SIMPLIFIE', o.name, n, '->', len(o.data.polygons))

# ————————————————————————————————————————— 3. UV : « UVMap » (couleur) + « Lightmap » (lumière), mêmes noms partout
for o in static:
    uvs = o.data.uv_layers
    if len(uvs) == 0:
        uvs.new(name='UVMap')
    uvs[0].name = 'UVMap'
    while len(uvs) > 1:
        uvs.remove(uvs[1])
    lm = uvs.new(name='Lightmap')
    uvs.active = lm
    uvs[0].active_render = True


def select_only(objs):
    bpy.ops.object.mode_set(mode='OBJECT') if bpy.context.object and bpy.context.object.mode != 'OBJECT' else None
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    view_layer.objects.active = objs[0]


fallback = bpy.data.materials.new('Defaut')
fallback.use_nodes = True
for o in static:
    if not o.material_slots:
        o.data.materials.append(fallback)
    for s in o.material_slots:
        if s.material is None:
            s.material = fallback

def unwrap_alone(o):
    """UV de lumière d'un objet seul, rangées dans le carré unité."""
    select_only([o])
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.01, area_weight=0.0, scale_to_bounds=True)
    bpy.ops.uv.pack_islands(margin=0.01, rotate=True)
    bpy.ops.object.mode_set(mode='OBJECT')


def world_area(o):
    sx, sy, sz = o.matrix_world.to_scale()
    k = (abs(sx * sy) + abs(sy * sz) + abs(sx * sz)) / 3
    return max(1e-6, sum(p.area for p in o.data.polygons) * k)


def shelf_pack(sizes, scale, pad):
    """Rangement en étagères de carrés (côté = scale * size) dans [0, 1]² ; None si ça déborde."""
    order = sorted(range(len(sizes)), key=lambda i: -sizes[i])
    x = y = row = 0.0
    out = [None] * len(sizes)
    for i in order:
        side = sizes[i] * scale
        if x + side + pad > 1.0:
            x, y, row = 0.0, y + row + pad, 0.0
        if side > 1.0 or y + side + pad > 1.0:
            return None
        out[i] = (x + pad, y + pad, side)
        x += side + pad
        row = max(row, side)
    return out


def pack_objects(objs, texels):
    """Chaque objet reçoit une case proportionnelle à la racine de sa surface (densité de texels uniforme)."""
    sizes = [math.sqrt(world_area(o)) for o in objs]
    pad = 3 / texels
    lo, hi = 0.0, 1.0 / max(sizes)
    for _ in range(40):
        mid = (lo + hi) / 2
        if shelf_pack(sizes, mid, pad):
            lo = mid
        else:
            hi = mid
    placed = shelf_pack(sizes, lo, pad)
    for o, (ox, oy, side) in zip(objs, placed):
        uv = o.data.uv_layers['Lightmap']
        a = np.empty(len(uv.data) * 2, dtype=np.float32)
        uv.data.foreach_get('uv', a)
        a = a.reshape(-1, 2) * side + np.array([ox, oy], dtype=np.float32)
        uv.data.foreach_set('uv', a.ravel())
    return lo


# objets sculptés très denses (cheminée, tapis scanné, lustre…) : la lumière va dans les sommets,
# pas dans une lightmap (leurs UV se découpent en milliers d'îlots de 1 à 2 pixels)
VC_DENSITY = 2500  # faces par m² au-delà desquelles on passe aux sommets
for o in static:
    n = len(o.data.polygons)
    if n > 3000 and n / world_area(o) > VC_DENSITY:
        print('SOMMETS', o.name, n, 'faces,', round(n / world_area(o)), 'par m²')
        o['tlc_group'] = 'vc'
        o.data.color_attributes.new('LightCol', 'FLOAT_COLOR', 'POINT')

# un objet par groupe AVANT le calcul : Cycles calcule objet par objet, 370 objets = très lent
by_group = {}
members = {g: [o for o in static if o['tlc_group'] == g] for g in list(GROUPS) + ['vc']}
for g in list(GROUPS) + ['vc']:
    objs = members[g]
    if not objs:
        continue
    if g != 'vc':
        size = GROUPS[g]
        for o in objs:
            unwrap_alone(o)
        k = pack_objects(objs, size)
        print('UV', g, len(objs), 'objets, densité', round(k * size, 1), 'texels par racine de m²')
    select_only(objs)
    bpy.ops.object.join()
    ob = view_layer.objects.active
    ob.name = g
    ob['lightmap'] = g
    by_group[g] = [ob]
    if g == 'vc':
        ob.data.color_attributes.active_color = ob.data.color_attributes['LightCol']
    print('FUSION', g, len(ob.data.polygons), 'faces')
static = [o for objs in by_group.values() for o in objs]

# ————————————————————————————————————————— 4. calcul de la lumière (diffus direct + indirect, sans la couleur)
scene.render.engine = 'CYCLES'
scene.cycles.samples = BAKE_SAMPLES
scene.cycles.use_denoising = False
# pas de découpage en tuiles (Cycles écrivait les tuiles dans un dossier temporaire inaccessible)
scene.cycles.use_auto_tile = False
bpy.context.preferences.filepaths.temporary_directory = TMP
bake = scene.render.bake
bake.use_pass_direct = True
bake.use_pass_indirect = True
bake.use_pass_color = False
bake.margin = 6
bake.target = 'IMAGE_TEXTURES'
bake.use_clear = True

images = {}
for g, size in GROUPS.items():
    objs = by_group.get(g)
    if not objs:
        continue
    img = bpy.data.images.new(f'lm_{g}', size, size, float_buffer=True, alpha=False)
    images[g] = img
    mats = {s.material for o in objs for s in o.material_slots if s.material}
    for m in mats:
        nt = m.node_tree
        n = nt.nodes.get('TLC_LIGHTMAP') or nt.nodes.new('ShaderNodeTexImage')
        n.name = 'TLC_LIGHTMAP'
        n.image = img
        nt.nodes.active = n
    select_only(objs)
    print('CALCUL', g, size, 'px,', BAKE_SAMPLES, 'échantillons')
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=6, use_clear=True)
if 'vc' in by_group:
    select_only(by_group['vc'])
    print('CALCUL vc (sommets),', BAKE_SAMPLES, 'échantillons')
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, target='VERTEX_COLORS', use_clear=True)

# ————————————————————————————————————————— 5. lightmaps 8 bits sRGB, divisées par une échelle commune


def to_srgb(x):
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(np.clip(x, 0, None), 1 / 2.4) - 0.055)


def masked_blur(img, sigma):
    """Atténue le bruit du calcul sans baver hors des îlots d'UV (texels vides exclus)."""
    r = int(sigma * 3)
    x = np.arange(-r, r + 1)
    k = np.exp(-x * x / (2 * sigma * sigma)).astype(np.float32)
    k /= k.sum()
    mask = (img.max(axis=2) > 1e-6).astype(np.float32)

    def conv(arr, axis):
        out = np.zeros_like(arr)
        for i, w in zip(x, k):
            out += w * np.roll(arr, i, axis=axis)
        return out
    num = conv(conv(img * mask[..., None], 0), 1)
    den = conv(conv(mask, 0), 1)[..., None]
    out = np.where(den > 1e-4, num / np.maximum(den, 1e-4), img)
    return np.where(mask[..., None] > 0, out, img)


vals = []
arrays = {}
for g, img in images.items():
    a = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(a)
    a = a.reshape(img.size[1], img.size[0], 4)[:, :, :3]
    a = masked_blur(a, sigma=1.6).reshape(-1, 3)
    arrays[g] = a
    lum = a.max(axis=1)
    vals.append(lum[lum > 1e-5])
SCALE = float(np.percentile(np.concatenate(vals), 99.5))
print('ECHELLE', SCALE)
if 'vc' in by_group:
    ca = by_group['vc'][0].data.color_attributes['LightCol']
    c = np.empty(len(ca.data) * 4, dtype=np.float32)
    ca.data.foreach_get('color', c)
    c = c.reshape(-1, 4)
    c[:, :3] = np.clip(c[:, :3] / SCALE, 0, 1)  # linéaire, même échelle que les lightmaps
    c[:, 3] = 1
    ca.data.foreach_set('color', c.ravel())
files = {}
for g, img in images.items():
    a = np.clip(arrays[g] / SCALE, 0, 1)
    rgba = np.ones((a.shape[0], 4), dtype=np.float32)
    rgba[:, :3] = to_srgb(a)
    out = bpy.data.images.new(f'lm_{g}_8', img.size[0], img.size[1], alpha=False)
    out.colorspace_settings.name = 'Non-Color'
    out.pixels.foreach_set(rgba.ravel())
    path = os.path.join(OUT, f'lm_{g}.png')
    out.filepath_raw = path
    out.file_format = 'PNG'
    out.save()
    files[g] = f'lm_{g}.png'
    # la lightmap n'est pas exportée dans le glb
    for m in {s.material for o in by_group.get(g, []) for s in o.material_slots if s.material}:
        n = m.node_tree.nodes.get('TLC_LIGHTMAP')
        if n:
            m.node_tree.nodes.remove(n)

# ————————————————————————————————————————— 6. matériaux pour l'export : couleur (teinte appliquée à l'image) + transparence seulement
tinted = {}


def base_image(m):
    """Branche directement l'image de couleur (teintée si un mélange « multiplier » la précède) sur Base Color."""
    nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf:
        return
    for name in ('Normal', 'Roughness', 'Metallic', 'Coat Weight', 'Coat Normal', 'Specular IOR Level', 'Sheen Weight'):
        sock = bsdf.inputs.get(name)
        if sock:
            for l in list(sock.links):
                nt.links.remove(l)
    bc = bsdf.inputs['Base Color']
    if not bc.links:
        return
    src = bc.links[0].from_node
    if src.type == 'MIX' and getattr(src, 'blend_type', '') == 'MULTIPLY':
        tex = src.inputs[6].links[0].from_node if src.inputs[6].links else None
        tint = tuple(src.inputs[7].default_value)[:3]
        if tex and tex.type == 'TEX_IMAGE':
            key = (tex.image.name, tint)
            if key not in tinted:
                im = tex.image
                w, h = im.size
                a = np.empty(w * h * 4, dtype=np.float32)
                im.pixels.foreach_get(a)
                a = a.reshape(-1, 4)
                # pixels en espace linéaire ? non : image sRGB, Blender renvoie les valeurs encodées → convertir
                lin = np.where(a[:, :3] <= 0.04045, a[:, :3] / 12.92, ((a[:, :3] + 0.055) / 1.055) ** 2.4)
                lin *= np.array(tint, dtype=np.float32)
                a[:, :3] = to_srgb(lin)
                new = bpy.data.images.new(f'{im.name}_teinte_{len(tinted)}', w, h)
                new.pixels.foreach_set(a.ravel())
                path = os.path.join(TMP, f'{new.name}.png')
                new.filepath_raw = path
                new.file_format = 'PNG'
                new.save()
                tinted[key] = new
            tex.image = tinted[key]
            nt.links.new(tex.outputs['Color'], bc)


export_mats = {s.material for o in static for s in o.material_slots if s.material}
for m in export_mats:
    base_image(m)
for im in bpy.data.images:
    if im.size[0] > MAX_TEX and not im.name.startswith('lm_'):
        im.scale(MAX_TEX, MAX_TEX * im.size[1] // im.size[0])

# ————————————————————————————————————————— 7. un maillage par groupe, export
final = [o for objs in by_group.values() for o in objs]
select_only(final)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUT, 'room.glb'),
    export_format='GLB',
    use_selection=True,
    export_extras=True,
    export_texcoords=True,
    export_normals=False,
    export_image_format='WEBP',
    export_image_quality=85,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_texcoord_quantization=14,
    export_vertex_color='ACTIVE',
    export_all_vertex_colors=False,
    export_lights=False,
    export_cameras=False,
)
manifest = {'scale': SCALE, 'lightmaps': files, 'glb': 'room.glb', 'samples': BAKE_SAMPLES}
with open(os.path.join(ROOT, 'src', 'game', 'scenes', 'study', 'bakedStudy.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(TMP, 'whitmore_baked.blend'))
print('EXPORT OK', manifest)
