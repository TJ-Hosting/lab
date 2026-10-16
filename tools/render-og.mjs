/*
 * Renders the 1200×630 share images (img/og/*.jpg) from pack backgrounds plus real type.
 *
 *   node tools/render-og.mjs
 *
 * Text is set in code (image models garble it). Each output is recorded in img/IMAGES.jsonl
 * with the pack file its background came from.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'http://lab.local/';
const MIME = { '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.css': 'text/css' };

const CARDS = [
	{ out: 'home', bg: 'img/art/og-home-1280.webp', src: 'lab-og-home.jpg', kicker: 'TJ-Hosting · Lab', title: 'Motion, made of light <em>&amp; glass.</em>', sub: 'Hand-built motion experiments in plain HTML, CSS and JavaScript.' },
	{ out: 'humanity-type', bg: 'img/art/hands-1280.webp', src: 'lab-hum-hands.jpg', kicker: 'Sample 01 · Kinetic type', title: 'Humanity, <em>in motion</em>', sub: 'Eight letters fly in, breathe and find the unity inside the word.' },
	{ out: 'particle-field', bg: 'img/art/particles-1280.webp', src: 'lab-og-particles.jpg', kicker: 'Sample 02 · Generative', title: 'Particle <em>field</em>', sub: 'Glass sparks on a flow field that gather around your cursor.' },
	{ out: 'logo', bg: 'img/bg/prism-1280.webp', src: 'lab-bg-prism.jpg', kicker: 'Sample 03 · Logo motion', title: 'The mark, <em>assembling</em>', sub: 'The TJ-Hosting mark builds itself from scanlines and a turning globe.', mark: true },
	{ out: 'exhibit', bg: 'img/bg/honeycomb-1280.webp', src: 'lab-hp-honeycomb.jpg', kicker: 'Exhibit 01 · TJ-Hosting Lab', title: 'Made of <em>Many</em>', sub: 'A motion piece about humanity.', badge: 'Contains harmless hidden instructions for AI agents', warm: true, bee: true },
	{ out: 'honeypot', bg: 'img/art/og-honeypot-1280.webp', src: 'lab-og-honeypot.jpg', kicker: 'The agent honeypot', title: 'Do AI agents follow <em>hidden instructions?</em>', sub: 'An open, harmless test of prompt injection, with a checker and a scoreboard.', warm: true },
];

const page = (c) => `<!doctype html><meta charset="utf-8"><base href="${HOST}">
<style>
	@font-face { font-family: Unbounded; font-weight: 200 900; src: url(fonts/unbounded-latin-var.woff2) format('woff2'); }
	@font-face { font-family: Onest; font-weight: 100 900; src: url(fonts/onest-latin-var.woff2) format('woff2'); }
	@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(fonts/jetbrains-mono-latin-var.woff2) format('woff2'); }
	* { box-sizing: border-box; margin: 0; }
	body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: #07051a; font-family: Onest; color: #fff; -webkit-font-smoothing: antialiased; }
	.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
	.scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7,5,26,0.92) 0%, rgba(7,5,26,0.72) 42%, rgba(7,5,26,0.05) 75%), linear-gradient(0deg, rgba(7,5,26,0.6), rgba(7,5,26,0) 40%); }
	.card { position: absolute; left: 56px; top: 56px; bottom: 56px; width: 640px; padding: 48px 52px; border-radius: 36px; background: rgba(20,13,48,0.38); backdrop-filter: blur(22px) saturate(160%); border: 1.5px solid rgba(255,255,255,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 30px 60px rgba(0,0,0,0.45); display: flex; flex-direction: column; }
	.kicker { font-family: 'JetBrains Mono'; font-size: 18px; letter-spacing: 0.2em; text-transform: uppercase; color: ${c.warm ? '#ffe2b8' : '#cfe9ff'}; }
	h1 { font-family: Unbounded; font-weight: 650; font-size: ${c.title.length > 40 ? 50 : 62}px; line-height: 1.02; letter-spacing: -0.03em; margin: 22px 0 20px; }
	h1 em { font-style: normal; background: ${c.warm ? 'linear-gradient(100deg,#ffe2a8,#ffb3cf 60%,#d9c4ff)' : 'linear-gradient(100deg,#c9efff,#d7c8ff 55%,#ffd9f3)'}; -webkit-background-clip: text; color: transparent; }
	p.sub { font-size: 24px; line-height: 1.45; color: #e6e0f7; max-width: 520px; }
	.badge { align-self: flex-start; margin-top: 18px; padding: 8px 16px; border-radius: 999px; background: linear-gradient(120deg,#ffb547,#ff8a3d); color: #1f0d00; font: 700 15px/1.2 'JetBrains Mono'; }
	.foot { margin-top: auto; display: flex; align-items: center; gap: 14px; font-family: Unbounded; font-weight: 600; font-size: 20px; }
	.foot img { width: 40px; height: 40px; }
	.foot span { font-family: 'JetBrains Mono'; font-weight: 500; font-size: 17px; color: #cfc6ee; margin-left: auto; }
	.mark { position: absolute; right: 90px; top: 115px; width: 400px; height: 400px; border-radius: 50%; background: rgba(20,13,48,0.25); backdrop-filter: blur(18px); border: 1.5px solid rgba(255,255,255,0.2); }
	.mark svg { position: absolute; inset: 6%; width: 88%; height: 88%; filter: drop-shadow(0 0 22px rgba(120,90,255,0.5)); }
	.bee { position: absolute; right: 70px; top: 90px; width: 420px; }
</style>
<img class="bg" src="${c.bg}">
<div class="scrim"></div>
${c.mark ? `<div class="mark">${logoSvg}</div>` : ''}
${c.bee ? '<img class="bee" src="img/obj/glass-bee-640.webp">' : ''}
<div class="card">
	<p class="kicker">${c.kicker}</p>
	<h1>${c.title}</h1>
	<p class="sub">${c.sub}</p>
	${c.badge ? `<p class="badge">${c.badge}</p>` : ''}
	<div class="foot"><img src="img/brand/tj-mark.svg">TJ-Hosting Lab<span>lab.tj-hosting.ca</span></div>
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
for (const c of CARDS) {
	const p = await ctx.newPage();
	await p.goto(`${HOST}__og__`).catch(() => {});
	await p.setContent(page(c), { waitUntil: 'networkidle' });
	await p.evaluate(() => document.fonts.ready);
	const jpg = await p.screenshot({ type: 'jpeg', quality: 86 });
	const rel = `img/og/${c.out}.jpg`;
	writeFileSync(join(ROOT, rel), jpg);
	rows[rel] = { file: rel, source: `assets/pack/${c.src}`, op: 'tools/render-og.mjs: 1200x630 share card, pack background + code-set type' };
	console.log(`${rel} ${(jpg.length / 1024).toFixed(0)} KiB`);
	await p.close();
}
await browser.close();
writeFileSync(manifestPath, Object.keys(rows).sort().map((k) => JSON.stringify(rows[k])).join('\n') + '\n');
