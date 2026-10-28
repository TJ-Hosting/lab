/*
 * Sample 47 — "Clock Wall".
 * Your local time drawn by small glass clocks. Four digits and a colon are blocks of clocks (4 across, 6 down per
 * digit, 102 in all); every clock has two hands, and a hand turns about its centre to lie along a stroke. A digit is
 * a little bitmap of strokes of my own; from it a pose (two angles and two lengths) is worked out for every clock:
 * a straight stroke points the hands up and down or left and right, a corner points them at two neighbours, the end
 * of a stroke has one hand and a collapsed one, and where a stroke meets a bar in a T the neighbour's hand grows to
 * reach it. Each minute the hands turn to the new time in a diagonal wave, the shortest way round; every 15 s a
 * short ripple plays and returns to the time. A click (or Next layout) cycles three layouts: the digits, a travelling
 * ripple wave, and all clocks aligned (every clock telling the time on its own face).
 * Motion is transform and opacity on the hands only, through the Web Animations API, held by govern() while the
 * wall is off-screen or the tab is hidden. Reduced motion: the layouts are drawn still, the time updates once a
 * minute without any animation, and no wave plays.
 *
 * Written from the idea only; no source code was read or copied.
 * (The idea: a digital clock built from a grid of small analog clocks. The pose table, the shapes and every line
 * of this file are new.)
 */
import { boot, govern, prefersReducedMotion } from '../../js/lab.js';

const stage = document.querySelector('.clock-stage');
const wall = document.getElementById('wall');
const capText = document.getElementById('cap-text');
const layoutBtn = document.querySelector('[data-action="layout"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const reduced = prefersReducedMotion();

/* ---------- tuning ---------- */
const EASE = 'cubic-bezier(0.6, 0, 0.25, 1)'; // a hand sets off gently, turns, and settles
const MIN_L = 0.02; // a "collapsed" hand: scaled to nothing, hidden under the hub
const IDLE_FIRST = 3; // seconds of stillness before the first ripple
const IDLE_EVERY = 15; // then one every 15 s
const WAVE_BASE = 90; // the ripple layout: a line's mean angle,
const WAVE_AMP = 75; // how far it swings,
const WAVE_LEN = 7.5; // the wavelength in clock widths,
const WAVE_PERIOD = 5600; // and the time of one swing, ms

/* ---------- the digits: strokes, then poses ---------- */
/* '#' is a clock on a stroke, '.' an idle clock. The middle bar is on row 3. */
const SHAPES = [
	['####', '#..#', '#..#', '#..#', '#..#', '####'], // 0
	['.##.', '..#.', '..#.', '..#.', '..#.', '.###'], // 1
	['####', '...#', '####', '#...', '#...', '####'], // 2
	['####', '...#', '.###', '...#', '...#', '####'], // 3
	['#..#', '#..#', '####', '...#', '...#', '...#'], // 4
	['####', '#...', '####', '...#', '...#', '####'], // 5
	['####', '#...', '####', '#..#', '#..#', '####'], // 6
	['####', '...#', '...#', '...#', '...#', '...#'], // 7
	['####', '#..#', '####', '#..#', '#..#', '####'], // 8
	['####', '#..#', '####', '...#', '...#', '####'], // 9
];
const COLON_SHAPE = ['.', '#', '.', '.', '#', '.']; // two dots

/* hand angles run clockwise from 12 o'clock: up 0, right 90, down 180, left 270 */
const DIRS = [[-1, 0, 0], [0, 1, 90], [1, 0, 180], [0, -1, 270]]; // row step, column step, angle
const BLANK = { a: 225, la: 0.5, b: 225, lb: MIN_L, o: 0.26 }; // a quiet clock: one short, faint hand at 7:30
const DOT = { a: 0, la: 0.42, b: 180, lb: 0.42, o: 1 }; // a dot: two stubs

function derive(shape) {
	const rows = shape.length;
	const cols = shape[0].length;
	const on = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && shape[r][c] === '#';
	const poses = Array.from({ length: rows * cols }, () => ({ ...BLANK }));
	const reach = []; // [row, column, angle]: a neighbour that must reach into a T
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (!on(r, c)) continue;
			const dirs = DIRS.filter(([dr, dc]) => on(r + dr, c + dc)).map((d) => d[2]);
			let p;
			if (dirs.length === 0) {
				p = { ...DOT };
			} else if (dirs.length === 1) {
				p = { a: dirs[0], la: 1, b: (dirs[0] + 180) % 360, lb: MIN_L, o: 1 }; // the end of a stroke
			} else if (dirs.length === 2) {
				p = { a: dirs[0], la: 1, b: dirs[1], lb: 1, o: 1 }; // straight or a corner
			} else {
				// a T (or a cross): the straight run is drawn here; the bar's last clock reaches in to meet it
				const run = dirs.includes(0) && dirs.includes(180) ? [0, 180] : [90, 270];
				p = { a: run[0], la: 1, b: run[1], lb: 1, o: 1 };
				for (const [dr, dc, ang] of DIRS) {
					if (dirs.includes(ang) && !run.includes(ang)) reach.push([r + dr, c + dc, (ang + 180) % 360]);
				}
			}
			poses[r * cols + c] = p;
		}
	}
	for (const [r, c, toward] of reach) {
		const p = poses[r * cols + c];
		if (p.a === toward) p.la = 2;
		else if (p.b === toward && p.lb > MIN_L) p.lb = 2;
	}
	return poses;
}
const TABLE = SHAPES.map(derive); // TABLE[digit][row * 4 + column] = a pose
const COLON = derive(COLON_SHAPE);

