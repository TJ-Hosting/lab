/*
 * Sample 06 — "Star-trail text".
 * Four short lines of type, each set on its own curve (SVG <textPath>). A moving mask uncovers a line letter by
 * letter while a trail of cyan and white stars runs along the curve just ahead of it (Canvas 2D, additive light);
 * the last line ends in a burst. The whole sequence plays, holds, fades and starts again after a pause.
 * One loop() drives all of it, so it stops off-screen and in a hidden tab. Under reduced motion: every line
 * placed, a few stars, nothing moving. No library.
 *
 * Adapted from "Animated Intro (6)" (SVG textPath with star particles) by EE2dev,
 * https://gist.github.com/EE2dev/d05b9df2833c9975e68a3828198edd74 , MIT.
 * What is taken from animateStars.js: the idea and the method of placing each line's text on its own path,
 * centring it (start = pathLength / 2 - textLength / 2, found with getComputedTextLength() and getTotalLength()),
 * walking a point along the path with getPointAtLength() while the line appears and spawning stars at that
 * point, the chain of lines one after the other, the alternating quadratic wave path and the burst of stars
 * along the whole last line. The d3 transitions, the star particles, the mask reveal, the curves, the sky and
 * the type are new code; the gist's stars.js (adapted from a third-party pen) was not downloaded or used.
 *
 * Licence of the source: the gist's .block file reads "license: mit". The gist has no LICENSE file and no
 * copyright line, so none can be reproduced here; the standard MIT permission notice follows.
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *   associated documentation files (the "Software"), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 *   following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or substantial
 *   portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 *   LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 *   EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *   IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 *   USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const NS = 'http://www.w3.org/2000/svg';
const screen = document.querySelector('.piece-screen');
const canvas = document.querySelector('.trail-sky');
const svg = document.querySelector('.trail-type');
const info = document.querySelector('.sample-info');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');
const replayBtn = document.querySelector('[data-action="replay"]');

/* ---------- the copy and its two layouts (design units: the whole set is scaled to fit the screen) ---------- */

const COPY = [
	{ text: 'We host', cls: 'small', shape: 'arch', dy: 0.36, up: 0.62, down: 0.78, pad: 0.55, jitter: 0.2 },
	{ text: 'fast', cls: 'big', shape: 'swoop', dy: 0.36, up: 0.62, down: 0.78, pad: 0.4, jitter: 0.2 },
	{ text: 'and', cls: 'small', shape: 'dip', dy: 0.36, up: 0.62, down: 0.78, pad: 0.7, jitter: 0.2 },
	{ text: 'friendly', cls: 'script', shape: 'wave', dy: 0.2, up: 0.88, down: 0.82, pad: 0.5, jitter: 0.16 },
];
const LAYOUTS = {
	wide: { w: 700, h: 540, fs: [40, 136, 36, 122], y: [66, 206, 324, 454] },
	narrow: { w: 360, h: 372, fs: [24, 96, 24, 84], y: [44, 134, 216, 314] },
};

/* the curves; (cx, y) is the middle of the line's centre line and w its length */
const f1 = (n) => Math.round(n * 10) / 10;
const SHAPES = {
	arch(cx, y, w, fs) {
		const h = fs;
		return `M${f1(cx - w / 2)} ${f1(y + h)} Q${f1(cx)} ${f1(y - h)} ${f1(cx + w / 2)} ${f1(y + h)}`;
	},
	dip(cx, y, w, fs) {
		const h = fs * 0.9;
		return `M${f1(cx - w / 2)} ${f1(y - h)} Q${f1(cx)} ${f1(y + h)} ${f1(cx + w / 2)} ${f1(y - h)}`;
	},
	swoop(cx, y, w, fs) {
		const a = fs * 0.38;
		const x0 = cx - w / 2;
		return `M${f1(x0)} ${f1(y + a)} C${f1(x0 + w * 0.42)} ${f1(y + a)} ${f1(x0 + w * 0.58)} ${f1(y - a)} ${f1(cx + w / 2)} ${f1(y - a)}`;
	},
	/* EE2dev's wave: a straight run, an odd number of alternating quadratic bumps, a straight run */
	wave(cx, y, w, fs) {
		const seg = fs * 0.95;
		const ctrl = fs * 0.2;
		let n = Math.floor(w / seg);
		if (n % 2 === 0) n -= 1;
		if (n < 1) n = 1;
		const r = (w - n * seg) / 2;
		let d = `M${f1(cx - w / 2)} ${f1(y)} l${f1(r)} 0`;
		let h = ctrl;
		for (let i = 0; i < n; i++) {
			h = -h;
			d += ` q${f1(seg / 2)} ${f1(h)} ${f1(seg)} 0`;
		}
		return `${d} l${f1(r)} 0`;
	},
};

