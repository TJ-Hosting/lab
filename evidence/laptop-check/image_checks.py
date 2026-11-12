"""lab-02 P2 output checks for the built images. Run from the repo root:
   <venv python> -I evidence/laptop-check/image_checks.py
Writes contact sheets to evidence/laptop-check/images/ and prints the numbers quoted in CHECK.md.
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'evidence', 'laptop-check', 'images')
os.makedirs(OUT, exist_ok=True)
img = lambda p: Image.open(os.path.join(ROOT, p))

# 1. Objects on black: composite over white, mid grey and the home backdrop; measure haze and fringe.
objs = ['glass-cube', 'torus', 'spheres', 'flask', 'hex-prism', 'glass-bee']
grounds = [('white', Image.new('RGB', (640, 640), (255, 255, 255))), ('grey', Image.new('RGB', (640, 640), (128, 128, 128))),
	('aurora', img('img/bg/aurora-1280.webp').convert('RGB').crop((640, 40, 1280, 680)))]
sheet = Image.new('RGB', (len(grounds) * 330 + 10, len(objs) * 330 + 10), (30, 30, 34))
print('objects (640 px webp): outer-ring max alpha | haze px (alpha 1-40, outside the object) | dark-fringe px (alpha>=64, luma<24)')
for r, name in enumerate(objs):
	o = img(f'img/obj/{name}-640.webp').convert('RGBA')
	w, h = o.size
	a = o.getchannel('A')
	ring = max(max(a.crop(b).getdata()) for b in ((0, 0, w, 8), (0, h - 8, w, h), (0, 0, 8, h), (w - 8, 0, w, h)))
	px = o.load()
	# the object's core: alpha >= 128; "outside" = farther than 6 px from it (checked on a 1/4 grid for speed)
	core = a.point(lambda v: 255 if v >= 128 else 0)
	near = core.resize((w // 4, h // 4)).resize((w, h))
	haze = fringe = 0
	nl = near.load()
	for y in range(0, h, 2):
		for x in range(0, w, 2):
			R, G, B, A = px[x, y]
			if 1 <= A <= 40 and nl[x, y] == 0:
				haze += 1
			if A >= 64 and (0.2126 * R + 0.7152 * G + 0.0722 * B) < 24:
				fringe += 1
	print(f'  {name:11s} ring {ring:3d} | haze {haze:6d} | fringe {fringe:5d}')
	for c, (gname, g) in enumerate(grounds):
		comp = g.copy()
		comp.paste(o, (0, 0), o)
		sheet.paste(comp.resize((320, 320)), (10 + c * 330, 10 + r * 330))
sheet.save(os.path.join(OUT, 'objects-keyed.jpg'), quality=82)

# 2. Sprite sheets: every cell's edge must be transparent (nothing clipped), and no grid lines.
print('sprites: per atlas, max alpha on the 2-px edge of any cell | cells with content (max alpha > 200)')
spr = Image.new('RGB', (2 * 532 + 10, 532 + 10), (30, 30, 34))
for i, name in enumerate(['orbs', 'sparkles']):
	at = img(f'img/sprites/{name}.webp').convert('RGBA')
	cell = at.width // 4
	edge = 0
	full = 0
	for cy in range(4):
		for cx in range(4):
			c = at.crop((cx * cell, cy * cell, (cx + 1) * cell, (cy + 1) * cell)).getchannel('A')
			e = max(max(c.crop(b).getdata()) for b in ((0, 0, cell, 2), (0, cell - 2, cell, cell), (0, 0, 2, cell), (cell - 2, 0, cell, cell)))
			edge = max(edge, e)
			full += max(c.getdata()) > 200
	print(f'  {name:9s} edge max alpha {edge:3d} | cells with content {full}/16')
	bg = Image.new('RGB', at.size, (60, 60, 66))
	bg.paste(at, (0, 0), at)
	d = ImageDraw.Draw(bg)
	spr.paste(bg.resize((512, 512)), (10 + i * 532, 10))
spr.save(os.path.join(OUT, 'sprites-on-grey.jpg'), quality=85)

# 3. Holo-foil: 2x2 tile, and the step across the wrap seam vs inside the tile.
t = img('img/tex/holo-foil-512.webp').convert('RGB')
tile = Image.new('RGB', (t.width * 2, t.height * 2))
for y in range(2):
	for x in range(2):
		tile.paste(t, (x * t.width, y * t.height))
tile.save(os.path.join(OUT, 'holo-foil-2x2.jpg'), quality=88)
p = t.load()
diff = lambda a, b: sum(abs(a[k] - b[k]) for k in range(3)) / 3
seam = sum(diff(p[t.width - 1, y], p[0, y]) for y in range(t.height)) / t.height
seam_v = sum(diff(p[x, t.height - 1], p[x, 0]) for x in range(t.width)) / t.width
inside = sum(diff(p[255, y], p[256, y]) for y in range(t.height)) / t.height
print(f'holo-foil 512: mean step across the wrap seam {seam:.1f} (horizontal), {seam_v:.1f} (vertical); between two inner columns {inside:.1f}')