/* ---------- hand helpers ---------- */
const norm = (a) => ((a % 360) + 360) % 360;
/* the shortest way round, in degrees (a half turn goes clockwise for one hand and the other way for the other) */
const turnBy = (from, to, idx) => {
	const x = ((((to - from) % 360) + 540) % 360) - 180;
	return Math.abs(x) > 179.99 ? (idx ? -180 : 180) : x;
};
const tf = (a, l) => `rotate(${a}deg) scaleY(${l})`;

function setHand(h, a, l, o) {
	h.a = norm(a);
	h.l = l;
	h.o = o;
	h.el.style.transform = tf(h.a, l);
	h.el.style.opacity = String(o);
}

/* ---------- the wall ---------- */
const faces = [];
const [pairH, pairM] = wall.querySelectorAll('.pair');
const colonHost = wall.querySelector('.colon');

function grid(host, cols, rows, slot) {
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const el = document.createElement('span');
			el.className = 'face';
			const hands = [0, 1].map((idx) => {
				const hand = document.createElement('span');
				hand.className = 'hand';
				el.append(hand);
				return { el: hand, idx, a: BLANK.a, l: idx ? BLANK.lb : BLANK.la, o: BLANK.o, anims: [], sway: null };
			});
			hands.forEach((h) => setHand(h, h.a, h.l, h.o)); // every hand starts on a quiet pose
			host.append(el);
			faces.push({ el, slot, r, c, hands, hidden: false, gx: 0, gy: 0 });
		}
	}
}
function digitHost(pair) {
	const d = document.createElement('div');
	d.className = 'digit';
	pair.append(d);
	return d;
}
grid(digitHost(pairH), 4, 6, 0);
grid(digitHost(pairH), 4, 6, 1);
grid(colonHost, 1, 6, 'colon');
grid(digitHost(pairM), 4, 6, 2);
grid(digitHost(pairM), 4, 6, 3);

/* where each clock is, in clock widths from the wall's top left (the colon is hidden on phones) */
const geo = { left: 0, top: 0, u: 40, cx: 0, cy: 0 };
function measure() {
	const w = wall.getBoundingClientRect();
	geo.left = w.left;
	geo.top = w.top;
	geo.u = faces[0].el.getBoundingClientRect().width || 40;
	geo.cx = w.width / 2 / geo.u;
	geo.cy = w.height / 2 / geo.u;
	for (const f of faces) {
		f.hidden = f.el.offsetParent === null;
		if (f.hidden) continue;
		const r = f.el.getBoundingClientRect();
		f.gx = (r.left + r.width / 2 - w.left) / geo.u;
		f.gy = (r.top + r.height / 2 - w.top) / geo.u;
	}
}

/* ---------- hands ---------- */
/* freeze whatever is on screen as the new resting state (a click or a new minute can land mid-wave) */
function settle() {
	const seen = [];
	for (const f of faces) {
		for (const h of f.hands) {
			if (!h.anims.length) continue;
			const cs = getComputedStyle(h.el);
			const m = new DOMMatrixReadOnly(cs.transform);
			seen.push([h, (Math.atan2(m.b, m.a) * 180) / Math.PI, Math.hypot(m.c, m.d), parseFloat(cs.opacity)]);
		}
	}
	for (const [h, a, l, o] of seen) {
		h.anims.forEach((x) => { x.onfinish = null; x.cancel(); });
		h.anims = [];
		setHand(h, a, l, o);
	}
}

