/*
 * Sample 26 — "Magnetic Dot Mesh Hero".
 * A hero section: a lattice of dots joined by faint lines on the day sky, with a frosted glass headline card in
 * the middle. Every dot is a spring pulled back to its home place; the pointer pushes the dots near it away,
 * a click or tap sends a shockwave through the whole mesh, and the dots that sit near the card are bent clear
 * of its box (once, when the page is laid out) so the mesh flows around it. A displaced dot grows and glows
 * cyan; lines get lighter as they stretch. Hands-free, a ghost pointer wanders and a soft pulse goes out now
 * and then. Reduced motion: the mesh at rest with one frozen ripple, drawn once.
 *
 * Written from the idea only; no source code was read or copied.
 * (The CodePen this idea comes from, "Magnetic dot mesh" by JP (jpbelley), refused the download, so nothing of it
 * was read; this is new code.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const screen = document.querySelector('.piece-screen');
const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const card = document.querySelector('.hero__card');
const pauseBtn = document.querySelector('[data-action="pause"]');
const rippleBtn = document.querySelector('[data-action="ripple"]');

const REDUCED = prefersReducedMotion();

/* ---------- tuning ---------- */
const SPRING = 52; // how hard a dot is pulled home
const DAMP = 6.2; // how quickly its wobble dies (a little under critical, so it overshoots once)
const PUSH = 3400; // the pointer's push at its centre
const WAVE_FORCE = 4200; // a shockwave's push on the dots its ring passes
const WAVE_SPEED = 470; // px per second
const WAVE_BAND = 58; // half the ring's width, px
const WAVE_LIFE = 1.55; // seconds a shockwave lasts
const IDLE_AFTER = 3.5; // seconds without a pointer before the ghost takes over
const MAX_PUSH = 40; // a dot this far from home is fully "lit"

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (e0, e1, v) => {
	const t = clamp((v - e0) / (e1 - e0), 0, 1);
	return t * t * (3 - 2 * t);
};

/* small deterministic PRNG, so the first picture is the same on every visit */
let seed = 23;
const rnd = () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

/* ---------- colour: royal and azure dots, cyan light where a dot is pushed, pale-blue lines ---------- */
const ROYAL = [12, 107, 237];
const AZURE = [77, 159, 243];
const CYAN = [70, 208, 251];
const LEVELS = 6; // colour steps from "at rest" to "fully pushed"
const FILL = [ROYAL, AZURE].map((base) => Array.from({ length: LEVELS }, (_, lv) => {
	const t = Math.pow(lv / (LEVELS - 1), 0.8);
	const c = base.map((v, k) => Math.round(v + (CYAN[k] - v) * t));
	return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}));
const HALO = [0, 0.1, 0.16, 0.22, 0.28].map((a) => `rgba(70, 208, 251, ${a})`);
const EDGE_STEPS = 9;
const EDGE_MAX = 0.62; // alpha of the strongest line
const EDGE_FILL = Array.from({ length: EDGE_STEPS }, (_, k) => `rgba(26, 116, 240, ${(((k + 1) / EDGE_STEPS) * EDGE_MAX).toFixed(3)})`);

