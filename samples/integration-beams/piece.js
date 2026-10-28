/*
 * Sample 39 — "Integration beams".
 * A round "Your site" tile and six glass tiles on a ring, joined by beams of light. Each beam is a curved path measured
 * from the tiles' real positions (and measured again whenever the hub is resized); a gradient segment of cyan and royal
 * light runs along it on a canvas under the tiles, and the tile it lands on pulses (Web Animations API: transform and
 * opacity only). Every continuous animation runs through loop() or govern() from js/lab.js, so it pauses off-screen and
 * in a hidden tab. Reduced motion draws one still frame: every path faint, one bright segment on each. Nothing is sent
 * anywhere, and the tile names are plain words, not real integrations.
 *
 * Adapted from "Animated Beam" (apps/www/registry/magicui/animated-beam.tsx at commit
 * efe76fc5755eca1142dd4f74c1d6f0ace2887e3c) by Magic UI, https://github.com/magicuidesign/magicui, MIT licence.
 * Docs page: https://v3.magicui.design/docs/components/animated-beam (it credits @itsarghyadas for the base).
 *
 * MIT License
 *
 * Copyright (c) Magic UI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * What it keeps from the source: a quadratic path between two measured elements (positions read with
 * getBoundingClientRect, relative to the container), bowed upward by a curvature; a faint path under a brighter one; a
 * light segment whose gradient runs from a head colour through a body colour (at 32.5%) to transparent; the
 * cubic-bezier(0.16, 1, 0.3, 1) ease-out; per-beam delay, duration and rest between runs; the paths measured again when
 * the container's size changes.
 * What it changes: no React, no framer-motion and no SVG: a plain module that draws the beams on a canvas (so the light
 * moves along the path itself, by arc length, instead of sweeping a gradient across the box); a path runs from just
 * inside one tile's edge to just inside the other's, not centre to centre; the curvature is a share of the path's
 * length; the colours are DS v9's cyan and royal; each landing pulses its tile; the beams are paced by loop(), paused
 * off-screen and in a hidden tab; reduced motion shows one still frame. The icons are drawn here; none is the source's.
 */
