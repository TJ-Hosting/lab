/*
 * Sample 50 — "Pendulum Wave".
 * Eighteen glass pendulums hang from a navy frame, seen from the front and above, and swing toward and away from you.
 * Bob i makes 50 + i whole swings in a 60 s cycle, so they drift out of step into a snake, a tight helix, groups of
 * four, three and two, and meet again exactly at 60 s. A bob's length follows the physics (period squared), so longer
 * bobs swing slower. Every pose is a pure function of one cycle clock (elapsed seconds, never a frame count), so the
 * cycle stays exact however the frame rate varies; the clock stops with the loop (Pause, off-screen, hidden tab).
 * Faint azure trails are the bob's own past positions, recomputed from the clock. Drawing is Canvas 2D with a small
 * perspective camera. Sound is off by default; the Sound button starts Web Audio and plays a soft pitched tick as the
 * bobs cross the centre (low for long bobs, high for short ones), thinned to one voice at a time and at most about
 * eight a second. Reduced motion: one still frame of the snake, no loop, no sound.
 *
 * Adapted from pendulum: pendulum wave visualisation (p5.js) by Gregory Kogan
 * (https://github.com/GregoryKogan/pendulum, commit a0ea04091a997b14f81956ba018531381c00a556), MIT.
 * What was taken is only the maths: every pendulum has its own rotation length equal to the cycle length divided by
 * a whole count, the counts step evenly from the longest pendulum to the shortest, and all of them start together so
 * they re-align when the cycle ends. Everything else is new: the swing is a cosine in 3D, the lengths, the drawing,
 * the perspective, the trails, the glass bobs, the readout and the synthesised sound. No p5, no mp3, no Roboto.
 *
 * MIT License
 *
 * Copyright (c) 2023 Gregory Kogan
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
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const panel = document.querySelector('.sample-info');
const hint = document.querySelector('.hint');
const readout = document.getElementById('readout');
const timeEl = document.getElementById('t-now');
const nameEl = document.getElementById('t-name');
const barEl = document.getElementById('t-bar');
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const soundBtn = document.querySelector('[data-action="sound"]');

/* ---------- the rule: bob i swings SWINGS0 + i times in CYCLE seconds ---------- */

const NB = 18; // bobs
const CYCLE = 60; // seconds until all of them line up again
const SWINGS0 = 50; // swings the longest bob makes in a cycle
const SWINGS = Array.from({ length: NB }, (_, i) => SWINGS0 + i);
const LEN = SWINGS.map((n) => (SWINGS0 / n) ** 2); // length is proportional to period squared: 1 down to about 0.55
const AMP = 0.46; // swing angle, radians (about 26 degrees)
const TAU = Math.PI * 2;

/* the named moments: "gaps" waves across the row appear at gaps / (NB - 1) of the cycle, and mirror after the half */
const GAPS = NB - 1;
const MARKERS = [
	{ t: 0, name: 'In step', tol: 0.9 },
	{ t: CYCLE / GAPS, name: 'Snake', tol: 1 }, // one wave along the row
	{ t: (CYCLE * 2) / GAPS, name: 'Twin snakes', tol: 1.2 }, // two waves along the row
	{ t: CYCLE / 4, name: 'Four groups', tol: 1.2 }, // every fourth bob together
	{ t: CYCLE / 3, name: 'Three groups', tol: 1.2 },
	{ t: CYCLE / 2, name: 'Two groups', tol: 1.5 }, // odd bobs against even
];
const STILL_T = MARKERS[1].t; // the reduced-motion still: the snake

const TRAIL_STEPS = 14; // a trail is the bob's last 14 x 22 ms
const TRAIL_DT = 0.022;

/* ---------- the camera: a small perspective view from the front, looking down ---------- */

const PITCH = (46 * Math.PI) / 180;
const SIN_P = Math.sin(PITCH);
const COS_P = Math.cos(PITCH);
const CAM_DIST = 80;
const SPACING = 1; // world units between pivots
const WD = (NB - 1) * SPACING;

let W = 0;
let H = 0;
let DPR = 1;
let G = null; // geometry and fit of the current layout
let sx = 0; // project() writes here: the screen x, y and the depth
let sy = 0;
let sz = 1;

function project(x, y, z) {
	const dy = y - G.cy;
	const dz = z - G.cz;
	const depth = -dy * SIN_P - dz * COS_P;
	const up = dy * COS_P - dz * SIN_P;
	const k = G.F / depth;
	sx = G.ox + x * k;
	sy = G.oy - up * k;
	sz = depth;
}

