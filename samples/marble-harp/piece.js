/*
 * Sample 53 — "Marble Harp".
 * Small clouds at the top of a night screen drop drops of cyan light. They fall, bounce off glass strings and ring them:
 * every hard enough bounce flashes the string, sends a ripple along it and (with the Sound button on) plays a soft pluck.
 * A string's length sets its pitch, as on a real harp (twice as long, an octave lower), snapped to the song's scale, so
 * anything you draw is in tune. Three songs are ready-made layouts (Dew, Frost, Moon); dragging on the screen draws a new
 * string, a tap drops a drop (or plucks the string you tapped), and Save PNG exports the string layout as a poster.
 * The drops are circles, the strings are line segments (swept in small steps so a fast drop never slips through), each cloud
 * drops on its own rhythm with a repeating sideways nudge, and everything runs inside loop() from js/lab.js, so it
 * stops off-screen and in a hidden tab. Under reduced motion one still of the first song is drawn and nothing runs.
 * Sound is Web Audio only: a few oscillators through a low-pass filter per note, at most 8 at once, behind a Sound
 * button, silent until pressed.
 *
 * Idea: Plinkfall by xkudcobi (https://github.com/xkudcobi/plinkfall), a no-dependency toy where marbles fall from clouds onto
 * lines you draw and every bounce plays a note. Licence unknown (no licence file or name found), so this is written from the
 * idea only: its README was read, no source code was read or copied. The glass strings, the light drops,
 * the songs, the physics, the synth and the poster are new.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const panel = document.querySelector('.sample-info');
const pauseBtn = document.querySelector('[data-action="pause"]');
const soundBtn = document.querySelector('[data-action="sound"]');
const clearBtn = document.querySelector('[data-action="clear"]');
const saveBtn = document.querySelector('[data-action="save"]');
const songBtns = [...document.querySelectorAll('[data-song]')];
const REDUCED = prefersReducedMotion();
const TAU = Math.PI * 2;

/* ---------- tuning ---------- */
const ROOT_HZ = 130.81; // the lowest note, C3
const CLOUD_Y = 80; // where the clouds hang, in canvas px (the tools sit above them)
const TOP_BAND = 124; // the strings of a song live below this
const MIN_LEN = 26; // a drag shorter than this is a tap
const MAX_VOICES = 8;
const STEP = 1 / 240; // physics step, seconds: a fast drop moves about 5 px per step
const WARM_STEPS = 72; // steps run before the first frame, so drops are already falling
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const AZURE = [77, 159, 243];
const ICE = [170, 236, 255];
const CYAN = [70, 208, 251];
const TINTS = [CYAN, AZURE, ICE];

/* ---------- state ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let phone = false;
let stacked = false; // the info panel spans the screen (a phone): the strings stay above it
let gravity = 800;
let killY = 0;
let lref = 300; // the string length that plays the lowest note
let box = { x0: 0, y0: 0, x1: 1, y1: 1 }; // where a song lays out its strings
let keep = null; // a rect the info panel covers on a wide screen
let panelRect = { x0: 0, y0: 0, x1: 440, y1: 262 };
let songIx = 0; // -1 once the screen is cleared
let strings = [];
let marbles = [];
let clouds = [];
let rings = [];
let marbleCap = 14;
let maxStrings = 40;
let clock = 0;
let drawing = null;
let ctl = null;
let cloudSprite = null;
const sprites = [];
const rnd = rngFrom(20261028);

function rngFrom(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const mix = (a, b, f) => a + (b - a) * f;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* ---------- the songs: a layout of strings, a scale and where the clouds hang ---------- */
const SONGS = [
	{ name: 'Dew', scaleName: 'major pentatonic', scale: [0, 2, 4, 7, 9], clouds: [0.125, 0.375, 0.625, 0.875], cloudsPhone: [1 / 6, 0.5, 5 / 6], build: buildDew },
	{ name: 'Frost', scaleName: 'minor pentatonic', scale: [0, 3, 5, 7, 10], clouds: [0.16, 0.38, 0.62, 0.84], cloudsPhone: [0.2, 0.5, 0.8], build: buildFrost },
	{ name: 'Moon', scaleName: 'Lydian', scale: [0, 2, 4, 6, 7, 9, 11], clouds: [0.2, 0.44, 0.62, 0.8], cloudsPhone: [0.2, 0.5, 0.78], build: buildMoon },
];

/* the x-range of the box that is free at height y (a wide screen keeps clear of the info panel) */
function span(y, ext) {
	let a = box.x0;
	if (keep && y + ext > keep.y0) a = Math.max(a, keep.x1 + 8);
	return [a, box.x1];
}

/* a string from its centre, length and angle (degrees, positive: the right end lower) */
function bar(cx, cy, len, deg) {
	const a = (deg * Math.PI) / 180;
	const dx = (Math.cos(a) * len) / 2;
	const dy = (Math.sin(a) * len) / 2;
	return [cx - dx, cy - dy, cx + dx, cy + dy];
}