/* ---------- the mesh ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let SP = 46; // lattice spacing, px
let R = 140; // pointer radius, px
let R_DOT = 2.3; // a dot at rest, px
let phone = false; // a narrow window: the info panel covers its lower half
let count = 0;
let hx; let hy; let x; let y; let vx; let vy; let vis; let tone; let lit; // per dot (typed arrays)
let bucket; let halo; let rad;
let edgeA; let edgeB; let edgeLen; // per line
let edgeStep;
let box = null; // the card's box in canvas pixels

function measureBox() {
	const c = canvas.getBoundingClientRect();
	const b = card.getBoundingClientRect();
	box = b.width > 0 ? { cx: b.left - c.left + b.width / 2, cy: b.top - c.top + b.height / 2, hw: b.width / 2, hh: b.height / 2, r: 22 } : null;
}

function layout() {
	// a pixel ratio above 2 buys nothing on a field of 2 px dots
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	measureBox();

	const small = W < 560;
	phone = small;
	SP = small ? 34 : W < 900 ? 40 : 46; // fewer dots on a phone
	R = small ? 100 : 140;
	R_DOT = small ? 1.9 : 2.3;
	const rowH = SP * 0.866;
	const cols = Math.ceil(W / SP) + 2;
	const rows = Math.ceil(H / rowH) + 2;
	count = cols * rows;
	const ox = (W - (cols - 1) * SP - SP / 2) / 2;
	const oy = (H - (rows - 1) * rowH) / 2;

	hx = new Float32Array(count); hy = new Float32Array(count);
	x = new Float32Array(count); y = new Float32Array(count);
	vx = new Float32Array(count); vy = new Float32Array(count);
	vis = new Float32Array(count);
	lit = new Float32Array(count);
	tone = new Uint8Array(count);
	bucket = new Uint8Array(count);
	halo = new Uint8Array(count);
	rad = new Float32Array(count);

	/* bend the lattice clear of the card: dots near its box are pushed outward along the box's normal, most at the
	   edge, so the mesh bunches up softly around it; dots inside, and the ring just outside, fade out */
	const P = small ? 16 : 26; // the push at the card's edge
	const reach = small ? 64 : 92;
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			const k = j * cols + i;
			let px = ox + i * SP + (j & 1 ? SP / 2 : 0);
			let py = oy + j * rowH;
			let v = 1;
			if (box) {
				const dx = px - box.cx;
				const dy = py - box.cy;
				const qx = Math.abs(dx) - (box.hw - box.r);
				const qy = Math.abs(dy) - (box.hh - box.r);
				const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - box.r;
				let nx;
				let ny;
				if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); nx = qx / l; ny = qy / l; }
				else if (qx > qy) { nx = 1; ny = 0; } else { nx = 0; ny = 1; }
				if (dx < 0) nx = -nx;
				if (dy < 0) ny = -ny;
				if (d < reach) {
					const push = d >= 0 ? P * (1 - d / reach) * (1 - d / reach) : P;
					px += nx * push;
					py += ny * push;
					v = d >= 0 ? smooth(P * 0.4, P * 1.4, d + push) : 0;
				}
			}
			hx[k] = x[k] = px;
			hy[k] = y[k] = py;
			vis[k] = v;
			tone[k] = (((i * 73856093) ^ (j * 19349663)) >>> 0) % 100 < 34 ? 0 : 1;
		}
	}

	/* the lines: each dot to its right neighbour and to the two below it (a triangle lattice) */
	const ea = [];
	const eb = [];
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			const k = j * cols + i;
			if (i + 1 < cols) { ea.push(k); eb.push(k + 1); }
			if (j + 1 < rows) {
				const lo = (j & 1) ? i : i - 1; // the two dots below sit at lo and lo + 1
				if (lo >= 0 && lo < cols) { ea.push(k); eb.push((j + 1) * cols + lo); }
				if (lo + 1 >= 0 && lo + 1 < cols) { ea.push(k); eb.push((j + 1) * cols + lo + 1); }
			}
		}
	}
	edgeA = Uint32Array.from(ea);
	edgeB = Uint32Array.from(eb);
	edgeLen = new Float32Array(ea.length);
	edgeStep = new Uint8Array(ea.length);
	for (let e = 0; e < ea.length; e++) edgeLen[e] = Math.hypot(hx[edgeA[e]] - hx[edgeB[e]], hy[edgeA[e]] - hy[edgeB[e]]);
}

/* ---------- things that move the mesh: you, the ghost, shockwaves ---------- */
const user = { x: 0, y: 0, amp: 0, on: false };
const ghost = { x: 0, y: 0, amp: 0 };
const waves = [];
let clock = 0; // simulation seconds
let lastUser = -1e9;
let nextPulse = 0.6;
let still = false; // the reduced-motion still: the ghost stays where it was put

