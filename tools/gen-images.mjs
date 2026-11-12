/*
 * The only sanctioned way to generate new images for the lab (brief v2 §2).
 *
 *   node tools/gen-images.mjs --provider openai|gemini --name lab-bg-foo --aspect 16:9 --prompt "…" [--model …] [--dry-run]
 *   node tools/gen-images.mjs --batch requests.json        (an array of {provider, name, aspect, prompt, model?})
 *
 * Hard caps, enforced in code before every call:
 *   - at most 40 calls in total, counting failures, moderation blocks and redos
 *   - at most US$10 of estimated spend, from the price table below
 * Every call appends one line to assets/LEDGER.jsonl. A call that crashed mid-flight is
 * counted on the next run (assets/.gen-pending.json). There are no automatic retries, and a
 * moderation block ends that image: do not reword around it.
 * Keys come from the environment only (OPENAI_API_KEY, GEMINI_API_KEY) and are never printed.
 * LAB_IMAGEGEN_FAKE=1 swaps the network call for a stub (used by the tests).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = process.env.LAB_IMAGEGEN_LEDGER || join(ROOT, 'assets', 'LEDGER.jsonl');
const PENDING = `${LEDGER}.pending`;
const OUT_DIR = process.env.LAB_IMAGEGEN_OUT || join(ROOT, 'assets', 'generated');
export const MAX_CALLS = 40;
export const MAX_SPEND_USD = 10;

/*
 * Price table, recorded 2026-10-16 (phase 0) from the providers' pricing pages:
 *   https://developers.openai.com/api/docs/pricing  and the image-generation guide's cost table
 *   https://ai.google.dev/gemini-api/docs/pricing
 * Each estimate is the highest listed per-image tier for that model, rounded up to cover prompt tokens.
 *   OpenAI GPT Image 2.5 (both models): $30 / 1M image output tokens; highest listed per-image cost $0.211
 *     (high quality, 1024×1024). This script never asks for more than quality "high".
 *   Gemini 3 Pro Image: $0.134 per 1K/2K image, $0.24 per 4K image.
 *   Gemini 3.1 Flash Image: $0.067 1K, $0.101 2K, $0.151 4K.
 *   Gemini Nano Banana 2.1: $0.0336 1K, $0.0504 2K, $0.113 4K.
 */
export const PRICES = {
	'openai:gpt-image-2.5-flare': 0.25,
	'openai:gpt-image-2.5-sunburst': 0.25,
	'gemini:gemini-3-pro-image': 0.25,
	'gemini:gemini-3.1-flash-image': 0.16,
	'gemini:gemini-nano-banana-2.1': 0.12,
};
const DEFAULT_MODEL = { openai: 'gpt-image-2.5-flare', gemini: 'gemini-3-pro-image' };
const OPENAI_SIZE = { '16:9': '1536x864', '9:16': '864x1536', '1:1': '1024x1024', '4:3': '1024x768', '3:4': '768x1024' };

export function readLedger(path = LEDGER) {
	if (!existsSync(path)) return [];
	return readFileSync(path, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

export function totals(rows) {
	const calls = rows.filter((r) => r.kind === 'api-call');
	return { calls: calls.length, spend: calls.reduce((s, r) => s + (Number(r.est_cost_usd) || 0), 0) };
}

/* refuse before spending: returns a reason string, or '' when the call may go ahead */
export function capCheck(rows, price) {
	const t = totals(rows);
	if (t.calls + 1 > MAX_CALLS) return `call cap reached: ${t.calls}/${MAX_CALLS} calls already made`;
	if (t.spend + price > MAX_SPEND_USD + 1e-9) return `spend cap: $${t.spend.toFixed(2)} spent + $${price.toFixed(2)} would pass $${MAX_SPEND_USD}`;
	return '';
}

function append(row) {
	mkdirSync(dirname(LEDGER), { recursive: true });
	appendFileSync(LEDGER, `${JSON.stringify(row)}\n`);
}

/* a call that crashed after it was sent still counts */
function settlePending() {
	if (!existsSync(PENDING)) return;
	const p = JSON.parse(readFileSync(PENDING, 'utf8'));
	append({ ...p, outcome: 'unknown (process ended mid-call)', counted_on: new Date().toISOString() });
	rmSync(PENDING);
}

function findImage(node) {
	// Gemini interactions: find the last {mime_type: image/*, data: base64} block anywhere in the response
	let found = null;
	const walk = (n) => {
		if (!n || typeof n !== 'object') return;
		const mime = n.mime_type || n.mimeType;
		if (typeof n.data === 'string' && typeof mime === 'string' && mime.startsWith('image/')) found = n;
		Object.values(n).forEach(walk);
	};
	walk(node);
	return found;
}

async function callProvider({ provider, model, prompt, aspect }) {
	if (process.env.LAB_IMAGEGEN_FAKE === '1') {
		const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
		return { bytes: png, ext: 'png' };
	}
	if (provider === 'openai') {
		const key = process.env.OPENAI_API_KEY;
		if (!key) throw Object.assign(new Error('OPENAI_API_KEY is not set'), { noCall: true });
		const res = await fetch('https://api.openai.com/v1/images/generations', {
			method: 'POST',
			headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ model, prompt, n: 1, size: OPENAI_SIZE[aspect] || '1024x1024', quality: 'high' }),
		});
		const body = await res.json().catch(() => ({}));
		if (!res.ok) throw Object.assign(new Error(body?.error?.message || `HTTP ${res.status}`), { blocked: body?.error?.code === 'moderation_blocked' || /safety|moderation/i.test(body?.error?.message || '') });
		return { bytes: Buffer.from(body.data[0].b64_json, 'base64'), ext: 'png', usage: body.usage };
	}
	if (provider === 'gemini') {
		const key = process.env.GEMINI_API_KEY;
		if (!key) throw Object.assign(new Error('GEMINI_API_KEY is not set'), { noCall: true });
		const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
			method: 'POST',
			headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
			body: JSON.stringify({ model, input: prompt, response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: aspect, image_size: '2K' } }),
		});
		const body = await res.json().catch(() => ({}));
		if (!res.ok) throw Object.assign(new Error(body?.error?.message || `HTTP ${res.status}`), { blocked: /safety|block|prohibited/i.test(body?.error?.message || '') });
		const img = findImage(body);
		if (!img) throw Object.assign(new Error('no image in the response (possibly blocked)'), { blocked: true });
		return { bytes: Buffer.from(img.data, 'base64'), ext: (img.mime_type || img.mimeType).split('/')[1] || 'png' };
	}
	throw Object.assign(new Error(`unknown provider ${provider}`), { noCall: true });
}