function makeGeom(r, bobR) {
	const L0 = r * WD; // the longest string
	const hf = L0 + bobR + 1.2; // the floor, below the beam
	return {
		bobR, L0, hf,
		xf: WD / 2 + 1.7, // the frame's uprights
		pw: WD / 2 + 2.5, // the glass floor's half width,
		pz: L0 * Math.sin(AMP) + 0.9, // and half depth
		cy: -hf / 2 + CAM_DIST * SIN_P,
		cz: CAM_DIST * COS_P,
		F: 1, ox: 0, oy: 0,
		px: Array.from({ length: NB }, (_, i) => (i - (NB - 1) / 2) * SPACING),
	};
}

/* the box (at F = 1) around everything that can be drawn */
function bounds(g) {
	G = g;
	g.F = 1;
	g.ox = 0;
	g.oy = 0;
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;
	const add = (x, y, z, pad) => {
		project(x, y, z);
		const p = pad / sz;
		x0 = Math.min(x0, sx - p);
		x1 = Math.max(x1, sx + p);
		y0 = Math.min(y0, sy - p);
		y1 = Math.max(y1, sy + p);
	};
	add(-g.xf, 0, 0, 0.45);
	add(g.xf, 0, 0, 0.45);
	for (const a of [-1, 1]) for (const b of [-1, 1]) add(a * g.pw, -g.hf - 0.4, b * g.pz, 0.15);
	add(0, -g.hf - 0.4, g.pz + 1.6, 0); // room for the contact shadow
	for (let i = 0; i < NB; i++) for (const a of [-AMP, 0, AMP]) add(g.px[i], -g.L0 * LEN[i] * Math.cos(a), g.L0 * LEN[i] * Math.sin(a), g.bobR);
	return { x0, y0, x1, y1 };
}

function fit(g, box) {
	const b = bounds(g);
	const F = Math.min(box.w / (b.x1 - b.x0), box.h / (b.y1 - b.y0));
	g.F = F;
	g.ox = box.x + box.w / 2 - (F * (b.x0 + b.x1)) / 2;
	g.oy = box.y + box.h / 2 - (F * (b.y0 + b.y1)) / 2;
}

/* ---------- sprites: glass bobs, drawn once per layout ---------- */

const ROYAL = [12, 107, 237];
const CYAN = [43, 184, 245];
let sprites = [];
let shadowSprite = null;

const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

function paintBob(S, rgb) {
	const c = document.createElement('canvas');
	c.width = S;
	c.height = S;
	const g = c.getContext('2d');
	const cx = S / 2;
	const cy = S / 2;
	const R = S / 2 - 1;
	// the glass body: pale at the top left, the colour in the middle, deeper at the edge
	let grad = g.createRadialGradient(cx - R * 0.3, cy - R * 0.36, R * 0.04, cx, cy, R);
	grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
	grad.addColorStop(0.24, rgba(mix(rgb, [255, 255, 255], 0.72), 0.95));
	grad.addColorStop(0.64, rgba(rgb, 0.93));
	grad.addColorStop(1, rgba(mix(rgb, [10, 44, 116], 0.4), 0.97));
	g.fillStyle = grad;
	g.beginPath();
	g.arc(cx, cy, R, 0, TAU);
	g.fill();
	// light bouncing back up from below: a cyan glow low on the right
	g.save();
	g.beginPath();
	g.arc(cx, cy, R, 0, TAU);
	g.clip();
	grad = g.createRadialGradient(cx + R * 0.4, cy + R * 0.52, 0, cx + R * 0.4, cy + R * 0.52, R * 0.8);
	grad.addColorStop(0, 'rgba(120, 225, 255, 0.7)');
	grad.addColorStop(1, 'rgba(70, 208, 251, 0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, S, S);
	g.restore();
	// the cyan rim, and a hairline of navy outside it so the bob holds against the pale sky
	g.lineWidth = Math.max(1, R * 0.05);
	g.strokeStyle = 'rgba(10, 44, 116, 0.5)';
	g.beginPath();
	g.arc(cx, cy, R - g.lineWidth / 2, 0, TAU);
	g.stroke();
	g.lineWidth = Math.max(1.2, R * 0.075);
	g.strokeStyle = 'rgba(70, 208, 251, 0.95)';
	g.beginPath();
	g.arc(cx, cy, R * 0.9, 0, TAU);
	g.stroke();
	// the highlight: a bright slanted oval, and a small second glint opposite
	g.save();
	g.translate(cx - R * 0.34, cy - R * 0.4);
	g.rotate(-0.62);
	grad = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.34);
	grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
	grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.85)');
	grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
	g.scale(1, 0.55);
	g.fillStyle = grad;
	g.beginPath();
	g.arc(0, 0, R * 0.34, 0, TAU);
	g.fill();
	g.restore();
	g.fillStyle = 'rgba(255, 255, 255, 0.6)';
	g.beginPath();
	g.arc(cx + R * 0.4, cy + R * 0.46, R * 0.07, 0, TAU);
	g.fill();
	return c;
}