/* Dew: rows of strings, longer and lower at the top, shorter and higher below, so a drop climbs the scale as it falls */
function buildDew() {
	const bw = box.x1 - box.x0;
	const bh = box.y1 - box.y0;
	const rows = bh < 340 ? 3 : 4;
	const counts = rows === 3 ? [3, 4, 5] : [4, 5, 6, 7];
	const lens = rows === 3 ? [0.22, 0.16, 0.12] : [0.2, 0.15, 0.105, 0.075];
	const out = [];
	for (let r = 0; r < rows; r++) {
		const cy = box.y0 + bh * (0.07 + (0.86 * r) / (rows - 1));
		const [a, b] = span(cy, 40);
		const sp = (b - a) / counts[r];
		for (let k = 0; k < counts[r]; k++) {
			const len = Math.max(30, lens[r] * bw * (0.88 + 0.24 * rnd()));
			const deg = ((r + k) % 2 ? 1 : -1) * (11 + 11 * rnd());
			out.push(bar(a + sp * (k + 0.5), cy + (rnd() - 0.5) * 0.04 * bh, len, deg));
		}
	}
	return out;
}

/* Frost: a lattice of short, steeply tilted strings, so a drop bounces about like a pachinko ball */
function buildFrost() {
	const bw = box.x1 - box.x0;
	const bh = box.y1 - box.y0;
	const rows = bh < 340 ? 4 : 5;
	const cols = bw < 420 ? 4 : 6;
	const out = [];
	for (let r = 0; r < rows; r++) {
		const cy = box.y0 + bh * (0.06 + (0.88 * r) / (rows - 1));
		const [a, b] = span(cy, 40);
		const sp = (b - a) / (cols + 0.5);
		for (let k = 0; k < cols; k++) {
			const len = Math.max(30, sp * (0.4 + 0.45 * rnd()));
			const deg = (rnd() < 0.5 ? -1 : 1) * (20 + 18 * rnd());
			out.push(bar(a + sp * (k + (r % 2 ? 1 : 0.5)), cy + (rnd() - 0.5) * 0.05 * bh, len, deg));
		}
	}
	return out;
}

/* Moon: a tilted bowl of joined strings with a gap in its floor, and a few small stars above and beside it */
function buildMoon() {
	const bw = box.x1 - box.x0;
	const bh = box.y1 - box.y0;
	const rx = phone || bw < 480 ? bw * 0.34 : bw * 0.26;
	const ry = phone || bw < 480 ? bh * 0.34 : bh * 0.34;
	const keepRight = keep ? keep.x1 + rx * 0.95 + 12 : 0;
	const cx = Math.max(box.x0 + bw * (phone ? 0.5 : 0.58), keepRight);
	const cy = box.y0 + bh * (phone ? 0.46 : 0.5);
	const n = phone ? 7 : 9;
	const wts = n === 9 ? [1.5, 1.25, 1.05, 0.9, 0.8, 0.9, 1.05, 1.25, 1.5] : [1.5, 1.1, 0.85, 0.8, 0.85, 1.1, 1.5];
	const wsum = wts.reduce((s, v) => s + v, 0);
	const tilt = (17 * Math.PI) / 180;
	const pts = [];
	let acc = 0;
	for (let i = 0; i <= n; i++) {
		const th = ((12 + 156 * (acc / wsum)) * Math.PI) / 180;
		const px = rx * Math.cos(th);
		const py = ry * Math.sin(th);
		pts.push([cx + px * Math.cos(tilt) - py * Math.sin(tilt), cy + px * Math.sin(tilt) + py * Math.cos(tilt)]);
		acc += wts[i] || 0;
	}
	// the lowest chord is left out: a gap in the bowl's floor, so drops ring the arcs and then fall through
	let low = 0;
	for (let i = 1; i < n; i++) if (pts[i][1] + pts[i + 1][1] > pts[low][1] + pts[low + 1][1]) low = i;
	const out = [];
	for (let i = 0; i < n; i++) if (i !== low) out.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
	const stars = [[0.14, 0.12, -14, 0.06], [0.3, 0.36, 10, 0.07], [0.92, 0.1, 12, 0.05], [0.1, 0.58, -10, 0.06], [0.84, 0.34, -16, 0.055]];
	stars.slice(0, phone ? 3 : 5).forEach(([u, v, deg, f]) => {
		const sx = box.x0 + u * bw;
		const sy = box.y0 + v * bh;
		if (keep && sx < keep.x1 && sy > keep.y0 - 40) return;
		out.push(bar(sx, sy, Math.max(30, f * bw * (phone ? 1.5 : 1)), deg));
	});
	return out;
}

/* ---------- the pitch of a string ---------- */
function noteFor(len) {
	const target = clamp(12 * Math.log2(lref / Math.max(len, 8)), 0, 36);
	const steps = SONGS[Math.max(0, songIx)].scale;
	let best = 0;
	let bd = 99;
	for (let o = 0; o <= 3; o++) {
		for (const s of steps) {
			const n = o * 12 + s;
			if (n > 36) continue;
			const d = Math.abs(n - target);
			if (d < bd) { bd = d; best = n; }
		}
	}
	return best;
}
const noteName = (semi) => `${NOTE_NAMES[semi % 12]}${3 + Math.floor(semi / 12)}`;
const tintFor = (semi) => {
	const f = semi / 36;
	return [Math.round(mix(AZURE[0], ICE[0], f)), Math.round(mix(AZURE[1], ICE[1], f)), Math.round(mix(AZURE[2], ICE[2], f))];
};