/* ---------- state ---------- */

let W = 0;
let H = 0;
let DPR = 1;
let small = false;
let ox = 0;
let oy = 0;
let k = 1;
let lines = [];
let root = null;
let time = 0;
let total = 12;
let fadeAt = 9;
let ctl = null;

/* a small deterministic PRNG, so the still frame is the same every visit */
let seed = 11;
const rnd = () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (p) => {
	const s = p * p * (3 - 2 * p);
	return p * 0.55 + s * 0.45;
};

function el(name, attrs, parent) {
	const e = document.createElementNS(NS, name);
	for (const key in attrs) e.setAttribute(key, attrs[key]);
	if (parent) parent.append(e);
	return e;
}

/* ---------- sprites: a soft glow with a four-point flare, drawn once ---------- */

const TINTS = [[226, 242, 255], [70, 208, 251], [96, 168, 255]];
const sprites = TINTS.map(([r, g, b]) => {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const g2 = c.getContext('2d');
	const glow = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
	glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
	glow.addColorStop(0.1, `rgba(${r}, ${g}, ${b}, 0.95)`);
	glow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.28)`);
	glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
	g2.fillStyle = glow;
	g2.fillRect(0, 0, 64, 64);
	g2.globalCompositeOperation = 'lighter';
	const h = g2.createLinearGradient(0, 0, 64, 0);
	h.addColorStop(0, 'rgba(255, 255, 255, 0)');
	h.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
	h.addColorStop(1, 'rgba(255, 255, 255, 0)');
	g2.fillStyle = h;
	g2.fillRect(0, 31, 64, 2);
	const v = g2.createLinearGradient(0, 0, 0, 64);
	v.addColorStop(0, 'rgba(255, 255, 255, 0)');
	v.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
	v.addColorStop(1, 'rgba(255, 255, 255, 0)');
	g2.fillStyle = v;
	g2.fillRect(31, 0, 2, 64);
	return c;
});

/* ---------- the stars ---------- */

let MAX = 900;
const P = {
	x: new Float32Array(MAX), y: new Float32Array(MAX), vx: new Float32Array(MAX), vy: new Float32Array(MAX),
	age: new Float32Array(MAX), ttl: new Float32Array(MAX), size: new Float32Array(MAX), ph: new Float32Array(MAX),
	kind: new Uint8Array(MAX),
};
let n = 0;

function spawn(x, y, vx, vy, ttl, size, kind, age = 0) {
	if (n >= MAX) return;
	const i = n++;
	P.x[i] = x; P.y[i] = y; P.vx[i] = vx; P.vy[i] = vy;
	P.age[i] = age; P.ttl[i] = ttl; P.size[i] = size; P.kind[i] = kind; P.ph[i] = rnd() * 6.28;
}
function kindOf() {
	const r = rnd();
	return r < 0.45 ? 0 : r < 0.85 ? 1 : 2;
}
const sizeScale = () => clamp(k, 0.7, 1.25) * (small ? 0.85 : 1);

/* one star of the trail: mostly small dust, now and then a flare */
function trailStar(x, y, strong = 1) {
	const flare = rnd() < 0.3;
	const size = (flare ? 12 + rnd() * 12 : 4 + rnd() * 5) * sizeScale() * (0.8 + strong * 0.2);
	spawn(x, y, (rnd() - 0.5) * 30, -4 - rnd() * 16, 0.7 + rnd() * 0.9, size, kindOf());
}

function stepStars(dt) {
	const drag = Math.max(0, 1 - 1.1 * dt);
	for (let i = 0; i < n; i++) {
		P.age[i] += dt;
		if (P.age[i] >= P.ttl[i]) {
			const j = --n;
			P.x[i] = P.x[j]; P.y[i] = P.y[j]; P.vx[i] = P.vx[j]; P.vy[i] = P.vy[j];
			P.age[i] = P.age[j]; P.ttl[i] = P.ttl[j]; P.size[i] = P.size[j]; P.ph[i] = P.ph[j]; P.kind[i] = P.kind[j];
			i--;
			continue;
		}
		P.x[i] += P.vx[i] * dt;
		P.y[i] += P.vy[i] * dt;
		P.vx[i] *= drag;
		P.vy[i] *= drag;
	}
}

/* ---------- the far stars: a fixed field that twinkles slowly ---------- */

let far = [];
function makeFar() {
	const s0 = seed;
	seed = 29;
	const count = small ? 34 : 64;
	far = Array.from({ length: count }, () => ({
		x: rnd() * W,
		y: rnd() * H * 0.92,
		size: 4 + rnd() * 7,
		a: 0.22 + rnd() * 0.4,
		w: 0.5 + rnd() * 1.1,
		ph: rnd() * 6.28,
		kind: rnd() < 0.6 ? 0 : 2,
	}));
	seed = s0;
}

/* ---------- layout: build the paths, the type and the masks for the current size ---------- */

function build() {
	const r = canvas.getBoundingClientRect();
	W = Math.max(1, Math.round(canvas.clientWidth || r.width));
	H = Math.max(1, Math.round(canvas.clientHeight || r.height));
	small = W < 720;
	DPR = Math.min(2, window.devicePixelRatio || 1);
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	svg.setAttribute('width', W);
	svg.setAttribute('height', H);
	svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
	MAX = small ? 380 : 900;
	n = Math.min(n, MAX);
	makeFar();

	const L = small ? LAYOUTS.narrow : LAYOUTS.wide;

	svg.replaceChildren();
	const defs = el('defs', {}, svg);
	root = el('g', {}, svg);

	const grad = el('linearGradient', { id: 'tg-friendly', gradientUnits: 'userSpaceOnUse', x1: L.w * 0.3, y1: 0, x2: L.w * 0.7, y2: 0 }, defs);
	el('stop', { offset: '0', 'stop-color': '#86e2ff' }, grad);
	el('stop', { offset: '0.5', 'stop-color': '#ffffff' }, grad);
	el('stop', { offset: '1', 'stop-color': '#9ecbff' }, grad);

	const previous = new Map(lines.map((l) => [l.text, l]));
	lines = COPY.map((c, i) => {
		const cx = L.w / 2;
		let fs = L.fs[i];
		const mk = (size) => {
			const t = el('text', { class: `line line--${c.cls}`, 'font-size': size }, root);
			t.textContent = c.text;
			const len = t.getComputedTextLength();
			t.remove();
			return len;
		};
		let len = mk(fs);
		const need = len + 2 * c.pad * fs;
		if (need > L.w * 0.94) {
			fs *= (L.w * 0.94) / need;
			len = mk(fs);
		}
		const w = len + 2 * c.pad * fs;
		const guide = el('path', { id: `tp${i}`, class: 'guide', d: SHAPES[c.shape](cx, L.y[i], w, fs) }, root);
		const pathLen = guide.getTotalLength();
		const start = pathLen / 2 - len / 2;

		const mask = el('mask', { id: `mk${i}`, maskUnits: 'userSpaceOnUse', x: -L.w, y: -L.h, width: L.w * 3, height: L.h * 3 }, defs);
		const ribbon = el('path', { fill: '#fff', d: '' }, mask);
		const attrs = { class: `line line--${c.cls}`, 'font-size': f1(fs * 100) / 100, dy: `${c.dy}em`, mask: `url(#mk${i})` };
		if (c.cls === 'script') { attrs.fill = 'url(#tg-friendly)'; attrs.stroke = 'url(#tg-friendly)'; }
		const text = el('text', attrs, root);
		const tp = el('textPath', { href: `#tp${i}`, startOffset: '50%', 'text-anchor': 'middle' }, text);
		tp.textContent = c.text;

		// walk the curve: a point, its normal (up, for left-to-right text) and the two edges of the reveal ribbon
		const ds = 3;
		const sA = Math.max(0, start - 8);
		const sB = Math.min(pathLen, start + len + 8);
		const count = Math.ceil((sB - sA) / ds);
		const step = (sB - sA) / count;
		const upD = c.up * fs;
		const dnD = c.down * fs;
		const pts = [];
		const upS = [];
		const dnS = [];
		for (let j = 0; j <= count; j++) {
			const s = sA + j * step;
			const p = guide.getPointAtLength(s);
			const a = guide.getPointAtLength(Math.max(0, s - 1));
			const b = guide.getPointAtLength(Math.min(pathLen, s + 1));
			const tx = b.x - a.x;
			const ty = b.y - a.y;
			const tl = Math.hypot(tx, ty) || 1;
			const nx = ty / tl;
			const ny = -tx / tl;
			pts.push({ x: p.x, y: p.y, nx, ny });
			upS.push(`${f1(p.x + nx * upD)} ${f1(p.y + ny * upD)}`);
			dnS.push(`${f1(p.x - nx * dnD)} ${f1(p.y - ny * dnD)}`);
		}
		const old = previous.get(c.text);
		return {
			...c, fs, len, sA, sB, step, pts, upS, dnS, upD, dnD, ribbon, text, guide,
			dur: clamp(len * 0.0062, 1.05, 2.3),
			t0: 0, done: old ? old.done : false, sPrev: null, acc: 0,
		};
	});

	// place the set: as large as fits, clear of the description panel (lower left on a wide screen, below the type on a phone)
	const halfPath = Math.max(...lines.map((l) => (l.len + 2 * l.pad * l.fs) / 2));
	const last = lines[lines.length - 1];
	const halfLast = last.len / 2 + 0.12 * last.fs;
	const infoR = info.getBoundingClientRect();
	const panelTop = infoR.top - r.top;
	const panelRight = infoR.right - r.left;
	if (small) {
		const U = clamp(panelTop - 10, 250, H);
		k = Math.max(0.5, Math.min((W - 12) / (2 * halfPath), U / L.h));
		ox = W / 2 - (L.w / 2) * k;
		oy = Math.max(4, (U - L.h * k) / 2);
	} else {
		// the set sits a little right of centre, clear of the panel (lower left) and the hint (lower right)
		const hintR = document.querySelector('.hint')?.getBoundingClientRect();
		const hintLeft = hintR && hintR.width ? hintR.left - r.left : W;
		const hintTop = hintR && hintR.width ? hintR.top - r.top : H;
		const shift = Math.min(110, W * 0.09);
		let cx = W / 2;
		for (k = clamp((H - 28) / L.h, 0.4, 1.45); k > 0.4; k *= 0.97) {
			const top = Math.max(8, (H - L.h * k) * 0.3);
			const inkBottom = top + (L.y[L.y.length - 1] + 0.8 * last.fs) * k;
			const lo = inkBottom > panelTop ? panelRight + 28 + halfLast * k : -Infinity;
			const hi = Math.min(W - 12 - halfPath * k, inkBottom > hintTop ? hintLeft - 12 - halfLast * k : Infinity);
			cx = Math.min(hi, Math.max(lo, W / 2 + shift));
			if (lo <= hi && cx - halfPath * k >= 8) break;
		}
		ox = cx - (L.w / 2) * k;
		oy = Math.max(8, (H - L.h * k) * 0.3);
	}
	root.setAttribute('transform', `translate(${f1(ox)} ${f1(oy)}) scale(${k.toFixed(4)})`);

	// the timeline: the lines in turn, then a hold, a fade and a rest before it starts again
	let t = 0.4;
	for (const line of lines) {
		line.t0 = t;
		t += line.dur + 0.42;
	}
	const lastEnd = lines[lines.length - 1].t0 + lines[lines.length - 1].dur;
	fadeAt = lastEnd + 3.8;
	total = fadeAt + 0.9 + 1.7;
	time = Math.min(time, total - 0.01);
	applyState();
}