function emit(wx, wy, amp) {
	waves.push({ x: wx, y: wy, age: 0, r: 0, amp });
	if (waves.length > 6) waves.shift();
}

function step(h) {
	clock += h;
	const idle = !user.on && clock - lastUser > IDLE_AFTER;
	user.amp += ((user.on ? 1 : 0) - user.amp) * Math.min(1, h * 12);
	ghost.amp += ((idle ? 1 : 0) - ghost.amp) * Math.min(1, h * 1.6);
	if (!still) {
		// a slow wander over the window (on a phone, over the part the info panel leaves clear)
		const yc = phone ? 0.27 : 0.5;
		const ya = phone ? 0.24 : 0.38;
		ghost.x = W * (0.5 + 0.4 * Math.sin(clock * 0.21 + 0.9) + 0.07 * Math.sin(clock * 0.77));
		ghost.y = H * (yc + ya * Math.sin(clock * 0.29 + 2.4) + 0.06 * Math.sin(clock * 0.61 + 1));
		// and now and then a soft pulse from somewhere in the middle of the window
		if (!idle) nextPulse = Math.max(nextPulse, clock + 4);
		else if (clock >= nextPulse) {
			emit(W * (0.2 + 0.6 * rnd()), H * (phone ? 0.08 + 0.4 * rnd() : 0.25 + 0.5 * rnd()), 0.55);
			nextPulse = clock + 5 + rnd() * 3;
		}
	}
	for (let i = waves.length - 1; i >= 0; i--) {
		const w = waves[i];
		w.age += h;
		w.r = WAVE_SPEED * w.age;
		if (w.age > WAVE_LIFE) waves.splice(i, 1);
	}

	const R2 = R * R;
	const srcs = [];
	if (user.amp > 0.01) srcs.push(user);
	if (ghost.amp > 0.01) srcs.push(ghost);
	const nw = waves.length;
	for (let i = 0; i < count; i++) {
		if (vis[i] < 0.03) continue;
		const px = x[i];
		const py = y[i];
		let fx = (hx[i] - px) * SPRING - vx[i] * DAMP;
		let fy = (hy[i] - py) * SPRING - vy[i] * DAMP;
		for (let s = 0; s < srcs.length; s++) {
			const dx = px - srcs[s].x;
			const dy = py - srcs[s].y;
			const d2 = dx * dx + dy * dy;
			if (d2 < R2) {
				const d = Math.sqrt(d2) + 0.01;
				const q = 1 - d / R;
				const f = (q * q * PUSH * srcs[s].amp) / d;
				fx += dx * f;
				fy += dy * f;
			}
		}
		for (let k = 0; k < nw; k++) {
			const w = waves[k];
			const dx = px - w.x;
			const dy = py - w.y;
			const d2 = dx * dx + dy * dy;
			const lo = Math.max(0, w.r - WAVE_BAND);
			const hi = w.r + WAVE_BAND;
			if (d2 < lo * lo || d2 > hi * hi) continue;
			const d = Math.sqrt(d2) + 0.01;
			const q = 1 - Math.abs(d - w.r) / WAVE_BAND;
			const life = 1 - w.age / WAVE_LIFE;
			const f = (q * q * WAVE_FORCE * w.amp * life * life) / (1 + d / 420) / d;
			fx += dx * f;
			fy += dy * f;
		}
		vx[i] += fx * h;
		vy[i] += fy * h;
		x[i] = px + vx[i] * h;
		y[i] = py + vy[i] * h;
	}
}

/* ---------- drawing ---------- */

