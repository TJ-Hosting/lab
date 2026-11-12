/*
 * tools/check-sample.mjs <slug> [--no-perf] [--no-firefox] [--firefox-only]   (lab-05)
 *
 * Checks one sample the way the lead gates it, and writes the evidence to evidence/lab-05/samples/<slug>/:
 * - static: the CSP is the base policy plus only the allowed additions; nothing loads from another host;
 *   no technique code, tag characters, cookies, storage or analytics in anything the page loads; no file
 *   or folder in the sample starting with "_" or "." (GitHub Pages' Jekyll drops them); no raster image
 *   in the sample folder (images ship through img/); a licence line in each script's header.
 * - Chromium and Firefox at 1440 and 375: console errors, failed or third-party requests, horizontal
 *   overflow; a screenshot each (JPEG, at most 300 KB, overwritten in place).
 * - the reduced-motion still (nothing running: no CSS or WAAPI animation, no loop(), no requestAnimationFrame);
 *   the hidden-tab pause (the same, while document.hidden) and the resume;
 * - the shell's text contrast by polarity (tests/contrast.mjs) at both widths;
 * - Chromium only, unless --no-perf: the median frame time over 5 s at 1440, with the WebGL renderer
 *   (UNMASKED_RENDERER_WEBGL). Chromium starts with ANGLE on D3D11 and the GPU; if WebGL is still software
 *   it retries headed, and if it stays software the frame time is recorded as not measured.
 * Exit 0 = PASS. Firefox that cannot start (lab-05: Claude Code's sandbox) is reported, not failed.
 * --firefox-only runs just the Firefox checks and writes check-firefox.md/.json, leaving the Chromium record alone.
 * LAB_FIREFOX=<path to firefox.exe> starts that Firefox build instead of Playwright's own (on ACO-PC its install folder
 * fails with a Windows side-by-side error for mozglue, while a copy of the same files elsewhere starts).
 */
import { chromium, firefox } from 'playwright';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../tests/serve.mjs';
import { targets, measure, SHELL_REQUIRED, SHELL_OPTIONAL } from '../tests/contrast.mjs';
import { GA4_FILE, GA4_CSP, GA4_HOST, stubGa4 } from '../tests/ga4.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const NO_PERF = args.includes('--no-perf');
const NO_FIREFOX = args.includes('--no-firefox');
const FIREFOX_ONLY = args.includes('--firefox-only');
const FIREFOX_PATH = process.env.LAB_FIREFOX || undefined;
if (!slug || !/^[a-z0-9-]+$/.test(slug) || !existsSync(join(ROOT, 'samples', slug, 'index.html'))) {
	console.error('usage: node tools/check-sample.mjs <slug> [--no-perf] [--no-firefox] [--firefox-only]   (samples/<slug>/index.html must exist)');
	process.exit(2);
}
const OUT = join(ROOT, 'evidence', 'lab-05', 'samples', slug);
mkdirSync(OUT, { recursive: true });
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const fails = [];
const warns = [];
const notes = [];
const fail = (m) => { fails.push(m); console.log(`  FAIL ${m}`); };
const warn = (m) => { warns.push(m); console.log(`  warn ${m}`); };
const note = (m) => { notes.push(m); console.log(`  ${m}`); };

/* ---------- static ---------- */

