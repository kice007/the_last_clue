"""
Bureau d'Alexander Whitmore (Blackwood Manor, 1908) reconstruit dans Blender.

Même plan que la scène WebGL (src/game/scenes/study) : pièce 7 x 6 m, hauteur 3,4 m,
origine au centre du sol. Les coordonnées sont écrites dans le repère three.js
(Y vers le haut) et converties par P() : three (x, y, z) -> Blender (x, -z, y).

Usage :
  blender -b --factory-startup --python tools/blender/whitmore_study.py -- <dossier_sortie> [vues] [échantillons]
  vues : liste séparée par des virgules (seuil,bureau,cheminee,...) ou "none"
"""
import bmesh
import bpy
import math
import os
import random
import sys
from mathutils import Matrix, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEX = os.path.join(ROOT, 'public', 'assets', 'textures', 'materials')
PROPS = os.path.join(ROOT, 'public', 'assets', 'props', 'polyhaven')
SKETCHFAB = os.path.join(ROOT, 'tools', 'blender', 'sketchfab')  # modèles CC-BY téléchargés (hors git)
DESK_TOP = 0.736  # plateau du bureau Sketchfab « Antique Desk »

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else os.path.join(ROOT, 'tools', 'blender', 'out')
VIEWS = (argv[1] if len(argv) > 1 else 'seuil,bureau,cheminee').split(',')
SAMPLES = int(argv[2]) if len(argv) > 2 else 256
os.makedirs(OUT, exist_ok=True)

W, D, H = 7.0, 6.0, 3.4
T = 0.12
HW, HD = W / 2, D / 2
IN_X, IN_Z = HW - T / 2, HD - T / 2  # faces intérieures des murs
WAIN = 1.1


def P(x, y, z):
    return Vector((x, -z, y))


def S(sx, sy, sz):
    return Vector((sx, sz, sy))


# ————————————————————————————————————————— scène vide

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
coll = scene.collection
random.seed(7)


# ————————————————————————————————————————— matériaux

def node(nt, kind, loc=(0, 0), **props):
    n = nt.nodes.new(kind)
    n.location = loc
    for k, v in props.items():
        setattr(n, k, v)
    return n


def principled(nt):
    return next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree


def mix_rgb(nt, a, b, blend='MULTIPLY', fac=1.0, loc=(0, 0)):
    n = node(nt, 'ShaderNodeMix', loc, data_type='RGBA', blend_type=blend)
    n.inputs[0].default_value = fac
    for src, idx in ((a, 6), (b, 7)):
        if isinstance(src, (tuple, list)):
            n.inputs[idx].default_value = (*src[:3], 1)
        else:
            nt.links.new(src, n.inputs[idx])
    return n.outputs[2]


def hexc(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)


def img(tex_id, kind, color=False):
    path = os.path.join(TEX, tex_id, f'{tex_id}_{kind}_1k.jpg')
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = 'sRGB' if color else 'Non-Color'
    return im


