/*
 * Sample 09 — "Coral Ink Reactor".
 * A Gray-Scott reaction-diffusion simulation (gs.js) drawn as ink on the day sky. The grid is about 300 x 200
 * cells (about 110 x 215 on a phone); each frame the simulation takes a few steps, the amount of ink in each
 * cell picks a colour from a small palette (cyan halo, azure, royal, navy), and the grid is scaled up smoothly
 * onto the canvas. Hands-free: the feed and kill rates drift slowly from recipe to recipe (Coral, Worms,
 * Mitosis, Holes, Fingerprint, Rings) and a ghost brush drops a little ink now and then. Drag to paint ink.
 *
 * Written from the idea only; no source code was read or copied.
 * (The CodePen this idea comes from, "Reaction Diffusion Lab (Ink + Presets)" by Vlasov.Dev Core, blocked the
 * download with a bot check, so nothing of it was read; this is new code.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { Reactor, PRESETS } from './gs.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');
const nextBtn = document.querySelector('[data-action="next"]');
const reseedBtn = document.querySelector('[data-action="reseed"]');
const nameEl = document.querySelector('[data-preset-name]');
const fkEl = document.querySelector('[data-preset-fk]');

const REDUCED = prefersReducedMotion();
const RATE = 480; // simulation steps per second (a phone-friendly 8 per frame at 60 Hz)
const HOLD = 16; // seconds on one recipe before drifting to the next
const FADE = 7; // seconds the drift takes
const FADE_FAST = 3; // ... when you press Next
const BRUSH = 3.6; // your brush, in cells
const STILL_STEPS = 1000;

/* the grid and its canvas */
const grid = document.createElement('canvas');
const gctx = grid.getContext('2d');
let rx = null;
let img = null;
let W = 0;
let H = 0;
let DPR = 1;

/* small deterministic PRNG so the first picture is the same on every visit */
let seed = 11;
const rnd = () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* ---------- colour: the amount of ink in a cell (0 to about 0.43) picks one of 256 colours ---------- */

/* v, r, g, b, a: a thin cyan rim, azure, royal, then navy at the core of thick ink. The rise from clear to solid is
   kept short (lab-05 P5 review): the grid is upscaled smoothly, so a wide ramp read as a soft, out-of-focus edge */
