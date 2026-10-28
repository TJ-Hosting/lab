/*
 * Sample 11 — "Streamline Ink Poster".
 * A poster on a light glass card. A seed makes a flow field from simplex noise (compose.js); a tracer follows it from
 * random starting points and keeps every line a minimum distance from the others, placing the widest ribbons first and
 * ever thinner ones in the gaps. Each line is drawn as a tapered ribbon in one of four blue palettes. Nothing drifts:
 * the poster draws itself in a few ribbons at a time (the tracing is done in slices of a few milliseconds, ahead of the
 * drawing), rests, and after about ten seconds without a touch washes out and draws a new composition from a new seed.
 * Palettes recolour the same lines. Reduced motion: the finished poster, drawn once.
 *
 * Written from the idea only; no source code was read or copied.
 * (The CodePen this idea comes from, "Perlin Noise Flow" by Jeff Robbins, refuses scripted downloads from this machine,
 * so nothing of it was read; this is new code.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { createComposer, taper, POSTER_W, POSTER_H } from './compose.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d', { alpha: false });
const pauseBtn = document.querySelector('[data-action="pause"]');
const newBtn = document.querySelector('[data-action="new"]');
const seedEl = document.querySelector('[data-seed]');
const countEl = document.querySelector('[data-count]');
const nameEl = document.querySelector('[data-palette-name]');
const chips = [...document.querySelectorAll('[data-palette]')];

const REDUCED = prefersReducedMotion();
const FIRST_SEED = 4217;
const IDLE_AFTER = 10; // seconds at rest before a new composition draws itself
const WASH = 0.75; // seconds the old poster takes to wash out
const TRACE_MS = 4; // the most the tracer may take in one frame
const DRAW_MS = 6; // ... and the drawing

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* ---------- palettes: DS v9's blues, cyan as light, and one warm dusk ---------- */

const hex = (h, a = 1) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a];

/* ground: top and bottom of the poster's paper; stops: the colour ramp a ribbon's tone picks from;
   accents: now and then a ribbon in one of these (accent = share of ribbons); bloat: how much wider than its slot
   a ribbon is drawn (above 1 the glass ribbons overlap a little); rim: an outline round each ribbon, if any */
const PALETTES = {
	navy: {
		name: 'Navy ink',
		ground: ['#fbfdff', '#e8f3fc'],
		stops: [hex('#061a52'), hex('#0a2f86'), hex('#0c6bed'), hex('#4d9ff3')],
		accents: [hex('#46d0fb'), hex('#071022'), hex('#a9d4fa')],
		accent: 0.09,
		bloat: 1,
		rim: null,
	},
	tide: {
		name: 'Azure tide',
		ground: ['#dcedfb', '#bddcf7'],
		stops: [hex('#ffffff'), hex('#e3f1fd'), hex('#8fc4f7'), hex('#4d9ff3'), hex('#0c6bed')],
		accents: [hex('#0a2a7a'), hex('#46d0fb'), hex('#ffffff')],
		accent: 0.09,
		bloat: 1,
		rim: null,
	},
	glass: {
		name: 'Cyan glass',
		ground: ['#fcfeff', '#e4f4fd'],
		stops: [hex('#46d0fb', 0.62), hex('#7fdcfc', 0.55), hex('#4d9ff3', 0.5), hex('#ffffff', 0.85), hex('#46d0fb', 0.7)],
		accents: [hex('#0c6bed', 0.62), hex('#0a2a7a', 0.7)],
		accent: 0.07,
		bloat: 1.32,
		rim: hex('#0c6bed', 0.42),
	},
	dusk: {
		name: 'Dusk',
		ground: ['#12307a', '#08163f'],
		stops: [hex('#8fc0f2'), hex('#d9ecfb'), hex('#ffd9c2'), hex('#ffb08a'), hex('#ff8f5a')],
		accents: [hex('#46d0fb'), hex('#ffffff'), hex('#ff8a3d')],
		accent: 0.08,
		bloat: 1,
		rim: null,
	},
};

const css = (c, a = c[3]) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function ramp(stops, t) {
	const f = clamp(t, 0, 1) * (stops.length - 1);
	const i = Math.min(stops.length - 2, Math.floor(f));
	const u = f - i;
	const a = stops[i];
	const b = stops[i + 1];
	return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
}

/* ---------- state ---------- */

