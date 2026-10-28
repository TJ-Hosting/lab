#!/usr/bin/env python3
"""Convert the pre-generated pack (assets/pack/) into the web images the site ships.

Run from the repo root:  python3 -I tools/build_images.py [photos] [objects] [sprites] [cutouts]

- AVIF + WebP at responsive widths; never wider than the source (no silent upscaling).
- Objects on dark backgrounds get a black-point clamp and a soft radial alpha edge,
  so they float over the glass without a visible box.
- Sprite sheets get their near-black cells clamped to pure black and their cell edges
  faded out, so additive blending ('lighter') adds nothing but light.
- Cut-outs (lab-04, the day sky) are RGBA already: their alpha is kept, alpha 250-254 is
  snapped to 255 (the generator leaves solid objects a hair translucent), the canvas is
  trimmed to the object, and they are resized premultiplied so no dark fringe appears.
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
# lab-04 retired every photo and dark object (the aurora, prism, bokeh, liquid-chrome and honeycomb
# backdrops, the dark card art, the luma-keyed glass objects): the day sky is CSS and the art is the
# cut-outs below. The kinds stay for later use; the pack originals stay in assets/pack/.
PHOTOS = [
	# lab-05 in-piece art (photos and textures inside a sample; added by ingest-lab05.mjs)
	('art/transition-slider-dawn', 'lab05-transition-slider-dawn.png', [768, 1536], 'photo', None),
	('art/transition-slider-aurora', 'lab05-transition-slider-aurora.png', [768, 1536], 'photo', None),
	('art/transition-slider-cliffs', 'lab05-transition-slider-cliffs.png', [768, 1536], 'photo', None),
	('art/halftone-dissolve-lake', 'lab05-halftone-dissolve-lake.png', [768, 1536], 'photo', None),
	('art/halftone-dissolve-facade', 'lab05-halftone-dissolve-facade.png', [768, 1536], 'photo', None),
	('art/liquid-glass-lens-ribbons', 'lab05-liquid-glass-lens-ribbons.png', [768, 1536], 'photo', None),
	('art/browser-frame-showcase-bakery', 'lab05-browser-frame-showcase-bakery.png', [512, 1024], 'photo', None),
	('art/browser-frame-showcase-studio', 'lab05-browser-frame-showcase-studio.png', [512, 1024], 'photo', None),
	('art/browser-frame-showcase-garden', 'lab05-browser-frame-showcase-garden.png', [512, 1024], 'photo', None),
	('art/lantern-pond-pond', 'lab05-lantern-pond-pond.png', [768, 1536], 'photo', None),
	('art/liquid-hover-gallery-wave', 'lab05-liquid-hover-gallery-wave.png', [512, 1024], 'photo', None),
	('art/liquid-hover-gallery-cornflowers', 'lab05-liquid-hover-gallery-cornflowers.png', [512, 1024], 'photo', None),
	('art/relief-light-board-stone', 'lab05-relief-light-board-stone.png', [640, 1254], 'photo', None),
	('art/relief-light-board-metal', 'lab05-relief-light-board-metal.png', [640, 1254], 'photo', None),
	('art/lenticular-print-sunrise', 'lab05-lenticular-print-sunrise.png', [640, 1254], 'photo', None),
	('art/lenticular-print-moonrise', 'lab05-lenticular-print-moonrise.png', [640, 1254], 'photo', None),
	('art/frosted-window-street', 'lab05-frosted-window-street.png', [768, 1536], 'photo', None),
	('art/page-turn-lookbook-cover', 'lab05-page-turn-lookbook-cover.png', [512, 1024], 'photo', None),
	('art/page-turn-lookbook-spread-1', 'lab05-page-turn-lookbook-spread-1.png', [768, 1536], 'photo', None),
	('art/page-turn-lookbook-spread-2', 'lab05-page-turn-lookbook-spread-2.png', [768, 1536], 'photo', None),
	('art/relief-light-board-leather', 'lab05-relief-light-board-leather.png', [640, 1254], 'photo', None),
	# lab-05 end
]
OBJECTS = []
# name, source, grid (cols, rows), cell size out. The particle field's atlases, inside its night screen.
SPRITES = [
	('sprites/orbs', 'lab-spr-orbs-black.jpg', (4, 4), 128),
	('sprites/sparkles', 'lab-spr-sparkles-black.jpg', (4, 4), 128),
]
# lab-04 cut-outs: name, pack source, widths, optional crop box (fractions l,t,r,b) before the trim.
# lab-* come from the Lab's own Codex pack of 27 Oct, tj-* from tj-hosting.ca's approved pack
# (provenance in LEDGER.jsonl). A width past the trimmed object's own width is clamped to it.
CUTOUTS = [
	('iso/bee', 'lab-bee.png', [320, 640], None),
	('iso/flask', 'lab-flask.png', [320, 640], None),
	('iso/cube', 'lab-cube.png', [320, 640], None),
	('iso/orbs', 'lab-orbs.png', [320, 640], None),
	('iso/honeypot', 'lab-honeypot.png', [320, 640], None),
	# lab-04 review 1: the keepsake, the ring and the relay replace the amber prism, the standing torus and the
	# side-on hands (their pack originals stay)
	('iso/keepsake', 'lab-keepsake.png', [320, 640], None),
	('iso/ring', 'lab-ring.png', [320, 640], None),
	('iso/city', 'lab-city.png', [320, 640], None),
	('iso/checker', 'lab-checker.png', [320, 640], None),
	('iso/scoreboard', 'lab-scoreboard.png', [320, 640], None),
	('iso/shield-book', 'lab-shield-book.png', [320, 640], None),
	('iso/honeycomb', 'lab-honeycomb.png', [480, 960], None),
	('iso/rooms', 'lab-rooms.png', [480, 960], None),
	('iso/relay', 'lab-relay.png', [480, 960], None),
	('iso/constellation', 'lab-constellation.png', [480, 960], None),
	('iso/type-blocks', 'lab-type-blocks.png', [480, 960], None),
	('iso/particles', 'lab-particles.png', [400, 800], None),
	('iso/sphere-assembly', 'lab-sphere-assembly.png', [400, 800], None),
	('iso/browser', 'tj-hero-browser.png', [320, 640], None),
	('iso/plinth-square', 'tj-hero-plinth-square.png', [320, 640], None),
	('iso/server-404', 'tj-state-404.png', [400, 800], None),
	# tj's cloud sheet holds six clouds; four are cut out by their connected regions (lab-04 P2)
	('sky/cloud-1', 'tj-hero-clouds-sheet.png', [220, 420], (0.0502, 0.0893, 0.3373, 0.4846)),
	('sky/cloud-2', 'tj-hero-clouds-sheet.png', [220, 420], (0.3852, 0.1275, 0.6579, 0.4803)),
	('sky/cloud-4', 'tj-hero-clouds-sheet.png', [220, 420], (0.0478, 0.5696, 0.3660, 0.9309)),
	('sky/cloud-5', 'tj-hero-clouds-sheet.png', [220, 420], (0.4067, 0.5866, 0.6651, 0.9267)),
	# lab-05 card objects (one per new sample; added by agent-honeypot\imagepack\ingest-lab05.mjs)
	('iso/coral-ink', 'lab05-coral-ink.png', [400, 800], None),
	('iso/split-flap-board', 'lab05-split-flap-board.png', [400, 800], None),
	('iso/star-trail-text', 'lab05-star-trail-text.png', [400, 800], None),
	('iso/scroll-zoom-tunnel', 'lab05-scroll-zoom-tunnel.png', [400, 800], None),
	('iso/tear-the-curtain', 'lab05-tear-the-curtain.png', [400, 800], None),
	('iso/dot-mesh-hero', 'lab05-dot-mesh-hero.png', [400, 800], None),
	('iso/gpu-fluid', 'lab05-gpu-fluid.png', [400, 800], None),
	('iso/brand-colour-sphere', 'lab05-brand-colour-sphere.png', [400, 800], None),
	('iso/integration-beams', 'lab05-integration-beams.png', [400, 800], None),
	('iso/glass-card-flow', 'lab05-glass-card-flow.png', [400, 800], None),
	('iso/clock-wall', 'lab05-clock-wall.png', [400, 800], None),
	('iso/contour-map', 'lab05-contour-map.png', [400, 800], None),
	('iso/bento-grid', 'lab05-bento-grid.png', [400, 800], None),
	('iso/glass-jellyfish', 'lab05-glass-jellyfish.png', [400, 800], None),
	('iso/pendulum-wave', 'lab05-pendulum-wave.png', [400, 800], None),
	('iso/dither-flow-ink', 'lab05-dither-flow-ink.png', [400, 800], None),
	('iso/epicycle-machine', 'lab05-epicycle-machine.png', [400, 800], None),
	('iso/wavy-lines-hero', 'lab05-wavy-lines-hero.png', [400, 800], None),
	('iso/marble-harp', 'lab05-marble-harp.png', [400, 800], None),
	('iso/glass-sandbox', 'lab05-glass-sandbox.png', [400, 800], None),
	('iso/edge-network-globe', 'lab05-edge-network-globe.png', [400, 800], None),
	('iso/horizontal-journey', 'lab05-horizontal-journey.png', [400, 800], None),
	('iso/shader-swatchbook', 'lab05-shader-swatchbook.png', [400, 800], None),
	('iso/glass-orbs', 'lab05-glass-orbs.png', [400, 800], None),
	('iso/lamp-cord-theme', 'lab05-lamp-cord-theme.png', [400, 800], None),
	('iso/transition-slider', 'lab05-transition-slider.png', [400, 800], None),
	('iso/lantern-pond', 'lab05-lantern-pond.png', [400, 800], None),
	('iso/focus-trail-form', 'lab05-focus-trail-form.png', [400, 800], None),
	('iso/shape-shifter', 'lab05-shape-shifter.png', [400, 800], None),
	('iso/relief-light-board', 'lab05-relief-light-board.png', [400, 800], None),
	('art/glass-diorama-card-islands', 'lab05-glass-diorama-card-islands.png', [480, 960], None),
	('art/glass-diorama-card-tower', 'lab05-glass-diorama-card-tower.png', [480, 960], None),
	('art/glass-diorama-card-clouds', 'lab05-glass-diorama-card-clouds.png', [480, 960], None),
	('iso/liquid-hover-gallery', 'lab05-liquid-hover-gallery.png', [400, 800], None),
	('iso/streamline-poster', 'lab05-streamline-poster.png', [400, 800], None),
	('iso/scramble-titles', 'lab05-scramble-titles.png', [400, 800], None),
	('iso/glass-diorama-card', 'lab05-glass-diorama-card.png', [400, 800], None),
	('iso/stacking-plan-cards', 'lab05-stacking-plan-cards.png', [400, 800], None),
	('iso/liquid-metal-monogram', 'lab05-liquid-metal-monogram.png', [400, 800], None),
	('iso/glitch-headline', 'lab05-glitch-headline.png', [400, 800], None),
	('iso/slime-network', 'lab05-slime-network.png', [400, 800], None),
	('iso/pricing-rolling-digits', 'lab05-pricing-rolling-digits.png', [400, 800], None),
	('iso/skill-chips', 'lab05-skill-chips.png', [400, 800], None),
	('iso/request-in-ms', 'lab05-request-in-ms.png', [400, 800], None),
	('iso/publish-button', 'lab05-publish-button.png', [400, 800], None),
	('iso/dawn-to-night', 'lab05-dawn-to-night.png', [400, 800], None),
	('iso/halftone-dissolve', 'lab05-halftone-dissolve.png', [400, 800], None),
	('iso/chart-story', 'lab05-chart-story.png', [400, 800], None),
	('iso/icon-micro-set', 'lab05-icon-micro-set.png', [400, 800], None),
	# lab-05 end
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


def resized_tile(im, width):
	"""Resize a seamless tile without breaking its wrap: scale a 3x3 repeat, keep the centre."""
	if width > im.width:
		raise SystemExit(f'refusing to upscale {im.width}px to {width}px')
	h = round(im.height * width / im.width)
	big = Image.new('RGB', (im.width * 3, im.height * 3))
	for y in range(3):
		for x in range(3):
			big.paste(im, (x * im.width, y * im.height))
	return big.resize((width * 3, h * 3), Image.LANCZOS).crop((width, h, width * 2, h * 2))


def build_photos():
	for name, src, widths, kind, crop in PHOTOS:
		im = Image.open(os.path.join(PACK, src)).convert('RGB')
		op = 'resize'
		if crop:
			l, t, r, b = crop
			im = im.crop((round(im.width * l), round(im.height * t), round(im.width * r), round(im.height * b)))
			op = 'crop-centre+resize'
		if kind == 'tile':
			op = 'wrap-safe resize (3x3 repeat, centre)'
		for w in widths:
			w = min(w, im.width)
			save_pair(resized_tile(im, w) if kind == 'tile' else resized(im, w), name, w, src, op)


def build_objects():
	for name, src, widths, *edge in OBJECTS:
		inner, outer = edge[0] if edge else (0.62, 0.99)
		im = Image.open(os.path.join(PACK, src)).convert('RGB')
		black = edge_black(im)
		im = levels(im, black)
		rgba = luma_key(im, radial_mask(im.size, inner, outer))
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


def cutout(im):
	"""RGBA in, RGBA out: alpha >= 250 snapped to 255, then trimmed to the object plus a small margin."""
	alpha = im.getchannel('A').point(lambda v: 255 if v >= 250 else v)
	im.putalpha(alpha)
	box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
	if box:
		pad = round(max(im.size) * 0.012)
		box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
		im = im.crop(box)
	return im


def resized_rgba(im, width):
	"""Resize premultiplied, so transparent pixels' colour never bleeds into the edge."""
	return resized(im.convert('RGBa'), width).convert('RGBA')