function makeSprites() {
	const nominal = (G.F * G.bobR) / CAM_DIST; // a bob's radius in px at the middle depth
	const S = Math.max(24, Math.ceil(nominal * 2 * 1.5 * DPR) + 2);
	sprites = SWINGS.map((_, i) => paintBob(S, mix(ROYAL, CYAN, i / (NB - 1))));
	const c = document.createElement('canvas');
	c.width = 64;
	c.height = 64;
	const g = c.getContext('2d');
	const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	grad.addColorStop(0, 'rgba(22, 66, 140, 0.55)');
	grad.addColorStop(0.5, 'rgba(22, 66, 140, 0.22)');
	grad.addColorStop(1, 'rgba(22, 66, 140, 0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, 64, 64);
	shadowSprite = c;
}

/* ---------- layout: where the rig goes (above the info panel, below the top bar) ---------- */

function layout() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

	const cr = canvas.getBoundingClientRect();
	const pr = panel.getBoundingClientRect();
	const panelTop = pr.top - cr.top;
	const wide = W >= 1100;
	const roH = readout.offsetHeight || 54;
	const pad = Math.max(16, Math.min(56, W * 0.04));
	const top = 84;
	const panelRight = pr.right - cr.left;
	const free = W - panelRight - 20 - pad; // the width to the right of the panel
	let box;
	if (W > H * 1.3 && panelTop - roH - 26 - top < 190 && free >= 260) {
		// a short landscape screen: the rig goes to the right of the panel, the readout under it
		box = { x: panelRight + 20, y: top, w: free, h: Math.max(150, H - top - roH - 30) };
		readout.style.left = `${box.x + free / 2}px`;
		readout.style.bottom = '16px';
	} else if (wide) {
		// the readout sits to the right of the panel, level with it
		const hintLeft = hint && hint.offsetWidth ? hint.getBoundingClientRect().left - cr.left : W - pad;
		readout.style.left = `${(panelRight + hintLeft) / 2}px`;
		readout.style.bottom = '26px';
		box = { x: pad, y: top, w: W - 2 * pad, h: Math.max(150, panelTop - 14 - top) };
	} else {
		// the readout sits just above the panel, centred
		readout.style.left = '50%';
		readout.style.bottom = `${Math.max(8, H - panelTop + 12)}px`;
		box = { x: pad, y: top, w: W - 2 * pad, h: Math.max(150, panelTop - roH - 26 - top) };
	}
	const bobR = W < 560 ? 0.46 : 0.4;

	// pick the rig's proportions (string length against row width) to match the box
	let lo = 0.45;
	let hi = 0.95;
	const target = box.w / box.h;
	for (let k = 0; k < 14; k++) {
		const mid = (lo + hi) / 2;
		const b = bounds(makeGeom(mid, bobR));
		if ((b.x1 - b.x0) / (b.y1 - b.y0) > target) lo = mid;
		else hi = mid;
	}
	const g = makeGeom((lo + hi) / 2, bobR);
	fit(g, box);
	G = g;
	makeSprites();
}

/* ---------- the clock: elapsed seconds, advanced only while the loop runs ---------- */

let clock = 0;
let prevT = null;

function advance(t) {
	// a gap of half a second or more means the loop was stopped (paused, off-screen, hidden): do not count it
	if (prevT !== null) {
		const d = t - prevT;
		if (d > 0 && d < 0.5) clock += d;
	}
	prevT = t;
}

const swing = (i, t) => AMP * Math.cos((TAU * SWINGS[i] * t) / CYCLE);

/* ---------- drawing ---------- */

const bx = new Float64Array(NB);
const by = new Float64Array(NB);
const bz = new Float64Array(NB);
const bs = new Float64Array(NB); // each bob's radius in px
const tx = new Float64Array(NB * (TRAIL_STEPS + 1));
const ty = new Float64Array(NB * (TRAIL_STEPS + 1));
const order = Array.from({ length: NB }, (_, i) => i);

