/*
 * Sample 33 — "Wavy Lines Hero".
 * A night-screen hero: rows of glowing lines (cyan, azure, royal, with a pale sheen that slides along them) flow
 * like silk across a dark window. Each line is an SVG path through a row of points; every point is moved by a
 * smooth noise field that drifts in time, so the whole weave breathes by itself. The lines are bent clear of the
 * glass headline card's box (once per layout, and kept clear while they move), so they bow around it. A pointer
 * or finger drags the lines aside (each point is a spring and swings back); the Gust button, and now and then
 * the page itself, sends a ghost pointer across. The paths are redrawn every frame, as a canvas would be.
 * Reduced motion: one frame with a frozen gust, drawn once.
 *
 * Adapted from "Wavy Lines / SVG version / Multiple paths" by Antoine Wodniack (https://codepen.io/wodniack/pen/abeMZXQ), MIT.
 * Kept from it: the idea of one path per line through a row of points, each point offset by noise-driven angles,
 * and a pointer force with a spring-back and friction per point. Changed: own noise function (the pen's external
 * noise script was not used: the noise here is the published improved-noise algorithm, written out afresh),
 * horizontal lines bowed around a card, smooth curves, gradient strokes with a glow under every third line,
 * a ghost pointer and a Gust control, pause rules, a phone budget, and a reduced-motion still.
 *
 * Copyright (c) Antoine Wodniack (https://codepen.io/wodniack/pen/abeMZXQ). The year is not shown in the pen's source.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * (This is the licence CodePen applies to public pens, https://blog.codepen.io/docs/licensing/.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const screen = document.querySelector('.piece-screen');
const svg = document.querySelector('#weave');
const haloG = document.querySelector('#halo');
const coreG = document.querySelector('#core');
const grad = document.querySelector('#silk');
const card = document.querySelector('.hero__card');
const pauseBtn = document.querySelector('[data-action="pause"]');
const gustBtn = document.querySelector('[data-action="gust"]');

const REDUCED = prefersReducedMotion();
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- tuning ---------- */
const SPRING = 22; // how hard a point is pulled back to its place (1/s²)
const DAMP = 3.8; // how quickly its swing dies (under critical: it overshoots a little, like cloth)
const MAX_OFF = 120; // the furthest a pointer can drag a point, px
const IDLE_AFTER = 4; // seconds without a pointer before the page sends gusts of its own
const GUST_SPEED = 1000; // px per second, on a wide window
const HALO_EVERY = 3; // a wide faint glow under every n-th line (a stroke is the costly part of a frame, so not every line)

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (e0, e1, v) => {
	const t = clamp((v - e0) / (e1 - e0), 0, 1);
	return t * t * (3 - 2 * t);
};
const r1 = (v) => Math.round(v * 10) / 10;

/* small deterministic PRNG, so the first picture is the same on every visit */
let seed = 11;
const rnd = () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

/* ---------- noise: smooth 3D gradient noise (two axes of the window plus time), written for this sample ---------- */
function makeNoise(s0) {
	const base = new Uint8Array(256);
	for (let i = 0; i < 256; i++) base[i] = i;
	let s = s0 >>> 0 || 1;
	for (let i = 255; i > 0; i--) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		const j = s % (i + 1);
		const t = base[i];
		base[i] = base[j];
		base[j] = t;
	}
	const perm = new Uint8Array(512);
	for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
	const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
	const g = (h, x, y, z) => {
		const u = (h & 15) < 8 ? x : y;
		const v = (h & 15) < 4 ? y : (h & 15) === 12 || (h & 15) === 14 ? x : z;
		return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
	};
	const lerp = (t, a, b) => a + t * (b - a);
	return (x, y, z) => {
		const fx = Math.floor(x);
		const fy = Math.floor(y);
		const fz = Math.floor(z);
		const X = fx & 255;
		const Y = fy & 255;
		const Z = fz & 255;
		x -= fx; y -= fy; z -= fz;
		const u = fade(x);
		const v = fade(y);
		const w = fade(z);
		const A = perm[X] + Y;
		const AA = perm[A] + Z;
		const AB = perm[A + 1] + Z;
		const B = perm[X + 1] + Y;
		const BA = perm[B] + Z;
		const BB = perm[B + 1] + Z;
		return lerp(w,
			lerp(v, lerp(u, g(perm[AA], x, y, z), g(perm[BA], x - 1, y, z)), lerp(u, g(perm[AB], x, y - 1, z), g(perm[BB], x - 1, y - 1, z))),
			lerp(v, lerp(u, g(perm[AA + 1], x, y, z - 1), g(perm[BA + 1], x - 1, y, z - 1)), lerp(u, g(perm[AB + 1], x, y - 1, z - 1), g(perm[BB + 1], x - 1, y - 1, z - 1))));
	};
}
const noise = makeNoise(20261028);

