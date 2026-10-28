/*
 * Sample 49 — "Epicycle Drawing Machine".
 * A chain of up to 300 thin navy circles, laid end to end, redraws the TJ letterform: the tip of the last circle (a cyan
 * dot) traces the outline and leaves a trail that fades from royal to azure. The outline is 512 points sampled around
 * TJ-Hosting's own letterform (the path from its favicon, sampled by this file, no SVG needed); a discrete Fourier
 * transform turns those points into one rotating vector per frequency, and the vectors are laid end to end, lowest
 * frequency first (+1, -1, +2, -2 ...). The "Circles" slider keeps the first 1 to 300 of them, so the drawing visibly
 * resolves from a plain circle to the letter. "Draw your own" takes one stroke from the pointer (mouse, finger or pen),
 * closes it, resamples it to 512 points and runs the same transform on it. Every frame is a pure function of one clock
 * (the phase, in cycles), which only advances while loop() runs, so Pause, off-screen and a hidden tab stop it.
 * Reduced motion: one still frame, the whole outline drawn and the circles frozen at one moment, no loop, no timers.
 *
 * Adapted from Fourier Series Animation by Jason Wang (https://github.com/jasonfyw/fourier-series, commit
 * 7bb6c561b01fccd9813ff6e6612b11c0890a8cba), MIT. What was taken is only the maths of src/computations: a closed path
 * is a function of t from 0 to 1 into the complex plane, its n-th coefficient is the sum (the source's Riemann sum) of
 * the path times a spinning exponential, and the drawing is the sum of coefficient times exp(2 pi i n t), with every
 * term kept separate so each circle can be drawn. Changes: plain JavaScript on Canvas 2D (no React, mathjs, lodash or
 * p5); 512 samples and a table of the unit circle instead of a 0.001 step; the exponent's sign is the usual one, so the
 * shape is traced in its own direction (the source reverses its points to correct for the other sign); the vectors are
 * ordered +1, -1, +2, -2 ... and the constant term is dropped (it is the shape's centre); the trail, the pre-baked TJ
 * outline, the stroke capture and everything on screen are new.
 *
 * MIT License
 *
 * Copyright (c) 2022 Jason Wang
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
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const panel = document.querySelector('.sample-info');
const bar = document.getElementById('bar');
const note = document.getElementById('note');
const slider = document.getElementById('circles');
const out = document.getElementById('circles-out');
const drawBtn = document.querySelector('[data-action="draw"]');
const tjBtn = document.querySelector('[data-action="tj"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const TAU = Math.PI * 2;
const N = 512; // points around a shape; a power of two, so the table index (n * m) & MASK is the transform's exponent
const MASK = N - 1;
const MAXC = 300; // most circles the slider allows
const START_C = 200; // circles at first
const CYCLE = 12; // seconds for the tip to go once round, at full speed
const TRAIL = 0.9; // the trail is the last 90 % of a lap
const STILL_PHASE = 0.56; // where the circles are frozen in the reduced-motion still
const reduced = prefersReducedMotion();

/* the unit circle, once: COS[m] and SIN[m] are cos and sin of 2 pi m / N */
const COS = new Float64Array(N);
const SIN = new Float64Array(N);
for (let m = 0; m < N; m++) {
	COS[m] = Math.cos((TAU * m) / N);
	SIN[m] = Math.sin((TAU * m) / N);
}

/* circle k turns n = NK[k] times a lap: +1, -1, +2, -2 ... so the biggest, slowest circles come first */
const NK = new Int32Array(MAXC);
for (let k = 0; k < MAXC; k++) NK[k] = k & 1 ? -((k + 1) >> 1) : (k >> 1) + 1;

/* ---------- shapes: 512 points, and the circles that draw them ---------- */

/* the TJ letterform, from the favicon of tj-hosting.ca:
   d="M10 12 H90 V30 H59 V62 A23 23 0 0 1 13 62 H31 A5 5 0 0 0 41 62 V30 H10 Z"
   as lines [x0, y0, x1, y1] and arcs [cx, cy, r, from, to] (angles in radians, y down) */