function poly(points) {
	ctx.beginPath();
	for (let i = 0; i < points.length; i += 2) {
		if (i === 0) ctx.moveTo(points[i], points[i + 1]);
		else ctx.lineTo(points[i], points[i + 1]);
	}
	ctx.closePath();
}

function rod(x0, y0, z0, x1, y1, z1, width, style) {
	project(x0, y0, z0);
	const ax = sx;
	const ay = sy;
	const w0 = width / sz;
	project(x1, y1, z1);
	ctx.strokeStyle = style;
	ctx.lineWidth = ((w0 + width / sz) / 2) * G.F;
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(sx, sy);
	ctx.stroke();
}

function draw() {
	const g = G;
	ctx.clearRect(0, 0, W, H);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	// the glass floor the rig stands on, with a soft blue contact shadow under it
	project(-g.pw, -g.hf, -g.pz);
	const a0x = sx;
	const a0y = sy;
	project(g.pw, -g.hf, -g.pz);
	const a1x = sx;
	const a1y = sy;
	project(g.pw, -g.hf, g.pz);
	const a2x = sx;
	const a2y = sy;
	project(-g.pw, -g.hf, g.pz);
	const a3x = sx;
	const a3y = sy;
	project(g.pw, -g.hf - 0.4, g.pz);
	const f2x = sx;
	const f2y = sy;
	project(-g.pw, -g.hf - 0.4, g.pz);
	const f3x = sx;
	const f3y = sy;
	const mid = (a2x + a3x) / 2;
	const rx = (a2x - a3x) / 2 * 1.02;
	ctx.save();
	ctx.translate(mid, (f2y + f3y) / 2 + rx * 0.02);
	ctx.scale(1, 0.085);
	let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
	grad.addColorStop(0, 'rgba(22, 66, 140, 0.34)');
	grad.addColorStop(0.55, 'rgba(22, 66, 140, 0.14)');
	grad.addColorStop(1, 'rgba(22, 66, 140, 0)');
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.arc(0, 0, rx, 0, TAU);
	ctx.fill();
	ctx.restore();
	// the slab's front face, then its top
	poly([a3x, a3y, a2x, a2y, f2x, f2y, f3x, f3y]);
	ctx.fillStyle = 'rgba(77, 159, 243, 0.34)';
	ctx.fill();
	poly([a0x, a0y, a1x, a1y, a2x, a2y, a3x, a3y]);
	grad = ctx.createLinearGradient(0, Math.min(a0y, a1y), 0, Math.max(a2y, a3y));
	grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
	grad.addColorStop(1, 'rgba(255, 255, 255, 0.72)');
	ctx.fillStyle = grad;
	ctx.fill();
	// the edge: left, front and right only (the back edge would cut a line through the swing)
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(94, 128, 174, 0.45)';
	ctx.beginPath();
	ctx.moveTo(a0x, a0y);
	ctx.lineTo(a3x, a3y);
	ctx.lineTo(a2x, a2y);
	ctx.lineTo(a1x, a1y);
	ctx.stroke();

	// every bob's place at this moment
	for (let i = 0; i < NB; i++) {
		const a = swing(i, clock);
		const len = g.L0 * LEN[i];
		project(g.px[i], -len * Math.cos(a), len * Math.sin(a));
		bx[i] = sx;
		by[i] = sy;
		bz[i] = sz;
		bs[i] = (g.F * g.bobR) / sz;
	}

	// the bobs' shadows on the glass: a top-down echo of the wave
	for (let i = 0; i < NB; i++) {
		const len = g.L0 * LEN[i];
		project(g.px[i], -g.hf, len * Math.sin(swing(i, clock)));
		const r = (g.F * g.bobR * 1.15) / sz;
		ctx.globalAlpha = 0.85;
		ctx.drawImage(shadowSprite, sx - r, sy - r * SIN_P, 2 * r, 2 * r * SIN_P);
	}
	ctx.globalAlpha = 1;

	// the frame: two uprights, the base rail and the top beam
	const navy = '#0a2c74';
	rod(-g.xf, 0, 0, -g.xf, -g.hf, 0, 0.3, 'rgba(10, 44, 116, 0.86)');
	rod(g.xf, 0, 0, g.xf, -g.hf, 0, 0.3, 'rgba(10, 44, 116, 0.86)');
	rod(-g.xf, -g.hf, 0, g.xf, -g.hf, 0, 0.26, 'rgba(10, 44, 116, 0.7)');
	rod(-g.xf, 0, 0, g.xf, 0, 0, 0.62, navy);
	rod(-g.xf + 0.2, 0.14, 0, g.xf - 0.2, 0.14, 0, 0.12, 'rgba(120, 190, 255, 0.55)');

	// the trails: each bob's own recent positions, faint azure, older ones fainter
	for (let i = 0; i < NB; i++) {
		const len = g.L0 * LEN[i];
		for (let k = 0; k <= TRAIL_STEPS; k++) {
			const a = swing(i, clock - k * TRAIL_DT);
			project(g.px[i], -len * Math.cos(a), len * Math.sin(a));
			tx[i * (TRAIL_STEPS + 1) + k] = sx;
			ty[i * (TRAIL_STEPS + 1) + k] = sy;
		}
	}
	ctx.lineCap = 'butt';
	const tw = (g.F * g.bobR * 0.95) / CAM_DIST;
	for (let k = TRAIL_STEPS - 1; k >= 0; k--) {
		const f = 1 - k / TRAIL_STEPS;
		ctx.strokeStyle = `rgba(77, 159, 243, ${(0.04 + 0.3 * f * f).toFixed(3)})`;
		ctx.lineWidth = tw * (0.35 + 0.65 * f);
		ctx.beginPath();
		for (let i = 0; i < NB; i++) {
			const o = i * (TRAIL_STEPS + 1) + k;
			ctx.moveTo(tx[o + 1], ty[o + 1]);
			ctx.lineTo(tx[o], ty[o]);
		}
		ctx.stroke();
	}
	ctx.lineCap = 'round';

	// the pivots on the beam
	for (let i = 0; i < NB; i++) {
		project(g.px[i], -0.12, 0);
		const r = (g.F * 0.2) / sz;
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(sx, sy, r * 1.35, 0, TAU);
		ctx.fill();
		ctx.fillStyle = '#46d0fb';
		ctx.beginPath();
		ctx.arc(sx, sy, r, 0, TAU);
		ctx.fill();
	}

	// threads and bobs, far ones first
	order.sort((p, q) => bz[q] - bz[p]);
	for (const i of order) {
		project(g.px[i], -0.12, 0);
		ctx.strokeStyle = 'rgba(36, 75, 140, 0.55)';
		ctx.lineWidth = Math.max(0.9, (g.F * 0.05) / bz[i]);
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(bx[i], by[i]);
		ctx.stroke();
		const r = bs[i];
		ctx.drawImage(sprites[i], bx[i] - r, by[i] - r, 2 * r, 2 * r);
	}
}