/* ---------- strings ---------- */
function geometry(s) {
	s.len = Math.max(1, Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
	s.ux = (s.x2 - s.x1) / s.len;
	s.uy = (s.y2 - s.y1) / s.len;
	s.nx = -s.uy;
	s.ny = s.ux;
	s.minx = Math.min(s.x1, s.x2);
	s.maxx = Math.max(s.x1, s.x2);
	s.miny = Math.min(s.y1, s.y2);
	s.maxy = Math.max(s.y1, s.y2);
}

function makeString(x1, y1, x2, y2) {
	const s = { x1, y1, x2, y2, flash: 0, amp: 0, t: 0, hit: 0.5, cool: 0 };
	geometry(s);
	s.semi = noteFor(s.len);
	s.freq = ROOT_HZ * 2 ** (s.semi / 12);
	s.tint = tintFor(s.semi);
	return s;
}

function addString(x1, y1, x2, y2) {
	const s = makeString(x1, y1, x2, y2);
	strings.push(s);
	if (strings.length > maxStrings) strings.shift();
	syncTools();
	return s;
}

function syncTools() {
	saveBtn.disabled = strings.length === 0;
	songBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === songIx)));
}

/* ---------- layout ---------- */
function layout() {
	const oW = W;
	const oH = H;
	const cw = canvas.clientWidth;
	const ch = canvas.clientHeight;
	phone = cw < 560;
	DPR = Math.min(phone ? 1.5 : 2, window.devicePixelRatio || 1, Math.max(1, Math.sqrt(2.4e6 / (cw * ch))));
	canvas.width = Math.round(cw * DPR);
	canvas.height = Math.round(ch * DPR);
	W = cw;
	H = ch;
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	measurePanel();
	stacked = panelRect.x1 - panelRect.x0 > W * 0.7;
	marbleCap = phone ? 9 : 14;
	maxStrings = phone ? 26 : 40;
	gravity = clamp(H * 1.15, 520, 1000);
	lref = Math.max(160, Math.min(W, H * 1.4)) * 0.3;
	killY = stacked ? Math.max(TOP_BAND + 60, panelRect.y0 + 6) : H + 14;

	box = { x0: phone ? 12 : 28, x1: W - (phone ? 12 : 28), y0: TOP_BAND, y1: stacked ? Math.max(TOP_BAND + 140, panelRect.y0 - 14) : H - 70 };
	keep = stacked ? null : { x0: panelRect.x0 - 8, y0: panelRect.y0 - 16, x1: panelRect.x1 + 16, y1: H };
	if (keep && keep.y0 < box.y0 + 90) {
		// a short screen: the panel takes the whole left column
		box.x0 = Math.min(box.x1 - 200, keep.x1 + 6);
		keep = null;
	}
	box.y1 = Math.max(box.y1, box.y0 + 120);
	buildSprites();

	// a resize keeps what is on the screen: everything is scaled to the new size
	if (oW && oH && (oW !== W || oH !== H)) {
		const sx = W / oW;
		const sy = H / oH;
		strings.forEach((s) => { s.x1 *= sx; s.x2 *= sx; s.y1 *= sy; s.y2 *= sy; geometry(s); });
		marbles.forEach((m) => { m.x *= sx; m.y *= sy; });
		clouds.forEach((c) => { c.x *= sx; });
		rings.length = 0;
	}
}

function measurePanel() {
	if (panel.dataset.collapsed === 'true') return; // keep the size it had expanded
	const c = canvas.getBoundingClientRect();
	const p = panel.getBoundingClientRect();
	panelRect = { x0: p.left - c.left, y0: p.top - c.top, x1: p.right - c.left, y1: p.bottom - c.top };
}

/* ---------- sprites: a glowing drop for each tint, and a soft cloud ---------- */
function buildSprites() {
	if (!sprites.length) {
		TINTS.forEach((t) => {
			const c = document.createElement('canvas');
			c.width = 96;
			c.height = 96;
			const g = c.getContext('2d');
			const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
			gr.addColorStop(0, 'rgba(255,255,255,1)');
			gr.addColorStop(0.2, 'rgba(240,253,255,0.96)');
			gr.addColorStop(0.3, rgba(t, 0.7));
			gr.addColorStop(0.55, rgba(t, 0.2));
			gr.addColorStop(1, rgba(t, 0));
			g.fillStyle = gr;
			g.fillRect(0, 0, 96, 96);
			sprites.push(c);
		});
	}
	// a cloud: a few overlapping soft puffs, kept well inside the sprite so no edge shows
	cloudSprite = document.createElement('canvas');
	cloudSprite.width = 160;
	cloudSprite.height = 72;
	const g = cloudSprite.getContext('2d');
	g.globalCompositeOperation = 'lighter';
	[[80, 44, 27], [54, 48, 20], [106, 48, 21], [68, 33, 18], [93, 34, 17]].forEach(([x, y, r]) => {
		const gr = g.createRadialGradient(x, y, 0, x, y, r);
		gr.addColorStop(0, 'rgba(190,228,255,0.3)');
		gr.addColorStop(0.55, 'rgba(130,200,255,0.12)');
		gr.addColorStop(1, 'rgba(110,180,255,0)');
		g.fillStyle = gr;
		g.beginPath();
		g.arc(x, y, r, 0, TAU);
		g.fill();
	});
}