const PAGE = `samples/${slug}/index.html`;
const html = read(PAGE);
const BASE_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
const ALLOWED_EXTRA = { 'script-src': ["'wasm-unsafe-eval'"], 'img-src': ['blob:'], 'worker-src': ["'self'", 'blob:'] };
const parseCsp = (s) => Object.fromEntries(s.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const [k, ...v] = d.split(/\s+/); return [k, v]; }));
const cspMeta = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1];
const cspExtra = {};
if (!cspMeta) fail('CSP: no Content-Security-Policy meta');
else {
	const base = parseCsp(BASE_CSP);
	for (const [d, toks] of Object.entries(GA4_CSP)) base[d] = [...(base[d] || []), ...toks];
	const got = parseCsp(cspMeta);
	for (const k of Object.keys(base)) if (!got[k]) fail(`CSP: ${k} missing`);
	for (const [k, v] of Object.entries(got)) {
		const extra = v.filter((t) => !(base[k] || []).includes(t));
		const removed = (base[k] || []).filter((t) => !v.includes(t));
		if (removed.length) fail(`CSP: ${k} lost ${removed.join(' ')}`);
		if (!extra.length) continue;
		const bad = extra.filter((t) => !(ALLOWED_EXTRA[k] || []).includes(t));
		if (bad.length) fail(`CSP: ${k} adds ${bad.join(' ')} (only 'wasm-unsafe-eval' in script-src and blob: in img-src/worker-src are allowed)`);
		cspExtra[k] = extra;
	}
	if (/script-src[^;]*'unsafe-(inline|eval)'/.test(cspMeta)) fail("CSP: 'unsafe-inline' or 'unsafe-eval' in script-src");
	if (Object.keys(cspExtra).length) note(`CSP additions: ${JSON.stringify(cspExtra)}`);
}
for (const m of html.matchAll(/<(?:script|link|img|source|iframe|video|audio)[^>]+(?:src|href|srcset)="(https?:)?\/\/[^"]+"/g)) {
	if (/rel="canonical"|og:|href="https:\/\/(?:github\.com|tj-hosting\.ca)/.test(m[0])) continue;
	fail(`external resource in the HTML: ${m[0].slice(0, 120)}`);
}
if (/<script(?![^>]*\bsrc=)[^>]*>\s*\S/.test(html)) fail('inline <script> (blocked by script-src \'self\')');

/* the files the page loads: the HTML, its stylesheets and scripts, and their imports */
function pageFiles(htmlPath) {
	const files = new Set([htmlPath]);
	const queue = [htmlPath];
	while (queue.length) {
		const f = queue.shift();
		const src = read(f);
		const refs = [];
		if (f.endsWith('.html')) for (const m of src.matchAll(/<(?:link[^>]+rel="stylesheet"[^>]+href|script[^>]+src)="([^"]+)"/g)) refs.push(m[1]);
		else if (/\.m?js$/.test(f)) for (const m of src.matchAll(/\b(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|\bimport\s*['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) refs.push(m[1] || m[2] || m[3]);
		for (const r of refs) {
			if (/^[a-z]+:/i.test(r)) continue;
			const p = normalize(r.startsWith('/') ? r.slice(1) : join(dirname(f), r));
			if (!files.has(p) && existsSync(join(ROOT, p))) { files.add(p); queue.push(p); }
		}
	}
	return [...files];
}
const files = pageFiles(PAGE);
const CODES = JSON.parse(read('honeypot/techniques.json')).techniques.map((t) => t.code);
const decodeTags = (s) => s.replace(/[\u{E0020}-\u{E007E}]/gu, (c) => String.fromCharCode(c.codePointAt(0) - 0xe0000));
for (const f of files) {
	const raw = read(f);
	const text = decodeTags(raw);
	CODES.forEach((c) => { if (text.includes(c)) fail(`trap code ${c} in ${f}`); });
	if (/[\u{E0020}-\u{E007E}]/u.test(raw)) fail(`tag characters in ${f}`);
	if (/google-analytics|googletagmanager|plausible|document\.cookie|localStorage|sessionStorage|indexedDB/i.test(raw.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '')) && !f.startsWith('vendor') && f.replace(/\\/g, '/') !== GA4_FILE) fail(`tracking or storage in ${f}`);
}
note(`loads ${files.length} local files: ${files.map((f) => f.replace(/\\/g, '/')).join(', ')}`);
const walk = (d) => readdirSync(join(ROOT, d)).flatMap((f) => (statSync(join(ROOT, d, f)).isDirectory() ? [`${d}/${f}/`, ...walk(`${d}/${f}`)] : [`${d}/${f}`]));
for (const f of walk(`samples/${slug}`)) {
	if (f.split('/').some((seg) => /^[_.]/.test(seg))) fail(`path segment starting with _ or .: ${f}`);
	if (/\.(png|jpe?g|webp|avif|gif)$/i.test(f)) fail(`raster image in the sample folder (images ship through img/): ${f}`);
	if (/\.m?js$/.test(f) && !/licen[cs]e|\bMIT\b|Apache|\bISC\b|\bBSD\b|Unlicense|CC0|from the idea|no source code|written from scratch|new code/i.test(read(f).slice(0, 2500))) warn(`no licence or provenance line in the header of ${f}`);
}

/* ---------- browsers ---------- */

const { server, base } = await serve(ROOT);
const baseHost = new URL(base).host;
const URL_ = `${base}samples/${slug}/`;
const SOFTWARE = /swiftshader|llvmpipe|basic render|microsoft basic|software/i;
const GPU_ARGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
const COUNTER = () => {
	// counts requestAnimationFrame callbacks, so a library loop that ignores the pause is seen
	const raf = window.requestAnimationFrame.bind(window);
	window.__rafCount = 0;
	window.requestAnimationFrame = (cb) => raf((t) => { window.__rafCount++; cb(t); });
};

async function shotJpeg(page, name) {
	let buf;
	for (const quality of [80, 68, 55, 42]) {
		buf = await page.screenshot({ type: 'jpeg', quality });
		if (buf.length <= 300 * 1024) break;
	}
	writeFileSync(join(OUT, `${name}.jpg`), buf);
	return buf;
}

async function open(browser, { width = 1440, height = 900, reduced = false } = {}) {
	const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
	await stubGa4(ctx);
	await ctx.addInitScript(COUNTER);
	const page = await ctx.newPage();
	const problems = [];
	page.on('pageerror', (e) => problems.push(`pageerror: ${e.message.split('\n')[0]}`));
	page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 200)}`); });
	page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText || ''}`));
	page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
	page.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.host !== baseHost && !GA4_HOST.test(u.hostname)) problems.push(`third-party request: ${r.url()}`); });
	await page.goto(URL_, { waitUntil: 'load' });
	await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
	return { page, ctx, problems };
}
const live = (page) => page.evaluate(() => ({
	raf: window.__rafCount || 0,
	anims: document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName || a.id || (a.effect?.target?.className?.baseVal ?? a.effect?.target?.className) || 'waapi').slice(0, 6),
	loops: (window.__labLoops || []).filter((l) => l.running).map((l) => l.name),
}));
const hide = (page, hidden) => page.evaluate((h) => {
	Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
	Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
	document.dispatchEvent(new Event('visibilitychange'));
}, hidden);