const TJ_PATH = [
	['L', 10, 12, 90, 12], ['L', 90, 12, 90, 30], ['L', 90, 30, 59, 30], ['L', 59, 30, 59, 62],
	['A', 36, 62, 23, 0, Math.PI], // the hook of the J, a half circle below
	['L', 13, 62, 31, 62],
	['A', 36, 62, 5, Math.PI, 0], // the small inner curve
	['L', 41, 62, 41, 30], ['L', 41, 30, 10, 30], ['L', 10, 30, 10, 12],
];

/* N points along the TJ outline, spread by length, so every corner is a sample */
function tjPoints() {
	const lens = TJ_PATH.map((s) => (s[0] === 'L' ? Math.hypot(s[3] - s[1], s[4] - s[2]) : s[3] * Math.abs(s[5] - s[4])));
	const total = lens.reduce((a, b) => a + b, 0);
	const counts = lens.map((l) => Math.floor((N * l) / total));
	let left = N - counts.reduce((a, b) => a + b, 0);
	const byRemainder = lens.map((l, i) => [i, (N * l) / total - counts[i]]).sort((a, b) => b[1] - a[1]);
	for (let i = 0; left > 0; i = (i + 1) % byRemainder.length, left--) counts[byRemainder[i][0]]++;
	const px = new Float64Array(N);
	const py = new Float64Array(N);
	let m = 0;
	TJ_PATH.forEach((s, i) => {
		for (let j = 0; j < counts[i]; j++, m++) {
			const f = j / counts[i];
			if (s[0] === 'L') {
				px[m] = s[1] + (s[3] - s[1]) * f;
				py[m] = s[2] + (s[4] - s[2]) * f;
			} else {
				const a = s[4] + (s[5] - s[4]) * f;
				px[m] = s[1] + s[3] * Math.cos(a);
				py[m] = s[2] + s[3] * Math.sin(a);
			}
		}
	});
	return [px, py];
}

/* N points along a drawn stroke, spread by length, with the last point joined back to the first */
function strokePoints(pts) {
	const n = pts.length / 2;
	const cum = new Float64Array(n + 1);
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		cum[i + 1] = cum[i] + Math.hypot(pts[2 * j] - pts[2 * i], pts[2 * j + 1] - pts[2 * i + 1]);
	}
	const total = cum[n];
	const px = new Float64Array(N);
	const py = new Float64Array(N);
	let seg = 0;
	for (let m = 0; m < N; m++) {
		const s = (m * total) / N;
		while (seg < n - 1 && cum[seg + 1] < s) seg++;
		const f = (s - cum[seg]) / Math.max(1e-9, cum[seg + 1] - cum[seg]);
		const a = seg;
		const b = (seg + 1) % n;
		px[m] = pts[2 * a] + (pts[2 * b] - pts[2 * a]) * f;
		py[m] = pts[2 * a + 1] + (pts[2 * b + 1] - pts[2 * a + 1]) * f;
	}
	return [px, py];
}

/* the transform: the points as complex numbers (x + iy), their mean moved to the origin, and for each circle the
   coefficient c_n = (1 / N) * sum of z_m * exp(-2 pi i n m / N); the drawing is then the sum of c_n * exp(2 pi i n t) */