def pbr(name, tex_id, tint='#ffffff', rough=1.0, normal=1.0, scale=1.0, metal=0.0, coat=0.0):
    """Matériau PBR Poly Haven (diffuse, normale GL, rugosité), UV en mètres x scale."""
    m, nt = new_mat(name)
    bsdf = principled(nt)
    uv = node(nt, 'ShaderNodeTexCoord', (-1100, 0))
    mp = node(nt, 'ShaderNodeMapping', (-900, 0))
    mp.inputs['Scale'].default_value = (scale, scale, 1)
    nt.links.new(uv.outputs['UV'], mp.inputs['Vector'])
    col = node(nt, 'ShaderNodeTexImage', (-650, 300), image=img(tex_id, 'diffuse', True))
    rgh = node(nt, 'ShaderNodeTexImage', (-650, 0), image=img(tex_id, 'rough'))
    nor = node(nt, 'ShaderNodeTexImage', (-650, -300), image=img(tex_id, 'nor_gl'))
    for t in (col, rgh, nor):
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
    nt.links.new(mix_rgb(nt, col.outputs['Color'], hexc(tint), loc=(-350, 300)), bsdf.inputs['Base Color'])
    rm = node(nt, 'ShaderNodeMath', (-350, 0), operation='MULTIPLY')
    rm.inputs[1].default_value = rough
    rm.use_clamp = True
    nt.links.new(rgh.outputs['Color'], rm.inputs[0])
    nt.links.new(rm.outputs[0], bsdf.inputs['Roughness'])
    nm = node(nt, 'ShaderNodeNormalMap', (-350, -300))
    nm.inputs['Strength'].default_value = normal
    nt.links.new(nor.outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Coat Weight'].default_value = coat
    bsdf.inputs['Coat Roughness'].default_value = 0.35
    return m


def plain(name, color, rough=0.5, metal=0.0, emit=None, strength=0.0, coat=0.0, transmission=0.0, ior=1.45):
    m, nt = new_mat(name)
    b = principled(nt)
    b.inputs['Base Color'].default_value = (*hexc(color), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    if emit:
        b.inputs['Emission Color'].default_value = (*hexc(emit), 1)
        b.inputs['Emission Strength'].default_value = strength
    return m


def shadow_transparent(m):
    """Verre : laisse passer les rayons d'ombre (sinon la lune et la lampe sont bloquées)."""
    nt = m.node_tree
    out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
    if not out or not out.inputs['Surface'].links:
        return
    src = out.inputs['Surface'].links[0].from_socket
    lp = node(nt, 'ShaderNodeLightPath', (out.location.x - 400, out.location.y + 250))
    tr = node(nt, 'ShaderNodeBsdfTransparent', (out.location.x - 400, out.location.y - 150))
    mx = node(nt, 'ShaderNodeMixShader', (out.location.x - 200, out.location.y))
    nt.links.new(lp.outputs['Is Shadow Ray'], mx.inputs[0])
    nt.links.new(src, mx.inputs[1])
    nt.links.new(tr.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs['Surface'])


M = {
    'plaster': pbr('Enduit', 'plastered_wall_04', '#56665a', rough=1.0, normal=0.6, scale=0.7),
    'ceiling': pbr('Plafond', 'plastered_wall_04', '#8a8070', rough=1.0, normal=0.4, scale=0.6),
    'panel': pbr('Lambris', 'black_walnut_veneer_01', '#5e3e2a', rough=0.9, normal=0.6, scale=0.8, coat=0.2),
    'trim': pbr('Moulures', 'black_walnut_veneer_01', '#4a3020', rough=0.8, normal=0.4, scale=1.2, coat=0.3),
    'floor': pbr('Parquet', 'herringbone_parquet', '#9a7454', rough=1.0, normal=0.8, scale=0.5, coat=0.12),
    'walnut': pbr('Noyer', 'black_walnut_veneer_01', '#6e4a34', rough=0.8, normal=0.8, scale=1.6, coat=0.3),
    'leather': pbr('Cuir', 'brown_leather', '#4a5a3a', rough=0.95, normal=0.7, scale=1.5),
    'marble': pbr('Marbre', 'marble_01', '#4a524c', rough=0.5, normal=0.3, scale=1.0, coat=0.6),
    'velvet': pbr('Velours', 'velour_velvet', '#4a0e12', rough=1.0, normal=0.8, scale=1.2),
    'brass': plain('Laiton', '#c9a060', rough=0.28, metal=1.0),
    'soot': plain('Suie', '#060504', rough=1.0),
    'paper': plain('Papier', '#d8ceb4', rough=0.95),
    'ink': plain('Encre', '#141a24', rough=0.08, coat=1.0),
    'iron': plain('Fonte', '#18181a', rough=0.6, metal=0.8),
}
M['velvet'].node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value = 1.0
M['velvet'].node_tree.nodes['Principled BSDF'].inputs['Sheen Tint'].default_value = (1.0, 0.55, 0.5, 1)


# ————————————————————————————————————————— géométrie

def box_uv(bm, scale=1.0):
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            c = l.vert.co
            l[uv].uv = ((c.y, c.z), (c.x, c.z), (c.x, c.y))[ax]
            l[uv].uv *= scale


def finish(name, bm, mat, bevel=0.0, segs=2, smooth=True, parent=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    if isinstance(mat, (list, tuple)):
        for m in mat:
            me.materials.append(m)
    elif mat:
        me.materials.append(mat)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    if bevel > 0:
        md = ob.modifiers.new('Biseau', 'BEVEL')
        md.width = bevel
        md.segments = segs
        md.limit_method = 'ANGLE'
        md.harden_normals = True
    if parent:
        ob.parent = parent
    return ob


def box(name, c, s, mat, bevel=0.004, uvs=1.0):
    """Boîte en coordonnées three (centre, taille)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sv = S(*s)
    cv = P(*c)
    for v in bm.verts:
        v.co = Vector((v.co.x * sv.x, v.co.y * sv.y, v.co.z * sv.z)) + cv
    box_uv(bm, uvs)
    return finish(name, bm, mat, bevel)


def strip(name, a, b, normal, prof, mat, y0=0.0, uvs=1.0):
    """Moulure : profil [(saillie, hauteur)] extrudé de a à b (points three au sol), normale vers la pièce."""
    a, b, n = Vector(a), Vector(b), Vector(normal)
    bm = bmesh.new()
    rings = []
    for e in (a, b):
        rings.append([bm.verts.new(P(*(e + n * d + Vector((0, y0 + h, 0))))) for d, h in prof])
    k = len(prof)
    for i in range(k - 1):
        try:
            bm.faces.new((rings[0][i], rings[0][i + 1], rings[1][i + 1], rings[1][i]))
        except ValueError:
            pass
    for r in rings:
        try:
            bm.faces.new(r)
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    box_uv(bm, uvs)
    return finish(name, bm, mat, smooth=False)


def lathe(name, prof, c, mat, segs=48, smooth=True):
    """Révolution d'un profil [(rayon, hauteur)] autour de l'axe vertical, base en c (three)."""
    bm = bmesh.new()
    rings = []
    for r, h in prof:
        ring = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            ring.append(bm.verts.new(P(c[0] + r * math.cos(a), c[1] + h, c[2] + r * math.sin(a))))
        rings.append(ring)
    for j in range(len(rings) - 1):
        for i in range(segs):
            q = (rings[j][i], rings[j][(i + 1) % segs], rings[j + 1][(i + 1) % segs], rings[j + 1][i])
            try:
                bm.faces.new(q)
            except ValueError:
                pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    box_uv(bm, 2.0)
    return finish(name, bm, mat, smooth=smooth)


# ————————————————————————————————————————— pièce

def walls():
    wx0, wx1, wy0, wy1 = -0.85, 0.85, 0.75, 3.0
    parts = [
        ((-HW + wx0) / 2, H / 2, -HD, wx0 + HW, H, T),
        ((HW + wx1) / 2, H / 2, -HD, HW - wx1, H, T),
        (0, wy0 / 2, -HD, wx1 - wx0, wy0, T),
        (0, (wy1 + H) / 2, -HD, wx1 - wx0, H - wy1, T),
        (-HW, H / 2, 0, T, H, D),
        (HW, H / 2, 0, T, H, D),
        (0.85, H / 2, HD, 5.3, H, T),
        (-3.25, H / 2, HD, 0.5, H, T),
        (-2.3, (2.3 + H) / 2, HD, 1.4, H - 2.3, T),
    ]
    for i, (x, y, z, sx, sy, sz) in enumerate(parts):
        box(f'Mur_{i}', (x, y, z), (sx, sy, sz), M['plaster'], bevel=0, uvs=1.0)
    # sol et plafond
    box('Sol', (0, -0.01, 0), (W, 0.02, D), M['floor'], bevel=0)
    box('Plafond', (0, H + 0.01, 0), (W, 0.02, D), M['ceiling'], bevel=0)


# segments de mur intérieurs pour le lambris : (axe, coordonnée fixe, sens normal, début, fin, hauteur)
SEGMENTS = [
    ('x', -IN_Z, 1, -IN_X, -1.0, WAIN),
    ('x', -IN_Z, 1, -1.0, 1.0, 0.66),
    ('x', -IN_Z, 1, 1.0, IN_X, WAIN),
    ('z', -IN_X, 1, -IN_Z, -1.4, WAIN),
    ('z', -IN_X, 1, 0.6, IN_Z, WAIN),
    ('z', IN_X, -1, -IN_Z, IN_Z, WAIN),
    ('x', IN_Z, -1, -IN_X, -2.95, WAIN),
    ('x', IN_Z, -1, -1.65, IN_X, WAIN),
]


def seg_point(seg, s, d, y):
    ax, fixed, sg = seg[0], seg[1], seg[2]
    return (s, y, fixed + sg * d) if ax == 'x' else (fixed + sg * d, y, s)


def seg_box(name, seg, s0, s1, d0, d1, y0, y1, mat, bevel=0.004):
    c = seg_point(seg, (s0 + s1) / 2, (d0 + d1) / 2, (y0 + y1) / 2)
    ls, ld, lh = abs(s1 - s0), abs(d1 - d0), y1 - y0
    size = (ls, lh, ld) if seg[0] == 'x' else (ld, lh, ls)
    return box(name, c, size, mat, bevel)


def wainscot():
    for k, seg in enumerate(SEGMENTS):
        ax, fixed, sg, a, b, top = seg
        n = (0, 0, sg) if ax == 'x' else (sg, 0, 0)
        seg_box(f'Lambris_fond_{k}', seg, a, b, 0, 0.012, 0, top, M['panel'], bevel=0)
        count = max(1, round((b - a) / 0.62))
        step = (b - a) / count
        rail_lo, rail_hi = 0.2, top - 0.09
        # traverses haute et basse
        seg_box(f'Traverse_b_{k}', seg, a, b, 0.012, 0.032, rail_lo - 0.02, rail_lo + 0.07, M['trim'])
        seg_box(f'Traverse_h_{k}', seg, a, b, 0.012, 0.032, rail_hi - 0.02, top, M['trim'])
        for i in range(count + 1):
            s = a + i * step
            seg_box(f'Montant_{k}_{i}', seg, max(a, s - 0.035), min(b, s + 0.035), 0.012, 0.032, rail_lo, rail_hi, M['trim'])
        for i in range(count):
            s0, s1 = a + i * step + 0.06, a + (i + 1) * step - 0.06
            if s1 - s0 > 0.1 and rail_hi - rail_lo > 0.25:
                seg_box(f'Panneau_{k}_{i}', seg, s0, s1, 0.012, 0.03, rail_lo + 0.11, rail_hi - 0.04, M['panel'], bevel=0.014)
        # plinthe et cimaise
        p0 = seg_point(seg, a, 0, 0)
        p1 = seg_point(seg, b, 0, 0)
        strip(f'Plinthe_{k}', p0, p1, n, [(0, 0), (0.045, 0), (0.045, 0.17), (0.035, 0.19), (0.03, 0.2), (0, 0.2)], M['trim'])
        strip(f'Cimaise_{k}', p0, p1, n, [(0, -0.035), (0.04, -0.035), (0.05, -0.015), (0.055, 0.0), (0.05, 0.02), (0.035, 0.03), (0, 0.03)], M['trim'], y0=top)


def cornice():
    prof = [(0, 0), (0.015, 0.0), (0.02, 0.02), (0.04, 0.035), (0.05, 0.06), (0.08, 0.08), (0.1, 0.11), (0.13, 0.13), (0.17, 0.15), (0.17, 0.2), (0, 0.2)]
    y0 = H - 0.2
    runs = [
        ((-HW, 0, -IN_Z), (HW, 0, -IN_Z), (0, 0, 1)),
        ((-HW, 0, IN_Z), (HW, 0, IN_Z), (0, 0, -1)),
        ((-IN_X, 0, -HD), (-IN_X, 0, HD), (1, 0, 0)),
        ((IN_X, 0, -HD), (IN_X, 0, HD), (-1, 0, 0)),
    ]
    for i, (a, b, n) in enumerate(runs):
        strip(f'Corniche_{i}', a, b, n, prof, M['ceiling'], y0=y0)
    # rosace sous le lustre
    rose = [(0.0, 0), (0.12, 0), (0.18, 0.015), (0.24, 0.01), (0.3, 0.025), (0.34, 0.012), (0.36, 0.0)]
    lathe('Rosace', [(r, -h) for r, h in rose], (0, H - 0.001, -0.4), M['ceiling'], segs=64)


def window():
    y0, y1, x0, x1 = 0.75, 3.0, -0.85, 0.85
    z = -HD
    # embrasure
    for i, (c, s) in enumerate([
        ((x0 - 0.01, (y0 + y1) / 2, z), (0.02, y1 - y0, T)),
        ((x1 + 0.01, (y0 + y1) / 2, z), (0.02, y1 - y0, T)),
        ((0, y1 + 0.01, z), (x1 - x0, 0.02, T)),
    ]):
        box(f'Embrasure_{i}', c, s, M['plaster'], bevel=0)
    # dormant et petits bois
    zf = z + 0.0
    for x in (-0.425, 0, 0.425):
        box('Montant_fenetre', (x, (y0 + y1) / 2, zf), (0.035, y1 - y0, 0.06), M['trim'], bevel=0.003)
    y = y0 + 0.28
    while y < y1 - 0.05:
        box('Petit_bois', (0, y, zf), (x1 - x0, 0.022, 0.045), M['trim'], bevel=0.003)
        y += 0.28
    for i, (c, s) in enumerate([
        ((0, y1 + 0.06, z + T / 2 + 0.03), (x1 - x0 + 0.3, 0.14, 0.06)),
        ((x0 - 0.08, (y0 + y1) / 2, z + T / 2 + 0.03), (0.14, y1 - y0 + 0.12, 0.06)),
        ((x1 + 0.08, (y0 + y1) / 2, z + T / 2 + 0.03), (0.14, y1 - y0 + 0.12, 0.06)),
        ((0, y0 - 0.03, z + 0.12), (x1 - x0 + 0.4, 0.05, 0.3)),
    ]):
        box(f'Chambranle_{i}', c, s, M['trim'], bevel=0.008)
    # vitre mouillée
    glass, nt = new_mat('Vitre')
    b = principled(nt)
    b.inputs['Roughness'].default_value = 0.04
    b.inputs['Transmission Weight'].default_value = 1.0
    b.inputs['IOR'].default_value = 1.5
    tc = node(nt, 'ShaderNodeTexCoord', (-900, -300))
    mp = node(nt, 'ShaderNodeMapping', (-700, -300))
    mp.inputs['Scale'].default_value = (30, 12, 30)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    vo = node(nt, 'ShaderNodeTexVoronoi', (-500, -300), feature='SMOOTH_F1')
    nt.links.new(mp.outputs['Vector'], vo.inputs['Vector'])
    ramp = node(nt, 'ShaderNodeValToRGB', (-300, -300))
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[1].position = 0.35
    nt.links.new(vo.outputs['Distance'], ramp.inputs['Fac'])
    bump = node(nt, 'ShaderNodeBump', (-100, -300))
    bump.inputs['Strength'].default_value = 0.06
    nt.links.new(ramp.outputs['Color'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    shadow_transparent(glass)
    box('Vitre', (0, (y0 + y1) / 2, z - 0.035), (x1 - x0, y1 - y0, 0.006), glass, bevel=0)
    # nuit derrière la vitre : ciel couvert et lueur lointaine
    sky, nt = new_mat('Nuit')
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED':
            nt.nodes.remove(n)
    tc = node(nt, 'ShaderNodeTexCoord', (-900, 0))
    sep = node(nt, 'ShaderNodeSeparateXYZ', (-700, 0))
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    ramp = node(nt, 'ShaderNodeValToRGB', (-500, 0))
    ramp.color_ramp.elements[0].color = (*hexc('#05080c'), 1)
    ramp.color_ramp.elements[1].color = (*hexc('#1d2a3c'), 1)
    nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    noi = node(nt, 'ShaderNodeTexNoise', (-500, -250))
    noi.inputs['Scale'].default_value = 3.0
    nt.links.new(tc.outputs['Generated'], noi.inputs['Vector'])
    col = mix_rgb(nt, ramp.outputs['Color'], noi.outputs['Fac'], blend='MULTIPLY', fac=0.5, loc=(-250, 0))
    em = node(nt, 'ShaderNodeEmission', (-50, 0))
    em.inputs['Strength'].default_value = 1.6
    nt.links.new(col, em.inputs['Color'])
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    box('Ciel', (0, 1.9, -4.6), (9, 6, 0.02), sky, bevel=0)


def curtains():
    for x, flip in ((-1.25, False), (1.25, True)):
        bm = bmesh.new()
        nu, nv = 90, 30
        wdt, hgt = 0.78, 3.15
        grid = []
        for j in range(nv + 1):
            v = j / nv
            row = []
            for i in range(nu + 1):
                u = i / nu
                lx = (u - 0.5) * wdt
                gather = 1.0 - 0.25 * v  # plis plus profonds en haut, s'ouvrent vers le bas
                depth = (math.sin(u * 2 * math.pi * 9) * 0.045 + math.sin(u * 2 * math.pi * 3.7 + 1) * 0.015) * gather
                y = 0.02 + v * hgt
                pool = max(0.0, 0.08 - y) * 0.6
                row.append(bm.verts.new(P(x + lx * (1 + pool), y, -2.83 + depth + pool)))
            grid.append(row)
        for j in range(nv):
            for i in range(nu):
                bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
        box_uv(bm, 1.0)
        ob = finish('Rideau', bm, M['velvet'])
        sol = ob.modifiers.new('Epaisseur', 'SOLIDIFY')
        sol.thickness = 0.012
    box('Tringle', (0, 3.23, -2.8), (3.5, 0.03, 0.03), M['brass'], bevel=0.01)
    for x in (-1.78, 1.78):
        lathe('Embout', [(0.0, -0.04), (0.03, -0.03), (0.04, 0.0), (0.03, 0.03), (0.0, 0.05)], (x, 3.23, -2.8), M['brass'], segs=24)


def door():
    z = HD
    leaf = box('Porte', (-2.3, 1.15, z), (0.98, 2.3, 0.05), M['walnut'], bevel=0.006)
    for x in (-2.53, -2.07):
        for y0, y1 in ((0.15, 0.95), (1.15, 2.15)):
            box('Panneau_porte', (x, (y0 + y1) / 2, z - 0.03), (0.34, y1 - y0, 0.02), M['walnut'], bevel=0.014)
    lathe('Poignee', [(0.0, 0), (0.025, 0.005), (0.032, 0.03), (0.02, 0.05), (0.0, 0.055)], (-1.92, 1.02, z - 0.03), M['brass'], segs=24)
    # chambranle
    for i, (c, s) in enumerate([
        ((-2.86, 1.2, z - 0.07), (0.12, 2.4, 0.03)),
        ((-1.74, 1.2, z - 0.07), (0.12, 2.4, 0.03)),
        ((-2.3, 2.38, z - 0.075), (1.36, 0.16, 0.04)),
    ]):
        box(f'Chambranle_porte_{i}', c, s, M['trim'], bevel=0.008)


def fireplace():
    bx0, bx1 = -IN_X, -3.12
    bxc, bd, cz = (bx0 + bx1) / 2, bx1 - bx0, -0.4
    # conduit au-dessus de la tablette et joues ; le modèle s'encastre dedans
    for i, (c, sz) in enumerate([
        ((bxc, H / 2, cz - 0.725), (bd, H, 0.55)),
        ((bxc, H / 2, cz + 0.725), (bd, H, 0.55)),
        ((bxc, (1.24 + H) / 2, cz), (bd, H - 1.24, 0.9)),
    ]):
        box(f'Cheminee_{i}', c, sz, M['plaster'], bevel=0)
    # chenets, bûches consumées, braises
    for s in (-0.25, 0.25):
        box('Chenet', (-3.25, 0.09, cz + s), (0.3, 0.025, 0.025), M['iron'], bevel=0.005)
    ember = plain('Braise', '#0a0503', rough=0.9, emit='#ff4a10', strength=12.0)
    char = plain('Charbon', '#0d0b0a', rough=1.0)
    for i in range(3):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.5, location=P(-3.27 + i * 0.03, 0.14 + (i == 2) * 0.06, cz + (i - 1) * 0.09))
        lg = bpy.context.object
        lg.rotation_euler = (math.radians(90), 0, math.radians(8 * (i - 1)))
        lg.data.materials.append(char)
    ash = plain('Cendre', '#3a3633', rough=1.0)
    box('Lit_de_cendres', (-3.2, 0.035, cz), (0.32, 0.02, 0.7), ash, bevel=0.008)
    for i in range(70):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.006 + random.random() * 0.012,
                                              location=P(-3.32 + random.random() * 0.24, 0.05 + random.random() * 0.03, cz - 0.28 + random.random() * 0.56))
        e = bpy.context.object
        e.scale = (1 + random.random() * 0.8, 1 + random.random() * 0.6, 0.4 + random.random() * 0.3)
        e.rotation_euler = (random.random(), random.random(), random.random() * 6)
        e.data.materials.append(ember if random.random() < 0.35 else char)
    # garde-feu
    box('Garde_feu', (-2.55, 0.16, cz), (0.025, 0.025, 1.3), M['brass'], bevel=0.008)
    for z in (-0.64, 0.64):
        lathe('Pied_garde_feu', [(0.0, 0), (0.022, 0), (0.018, 0.14), (0.0, 0.14)], (-2.55, 0.02, cz + z), M['brass'], segs=20)


def desk():
    Y = DESK_TOP + 0.0015
    # papiers, encrier, plume, registre fermé
    for i, (x, z, r) in enumerate([(0.18, -1.52, 0.4), (0.25, -1.58, -0.25), (-0.42, -1.48, 0.15)]):
        ob = box(f'Feuille_{i}', (x, Y + i * 0.0006, z), (0.21, 0.0005, 0.29), M['paper'], bevel=0)
        ob.rotation_euler.z = r
        ob.location = P(x, Y + i * 0.0006, z)
        ob.data.transform(Matrix.Translation(-ob.location))
    lathe('Encrier', [(0.0, 0), (0.035, 0), (0.036, 0.04), (0.03, 0.05), (0.012, 0.055), (0.012, 0.065), (0.0, 0.065)], (-0.3, DESK_TOP, -1.92), M['ink'], segs=32)
    for ob in (box('Registre', (-0.08, DESK_TOP + 0.02, -1.68), (0.26, 0.04, 0.36), plain('Reliure', '#3a1a12', rough=0.7), bevel=0.006),
               box('Registre_pages', (-0.075, DESK_TOP + 0.02, -1.68), (0.25, 0.034, 0.352), M['paper'], bevel=0.002)):
        ob['tlc_ex'] = 'e05_ledger'
    # carafe en verre (profil tourné)
    glass = plain('Verre', '#ffffff', rough=0.02, transmission=1.0, ior=1.5)
    shadow_transparent(glass)
    lathe('Carafe', [(0.0, 0), (0.06, 0.0), (0.075, 0.04), (0.07, 0.1), (0.04, 0.16), (0.022, 0.2), (0.024, 0.24), (0.0, 0.24)], (0.62, DESK_TOP, -1.86), glass, segs=48)['tlc_ex'] = 'd_carafe'


def bookcase():
    Wb, Hb, Db = 2.2, 2.6, 0.36
    cx, cz = HW - 0.06 - Db / 2, 1.25
    # repère local : x le long du mur (vers -z monde), profondeur vers -x monde
    def L(lx, y, lz):
        return (cx - lz, y, cz + lx)

    def lbox(name, c, s, mat, bevel=0.004):
        return box(name, L(*c), (s[2], s[1], s[0]), mat, bevel)

    lbox('Biblio_fond', (0, Hb / 2, -Db / 2 + 0.01), (Wb, Hb, 0.02), M['walnut'], 0)
    for x in (-Wb / 2, Wb / 2):
        lbox('Biblio_cote', (x, Hb / 2, 0), (0.05, Hb, Db), M['walnut'])
    shelves = [0.12, 0.62, 1.1, 1.58, 2.06]
    for y in shelves + [Hb - 0.02]:
        lbox('Etagere', (0, y, 0), (Wb, 0.035, Db), M['walnut'])
    lbox('Biblio_corniche', (0, Hb + 0.04, 0.02), (Wb + 0.12, 0.08, Db + 0.06), M['walnut'], 0.01)
    # livres : un seul maillage, couleur par livre (attribut), UV verticale par livre (filets dorés)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.verify()
    colr = bm.loops.layers.float_color.new('Col')
    palette = ['#4a1a14', '#1f2a22', '#2b2318', '#5a4426', '#1a1f2e', '#3a1c10', '#24301f', '#5e1f1a', '#2a1a2a']
    rnd = random.Random(3)
    for y in shelves:
        x = -Wb / 2 + 0.06
        while x < Wb / 2 - 0.08:
            if rnd.random() < 0.06:
                x += 0.12 + rnd.random() * 0.2
                continue
            w = 0.028 + rnd.random() * 0.04
            h = 0.24 + rnd.random() * 0.16
            d = 0.2 + rnd.random() * 0.06
            tilt = 0.22 if rnd.random() < 0.04 else 0.0
            c = (*hexc(palette[rnd.randrange(len(palette))]), 1.0)
            res = bmesh.ops.create_cube(bm, size=1.0)
            vs = res['verts']
            for v in vs:
                lx, ly, lz = v.co.x * w, v.co.z * h + h / 2, v.co.y * d
                # bascule éventuelle autour de l'arête basse
                if tilt:
                    lx, ly = lx * math.cos(tilt) - ly * math.sin(tilt), lx * math.sin(tilt) + ly * math.cos(tilt)
                wx, wy, wz = L(x + w / 2 + lx, y + 0.0175 + ly, Db / 2 - d / 2 - 0.02 + lz)
                v.co = P(wx, wy, wz)
            faces = {f for v in vs for f in v.link_faces}
            for f in faces:
                for l in f.loops:
                    l[colr] = c
                    zz = l.vert.co.z
                    l[uv].uv = (0.5, (zz - (y + 0.0175)) / h)
            x += w + 0.002
    books = finish('Livres', bm, None, bevel=0.003)
    m, nt = new_mat('Reliures')
    b = principled(nt)
    at = node(nt, 'ShaderNodeAttribute', (-800, 200), attribute_name='Col')
    tc = node(nt, 'ShaderNodeTexCoord', (-1000, -100))
    sep = node(nt, 'ShaderNodeSeparateXYZ', (-800, -100))
    nt.links.new(tc.outputs['UV'], sep.inputs[0])
    band = node(nt, 'ShaderNodeValToRGB', (-600, -100))
    cr = band.color_ramp
    cr.interpolation = 'CONSTANT'
    cr.elements[0].color = (0, 0, 0, 1)
    for pos, v in ((0.1, 1), (0.12, 0), (0.15, 1), (0.165, 0), (0.82, 1), (0.84, 0), (0.88, 1), (0.89, 0)):
        e = cr.elements.new(pos)
        e.color = (v, v, v, 1)
    nt.links.new(sep.outputs['Y'], band.inputs['Fac'])
    col = mix_rgb(nt, at.outputs['Color'], hexc('#b8924a'), blend='MIX', loc=(-300, 200))
    mixn = col.node
    nt.links.new(band.outputs['Color'], mixn.inputs[0])
    nt.links.new(col, b.inputs['Base Color'])
    met = node(nt, 'ShaderNodeMapRange', (-300, -100))
    met.inputs['To Min'].default_value = 0.0
    met.inputs['To Max'].default_value = 1.0
    nt.links.new(band.outputs['Color'], met.inputs['Value'])
    nt.links.new(met.outputs[0], b.inputs['Metallic'])
    rough = node(nt, 'ShaderNodeMapRange', (-300, -300))
    rough.inputs['To Min'].default_value = 0.6
    rough.inputs['To Max'].default_value = 0.3
    nt.links.new(band.outputs['Color'], rough.inputs['Value'])
    nt.links.new(rough.outputs[0], b.inputs['Roughness'])
    books.data.materials.append(m)


def rug():
    """Tapis persan procédural : bordures, champ rouge, médaillon central, usure."""
    m, nt = new_mat('Tapis')
    b = principled(nt)
    b.inputs['Roughness'].default_value = 1.0
    b.inputs['Sheen Weight'].default_value = 0.2
    b.inputs['Sheen Tint'].default_value = (0.8, 0.5, 0.4, 1)
    tc = node(nt, 'ShaderNodeTexCoord', (-1600, 0))
    sep = node(nt, 'ShaderNodeSeparateXYZ', (-1400, 0))
    nt.links.new(tc.outputs['UV'], sep.inputs[0])
    RW, RD = 3.4, 2.34

    def math_n(op, a, bb=None, loc=(0, 0)):
        n = node(nt, 'ShaderNodeMath', loc, operation=op)
        for i, s in enumerate((a, bb)):
            if s is None:
                continue
            if isinstance(s, (int, float)):
                n.inputs[i].default_value = s
            else:
                nt.links.new(s, n.inputs[i])
        return n.outputs[0]

    # distance au bord (m)
    def edge(axis_out, size):
        a = math_n('MULTIPLY', axis_out, size)
        bb = math_n('MULTIPLY', math_n('SUBTRACT', 1.0, axis_out), size)
        return math_n('MINIMUM', a, bb)
    e = math_n('MINIMUM', edge(sep.outputs['X'], RW), edge(sep.outputs['Y'], RD))
    borders = node(nt, 'ShaderNodeValToRGB', (-600, 300))
    cr = borders.color_ramp
    cr.interpolation = 'CONSTANT'
    stops = [(0.0, '#1a1c2e'), (0.05, '#c9b48a'), (0.065, '#2a2440'), (0.1, '#7a1e18'), (0.27, '#c9b48a'), (0.285, '#1a1c2e'), (0.31, '#6a1812')]
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*hexc(stops[0][1]), 1)
    cr.elements[1].position, cr.elements[1].color = stops[1][0], (*hexc(stops[1][1]), 1)
    for p, c in stops[2:]:
        el = cr.elements.new(p)
        el.color = (*hexc(c), 1)
    nt.links.new(e, borders.inputs['Fac'])
    # médaillon losange
    du = math_n('ABSOLUTE', math_n('MULTIPLY', math_n('SUBTRACT', sep.outputs['X'], 0.5), RW))
    dv = math_n('ABSOLUTE', math_n('MULTIPLY', math_n('SUBTRACT', sep.outputs['Y'], 0.5), RD))
    dia = math_n('ADD', math_n('MULTIPLY', du, 0.75), dv)
    med = node(nt, 'ShaderNodeValToRGB', (-600, -100))
    cm = med.color_ramp
    cm.interpolation = 'CONSTANT'
    mstops = [(0.0, '#c9b48a'), (0.08, '#1a1c2e'), (0.2, '#8a2a1e'), (0.36, '#c9b48a'), (0.38, '#1a1c2e'), (0.42, '#000000')]
    cm.elements[0].position, cm.elements[0].color = mstops[0][0], (*hexc(mstops[0][1]), 1)
    cm.elements[1].position, cm.elements[1].color = mstops[1][0], (*hexc(mstops[1][1]), 1)
    for p, c in mstops[2:]:
        el = cm.elements.new(p)
        el.color = (*hexc(c), 1)
    nt.links.new(dia, med.inputs['Fac'])
    inside = math_n('LESS_THAN', dia, 0.42)
    in_field = math_n('GREATER_THAN', e, 0.31)
    use_med = math_n('MULTIPLY', inside, in_field)
    base = mix_rgb(nt, borders.outputs['Color'], med.outputs['Color'], blend='MIX', loc=(-300, 100))
    nt.links.new(use_med, base.node.inputs[0])
    # motif du champ et usure
    wave = node(nt, 'ShaderNodeTexWave', (-600, -400), wave_type='RINGS')
    wave.inputs['Scale'].default_value = 14
    wave.inputs['Distortion'].default_value = 4
    nt.links.new(tc.outputs['UV'], wave.inputs['Vector'])
    patt = mix_rgb(nt, base, wave.outputs['Fac'], blend='MULTIPLY', fac=0.25, loc=(-100, 100))
    noi = node(nt, 'ShaderNodeTexNoise', (-600, -650))
    noi.inputs['Scale'].default_value = 6
    worn = mix_rgb(nt, patt, noi.outputs['Fac'], blend='OVERLAY', fac=0.25, loc=(100, 100))
    nt.links.new(worn, b.inputs['Base Color'])
    fib = node(nt, 'ShaderNodeTexNoise', (-300, -800))
    fib.inputs['Scale'].default_value = 900
    bump = node(nt, 'ShaderNodeBump', (0, -500))
    bump.inputs['Strength'].default_value = 0.25
    nt.links.new(fib.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co = P(-0.25 + v.co.x * RW, 0.008, -0.85 - v.co.y * RD)
    uvl = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for l in f.loops:
            co = l.vert.co
            l[uvl].uv = ((co.x + 0.25) / RW + 0.5, (co.y - 0.85) / RD + 0.5)
    ob = finish('Tapis', bm, m)
    sol = ob.modifiers.new('Epaisseur', 'SOLIDIFY')
    sol.thickness = 0.008


# ————————————————————————————————————————— objets Poly Haven (mêmes règles que <Prop>)

def prop(pid, height, pos=(0, 0, 0), rot=0.0, tilt=0.0, fit='height', path=None, keep=None, drop=('UCX', 'Icosphere'), mats=None, group='small', ex=None):
    path = path or os.path.join(PROPS, pid, f'{pid}.gltf')
    if not os.path.exists(path):
        print('PROP MANQUANT', pid)
        return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    for o in list(new):
        if o.type == 'MESH' and (o.name.startswith(drop) or (keep and not o.name.startswith(tuple(keep)))):
            new.remove(o)
            bpy.data.objects.remove(o)
    for o in new:
        if mats and o.type == 'MESH':
            for slot in o.material_slots:
                for key, m in mats.items():
                    if slot.material and key in slot.material.name:
                        slot.material = m
    outer = bpy.data.objects.new(f'{pid}', None)
    mid = bpy.data.objects.new(f'{pid}_echelle', None)
    tl = bpy.data.objects.new(f'{pid}_bascule', None)
    for o in (outer, mid, tl):
        coll.objects.link(o)
    mid.parent = outer
    tl.parent = mid
    tl.rotation_euler.x = tilt
    for o in new:
        if o.parent is None:
            o.parent = tl
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == 'MESH' for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    size = mx - mn
    s = height / (max(size) if fit == 'max' else size.z)
    ctr = (mn + mx) / 2
    mid.scale = (s, s, s)
    mid.location = (-ctr.x * s, -ctr.y * s, -mn.z * s)
    outer.location = P(*pos)
    outer.rotation_euler.z = rot
    outer['tlc_group'] = group
    if ex:
        outer['tlc_ex'] = ex
    for o in new:
        if o.type == 'MESH':
            for slot in o.material_slots:
                mt = slot.material
                if mt and mt.use_nodes:
                    bs = next((n for n in mt.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
                    see_through = bs and (bs.inputs['Transmission Weight'].default_value > 0.5 or bs.inputs['Alpha'].links
                                          or any(k in mt.name.lower() for k in ('glass', 'flame', 'lens')))
                    if see_through and not mt.get('_shadow'):
                        shadow_transparent(mt)
                        mt['_shadow'] = True
    return outer


def sk(name):
    return os.path.join(SKETCHFAB, name)


MANTEL = (-2.96, 1.239)  # bord avant (x) et dessus (y) de la tablette de la cheminée Sketchfab


def sketchfab_furniture():
    """Meubles Sketchfab (CC-BY, crédits dans docs/ASSET_LICENSES.md). Face avant : -Y Blender, sauf la cheminée (-X)."""
    pi = math.pi
    global DESK_TOP
    prop('antique_desk', DESK_TOP, (0, 0, -1.7), pi, path=sk('antique_desk.glb'), group='furniture')
    prop('captains_chair', 0.89, (0.3, 0, -2.42), 0.45, path=sk('antique_captains_chair__free_3d_model.glb'), group='furniture')
    prop('chesterfield', 0.78, (-2.2, 0, 0.85), math.atan2(-0.6, -0.8), path=sk('armchair_chesterfield.glb'), group='furniture')
    prop('bookcase', 2.7, (IN_X - 0.21, 0, 1.25), -pi / 2, path=sk('antique_wooden_bookcase_-_game_model.glb'), group='furniture')
    prop('carpet', 3.4, (-0.25, 0, -0.85), 0.0, fit='max', path=sk('fine_persian_heriz_carpet.glb'), group='furniture')
    prop('curtains', 3.25, (0, 0.0, -2.82), 0.0, path=sk('curtains.glb'), drop=('UCX', 'Icosphere', 'Object_18'), group='furniture')
    stone = M['marble']
    prop('fireplace', 1.239, (-3.175, 0, -0.4), pi, path=sk('fancy_victorian_fireplace.glb'), mats={'Stone': stone, 'Wood': stone}, group='room')
    hs = sorted(surface_height(x, z, DESK_TOP) for x, z in ((-0.3, -1.7), (0.2, -1.6), (0.0, -1.8), (0.4, -1.75)))
    DESK_TOP = hs[len(hs) // 2]
    print('PLATEAU', round(DESK_TOP, 4))
    prop('book_stack', 0.13, (0.55, DESK_TOP, -1.55), 0.3, path=sk('antique_book_set.glb'), keep=['Object_36'])


def surface_height(x, z, default):
    """Hauteur (three) de la première surface sous le point (x, z), en partant de 2 m."""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    hit, loc, *_ = scene.ray_cast(dg, P(x, 2.0, z), Vector((0, 0, -1)))
    return loc.z if hit else default


def props():
    pi = math.pi
    T_ = DESK_TOP
    prop('vintage_oil_lamp', 0.5, (-0.56, T_, -1.86))
    prop('side_table_01', 0.62, (-2.75, 0, 1.75), group='furniture')
    prop('book_encyclopedia_set_01', 0.3, (3.24, 2.7, 1.9), -pi / 2)
    prop('ornate_mirror_01', 1.05, (-3.08, 1.42, -0.4), pi / 2)
    prop('brass_candleholders', 0.3, (MANTEL[0] - 0.05, MANTEL[1], -1.12), pi / 2)
    prop('vintage_grandfather_clock_01', 2.2, (2.95, 0, -2.6), -pi / 4, group='furniture')
    prop('vintage_cabinet_01', 1.9, (3.2, 0, -1.0), -pi / 2, group='furniture')
    prop('fancy_picture_frame_01', 0.85, (-2.2, 1.4, -2.93))
    prop('fancy_picture_frame_01', 0.7, (2.0, 1.5, -2.93))
    prop('Chandelier_01', 0.85, (0, 2.55, -0.4))
    # objets examinables du prototype (studySlice.ts)
    prop('round_spectacles', 0.13, (0.22, T_, -1.9), 0.4, fit='max', ex='d_spectacles')
    prop('magnifying_glass_01', 0.22, (0.12, T_, -1.42), 0.8, tilt=-pi / 2, fit='max', ex='d_magnifier')
    prop('wooden_candlestick', 0.26, (-0.74, T_, -1.5), ex='d_candlestick')
    prop('mantel_clock_01', 0.32, (MANTEL[0] - 0.06, MANTEL[1], -0.4), pi / 2, ex='d_mantel_clock')
    prop('carved_wooden_elephant', 0.18, (MANTEL[0] - 0.06, MANTEL[1], 0.22), pi / 2 + 0.3, ex='d_elephant')
    prop('cigarette_case', 0.11, (MANTEL[0] - 0.03, MANTEL[1], -0.8), 1.2, fit='max', ex='d_cigarette_case')
    prop('chess_set', 0.4, (-2.75, 0.62, 1.75), 0.3, fit='max', ex='d_chess')
    prop('marble_bust_01', 0.42, (3.22, 1.9, -1.0), -pi / 2, ex='d_bust')
    prop('horse_statue_01', 0.32, (3.22, 2.7, 0.6), -pi / 2, ex='d_horse')
    prop('antique_ceramic_vase_01', 0.55, (2.25, 0, -2.6), ex='d_vase')


# ————————————————————————————————————————— lumière

def light(name, kind, pos, color, power, radius=0.05, rot=None, size=None):
    ld = bpy.data.lights.new(name, kind)
    ld.color = color
    ld.energy = power
    if kind in ('POINT', 'SPOT'):
        ld.shadow_soft_size = radius
    if kind == 'AREA' and size:
        ld.shape = 'RECTANGLE'
        ld.size, ld.size_y = size
    ob = bpy.data.objects.new(name, ld)
    coll.objects.link(ob)
    ob.location = pos
    if rot is not None:
        ob.rotation_euler = rot
    return ob


def lighting():
    # lune derrière les nuages, par la fenêtre
    d = Vector(P(-0.3, 0, -0.6)) - Vector(P(1.6, 5.2, -8))
    sun = light('Lune', 'SUN', P(1.6, 5.2, -8), (0.62, 0.74, 1.0), 1.6)
    sun.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sun.data.angle = math.radians(3)
    # lampe à pétrole : flamme + lumière
    # la flamme du modèle est à y ≈ 1,08 (le corps de la lampe, opaque, s'arrête à 1,07)
    light('Lampe', 'POINT', P(-0.56, 1.13, -1.86), (1.0, 0.7, 0.45), 70, radius=0.01)
    # feu couvert : rayonnement du foyer
    light('Feu', 'AREA', P(-3.05, 0.3, -0.4), (1.0, 0.45, 0.18), 45, rot=(0, math.radians(-90), 0), size=(0.3, 0.7))
    light('Braises', 'POINT', P(-3.25, 0.12, -0.4), (1.0, 0.35, 0.1), 15, radius=0.15)
    # monde : nuit très sombre
    world = bpy.data.worlds.new('Nuit')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.004, 0.006, 0.01, 1)
    bg.inputs['Strength'].default_value = 1.0
    scene.world = world


VIEWPOINTS = {
    'seuil': ((-2.35, 1.68, 2.55), (0.1, 0.95, -1.5), 48),
    'bureau': ((0.95, 1.48, -0.35), (0.1, 0.78, -1.75), 42),
    'cheminee': ((-1.45, 1.32, 0.75), (-3.3, 0.75, -0.4), 44),
    'fauteuil': ((-1.35, 1.5, -0.3), (-2.5, 0.55, 1.35), 48),
    'bibliotheque': ((0.75, 1.55, 0.55), (3.2, 1.45, -0.2), 52),
    'fenetre': ((0.35, 1.6, -0.75), (0, 1.85, -3), 50),
    'tapis': ((0.16, 0.3, -0.82), (-0.08, 0.0, -1.62), 40),
}


def camera(view):
    pos, tgt, fov = VIEWPOINTS[view]
    cd = bpy.data.cameras.get('Camera') or bpy.data.cameras.new('Camera')
    cd.sensor_fit = 'VERTICAL'
    cd.angle_y = math.radians(fov)
    cd.clip_start = 0.02
    cam = bpy.data.objects.get('Camera') or bpy.data.objects.new('Camera', cd)
    if cam.name not in coll.objects:
        coll.objects.link(cam)
    cam.location = P(*pos)
    cam.rotation_euler = (Vector(P(*tgt)) - Vector(P(*pos))).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam


def render_setup():
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for t in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = t
            prefs.get_devices()
            if any(d.type == t for d in prefs.devices):
                for d in prefs.devices:
                    d.use = True
                scene.cycles.device = 'GPU'
                break
        except Exception:
            pass
    c = scene.cycles
    c.samples = SAMPLES
    c.use_denoising = True
    c.max_bounces = 10
    c.diffuse_bounces = 5
    c.glossy_bounces = 5
    c.transmission_bounces = 10
    c.sample_clamp_indirect = 8.0
    c.blur_glossy = 1.0
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    vs = scene.view_settings
    vs.view_transform = 'AgX'
    for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
        try:
            vs.look = look
            break
        except TypeError:
            pass
    vs.exposure = 1.1


# ————————————————————————————————————————— construction

walls()
wainscot()
cornice()
window()
door()
fireplace()
sketchfab_furniture()
desk()
props()
lighting()
render_setup()
camera(next((v for v in VIEWS if v in VIEWPOINTS), 'seuil'))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'whitmore_study.blend'))
print('SCENE OK', len(bpy.data.objects), 'objets')

for v in VIEWS:
    if v in VIEWPOINTS:
        camera(v)
        scene.render.filepath = os.path.join(OUT, f'blender-{v}.png')
        bpy.ops.render.render(write_still=True)
        print('RENDU', v)