/* set every mask to match the current time (after a resize or a replay) */
function applyState() {
	for (const L of lines) {
		const p = clamp((time - L.t0) / L.dur, 0, 1);
		L.done = p >= 1;
		L.sPrev = p > 0 && p < 1 ? L.sA + ease(p) * (L.sB - L.sA) : null;
		L.ribbon.setAttribute('d', p >= 1 ? ribbonD(L, L.sB) : p > 0 ? ribbonD(L, L.sPrev) : '');
	}
	setGroupOpacity();
}

function setGroupOpacity() {
	const fin = clamp(time / 0.5, 0, 1);
	const fout = time > fadeAt ? clamp(1 - (time - fadeAt) / 0.9, 0, 1) : 1;
	root.style.opacity = String(Math.round(fin * fout * 1000) / 1000);
}

/* the reveal ribbon: the strip between the up and down edges of the curve, up to the head at arc length s */
function ribbonD(L, s) {
	const q = (s - L.sA) / L.step;
	const m = Math.min(L.pts.length - 1, Math.max(0, Math.floor(q)));
	const fr = clamp(q - m, 0, 1);
	const up = L.upS.slice(0, m + 1);
	const dn = L.dnS.slice(0, m + 1);
	if (m < L.pts.length - 1 && fr > 0.01) {
		const a = L.pts[m];
		const b = L.pts[m + 1];
		const x = a.x + (b.x - a.x) * fr;
		const y = a.y + (b.y - a.y) * fr;
		let nx = a.nx + (b.nx - a.nx) * fr;
		let ny = a.ny + (b.ny - a.ny) * fr;
		const nl = Math.hypot(nx, ny) || 1;
		nx /= nl; ny /= nl;
		up.push(`${f1(x + nx * L.upD)} ${f1(y + ny * L.upD)}`);
		dn.push(`${f1(x - nx * L.dnD)} ${f1(y - ny * L.dnD)}`);
	}
	return `M${up.join('L')}L${dn.reverse().join('L')}Z`;
}