/* ---------- the weave ---------- */
let W = 0;
let H = 0;
let N = 0; // lines
let P = 0; // points per line
let phone = false; // a narrow window: the info panel covers its lower half
let AX = 18; // how far noise sways a point along its line, px
let AY = 36; // and across it
let FS = 1; // noise scale: the field is finer on a narrow window, so a phone sees as many waves as a desktop
let R = 170; // the pointer's reach, px
let box = null; // the card's box in the window's pixels: centre, half width, half height, and the clearance round it
let coreEl = null; // one path for all the lines (as sub-paths): one stroke to draw, not dozens
let haloEl = null;
let hx; let hy; // home place of each line's points: hx per column, hy per line
let sgn; let span; let aHome; // per line: which side of the card it flows past, how far to the window's edge on that side, its distance from the card's middle
let gap; // per column: how far the lines are kept from the card's middle line at this x (0 away from the card)
let ox; let oy; let ovx; let ovy; // per point: how far a pointer has dragged it, and how fast it is swinging back
let px; let py; // per point: where it is drawn

function measureBox() {
	const c = svg.getBoundingClientRect();
	const b = card.getBoundingClientRect();
	box = b.width > 0 ? { cx: b.left - c.left + b.width / 2, cy: b.top - c.top + b.height / 2, hw: b.width / 2, hh: b.height / 2 } : null;
}

function layout() {
	const r = svg.getBoundingClientRect();
	W = Math.max(1, Math.round(r.width));
	H = Math.max(1, Math.round(r.height));
	svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
	// the gradient runs across the window on a diagonal and slides a little in draw()
	grad.setAttribute('x1', String(-W * 0.2));
	grad.setAttribute('y1', String(H * 0.1));
	grad.setAttribute('x2', String(W * 1.0));
	grad.setAttribute('y2', String(H * 0.9));
	measureBox();

	phone = W < 560;
	// the cost is capped: fewer lines and points on a phone
	N = phone ? 26 : W < 900 ? 32 : 42;
	P = phone ? 24 : W < 900 ? 28 : 34;
	AX = phone ? 10 : 18;
	AY = phone ? 26 : 36;
	FS = phone ? 1.9 : 1;
	R = phone ? 120 : 170;

	const over = phone ? 40 : 70; // lines run past the window's edges
	const padY = phone ? 36 : 56;
	const yTop = -padY;
	const yBot = H + padY;
	const g = (yBot - yTop) / (N - 1);
	const dx = (W + 2 * over) / (P - 1);

	hx = new Float32Array(P);
	hy = new Float32Array(N);
	for (let j = 0; j < P; j++) hx[j] = -over + j * dx;
	for (let i = 0; i < N; i++) hy[i] = yTop + i * g;

	/* bow the lines round the card: along the card's width the lines are mapped away from its middle by its half
	   height plus a margin, and the lines further out are squeezed between that and the window's edge; the push fades
	   out over `reach` past the card's sides, so each line swells round the box like cloth over a stone */
	gap = new Float32Array(P);
	sgn = new Int8Array(N);
	span = new Float32Array(N);
	aHome = new Float32Array(N);
	if (box) {
		const margin = phone ? 12 : 18;
		const reach = phone ? 84 : 150;
		const full = box.hh + margin;
		for (let j = 0; j < P; j++) gap[j] = full * (1 - smooth(box.hw - 6, box.hw + reach, Math.abs(hx[j] - box.cx)));
		for (let i = 0; i < N; i++) {
			const u = hy[i] - box.cy;
			sgn[i] = u < 0 ? -1 : 1;
			aHome[i] = Math.abs(u);
			span[i] = Math.max(full + 20, sgn[i] < 0 ? box.cy - yTop : yBot - box.cy);
		}
	}

	const n = N * P;
	ox = new Float32Array(n); oy = new Float32Array(n);
	ovx = new Float32Array(n); ovy = new Float32Array(n);
	px = new Float32Array(n); py = new Float32Array(n);

	// the paths: a wide faint copy of the lines (the glow) under the crisp lines; each layer is a single path
	haloG.textContent = '';
	coreG.textContent = '';
	haloEl = document.createElementNS(SVG_NS, 'path');
	coreEl = document.createElementNS(SVG_NS, 'path');
	haloG.append(haloEl);
	coreG.append(coreEl);
}

