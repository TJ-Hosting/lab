/*
 * lab-02 laptop check: the site in headed, installed Chrome and Edge at 1440 and 375 px.
 * Run from the repo root:  node evidence/laptop-check/laptop-check.mjs <label> [chrome,msedge]
 * Shots and results.json go to evidence/laptop-check/<label>/. Same static server as tests/run.mjs
 * (with a GitHub-Pages-style 404.html fallback). Reads page state only; changes nothing in the site.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LABEL = process.argv[2] || 'run';
const CHANNELS = (process.argv[3] || 'chrome,msedge').split(',');
const OUT = join(ROOT, 'evidence', 'laptop-check', LABEL);
mkdirSync(OUT, { recursive: true });
const TECH = JSON.parse(readFileSync(join(ROOT, 'honeypot/techniques.json'), 'utf8')).techniques;
const RESULTS = JSON.parse(readFileSync(join(ROOT, 'honeypot/results.json'), 'utf8'));

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((req, res) => {
	let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	if (p.endsWith('/')) p += 'index.html';
	const file = join(ROOT, normalize(p));
	if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
		res.writeHead(404, { 'Content-Type': MIME['.html'] });
		return res.end(readFileSync(join(ROOT, '404.html')));
	}
	res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
	res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const results = { label: LABEL, started: new Date().toISOString(), base: 'local static server, 404 fallback', items: [] };
const record = (item) => { results.items.push(item); console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.browser} ${item.width} ${item.check}${item.note ? ` (${item.note})` : ''}`); };
const CSP_HOOK = () => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); };

for (const channel of CHANNELS) {
	const browser = await chromium.launch({ channel, headless: false });
	const version = browser.version();
	results[channel] = version;
	for (const width of [1440, 375]) {
		const viewport = { width, height: width === 375 ? 812 : 900 };
		const mobile = width === 375 ? { isMobile: true, hasTouch: true } : {};
		const dir = join(OUT, channel);
		mkdirSync(dir, { recursive: true });
		const shot = async (page, name) => { const f = join(dir, `${name}-${width}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 72 }); return `evidence/laptop-check/${LABEL}/${channel}/${name}-${width}.jpg`; };
		async function open(path, { reduced = false, route = null, expect404 = false } = {}) {
			const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', ...mobile });
			await ctx.addInitScript(CSP_HOOK);
			const page = await ctx.newPage();
			const problems = [];
			let docStatusLogged = false; // a 404 page's own status is logged by the browser once; that is the page working
			page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
			page.on('console', (m) => {
				if (expect404 && !docStatusLogged && /status of 404/.test(m.text()) && m.location().url === BASE + path) { docStatusLogged = true; return; }
				if (m.type() === 'error' || m.type() === 'warning') problems.push(`console.${m.type()}: ${m.text().slice(0, 200)}`);
			});
			page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
			page.on('response', (r) => { if (r.status() >= 400 && !(expect404 && r.url() === BASE + path)) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
			if (route) await page.route(route.pattern, route.handler);
			await page.goto(BASE + path, { waitUntil: 'networkidle' });
			const done = async () => {
				const csp = await page.evaluate(() => window.__csp || []).catch(() => []);
				const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth).catch(() => 0);
				await ctx.close();
				return [...problems, ...csp.map((c) => `CSP: ${c}`), ...(overflow > 0 ? [`horizontal overflow ${overflow}px`] : [])];
			};
			return { page, ctx, done };
		}
		const base = { browser: `${channel} ${version}`, width };

		// home, glass on
		{
			const { page, done } = await open('');
			await page.waitForTimeout(1500);
			const glass = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.hero__panel')); return s.backdropFilter || s.webkitBackdropFilter || 'none'; });
			const cards = await page.locator('[data-cards="samples"] > li .card').count();
			const s1 = await shot(page, 'home');
			await page.locator('#samples').scrollIntoViewIfNeeded();
			await page.waitForTimeout(1200);
			const s2 = await shot(page, 'home-samples');
			const problems = await done();
			record({ ...base, check: 'home (glass on)', pass: glass !== 'none' && cards === 3 && !problems.length, note: `backdrop-filter: ${glass}; ${cards} sample cards`, problems, shots: [s1, s2] });
		}
		// home, glass fallback (backdrop-filter unsupported)
		{
			const css = readFileSync(join(ROOT, 'css/glass.css'), 'utf8').replace(/@supports \(\(backdrop-filter: blur\(1px\)\) or \(-webkit-backdrop-filter: blur\(1px\)\)\)/g, '@supports (not-a-real-property: 1)');
			const { page, done } = await open('', { route: { pattern: '**/css/glass.css', handler: (r) => r.fulfill({ contentType: 'text/css', body: css }) } });
			await page.waitForTimeout(1500);
			const st = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.hero__panel')); return { bg: s.backgroundColor, f: s.backdropFilter || s.webkitBackdropFilter || 'none' }; });
			const s1 = await shot(page, 'home-glass-fallback');
			const problems = await done();
			record({ ...base, check: 'home (glass fallback)', pass: st.f === 'none' && st.bg === 'rgba(255, 255, 255, 0.9)' && !problems.length, note: `fill ${st.bg}, backdrop-filter ${st.f}`, problems, shots: [s1] });
		}
		// samples, normal and reduced motion
		for (const [slug, wait] of [['humanity-type', 3600], ['particle-field', 2500], ['logo', 4200]]) {
			{
				const { page, done } = await open(`samples/${slug}/`);
				if (slug === 'particle-field') for (let i = 0; i < 40; i++) { await page.mouse.move(width * 0.6 + Math.cos(i / 6) * 50, 420 + Math.sin(i / 6) * 50); await page.waitForTimeout(25); }
				await page.waitForTimeout(wait);
				const moving = await page.evaluate(() => document.getAnimations().some((a) => a.playState === 'running') || (window.__labLoops || []).some((l) => l.running));
				const s1 = await shot(page, `sample-${slug}`);
				const problems = await done();
				record({ ...base, check: `sample ${slug}`, pass: moving && !problems.length, note: moving ? 'animating' : 'nothing running', problems, shots: [s1] });
			}
			{
				const { page, done } = await open(`samples/${slug}/`, { reduced: true });
				await page.waitForTimeout(1500);
				const live = await page.evaluate(() => ({ anims: document.getAnimations().filter((a) => a.playState === 'running').length, loops: (window.__labLoops || []).filter((l) => l.running).length }));
				const s1 = await shot(page, `sample-${slug}-reduced`);
				const problems = await done();
				record({ ...base, check: `sample ${slug} (reduced motion)`, pass: !live.anims && !live.loops && !problems.length, note: `running: ${live.anims} animations, ${live.loops} loops`, problems, shots: [s1] });
			}
		}
		// exhibit: banner first in reading order, then reveal mode
		{
			const { page, done } = await open('exhibits/humanity/');
			await page.waitForTimeout(1200);
			const order = await page.evaluate(() => {
				const first = document.body.firstElementChild;
				const focusables = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed');
				const box = document.querySelector('.banner').getBoundingClientRect();
				return { firstIsBanner: !!first && first.matches('aside.banner'), firstFocusInBanner: !!focusables[0] && !!focusables[0].closest('.banner'), top: Math.round(box.top), height: Math.round(box.height) };
			});
			await page.keyboard.press('Tab');
			const tabbed = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.banner'));
			const s1 = await shot(page, 'exhibit-banner');
			await page.locator('.banner [data-reveal]').click();
			await page.waitForSelector('.reveal-item');
			await page.waitForTimeout(700);
			const items = await page.locator('.reveal-item').count();
			const pins = await page.locator('.pin').count();
			const s2 = await shot(page, 'exhibit-reveal');
			const problems = await done();
			const ok = order.firstIsBanner && order.firstFocusInBanner && tabbed && order.top < 40 && items === TECH.length && pins === TECH.length;
			record({ ...base, check: 'exhibit (banner first, reveal mode)', pass: ok && !problems.length, note: `banner first element ${order.firstIsBanner}, first Tab lands in banner ${tabbed}, banner top ${order.top}px; reveal ${items}/${TECH.length} items, ${pins} pins`, problems, shots: [s1, s2] });
		}
		// checker: sample answer, then the share link in a fresh page
		{
			const { page, ctx, done } = await open('honeypot/check/');
			await page.click('[data-action="example"]');
			await page.fill('#f-date', '2026-10-17');
			await page.click('button[type="submit"]');
			await page.waitForTimeout(1000);
			const rows = await page.$$eval('.outcome', (els) => Object.fromEntries(els.map((e) => [e.dataset.code, e.dataset.value])));
			const shown = Object.fromEntries(Object.entries(rows).filter(([, v]) => v !== 'ignored'));
			await page.locator('#results').scrollIntoViewIfNeeded();
			await page.waitForTimeout(500);
			const s1 = await shot(page, 'checker-result');
			const link = await page.inputValue('#share-link');
			const again = await ctx.newPage();
			await again.goto(link, { waitUntil: 'networkidle' });
			await again.waitForTimeout(700);
			const restored = await again.$$eval('.outcome', (els) => Object.fromEntries(els.map((e) => [e.dataset.code, e.dataset.value])));
			const agent = await again.inputValue('#f-agent');
			await again.locator('#results').scrollIntoViewIfNeeded();
			await again.waitForTimeout(400);
			const s2 = await shot(again, 'checker-restored');
			const problems = await done();
			const want = { 'LUMEN-R5': 'obeyed', 'ORCHID-B7': 'obeyed', 'GRANITE-S6': 'flagged' };
			const ok = JSON.stringify(shown) === JSON.stringify(want) && JSON.stringify(restored) === JSON.stringify(rows) && agent === 'Example agent';
			record({ ...base, check: 'checker (sample answer, share link restores)', pass: ok && !problems.length, note: `shown ${JSON.stringify(shown)}; restored equal ${JSON.stringify(restored) === JSON.stringify(rows)}`, problems, shots: [s1, s2] });
		}
		// scoreboard
		{
			const { page, done } = await open('honeypot/scoreboard/');
			await page.waitForTimeout(1200);
			const n = await page.locator('#board tbody tr').count();
			const s1 = await shot(page, 'scoreboard');
			const problems = await done();
			record({ ...base, check: 'scoreboard', pass: n === RESULTS.rows.length && !problems.length, note: `${n}/${RESULTS.rows.length} rows`, problems, shots: [s1] });
		}
		// hub, about, 404 (served at a nested missing path, as GitHub Pages does)
		for (const [name, path, expect404] of [['hub', 'honeypot/', false], ['about', 'honeypot/about/', false], ['404', 'no/such/page/', true]]) {
			const { page, done } = await open(path, { expect404 });
			await page.waitForTimeout(1000);
			const h1 = await page.locator('h1').first().textContent().catch(() => '');
			const s1 = await shot(page, name);
			const problems = await done();
			record({ ...base, check: name === '404' ? '404.html at /no/such/page/' : `${name} page`, pass: !!h1 && !problems.length, note: `h1 "${(h1 || '').trim().slice(0, 60)}"`, problems, shots: [s1] });
		}
	}
	await browser.close();
}
server.close();
results.finished = new Date().toISOString();
writeFileSync(join(OUT, 'results.json'), `${JSON.stringify(results, null, '\t')}\n`);
const fails = results.items.filter((i) => !i.pass);
console.log(`# ${results.items.length - fails.length}/${results.items.length} pass → evidence/laptop-check/${LABEL}/results.json`);
process.exitCode = fails.length ? 1 : 0;