/* ---------- the world ---------- */
function loadSong(i) {
	songIx = i;
	const song = SONGS[i];
	strings = song.build().map(([x1, y1, x2, y2]) => makeString(x1, y1, x2, y2));
	marbles = [];
	rings = [];
	clock = 0;
	const us = phone ? song.cloudsPhone : song.clouds;
	// each cloud has its own period and a short repeating pattern of sideways nudges, so the drops make a phrase
	const periods = [2, 2.5, 1.8, 2.3];
	clouds = us.map((u, k) => ({
		x: box.x0 + u * (box.x1 - box.x0),
		y: CLOUD_Y,
		period: periods[k % 4] * (phone ? 1.25 : 1),
		timer: 0.1 + k * 0.27,
		puff: 0,
		beat: 0,
		seq: [0, 0.55, -0.35, 0.2, -0.6, 0.35].map((v) => v * (k % 2 ? -1 : 1)),
		tint: k % 3,
	}));
	for (let k = 0; k < WARM_STEPS; k++) advance(1 / 60, true);
	syncTools();
}

function spawn(x, y, vx, vy, tint) {
	let m = marbles.find((o) => !o.alive);
	if (!m) {
		if (marbles.length >= marbleCap) {
			// at the cap: the oldest one makes room
			m = marbles.reduce((a, b) => (b.age > a.age ? b : a));
		} else {
			m = { tx: new Float32Array(6), ty: new Float32Array(6) };
			marbles.push(m);
		}
	}
	m.alive = true;
	m.x = x;
	m.y = y;
	m.vx = vx;
	m.vy = vy;
	m.r = phone ? 4.6 : 5.6;
	m.age = 0;
	m.a = 0;
	m.slow = 0;
	m.dying = false;
	m.tint = tint;
	m.lastS = null;
	m.lastT = 0;
	for (let i = 0; i < 6; i++) { m.tx[i] = x; m.ty[i] = y; }
	return m;
}

function collide(m, s, silent) {
	if (m.x + m.r + 2 < s.minx || m.x - m.r - 2 > s.maxx || m.y + m.r + 2 < s.miny || m.y - m.r - 2 > s.maxy) return;
	let t = (m.x - s.x1) * s.ux + (m.y - s.y1) * s.uy;
	t = t < 0 ? 0 : t > s.len ? s.len : t;
	const qx = s.x1 + s.ux * t;
	const qy = s.y1 + s.uy * t;
	const dx = m.x - qx;
	const dy = m.y - qy;
	const R = m.r + 1.3;
	const d2 = dx * dx + dy * dy;
	if (d2 >= R * R) return;
	const d = Math.sqrt(d2);
	let nx;
	let ny;
	if (d < 1e-3) {
		// dead on the string: leave on the side it came from
		const side = m.vx * s.nx + m.vy * s.ny > 0 ? -1 : 1;
		nx = s.nx * side;
		ny = s.ny * side;
	} else {
		nx = dx / d;
		ny = dy / d;
	}
	m.x = qx + nx * R;
	m.y = qy + ny * R;
	const vn = m.vx * nx + m.vy * ny;
	if (vn >= 0) return;
	const speed = -vn;
	const e = speed > 70 ? 0.58 : 0.25;
	m.vx -= (1 + e) * vn * nx;
	m.vy -= (1 + e) * vn * ny;
	m.vx += (rnd() - 0.5) * 12; // a little noise, so nothing balances on a string forever
	if (speed > 110 && s.cool <= 0 && (m.lastS !== s || m.age - m.lastT > 0.12)) {
		m.lastS = s;
		m.lastT = m.age;
		strike(s, qx, qy, speed, silent);
	}
}

/* a drop rings a string: flash, a ripple along it, a ring at the contact, and a note */
function strike(s, hx, hy, speed, silent) {
	const inten = clamp(speed / 700, 0.25, 1);
	s.flash = Math.max(s.flash, 0.6 + 0.4 * inten);
	s.amp = Math.min(6, 1.8 + 4.2 * inten);
	s.hit = clamp(((hx - s.x1) * s.ux + (hy - s.y1) * s.uy) / s.len, 0, 1);
	s.t = 0;
	s.cool = 0.09;
	if (rings.length < 30) rings.push({ x: hx, y: hy, age: 0, tint: s.tint, inten });
	if (!silent) pluck(s, inten, hx / W);
}

