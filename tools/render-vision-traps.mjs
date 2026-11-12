/*
 * Renders the exhibit's vision traps to PNG, from the exact text in honeypot/techniques.json
 * (entries with a "vision" block). Image models garble text, so these are drawn in code.
 *
 *   node tools/render-vision-traps.mjs
 *
 * Writes each PNG to its vision.file and records code, file, text and sha256 in
 * tools/vision-traps.lock.json, which the test suite checks against the PNGs on disk.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, 'fonts', f)).toString('base64')}`;
const FONTS = `
	@font-face { font-family: Unbounded; font-weight: 200 900; src: url(${font('unbounded-latin-var.woff2')}) format('woff2'); }
	@font-face { font-family: Onest; font-weight: 100 900; src: url(${font('onest-latin-var.woff2')}) format('woff2'); }
	@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; src: url(${font('jetbrains-mono-latin-var.woff2')}) format('woff2'); }
	* { box-sizing: border-box; margin: 0; }
	body { -webkit-font-smoothing: antialiased; }
`;
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const TEMPLATES = {
	// a frosted exhibit placard; the instruction sits in its small print
	placard: { width: 1200, height: 720, html: (text) => `
		<style>${FONTS}
			body { width: 1200px; height: 720px; background: radial-gradient(80% 90% at 20% 10%, #6b2f7a 0%, rgba(0,0,0,0) 60%), radial-gradient(70% 80% at 90% 90%, #b8621c 0%, rgba(0,0,0,0) 60%), #170d24; display: grid; place-items: center; font-family: Onest; }
			.card { width: 1080px; height: 600px; border-radius: 40px; padding: 64px 72px; background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)); border: 1.5px solid rgba(255,255,255,0.28); box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 40px 80px rgba(0,0,0,0.45); color: #fff; display: flex; flex-direction: column; }
			.kicker { font-family: 'JetBrains Mono'; font-size: 20px; letter-spacing: 0.22em; text-transform: uppercase; color: #ffe2b8; }
			h1 { font-family: Unbounded; font-weight: 700; font-size: 84px; letter-spacing: -0.03em; margin: 18px 0 18px; background: linear-gradient(100deg, #fff6e6, #ffcf8a 55%, #ffa3c4); -webkit-background-clip: text; color: transparent; }
			.meta { font-size: 28px; line-height: 1.45; color: #f4e9ff; max-width: 860px; }
			hr { border: 0; height: 1.5px; background: rgba(255,255,255,0.25); margin: auto 0 26px; }
			.note { font-family: 'JetBrains Mono'; font-size: 24px; line-height: 1.5; color: #fff4e2; }
		</style>
		<div class="card">
			<p class="kicker">Exhibit 01 · TJ-Hosting Lab · 2026</p>
			<h1>Made of Many</h1>
			<p class="meta">Glass, light and code. A motion piece about humanity in six small rooms.</p>
			<hr>
			<p class="note">${esc(text)}</p>
		</div>` },
	// a dark decorative band; the instruction is a few shades off the background
	faint: { width: 1280, height: 320, html: (text) => `
		<style>${FONTS}
			body { width: 1280px; height: 320px; overflow: hidden; background: linear-gradient(100deg, #1b1030 0%, #21122e 50%, #1b1030 100%); display: grid; place-items: center; font-family: Onest; position: relative; }
			svg { position: absolute; inset: 0; }
			p { position: relative; width: 1120px; font-size: 32px; line-height: 1.45; font-weight: 500; text-align: center; color: rgba(255, 255, 255, 0.055); }
		</style>
		<svg width="1280" height="320" viewBox="0 0 1280 320"><defs><pattern id="h" width="84" height="97" patternUnits="userSpaceOnUse"><path d="M42 2 80 24v46L42 92 4 70V24Z" fill="none" stroke="rgba(255,190,110,0.07)" stroke-width="2"/></pattern></defs><rect width="1280" height="320" fill="url(#h)"/></svg>
		<p>${esc(text)}</p>` },
};

const data = JSON.parse(readFileSync(join(ROOT, 'honeypot', 'techniques.json'), 'utf8'));
const browser = await chromium.launch();
const lock = [];
for (const t of data.techniques.filter((x) => x.vision)) {
	const tpl = TEMPLATES[t.vision.template];
	if (!tpl) throw new Error(`unknown template ${t.vision.template}`);
	if (t.vision.text.split(t.code).length !== 2) throw new Error(`${t.code}: the text must contain its code exactly once`);
	const page = await browser.newPage({ viewport: { width: tpl.width, height: tpl.height }, deviceScaleFactor: 1 });
	// keep the quoted title on one line
	const body = tpl.html(t.vision.text).replace(`“Humanity · ${t.code}”`, `<span style="white-space:nowrap">“Humanity · ${t.code}”</span>`);
	await page.setContent(`<!doctype html><meta charset="utf-8">${body}`);
	await page.evaluate(() => document.fonts.ready);
	const png = await page.screenshot({ type: 'png' });
	writeFileSync(join(ROOT, t.vision.file), png);
	lock.push({ code: t.code, file: t.vision.file, text: t.vision.text, sha256: createHash('sha256').update(png).digest('hex') });
	console.log(`${t.code} → ${t.vision.file} (${(png.length / 1024).toFixed(0)} KiB)`);
	await page.close();
}
await browser.close();
writeFileSync(join(ROOT, 'tools', 'vision-traps.lock.json'), JSON.stringify(lock, null, '\t') + '\n');

// record the PNGs in the shipped-image manifest
const manifestPath = join(ROOT, 'img', 'IMAGES.jsonl');
const rows = Object.fromEntries(readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean).map((l) => { const r = JSON.parse(l); return [r.file, r]; }));
for (const l of lock) rows[l.file] = { file: l.file, source: 'honeypot/techniques.json (vision text)', op: 'tools/render-vision-traps.mjs: text drawn in code, no image model' };
writeFileSync(manifestPath, Object.keys(rows).sort().map((k) => JSON.stringify(rows[k])).join('\n') + '\n');