async function rendererOf(browser) {
	const ctx = await browser.newContext();
	await stubGa4(ctx);
	const page = await ctx.newPage();
	await page.goto(`${base}404.html`);
	const r = await page.evaluate(() => {
		const g = document.createElement('canvas').getContext('webgl');
		if (!g) return 'no WebGL';
		const e = g.getExtension('WEBGL_debug_renderer_info');
		return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
	}).catch((e) => `error: ${e.message}`);
	await ctx.close();
	return r;
}

async function checkBrowser(label, browser, { perf }) {
	console.log(`# ${label}`);
	const result = { label, widths: {}, reduced: null, pause: null, contrast: [], frame: null };
	// 1. load at both widths
	for (const width of [1440, 375]) {
		const { page, ctx, problems } = await open(browser, { width, height: width === 375 ? 812 : 900 });
		await page.waitForTimeout(2500);
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		await shotJpeg(page, `${label}-${width}`);
		if (problems.length) fail(`${label}@${width}: ${[...new Set(problems)].join(' | ')}`);
		if (overflow > 0) fail(`${label}@${width}: horizontal overflow ${overflow}px`);
		result.widths[width] = { problems: [...new Set(problems)], overflow };
		await ctx.close();
	}
	// 2. reduced motion: a still, nothing running
	{
		const { page, ctx, problems } = await open(browser, { reduced: true });
		await page.waitForTimeout(1500);
		const a = await live(page);
		await page.waitForTimeout(1000);
		const b = await live(page);
		await shotJpeg(page, `${label === 'chromium' ? 'reduced' : `${label}-reduced`}-1440`);
		const rafs = b.raf - a.raf;
		result.reduced = { anims: b.anims, loops: b.loops, rafPerSecond: rafs };
		if (b.anims.length || b.loops.length || rafs > 2) fail(`${label} reduced motion: still moving (animations ${JSON.stringify(b.anims)}, loops ${JSON.stringify(b.loops)}, ${rafs} rAF callbacks in 1 s)`);
		if (problems.length) fail(`${label} reduced motion: ${[...new Set(problems)].join(' | ')}`);
		await ctx.close();
	}
	// 3. hidden tab: everything stops, then resumes
	{
		const { page, ctx } = await open(browser);
		await page.waitForTimeout(1500);
		const a = await live(page);
		await page.waitForTimeout(600);
		const b = await live(page);
		const moving = b.raf - a.raf > 2 || b.anims.length > 0 || b.loops.length > 0;
		await hide(page, true);
		await page.waitForTimeout(400);
		const c = await live(page);
		await page.waitForTimeout(1500);
		const d = await live(page);
		const hiddenRaf = d.raf - c.raf;
		await hide(page, false);
		await page.waitForTimeout(900);
		const e = await live(page);
		await page.waitForTimeout(600);
		const f = await live(page);
		const resumed = f.raf - e.raf > 2 || f.anims.length > 0 || f.loops.length > 0;
		result.pause = { movingBefore: moving, hiddenRafIn1500ms: hiddenRaf, hiddenAnims: d.anims, hiddenLoops: d.loops, resumed };
		if (hiddenRaf > 1 || d.anims.length || d.loops.length) fail(`${label} hidden tab: still moving (${hiddenRaf} rAF callbacks in 1.5 s, animations ${JSON.stringify(d.anims)}, loops ${JSON.stringify(d.loops)})`);
		if (moving && !resumed) fail(`${label} hidden tab: did not resume`);
		if (!moving) warn(`${label}: nothing moves at rest without input (no idle life)`);
		await ctx.close();
	}
	// 4. the shell's text contrast at both widths
	for (const width of [1440, 375]) {
		const { page, ctx } = await open(browser, { width, height: width === 375 ? 812 : 900 });
		await page.waitForTimeout(1800);
		const list = await targets(page, [...SHELL_REQUIRED, ...SHELL_OPTIONAL]);
		const rows = (await measure(page, list)).map((r) => ({ width, ...r }));
		result.contrast.push(...rows);
		for (const sel of SHELL_REQUIRED) if (!rows.some((r) => r.selector === sel)) fail(`${label}@${width} contrast: ${sel} never measured (covered or off screen)`);
		rows.filter((r) => !r.pass).forEach((r) => fail(`${label}@${width} contrast: ${r.selector}#${r.index} ${r.ratio}:1 < ${r.need} (${r.text} on ${r.worstBehind})`));
		await ctx.close();
	}
	// 5. frame time (Chromium)
	if (perf) {
		const { page, ctx } = await open(browser);
		await page.waitForTimeout(2000);
		const deltas = await page.evaluate(() => new Promise((resolve) => {
			const ts = [];
			const f = (t) => { ts.push(t); if (t - ts[0] < 5000) requestAnimationFrame(f); else resolve(ts.slice(1).map((v, i) => v - ts[i])); };
			requestAnimationFrame(f);
		}));
		const sorted = [...deltas].sort((x, y) => x - y);
		const median = sorted[Math.floor(sorted.length / 2)];
		const p95 = sorted[Math.floor(sorted.length * 0.95)];
		result.frame = { median: Math.round(median * 10) / 10, p95: Math.round(p95 * 10) / 10, frames: deltas.length };
		await ctx.close();
	}
	return result;
}