function advance(dt, silent) {
	clock += dt;
	for (const c of clouds) {
		c.puff *= Math.exp(-dt * 4);
		c.timer -= dt;
		if (c.timer <= 0) {
			c.timer += c.period;
			c.puff = 1;
			const nudge = c.seq[c.beat++ % c.seq.length];
			spawn(c.x + nudge * 9, c.y + 12, nudge * 46, 30, TINT_ORDER[(c.beat + c.tint) % TINT_ORDER.length]);
		}
	}
	const n = Math.max(1, Math.ceil(dt / STEP));
	const h = dt / n;
	for (let k = 0; k < n; k++) {
		for (const m of marbles) {
			if (!m.alive) continue;
			m.vy += gravity * h;
			m.x += m.vx * h;
			m.y += m.vy * h;
			if (m.x < m.r) { m.x = m.r; m.vx = Math.abs(m.vx) * 0.5; } else if (m.x > W - m.r) { m.x = W - m.r; m.vx = -Math.abs(m.vx) * 0.5; }
			for (let i = 0; i < strings.length; i++) collide(m, strings[i], silent);
		}
	}
	for (const m of marbles) {
		if (!m.alive) continue;
		m.age += dt;
		for (let i = 5; i > 0; i--) { m.tx[i] = m.tx[i - 1]; m.ty[i] = m.ty[i - 1]; }
		m.tx[0] = m.x;
		m.ty[0] = m.y;
		const slow = m.vx * m.vx + m.vy * m.vy < 900;
		m.slow = slow ? m.slow + dt : 0;
		// a drop that rests, or has been about for a while, fades away
		if (!m.dying && (m.slow > 1.3 || m.age > 11)) m.dying = true;
		m.a = m.dying ? m.a - dt * 1.6 : Math.min(1, m.a + dt * 5);
		if (m.dying && m.a <= 0) m.alive = false;
		if (m.y > killY) m.alive = false;
	}
	for (const s of strings) {
		s.t += dt;
		s.cool -= dt;
		if (s.flash > 0.004) s.flash *= Math.exp(-dt * 2.8); else s.flash = 0;
		if (s.amp > 0.05) s.amp *= Math.exp(-dt * 3.4); else s.amp = 0;
	}
	for (let i = rings.length - 1; i >= 0; i--) {
		rings[i].age += dt;
		if (rings[i].age > 0.6) rings.splice(i, 1);
	}
}
const TINT_ORDER = [0, 0, 1, 0, 2, 0, 1];

/* ---------- drawing ---------- */
function paintString(g, s, live) {
	const f = live ? s.flash : 0;
	const [r, gg, b] = s.tint;
	g.lineCap = 'round';
	g.lineJoin = 'round';
	g.beginPath();
	if (live && s.amp > 0.12) {
		// a plucked string sways as a standing wave that dies away
		const A = s.amp * Math.cos(s.t * 38);
		const N = 14;
		for (let i = 0; i <= N; i++) {
			const u = i / N;
			const off = A * Math.sin(Math.PI * u);
			const x = s.x1 + s.ux * s.len * u + s.nx * off;
			const y = s.y1 + s.uy * s.len * u + s.ny * off;
			if (i) g.lineTo(x, y); else g.moveTo(x, y);
		}
	} else {
		g.moveTo(s.x1, s.y1);
		g.lineTo(s.x2, s.y2);
	}
	g.lineWidth = 10 + 6 * f;
	g.strokeStyle = `rgba(${r},${gg},${b},${0.12 + 0.22 * f})`;
	g.stroke();
	g.lineWidth = 3.6 + 1.6 * f;
	g.strokeStyle = `rgba(${r},${gg},${b},${0.4 + 0.4 * f})`;
	g.stroke();
	g.lineWidth = 1.3 + 0.8 * f;
	g.strokeStyle = `rgba(${Math.round(mix(r, 240, 0.7))},${Math.round(mix(gg, 252, 0.7))},255,${0.78 + 0.22 * f})`;
	g.stroke();
	// the pegs at each end
	g.fillStyle = 'rgba(232,248,255,0.85)';
	g.beginPath();
	g.arc(s.x1, s.y1, 2.3, 0, TAU);
	g.arc(s.x2, s.y2, 2.3, 0, TAU);
	g.fill();
	if (f > 0.03) {
		// the ripple: a bright pulse runs both ways from where the drop landed
		const hitAt = s.hit * s.len;
		const travel = s.t * 560;
		const N = 18;
		g.lineWidth = 2.6;
		for (let i = 0; i < N; i++) {
			const u0 = i / N;
			const u1 = (i + 1) / N;
			const mid = ((u0 + u1) / 2) * s.len;
			const dist = Math.abs(mid - hitAt);
			const q = (dist - travel) / 38;
			const a = f * (Math.exp(-q * q) + 0.45 * Math.exp(-(dist / 46) * (dist / 46)));
			if (a < 0.03) continue;
			g.beginPath();
			g.moveTo(s.x1 + s.ux * s.len * u0, s.y1 + s.uy * s.len * u0);
			g.lineTo(s.x1 + s.ux * s.len * u1, s.y1 + s.uy * s.len * u1);
			g.strokeStyle = `rgba(236,252,255,${Math.min(1, a) * 0.9})`;
			g.stroke();
		}
	}
}

