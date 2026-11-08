"""Gera o globo do topo: assets/img/globo.svg (continentes em pontos) e assets/img/rotas.svg.txt (rotas, para colar no index.html).
Mapa: world-atlas 2 (land-110m.json, Natural Earth, domínio público). Uso: python3 ferramentas/gerar-globo.py"""
import json, math, pathlib

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
topo = json.loads((AQUI / 'land-110m.json').read_text())
sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']

def arco(i):
    inv = i < 0; a = topo['arcs'][~i if inv else i]; x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    return pts[::-1] if inv else pts

poligonos = []
for g in topo['objects']['land']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    for p in polys:
        aneis = []
        for anel in p:
            pts = []
            for i in anel: pts += arco(i)
            aneis.append(pts)
        poligonos.append(aneis)

def dentro(lon, lat, anel):
    c = False; n = len(anel)
    for k in range(n):
        x1, y1 = anel[k]; x2, y2 = anel[k - 1]
        if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1: c = not c
    return c

def terra(lon, lat):
    for aneis in poligonos:
        if dentro(lon, lat, aneis[0]) and not any(dentro(lon, lat, b) for b in aneis[1:]): return True
    return False

# projeção ortográfica
L0, F0 = math.radians(-32), math.radians(12)
R, C = 250, 260   # raio e centro (viewBox 520 x 520)
def proj(lon, lat, alt=1.0):
    l, f = math.radians(lon), math.radians(lat)
    cosc = math.sin(F0) * math.sin(f) + math.cos(F0) * math.cos(f) * math.cos(l - L0)
    x = math.cos(f) * math.sin(l - L0); y = math.cos(F0) * math.sin(f) - math.sin(F0) * math.cos(f) * math.cos(l - L0)
    return C + R * alt * x, C - R * alt * y, cosc

pontos = []
passo = 2.2
lat = -88.0
while lat <= 88:
    dl = passo / max(math.cos(math.radians(lat)), 0.15)
    lon = -180.0
    while lon < 180:
        x, y, cosc = proj(lon, lat)
        if cosc > 0.08 and terra(lon, lat):
            r = 1.05 + 0.75 * cosc      # menor perto da borda, dá volume
            pontos.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}"/>')
        lon += dl
    lat += passo

svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">'
       '<defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#0d6a98" stop-opacity=".18"/><stop offset="1" stop-color="#085D87" stop-opacity=".02"/></radialGradient></defs>'
       f'<circle cx="{C}" cy="{C}" r="{R}" fill="url(#g)" stroke="#085D87" stroke-opacity=".22"/>'
       f'<g fill="#085D87" fill-opacity=".55">{"".join(pontos)}</g></svg>')
(RAIZ / 'assets/img/globo.svg').write_text(svg)

# rotas a partir de Vitória (grande círculo, levantado do chão)
VIX = (-40.29, -20.32)
DESTINOS = [('Miami', -80.19, 25.76), ('Londres', -0.13, 51.51), ('Joanesburgo', 28.05, -26.2), ('Santiago', -70.67, -33.45)]
def xyz(lon, lat):
    l, f = math.radians(lon), math.radians(lat)
    return (math.cos(f) * math.cos(l), math.cos(f) * math.sin(l), math.sin(f))
def ll(v):
    x, y, z = v; return math.degrees(math.atan2(y, x)), math.degrees(math.asin(max(-1, min(1, z))))
def caminho(a, b, alto=0.22, n=48):
    A, B = xyz(*a), xyz(*b)
    w = math.acos(max(-1, min(1, sum(p * q for p, q in zip(A, B)))))
    out = []
    for k in range(n + 1):
        t = k / n
        s1, s2 = math.sin((1 - t) * w) / math.sin(w), math.sin(t * w) / math.sin(w)
        v = tuple(s1 * p + s2 * q for p, q in zip(A, B))
        lon, lat = ll(v)
        x, y, _ = proj(lon, lat, 1 + alto * math.sin(math.pi * t) * min(1, w / 1.2))
        out.append(f'{x:.1f},{y:.1f}')
    return 'M' + ' L'.join(out)

vx, vy, _ = proj(*VIX)
partes = []
for i, (nome, lon, lat) in enumerate(DESTINOS):
    x, y, _ = proj(lon, lat)
    partes.append(f'<path class="rota" style="--i:{i}" pathLength="1" d="{caminho(VIX, (lon, lat))}"/>')
    partes.append(f'<g class="destino" style="--i:{i}"><circle cx="{x:.1f}" cy="{y:.1f}" r="3.2"/><text x="{(x - 7) if x > 400 else (x + 7):.1f}" y="{y - 6:.1f}"{' text-anchor="end"' if x > 400 else ''}>{nome}</text></g>')
partes.append(f'<g class="origem"><circle class="halo" cx="{vx:.1f}" cy="{vy:.1f}" r="9"/><circle cx="{vx:.1f}" cy="{vy:.1f}" r="4.2"/><text x="{vx + 9:.1f}" y="{vy + 16:.1f}">Vitória</text></g>')
(AQUI / 'rotas.svg.txt').write_text('\n'.join(partes))
print(len(pontos), 'pontos; globo.svg', len(svg) // 1024, 'KB')
