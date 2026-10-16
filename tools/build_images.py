#!/usr/bin/env python3
"""Convert the pre-generated pack (assets/pack/) into the web images the site ships.

Run from the repo root:  python3 -I tools/build_images.py [photos] [objects] [sprites]

- AVIF + WebP at responsive widths; never wider than the source (no silent upscaling).
- Objects on dark backgrounds get a black-point clamp and a soft radial alpha edge,
  so they float over the glass without a visible box.
- Sprite sheets get their near-black cells clamped to pure black and their cell edges
  faded out, so additive blending ('lighter') adds nothing but light.
- Every output is recorded in img/IMAGES.jsonl with the pack file it came from,
  which is itself a line in assets/pack/LEDGER.jsonl.
"""
import json
import math
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.path.join(ROOT, 'assets', 'pack')
OUT = os.path.join(ROOT, 'img')

# name in img/, pack source, widths, kind, optional crop box (fractions l,t,r,b)
PHOTOS = [
	('bg/aurora', 'lab-bg-aurora.jpg', [640, 960, 1280], 'photo', None),
	('bg/aurora-portrait', 'lab-bg-aurora-portrait.jpg', [360, 720], 'photo', None),
	('bg/aurora-dusk', 'lab-bg-aurora-dusk.jpg', [640, 960, 1280], 'photo', None),
	('bg/bokeh', 'lab-bg-bokeh.jpg', [640, 960, 1280], 'photo', None),
	('bg/prism', 'lab-bg-prism.jpg', [640, 960, 1280], 'photo', None),
	('bg/liquid-chrome', 'lab-bg-liquid-chrome.jpg', [640, 960, 1280], 'photo', None),
	('bg/honeycomb', 'lab-hp-honeycomb.jpg', [640, 960, 1280], 'photo', None),
	('bg/hex-portrait', 'lab-hp-hex-portrait.jpg', [360, 720], 'photo', None),
	('art/hands', 'lab-hum-hands.jpg', [640, 960, 1280], 'photo', None),
	('art/glass-city', 'lab-hum-glass-city-dawn.jpg', [640, 960, 1280], 'photo', None),
	('art/constellation', 'lab-hum-constellation.jpg', [640, 960, 1280], 'photo', None),
	('art/honey-flow', 'lab-hp-honey-flow.jpg', [640, 960, 1280], 'photo', None),
	('art/particles', 'lab-og-particles.jpg', [640, 960, 1280], 'photo', None),
	('art/og-home', 'lab-og-home.jpg', [640, 960, 1280], 'photo', None),
	('art/og-honeypot', 'lab-og-honeypot.jpg', [640, 960, 1280], 'photo', None),
	('tex/holo-foil', 'lab-tex-holo-foil.jpg', [512], 'photo', None),
	# the "frosted" texture came out framed: keep the centre only
	('tex/frosted', 'lab-tex-frosted.jpg', [512], 'photo', (0.2, 0.2, 0.8, 0.8)),
]
OBJECTS = [
	('obj/glass-cube', 'lab-obj-glass-cube.jpg', [320, 640]),
	('obj/torus', 'lab-obj-torus.jpg', [320, 640]),
	('obj/spheres', 'lab-obj-spheres.jpg', [320, 640]),
	('obj/flask', 'lab-obj-flask.jpg', [320, 640]),
	('obj/hex-prism', 'lab-obj-hex-prism.jpg', [320, 640]),
	('obj/glass-bee', 'lab-hp-glass-bee.jpg', [320, 640]),
]
# name, source, grid (cols, rows), cell size out
SPRITES = [
	('sprites/orbs', 'lab-spr-orbs.jpg', (4, 4), 128),
	('sprites/sparkles', 'lab-spr-sparkles.jpg', (4, 4), 128),
	('sprites/streaks', 'lab-spr-streaks.jpg', (3, 3), 128),
]

manifest = []


def ensure_dir(path):
	os.makedirs(os.path.dirname(path), exist_ok=True)


def record(rel, source, op):
	manifest.append({'file': 'img/' + rel, 'source': 'assets/pack/' + source, 'op': op})


def save_pair(im, name, width, source, op, alpha=False):
	for fmt, ext, kw in (
		('AVIF', 'avif', {'quality': 58 if not alpha else 64, 'speed': 4}),
		('WEBP', 'webp', {'quality': 80 if not alpha else 86, 'method': 6}),
	):
		rel = f'{name}-{width}.{ext}'
		path = os.path.join(OUT, rel)
		ensure_dir(path)
		im.save(path, fmt, **kw)
		record(rel, source, op)


def resized(im, width):
	if width > im.width:
		raise SystemExit(f'refusing to upscale {im.width}px to {width}px')
	if width == im.width:
		return im.copy()
	h = round(im.height * width / im.width)
	return im.resize((width, h), Image.LANCZOS)


def levels(im, black):
	"""Map [black..255] to [0..255] per channel (clamps a near-black background to black)."""
	lut = []
	for b in black:
		scale = 255.0 / max(1, 255 - b)
		lut += [max(0, min(255, round((v - b) * scale))) for v in range(256)]
	return im.point(lut)


def edge_black(im):
	"""Per-channel 60th percentile of the outer 4% border: the object's background tone."""
	w, h = im.size
	m = max(2, int(min(w, h) * 0.04))
	px = []
	for box in ((0, 0, w, m), (0, h - m, w, h), (0, 0, m, h), (w - m, 0, w, h)):
		px += list(im.crop(box).getdata())
	out = []
	for c in range(3):
		vals = sorted(p[c] for p in px)
		out.append(vals[int(len(vals) * 0.6)])
	return out