const report = { slug, when: new Date().toISOString(), cspExtra, renderer: null, gl: null, chromium: null, firefox: null };
if (!FIREFOX_ONLY) {
	let browser = await chromium.launch({ args: GPU_ARGS });
	report.renderer = await rendererOf(browser);
	if (SOFTWARE.test(report.renderer)) {
		await browser.close();
		browser = await chromium.launch({ args: GPU_ARGS, headless: false });
		report.renderer = `${await rendererOf(browser)} (headed retry)`;
	}
	report.gl = SOFTWARE.test(report.renderer) || /no WebGL|error/.test(report.renderer) ? 'software' : 'gpu';
	note(`Chromium ${browser.version()}, WebGL renderer: ${report.renderer}`);
	report.chromium = await checkBrowser('chromium', browser, { perf: !NO_PERF });
	if (report.chromium.frame) {
		const { median, p95 } = report.chromium.frame;
		if (report.gl === 'software') note(`frame time not measured (software GL): median ${median} ms recorded for reference`);
		else if (median > 20) fail(`frame time: median ${median} ms > 20 ms at 1440 (p95 ${p95})`);
		else note(`frame time: median ${median} ms, p95 ${p95} ms at 1440`);
	}
	await browser.close();
}

if (!NO_FIREFOX || FIREFOX_ONLY) {
	let ff = null;
	try {
		ff = await firefox.launch(FIREFOX_PATH ? { executablePath: FIREFOX_PATH } : {});
	} catch (e) {
		report.firefox = { unavailable: e.message.split('\n')[0] };
		if (FIREFOX_ONLY) fail(`Firefox did not start (${report.firefox.unavailable})`);
		else note(`Firefox: not run (${report.firefox.unavailable})`);
	}
	if (ff) {
		note(`Firefox ${ff.version()}`);
		report.firefox = await checkBrowser('firefox', ff, { perf: false });
		await ff.close();
	}
}

