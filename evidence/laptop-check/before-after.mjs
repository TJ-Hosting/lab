/*
 * lab-02 P2: before/after shots of every page whose images changed, at the scroll positions where they show.
 * node evidence/laptop-check/before-after.mjs <before-root> <shots-dir>
 * <before-root> is a copy of the branch before the image change (git archive of ae57e46/a504b50);
 * "after" is this working tree. Headless installed Chrome; pairs are joined by image_pairs.py.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const AFTER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [BEFORE, OUT] = process.argv.slice(2);
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
	['home', '', [null, '#samples', '#about']],
	['exhibit', 'exhibits/humanity/', [null, '#ch-3', '#ch-4', '#ch-5']],
	['hub', 'honeypot/', [null]],
	['404', 'no/such/page/', [null]],
	['logo', 'samples/logo/', [null]],
	['particle-field', 'samples/particle-field/', [null]],
];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, root] of [['before', BEFORE], ['after', AFTER]]) {
	const server = await serve(root);
	const base = `http://127.0.0.1:${server.address().port}/`;
	for (const width of [1440, 375]) {
		for (const [name, path, anchors] of SHOTS) {
			for (const anchor of anchors) {
				const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: 1, ...(width === 375 ? { isMobile: true, hasTouch: true } : {}) });
				const page = await ctx.newPage();
				await page.goto(base + path, { waitUntil: 'networkidle' });
				if (anchor) { await page.locator(anchor).first().scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -60)); }
				await page.waitForTimeout(name === 'logo' ? 4200 : 2200);
				const tag = `${name}${anchor ? `-${anchor.replace('#', '')}` : ''}-${width}`;
				await page.screenshot({ path: join(OUT, `${tag}-${label}.jpg`), type: 'jpeg', quality: 80 });
				await ctx.close();
			}
		}
	}
	server.close();
}
await browser.close();
console.log('done');
