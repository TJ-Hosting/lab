/*
 * lab-04 P7: before/after shots of every page, at 1440 and 375, at the scroll positions where each page changed.
 * node evidence/lab-04/before-after.mjs <before-root> <shots-dir> [before|after]   (one side only, if given)
 * <before-root> is the branch before lab-04 (git archive of e0177ff); "after" is this working tree.
 * Headless installed Chrome; each pair is joined side by side by C:\localhost\tools\lab-04\side_by_side.py.
 * Same static server as tests/run.mjs (with a GitHub-Pages-style 404.html fallback).
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const AFTER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [BEFORE_ARG, OUT, ONLY_SIDE] = process.argv.slice(2);
const BEFORE = resolve(BEFORE_ARG); // native separators, so the server's root check holds
mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2' };
const serve = (root) => new Promise((resolve) => {
	const s = createServer((req, res) => {
		let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		if (p.endsWith('/')) p += 'index.html';
		const file = join(root, normalize(p));
		if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404, { 'Content-Type': MIME['.html'] }); return res.end(readFileSync(join(root, '404.html'))); }
		res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
		res.end(readFileSync(file));
	});
	s.listen(0, '127.0.0.1', () => resolve(s));
});
const SHOTS = [
	['home', '', [null, '#samples', '#exhibits', '#about', 'bottom']],
	['humanity-type', 'samples/humanity-type/', [null]],
	['particle-field', 'samples/particle-field/', [null]],
	['logo', 'samples/logo/', [null]],
	['exhibit', 'exhibits/humanity/', [null, '#ch-1', '#ch-4', '#ch-5', '#ch-6', 'bottom']],
	['hub', 'honeypot/', [null, 'bottom']],
	['check', 'honeypot/check/', [null]],
	['scoreboard', 'honeypot/scoreboard/', [null]],
	['about', 'honeypot/about/', [null]],
	['404', 'no/such/page/', [null]],
];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, root] of [['before', BEFORE], ['after', AFTER]].filter(([l]) => !ONLY_SIDE || l === ONLY_SIDE)) {
	const server = await serve(root);
	const base = `http://127.0.0.1:${server.address().port}/`;
	for (const width of [1440, 375]) {
		for (const [name, path, anchors] of SHOTS) {
			for (const anchor of anchors) {
				if (width === 375 && anchor && anchor !== 'bottom' && name !== 'exhibit') continue; // phones: first screens, the footer and the exhibit's rooms
				const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: 1, ...(width === 375 ? { isMobile: true, hasTouch: true } : {}) });
				const page = await ctx.newPage();
				await page.goto(base + path, { waitUntil: 'networkidle' });
				if (anchor === 'bottom') await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
				else if (anchor) { await page.locator(anchor).first().scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -60)); }
				await page.waitForTimeout(name === 'logo' ? 4200 : 2200);
				const tag = `${name}${anchor ? `-${anchor.replace('#', '')}` : ''}-${width}`;
				await page.screenshot({ path: join(OUT, `${tag}-${label}.jpg`), type: 'jpeg', quality: 78 });
				await ctx.close();
			}
		}
	}
	server.close();
}
await browser.close();
console.log('done');