function drawMarble(m) {
	const spr = sprites[m.tint];
	const a = m.a;
	if (a <= 0.01) return;
	const R = m.r * 4;
	for (let k = 5; k >= 1; k--) {
		const d = (R * (1 - k * 0.1)) / 1;
		ctx.globalAlpha = a * 0.3 * (1 - k / 6);
		ctx.drawImage(spr, m.tx[k] - d, m.ty[k] - d, d * 2, d * 2);
	}
	ctx.globalAlpha = a;
	ctx.drawImage(spr, m.x - R, m.y - R, R * 2, R * 2);
	ctx.globalAlpha = a * 0.55;
	ctx.strokeStyle = 'rgba(236,252,255,0.9)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(m.x, m.y, m.r, 0, TAU);
	ctx.stroke();
	ctx.globalAlpha = 1;
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	// the clouds
	const cw = phone ? 118 : 158;
	const ch = cw * 0.45;
	for (const c of clouds) {
		const k = 1 + 0.1 * c.puff;
		ctx.globalAlpha = 0.85 + 0.15 * c.puff;
		ctx.drawImage(cloudSprite, c.x - (cw * k) / 2, c.y - (ch * k) / 2, cw * k, ch * k);
	}
	ctx.globalAlpha = 1;
	// the strings, rings and drops are light: added on the dark
	ctx.globalCompositeOperation = 'lighter';
	for (const s of strings) paintString(ctx, s, true);
	for (const r of rings) {
		const f = r.age / 0.6;
		ctx.strokeStyle = rgba(r.tint, (1 - f) * (1 - f) * 0.7);
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(r.x, r.y, 4 + f * (16 + 14 * r.inten), 0, TAU);
		ctx.stroke();
	}
	for (const m of marbles) if (m.alive) drawMarble(m);
	if (drawing) drawPreview();
	ctx.globalCompositeOperation = 'source-over';
	if (drawing) drawPreviewLabel();
}

function previewState() {
	const len = Math.hypot(drawing.x2 - drawing.x1, drawing.y2 - drawing.y1);
	return { len, ok: len >= MIN_LEN };
}
function drawPreview() {
	const { ok } = previewState();
	ctx.lineCap = 'round';
	ctx.setLineDash([7, 7]);
	ctx.strokeStyle = rgba(CYAN, ok ? 0.8 : 0.35);
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(drawing.x1, drawing.y1);
	ctx.lineTo(drawing.x2, drawing.y2);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.fillStyle = 'rgba(232,248,255,0.9)';
	ctx.beginPath();
	ctx.arc(drawing.x1, drawing.y1, 3, 0, TAU);
	ctx.arc(drawing.x2, drawing.y2, 3, 0, TAU);
	ctx.fill();
}
/* the note the string would play, in a small night plate at the pointer */
function drawPreviewLabel() {
	const { len, ok } = previewState();
	if (!ok) return;
	const text = noteName(noteFor(len));
	ctx.font = '500 12px "JetBrains Mono", ui-monospace, monospace';
	const w = ctx.measureText(text).width + 16;
	const x = clamp(drawing.x2 + 12, 4, W - w - 4);
	const y = clamp(drawing.y2 - 34, 4, H - 28);
	ctx.fillStyle = 'rgba(14,21,38,0.9)';
	ctx.strokeStyle = 'rgba(150,195,255,0.35)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	if (ctx.roundRect) ctx.roundRect(x, y, w, 24, 8); else ctx.rect(x, y, w, 24);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#eef4ff';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, x + 8, y + 12.5);
}

/* paint once when nothing is looping (paused, or reduced motion) */
const redraw = () => { if (!ctl || !ctl.running) draw(); };

/* ---------- sound: Web Audio, only after a click on the Sound button ---------- */
let audio = null;
let master = null;
let soundOn = false;
const voices = [];

function ensureAudio() {
	if (audio) return true;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return false;
	audio = new AC();
	master = audio.createGain();
	master.gain.value = 0;
	const comp = audio.createDynamicsCompressor(); // a busy shower of notes must not clip
	comp.threshold.value = -20;
	comp.ratio.value = 5;
	master.connect(comp);
	comp.connect(audio.destination);
	return true;
}

/* one soft pluck: a triangle and a quiet octave through a low-pass that closes, plus a tiny glassy ping on top */
function pluck(s, inten, x) {
	if (!soundOn || !audio || audio.state !== 'running') return;
	const now = audio.currentTime;
	for (let i = voices.length - 1; i >= 0; i--) if (voices[i].end <= now) voices.splice(i, 1);
	if (voices.length >= MAX_VOICES) {
		// at the cap: the oldest note is let go quickly
		const old = voices.shift();
		old.env.gain.cancelScheduledValues(now);
		old.env.gain.setTargetAtTime(0.0001, now, 0.02);
		old.stop(now + 0.12);
	}
	const f = s.freq;
	const dur = 0.8;
	const bright = 0.5 + Math.abs(s.hit - 0.5);
	const env = audio.createGain();
	const lp = audio.createBiquadFilter();
	lp.type = 'lowpass';
	lp.Q.value = 0.6;
	lp.frequency.setValueAtTime(Math.min(9000, f * (5 + 7 * bright)), now);
	lp.frequency.exponentialRampToValueAtTime(Math.max(320, f * 1.8), now + 0.4);
	const peak = 0.045 + 0.1 * inten;
	env.gain.setValueAtTime(0.0001, now);
	env.gain.exponentialRampToValueAtTime(peak, now + 0.004);
	env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
	const o1 = audio.createOscillator();
	o1.type = 'triangle';
	o1.frequency.value = f;
	const o2 = audio.createOscillator();
	o2.type = 'sine';
	o2.frequency.value = f * 2;
	const g2 = audio.createGain();
	g2.gain.value = 0.3;
	const o3 = audio.createOscillator();
	o3.type = 'sine';
	o3.frequency.value = f * 4.01;
	const g3 = audio.createGain();
	g3.gain.setValueAtTime(0.0001, now);
	g3.gain.exponentialRampToValueAtTime(0.12, now + 0.002);
	g3.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
	o1.connect(lp);
	o2.connect(g2).connect(lp);
	o3.connect(g3).connect(lp);
	lp.connect(env);
	let tail = env;
	if (audio.createStereoPanner) {
		const pan = audio.createStereoPanner();
		pan.pan.value = clamp((x - 0.5) * 1.2, -0.8, 0.8);
		env.connect(pan);
		tail = pan;
	}
	tail.connect(master);
	const stop = (t) => { o1.stop(t); o2.stop(t); o3.stop(t); };
	o1.start(now);
	o2.start(now);
	o3.start(now);
	stop(now + dur + 0.05);
	voices.push({ end: now + dur, env, stop });
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
	if (on) {
		audio.resume();
		master.gain.setTargetAtTime(0.6, audio.currentTime, 0.01);
		// one soft note, so the click confirms it is on
		setTimeout(() => { if (soundOn) pluck({ freq: ROOT_HZ * 4, hit: 0.5 }, 0.5, 0.5); }, 40);
	} else {
		master.gain.setTargetAtTime(0, audio.currentTime, 0.02);
		voices.length = 0;
		setTimeout(() => { if (!soundOn && audio) audio.suspend(); }, 400);
	}
}