function makeShape(px, py) {
	let mx = 0;
	let my = 0;
	for (let m = 0; m < N; m++) {
		mx += px[m];
		my += py[m];
	}
	mx /= N;
	my /= N;
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;
	for (let m = 0; m < N; m++) {
		re[m] = px[m] - mx;
		im[m] = py[m] - my;
		x0 = Math.min(x0, re[m]);
		x1 = Math.max(x1, re[m]);
		y0 = Math.min(y0, im[m]);
		y1 = Math.max(y1, im[m]);
	}
	const cr = new Float64Array(MAXC);
	const ci = new Float64Array(MAXC);
	const mag = new Float64Array(MAXC);
	for (let k = 0; k < MAXC; k++) {
		const n = NK[k];
		let sr = 0;
		let si = 0;
		for (let m = 0; m < N; m++) {
			const idx = (n * m) & MASK;
			sr += re[m] * COS[idx] + im[m] * SIN[idx];
			si += im[m] * COS[idx] - re[m] * SIN[idx];
		}
		cr[k] = sr / N;
		ci[k] = si / N;
		mag[k] = Math.hypot(cr[k], ci[k]);
	}
	return { re, im, cr, ci, mag, bw: x1 - x0, bh: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

const TJ = makeShape(...tjPoints());

/* ---------- state ---------- */

let W = 0;
let H = 0;
let DPR = 1;
let box = { x: 0, y: 0, w: 1, h: 1 }; // where the drawing goes
let S = 1; // pixels per shape unit
let OX = 0; // where the circles' centre is, in px
let OY = 0;

let shape = TJ;
let isTJ = true;
let mode = 'play'; // 'play' or 'draw'
let armed = false; // draw mode was asked for with the button, not started by a drag
let stroke = null; // the line being drawn: [x, y, x, y, ...]
let strokeId = null;
let phase = 0; // the clock, in laps
let elapsed = 0; // laps since the shape started, so the trail can grow from nothing
let kTarget = START_C; // the circles the visitor chose
let kNow = START_C; // the circles in use (they ramp up from 1 after a new shape)
let ramp = null;
let ctl = null; // loop() controller

/* per-frame buffers: each circle's vector now, the chain's joints, and the trail's points */
const AR = new Float64Array(MAXC);
const AI = new Float64Array(MAXC);
const CX = new Float64Array(MAXC + 1);
const CY = new Float64Array(MAXC + 1);
const TX = new Float64Array(N + 2);
const TY = new Float64Array(N + 2);

const smooth = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

function setK(k) {
	kNow = k;
	if (+slider.value !== k) slider.value = String(k);
	out.textContent = String(k);
	slider.setAttribute('aria-valuetext', `${k} circles`);
	// the fill ends at the thumb's centre (the thumb is 22 px wide)
	slider.style.setProperty('--p', `calc(11px + (100% - 22px) * ${((k - 1) / (MAXC - 1)).toFixed(4)})`);
}

/* ---------- layout: the drawing goes beside the info panel on wide screens, above it on narrow ones ---------- */

let layoutKey = '';

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
	const panelRight = pr.right - cr.left;
	const gap = Math.max(14, cr.bottom - pr.bottom);
	const pad = Math.max(16, Math.min(56, W * 0.04));
	const top = 84;
	const free = W - panelRight - 24 - pad; // the width to the right of the panel
	const side = (W >= 900 && free >= 470) || (W > H * 1.25 && free >= 240);

	bar.style.width = `${Math.round(Math.min(640, side ? free : W - 2 * pad))}px`;
	const barH = bar.offsetHeight || 56;
	if (side) {
		const cx = panelRight + 24 + free / 2;
		bar.style.left = `${cx}px`;
		bar.style.bottom = `${gap}px`;
		box = { x: panelRight + 24, y: top, w: free, h: Math.max(150, H - gap - barH - 18 - top) };
	} else {
		bar.style.left = '50%';
		bar.style.bottom = `${Math.max(8, H - panelTop + 10)}px`;
		box = { x: pad, y: top, w: W - 2 * pad, h: Math.max(150, panelTop - 10 - barH - 12 - top) };
	}
	note.style.left = `${box.x + box.w / 2}px`;
	note.style.top = `${box.y + 4}px`;
	fit();
	layoutKey = `${W}x${H}|${Math.round(pr.left)},${Math.round(pr.top)},${Math.round(pr.width)},${Math.round(pr.height)}|${barH}`;
}

/* scale and place the current shape in the box */
function fit() {
	const m = Math.max(shape.bw, shape.bh);
	S = 0.8 * Math.min(box.w / Math.max(shape.bw, m * 0.25), box.h / Math.max(shape.bh, m * 0.25));
	OX = box.x + box.w / 2 - S * shape.cx;
	OY = box.y + box.h / 2 - S * shape.cy;
}

/* ---------- drawing ---------- */

const NAVY = '10, 44, 116';
const ROYAL = [12, 107, 237];
const AZURE = [77, 159, 243];

function draw() {
	ctx.clearRect(0, 0, W, H);
	if (mode === 'draw') {
		drawStroke();
		return;
	}
	const K = kNow;
	const th = TAU * phase;
	const wide = W >= 560;

	// the chain: circle k's vector now, and where each one ends
	let x = 0;
	let y = 0;
	CX[0] = 0;
	CY[0] = 0;
	for (let k = 0; k < K; k++) {
		const a = NK[k] * th;
		const c = Math.cos(a);
		const s = Math.sin(a);
		const re = shape.cr[k] * c - shape.ci[k] * s;
		const im = shape.cr[k] * s + shape.ci[k] * c;
		AR[k] = re;
		AI[k] = im;
		x += re;
		y += im;
		CX[k + 1] = x;
		CY[k + 1] = y;
	}

	// the trail: where the tip was at the last M / N of a lap, found from the same circles (j steps back in time)
	const frac = reduced ? 1 : Math.min(TRAIL, elapsed);
	const M = Math.max(2, Math.round(frac * N) + 1);
	for (let j = 0; j < M; j++) {
		let sx = 0;
		let sy = 0;
		for (let k = 0; k < K; k++) {
			const idx = (NK[k] * j) & MASK;
			sx += AR[k] * COS[idx] + AI[k] * SIN[idx];
			sy += AI[k] * COS[idx] - AR[k] * SIN[idx];
		}
		TX[j] = OX + S * sx;
		TY[j] = OY + S * sy;
	}

	// 1. the outline being copied, very faint
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.lineWidth = 1.4;
	ctx.strokeStyle = `rgba(${NAVY}, 0.12)`;
	ctx.beginPath();
	for (let m = 0; m <= N; m += 2) {
		const i = m & MASK;
		if (m === 0) ctx.moveTo(OX + S * shape.re[i], OY + S * shape.im[i]);
		else ctx.lineTo(OX + S * shape.re[i], OY + S * shape.im[i]);
	}
	ctx.stroke();

	// 2. the circles: one path, thin, the tiny ones left out
	ctx.lineWidth = 1;
	ctx.strokeStyle = `rgba(${NAVY}, 0.2)`;
	ctx.beginPath();
	for (let k = 0; k < K; k++) {
		const r = shape.mag[k] * S;
		if (r < 0.9) continue;
		const cx = OX + S * CX[k];
		const cy = OY + S * CY[k];
		ctx.moveTo(cx + r, cy);
		ctx.arc(cx, cy, r, 0, TAU);
	}
	ctx.stroke();

	// 3. the trail: batches of segments, royal and solid at the tip, azure and faint behind
	const nb = 28;
	const per = Math.max(2, Math.ceil((M - 1) / nb));
	const full = reduced ? N : TRAIL * N;
	const minA = reduced ? 0.5 : 0.24;
	ctx.lineCap = 'butt';
	ctx.lineWidth = wide ? 4.2 : 3.4;
	for (let b = Math.floor((M - 2) / per); b >= 0; b--) {
		const j0 = b * per;
		const j1 = Math.min(M - 1, (b + 1) * per);
		const f = Math.min(1, (j0 + j1) / 2 / full);
		const a = minA + (0.96 - minA) * (1 - f) ** 0.9;
		const r = Math.round(ROYAL[0] + (AZURE[0] - ROYAL[0]) * f);
		const g = Math.round(ROYAL[1] + (AZURE[1] - ROYAL[1]) * f);
		const bl = Math.round(ROYAL[2] + (AZURE[2] - ROYAL[2]) * f);
		ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${a.toFixed(3)})`;
		ctx.beginPath();
		ctx.moveTo(TX[j0], TY[j0]);
		for (let j = j0 + 1; j <= j1; j++) ctx.lineTo(TX[j], TY[j]);
		ctx.stroke();
	}

	// 4. the arms: the chain itself, in one thin navy line
	ctx.lineCap = 'round';
	ctx.lineWidth = 1.2;
	ctx.strokeStyle = `rgba(${NAVY}, 0.62)`;
	ctx.beginPath();
	ctx.moveTo(OX, OY);
	for (let k = 1; k <= K; k++) ctx.lineTo(OX + S * CX[k], OY + S * CY[k]);
	ctx.stroke();

	// 5. the centre, and the pen tip: a cyan dot with a white ring
	ctx.fillStyle = `rgba(${NAVY}, 0.8)`;
	ctx.beginPath();
	ctx.arc(OX, OY, 2.4, 0, TAU);
	ctx.fill();
	penTip(OX + S * CX[K], OY + S * CY[K]);
}

function penTip(px, py) {
	// a soft cyan halo first, so the tip reads on the sky at a glance
	const halo = ctx.createRadialGradient(px, py, 4, px, py, 20);
	halo.addColorStop(0, 'rgba(70, 208, 251, 0.55)');
	halo.addColorStop(1, 'rgba(70, 208, 251, 0)');
	ctx.fillStyle = halo;
	ctx.beginPath();
	ctx.arc(px, py, 20, 0, TAU);
	ctx.fill();
	ctx.save();
	ctx.shadowColor = 'rgba(22, 66, 140, 0.45)';
	ctx.shadowBlur = 9;
	ctx.shadowOffsetY = 2;
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(px, py, 7.6, 0, TAU);
	ctx.fill();
	ctx.restore();
	ctx.fillStyle = '#46d0fb';
	ctx.beginPath();
	ctx.arc(px, py, 5.4, 0, TAU);
	ctx.fill();
}

/* the line being drawn: navy, with a faint dashed line showing where it will close */
function drawStroke() {
	if (!stroke || stroke.length < 4) return;
	const n = stroke.length;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.setLineDash([4, 7]);
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = `rgba(${NAVY}, 0.3)`;
	ctx.beginPath();
	ctx.moveTo(stroke[n - 2], stroke[n - 1]);
	ctx.lineTo(stroke[0], stroke[1]);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.lineWidth = 2.8;
	ctx.strokeStyle = 'rgba(12, 107, 237, 0.95)';
	ctx.beginPath();
	ctx.moveTo(stroke[0], stroke[1]);
	for (let i = 2; i < n; i += 2) ctx.lineTo(stroke[i], stroke[i + 1]);
	ctx.stroke();
	penTip(stroke[n - 2], stroke[n - 1]);
}

/* draw once when nothing is running the loop (paused, reduced motion, before the first frame) */
function refresh() {
	if (!ctl || !ctl.running) draw();
}

/* ---------- the clock ---------- */

function step(dt) {
	if (mode !== 'play') return;
	if (ramp) {
		ramp.t += dt;
		const u = Math.min(1, ramp.t / ramp.dur);
		setK(Math.max(1, Math.round(1 + (ramp.to - 1) * (1 - (1 - u) ** 3))));
		if (u >= 1) ramp = null;
	}
	// the first lap of a new shape runs faster, so the outline builds up quickly
	const speed = 1 + 1.2 * (1 - smooth(0.7, 1.2, elapsed));
	const d = (dt * speed) / CYCLE;
	phase = (phase + d) % 1;
	elapsed = Math.min(3, elapsed + d);
}

/* start the current shape: the circles grow from 1 to the chosen number; the trail grows from nothing */
function restart(preRoll = 0) {
	phase = 0;
	elapsed = preRoll;
	// reduced motion, or paused: jump straight to the finished drawing
	if (reduced || (ctl && !ctl.wanted)) {
		ramp = null;
		setK(kTarget);
		phase = STILL_PHASE;
		elapsed = 3;
	} else {
		ramp = { t: 0, dur: 3.2, to: kTarget };
		setK(1);
	}
	fit();
}

/* ---------- drawing your own ---------- */

function say(text) {
	note.textContent = text;
	note.classList.toggle('is-on', Boolean(text));
}

function enterDraw(byButton) {
	mode = 'draw';
	armed = byButton;
	drawBtn.textContent = 'Cancel';
	tjBtn.disabled = false;
	if (byButton) say('Draw one line, then let go');
}

function leaveDraw() {
	mode = 'play';
	armed = false;
	stroke = null;
	drawBtn.textContent = 'Draw your own';
	tjBtn.disabled = isTJ;
	say('');
}

function useShape(next, tj) {
	shape = next;
	isTJ = tj;
	leaveDraw();
	restart(0);
	refresh();
}

function strokeLength(pts) {
	let len = 0;
	for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
	return len;
}

function finishStroke() {
	const pts = stroke;
	strokeId = null;
	if (pts && pts.length >= 16 && strokeLength(pts) >= 80) {
		useShape(makeShape(...strokePoints(pts)), false);
		return;
	}
	stroke = null;
	if (armed) say('Draw a longer line');
	else leaveDraw();
	refresh();
}

function addPoint(e) {
	const r = canvas.getBoundingClientRect();
	const x = Math.min(W, Math.max(0, e.clientX - r.left));
	const y = Math.min(H, Math.max(0, e.clientY - r.top));
	const n = stroke.length;
	if (n && Math.hypot(x - stroke[n - 2], y - stroke[n - 1]) < 2.5) return;
	if (n < 8000) stroke.push(x, y);
}

canvas.addEventListener('pointerdown', (e) => {
	if (strokeId !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
	e.preventDefault();
	canvas.setPointerCapture(e.pointerId);
	strokeId = e.pointerId;
	if (mode !== 'draw') enterDraw(false);
	say('');
	stroke = [];
	addPoint(e);
	refresh();
});
canvas.addEventListener('pointermove', (e) => {
	if (e.pointerId !== strokeId || !stroke) return;
	const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
	for (const c of list.length ? list : [e]) addPoint(c);
	refresh();
});
const lift = (e) => {
	if (e.pointerId !== strokeId) return;
	finishStroke();
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);

drawBtn.addEventListener('click', () => {
	if (mode === 'draw') {
		leaveDraw(); // cancel: the machine carries on
	} else {
		enterDraw(true);
	}
	refresh();
});
tjBtn.addEventListener('click', () => useShape(TJ, true));

slider.addEventListener('input', () => {
	kTarget = +slider.value;
	ramp = null;
	setK(kTarget);
	refresh();
});

/* ---------- start ---------- */

function start() {
	setK(START_C);
	tjBtn.disabled = true;
	layout();
	if (reduced) {
		restart();
		draw();
		pauseBtn.disabled = true;
	} else {
		// the first view is as if the machine had already run most of a lap
		restart(0.8);
		ctl = loop(canvas, (dt) => {
			step(dt);
			draw();
		}, { name: 'epicycle-machine' });
		pauseBtn.addEventListener('click', () => {
			const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
			pauseBtn.setAttribute('aria-pressed', String(paused));
			pauseBtn.textContent = paused ? 'Play' : 'Pause';
			if (paused) ctl.stop(); else ctl.start();
		});
	}

	// the panel can fold away, fonts can change its height and the window can resize: lay out again, once, when any does
	let timer = 0;
	const relayout = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const pr = panel.getBoundingClientRect();
			const key = `${canvas.clientWidth}x${canvas.clientHeight}|${Math.round(pr.left)},${Math.round(pr.top)},${Math.round(pr.width)},${Math.round(pr.height)}|${bar.offsetHeight}`;
			if (key === layoutKey) return;
			layout();
			refresh();
		}, 80);
	};
	if (window.ResizeObserver) {
		const ro = new ResizeObserver(relayout);
		ro.observe(canvas);
		ro.observe(panel);
		ro.observe(bar);
	} else {
		addEventListener('resize', relayout);
	}
}

boot();
start();