function glow(s) {
	if (s.amp < 0.02) return;
	const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
	g.addColorStop(0, `rgba(70, 208, 251, ${(0.2 * s.amp).toFixed(3)})`);
	g.addColorStop(0.55, `rgba(77, 159, 243, ${(0.07 * s.amp).toFixed(3)})`);
	g.addColorStop(1, 'rgba(77, 159, 243, 0)');
	ctx.fillStyle = g;
	ctx.fillRect(s.x - R, s.y - R, R * 2, R * 2);
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	glow(user);
	glow(ghost);

	/* how far each dot is from home picks its colour, size and halo */
	for (let i = 0; i < count; i++) {
		const v = vis[i];
		if (v < 0.04) { bucket[i] = 255; continue; }
		const m = Math.hypot(x[i] - hx[i], y[i] - hy[i]);
		const t = clamp(m / MAX_PUSH, 0, 1);
		lit[i] = t;
		bucket[i] = tone[i] * LEVELS + Math.round(t * (LEVELS - 1));
		halo[i] = t > 0.12 ? 1 + Math.min(3, Math.floor(((t - 0.12) / 0.88) * 4)) : 0;
		rad[i] = R_DOT * (1 + 1.05 * t) * (0.4 + 0.6 * v);
	}

	/* lines: pale blue; the longer they stretch the lighter they get, and they gather colour where dots are lit */
	ctx.lineWidth = 1.1;
	ctx.lineCap = 'round';
	for (let e = 0; e < edgeA.length; e++) {
		const a = edgeA[e];
		const b = edgeB[e];
		const v = Math.min(vis[a], vis[b]);
		if (v < 0.04) { edgeStep[e] = 0; continue; }
		const q = Math.hypot(x[a] - x[b], y[a] - y[b]) / edgeLen[e];
		let al = 0.23 * v;
		if (q > 1) al *= clamp(1 - (q - 1) / 1.15, 0, 1);
		else al *= 1 + (1 - q) * 1.1;
		al += 0.28 * Math.max(lit[a], lit[b]) * clamp(1.5 - q, 0, 1);
		edgeStep[e] = clamp(Math.ceil((al / EDGE_MAX) * EDGE_STEPS), 0, EDGE_STEPS);
	}
	for (let s = 1; s <= EDGE_STEPS; s++) {
		ctx.beginPath();
		let any = false;
		for (let e = 0; e < edgeA.length; e++) {
			if (edgeStep[e] !== s) continue;
			ctx.moveTo(x[edgeA[e]], y[edgeA[e]]);
			ctx.lineTo(x[edgeB[e]], y[edgeB[e]]);
			any = true;
		}
		if (any) {
			ctx.strokeStyle = EDGE_FILL[s - 1];
			ctx.stroke();
		}
	}

	/* cyan halos under the lit dots, then the dots */
	for (let hlv = 1; hlv < HALO.length; hlv++) {
		ctx.beginPath();
		let any = false;
		for (let i = 0; i < count; i++) {
			if (bucket[i] === 255 || halo[i] !== hlv) continue;
			const r = rad[i] * 3;
			ctx.moveTo(x[i] + r, y[i]);
			ctx.arc(x[i], y[i], r, 0, 6.2832);
			any = true;
		}
		if (any) {
			ctx.fillStyle = HALO[hlv];
			ctx.fill();
		}
	}
	for (let b = 0; b < LEVELS * 2; b++) {
		ctx.beginPath();
		let any = false;
		for (let i = 0; i < count; i++) {
			if (bucket[i] !== b) continue;
			ctx.moveTo(x[i] + rad[i], y[i]);
			ctx.arc(x[i], y[i], rad[i], 0, 6.2832);
			any = true;
		}
		if (any) {
			ctx.fillStyle = FILL[(b / LEVELS) | 0][b % LEVELS];
			ctx.fill();
		}
	}

	/* the shockwaves' rings */
	for (let k = 0; k < waves.length; k++) {
		const w = waves[k];
		if (w.r < 4) continue;
		const life = 1 - w.age / WAVE_LIFE;
		const f = Math.max(0, life * life * w.amp);
		ctx.lineWidth = 12;
		ctx.strokeStyle = `rgba(77, 159, 243, ${(0.1 * f).toFixed(3)})`;
		ctx.beginPath();
		ctx.arc(w.x, w.y, w.r, 0, 6.2832);
		ctx.stroke();
		ctx.lineWidth = 1.6;
		ctx.strokeStyle = `rgba(70, 208, 251, ${(0.75 * f).toFixed(3)})`;
		ctx.beginPath();
		ctx.arc(w.x, w.y, w.r, 0, 6.2832);
		ctx.stroke();
	}
}