/* ---------- pointer: draw a string, tap to drop a drop or pluck a string ---------- */
function local(e) {
	const r = canvas.getBoundingClientRect();
	return { x: clamp(e.clientX - r.left, 3, W - 3), y: clamp(e.clientY - r.top, 3, H - 3) };
}

function distToString(s, x, y) {
	let t = (x - s.x1) * s.ux + (y - s.y1) * s.uy;
	t = clamp(t, 0, s.len);
	return Math.hypot(x - (s.x1 + s.ux * t), y - (s.y1 + s.uy * t));
}

function onDown(e) {
	if (e.pointerType === 'mouse' && e.button !== 0) return;
	const p = local(e);
	drawing = { id: e.pointerId, x1: p.x, y1: p.y, x2: p.x, y2: p.y, moved: false, cx: e.clientX, cy: e.clientY };
	canvas.setPointerCapture(e.pointerId);
	redraw();
}
function onMove(e) {
	if (!drawing || e.pointerId !== drawing.id) return;
	let { x, y } = local(e);
	if (e.shiftKey) {
		// shift: snap the angle to 15 degree steps
		const a = Math.round(Math.atan2(y - drawing.y1, x - drawing.x1) / (Math.PI / 12)) * (Math.PI / 12);
		const d = Math.hypot(x - drawing.x1, y - drawing.y1);
		x = clamp(drawing.x1 + Math.cos(a) * d, 3, W - 3);
		y = clamp(drawing.y1 + Math.sin(a) * d, 3, H - 3);
	}
	drawing.x2 = x;
	drawing.y2 = y;
	if (Math.hypot(e.clientX - drawing.cx, e.clientY - drawing.cy) > 6) drawing.moved = true;
	redraw();
}
function onUp(e) {
	if (!drawing || e.pointerId !== drawing.id) return;
	const d = drawing;
	drawing = null;
	if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
	const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
	if (len >= MIN_LEN) {
		const s = addString(d.x1, d.y1, d.x2, d.y2);
		if (!REDUCED) strike(s, (d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2, 420, false);
	} else if (!d.moved && !REDUCED) {
		// a tap: pluck a string if the tap is on one, else drop a drop from the tapped spot
		let best = null;
		let bd = 14;
		for (const s of strings) {
			const dd = distToString(s, d.x1, d.y1);
			if (dd < bd) { bd = dd; best = s; }
		}
		if (best) strike(best, d.x1, d.y1, 520, false);
		else spawn(d.x1, d.y1, (rnd() - 0.5) * 20, 0, Math.floor(rnd() * 3));
	}
	redraw();
}
function onCancel(e) {
	if (!drawing || e.pointerId !== drawing.id) return;
	drawing = null;
	redraw();
}

/* ---------- the poster: the string layout, scaled to fit, with a title ---------- */
async function savePoster() {
	if (!strings.length) return;
	saveBtn.disabled = true;
	try {
		await Promise.all([document.fonts.load('900 96px "Nunito Sans"'), document.fonts.load('500 24px "JetBrains Mono"')]);
	} catch (err) { /* the fallback fonts will do */ }
	const PW = 1400;
	const PH = 1750;
	const c = document.createElement('canvas');
	c.width = PW;
	c.height = PH;
	const g = c.getContext('2d');
	// the night
	const bg = g.createLinearGradient(0, 0, 0, PH);
	bg.addColorStop(0, '#0a2a63');
	bg.addColorStop(0.46, '#071b47');
	bg.addColorStop(1, '#040d28');
	g.fillStyle = bg;
	g.fillRect(0, 0, PW, PH);
	let gr = g.createRadialGradient(PW * 0.56, -120, 0, PW * 0.56, -120, PW * 0.9);
	gr.addColorStop(0, 'rgba(70,208,251,0.24)');
	gr.addColorStop(1, 'rgba(70,208,251,0)');
	g.fillStyle = gr;
	g.fillRect(0, 0, PW, PH);
	gr = g.createRadialGradient(PW * 0.95, PH * 1.04, 0, PW * 0.95, PH * 1.04, PW * 0.8);
	gr.addColorStop(0, 'rgba(5,95,233,0.34)');
	gr.addColorStop(1, 'rgba(5,95,233,0)');
	g.fillStyle = gr;
	g.fillRect(0, 0, PW, PH);
	const star = rngFrom(77);
	for (let i = 0; i < 90; i++) {
		g.fillStyle = `rgba(214,240,255,${0.25 + 0.6 * star()})`;
		g.beginPath();
		g.arc(star() * PW, star() * PH, 0.8 + 1.6 * star(), 0, TAU);
		g.fill();
	}
	g.strokeStyle = 'rgba(150,195,255,0.22)';
	g.lineWidth = 2;
	g.beginPath();
	if (g.roundRect) g.roundRect(40, 40, PW - 80, PH - 80, 30); else g.rect(40, 40, PW - 80, PH - 80);
	g.stroke();
	// the title
	g.textBaseline = 'alphabetic';
	g.fillStyle = '#eef4ff';
	g.font = '900 124px "Nunito Sans", system-ui, sans-serif';
	g.fillText('Marble Harp', 110, 235);
	const song = SONGS[Math.max(0, songIx)];
	g.fillStyle = '#7fd4fb';
	g.font = '500 26px "JetBrains Mono", ui-monospace, monospace';
	const n = strings.length;
	g.fillText(`${n} GLASS STRING${n === 1 ? '' : 'S'}  ·  ${song.scaleName.toUpperCase()}`, 112, 296);
	// the strings, fitted into the room below
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;
	strings.forEach((s) => { x0 = Math.min(x0, s.minx); x1 = Math.max(x1, s.maxx); y0 = Math.min(y0, s.miny); y1 = Math.max(y1, s.maxy); });
	const bw = Math.max(40, x1 - x0);
	const bh = Math.max(40, y1 - y0);
	const ax = 130;
	const ay = 380;
	const aw = PW - 260;
	const ah = PH - 380 - 150;
	const sc = Math.min(aw / bw, ah / bh, 2.4);
	const ox = ax + (aw - bw * sc) / 2 - x0 * sc;
	const oy = ay + (ah - bh * sc) / 2 - y0 * sc;
	const fitted = () => {
		g.save();
		g.globalCompositeOperation = 'lighter';
		g.translate(ox, oy);
		g.scale(sc, sc);
		strings.forEach((s) => paintString(g, s, false));
		g.restore();
	};
	if ('filter' in g) {
		// a soft bloom under the sharp strings (where the browser can blur a canvas draw)
		g.filter = 'blur(16px)';
		fitted();
		g.filter = 'none';
	}
	fitted();
	if (n <= 28) {
		// the note names, small, beside the strings like a score
		g.font = '500 19px "JetBrains Mono", ui-monospace, monospace';
		g.fillStyle = 'rgba(190,225,255,0.7)';
		g.textAlign = 'center';
		strings.forEach((s) => {
			const top = s.y1 < s.y2 ? [s.x1, s.y1] : [s.x2, s.y2];
			g.fillText(noteName(s.semi), top[0] * sc + ox, top[1] * sc + oy - 20);
		});
		g.textAlign = 'left';
	}
	c.toBlob((blob) => {
		if (blob) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'marble-harp-poster.png';
			document.body.append(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 4000);
		}
		saveBtn.textContent = 'Saved';
		setTimeout(() => { saveBtn.textContent = 'Save PNG'; syncTools(); }, 1600);
	}, 'image/png');
}