import { boot, loop, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const stage = document.querySelector('.hub-stage');
const hub = document.getElementById('hub');
const canvas = hub.querySelector('canvas.beams');
const ctx = canvas.getContext('2d');
const coreEl = hub.querySelector('[data-node="core"]');
const sendBtn = document.querySelector('[data-action="send"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const hint = document.querySelector('.hint');
const gov = govern(stage);
const canAnimate = typeof Element.prototype.animate === 'function';

/* ---------- the beams ---------- */

/* the colours: head (cyan light), body (royal), and the faint path under them */
const HEAD = [70, 208, 251];
const BODY = [12, 107, 237];
const RAIL = '5, 88, 220';
/* how the light travels: the source's ease-out, a segment about 40% of the path (at least 44 px, at most 150) */
const EASE = cubicBezier(0.16, 1, 0.3, 1);
const SEG_SHARE = 0.4;
/* how far the light runs in under a tile (px): into the glass, so it seems to go in */
const INSET = 14;
/* the reduced-motion still: where each beam's head sits (a share of its path) */
const STILL_HEAD = [0.62, 0.8, 0.5, 0.72, 0.9, 0.58];

/* who each beam joins: dir 'in' runs from the tile to the site, 'out' from the site to the tile.
   dur and rest are seconds (each rest gets up to 1.3 s more, so the runs drift apart); bow is the curvature as a share of the path's length */
const BEAMS = [
	{ id: 'domain', dir: 'in', dur: 2.6, rest: 0.3, bow: 0.2 },
	{ id: 'email', dir: 'out', dur: 2.9, rest: 0.4, bow: 0.2 },
	{ id: 'forms', dir: 'in', dur: 2.5, rest: 0.3, bow: 0.14 },
	{ id: 'payments', dir: 'in', dur: 2.8, rest: 0.5, bow: 0.2 },
	{ id: 'cdn', dir: 'out', dur: 2.5, rest: 0.3, bow: 0.14 },
	{ id: 'backups', dir: 'out', dur: 3.0, rest: 0.4, bow: 0.2 },
];

const beams = BEAMS.map((def, i) => ({
	...def,
	el: hub.querySelector(`[data-node="${def.id}"]`),
	t0: null, // clock time the current run began, or null while it rests
	next: 0.1 + i * 0.5, // when it runs next (clock seconds)
	arrived: false,
	arrivedAt: -9,
	hot: 0, // 0 to 1, how brightly the path is lit under a pointer or focus
	hotTo: 0,
	geo: null,
}));

let W = 0;
let H = 0;
let DPR = 1;
let clock = 1.4; // a short head start, so the first screen already has light in flight
let ctl = null; // the loop() controller, made only when motion is allowed
let paused = false;

/* ---------- small maths ---------- */

/* a small seeded random number generator (mulberry32), so the rhythm is the same every visit */
function seeded(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rnd = seeded(39);

/* a CSS cubic-bezier as a function of progress (Newton, then bisection) */
function cubicBezier(x1, y1, x2, y2) {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sx = (t) => ((ax * t + bx) * t + cx) * t;
	const sy = (t) => ((ay * t + by) * t + cy) * t;
	const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
	return (x) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const e = sx(t) - x;
			if (Math.abs(e) < 1e-5) return sy(t);
			const d = dx(t);
			if (Math.abs(d) < 1e-6) break;
			t -= e / d;
		}
		let lo = 0;
		let hi = 1;
		t = x;
		for (let i = 0; i < 24; i++) {
			const e = sx(t) - x;
			if (Math.abs(e) < 1e-5) break;
			if (e > 0) hi = t; else lo = t;
			t = (lo + hi) / 2;
		}
		return sy(t);
	};
}

const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ---------- measuring: each path from the tiles' real positions ---------- */

const TABLE = 36; // samples along a path, for arc length

function quad(g, t) {
	const u = 1 - t;
	return {
		x: u * u * g.p0.x + 2 * u * t * g.c.x + t * t * g.p1.x,
		y: u * u * g.p0.y + 2 * u * t * g.c.y + t * t * g.p1.y,
	};
}

/* the point a share s (0 to 1) of the way along the path, by arc length */
function pointAt(g, s) {
	const target = clamp(s, 0, 1) * g.len;
	const L = g.table;
	let i = 1;
	while (i < TABLE && L[i] < target) i++;
	const a = L[i - 1];
	const b = L[i];
	const f = b > a ? (target - a) / (b - a) : 0;
	return quad(g, (i - 1 + f) / TABLE);
}

/* how far from a rectangle's centre a ray in direction d leaves it */
function edgeDistance(half, d) {
	const tx = Math.abs(d.x) > 1e-6 ? half.w / Math.abs(d.x) : Infinity;
	const ty = Math.abs(d.y) > 1e-6 ? half.h / Math.abs(d.y) : Infinity;
	return Math.min(tx, ty);
}

function measure() {
	const hr = hub.getBoundingClientRect();
	DPR = Math.min(2, window.devicePixelRatio || 1);
	const w = Math.max(1, Math.round(hr.width));
	const h = Math.max(1, Math.round(hr.height));
	if (w !== W || h !== H || canvas.width !== Math.round(w * DPR) || canvas.height !== Math.round(h * DPR)) {
		W = w;
		H = h;
		canvas.width = Math.round(W * DPR);
		canvas.height = Math.round(H * DPR);
	}
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

	const box = (el) => {
		const r = el.getBoundingClientRect();
		return { x: r.left - hr.left + r.width / 2, y: r.top - hr.top + r.height / 2, half: { w: r.width / 2, h: r.height / 2 } };
	};
	const site = box(coreEl);
	for (const b of beams) {
		const node = box(b.el);
		const dx = node.x - site.x;
		const dy = node.y - site.y;
		const span = Math.hypot(dx, dy) || 1;
		const d = { x: dx / span, y: dy / span };
		/* the source runs centre to centre with the tiles on top; here the light runs from just inside one tile's edge to
		   just inside the other's, so most of it is in the open (the site's tile is round, the others are rectangles) */
		const a = { x: site.x + d.x * (site.half.w - 4), y: site.y + d.y * (site.half.w - 4) };
		const inset = Math.max(0, edgeDistance(node.half, d) - INSET);
		const z = { x: node.x - d.x * inset, y: node.y - d.y * inset };
		const chord = Math.hypot(z.x - a.x, z.y - a.y) || 1;
		const cd = { x: (z.x - a.x) / chord, y: (z.y - a.y) / chord };
		/* bowed upward, as the source's control point is (its y is the start's minus the curvature); a chord that
		   runs straight up or down bows to the right */
		let n = { x: -cd.y, y: cd.x };
		if (n.y > 0.0001 || (Math.abs(n.y) <= 0.0001 && n.x < 0)) n = { x: -n.x, y: -n.y };
		if (Math.abs(n.y) < 0.2) n = { x: 1, y: 0 };
		const mid = { x: (a.x + z.x) / 2, y: (a.y + z.y) / 2 };
		const control = { x: mid.x + n.x * b.bow * chord, y: mid.y + n.y * b.bow * chord };
		const g = b.dir === 'in'
			? { p0: z, c: control, p1: a }
			: { p0: a, c: control, p1: z };
		g.table = new Float32Array(TABLE + 1);
		let prev = quad(g, 0);
		for (let i = 1; i <= TABLE; i++) {
			const p = quad(g, i / TABLE);
			g.table[i] = g.table[i - 1] + Math.hypot(p.x - prev.x, p.y - prev.y);
			prev = p;
		}
		g.len = g.table[TABLE] || 1;
		g.seg = clamp(g.len * SEG_SHARE, 44, 150) / g.len;
		/* the share of the path where the light meets the tile it lands on (the site's cyan ring is 9 px outside its tile) */
		g.land = clamp(1 - (b.dir === 'in' ? 13 : INSET) / g.len, 0.5, 0.98);
		b.geo = g;
	}
}

/* ---------- drawing ---------- */

function stroke(g, from, to, width, style) {
	const steps = Math.max(6, Math.round((to - from) * 40));
	ctx.beginPath();
	for (let i = 0; i <= steps; i++) {
		const p = pointAt(g, from + ((to - from) * i) / steps);
		if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
	}
	ctx.lineWidth = width;
	ctx.strokeStyle = style;
	ctx.stroke();
}

function drawRail(b) {
	const g = b.geo;
	ctx.beginPath();
	ctx.moveTo(g.p0.x, g.p0.y);
	ctx.quadraticCurveTo(g.c.x, g.c.y, g.p1.x, g.p1.y);
	ctx.lineWidth = 2;
	ctx.strokeStyle = `rgba(${RAIL}, ${0.2 + 0.3 * b.hot})`;
	ctx.stroke();
}

/* the light: head at share hp of the path, trailing seg behind it */
function drawLight(b, hp, fade) {
	const g = b.geo;
	const head = Math.min(1, hp);
	const tail = Math.max(0, hp - g.seg);
	if (head - tail < 0.004 || fade <= 0) return;
	const h = pointAt(g, head);
	const t = pointAt(g, tail);
	const grad = ctx.createLinearGradient(h.x, h.y, t.x, t.y);
	/* the source's stops: the head colour at the front, the body colour from 32.5%, transparent at the tail */
	grad.addColorStop(0, rgba(HEAD, 1));
	grad.addColorStop(0.325, rgba(BODY, 1));
	grad.addColorStop(1, rgba(BODY, 0));
	ctx.globalAlpha = fade;
	stroke(g, tail, head, 12, rgba(HEAD, 0.1));
	stroke(g, tail, head, 6, rgba(HEAD, 0.2));
	stroke(g, tail, head, 3, grad);
	if (hp < 1 + g.seg * 0.5) {
		const r = 14;
		const dot = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
		dot.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
		dot.addColorStop(0.35, rgba(HEAD, 0.6));
		dot.addColorStop(1, rgba(HEAD, 0));
		ctx.fillStyle = dot;
		ctx.fillRect(h.x - r, h.y - r, r * 2, r * 2);
	}
	ctx.globalAlpha = 1;
}

/* a soft flash where the light goes in under the tile, fading for half a second after it lands */
function drawLanding(b) {
	const age = clock - b.arrivedAt;
	if (age < 0 || age > 0.7) return;
	const f = 1 - age / 0.7;
	const p = pointAt(b.geo, b.geo.land);
	const r = 26 * (1 + (1 - f) * 0.5);
	const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
	grad.addColorStop(0, rgba(HEAD, 0.55 * f));
	grad.addColorStop(1, rgba(HEAD, 0));
	ctx.fillStyle = grad;
	ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (const b of beams) if (b.geo) drawRail(b);
	for (const b of beams) {
		if (!b.geo || b.t0 === null) continue;
		const u = clamp((clock - b.t0) / b.dur, 0, 1);
		const hp = EASE(u) * (1 + b.geo.seg);
		drawLight(b, hp, u > 0.9 ? (1 - u) / 0.1 : 1);
		drawLanding(b);
	}
	/* a landing's flash can outlive its run */
	for (const b of beams) if (b.geo && b.t0 === null) drawLanding(b);
}

/* the reduced-motion still: every path faint, one bright segment on each, nothing running */
function drawStill() {
	ctx.clearRect(0, 0, W, H);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (const b of beams) if (b.geo) drawRail(b);
	beams.forEach((b, i) => { if (b.geo) drawLight(b, STILL_HEAD[i] * (1 + b.geo.seg * 0.2), 1); });
}

/* ---------- pulses: a tile lights up when a beam lands (WAAPI, transform and opacity only) ---------- */

function pulse(node) {
	if (!canAnimate || !gov.isLive()) return;
	const tile = node.querySelector('.node__tile');
	const lit = node.querySelector('.node__lit');
	const ping = node.querySelector('.node__ping');
	const isCore = node === coreEl;
	tile.animate(
		[{ transform: 'scale(1)' }, { transform: `scale(${isCore ? 1.045 : 1.075})`, offset: 0.26 }, { transform: 'scale(1)' }],
		{ duration: 680, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
	);
	lit.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: 950, easing: 'ease-out' });
	ping.animate(
		[{ transform: 'scale(1)', opacity: 0.8 }, { transform: `scale(${isCore ? 1.28 : 1.34})`, opacity: 0 }],
		{ duration: 950, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
	);
}

/* ---------- running ---------- */

function step(dt) {
	clock += dt;
	for (const b of beams) {
		b.hot += (b.hotTo - b.hot) * Math.min(1, dt * 9);
		if (b.t0 === null) {
			if (clock >= b.next) { b.t0 = clock; b.arrived = false; }
			continue;
		}
		const u = (clock - b.t0) / b.dur;
		if (!b.arrived && b.geo && EASE(clamp(u, 0, 1)) * (1 + b.geo.seg) >= b.geo.land) {
			b.arrived = true;
			b.arrivedAt = clock;
			pulse(b.dir === 'in' ? coreEl : b.el);
		}
		if (u >= 1) {
			b.t0 = null;
			b.next = clock + b.rest + rnd() * 1.3;
		}
	}
}

function tick(dt) {
	step(dt);
	draw();
}

/* send one beam now (not if it has only just left) */
function fire(b) {
	if (b.t0 !== null && (clock - b.t0) / b.dur < 0.12) return;
	b.t0 = clock;
	b.arrived = false;
}

function setPaused(v) {
	paused = v;
	pauseBtn.setAttribute('aria-pressed', String(v));
	pauseBtn.textContent = v ? 'Play' : 'Pause';
	gov.setUserPaused(v);
	if (ctl) { if (v) ctl.stop(); else ctl.start(); }
}

function wake() {
	if (paused) setPaused(false);
}

function holdStill() {
	if (ctl) ctl.stop();
	stage.getAnimations({ subtree: true }).forEach((a) => a.cancel());
	hub.querySelectorAll('button.node__tile').forEach((el) => {
		el.disabled = true;
		el.setAttribute('aria-label', el.querySelector('.node__label').textContent);
	});
	sendBtn.disabled = true;
	pauseBtn.disabled = true;
	if (hint) hint.textContent = 'Reduced motion · beams held still';
	drawStill();
}

function runMotion() {
	hub.querySelectorAll('button.node__tile').forEach((el) => {
		el.disabled = false;
		el.setAttribute('aria-label', `${el.querySelector('.node__label').textContent}: send a beam`);
	});
	sendBtn.disabled = false;
	pauseBtn.disabled = false;
	if (hint) hint.textContent = 'Tap a tile to send its beam';
	/* loop() runs only while the canvas is on screen, the tab is visible and motion is allowed */
	if (!ctl) ctl = loop(canvas, tick, { name: 'integration-beams' });
	if (!paused) ctl.start();
}

function render() {
	if (prefersReducedMotion()) drawStill(); else draw();
}

/* ---------- start ---------- */

boot();
measure();

beams.forEach((b) => {
	const tile = b.el.querySelector('.node__tile');
	tile.addEventListener('click', () => {
		if (prefersReducedMotion()) return;
		wake();
		fire(b);
	});
	const lit = (v) => () => { b.hotTo = v; if (!ctl || !ctl.running) { b.hot = v; render(); } };
	tile.addEventListener('pointerenter', lit(1));
	tile.addEventListener('pointerleave', lit(0));
	tile.addEventListener('focus', lit(1));
	tile.addEventListener('blur', lit(0));
});

sendBtn.addEventListener('click', () => {
	if (prefersReducedMotion()) return;
	wake();
	/* a ripple round the ring: each beam restarts a moment after the last */
	beams.forEach((b, i) => { b.t0 = null; b.arrived = false; b.next = clock + i * 0.17; });
});

pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

/* re-measure whenever the hub changes size (the source does the same with a ResizeObserver) */
new ResizeObserver(() => { measure(); render(); }).observe(hub);
addEventListener('resize', () => { measure(); render(); });

reducedMotionQuery.addEventListener?.('change', () => {
	if (prefersReducedMotion()) holdStill(); else runMotion();
});

if (prefersReducedMotion()) holdStill(); else runMotion();