/* ---------- the pointer ---------- */

let ctl = null;
const running = () => !!ctl && ctl.running;
// the Ripple button's places, as fractions of the window (on a phone: the part the info panel leaves clear)
const SPOTS = [[0.78, 0.3], [0.22, 0.7], [0.5, 0.5], [0.8, 0.72], [0.2, 0.26]];
const SPOTS_PHONE = [[0.74, 0.5], [0.26, 0.5], [0.5, 0.06], [0.84, 0.1], [0.16, 0.1]];
const spot = (k) => (phone ? SPOTS_PHONE : SPOTS)[k % SPOTS.length];
let rippleIdx = 0;

function at(ev) {
	const r = canvas.getBoundingClientRect();
	return [ev.clientX - r.left, ev.clientY - r.top];
}

screen.addEventListener('pointermove', (ev) => {
	if (REDUCED) return;
	const [px, py] = at(ev);
	// a mouse pushes the dots while it hovers; a finger or pen only while it touches
	if (ev.pointerType === 'mouse' || ev.buttons) {
		user.x = px;
		user.y = py;
		user.on = true;
		lastUser = clock;
	}
});
screen.addEventListener('pointerdown', (ev) => {
	if (ev.button > 0) return;
	const [px, py] = at(ev);
	if (py < 0) return;
	if (REDUCED) { frozenRipple(px / W, py / H); return; }
	user.x = px;
	user.y = py;
	user.on = true;
	lastUser = clock;
	if (running()) emit(px, py, 1);
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

/* ---------- running ---------- */

function tick(dt) {
	// a fixed small step keeps the springs steady when a frame runs long
	const n = Math.min(3, Math.max(1, Math.ceil(dt * 60 - 0.01)));
	for (let k = 0; k < n; k++) step(dt / n);
	draw();
}

/* a head start: the ghost has already been wandering and the first pulse is on its way out */
function headStart() {
	for (let k = 0; k < 66; k++) step(1 / 60);
}

/* the reduced-motion still: the mesh with the ghost pointer parked in it and one frozen ripple, drawn once */
function frozenRipple(fx, fy) {
	waves.length = 0;
	for (let k = 0; k < 140; k++) step(1 / 60); // the dots settle round the parked pointer
	emit(W * fx, H * fy, 1);
	for (let k = 0; k < 24; k++) step(1 / 60); // and the ripple goes out for a third of a second
	draw();
}
function stillFrame() {
	still = true;
	user.on = false;
	user.amp = 0;
	// the parked pointer sits in clear space beside the card (above it on a phone)
	ghost.x = W * (phone ? 0.3 : 0.14);
	ghost.y = H * (phone ? 0.5 : 0.3);
	ghost.amp = 1;
	lastUser = -1e9;
	const [fx, fy] = spot(rippleIdx);
	frozenRipple(fx, fy);
}

function relayout(redraw) {
	layout();
	redraw();
}

function start() {
	layout();
	// the card's box changes a little once the web font is in, so measure and lay the mesh out again
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(() => relayout(REDUCED ? stillFrame : () => { headStart(); draw(); }));
	}
	let timer = 0;
	if (REDUCED) {
		stillFrame();
		// the controls jump straight to a finished state
		pauseBtn.disabled = true;
		pauseBtn.setAttribute('aria-disabled', 'true');
		rippleBtn.addEventListener('click', () => {
			rippleIdx++;
			const [fx, fy] = spot(rippleIdx);
			frozenRipple(fx, fy);
		});
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => relayout(stillFrame), 150);
		});
		return;
	}
	headStart();
	draw();

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'dot-mesh-hero' });

	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); headStart(); draw(); }, 150);
	});

	rippleBtn.addEventListener('click', () => {
		const [fx, fy] = spot(rippleIdx++);
		emit(W * fx, H * fy, 1);
		lastUser = clock;
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		rippleBtn.disabled = paused;
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