/* ---------- controls and start ---------- */
function clearAll() {
	strings = [];
	marbles = [];
	rings = [];
	songIx = -1;
	syncTools();
	redraw();
}

function start() {
	layout();
	loadSong(0);
	draw();
	const reducedMsg = 'Off while reduced motion is on';

	songBtns.forEach((b, i) => b.addEventListener('click', () => { loadSong(i); redraw(); }));
	clearBtn.addEventListener('click', clearAll);
	saveBtn.addEventListener('click', savePoster);
	canvas.addEventListener('pointerdown', onDown);
	canvas.addEventListener('pointermove', onMove);
	canvas.addEventListener('pointerup', onUp);
	canvas.addEventListener('pointercancel', onCancel);
	canvas.addEventListener('lostpointercapture', onCancel);
	// a change of the system setting while the page is open: reload into the other state
	reducedMotionQuery.addEventListener?.('change', () => { if (REDUCED !== prefersReducedMotion()) location.reload(); });

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); redraw(); }, 150);
	});

	if (REDUCED) {
		// one still: the first song's strings with a few drops caught mid-fall, and nothing running
		pauseBtn.disabled = true;
		pauseBtn.title = reducedMsg;
		soundBtn.disabled = true;
		soundBtn.title = reducedMsg;
		return;
	}
	soundBtn.disabled = !(window.AudioContext || window.webkitAudioContext);
	if (soundBtn.disabled) soundBtn.title = 'This browser has no Web Audio';

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, (dt) => {
		advance(dt, false);
		draw();
	}, { name: 'marble-harp' });

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
	soundBtn.addEventListener('click', () => setSound(!soundOn));
}

boot();
start();