export async function generate(req, { dryRun = false } = {}) {
	settlePending();
	const provider = req.provider;
	const model = req.model || DEFAULT_MODEL[provider];
	const price = PRICES[`${provider}:${model}`];
	if (price === undefined) return { ok: false, reason: `no price recorded for ${provider}:${model}; add it to PRICES from the pricing page first` };
	if (!/^[a-z0-9-]+$/.test(req.name || '')) return { ok: false, reason: 'name must be lower-case letters, digits and dashes' };
	const refusal = capCheck(readLedger(), price);
	if (refusal) return { ok: false, reason: refusal };
	if (dryRun) return { ok: true, dryRun: true, provider, model, price };

	const file = join(OUT_DIR, `${req.name}`);
	const base = { kind: 'api-call', date: new Date().toISOString(), provider, model, name: req.name, aspect: req.aspect, prompt: req.prompt, est_cost_usd: price };
	mkdirSync(dirname(PENDING), { recursive: true });
	writeFileSync(PENDING, JSON.stringify(base));
	try {
		const out = await callProvider({ provider, model, prompt: req.prompt, aspect: req.aspect });
		mkdirSync(OUT_DIR, { recursive: true });
		const path = `${file}.${out.ext}`;
		writeFileSync(path, out.bytes);
		append({ ...base, file: path.replace(`${ROOT}/`, ''), outcome: 'ok', usage: out.usage || null });
		return { ok: true, file: path };
	} catch (err) {
		if (err.noCall) {
			rmSync(PENDING, { force: true });
			return { ok: false, reason: err.message };
		}
		append({ ...base, file: null, outcome: err.blocked ? 'blocked' : 'error', error: String(err.message).slice(0, 300) });
		return { ok: false, reason: err.blocked ? `blocked by the provider: ${err.message} (do not reword around it)` : err.message };
	} finally {
		rmSync(PENDING, { force: true });
	}
}

function args(argv) {
	const a = {};
	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith('--')) {
			const k = argv[i].slice(2);
			a[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
		}
	}
	return a;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const a = args(process.argv.slice(2));
	const list = a.batch ? JSON.parse(readFileSync(a.batch, 'utf8')) : [{ provider: a.provider, model: a.model, name: a.name, aspect: a.aspect || '16:9', prompt: a.prompt }];
	let failed = 0;
	for (const req of list) {
		const r = await generate(req, { dryRun: Boolean(a['dry-run']) });
		const t = totals(readLedger());
		console.log(`${req.name}: ${r.ok ? (r.dryRun ? `would call ${r.provider}:${r.model} ($${r.price})` : `saved ${r.file}`) : `REFUSED/FAILED: ${r.reason}`}  [${t.calls}/${MAX_CALLS} calls, $${t.spend.toFixed(2)}/$${MAX_SPEND_USD}]`);
		if (!r.ok) failed++;
		if (!r.ok && /cap/.test(r.reason)) break;
	}
	process.exitCode = failed ? 2 : 0;
}