/* a point on the curve at arc length s, in design units */
function at(L, s) {
	const q = clamp((s - L.sA) / L.step, 0, L.pts.length - 1);
	const m = Math.min(L.pts.length - 2, Math.floor(q));
	const fr = q - m;
	const a = L.pts[m];
	const b = L.pts[m + 1] || a;
	return { x: a.x + (b.x - a.x) * fr, y: a.y + (b.y - a.y) * fr, nx: a.nx + (b.nx - a.nx) * fr, ny: a.ny + (b.ny - a.ny) * fr };
}
const toX = (x) => ox + x * k;
const toY = (y) => oy + y * k;

/* ---------- the sequence ---------- */

const DENSITY = () => (small ? 0.26 : 0.4); // stars per design unit of curve

function trail(L, s0, s1) {
	L.acc += Math.abs(s1 - s0) * DENSITY();
	while (L.acc >= 1) {
		L.acc -= 1;
		const p = at(L, s0 + (s1 - s0) * rnd());
		const off = (rnd() - 0.5) * 2 * L.jitter * L.fs;
		trailStar(toX(p.x + p.nx * off), toY(p.y + p.ny * off));
	}
}

/* a burst along a line: stars thrown out of the curve on both sides */
function burst(L, count, power) {
	const c = small ? Math.round(count * 0.6) : count;
	for (let i = 0; i < c; i++) {
		const p = at(L, L.sA + rnd() * (L.sB - L.sA));
		const side = rnd() < 0.5 ? -1 : 1;
		const v = (30 + rnd() * 90) * power;
		const off = (rnd() - 0.5) * L.jitter * L.fs;
		spawn(
			toX(p.x + p.nx * off), toY(p.y + p.ny * off),
			(p.nx * side * v + (rnd() - 0.5) * 50) * k, (p.ny * side * v - 10 + (rnd() - 0.5) * 50) * k,
			1 + rnd() * 1.2, (6 + rnd() * 12) * sizeScale(), kindOf(),
		);
	}
}