/* ---------- things that drag the lines: you, and the ghost ---------- */
const user = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, amp: 0, on: false };
const ghost = { x: -999, y: 0, vx: 0, vy: 0, amp: 0 };
let gust = null; // a gust in flight: where from, how fast, how strong
let clock = 0; // simulation seconds
let lastUser = -1e9;
let nextGust = 1.6;

function startGust(strength, dir) {
	const d = dir || (rnd() < 0.5 ? 1 : -1);
	const over = 90;
	const speed = (phone ? 560 : GUST_SPEED) * (0.85 + 0.3 * rnd());
	// on a phone the upper part of the window is the part the info panel leaves clear
	const yc = H * (phone ? 0.26 + 0.1 * rnd() : 0.42 + 0.16 * rnd());
	gust = { d, speed, x0: d > 0 ? -over : W + over, yc, ya: H * (phone ? 0.12 : 0.2), ph: rnd() * 6.28, age: 0, life: (W + 2 * over) / speed, strength };
}

function stepGust(h) {
	if (!gust) { ghost.amp += (0 - ghost.amp) * Math.min(1, h * 8); return; }
	gust.age += h;
	const a = gust.age;
	const w = 2.3; // how fast the ghost rises and falls across the window
	const p = clamp(a / gust.life, 0, 1);
	ghost.x = gust.x0 + gust.d * gust.speed * a;
	ghost.y = gust.yc + gust.ya * Math.sin(a * w + gust.ph);
	ghost.vx = gust.d * gust.speed;
	ghost.vy = gust.ya * w * Math.cos(a * w + gust.ph);
	ghost.amp = gust.strength * smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p));
	if (a >= gust.life) { gust = null; ghost.x = -999; }
}

function stepUser(h) {
	user.amp += ((user.on ? 1 : 0) - user.amp) * Math.min(1, h * 10);
	const k = Math.min(1, h * 16);
	const nx = user.x + (user.tx - user.x) * k;
	const ny = user.y + (user.ty - user.y) * k;
	const rvx = (nx - user.x) / Math.max(h, 1e-3);
	const rvy = (ny - user.y) / Math.max(h, 1e-3);
	user.vx += (rvx - user.vx) * Math.min(1, h * 12);
	user.vy += (rvy - user.vy) * Math.min(1, h * 12);
	user.x = nx;
	user.y = ny;
}

/* the sources that push this frame */
const srcs = [];