/* one contact sheet for the lead: the screenshots side by side (not committed) */
{
	const b = await chromium.launch();
	const page = await b.newPage({ viewport: { width: 1540, height: 600 }, deviceScaleFactor: 1 });
	const img = (n) => (existsSync(join(OUT, `${n}.jpg`)) ? `data:image/jpeg;base64,${readFileSync(join(OUT, `${n}.jpg`)).toString('base64')}` : '');
	const cells = ['chromium-1440', 'reduced-1440', 'chromium-375', 'firefox-1440', 'firefox-375'].filter((n) => img(n));
	await page.setContent(`<body style="margin:0;background:#0e1526;font:600 14px sans-serif;color:#fff;display:flex;gap:10px;padding:10px;align-items:flex-start;flex-wrap:wrap">${cells.map((n) => `<figure style="margin:0"><img src="${img(n)}" style="height:${n.endsWith('375') ? 560 : 420}px;display:block"><figcaption>${n}</figcaption></figure>`).join('')}</body>`);
	const buf = await page.screenshot({ type: 'jpeg', quality: 72, fullPage: true });
	writeFileSync(join(OUT, 'sheet.jpg'), buf);
	await b.close();
}
server.close();

const status = fails.length ? 'FAIL' : 'PASS';
report.status = status;
report.fails = fails;
report.warns = warns;
report.notes = notes;
const main = FIREFOX_ONLY ? report.firefox : report.chromium; // the browser this record is about
const NAME = FIREFOX_ONLY ? 'check-firefox' : 'check';
writeFileSync(join(OUT, `${NAME}.json`), `${JSON.stringify(report, null, '\t')}\n`);
const md = [
	`# check-sample: ${slug} — ${status}`,
	'',
	FIREFOX_ONLY
		? `${report.when} · Firefox only${report.firefox?.unavailable ? `: did not start (${report.firefox.unavailable})` : ''} (the Chromium record is check.md)`
		: `${report.when} · Chromium WebGL: ${report.renderer} · Firefox: ${report.firefox?.unavailable ? `not run (${report.firefox.unavailable})` : 'run'}`,
	'',
	...(fails.length ? ['## Failures', ...fails.map((f) => `- ${f}`), ''] : []),
	...(warns.length ? ['## Warnings', ...warns.map((w) => `- ${w}`), ''] : []),
	'## Notes',
	...notes.map((n) => `- ${n}`),
	'',
	'## Motion',
	`- reduced motion: ${JSON.stringify(main?.reduced ?? null)}`,
	`- hidden tab: ${JSON.stringify(main?.pause ?? null)}`,
	`- frame time: ${main?.frame ? `${JSON.stringify(main.frame)} (${report.gl} GL)` : FIREFOX_ONLY ? 'not measured in Firefox' : 'not measured (--no-perf)'}`,
	'',
	`## Shell contrast (${FIREFOX_ONLY ? 'Firefox' : 'Chromium'})`,
	'width | selector | # | polarity | text | worst behind | ratio | need',
	'---|---|---|---|---|---|---|---',
	...(main?.contrast ?? []).map((r) => `${r.width} | ${r.selector} | ${r.index} | ${r.polarity} | ${r.text} | ${r.worstBehind} | ${r.ratio.toFixed(2)} | ${r.need}`),
	'',
	FIREFOX_ONLY ? 'Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.' : 'Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).',
];
writeFileSync(join(OUT, `${NAME}.md`), `${md.join('\n')}\n`);
console.log(`${status} ${slug}${FIREFOX_ONLY ? ' (Firefox)' : ''}: ${fails.length} failures, ${warns.length} warnings → evidence/lab-05/samples/${slug}/${NAME}.md`);
process.exitCode = fails.length ? 1 : 0;