let pal = PALETTES.navy;
let palKey = 'navy';
let composer = null;
let state = 'draw'; // draw | wash | rest
let drawn = 0; // how many of the composer's ribbons are on the canvas
let quota = 0; // fractional ribbons owed to the drawing
let washT = 0;
let idle = 0;
let seed = FIRST_SEED;
let W = 0;
let H = 0;
let DPR = 1;
let unit = 1.25; // poster units per css pixel
let PH = POSTER_H; // the poster's height in poster units: 1000 for the usual 4:5, 800 for a phone's square
let ctl = null;

/* ---------- drawing ---------- */

/* the poster's shape follows the canvas (CSS makes it 4:5, or square on a phone) */
function measure() {
	if (!canvas.clientWidth || !canvas.clientHeight) return; // not laid out yet: keep what we had
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	unit = POSTER_W / Math.max(1, W);
	PH = Math.round((POSTER_W * H) / Math.max(1, W));
}

function resize() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	if (!W || !H) return false;
	const bw = Math.round(W * DPR);
	const bh = Math.round(H * DPR);
	if (canvas.width === bw && canvas.height === bh) return false;
	canvas.width = bw;
	canvas.height = bh;
	return true;
}
const setTransform = () => ctx.setTransform(canvas.width / POSTER_W, 0, 0, canvas.height / PH, 0, 0);

function fillGround(alpha = 1) {
	const g = ctx.createLinearGradient(0, 0, 0, PH);
	g.addColorStop(0, pal.ground[0]);
	g.addColorStop(1, pal.ground[1]);
	ctx.globalAlpha = alpha;
	ctx.fillStyle = g;
	ctx.fillRect(-2, -2, POSTER_W + 4, PH + 4);
	ctx.globalAlpha = 1;
}

const L = new Float32Array(4400);
const R = new Float32Array(4400);

/* one ribbon: the polyline's left and right edges, offset by half the tapered width along the normal */
function drawLine(line) {
	const { pts, w, k } = line;
	const n = pts.length / 2;
	if (n < 2) return;
	const half = 0.5 * w * pal.bloat;
	for (let i = 0; i < n; i++) {
		const a = Math.max(0, i - 1);
		const b = Math.min(n - 1, i + 1);
		let tx = pts[2 * b] - pts[2 * a];
		let ty = pts[2 * b + 1] - pts[2 * a + 1];
		const len = Math.hypot(tx, ty) || 1;
		tx /= len;
		ty /= len;
		const hw = half * taper(i / (n - 1), k);
		const x = pts[2 * i];
		const y = pts[2 * i + 1];
		L[2 * i] = x - ty * hw;
		L[2 * i + 1] = y + tx * hw;
		R[2 * i] = x + ty * hw;
		R[2 * i + 1] = y - tx * hw;
	}
	ctx.beginPath();
	ctx.moveTo(L[0], L[1]);
	for (let i = 1; i < n; i++) ctx.lineTo(L[2 * i], L[2 * i + 1]);
	for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[2 * i], R[2 * i + 1]);
	ctx.closePath();
	const c = line.pick < pal.accent ? pal.accents[Math.floor((line.pick / pal.accent) * pal.accents.length)] : ramp(pal.stops, line.tone);
	ctx.fillStyle = css(c);
	ctx.fill();
	if (pal.rim && w > 2.6) {
		ctx.lineWidth = 0.8 * unit;
		ctx.strokeStyle = css(pal.rim);
		ctx.stroke();
	}
}

/* the whole poster as it stands: the ground and the first `drawn` ribbons */
function paintAll() {
	setTransform();
	fillGround();
	const lines = composer.lines;
	for (let i = 0; i < drawn && i < lines.length; i++) drawLine(lines[i]);
}

function showCount() {
	countEl.textContent = drawn.toLocaleString('en');
}

/* ---------- compositions ---------- */

function startComposition(nextSeed, wash) {
	seed = nextSeed;
	seedEl.textContent = String(seed);
	measure();
	composer = createComposer(seed, unit, PH);
	drawn = 0;
	quota = 0;
	idle = 0;
	showCount();
	if (wash) {
		state = 'wash';
		washT = 0;
	} else {
		state = 'draw';
		setTransform();
		fillGround();
	}
}