def radial_mask(size, inner=0.55, outer=0.98):
	"""Alpha mask: opaque inside `inner` of the half-diagonal-ish radius, transparent past `outer`."""
	w, h = size
	small = 256
	mask = Image.new('L', (small, small))
	px = mask.load()
	for y in range(small):
		for x in range(small):
			dx = (x + 0.5) / small * 2 - 1
			dy = (y + 0.5) / small * 2 - 1
			d = math.sqrt(dx * dx + dy * dy)
			t = (d - inner) / (outer - inner)
			t = max(0.0, min(1.0, t))
			t = t * t * (3 - 2 * t)
			px[x, y] = round(255 * (1 - t))
	return mask.resize((w, h), Image.BICUBIC)


def luma_key(im, edge, gain=1.7):
	"""Light-on-black to RGBA: alpha from the brightest channel, colour un-premultiplied,
	so the object composites normally (no blend mode) and its black backdrop vanishes."""
	r, g, b = im.split()
	peak = ImageChops.lighter(ImageChops.lighter(r, g), b)
	alpha = peak.point(lambda v: min(255, round(v * gain)))
	alpha = ImageChops.multiply(alpha, edge)
	out = Image.new('RGBA', im.size)
	src = im.load()
	a = alpha.load()
	dst = out.load()
	for y in range(im.height):
		for x in range(im.width):
			av = a[x, y]
			if av == 0:
				dst[x, y] = (0, 0, 0, 0)
				continue
			k = 255.0 / av
			pr, pg, pb = src[x, y]
			dst[x, y] = (min(255, round(pr * k)), min(255, round(pg * k)), min(255, round(pb * k)), av)
	return out


def build_photos():
	for name, src, widths, _kind, crop in PHOTOS:
		im = Image.open(os.path.join(PACK, src)).convert('RGB')
		op = 'resize'
		if crop:
			l, t, r, b = crop
			im = im.crop((round(im.width * l), round(im.height * t), round(im.width * r), round(im.height * b)))
			op = 'crop-centre+resize'
		for w in widths:
			w = min(w, im.width)
			save_pair(resized(im, w), name, w, src, op)


def build_objects():
	for name, src, widths in OBJECTS:
		im = Image.open(os.path.join(PACK, src)).convert('RGB')
		black = edge_black(im)
		im = levels(im, black)
		rgba = luma_key(im, radial_mask(im.size, 0.62, 0.99))
		for w in widths:
			save_pair(resized(rgba, w), name, w, src, f'levels(black={black})+luma-key alpha+radial edge+resize', alpha=True)


def build_sprites():
	for name, src, (cols, rows), cell in SPRITES:
		im = Image.open(os.path.join(PACK, src)).convert('RGB')
		cw, ch = im.width / cols, im.height / rows
		atlas = Image.new('RGB', (cols * cell, rows * cell), (0, 0, 0))
		fall = radial_mask((cell, cell), 0.5, 0.96)
		for r in range(rows):
			for c in range(cols):
				box = (round(c * cw) + 8, round(r * ch) + 8, round((c + 1) * cw) - 8, round((r + 1) * ch) - 8)
				tile = im.crop(box).resize((cell, cell), Image.LANCZOS)
				tile = levels(tile, [28, 28, 28])
				tile = ImageChops.multiply(tile, Image.merge('RGB', (fall, fall, fall)))
				atlas.paste(tile, (c * cell, r * cell))
		# real alpha: the canvas is transparent, so black must be alpha 0, not opaque black
		atlas = luma_key(atlas, Image.new('L', atlas.size, 255), gain=1.0)
		rel = f'{name}.webp'
		path = os.path.join(OUT, rel)
		ensure_dir(path)
		atlas.save(path, 'WEBP', quality=92, method=6)
		record(rel, src, f'grid {cols}x{rows} -> {cell}px cells, black clamp 28, radial falloff, luma-key alpha')


def main():
	groups = {'photos': build_photos, 'objects': build_objects, 'sprites': build_sprites}
	wanted = sys.argv[1:] or list(groups)
	for g in wanted:
		groups[g]()
	ledger = set()
	with open(os.path.join(PACK, 'LEDGER.jsonl')) as fh:
		for line in fh:
			if line.strip():
				ledger.add(json.loads(line)['file'])
	missing = sorted({m['source'] for m in manifest} - ledger)
	if missing:
		raise SystemExit(f'pack sources without a ledger line: {missing}')
	# merge into the manifest: rows for files rebuilt now replace their old rows, others are kept
	path = os.path.join(OUT, 'IMAGES.jsonl')
	rows = {}
	if os.path.exists(path):
		with open(path) as fh:
			for line in fh:
				if line.strip():
					row = json.loads(line)
					rows[row['file']] = row
	for row in manifest:
		rows[row['file']] = row
	with open(path, 'w') as fh:
		for key in sorted(rows):
			fh.write(json.dumps(rows[key]) + '\n')
	total = sum(os.path.getsize(os.path.join(ROOT, m['file'])) for m in manifest)
	print(f'{len(manifest)} files, {total / 1024:.0f} KiB')


if __name__ == '__main__':
	sys.exit(main())