const STOPS = [
	[0.0, 70, 208, 251, 0],
	[0.06, 70, 208, 251, 0],
	[0.075, 70, 208, 251, 150],
	[0.095, 77, 159, 243, 245],
	[0.13, 40, 130, 240, 255],
	[0.21, 12, 107, 237, 255],
	[0.31, 9, 70, 190, 255],
	[0.43, 8, 36, 112, 255],
];
const VMAX = 0.43;
const LUT = new Uint8ClampedArray(256 * 4);
(function buildLut() {
	for (let q = 0; q < 256; q++) {
		const v = (q / 255) * VMAX;
		let s = 1;
		while (s < STOPS.length - 1 && v > STOPS[s][0]) s++;
		const a = STOPS[s - 1];
		const b = STOPS[s];
		const f = clamp((v - a[0]) / (b[0] - a[0]), 0, 1);
		const e = f * f * (3 - 2 * f);
		for (let c = 0; c < 4; c++) LUT[q * 4 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * e;
	}
})();
const SHADE = 150; // how much the ink's edge catches light from the top left

function draw() {
	const { gw, gh, sw, v } = rx;
	const d = img.data;
	let o = 0;
	for (let y = 1; y <= gh; y++) {
		for (let i = y * sw + 1, end = y * sw + gw; i <= end; i++, o += 4) {
			let q = (v[i] * (255 / VMAX)) | 0;
			if (q > 255) q = 255;
			if (q < 0) q = 0;
			q <<= 2;
			const al = LUT[q + 3];
			if (al === 0) {
				d[o + 3] = 0;
				continue;
			}
			const sh = (v[i - sw - 1] - v[i + sw + 1]) * SHADE;
			d[o] = LUT[q] + sh;
			d[o + 1] = LUT[q + 1] + sh;
			d[o + 2] = LUT[q + 2] + sh;
			d[o + 3] = al;
		}
	}
	gctx.putImageData(img, 0, 0);
	ctx.clearRect(0, 0, W, H);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(grid, 0, 0, rx.gw, rx.gh, 0, 0, W, H);
}

/* ---------- the dish ---------- */

function layout() {
	// the picture is soft, so a pixel ratio above 1.5 buys nothing
	DPR = Math.min(1.5, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	// about 4 px per cell on a laptop, 3.2 px on a phone, never more than ~90 000 cells
	let cell = clamp(W / 300, 3.2, 6);
	if ((W / cell) * (H / cell) > 90000) cell = Math.sqrt((W * H) / 90000);
	const gw = Math.max(48, Math.round(W / cell));
	const gh = Math.max(48, Math.round(H / cell));
	if (!rx) rx = new Reactor(gw, gh);
	else rx.resample(gw, gh);
	grid.width = gw;
	grid.height = gh;
	img = gctx.createImageData(gw, gh);
}

/* scatter drops of ink: about one per 320 cells, which fills the dish in about a thousand steps */
function seedDish(count = Math.round((rx.gw * rx.gh) / 320)) {
	for (let i = 0; i < count; i++) {
		rx.drop(4 + rnd() * (rx.gw - 8), 4 + rnd() * (rx.gh - 8), 4.5 * (0.8 + rnd() * 0.5));
	}
}

/* ---------- the recipe: which (F, k) the dish is cooking, and the slow drift to the next ---------- */

let F = PRESETS[0].F;
let K = PRESETS[0].k;
let fromF = F;
let fromK = K;
let fromIdx = 0;
let toIdx = 0;
let blend = 1;
let fadeLen = FADE;
let hold = HOLD;
let shownIdx = -1;
let fkClock = 0;

function goTo(idx, seconds) {
	fromF = F;
	fromK = K;
	fromIdx = blend < 0.5 ? fromIdx : toIdx;
	toIdx = idx;
	blend = 0;
	fadeLen = seconds;
}

function recipe(dt) {
	if (blend < 1) {
		blend = Math.min(1, blend + dt / fadeLen);
		const e = blend * blend * (3 - 2 * blend);
		F = fromF + (PRESETS[toIdx].F - fromF) * e;
		K = fromK + (PRESETS[toIdx].k - fromK) * e;
		if (blend === 1) hold = HOLD;
	} else {
		hold -= dt;
		if (hold <= 0) goTo((toIdx + 1) % PRESETS.length, FADE);
	}
}

function label(force) {
	const idx = blend > 0.45 ? toIdx : fromIdx;
	if (idx !== shownIdx || force) {
		shownIdx = idx;
		nameEl.textContent = PRESETS[idx].name;
	}
	fkEl.textContent = `F ${F.toFixed(4)} · k ${K.toFixed(4)}`;
}

/* ---------- ink from you and from the ghost brush ---------- */

const ptr = { down: false, id: -1, gx: 0, gy: 0 };
let lastUser = -1e9;
let ghostNext = 1;
let clock = 0; // seconds, from the loop

function toGrid(ev) {
	const r = canvas.getBoundingClientRect();
	return [((ev.clientX - r.left) / r.width) * rx.gw + 0.5, ((ev.clientY - r.top) / r.height) * rx.gh + 0.5];
}

function stroke(x0, y0, x1, y1) {
	const dist = Math.hypot(x1 - x0, y1 - y0);
	const n = Math.max(1, Math.ceil(dist / (BRUSH * 0.6)));
	for (let s = 1; s <= n; s++) rx.drop(x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n, BRUSH);
}

canvas.addEventListener('pointerdown', (ev) => {
	if (ev.button > 0) return;
	ptr.down = true;
	ptr.id = ev.pointerId;
	canvas.setPointerCapture(ev.pointerId);
	[ptr.gx, ptr.gy] = toGrid(ev);
	rx.drop(ptr.gx, ptr.gy, BRUSH);
	lastUser = clock;
	if (!running()) draw();
});
canvas.addEventListener('pointermove', (ev) => {
	if (!ptr.down || ev.pointerId !== ptr.id) return;
	const [x, y] = toGrid(ev);
	stroke(ptr.gx, ptr.gy, x, y);
	ptr.gx = x;
	ptr.gy = y;
	lastUser = clock;
	if (!running()) draw();
});
const lift = (ev) => {
	if (ev.pointerId === ptr.id) ptr.down = false;
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);

/* idle life: a slow ghost brush wanders the dish and drops a little ink, so it grows on its own */
function ghost(t) {
	if (ptr.down || t - lastUser < 5 || t < ghostNext) return;
	ghostNext = t + 0.45;
	const px = 0.5 + 0.4 * Math.sin(t * 0.11 + 0.8) + 0.07 * Math.sin(t * 0.37);
	const py = 0.5 + 0.38 * Math.sin(t * 0.15 + 2.1) + 0.07 * Math.sin(t * 0.31);
	rx.drop(px * rx.gw, py * rx.gh, 2.6);
}

/* ---------- running ---------- */

let ctl = null;
const running = () => !!ctl && ctl.running;
let msStep = 0.3;
let maxSteps = 12;
let frames = 0;

function tick(dt, t) {
	clock = t;
	recipe(dt);
	ghost(t);
	const n = clamp(Math.round(RATE * dt), 2, maxSteps);
	const t0 = performance.now();
	rx.step(n, F, K);
	// keep the simulation inside about 9 ms a frame on any device
	msStep += ((performance.now() - t0) / n - msStep) * 0.1;
	maxSteps = clamp(Math.floor(9 / Math.max(msStep, 0.02)), 2, 14);
	// the dish can run dry while the recipe drifts: add a few drops
	if (++frames % 30 === 0 && rx.ink() < 0.012) seedDish(14);
	if (blend < 1 || frames % 30 === 0) {
		fkClock += dt;
		if (fkClock > 0.12) {
			fkClock = 0;
			label(false);
		}
	}
	draw();
}

/* the reduced-motion still: a grown, finished pattern, drawn once, nothing looping */
function stillFrame(idx) {
	toIdx = fromIdx = idx;
	blend = 1;
	F = fromF = PRESETS[idx].F;
	K = fromK = PRESETS[idx].k;
	rx.clear();
	seedDish();
	rx.step(STILL_STEPS, F, K);
	label(true);
	draw();
}

function start() {
	layout();
	let timer = 0;
	if (REDUCED) {
		stillFrame(0);
		// the controls jump straight to a finished state
		pauseBtn.disabled = true;
		pauseBtn.setAttribute('aria-disabled', 'true');
		nextBtn.addEventListener('click', () => stillFrame((toIdx + 1) % PRESETS.length));
		reseedBtn.addEventListener('click', () => stillFrame(toIdx));
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => { layout(); draw(); }, 150);
		});
		return;
	}
	// a short head start, so the first picture already has ink in it
	seedDish();
	rx.step(360, F, K);
	label(true);
	draw();

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'coral-ink' });

	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); draw(); }, 150);
	});

	nextBtn.addEventListener('click', () => {
		goTo((toIdx + 1) % PRESETS.length, FADE_FAST);
		hold = HOLD;
		label(false);
	});
	reseedBtn.addEventListener('click', () => {
		rx.clear();
		seedDish();
		rx.step(120, F, K);
		if (!running()) draw();
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