/* ---------- the readout ---------- */

let shownTenth = -1;
let shownName = '';

function nameAt(ph) {
	const s = Math.min(ph, CYCLE - ph); // the second half of the cycle mirrors the first
	for (const m of MARKERS) if (Math.abs(s - m.t) <= m.tol) return m.name;
	return 'Drifting';
}

function updateReadout() {
	const ph = ((clock % CYCLE) + CYCLE) % CYCLE;
	const tenth = Math.floor(ph * 10);
	if (tenth !== shownTenth) {
		shownTenth = tenth;
		timeEl.textContent = (tenth / 10).toFixed(1);
		const name = nameAt(ph);
		if (name !== shownName) {
			shownName = name;
			nameEl.textContent = name;
		}
	}
	barEl.style.transform = `scaleX(${(ph / CYCLE).toFixed(4)})`;
}

/* ---------- sound: Web Audio, only after a click on the Sound button ---------- */

const PENTA = [0, 2, 4, 7, 9]; // a major pentatonic ladder: whatever the pattern, the ticks stay consonant
const NOTE_HZ = SWINGS.map((_, i) => 130.81 * 2 ** ((PENTA[i % 5] + 12 * Math.floor(i / 5)) / 12));

let audio = null;
let master = null;
let soundOn = false;
let voices = 0;
const crossed = new Int32Array(NB);
let crossReady = false;
const TICK_GAP = 0.12; // seconds: at most about eight ticks a second, however many bobs cross
let lastTick = -1;

function ensureAudio() {
	if (audio) return true;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return false;
	audio = new AC();
	master = audio.createGain();
	master.gain.value = 0;
	const comp = audio.createDynamicsCompressor(); // an 18-note chord must not clip
	comp.threshold.value = -20;
	comp.ratio.value = 6;
	master.connect(comp);
	comp.connect(audio.destination);
	return true;
}

