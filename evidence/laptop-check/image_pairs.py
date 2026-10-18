"""Join <tag>-before.jpg and <tag>-after.jpg side by side: <in-dir> <out-dir>."""
import os
import sys

from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
	if not f.endswith('-before.jpg'):
		continue
	tag = f[:-len('-before.jpg')]
	a = Image.open(os.path.join(src, f))
	b = Image.open(os.path.join(src, tag + '-after.jpg'))
	scale = 0.5 if a.width > 1000 else 1
	a = a.resize((round(a.width * scale), round(a.height * scale)))
	b = b.resize(a.size)
	pair = Image.new('RGB', (a.width * 2 + 12, a.height + 24), (24, 24, 28))
	pair.paste(a, (0, 24))
	pair.paste(b, (a.width + 12, 24))
	d = ImageDraw.Draw(pair)
	d.text((6, 6), f'{tag}  BEFORE (branch @ a504b50)', fill=(235, 235, 235))
	d.text((a.width + 18, 6), 'AFTER (17 Oct images)', fill=(235, 235, 235))
	pair.save(os.path.join(out, tag + '.jpg'), quality=80)
	print(tag)