/* the ripple layout: each hand keeps swinging, a little behind its neighbour's swing */
function startSway(h) {
	const { phi, add } = h.sway;
	const N = 16;
	const frames = [];
	for (let k = 0; k <= N; k++) {
		frames.push({ transform: tf(WAVE_BASE + WAVE_AMP * Math.sin(2 * Math.PI * (k / N - phi)) + add, 1) });
	}
	const anim = h.el.animate(frames, { duration: WAVE_PERIOD, iterations: Infinity, easing: 'linear' });
	h.anims.push(anim);
	if (!gov.isLive()) anim.pause();
}
function settled(h) {
	if (layout === 'wave' && h.sway && !reduced && !h.anims.length) startSway(h);
}

/* ---------- what each layout shows ---------- */
const LAYOUTS = ['digits', 'wave', 'aligned'];
const NAMES = { digits: 'digits', wave: 'ripple wave', aligned: 'all hands aligned' };
let layout = 'digits';

function parts() {
	const d = new Date();
	return { h: d.getHours(), m: d.getMinutes() };
}
const timeKey = () => {
	const { h, m } = parts();
	return h * 60 + m;
};
const pad = (n) => String(n).padStart(2, '0');

function targets() {
	const { h, m } = parts();
	if (layout === 'digits') {
		const D = [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10];
		return faces.map((f) => (f.slot === 'colon' ? COLON[f.r] : TABLE[D[f.slot]][f.r * 4 + f.c]));
	}
	if (layout === 'aligned') {
		// every clock tells the time on its own face: the long hand the minutes, the short one the hours
		const pose = { a: m * 6, la: 1, b: (h % 12) * 30 + m / 2, lb: 0.62, o: 1 };
		return faces.map(() => pose);
	}
	return faces.map((f) => {
		const phi = Math.hypot(f.gx - geo.cx, f.gy - geo.cy) / WAVE_LEN;
		const t0 = WAVE_BASE + WAVE_AMP * Math.sin(-2 * Math.PI * phi);
		return { a: t0, la: 1, b: t0 + 180, lb: 1, o: 1, phi };
	});
}

/* ---------- moving the hands ---------- */
let busyUntil = 0;

/* turn every clock to its pose; the stagger runs along a diagonal or outward from a point, in clock widths */
function goTo(poses, { mode = 'diag', ox = 0, oy = 0, step = 38, duration = 950, instant = false } = {}) {
	let end = 0;
	faces.forEach((f, i) => {
		const P = poses[i];
		const [h0, h1] = f.hands;
		// give each hand the target it can reach with the least turning
		const keep = Math.abs(turnBy(h0.a, P.a, 0)) + Math.abs(turnBy(h1.a, P.b, 1));
		const swap = Math.abs(turnBy(h0.a, P.b, 0)) + Math.abs(turnBy(h1.a, P.a, 1));
		const picks = swap < keep - 0.5
			? [[h0, P.b, P.lb, 180], [h1, P.a, P.la, 0]]
			: [[h0, P.a, P.la, 0], [h1, P.b, P.lb, 180]];
		const dist = mode === 'diag' ? f.gx + f.gy : Math.hypot(f.gx - ox, f.gy - oy) * 1.3;
		const delay = f.hidden ? 0 : dist * step;
		for (const [h, a, l, add] of picks) {
			const o = P.o;
			h.sway = P.phi === undefined ? null : { phi: P.phi, add };
			const da = turnBy(h.a, a, h.idx);
			if (Math.abs(da) < 0.01 && Math.abs(l - h.l) < 0.001 && Math.abs(o - h.o) < 0.001) {
				settled(h);
				continue;
			}
			const to = h.a + da;
			if (instant || f.hidden) {
				setHand(h, to, l, o);
				if (!f.hidden) settled(h);
				continue;
			}
			const anim = h.el.animate(
				[{ transform: tf(h.a, h.l), opacity: h.o }, { transform: tf(to, l), opacity: o }],
				{ duration, delay, easing: EASE, fill: 'both' },
			);
			h.anims.push(anim);
			end = Math.max(end, delay + duration);
			anim.onfinish = () => {
				h.anims = h.anims.filter((x) => x !== anim);
				setHand(h, to, l, o);
				anim.cancel();
				settled(h);
			};
		}
	});
	busyUntil = performance.now() + end + 80;
}

function show(opts = {}) {
	settle();
	measure();
	goTo(targets(), { ...opts, instant: reduced || opts.instant || !gov.isLive() });
	gov.apply();
}