/* one tick: a short sine at the bob's note with a tiny bright click on top, panned along the row */
function blip(i, loud) {
	if (!audio || audio.state !== 'running' || voices > 30) return;
	const now = audio.currentTime;
	const out = audio.createGain();
	const peak = loud ? 0.07 : 0.032;
	out.gain.setValueAtTime(0.0001, now);
	out.gain.exponentialRampToValueAtTime(peak, now + 0.004);
	out.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
	const body = audio.createOscillator();
	body.type = 'sine';
	body.frequency.value = NOTE_HZ[i];
	const click = audio.createOscillator();
	click.type = 'triangle';
	click.frequency.value = NOTE_HZ[i] * 4;
	const clickGain = audio.createGain();
	clickGain.gain.setValueAtTime(0.0001, now);
	clickGain.gain.exponentialRampToValueAtTime(0.35, now + 0.002);
	clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
	body.connect(out);
	click.connect(clickGain).connect(out);
	let tail = out;
	if (audio.createStereoPanner) {
		const pan = audio.createStereoPanner();
		pan.pan.value = (i / (NB - 1) - 0.5) * 1.4;
		out.connect(pan);
		tail = pan;
	}
	tail.connect(master);
	voices++;
	body.onended = () => { voices--; };
	body.start(now);
	click.start(now);
	body.stop(now + 0.22);
	click.stop(now + 0.05);
}

/* a bob crosses the centre when 2 x swings x t / cycle passes a half-integer; counted from the clock, so a
   jump (Next pattern) or a pause makes no burst of ticks. Thinned: one voice per frame (the middle of the bobs that
   crossed), at most one every TICK_GAP; when a third of the row crosses at once (it is lining up), it rings louder */
function crossings() {
	let count = 0;
	let sum = 0;
	for (let i = 0; i < NB; i++) {
		const k = Math.floor((2 * SWINGS[i] * clock) / CYCLE - 0.5);
		if (crossReady && soundOn && k === crossed[i] + 1) { count++; sum += i; }
		crossed[i] = k;
	}
	crossReady = true;
	if (count && audio && audio.currentTime - lastTick >= TICK_GAP) {
		blip(Math.round(sum / count), count >= NB / 3);
		lastTick = audio.currentTime;
	}
}

function setSound(on) {
	if (on && !ensureAudio()) {
		soundBtn.disabled = true;
		soundBtn.title = 'This browser has no Web Audio';
		return;
	}
	soundOn = on;
	soundBtn.setAttribute('aria-pressed', String(on));
	if (!audio) return;
	if (on) audio.resume();
	master.gain.setTargetAtTime(on ? 0.55 : 0, audio.currentTime, 0.01);
	if (on) setTimeout(() => blip(Math.floor(NB / 2), true), 30); // one soft note, so the click confirms it is on
}

/* ---------- controls and start ---------- */

function nextPattern() {
	const cycle = Math.floor(clock / CYCLE);
	const ph = clock - cycle * CYCLE;
	const next = MARKERS.find((m) => m.t > ph + 0.05);
	clock = cycle * CYCLE + (next ? next.t : CYCLE);
	crossReady = false;
	draw();
	updateReadout();
}

function start() {
	layout();
	const reduced = prefersReducedMotion();
	if (reduced) clock = STILL_T;
	draw();
	updateReadout();
	nextBtn.addEventListener('click', nextPattern);

	const syncControls = () => {
		const off = prefersReducedMotion();
		pauseBtn.disabled = off;
		soundBtn.disabled = off || !(window.AudioContext || window.webkitAudioContext);
		if (off && soundOn) setSound(false);
		if (off) soundBtn.title = 'Sound is off while reduced motion is on';
	};
	syncControls();
	// a change of the system setting while the page is open: stop at once, or start fresh
	reducedMotionQuery.addEventListener?.('change', () => {
		if (reduced === prefersReducedMotion()) return;
		if (prefersReducedMotion()) { syncControls(); draw(); } else location.reload();
	});

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); draw(); }, 120);
	});
	// the panel can fold away: the rig then gets the room
	new MutationObserver(() => { layout(); draw(); }).observe(panel, { attributes: true, attributeFilter: ['data-collapsed'] });

	if (reduced) return;

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	const ctl = loop(canvas, (dt, t) => {
		advance(t);
		crossings();
		draw();
		updateReadout();
	}, { name: 'pendulum-wave' });

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		prevT = null;
		if (paused) ctl.stop(); else ctl.start();
	});
	soundBtn.addEventListener('click', () => setSound(!soundOn));
}

boot();
start();
