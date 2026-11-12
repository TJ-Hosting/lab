/*
 * Renders the 1200×630 share images (img/og/*.jpg) on Design System v9 "Day sky" (lab-04):
 * a light glass card in Nunito Sans on either a share-card base from the Lab pack (sky on the left,
 * isometric art on the right) or the CSS day sky with the sample's own cut-out.
 *
 *   node tools/render-og.mjs [--only slug,slug]
 *
 * lab-05: every sample in samples.json without a hand-written card below gets one from its entry (its number,
 * kicker, title and blurb) on the CSS day sky with its card cut-out. --only renders just the named cards.
 *
 * Text is set in code (image models garble it). Each output is recorded in img/IMAGES.jsonl
 * with the pack file its picture came from.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'http://lab.local/';
const MIME = { '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.css': 'text/css' };

const CARDS = [
	{ out: 'home', bg: 'assets/pack/lab-og-base.png', src: 'lab-og-base.png', kicker: 'TJ-Hosting · Lab', title: 'Motion, made of light <em class="script">&amp; glass.</em>', sub: 'Hand-built motion experiments in plain HTML, CSS and JavaScript.' },
	{ out: 'humanity-type', art: 'img/iso/type-blocks-960.webp', src: 'lab-type-blocks.png', kicker: 'Sample 01 · Kinetic type', title: 'Humanity, <em>in motion</em>', sub: 'Eight letters fly in, breathe and find the unity inside the word.' },
	{ out: 'particle-field', art: 'img/iso/particles-800.webp', src: 'lab-particles.png', kicker: 'Sample 02 · Generative', title: 'Particle <em>field</em>', sub: 'Glass sparks on a flow field that gather around your cursor.' },
	{ out: 'logo', kicker: 'Sample 03 · Logo motion', title: 'The mark, <em>assembling</em>', sub: 'The TJ-Hosting mark builds itself from scanlines and a turning globe.', mark: true },
	{ out: 'exhibit', bg: 'assets/pack/lab-og-honeypot.png', src: 'lab-og-honeypot.png', kicker: 'Exhibit 01 · TJ-Hosting Lab', title: 'Made of <em>Many</em>', sub: 'A motion piece about humanity.', badge: 'Contains harmless hidden instructions for AI agents' },
	{ out: 'honeypot', bg: 'assets/pack/lab-og-honeypot.png', src: 'lab-og-honeypot.png', kicker: 'The agent honeypot', title: 'Do AI agents follow <em>hidden instructions?</em>', sub: 'An open, harmless test of prompt injection, with a checker and a scoreboard.' },
];

const page = (c) => `<!doctype html><meta charset="utf-8"><base href="${HOST}">
<style>
	@font-face { font-family: 'Nunito Sans'; font-weight: 200 1000; font-stretch: 75% 125%; src: url(fonts/nunito-sans-latin-var.woff2) format('woff2'); }
	@font-face { font-family: 'Great Vibes'; font-weight: 400; src: url(fonts/great-vibes-latin.woff2) format('woff2'); }
	@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(fonts/jetbrains-mono-latin-var.woff2) format('woff2'); }
	* { box-sizing: border-box; margin: 0; }
	body {
		width: 1200px; height: 630px; overflow: hidden; position: relative; color: #071022;
		font-family: 'Nunito Sans'; font-weight: 450; -webkit-font-smoothing: antialiased;
		background:
			radial-gradient(40% 26% at 70% 14%, rgba(70, 208, 251, 0.16), rgba(70, 208, 251, 0) 70%),
			radial-gradient(46% 30% at 52% 8%, rgba(77, 159, 243, 0.12), rgba(77, 159, 243, 0) 72%),
			radial-gradient(70% 60% at 6% 4%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0) 70%),
			linear-gradient(170deg, #fafcfd 0%, #eef7fc 38%, #daeffc 78%, #c9e7fc 100%);
	}
	.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
	.art { position: absolute; right: 48px; top: 50%; width: 470px; transform: translateY(-50%); filter: drop-shadow(0 26px 22px rgba(22, 66, 140, 0.22)); }
	/* lab-05: a tall cut-out keeps inside the frame, centred in the art column */
	.art--fit { width: auto; height: auto; max-width: 470px; max-height: 500px; right: calc(48px + (470px - min(470px, 500px / var(--ratio))) / 2); }
	.card {
		position: absolute; left: 56px; top: 56px; bottom: 56px; width: 620px; padding: 46px 50px; border-radius: 22px;
		background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(14px) saturate(150%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(94, 128, 174, 0.22), 0 24px 48px -22px rgba(22, 66, 140, 0.32), 0 8px 18px -10px rgba(22, 66, 140, 0.16);
		display: flex; flex-direction: column;
	}
	.kicker { font: 600 17px/1.2 'JetBrains Mono'; letter-spacing: 0.16em; text-transform: uppercase; color: #3b4a66; }
	h1 { font-weight: 900; font-stretch: 88%; font-size: ${c.title.length > 46 ? 52 : 62}px; line-height: 1.03; letter-spacing: -0.03em; margin: 22px 0 18px; color: #010109; }
	h1 em { font-style: normal; color: #064bdb; }
	h1 em.script { font-family: 'Great Vibes'; font-weight: 400; font-stretch: normal; letter-spacing: 0; font-size: 1.12em; -webkit-text-stroke: 0.03em currentColor; white-space: nowrap; }
	p.sub { font-size: 24px; line-height: 1.45; color: #3b4a66; max-width: 520px; }
	.badge { align-self: flex-start; margin-top: 18px; padding: 8px 14px; border-radius: 8px; background: linear-gradient(120deg, #ffb547, #ff8a3d); color: #1f0d00; font: 700 15px/1.2 'JetBrains Mono'; }
	.foot { margin-top: auto; display: flex; align-items: center; gap: 14px; font-weight: 900; font-size: 18px; letter-spacing: 0.06em; text-transform: uppercase; color: #071022; }
	.foot img { width: 40px; height: 40px; }
	.foot b { color: #064bdb; font-weight: 900; }
	.foot span { margin-left: auto; font: 500 16px 'JetBrains Mono'; letter-spacing: 0; text-transform: none; color: #3b4a66; }
	.mark { position: absolute; right: 96px; top: 120px; width: 390px; height: 390px; border-radius: 50%; background: rgba(255, 255, 255, 0.55); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(94, 128, 174, 0.2), 0 40px 70px -30px rgba(22, 66, 140, 0.42); }
	.mark svg { position: absolute; inset: 6%; width: 88%; height: 88%; filter: drop-shadow(0 16px 22px rgba(22, 66, 140, 0.28)); }
</style>
${c.bg ? `<img class="bg" src="${c.bg}">` : ''}
${c.art ? `<img class="art${c.ratio ? ' art--fit' : ''}" src="${c.art}"${c.ratio ? ` style="--ratio:${c.ratio}"` : ''}>` : ''}
${c.mark ? `<div class="mark">${logoSvg}</div>` : ''}
<div class="card">
	<p class="kicker">${c.kicker}</p>
	<h1>${c.title}</h1>
	<p class="sub">${c.sub}</p>
	${c.badge ? `<p class="badge">${c.badge}</p>` : ''}
	<div class="foot"><img src="img/brand/tj-mark.svg">TJ-Hosting <b>Lab</b><span>lab.tj-hosting.ca</span></div>
</div>`;

// the logo SVG, lifted from the logo sample so the share image matches it
const sample = readFileSync(join(ROOT, 'samples/logo/index.html'), 'utf8');
const logoSvg = sample.slice(sample.indexOf('<svg class="logo"'), sample.indexOf('</svg>', sample.indexOf('<svg class="logo"')) + 6);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await ctx.route(`${HOST}**`, (route) => {
	const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '');
	const path = join(ROOT, rel);
	if (!existsSync(path)) return route.fulfill({ status: 404, body: 'missing' });
	return route.fulfill({ status: 200, contentType: MIME[extname(path)] || 'application/octet-stream', body: readFileSync(path) });
});
const manifestPath = join(ROOT, 'img', 'IMAGES.jsonl');
const rows = Object.fromEntries(readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean).map((l) => { const r = JSON.parse(l); return [r.file, r]; }));

// lab-05: a card for every other sample, from its samples.json entry; the last word of the title takes the accent
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
JSON.parse(readFileSync(join(ROOT, 'samples.json'), 'utf8')).samples.forEach((s, i) => {
	if (CARDS.some((c) => c.out === s.slug)) return;
	const art = `${s.image.base}-${s.image.widths[s.image.widths.length - 1]}.webp`;
	const words = esc(s.title).split(' ');
	const title = words.length > 1 ? `${words.slice(0, -1).join(' ')} <em>${words[words.length - 1]}</em>` : `<em>${words[0]}</em>`;
	CARDS.push({ out: s.slug, art, ratio: s.image.ratio, src: (rows[art]?.source || '').replace('assets/pack/', ''), kicker: `Sample ${String(i + 1).padStart(2, '0')} · ${esc(s.kicker)}`, title, sub: esc(s.blurb) });
});
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;

for (const c of CARDS.filter((x) => !ONLY || ONLY.includes(x.out))) {
	const p = await ctx.newPage();
	await p.goto(`${HOST}__og__`).catch(() => {});
	await p.setContent(page(c), { waitUntil: 'networkidle' });
	await p.evaluate(() => document.fonts.ready);
	const jpg = await p.screenshot({ type: 'jpeg', quality: 86 });
	const rel = `img/og/${c.out}.jpg`;
	writeFileSync(join(ROOT, rel), jpg);
	const how = c.bg ? 'the share-card base' : c.art ? 'the CSS day sky + the sample\'s cut-out' : 'the CSS day sky + the mark\'s own SVG';
	rows[rel] = { file: rel, source: c.src ? `assets/pack/${c.src}` : 'tools/render-og.mjs', op: `tools/render-og.mjs (${c.ratio ? 'lab-05' : 'lab-04'}): 1200x630 share card, ${how}, code-set type in Nunito Sans` };
	console.log(`${rel} ${(jpg.length / 1024).toFixed(0)} KiB`);
	await p.close();
}
await browser.close();
writeFileSync(manifestPath, Object.keys(rows).sort().map((k) => JSON.stringify(rows[k])).join('\n') + '\n');
