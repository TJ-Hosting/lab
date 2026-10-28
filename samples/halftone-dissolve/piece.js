/*
 * Sample 28 — "Halftone dissolve".
 * A blue photograph is cut into square tiles on one Canvas 2D. Where a pointer passes, the tiles break into halftone
 * dots (royal, azure and cyan on a pale ground, the dot size following the tile's brightness) and then slowly heal
 * back into the photo. The brush follows the pointer through GSAP's quickTo, and its width grows with how far the
 * eased brush lags behind the raw pointer, so a fast sweep leaves a wide trail. A click or tap swaps the lake for a
 * glass facade: a dissolve front sweeps out from the click, each tile changes picture while it is dots, and the new
 * picture heals in behind the front. A ghost pointer wanders when nobody is touching it.
 * The photo tiles come from two cached canvases, the dots from a cached atlas (18 sizes x 8 colours), and only the
 * tiles that are dissolving (or have just healed) are redrawn each frame.
 *
 * GSAP runs its own requestAnimationFrame loop. Here that loop is put to sleep at once (gsap.ticker.sleep()) and
 * stepped by hand (gsap.ticker.tick()) from inside the lab's loop(), after the quickTo values are set. So GSAP never
 * requests a frame of its own: nothing runs off-screen, in a hidden tab, on Pause or under reduced motion.
 *
 * Adapted from "Canvas Grid Mouse Effect" by Tom Miller (creativeocean), https://codepen.io/creativeocean/pen/emBOove,
 * MIT (a public CodePen pen). The notice below is the licence text CodePen publishes at
 * https://blog.codepen.io/docs/licensing/ for public pens.
 *
 * Copyright (c) 2026 - Tom Miller (creativeocean) - https://codepen.io/creativeocean/pen/emBOove
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * What is kept from the pen: one canvas cut into a grid of tiles; the pointer eased with gsap.quickTo (x, y and a
 * size value, "expo" and "power2"); the size value taken from the distance between the eased and the raw pointer,
 * so speed widens the effect; each tile's strength falling off with its distance from the pointer.
 * What changed: the tiles no longer magnify the photo, they dissolve into halftone dots and heal back over about
 * three seconds (a per-tile state, so the trail has a memory); the brush covers the segment it moved since the last
 * frame; the photo is two cached canvases and the dots a cached atlas, with dirty-tile redraws instead of drawing the
 * whole grid every frame; two pictures swap on a click with a dissolve front; the ghost pointer, the touch drag and
 * the reduced-motion still are new; GSAP's own ticker is slept and stepped from loop(); Tweakpane, the Unsplash
 * pictures and the logo image are gone, and only a radius and an ease setting are kept; pointer events replace mousemove.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { gsap } from '../../vendor/gsap@3.13.0/index.js';

/* GSAP woke its ticker when it loaded. Stop it before the browser can run a frame: loop() steps it by hand below. */
gsap.ticker.sleep();

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const panel = document.querySelector('.sample-info');
const pics = [document.querySelector('.art--lake'), document.querySelector('.art--facade')];
const imgs = pics.map((p) => p.querySelector('img'));
const swapBtn = document.querySelector('[data-action="swap"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const radiusIn = document.querySelector('input[name="radius"]');
const easeIn = document.querySelector('input[name="ease"]');

const REDUCED = prefersReducedMotion();

/* ---------- the look and the feel ---------- */
const FOCUS = [0.5, 0.68]; // where each picture is anchored when the window crops it (the same as piece.css)
const LABELS = [
	'A blue mountain lake at sunrise. Where a pointer or finger passes, the photo breaks into cyan and royal blue halftone dots on a pale ground, wider the faster you move, and the dots slowly heal back into the photo. A ghost pointer does this on its own when you are idle. Clicking or tapping swaps it for a glass facade, with the dissolve sweeping across.',
	'A blue glass office facade at dusk. Where a pointer or finger passes, the photo breaks into cyan and royal blue halftone dots on a pale ground, wider the faster you move, and the dots slowly heal back into the photo. A ghost pointer does this on its own when you are idle. Clicking or tapping swaps it for the lake, with the dissolve sweeping across.'
];
const RAMP = ['#0a2a72', '#0a3fa6', '#0b52c9', '#0c6bed', '#2b86f0', '#4d9ff3', '#46b4f8', '#46d0fb']; // dark ink to light ink: navy, royal, azure, cyan
const SIZES = 18; // dot sizes in the atlas
const GROUND = '#e9f4fc'; // the pale ground the dots sit on (between DS v9's sky stops)
const HEAL = 3.4; // seconds for a dissolved tile to come back
const HOLD = 0.5; // at this strength and above, the photo is fully faded out
const WAVE_S = 1.5; // the swap front's run
const IDLE_MS = 2600; // the ghost steps in after this long without a real pointer
const FIRST_GHOST_MS = 450; // ... and after this long on a fresh page
const AUTO_FIRST = 10; // the ghost swaps the picture after this many seconds of ghost time, then every AUTO_EVERY
const AUTO_EVERY = 15;
const SPEED_K = 0.75; // how much trail width one pixel of brush lag adds

/* ---------- small helpers ---------- */
const clamp01 = gsap.utils.clamp(0, 1);
const smooth = (a, b, x) => {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
};
const waveEase = gsap.parseEase('power2.inOut');
function seeded(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ---------- geometry and caches (rebuilt on resize) ---------- */
let W = 0; // canvas size in CSS px
let H = 0;
let DPR = 1;
let Wd = 0; // ... and in device px
let Hd = 0;
let cs = 16; // tile size in device px
let cols = 0;
let rows = 0;
let N = 0;
const photos = [null, null]; // the two pictures, cover-fitted to the tile grid
let lumT = [null, null]; // per tile brightness of each picture, 0 dark .. 1 bright
let atlas = null; // dot sprites on transparent: SIZES across, one row per colour
let atlasSolid = null; // the same sprites on the pale ground: a fully dissolved tile is one drawImage

/* per-tile state */
let d = new Float32Array(0); // dissolve strength 0 (photo) .. 1 (dots)
let lv = new Float32Array(0); // smoothed brightness that sizes and colours the dot
let which = new Uint8Array(0); // which picture the tile shows
let act = new Uint8Array(0); // 1 while the tile is dissolving (it needs one last paint when it heals)
let rnd = new Float32Array(0); // a fixed random per tile: grain on the trail's edge
let rate = new Float32Array(0); // each tile's own heal speed
let wd = new Float32Array(0); // distance of each tile from the swap's origin

let cur = 0; // the picture on show (the one the last swap went to)
let wave = null; // the swap front, while it runs

/* ---------- the brush: GSAP's quickTo, read inside loop() ---------- */
const m = { x: 0, y: 0, s: 0 }; // the eased brush position (device px) and the eased lag
let xTo;
let yTo;
let sTo;
let easeDur = 0.74;
let radiusMul = 1;
let rawX = 0;
let rawY = 0;
let prevX = 0;
let prevY = 0;
let sentX = NaN;
let sentY = NaN;
let lastInput = -Infinity;
let hadInput = false;
let startAt = performance.now();
let gclock = 0;
let autoClock = 0;
let autoAt = AUTO_FIRST;
let wasGhost = false;
let free = null;
let ctl = null;

function makeTweens() {
	[xTo, yTo, sTo].forEach((f) => f && f.tween && f.tween.kill());
	xTo = gsap.quickTo(m, 'x', { duration: easeDur, ease: 'expo' });
	yTo = gsap.quickTo(m, 'y', { duration: easeDur, ease: 'expo' });
	sTo = gsap.quickTo(m, 's', { duration: 1.1, ease: 'power2' });
	sentX = NaN;
	sentY = NaN;
	gsap.ticker.sleep(); // creating a tween wakes GSAP's ticker; put it back to sleep
}

/* ---------- loading the pictures into canvases ---------- */
const whenLoaded = (img) => (img.complete && img.naturalWidth
	? Promise.resolve()
	: new Promise((res) => {
		img.addEventListener('load', res, { once: true });
		img.addEventListener('error', res, { once: true });
	}));
const raws = [null, null]; // the same files as plain Images: an <img> with a srcset reports a density-corrected size, which would crop the wrong rectangle

async function loadRaw(img) {
	await whenLoaded(img);
	if (!img.complete || !img.naturalWidth) return null;
	const raw = new Image();
	raw.src = img.currentSrc || img.src;
	try { await raw.decode(); } catch (e) { return null; }
	return raw.naturalWidth ? raw : null;
}

function drawCover(g, im, w, h, fx) {
	const iw = im.naturalWidth;
	const ih = im.naturalHeight;
	const s = Math.max(w / iw, h / ih);
	const sw = w / s;
	const sh = h / s;
	g.drawImage(im, (iw - sw) * fx, (ih - sh) * 0.5, sw, sh, 0, 0, w, h);
}

function brightness(photo) {
	const tiny = document.createElement('canvas');
	tiny.width = cols;
	tiny.height = rows;
	const g = tiny.getContext('2d', { willReadFrequently: true });
	g.imageSmoothingQuality = 'high';
	g.drawImage(photo, 0, 0, photo.width, photo.height, 0, 0, cols, rows);
	const px = g.getImageData(0, 0, cols, rows).data;
	const out = new Float32Array(N);
	for (let i = 0; i < N; i++) out[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
	// stretch the middle 94 % of the picture to the full range, so every picture uses the whole dot scale
	const sorted = Float32Array.from(out).sort();
	const lo = sorted[Math.floor(N * 0.03)];
	const hi = sorted[Math.min(N - 1, Math.floor(N * 0.97))];
	const span = Math.max(0.05, hi - lo);
	for (let i = 0; i < N; i++) out[i] = clamp01((out[i] - lo) / span);
	return out;
}

function buildAtlas() {
	const rMax = cs * 0.5 * 1.03;
	[false, true].forEach((solid) => {
		const a = document.createElement('canvas');
		a.width = SIZES * cs;
		a.height = RAMP.length * cs;
		const g = a.getContext('2d');
		if (solid) {
			g.fillStyle = GROUND;
			g.fillRect(0, 0, a.width, a.height);
		}
		RAMP.forEach((colour, ci) => {
			g.fillStyle = colour;
			for (let li = 0; li < SIZES; li++) {
				g.beginPath();
				g.arc(li * cs + cs / 2, ci * cs + cs / 2, rMax * (0.07 + 0.93 * (li / (SIZES - 1))), 0, Math.PI * 2);
				g.fill();
			}
		});
		if (solid) atlasSolid = a; else atlas = a;
	});
}

function layout() {
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	if (W < 20 || H < 20) return false;
	// cap the pixel ratio: 1.5 on a phone, 1.75 elsewhere (the pictures are 1536 px wide)
	DPR = Math.min(window.devicePixelRatio || 1, W <= 720 ? 1.5 : 1.75);
	Wd = Math.round(W * DPR);
	Hd = Math.round(H * DPR);
	canvas.width = Wd;
	canvas.height = Hd;
	// about 64 tiles across a wide window, 24 across a phone
	cs = Math.max(10, Math.round(Math.max(14, W / 64) * DPR));
	cols = Math.ceil(Wd / cs);
	rows = Math.ceil(Hd / cs);
	N = cols * rows;
	const Wg = cols * cs;
	const Hg = rows * cs;
	for (let k = 0; k < 2; k++) {
		const c = photos[k] || (photos[k] = document.createElement('canvas'));
		c.width = Wg;
		c.height = Hg;
		drawCover(c.getContext('2d'), raws[k], Wg, Hg, FOCUS[k]);
		lumT[k] = brightness(c);
	}
	buildAtlas();
	ctx.fillStyle = GROUND; // (resizing the canvas reset the context, so this is set here)

	d = new Float32Array(N);
	lv = new Float32Array(N);
	which = new Uint8Array(N).fill(cur);
	act = new Uint8Array(N);
	wd = new Float32Array(N);
	rnd = new Float32Array(N);
	rate = new Float32Array(N);
	const r = seeded(2810);
	for (let i = 0; i < N; i++) {
		rnd[i] = r();
		rate[i] = (0.78 + 0.44 * r()) / HEAL;
	}
	wave = null;
	computeFree();
	const g0 = ghostPoint(0);
	rawX = prevX = m.x = g0.x;
	rawY = prevY = m.y = g0.y;
	m.s = 0;
	return true;
}

/* ---------- drawing ---------- */
function paintCell(i) {
	const x = (i % cols) * cs;
	const y = ((i / cols) | 0) * cs;
	const di = d[i];
	const photo = photos[which[i]];
	if (di <= 0) {
		ctx.drawImage(photo, x, y, cs, cs, x, y, cs, cs);
		return;
	}
	const a = 1 - smooth(0, HOLD, di);
	const grow = smooth(0.1, 0.85, di);
	const l = lv[i];
	const size = 0.1 + 0.9 * (1 - l); // darker tile, bigger dot
	const li = Math.min(SIZES - 1, Math.round(size * grow * (SIZES - 1)));
	const ci = Math.round(l * (RAMP.length - 1));
	if (a <= 0.004) {
		ctx.drawImage(atlasSolid, li * cs, ci * cs, cs, cs, x, y, cs, cs); // the photo is gone: ground and dot in one go
		return;
	}
	if (a < 0.995) {
		ctx.fillRect(x, y, cs, cs);
		ctx.globalAlpha = a;
	}
	ctx.drawImage(photo, x, y, cs, cs, x, y, cs, cs);
	ctx.globalAlpha = 1;
	if (grow > 0.02) ctx.drawImage(atlas, li * cs, ci * cs, cs, cs, x, y, cs, cs);
}

function paintAll() {
	ctx.globalAlpha = 1;
	for (let i = 0; i < N; i++) {
		lv[i] = lumT[which[i]][i];
		act[i] = d[i] > 0 ? 1 : 0;
		paintCell(i);
	}
}

function setPicture(k) {
	cur = k;
	pics.forEach((p, j) => { p.hidden = j !== k; });
	canvas.setAttribute('aria-label', LABELS[k]);
}

/* ---------- the ghost pointer: a slow loop through the part of the window the panel does not cover ---------- */
function computeFree() {
	const cr = canvas.getBoundingClientRect();
	const pr = panel.getBoundingClientRect();
	let rects = [[0, 0, W, H]];
	if (pr.right > cr.left && pr.left < cr.right && pr.bottom > cr.top && pr.top < cr.bottom) {
		const top = Math.max(0, pr.top - cr.top);
		const right = Math.max(0, pr.right - cr.left);
		rects = [[0, 0, W, top], [right, 0, W, H]];
	}
	let best = rects[0];
	let area = -1;
	rects.forEach((q) => {
		const a = Math.max(0, q[2] - q[0]) * Math.max(0, q[3] - q[1]);
		if (a > area) { area = a; best = q; }
	});
	const [x0, y0, x1, y1] = best;
	free = {
		cx: ((x0 + x1) / 2) * DPR,
		cy: ((y0 + y1) / 2) * DPR,
		ax: (x1 - x0) * 0.43 * DPR,
		ay: (y1 - y0) * 0.4 * DPR
	};
}

function ghostPoint(g) {
	const a = g * 0.85;
	const b = g * 0.62;
	return {
		x: free.cx + free.ax * (0.72 * Math.sin(a + 0.6) + 0.28 * Math.sin(b * 2.4 + 1.7)),
		y: free.cy + free.ay * (0.72 * Math.sin(b * 1.7 + 0.2) + 0.28 * Math.cos(a * 1.4))
	};
}

/* ---------- the reduced-motion still: the photo with one soft band of dots across it ---------- */
function stillBand() {
	d.fill(0);
	const ax = 0;
	const ay = Hd * 0.66;
	const bx = Wd;
	const by = Hd * 0.24;
	const len = Math.hypot(bx - ax, by - ay);
	const nx = -(by - ay) / len;
	const ny = (bx - ax) / len;
	const half = Hd * 0.12;
	for (let i = 0; i < N; i++) {
		const cx = ((i % cols) + 0.5) * cs;
		const cy = (((i / cols) | 0) + 0.5) * cs;
		const dist = Math.abs((cx - ax) * nx + (cy - ay) * ny) / half;
		d[i] = 1 - smooth(0.4, 1, dist + (rnd[i] - 0.5) * 0.4);
	}
}

/* ---------- a swap: the dissolve front sweeps out from (ox, oy); each tile changes picture while it is dots ---------- */
function startSwap(ox, oy) {
	if (wave && wave.t < 0.6) return;
	const tgt = 1 - cur;
	let far = 0;
	for (let i = 0; i < N; i++) {
		const dx = ((i % cols) + 0.5) * cs - ox;
		const dy = (((i / cols) | 0) + 0.5) * cs - oy;
		wd[i] = Math.hypot(dx, dy);
		if (wd[i] > far) far = wd[i];
	}
	const band = Math.max(Wd, Hd) * 0.2;
	wave = { t: 0, tgt, band, reach: far + band };
	setPicture(tgt);
}

function instantSwap() {
	wave = null;
	const tgt = 1 - cur;
	which.fill(tgt);
	setPicture(tgt);
	paintAll();
}

function swapFrom(ox, oy) {
	if (REDUCED || !ctl || !ctl.running) instantSwap();
	else startSwap(ox, oy);
}

/* ---------- one frame ---------- */
function tick(dt) {
	const now = performance.now();
	const ghost = now - Math.max(lastInput, startAt) > (hadInput ? IDLE_MS : FIRST_GHOST_MS);
	if (ghost) {
		if (!wasGhost) computeFree();
		gclock += dt;
		const g = ghostPoint(gclock);
		rawX = g.x;
		rawY = g.y;
		autoClock += dt;
		if (autoClock > autoAt) {
			autoClock = 0;
			autoAt = AUTO_EVERY;
			startSwap(m.x, m.y);
		}
	}
	wasGhost = ghost;

	// GSAP: set the targets, then step its ticker once by hand (its own rAF loop stays asleep)
	if (rawX !== sentX || rawY !== sentY) {
		xTo(rawX);
		yTo(rawY);
		sentX = rawX;
		sentY = rawY;
	}
	sTo(Math.hypot(m.x - rawX, m.y - rawY) / DPR); // the lag between the eased brush and the raw pointer, in CSS px
	gsap.ticker.sleep();
	gsap.ticker.tick();

	// the brush: a capsule from where it was to where it is, as wide as the speed makes it
	const rMin = Math.max(34, W * 0.045);
	const R = Math.min(0.26 * Wd, (rMin + SPEED_K * m.s) * radiusMul * DPR * (ghost ? 1.2 : 1));
	const bx = prevX;
	const by = prevY;
	const vx = m.x - bx;
	const vy = m.y - by;
	const vv = vx * vx + vy * vy;
	const c0 = Math.max(0, Math.floor((Math.min(bx, m.x) - R) / cs));
	const c1 = Math.min(cols - 1, Math.floor((Math.max(bx, m.x) + R) / cs));
	const r0 = Math.max(0, Math.floor((Math.min(by, m.y) - R) / cs));
	const r1 = Math.min(rows - 1, Math.floor((Math.max(by, m.y) + R) / cs));
	for (let r = r0; r <= r1; r++) {
		for (let c = c0; c <= c1; c++) {
			const i = r * cols + c;
			const px = (c + 0.5) * cs - bx;
			const py = (r + 0.5) * cs - by;
			const u = vv > 0 ? clamp01((px * vx + py * vy) / vv) : 0;
			const dist = Math.hypot(px - u * vx, py - u * vy) / R;
			if (dist < 1.25) {
				const f = 1 - smooth(0.3, 1, dist + (rnd[i] - 0.5) * 0.4);
				if (f > d[i]) d[i] = f;
			}
		}
	}
	prevX = m.x;
	prevY = m.y;

	// the swap front
	let front = -1;
	if (wave) {
		wave.t += dt / WAVE_S;
		front = waveEase(clamp01(wave.t)) * wave.reach;
	}

	// every tile: the front, the heal, and a repaint of the ones that changed
	const kLv = Math.min(1, dt * 9);
	ctx.globalAlpha = 1;
	for (let i = 0; i < N; i++) {
		let di = d[i];
		if (front >= 0) {
			const x = (front - wd[i]) / wave.band;
			if (x > 0 && x < 1) {
				const f = smooth(0, 1, x);
				if (f > di) di = f;
			}
			if (x >= 0.7 && which[i] !== wave.tgt) which[i] = wave.tgt;
		}
		if (di > 0) {
			di -= dt * rate[i];
			const target = lumT[which[i]][i];
			if (di <= 0) {
				d[i] = 0;
				act[i] = 0;
				paintCell(i);
				continue;
			}
			d[i] = di;
			if (act[i]) lv[i] += (target - lv[i]) * kLv;
			else { act[i] = 1; lv[i] = target; }
			paintCell(i);
		} else if (act[i]) {
			act[i] = 0;
			paintCell(i);
		}
	}
	if (wave && wave.t >= 1) wave = null;
}

/* ---------- input ---------- */
function toDevice(e) {
	const r = canvas.getBoundingClientRect();
	return { x: (e.clientX - r.left) * (Wd / r.width), y: (e.clientY - r.top) * (Hd / r.height) };
}

let downX = NaN;
let downY = NaN;

function wire() {
	const aim = (e) => {
		const p = toDevice(e);
		rawX = p.x;
		rawY = p.y;
		lastInput = performance.now();
		hadInput = true;
		autoClock = 0;
		autoAt = AUTO_FIRST;
	};
	canvas.addEventListener('pointermove', aim);
	canvas.addEventListener('pointerdown', (e) => {
		downX = e.clientX;
		downY = e.clientY;
		aim(e);
	});
	canvas.addEventListener('click', (e) => {
		if (Math.hypot(e.clientX - downX, e.clientY - downY) > 10) return; // a drag, not a click
		const p = toDevice(e);
		swapFrom(p.x, p.y);
	});
	radiusIn.addEventListener('input', () => { radiusMul = parseFloat(radiusIn.value) || 1; });
	easeIn.addEventListener('input', () => {
		easeDur = 0.2 + 1.2 * (parseFloat(easeIn.value) || 0);
		makeTweens();
	});
	easeDur = 0.2 + 1.2 * (parseFloat(easeIn.value) || 0.45);
	radiusMul = parseFloat(radiusIn.value) || 1;
}

/* ---------- start ---------- */
async function start() {
	const loaded = await Promise.all(imgs.map(loadRaw));
	if (loaded.some((r) => !r)) return; // a picture failed: the plain <picture> stays on show
	loaded.forEach((r, k) => { raws[k] = r; });
	if (!layout()) return;

	let resizeTimer = 0;
	const onResize = () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			if (!layout()) return;
			if (REDUCED) { stillBand(); paintAll(); } else { makeTweens(); paintAll(); }
		}, 140);
	};
	new ResizeObserver(() => {
		if (canvas.clientWidth !== W || canvas.clientHeight !== H) onResize();
	}).observe(canvas);

	swapBtn.addEventListener('click', () => swapFrom(Wd * 0.5, Hd * 0.45));

	if (REDUCED) {
		// one still frame: the photo with a band of dots across it. A click swaps at once.
		stillBand();
		paintAll();
		pauseBtn.disabled = true;
		radiusIn.disabled = true;
		easeIn.disabled = true;
		canvas.addEventListener('click', () => instantSwap());
		return;
	}

	wire();
	makeTweens();
	paintAll();
	startAt = performance.now();
	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'halftone-dissolve' });

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