function resetRun() {
	for (const L of lines) {
		L.done = false;
		L.sPrev = null;
		L.acc = 0;
		L.ribbon.setAttribute('d', '');
	}
}

function step(dt) {
	time += dt;
	if (time >= total) {
		time -= total;
		resetRun();
	}
	lines.forEach((L, i) => {
		if (L.done) return;
		const p = clamp((time - L.t0) / L.dur, 0, 1);
		if (p <= 0) return;
		const s = L.sA + ease(p) * (L.sB - L.sA);
		trail(L, L.sPrev ?? L.sA, s);
		L.sPrev = s;
		L.ribbon.setAttribute('d', ribbonD(L, s));
		if (p >= 1) {
			L.done = true;
			burst(L, i === lines.length - 1 ? 64 : i === 1 ? 30 : 16, i === lines.length - 1 ? 1.15 : 0.7);
		}
	});
	setGroupOpacity();
	stepStars(dt);
}

/* ---------- drawing ---------- */

function drawSprite(kind, x, y, size, alpha) {
	ctx.globalAlpha = alpha;
	ctx.drawImage(sprites[kind], x - size / 2, y - size / 2, size, size);
}

function draw(t) {
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	ctx.clearRect(0, 0, W, H);
	ctx.globalCompositeOperation = 'lighter';
	for (const s of far) drawSprite(s.kind, s.x, s.y, s.size, s.a * (0.65 + 0.35 * Math.sin(s.ph + t * s.w)));
	for (let i = 0; i < n; i++) {
		const u = P.age[i] / P.ttl[i];
		const env = u < 0.14 ? u / 0.14 : Math.pow(1 - (u - 0.14) / 0.86, 1.4);
		const tw = 0.72 + 0.28 * Math.sin(P.ph[i] + P.age[i] * 13);
		drawSprite(P.kind[i], P.x[i], P.y[i], P.size[i] * (0.5 + 0.5 * env) * 2.2, env * tw);
	}
	// the head of each line that is being uncovered: a bright flare
	if (!stillMode) {
		for (const L of lines) {
			if (L.done || L.sPrev == null) continue;
			const p = at(L, L.sPrev);
			const pulse = 1 + 0.14 * Math.sin(t * 24);
			drawSprite(1, toX(p.x), toY(p.y), 84 * sizeScale() * pulse, 0.5);
			drawSprite(0, toX(p.x), toY(p.y), 46 * sizeScale() * pulse, 0.95);
		}
	}
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
}