function step(h) {
	clock += h;
	stepUser(h);
	const idle = !user.on && clock - lastUser > IDLE_AFTER;
	if (!gust && idle && clock >= nextGust) {
		startGust(0.6, 0);
		nextGust = clock + 7 + rnd() * 4;
	}
	if (!idle) nextGust = Math.max(nextGust, clock + 5);
	stepGust(h);

	srcs.length = 0;
	if (user.amp > 0.02) srcs.push(user);
	if (ghost.amp > 0.02) srcs.push(ghost);
	const R2 = R * R;
	for (let i = 0; i < N; i++) {
		const y0 = hy[i];
		for (let j = 0; j < P; j++) {
			const k = i * P + j;
			let fx = -ox[k] * SPRING - ovx[k] * DAMP;
			let fy = -oy[k] * SPRING - ovy[k] * DAMP;
			if (srcs.length) {
				const x = hx[j] + ox[k];
				const y = y0 + oy[k];
				for (let s = 0; s < srcs.length; s++) {
					const sc = srcs[s];
					const dx = x - sc.x;
					const dy = y - sc.y;
					const d2 = dx * dx + dy * dy;
					if (d2 >= R2) continue;
					const d = Math.sqrt(d2);
					const q = 1 - d / R;
					const f = q * q * sc.amp;
					const speed = Math.hypot(sc.vx, sc.vy);
					// across the lines the pointer drags them with it and swells them apart; along them it only slides them
					fy += f * (sc.vy * 3.7 + (dy / (d + 10)) * speed * 4.4);
					fx += f * sc.vx * 1.2;
				}
			}
			ovx[k] += fx * h;
			ovy[k] += fy * h;
			ox[k] = clamp(ox[k] + ovx[k] * h, -MAX_OFF, MAX_OFF);
			oy[k] = clamp(oy[k] + ovy[k] * h, -MAX_OFF, MAX_OFF);
		}
	}
}

/* ---------- placing the points, then drawing ---------- */

const FX = 0.0021;
const FY = 0.0016;
const FT = 0.075;
const ANG = 6.2;

function place() {
	const t = clock * FT;
	const cy = box ? box.cy : 0;
	const hh = box ? box.hh : 0;
	for (let i = 0; i < N; i++) {
		const s = sgn[i];
		const a = aHome[i];
		const m = span[i];
		const yh = hy[i];
		for (let j = 0; j < P; j++) {
			const k = i * P + j;
			const x = hx[j];
			let y = yh;
			let near = 0;
			const gj = gap[j];
			if (box && gj > 0) {
				// bow: lines flow past the card's top or bottom edge, squeezed between it and the window's edge
				const off = gj + a * (1 - gj / m);
				y = cy + s * off;
				near = Math.min(1, gj / (hh + 1)) * clamp(1 - (off - hh) / 150, 0, 1);
			}
			// the drift: an angle from the noise field turns into a sway across and along the line; calmer next to the card
			const ang = noise(x * FX * FS, yh * FY * FS, t) * ANG + noise(x * FX * FS * 2.3 + 9, yh * FY * FS * 2.3 + 4, t * 1.6) * 1.2;
			const calm = 1 - 0.8 * near;
			let yy = y + Math.sin(ang) * AY * calm + oy[k];
			const xx = x + Math.cos(ang) * AX * calm + ox[k];
			if (box && gj > 0) {
				// never let a line (or a drag) enter the card's box
				const lim = (hh + 6) * (gj / (hh + 18 + 1));
				if (s * (yy - cy) < lim) yy = cy + s * lim;
			}
			px[k] = xx;
			py[k] = yy;
		}
	}
}

function draw() {
	place();
	let core = '';
	let halo = '';
	for (let i = 0; i < N; i++) {
		const o = i * P;
		let d = `M${r1(px[o])} ${r1(py[o])}L${r1((px[o] + px[o + 1]) / 2)} ${r1((py[o] + py[o + 1]) / 2)}`;
		for (let j = 1; j < P - 1; j++) {
			const k = o + j;
			d += `Q${r1(px[k])} ${r1(py[k])} ${r1((px[k] + px[k + 1]) / 2)} ${r1((py[k] + py[k + 1]) / 2)}`;
		}
		d += `L${r1(px[o + P - 1])} ${r1(py[o + P - 1])}`;
		core += d;
		if (i % HALO_EVERY === 0) halo += d;
	}
	coreEl.setAttribute('d', core);
	haloEl.setAttribute('d', halo);
	// the pale sheen slides slowly along the diagonal and back
	grad.setAttribute('gradientTransform', `translate(${r1(Math.sin(clock * 0.13) * W * 0.28)} 0)`);
}