/* every 15 s: a short ripple that leaves the wall as it was */
const IDLE = [
	{ type: 'turn', mode: 'radial', from: 'centre', step: 52, dur: 1700 },
	{ type: 'sway', mode: 'diag', from: 'tl', step: 36, dur: 2000 },
	{ type: 'turn', mode: 'radial', from: 'tr', step: 40, dur: 1700 },
	{ type: 'sway', mode: 'radial', from: 'bl', step: 48, dur: 2000 },
];
let idleCount = 0;
function playIdle() {
	const k = IDLE[idleCount++ % IDLE.length];
	settle();
	measure();
	const [ox, oy] = { centre: [geo.cx, geo.cy], tl: [0, 0], tr: [geo.cx * 2, 0], bl: [0, geo.cy * 2] }[k.from];
	let end = 0;
	for (const f of faces) {
		if (f.hidden) continue;
		const dist = k.mode === 'diag' ? f.gx + f.gy : Math.hypot(f.gx - ox, f.gy - oy);
		const delay = dist * k.step;
		end = Math.max(end, delay + k.dur);
		f.hands.forEach((h, i) => {
			let frames;
			if (k.type === 'turn') {
				// a full turn, the two hands in opposite directions: back where they started
				// (a long hand shortens while it spins, so it does not sweep over its neighbours)
				const d = i ? -360 : 360;
				const lm = Math.min(h.l, 1);
				frames = [
					{ transform: tf(h.a, h.l), opacity: h.o },
					{ transform: tf(h.a + d * 0.12, lm), offset: 0.12 },
					{ opacity: Math.max(h.o, 0.85), offset: 0.5 },
					{ transform: tf(h.a + d * 0.88, lm), offset: 0.88 },
					{ transform: tf(h.a + d, h.l), opacity: h.o },
				];
			} else {
				// a swing to one side and the other: a quiet clock wakes while it passes
				frames = [];
				for (let j = 0; j <= 8; j++) {
					const s = Math.sin((2 * Math.PI * j) / 8);
					frames.push({ transform: tf(h.a + 70 * s, h.l), opacity: Math.max(h.o, 0.85 * Math.abs(s)) });
				}
			}
			const anim = h.el.animate(frames, { duration: k.dur, delay, easing: k.type === 'turn' ? EASE : 'linear' });
			h.anims.push(anim);
			anim.onfinish = () => { h.anims = h.anims.filter((x) => x !== anim); };
		});
	}
	busyUntil = performance.now() + end + 80;
}

/* ---------- the clock and the controls ---------- */
const gov = govern(stage);
let shown = timeKey();
let idleFor = 0;
let nextIdle = IDLE_FIRST;

function label() {
	const { h, m } = parts();
	wall.setAttribute('aria-label', `Your local time, ${pad(h)}:${pad(m)}, drawn by a wall of small clocks. Layout: ${NAMES[layout]}.`);
	capText.textContent = `Layout: ${NAMES[layout]}`;
}

function tick() {
	if (document.hidden) return;
	if (!reduced && !gov.isLive()) return; // off-screen or paused: nothing starts
	const key = timeKey();
	if (key !== shown) {
		shown = key;
		label();
		idleFor = 0;
		if (layout !== 'wave') show({ mode: 'diag', step: 38, duration: 950 });
		return;
	}
	if (reduced || layout === 'wave' || performance.now() < busyUntil) return;
	if (++idleFor >= nextIdle) {
		idleFor = 0;
		nextIdle = IDLE_EVERY;
		playIdle();
	}
}

function nextLayout(ev) {
	layout = LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length];
	label();
	idleFor = 0;
	if (ev && ev.clientX !== undefined) {
		measure();
		show({ mode: 'radial', ox: (ev.clientX - geo.left) / geo.u, oy: (ev.clientY - geo.top) / geo.u, step: 48, duration: 1000 });
	} else {
		show({ mode: 'diag', step: 40, duration: 1000 });
	}
}

layoutBtn.addEventListener('click', () => nextLayout());
wall.addEventListener('click', (ev) => nextLayout(ev));

boot();
label();
if (reduced) {
	// one still frame: the time now, drawn at once; it is redrawn (no animation) each minute
	measure();
	goTo(targets(), { instant: true });
	pauseBtn.disabled = true;
} else {
	// the hands start idle and sweep into the time, corner to corner
	measure();
	goTo(targets(), { mode: 'diag', step: 40, duration: 1100 });
	gov.apply();
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		gov.setUserPaused(paused);
		if (!paused) faces.forEach((f) => f.hands.forEach(settled));
	});
}
setInterval(tick, 1000);

let resizeTimer = 0;
addEventListener('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => show({ instant: true }), 200); // the phone layout hides the colon: redraw at once
});
