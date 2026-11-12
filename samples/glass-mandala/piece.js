/*
 * Sample 55 — "Glass mandala".
 * A drawing toy on a round light-glass plate. Each stroke is stored once, as points in a space where the plate's radius is 1,
 * and repeated around the centre at draw time (2 to 24 folds, each fold optionally mirrored), so changing the folds, undoing
 * or resizing redraws the whole picture from the stored points. Canvas 2D only; no library.
 * Hand drawing is drawn straight from the pointer events, so nothing runs while the plate is idle. A demo draws a first
 * mandala on load, and one more stroke after about ten quiet seconds, and "Surprise me" draws a few strokes the same way:
 * all of that runs only inside loop() (on screen, tab visible, not paused, motion allowed) and then rests. Under reduced
 * motion the finished mandala is drawn at once and nothing runs; hand drawing still works. Nothing is saved in the
 * browser: the picture leaves only through "Download PNG" (1024 px, transparent background, an <a download> to an object URL).
 *
 * Adapted from Mandala-Maker by Olivier Giulieri (https://github.com/evoluteur/mandala-maker, js/mandala.js at commit
 * bbc8f445af13d68a21b81d49b469a71fb6055bdb), MIT. What was taken is the method: strokes kept in unit coordinates and repeated
 * by rotation (and a flip for the mirror) at draw time, an offscreen cache of the finished strokes with the live stroke
 * drawn on top, quadratic smoothing through the stroke's midpoints, undo, redo and clear with a way back, random
 * curves for "Surprise me", and the object-URL PNG download. Changes: written again as a module on the Lab's helpers; colour
 * modes in DS v9's blues that colour a stroke by its distance from the centre in bands (each band is one reusable Path2D),
 * with a white glass edge under the strokes in Glass and Sky; strokes drawn stroke by stroke through all folds, so a later
 * stroke lies over an earlier one; edits grouped into undo steps; a transparent 1024 px PNG; demo strokes that draw
 * themselves in, a seeded first mandala (also the reduced-motion still) and an idle stroke; the SVG export, background
 * choices, rainbow and cycling colours, opacity control, custom colour, guides switch, the web-app files, and the saving of
 * strokes and settings in the browser are all left out (the Lab stores nothing).
 *
 * MIT License
 *
 * Copyright (c) 2026 Olivier Giulieri
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

const $ = (sel) => document.querySelector(sel);
const canvas = $('.piece');
const ctx = canvas.getContext('2d');
const plate = $('.plate');
const statusEl = $('#status');
const foldsIn = $('#folds');
const brushIn = $('#brush');
const modeBtns = [...document.querySelectorAll('[data-mode]')];
const btn = (name) => $(`[data-action="${name}"]`);
const mirrorBtn = btn('mirror');
const undoBtn = btn('undo');
const redoBtn = btn('redo');
const clearBtn = btn('clear');
const surpriseBtn = btn('surprise');
const saveBtn = btn('save');
const pauseBtn = btn('pause');

const TAU = Math.PI * 2;
const EDGE = 0.96; // the picture's radius, as a share of half the canvas: a margin inside the plate's rim
const BANDS = 5; // a stroke is coloured by distance from the centre, in this many bands
const MIN_STEP = 0.01; // the closest two points of a hand stroke may be, in plate radii
const EXPORT_SIZE = 1024;
const IDLE_MS = 10000; // quiet time before the idle stroke
const DEFAULT_NOTE = 'Draw on the plate, or press Surprise me.';
const reduced = prefersReducedMotion();

/* ---------- colour modes: DS v9's blues ---------- */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function ramp(stops, t) {
	const f = Math.min(0.999, Math.max(0, t)) * (stops.length - 1);
	const i = Math.floor(f);
	const a = hex(stops[i]);
	const b = hex(stops[i + 1]);
	const k = f - i;
	return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`;
}
const MODES = {
	// navy at the middle out to royal blue
	ink: { alpha: 0.92, width: 1, stops: ['#0a2461', '#0a3f9e', '#0558dc', '#0c6bed'], under: null, accent: null },
	// azure to cyan light, with a white glass edge
	glass: { alpha: 0.9, width: 0.78, stops: ['#2a82ee', '#4d9ff3', '#46d0fb'], under: { color: '#ffffff', k: 1.9, a: 0.85 }, accent: null },
	// pale blues, a royal hairline, and now and then one warm stroke
	sky: { alpha: 0.95, width: 0.85, stops: ['#8cc2f6', '#a9d4fa', '#cde8fc'], under: { color: '#1f5fc8', k: 1.45, a: 0.4 }, accent: '#ffb547' },
};
for (const m of Object.values(MODES)) m.lut = Array.from({ length: BANDS }, (_, b) => ramp(m.stops, (b + 0.5) / BANDS));

/* ---------- state ---------- */

const settings = { folds: 12, mirror: true, brush: 6, mode: 'glass' };
let entries = []; // the picture, as undo steps: each is a list of strokes (a hand stroke is one, a demo or a Surprise a few)
let redoStack = [];
let lastCleared = null;
let cur = null; // the stroke the pointer is drawing: { pts, w, mode, accent, paths }
let demo = null; // a group of strokes drawing itself in: { queue, i, pos, speed, wait, cur, done }
let accentCount = 0;
let paused = false;
let ctl = null; // the loop() controller (none under reduced motion)
let cache = null;
let cctx = null;
let size = 0;
let dpr = 1;

const allStrokes = () => entries.flat().concat(demo ? demo.done : []);

/* ---------- strokes ---------- */

function makeStroke(pts, o = {}) {
	const mode = o.mode || settings.mode;
	let accent = o.accent;
	if (accent === undefined) accent = mode === 'sky' && accentCount++ % 5 === 4;
	return { pts, w: o.w ?? settings.brush / 320, mode, accent: !!accent && !!MODES[mode].accent, paths: null };
}

/* the stroke's curve as Path2D pieces in unit space: one for the whole stroke and one for each colour band it passes through
   (a run of curve inside one band is a single subpath, so only the ends of a run get a round cap) */
function buildPaths(s) {
	const P = s.pts;
	const all = new Path2D();
	const per = new Array(BANDS).fill(null);
	const band = (p) => Math.min(BANDS - 1, Math.floor(Math.min(1, Math.hypot(p[0], p[1])) * BANDS));
	const into = (b) => per[b] || (per[b] = new Path2D());
	if (P.length === 1) {
		for (const p of [all, into(band(P[0]))]) {
			p.moveTo(P[0][0], P[0][1]);
			p.lineTo(P[0][0] + 0.0001, P[0][1]);
		}
	} else {
		let px = P[0][0];
		let py = P[0][1];
		let cur = -1;
		all.moveTo(px, py);
		for (let i = 1; i < P.length; i++) {
			const last = i === P.length - 1;
			const mx = last ? P[i][0] : (P[i][0] + P[i + 1][0]) / 2;
			const my = last ? P[i][1] : (P[i][1] + P[i + 1][1]) / 2;
			const b = band(P[i]);
			const p = into(b);
			if (b !== cur) {
				p.moveTo(px, py);
				cur = b;
			}
			if (last) {
				p.lineTo(mx, my);
				all.lineTo(mx, my);
			} else {
				p.quadraticCurveTo(P[i][0], P[i][1], mx, my);
				all.quadraticCurveTo(P[i][0], P[i][1], mx, my);
			}
			px = mx;
			py = my;
		}
	}
	return { all, bands: per.map((path, b) => (path ? { b, path } : null)).filter(Boolean) };
}

/* the stroke repeated in every fold, merged into one Path2D per colour band (and one for the whole stroke when it is
   needed): a few big strokes are much cheaper than thousands of small ones */
function foldedPaths(s, needAll) {
	const base = s.paths || (s.paths = buildPaths(s));
	const n = settings.folds;
	const all = needAll ? new Path2D() : null;
	const bands = base.bands.map(({ b }) => ({ b, path: new Path2D() }));
	for (let k = 0; k < n; k++) {
		const cos = Math.cos((TAU * k) / n);
		const sin = Math.sin((TAU * k) / n);
		for (let m = 0; m < (settings.mirror ? 2 : 1); m++) {
			// a rotation by the fold's angle, after a flip across the x axis for the mirrored copy
			const t = m ? { a: cos, b: sin, c: sin, d: -cos, e: 0, f: 0 } : { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
			if (all) all.addPath(base.all, t);
			for (let i = 0; i < bands.length; i++) bands[i].path.addPath(base.bands[i].path, t);
		}
	}
	return { all, bands };
}

function drawStroke(c, s) {
	const m = MODES[s.mode];
	const f = foldedPaths(s, !!m.under || s.accent);
	if (m.under) {
		c.lineWidth = s.w * m.under.k;
		c.strokeStyle = m.under.color;
		c.globalAlpha = m.under.a;
		c.stroke(f.all);
	}
	c.lineWidth = s.w * m.width;
	c.globalAlpha = m.alpha;
	if (s.accent) {
		c.strokeStyle = m.accent;
		c.stroke(f.all);
	} else {
		for (const { b, path } of f.bands) {
			c.strokeStyle = m.lut[b];
			c.stroke(path);
		}
	}
}

/* a list of strokes with the current folds, centred in a square of `px` pixels (stroke by stroke, so later ones lie on top) */
function drawStrokes(c, list, px) {
	const R = (px / 2) * EDGE;
	c.save();
	c.translate(px / 2, px / 2);
	c.scale(R, R);
	c.lineCap = 'round';
	c.lineJoin = 'round';
	for (const s of list) drawStroke(c, s);
	c.restore();
	c.globalAlpha = 1;
}

/* faint fold lines on the screen only (never in the PNG) */
function drawGuides(c) {
	const R = (size / 2) * EDGE;
	const n = settings.folds;
	const count = settings.mirror ? 2 * n : n;
	const step = TAU / count;
	c.save();
	c.translate(size / 2, size / 2);
	c.strokeStyle = 'rgba(22, 66, 140, 0.16)';
	c.lineWidth = 1;
	c.setLineDash([3, 6]);
	c.beginPath();
	for (let k = 0; k < count; k++) {
		c.moveTo(0, 0);
		c.lineTo(R * Math.cos(k * step), R * Math.sin(k * step));
	}
	c.stroke();
	c.restore();
}

/* ---------- drawing surfaces ---------- */

function drawOnto(list) {
	cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	drawStrokes(cctx, list, size);
}

function rebuildCache() {
	cctx.setTransform(1, 0, 0, 1, 0, 0);
	cctx.clearRect(0, 0, cache.width, cache.height);
	drawOnto(allStrokes());
}

function render() {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	drawGuides(ctx);
	ctx.drawImage(cache, 0, 0, size, size);
	const live = cur || (demo && demo.cur);
	if (live) drawStrokes(ctx, [live], size);
}

function resize() {
	const w = Math.max(160, Math.round(plate.clientWidth));
	// cap the pixel ratio: the plate is big, and phones can be 3x
	const r = Math.min(2, window.devicePixelRatio || 1);
	if (w === size && r === dpr && canvas.width) return;
	size = w;
	dpr = r;
	for (const c of [canvas, cache]) {
		c.width = Math.round(size * dpr);
		c.height = Math.round(size * dpr);
	}
	rebuildCache();
	render();
}

function fullRedraw() {
	rebuildCache();
	render();
	updateUi();
}

/* ---------- the strokes that draw themselves ---------- */

/* a small seeded generator, so the first mandala (and the reduced-motion still) is always the same one */
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

/* a few curves in four shapes, each laid out inside one fold's wedge so the folds close up into rings, scallops and petals:
   a gentle wave round the ring, a scalloped ring, a leaf and a swaying spoke. rand is Math.random or a seeded generator;
   count strokes, from the middle outwards; kinds (optional) picks the shapes in order. */
const KINDS = ['wave', 'scallop', 'leaf', 'spoke'];
function makeGroup(rand, count, mode, kinds) {
	const sep = TAU / settings.folds; // the angle between two folds
	const wedge = settings.mirror ? sep / 2 : sep; // how far round a ring-shaped stroke goes before it meets the next
	const lo = 0.16;
	const hi = 0.86;
	const slot = (hi - lo) / count;
	const group = [];
	// without a given list, the four shapes in a random order, so a few strokes are never all the same shape
	const order = kinds || KINDS.map((k) => [rand(), k]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
	for (let j = 0; j < count; j++) {
		const base = lo + slot * (j + 0.25 + rand() * 0.5);
		const kind = order[j % order.length];
		const N = 140;
		const lobes = 1 + Math.floor(rand() * 3);
		const amp = 0.025 + rand() * 0.05;
		const c = sep * (0.2 + rand() * 0.12); // a leaf's centre, off the fold's axis, so the mirror shows
		const w = Math.min(c, sep - c) * (0.6 + rand() * 0.3); // a leaf's half width
		const h = Math.min(slot * 1.7, 0.1 + rand() * 0.16); // a leaf's or a spoke's length
		const ac = wedge * (0.25 + rand() * 0.5); // a spoke's middle
		const sway = wedge * (0.05 + rand() * 0.1);
		const pts = [];
		for (let i = 0; i < N; i++) {
			const t = i / (N - 1);
			let a;
			let r;
			if (kind === 'wave') {
				a = wedge * t;
				r = base + amp * Math.sin(TAU * lobes * t);
			} else if (kind === 'scallop') {
				a = wedge * t;
				r = base - amp + 2.2 * amp * Math.abs(Math.sin(Math.PI * (1 + (lobes > 2 ? 1 : 0)) * t));
			} else if (kind === 'leaf') {
				a = c + w * Math.sin(TAU * t);
				r = base - h / 2 + (h * (1 - Math.cos(TAU * t))) / 2;
			} else {
				a = ac + sway * Math.sin(TAU * t);
				r = base - h / 2 + h * t;
			}
			const rr = Math.min(0.97, Math.max(0.04, r));
			pts.push([+(rr * Math.cos(a)).toFixed(4), +(rr * Math.sin(a)).toFixed(4)]);
		}
		group.push(makeStroke(pts, { mode, w: (2 + rand() * 4.5) / 320, accent: mode === 'sky' ? j === count - 2 : false }));
	}
	return group;
}

const canAnimate = () => !reduced && !paused && !document.hidden && !!ctl && ctl.inView;

function syncLoop() {
	if (!ctl) return;
	if (demo && !paused) ctl.start();
	else ctl.stop();
}

function playGroup(group, speed, wait) {
	demo = { queue: group, i: 0, pos: 0, speed, wait, cur: null, done: [] };
	syncLoop();
}

/* stop a demo and keep what has been drawn: all of it (finishAll), or only what the hand left (the rest is dropped) */
function endDemo(finishAll) {
	if (!demo) return;
	const d = demo;
	demo = null;
	const strokes = d.done.slice();
	if (finishAll) {
		for (let j = d.i; j < d.queue.length; j++) {
			strokes.push(d.queue[j]);
			drawOnto([d.queue[j]]);
		}
	} else if (d.cur && d.cur.pts.length > 1) {
		strokes.push(d.cur);
		drawOnto([d.cur]);
	}
	if (strokes.length) {
		entries.push(strokes);
		redoStack = [];
		lastCleared = null;
	}
	syncLoop();
	render();
	updateUi();
}

/* one frame of a demo, called by loop() only */
function tick(dt) {
	if (!demo) return;
	if (demo.wait > 0) {
		demo.wait -= dt;
		return;
	}
	const src = demo.queue[demo.i];
	demo.pos += demo.speed * dt;
	const upto = Math.min(src.pts.length, Math.floor(demo.pos) + 2);
	if (upto >= src.pts.length) {
		drawOnto([src]);
		demo.done.push(src);
		demo.i++;
		demo.pos = 0;
		demo.cur = null;
		demo.wait = 0.22;
		if (demo.i >= demo.queue.length) {
			endDemo(true);
			return;
		}
	} else {
		demo.cur = { ...src, pts: src.pts.slice(0, upto), paths: null };
	}
	render();
}

/* ---------- the quiet-time stroke: one, after about ten seconds without input, then it rests ---------- */

let lastInput = 0;
let idleTimer = 0;
let idleArmed = false;

function idleCheck() {
	idleTimer = 0;
	if (!idleArmed) return;
	const quiet = performance.now() - lastInput;
	if (quiet < IDLE_MS - 50) {
		idleTimer = setTimeout(idleCheck, IDLE_MS - quiet + 50);
		return;
	}
	if (!canAnimate() || demo || cur) {
		idleTimer = setTimeout(idleCheck, 1500);
		return;
	}
	idleArmed = false;
	playGroup(makeGroup(Math.random, 1, settings.mode), 46, 0.2);
}

/* every input of the visitor's restarts the quiet time (never under reduced motion: there is no demo to wait for) */
function userInput() {
	if (reduced) return;
	lastInput = performance.now();
	idleArmed = true;
	if (!idleTimer) idleTimer = setTimeout(idleCheck, IDLE_MS);
}

/* ---------- hand drawing ---------- */

function toPoint(e) {
	const r = canvas.getBoundingClientRect();
	const R = (r.width / 2) * EDGE;
	let x = (e.clientX - r.left - r.width / 2) / R;
	let y = (e.clientY - r.top - r.height / 2) / R;
	const d = Math.hypot(x, y);
	if (d > 1) {
		x /= d;
		y /= d;
	}
	return [+x.toFixed(4), +y.toFixed(4)];
}

canvas.addEventListener('pointerdown', (e) => {
	if (e.button > 0) return;
	endDemo(false); // the hand takes over: keep what the demo had drawn
	userInput();
	canvas.setPointerCapture?.(e.pointerId);
	cur = makeStroke([toPoint(e)]);
	render();
	e.preventDefault();
});
canvas.addEventListener('pointermove', (e) => {
	if (!cur) return;
	const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
	for (const ev of evs.length ? evs : [e]) {
		const p = toPoint(ev);
		const last = cur.pts[cur.pts.length - 1];
		if (Math.hypot(p[0] - last[0], p[1] - last[1]) > MIN_STEP) cur.pts.push(p);
	}
	cur.paths = null;
	render();
});
function pointerEnd() {
	if (!cur) return;
	const s = cur;
	cur = null;
	entries.push([s]);
	redoStack = [];
	lastCleared = null;
	drawOnto([s]);
	render();
	updateUi();
	userInput();
}
canvas.addEventListener('pointerup', pointerEnd);
canvas.addEventListener('pointercancel', pointerEnd);

/* ---------- actions ---------- */

let noteTimer = 0;
function say(text) {
	statusEl.textContent = text;
	clearTimeout(noteTimer);
	noteTimer = setTimeout(() => { statusEl.textContent = DEFAULT_NOTE; }, 3600);
}

const isOff = (b) => b.getAttribute('aria-disabled') === 'true';
function setOn(b, on) {
	b.setAttribute('aria-disabled', String(!on));
}
function updateUi() {
	setOn(undoBtn, entries.length > 0 || !!lastCleared);
	setOn(redoBtn, redoStack.length > 0);
	setOn(clearBtn, entries.length > 0);
	setOn(saveBtn, entries.length > 0);
}

function undo() {
	endDemo(true);
	if (entries.length) redoStack.push(entries.pop());
	else if (lastCleared) {
		entries = lastCleared;
		lastCleared = null;
	} else return;
	userInput();
	fullRedraw();
}
function redo() {
	endDemo(true);
	if (!redoStack.length) return;
	entries.push(redoStack.pop());
	userInput();
	fullRedraw();
}
function clearAll() {
	endDemo(true);
	if (!entries.length) return;
	lastCleared = entries;
	entries = [];
	redoStack = [];
	userInput();
	fullRedraw();
	say('Cleared. Undo brings it back.');
}
function surprise() {
	endDemo(true);
	const group = makeGroup(Math.random, 3 + Math.floor(Math.random() * 3), settings.mode);
	userInput();
	if (canAnimate()) {
		playGroup(group, 120, 0);
	} else {
		entries.push(group);
		redoStack = [];
		lastCleared = null;
		drawOnto(group);
		render();
		updateUi();
	}
	say('Added a few strokes. Undo takes them off.');
}

/* the PNG: 1024 px, transparent background, saved through an <a download> to an object URL */
function savePng() {
	endDemo(true);
	if (!entries.length) return;
	const out = document.createElement('canvas');
	out.width = EXPORT_SIZE;
	out.height = EXPORT_SIZE;
	drawStrokes(out.getContext('2d'), allStrokes(), EXPORT_SIZE);
	out.toBlob((blob) => {
		if (!blob) {
			say('The PNG could not be made.');
			return;
		}
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'glass-mandala.png';
		document.body.append(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 4000);
		say('Saved glass-mandala.png: 1024 px, transparent.');
	}, 'image/png');
}

function syncSliders() {
	for (const [input, value, text] of [
		[foldsIn, settings.folds, `${settings.folds} folds`],
		[brushIn, settings.brush, String(settings.brush)],
	]) {
		const out = input.parentElement.querySelector('output');
		out.textContent = String(value);
		input.value = String(value);
		input.setAttribute('aria-valuetext', text);
		input.style.setProperty('--p', `${((value - input.min) / (input.max - input.min)) * 100}%`);
	}
	mirrorBtn.setAttribute('aria-pressed', String(settings.mirror));
	for (const b of modeBtns) b.setAttribute('aria-pressed', String(b.dataset.mode === settings.mode));
}

foldsIn.addEventListener('input', () => {
	endDemo(true);
	settings.folds = +foldsIn.value;
	syncSliders();
	userInput();
	fullRedraw();
});
brushIn.addEventListener('input', () => {
	settings.brush = +brushIn.value;
	syncSliders();
	userInput();
});
mirrorBtn.addEventListener('click', () => {
	endDemo(true);
	settings.mirror = !settings.mirror;
	syncSliders();
	userInput();
	fullRedraw();
});
for (const b of modeBtns) {
	b.addEventListener('click', () => {
		settings.mode = b.dataset.mode;
		syncSliders();
		userInput();
	});
}
const act = (b, fn) => b.addEventListener('click', () => { if (!isOff(b)) fn(); });
act(undoBtn, undo);
act(redoBtn, redo);
act(clearBtn, clearAll);
act(saveBtn, savePng);
surpriseBtn.addEventListener('click', surprise);
document.addEventListener('keydown', (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
		e.preventDefault();
		if (e.shiftKey) redo();
		else undo();
	} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
		e.preventDefault();
		redo();
	}
});

/* ---------- start ---------- */

function start() {
	cache = document.createElement('canvas');
	cctx = cache.getContext('2d');
	syncSliders();
	resize();
	updateUi();
	let timer = 0;
	new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(resize, 90);
	}).observe(plate);

	// the first mandala: always the same five strokes
	const first = makeGroup(seeded(52), 5, settings.mode, ['wave', 'leaf', 'scallop', 'spoke', 'scallop']);

	if (reduced) {
		// the still: the finished mandala at once, nothing running; there is no demo to pause
		entries.push(first);
		rebuildCache();
		render();
		updateUi();
		pauseBtn.disabled = true;
		return;
	}

	ctl = loop(canvas, tick, { name: 'glass-mandala' });
	playGroup(first, 120, 0.4);

	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		syncLoop();
	});
}

boot();
start();