/* ---------- the pointer ---------- */

let ctl = null;
const running = () => !!ctl && ctl.running;

function at(ev) {
	const r = svg.getBoundingClientRect();
	return [ev.clientX - r.left, ev.clientY - r.top];
}
function aim(ev, jump) {
	const [x, y] = at(ev);
	user.tx = x;
	user.ty = y;
	if (jump || !user.on) { user.x = x; user.y = y; user.vx = 0; user.vy = 0; }
	user.on = true;
	lastUser = clock;
}

if (!REDUCED) {
	screen.addEventListener('pointermove', (ev) => {
		const [, y] = at(ev);
		if (y < 0) return;
		// a mouse drags the lines while it hovers; a finger or pen only while it touches
		if (ev.pointerType === 'mouse' || ev.buttons) aim(ev, false);
	});
	screen.addEventListener('pointerdown', (ev) => {
		if (ev.button > 0) return;
		const [, y] = at(ev);
		if (y < 0) return;
		aim(ev, true);
	});
	const lift = (ev) => {
		if (ev.pointerType !== 'mouse') {
			user.on = false;
			lastUser = clock;
		}
	};
	screen.addEventListener('pointerup', lift);
	screen.addEventListener('pointercancel', lift);
	screen.addEventListener('pointerleave', () => { user.on = false; lastUser = clock; });
}

/* ---------- running ---------- */

function tick(dt) {
	// a fixed small step keeps the springs steady when a frame runs long
	const n = Math.min(2, Math.max(1, Math.ceil(dt * 60 - 0.01)));
	for (let k = 0; k < n; k++) step(dt / n);
	draw();
}

/* the reduced-motion still: the weave at a fixed moment, with one gust frozen part-way across it, drawn once */
function stillFrame() {
	clock = 7.4;
	gust = null;
	ox.fill(0); oy.fill(0); ovx.fill(0); ovy.fill(0);
	user.on = false;
	user.amp = 0;
	lastUser = clock;
	nextGust = 1e9;
	startGust(1, 1);
	// in clear space: above the card on a wide window, between the card and the info panel on a phone
	gust.yc = box && phone ? (box.cy + box.hh + H * 0.54) / 2 : H * 0.2;
	gust.ya = H * (phone ? 0.05 : 0.1);
	const frames = Math.round(gust.life * 0.46 * 60);
	for (let k = 0; k < frames; k++) step(1 / 60);
	draw();
}

function relayout(redraw) {
	layout();
	redraw();
}

function start() {
	layout();
	// the card's box changes a little once the web font is in, so measure and lay the weave out again
	const again = () => relayout(REDUCED ? stillFrame : draw);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
	let timer = 0;
	if (REDUCED) {
		stillFrame();
		// the controls that would start motion are off
		for (const b of [pauseBtn, gustBtn]) {
			b.disabled = true;
			b.setAttribute('aria-disabled', 'true');
		}
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => relayout(stillFrame), 150);
		});
		return;
	}
	clock = 3;
	nextGust = clock + 3.5; // the first thing you see is the calm drift
	draw();

	// loop() runs only while the SVG is on screen, the tab is visible and motion is allowed
	ctl = loop(svg, tick, { name: 'wavy-lines-hero' });

	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); draw(); }, 150);
	});

	gustBtn.addEventListener('click', () => {
		if (!running()) return;
		startGust(1, 0);
		lastUser = clock;
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		gustBtn.disabled = paused;
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
