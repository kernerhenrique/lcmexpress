"""Gera o globo do topo: assets/img/globo.svg (imagem parada, usada sem JavaScript) e assets/js/globo-dados.js (pontos do globo que gira).
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

# pontos de terra do mundo inteiro, para o globo que gira (desenhado no navegador por assets/js/site.js)
todos = []
lat = -88.0
while lat <= 88:
    dl = passo / max(math.cos(math.radians(lat)), 0.15)
    lon = -180.0
    while lon < 180:
        if terra(lon, lat): todos += [round(lon * 10), round(lat * 10)]
        lon += dl
    lat += passo
js = '/* Gerado por ferramentas/gerar-globo.py: pontos de terra (longitude e latitude x 10), Natural Earth 1:110m. */\nwindow.LCM_TERRA=[' + ','.join(map(str, todos)) + '];\n'
(RAIZ / 'assets/js/globo-dados.js').write_text(js)
print(len(pontos), 'pontos no globo.svg (', len(svg) // 1024, 'KB ); globo-dados.js:', len(todos) // 2, 'pontos,', len(js) // 1024, 'KB')