/* the same ribbons again in another palette (or the finished poster's draw-in once more) */
function restartDraw(wash) {
	drawn = 0;
	quota = 0;
	idle = 0;
	showCount();
	if (wash) {
		state = 'wash';
		washT = 0;
	} else {
		state = 'draw';
		setTransform();
		fillGround();
	}
}

function randomSeed() {
	let s;
	do s = 1000 + Math.floor(Math.random() * 9000); while (s === seed);
	return s;
}

function finishAtOnce() {
	while (!composer.step(1000)) { /* the tracer is quick: a poster takes tens of milliseconds */ }
	drawn = composer.lines.length;
	state = 'rest';
	paintAll();
	showCount();
}

function setPalette(key) {
	palKey = key;
	pal = PALETTES[key];
	nameEl.textContent = pal.name;
	chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.palette === key)));
}

/* ---------- the loop ---------- */

function tick(dt) {
	// 1. the tracer works a little each frame, ahead of the drawing
	if (!composer.done) composer.step(TRACE_MS);

	if (state === 'wash') {
		// the old poster dissolves into the new ground
		setTransform();
		washT += dt;
		fillGround(1 - Math.exp(-dt * 7));
		if (washT >= WASH) {
			fillGround();
			state = 'draw';
		}
		return;
	}

	if (state === 'draw') {
		// ribbons arrive faster as they get thinner: a few a frame at first, dozens at the end
		const lines = composer.lines;
		quota += dt * 60 * (3 + 0.02 * drawn);
		let owed = Math.floor(quota);
		quota -= owed;
		if (drawn >= lines.length) quota = Math.min(quota, 6);
		if (owed > 0 && drawn < lines.length) {
			setTransform();
			const t0 = performance.now();
			while (owed-- > 0 && drawn < lines.length) {
				drawLine(lines[drawn++]);
				if (performance.now() - t0 > DRAW_MS) break;
			}
			showCount();
		}
		if (composer.done && drawn >= lines.length) {
			state = 'rest';
			idle = 0;
		}
		return;
	}

	// at rest: after a pause, a new composition draws itself
	idle += dt;
	if (idle >= IDLE_AFTER) startComposition(randomSeed(), true);
}

/* ---------- controls ---------- */

function wake() {
	// a button press un-pauses the piece, so the new poster can draw itself
	if (ctl && pauseBtn.getAttribute('aria-pressed') === 'true') {
		pauseBtn.setAttribute('aria-pressed', 'false');
		pauseBtn.textContent = 'Pause';
		ctl.start();
	}
}

function bindControls() {
	newBtn.addEventListener('click', () => {
		wake();
		startComposition(randomSeed(), !REDUCED);
		if (REDUCED) finishAtOnce();
	});
	chips.forEach((chip) => chip.addEventListener('click', () => {
		if (chip.dataset.palette === palKey) return;
		wake();
		setPalette(chip.dataset.palette);
		if (REDUCED) { drawn = composer.lines.length; state = 'rest'; paintAll(); showCount(); return; }
		restartDraw(true);
	}));
}

/* the layout reserves room for the fixed info panel (it grows and shrinks with its text and its fold) */
function trackPanel() {
	const info = document.querySelector('.sample-info');
	const stage = document.querySelector('.stage');
	if (!info || !stage) return;
	const sync = () => stage.style.setProperty('--panel-h', `${info.offsetHeight}px`);
	sync();
	new ResizeObserver(sync).observe(info);
}

/* the canvas changed size: repaint it. A new shape (a phone turned on its side) composes the same seed again for it. */
function onResize() {
	const before = PH;
	measure();
	if (Math.abs(PH - before) > 8) {
		resize();
		composer = createComposer(seed, unit, PH);
		finishAtOnce();
	} else if (resize()) {
		paintAll();
	}
}

function start() {
	boot();
	trackPanel();
	resize();
	measure();
	if (REDUCED) {
		// one finished poster, and nothing that moves
		startComposition(FIRST_SEED, false);
		finishAtOnce();
		pauseBtn.disabled = true;
		bindControls();
		new ResizeObserver(onResize).observe(canvas);
		return;
	}
	startComposition(FIRST_SEED, false);
	ctl = loop(canvas, (dt) => tick(dt), { name: 'streamline-poster' });
	bindControls();

	let timer = 0;
	new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(onResize, 120);
	}).observe(canvas);

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

start();