def build_cutouts():
	for name, src, widths, crop in CUTOUTS:
		im = Image.open(os.path.join(PACK, src)).convert('RGBA')
		op = 'alpha kept, 250-254 snapped to 255, trim, premultiplied resize'
		if crop:
			l, t, r, b = crop
			im = im.crop((round(im.width * l), round(im.height * t), round(im.width * r), round(im.height * b)))
			op = 'crop (one cloud of the sheet), ' + op
		im = cutout(im)
		done = set()
		for w in widths:
			w = min(w, im.width)
			if w in done:
				continue
			done.add(w)
			save_pair(resized_rgba(im, w), name, w, src, op, alpha=True)
		print(f'{name}: {im.width}x{im.height} after trim, widths {sorted(done)}')


def main():
	groups = {'photos': build_photos, 'objects': build_objects, 'sprites': build_sprites, 'cutouts': build_cutouts}
	args = sys.argv[1:]
	# lab-05: --only iso/a,art/b builds just those names (new images), leaving every other output and its
	# manifest row untouched, so a rebuild never re-encodes the images already shipped
	if '--only' in args:
		k = args.index('--only')
		only = set(args[k + 1].split(','))
		del args[k:k + 2]
		for table in (PHOTOS, OBJECTS, CUTOUTS):
			table[:] = [row for row in table if row[0] in only]
		SPRITES[:] = [row for row in SPRITES if row[0] in only]
	wanted = args or list(groups)
	for g in wanted:
		groups[g]()
	ledger = set()
	# explicit UTF-8 and '\n': Windows would otherwise read cp1252 and write CRLF
	with open(os.path.join(PACK, 'LEDGER.jsonl'), encoding='utf-8') as fh:
		for line in fh:
			if line.strip():
				ledger.add(json.loads(line)['file'])
	missing = sorted({m['source'] for m in manifest} - ledger)
	if missing:
		raise SystemExit(f'pack sources without a ledger line: {missing}')
	# merge into the manifest: rows for files rebuilt now replace their old rows, others are kept
	# while their file still exists
	path = os.path.join(OUT, 'IMAGES.jsonl')
	rows = {}
	if os.path.exists(path):
		with open(path, encoding='utf-8') as fh:
			for line in fh:
				if line.strip():
					row = json.loads(line)
					if os.path.exists(os.path.join(ROOT, row['file'])):
						rows[row['file']] = row
	for row in manifest:
		rows[row['file']] = row
	with open(path, 'w', encoding='utf-8', newline='\n') as fh:
		for key in sorted(rows):
			fh.write(json.dumps(rows[key], separators=(',', ':')) + '\n')
	total = sum(os.path.getsize(os.path.join(ROOT, m['file'])) for m in manifest)
	print(f'{len(manifest)} files, {total / 1024:.0f} KiB')


if __name__ == '__main__':
	sys.exit(main())