/* ---------- the reduced-motion still: every line placed, a few stars, nothing moving ---------- */

let stillMode = false;
function stillFrame() {
	stillMode = true;
	seed = 11;
	n = 0;
	time = total * 0.5;
	for (const L of lines) {
		L.done = true;
		L.ribbon.setAttribute('d', ribbonD(L, L.sB));
	}
	root.style.opacity = '1';
	for (const L of lines) {
		const c = small ? 7 : 12;
		for (let i = 0; i < c; i++) {
			const p = at(L, L.sA + ((i + rnd() * 0.8) / c) * (L.sB - L.sA));
			const off = (rnd() - 0.5) * 2 * (L.jitter + 0.12) * L.fs;
			const ttl = 1 + rnd();
			spawn(toX(p.x + p.nx * off), toY(p.y + p.ny * off), 0, 0, ttl, (6 + rnd() * 12) * sizeScale(), kindOf(), ttl * (0.25 + rnd() * 0.15));
		}
	}
	draw(2.5);
}

/* ---------- start ---------- */

function pointerSprinkle() {
	let last = null;
	const local = (e) => {
		const r = canvas.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	screen.addEventListener('pointermove', (e) => {
		if (!ctl || !ctl.running) return;
		const p = local(e);
		if (p.y < 0) return;
		if (last && Math.hypot(p.x - last.x, p.y - last.y) < 14) return;
		last = p;
		for (let i = 0; i < 2; i++) {
			const flare = rnd() < 0.35;
			spawn(p.x + (rnd() - 0.5) * 12, p.y + (rnd() - 0.5) * 12, (rnd() - 0.5) * 36, -6 - rnd() * 22, 0.7 + rnd() * 0.8, (flare ? 12 + rnd() * 10 : 5 + rnd() * 5) * sizeScale(), kindOf());
		}
	});
	screen.addEventListener('pointerleave', () => { last = null; });
	screen.addEventListener('pointerdown', (e) => {
		if (!ctl || !ctl.running) return;
		const p = local(e);
		if (p.y < 0) return;
		for (let i = 0; i < 22; i++) {
			const a = rnd() * 6.283;
			const v = 25 + rnd() * 95;
			spawn(p.x, p.y, Math.cos(a) * v, Math.sin(a) * v - 8, 0.8 + rnd() * 1, (7 + rnd() * 12) * sizeScale(), kindOf());
		}
	});
}

function restart() {
	time = 0;
	seed = 11;
	n = 0;
	resetRun();
	setGroupOpacity();
	if (ctl) {
		pauseBtn.setAttribute('aria-pressed', 'false');
		pauseBtn.textContent = 'Pause';
		ctl.start();
	}
}

function setMode() {
	const still = prefersReducedMotion();
	replayBtn.disabled = still;
	pauseBtn.disabled = still;
	if (still) stillFrame();
	else if (stillMode) {
		stillMode = false;
		restart();
	}
}

async function start() {
	// the lengths of the lines depend on the faces, so wait for them
	await Promise.all([
		document.fonts.load('800 40px "Nunito Sans"'),
		document.fonts.load('900 136px "Nunito Sans"'),
		document.fonts.load('400 100px "Great Vibes"'),
	]).catch(() => {});
	await document.fonts.ready;
	build();

	ctl = loop(canvas, (dt, t) => {
		step(dt);
		draw(t);
	}, { name: 'star-trail-text' });
	setMode();
	reducedMotionQuery.addEventListener?.('change', setMode);

	let timer = 0;
	const relayout = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			build();
			if (stillMode) stillFrame();
			else if (!ctl.running) draw(time);
		}, 150);
	};
	addEventListener('resize', relayout);
	// the description panel can fold away, which frees room on a phone
	new MutationObserver(relayout).observe(info, { attributes: true, attributeFilter: ['data-collapsed'] });

	pointerSprinkle();
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
	replayBtn.addEventListener('click', restart);
}

boot();
start().catch((err) => console.error(err));
