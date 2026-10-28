/*
 * Sample 27 — "Glass Jellyfish".
 * A translucent glass jellyfish drifts through deep navy water on a Canvas 2D layer. One big jellyfish follows the
 * pointer (gently, with lag; a tap makes it pulse); with no pointer for about two seconds it swims a slow wander
 * path by itself, as do a few smaller ones behind it. The bell pulses (contract, relax) and each pulse pushes the
 * body a little. Every glowing tentacle and each frilly oral arm is a short chain of points that hangs from the
 * bell's rim: each step the points keep their speed, drift toward a loose rest pose below the bell, and are then
 * pulled back to a fixed distance from the point above (a rope of Verlet-style, follow-the-leader links, with
 * time-scaled steps), so they trail behind a fast bell and sway when it is still. Plankton specks drift and
 * brighten when a bell nearby moves fast, and get a small push on each pulse. Everything runs inside loop() from
 * js/lab.js, so it stops off-screen and in a hidden tab; under reduced motion one posed jellyfish is drawn once.
 *
 * Idea: a canvas creature whose body trails the pointer and whose tentacles are Verlet chains, as in the "Curious
 * Squid" pen by pimskie (CodePen XgaevB), which credits Keith Peters' Coding Math for the Verlet approach.
 * Written from the idea only; no source code was read or copied (the pen itself could not be fetched here).
 * The glass jellyfish, its pulse, the plankton, the idle wander path and everything else here are new.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');
const pulseBtn = document.querySelector('[data-action="pulse"]');
const panel = document.querySelector('.sample-info');
const REDUCED = prefersReducedMotion();
const TAU = Math.PI * 2;

/* ---------- tuning ---------- */
const PULSE_SPLIT = 0.3; // the share of each pulse spent contracting; the rest is the slow relax
const MAX_SPEED = 560; // px per second, for the big jellyfish
const FAST = 220; // the speed at which plankton lights up fully
const IDLE_AFTER = 2; // seconds without a pointer before the wander path takes over
const WARM_STEPS = 170; // steps run before the first frame, so the tentacles already hang naturally
const STEP = 1 / 60;
const PIXEL_BUDGET = 2.4e6; // backing-store pixels, at most

/* ---------- state ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let phone = false;
let clock = 0;
let jellies = [];
let hero = null;
let plankton = [];
let plankSplit = 0;
let rays = [];
let rayGrad = null;
let panelTop = 0; // the info panel's top edge and right edge, in canvas px
let panelRight = 0;
let paused = false;
let wmix = 1; // 1 = following the wander path, 0 = following the pointer
const pointer = { x: 0, y: 0, t: -99, seen: false };
const aim = { x: 0, y: 0 };
const tmp = { x: 0, y: 0 };

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
const lighten = (c, f) => [Math.round(mix(c[0], 255, f)), Math.round(mix(c[1], 255, f)), Math.round(mix(c[2], 255, f))];

/* ---------- layout ---------- */
function layout() {
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	// the glow and the rays are soft, so a sharp-screen laptop doesn't need every pixel: cap the ratio, and the canvas at about 2.4 million pixels
	DPR = Math.min(phone ? 1.5 : 2, window.devicePixelRatio || 1, Math.max(1, Math.sqrt(PIXEL_BUDGET / (W * H))));
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	measurePanel();
}

/* the info panel covers the lower left of the water: the wander paths keep the jellyfish clear of it */
function measurePanel() {
	const c = canvas.getBoundingClientRect();
	const p = panel.getBoundingClientRect();
	panelTop = p.top - c.top;
	panelRight = p.right - c.left;
}

/* ---------- a jellyfish ---------- */
const TINTS = {
	hero: [70, 208, 251], // cyan light #46d0fb
	azure: [77, 159, 243],
	ice: [150, 222, 255],
	royal: [60, 140, 240],
};

function makeJelly(o) {
	const rnd = rngFrom(o.seed);
	const nT = o.nT;
	const M = o.M;
	const nA = o.hero ? 4 : 3;
	const MA = phone ? 5 : 7;
	const j = {
		hero: !!o.hero,
		z: o.z,
		alpha: o.alpha,
		R: o.R,
		seed: o.seed,
		tint: o.tint,
		core: lighten(o.tint, 0.55),
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		tilt: 0,
		phase: rnd(),
		c: 0,
		thrust: 0,
		glow: 0,
		boost: 0,
		w: o.R,
		h: o.R * 0.92,
		ws: 0.8 + rnd() * 0.5, // how quickly it follows its wander path
		wp: [rnd() * TAU, rnd() * TAU, rnd() * TAU, rnd() * TAU],
		box: { x0: 0, x1: 1, y0: 0, y1: 1 },
		nT, M, nA, MA,
		L: o.L,
		// tentacles: nT chains of M points (x, y, and a velocity for each)
		tx: new Float32Array(nT * M),
		ty: new Float32Array(nT * M),
		tvx: new Float32Array(nT * M),
		tvy: new Float32Array(nT * M),
		u: new Float32Array(nT), // where along the rim each one hangs, -1 .. 1
		seg: new Float32Array(nT), // each has its own length
		ph: new Float32Array(nT), // and its own sway
		// oral arms: shorter, thicker, close to the middle
		ax: new Float32Array(nA * MA),
		ay: new Float32Array(nA * MA),
		avx: new Float32Array(nA * MA),
		avy: new Float32Array(nA * MA),
		aseg: o.R * 0.2,
		aph: new Float32Array(nA),
	};
	for (let k = 0; k < nT; k++) {
		j.u[k] = nT > 1 ? -0.86 + (1.72 * k) / (nT - 1) : 0;
		j.seg[k] = (o.L / (M - 1)) * (0.7 + 0.3 * rnd());
		j.ph[k] = rnd() * TAU;
	}
	for (let k = 0; k < nA; k++) j.aph[k] = rnd() * TAU;
	return j;
}

/* the bell's lower lip: higher in the middle, so the bell reads as a hollow dome */
const lipY = (u, h) => -0.15 * h * (1 - u * u);

/* hang the chains straight down from the bell, so the first frame is already tidy */
function hang(j) {
	const { nT, M, nA, MA } = j;
	for (let k = 0; k < nT; k++) {
		const ax = j.x + j.u[k] * j.w;
		const ay = j.y + lipY(j.u[k], j.h);
		for (let i = 0; i < M; i++) {
			const n = k * M + i;
			j.tx[n] = ax + j.u[k] * i * 1.2;
			j.ty[n] = ay + i * j.seg[k];
			j.tvx[n] = 0;
			j.tvy[n] = 0;
		}
	}
	for (let k = 0; k < nA; k++) {
		const ax = j.x + (k - (nA - 1) / 2) * j.w * 0.3;
		for (let i = 0; i < MA; i++) {
			const n = k * MA + i;
			j.ax[n] = ax;
			j.ay[n] = j.y - j.h * 0.1 + i * j.aseg;
			j.avx[n] = 0;
			j.avy[n] = 0;
		}
	}
}

/* ---------- building the scene ---------- */
function build() {
	phone = W < 560;
	const base = Math.min(W, H * 1.5);
	const heroR = phone ? clamp(base * 0.115, 34, 46) : clamp(base * 0.058, 40, 72);
	const heroL = phone ? clamp(H * 0.26, 110, 170) : clamp(H * 0.3, 140, 280);
	const M = phone ? 11 : 16;
	jellies = [];
	const smalls = phone
		? [{ z: 0.5, tint: TINTS.azure }, { z: 0.66, tint: TINTS.ice }]
		: [{ z: 0.42, tint: TINTS.azure }, { z: 0.55, tint: TINTS.royal }, { z: 0.66, tint: TINTS.ice }, { z: 0.78, tint: TINTS.azure }];
	smalls.forEach((s, i) => {
		jellies.push(makeJelly({
			seed: 11 + i * 7,
			z: s.z,
			alpha: 0.4 + 0.5 * s.z,
			R: heroR * (0.45 + 0.5 * s.z),
			L: heroL * (0.5 + 0.4 * s.z),
			nT: phone ? 6 : 9,
			M: phone ? 8 : 11,
			tint: s.tint,
		}));
	});
	hero = makeJelly({ hero: true, seed: 3, z: 1, alpha: 1, R: heroR, L: heroL, nT: phone ? 9 : 13, M, tint: TINTS.hero });
	jellies.push(hero);
	measurePanel();
	setBoxes();

	// plankton
	const rnd = rngFrom(99);
	const count = Math.round(clamp((W * H) / 7500, 40, 150));
	plankton = [];
	for (let i = 0; i < count; i++) {
		const z = 0.3 + 0.7 * rnd();
		plankton.push({
			x: rnd() * W,
			y: rnd() * H,
			z,
			vx: (rnd() - 0.5) * 8,
			vy: 2 + rnd() * 5,
			ph: rnd() * TAU,
			ix: 0,
			iy: 0,
			b: 0,
		});
	}
	plankton.sort((a, b) => a.z - b.z);
	plankSplit = plankton.findIndex((p) => p.z >= 0.7); // far specks are drawn behind the jellyfish, near ones in front
	if (plankSplit < 0) plankSplit = plankton.length;

	// slow rays of surface light
	rays = [];
	const rr = rngFrom(5);
	const nRay = phone ? 3 : 5;
	for (let i = 0; i < nRay; i++) {
		rays.push({ x: (i + 0.3 + rr() * 0.5) / nRay, w: 0.035 + rr() * 0.05, drift: 0.06 + rr() * 0.1, sp: 0.1 + rr() * 0.12, ph: rr() * TAU, a: 0.5 + rr() * 0.5 });
	}
	rayGrad = ctx.createLinearGradient(0, 0, 0, H * 0.95);
	rayGrad.addColorStop(0, 'rgba(130, 220, 255, 0.2)');
	rayGrad.addColorStop(0.45, 'rgba(70, 170, 255, 0.07)');
	rayGrad.addColorStop(1, 'rgba(70, 170, 255, 0)');

	// start each jellyfish on its own path, then let the tentacles settle
	clock = 0;
	jellies.forEach((j) => {
		wanderPos(j, 0, tmp);
		j.x = tmp.x;
		j.y = tmp.y;
		j.tilt = 0;
		shape(j);
		hang(j);
	});
	aim.x = hero.x;
	aim.y = hero.y;
	wmix = 1;
	pointer.seen = false; // a rebuild (resize) starts on the wander path again
	for (let i = 0; i < WARM_STEPS; i++) update(STEP);
}

/* where each jellyfish wanders: the big one stays clear of the info panel, the small ones have the water */
function setBoxes() {
	jellies.forEach((j) => {
		const b = j.box;
		const lenA = j.L + j.R * 0.6;
		if (j.hero) {
			if (W >= 720) {
				b.x0 = Math.max(0.36 * W, panelRight + j.R + 30);
				b.x1 = 0.9 * W;
				b.y0 = j.R * 1.6 + 10;
				b.y1 = Math.max(b.y0 + 40, Math.min(0.52 * H, H - lenA - 16));
			} else {
				b.x0 = 0.2 * W;
				b.x1 = 0.8 * W;
				b.y0 = j.R * 1.5 + 8;
				b.y1 = Math.max(b.y0 + 24, panelTop - lenA - 16);
			}
		} else {
			b.x0 = 0.08 * W;
			b.x1 = 0.92 * W;
			b.y0 = j.R * 1.4 + 8;
			b.y1 = Math.max(b.y0 + 30, W >= 720 ? 0.62 * H : panelTop - lenA - 10);
		}
	});
}

function wanderPos(j, t, out) {
	const b = j.box;
	const p = j.wp;
	const s = j.ws;
	const nx = 0.5 + 0.34 * Math.sin(t * 0.21 * s + p[0]) + 0.16 * Math.sin(t * 0.47 * s + p[1]);
	const ny = 0.5 + 0.3 * Math.sin(t * 0.17 * s + p[2]) + 0.2 * Math.sin(t * 0.39 * s + p[3]);
	out.x = b.x0 + nx * (b.x1 - b.x0);
	out.y = b.y0 + ny * (b.y1 - b.y0);
}

/* ---------- the pulse and the bell's shape ---------- */
function shape(j) {
	const p = j.phase;
	if (p < PULSE_SPLIT) {
		const x = p / PULSE_SPLIT;
		j.c = Math.sin(x * Math.PI * 0.5);
		j.thrust = Math.sin(x * Math.PI);
	} else {
		const x = (p - PULSE_SPLIT) / (1 - PULSE_SPLIT);
		j.c = 1 - x * x * (3 - 2 * x);
		j.thrust = 0;
	}
	j.w = j.R * (1 - 0.2 * j.c);
	j.h = j.R * 0.92 * (1 + 0.08 * j.c);
}

function burst(j, s) {
	j.phase = 0;
	j.boost = s;
	j.glow = Math.max(j.glow, 0.9 * s);
	j.vx += Math.sin(j.tilt) * 240 * s;
	j.vy -= Math.cos(j.tilt) * 240 * s;
}

/* ---------- one chain: a rope that trails, hangs and sways ---------- */
function chainStep(X, Y, VX, VY, o, M, ax, ay, rx, ry, seg, amp, ph, t, dt, k0, k1, damp, grav) {
	X[o] = ax;
	Y[o] = ay;
	VX[o] = 0;
	VY[o] = 0;
	const sx = -ry; // sideways, for the wave that runs down the chain
	const sy = rx;
	const keep = Math.exp(-damp * dt);
	for (let i = 1; i < M; i++) {
		const n = o + i;
		const f = i / (M - 1);
		// keep the speed it had, with a little sinking
		let nx = X[n] + VX[n] * keep * dt;
		let ny = Y[n] + (VY[n] * keep + grav * dt) * dt;
		// drift toward a loose rest pose: straight down the bell, with a slow wave running along it
		const wave = Math.sin(t * 1.25 + ph + i * 0.55) * amp * f;
		const kk = 1 - Math.exp(-(k0 + (k1 - k0) * f) * dt);
		nx += (ax + rx * seg * i + sx * wave - nx) * kk;
		ny += (ay + ry * seg * i + sy * wave - ny) * kk;
		// then follow the leader: exactly one link from the point above
		const lx = X[n - 1];
		const ly = Y[n - 1];
		let dx = nx - lx;
		let dy = ny - ly;
		const d = Math.hypot(dx, dy) || 1e-4;
		nx = lx + (dx / d) * seg;
		ny = ly + (dy / d) * seg;
		VX[n] = (nx - X[n]) / dt;
		VY[n] = (ny - Y[n]) / dt;
		X[n] = nx;
		Y[n] = ny;
	}
}

/* ---------- stepping the world ---------- */
function updateJelly(j, dt) {
	const t = clock;
	const speed = Math.hypot(j.vx, j.vy);
	// the pulse: faster when it is swimming
	const freq = (j.hero ? 0.78 : 0.58) + Math.min(1, speed / 260) * 0.75 + j.boost * 0.35;
	j.phase += dt * freq;
	if (j.phase >= 1) j.phase -= 1;
	shape(j);
	j.boost *= Math.exp(-dt * 1.5);
	j.glow += ((clamp((speed - 30) / FAST, 0, 1.1) + j.boost * 0.6) - j.glow) * (1 - Math.exp(-dt * (speed > 30 ? 5 : 1.6)));

	// swim: a loose spring to where it is heading, stronger while the bell squeezes, plus a small bob
	let gx;
	let gy;
	let k;
	if (j.hero) {
		gx = aim.x;
		gy = aim.y;
		k = 3.1;
	} else {
		wanderPos(j, t, tmp);
		gx = tmp.x;
		gy = tmp.y;
		k = 0.9;
	}
	const surge = 0.45 + 1.1 * j.thrust;
	let ax = (gx - j.x) * k * surge - j.vx * (j.hero ? 2.6 : 1.9);
	let ay = (gy - j.y) * k * surge - j.vy * (j.hero ? 2.6 : 1.9);
	const bob = (j.hero ? 120 : 60) * j.thrust;
	ax += Math.sin(j.tilt) * bob;
	ay += -Math.cos(j.tilt) * bob + 22 * (1 - j.thrust);
	if (!j.hero) {
		// the small ones give the others room, mostly sideways: the tentacles hang below, so being under one is crowded
		for (const o of jellies) {
			if (o === j) continue;
			const dx = j.x - o.x;
			const dy = (j.y - o.y) * 0.6;
			const d = Math.hypot(dx, dy) || 1;
			const room = (o.R + j.R) * 2.1;
			if (d < room) {
				const f = (1 - d / room) * 300;
				ax += (dx / d) * f;
				ay += ((dy / d) * f) / 0.6;
			}
		}
	}
	j.vx += ax * dt;
	j.vy += ay * dt;
	const cap = j.hero ? MAX_SPEED : 160;
	const v = Math.hypot(j.vx, j.vy);
	if (v > cap) {
		j.vx *= cap / v;
		j.vy *= cap / v;
	}
	j.x += j.vx * dt;
	j.y += j.vy * dt;
	// stay in the water
	const mx = j.R * 1.15;
	if (j.x < mx) { j.x = mx; j.vx = Math.max(0, j.vx); }
	if (j.x > W - mx) { j.x = W - mx; j.vx = Math.min(0, j.vx); }
	const top = j.R * 1.3;
	if (j.y < top) { j.y = top; j.vy = Math.max(0, j.vy); }
	if (j.y > H - j.R * 0.4) { j.y = H - j.R * 0.4; j.vy = Math.min(0, j.vy); }

	// lean into the motion, with a slow sway
	const tiltTo = clamp(j.vx * 0.0017, -0.5, 0.5) + Math.sin(t * 0.55 + j.seed) * 0.06;
	j.tilt += (tiltTo - j.tilt) * (1 - Math.exp(-dt * 3));

	stepChains(j, dt, t);
}

/* hang every tentacle and oral arm from the bell's rim, in its current pose, and step them all */
function stepChains(j, dt, t) {
	const cs = Math.cos(j.tilt);
	const sn = Math.sin(j.tilt);
	const { nT, M, nA, MA } = j;
	const spread = 0.5 + 0.5 * (1 - j.c); // the tentacles fan out as the bell relaxes
	const amp = j.R * 0.16;
	for (let k = 0; k < nT; k++) {
		const u = j.u[k];
		const lx = u * j.w;
		const ly = lipY(u, j.h) + 0.03 * j.h;
		const a = j.tilt + u * 0.2 * spread;
		chainStep(j.tx, j.ty, j.tvx, j.tvy, k * M, M,
			j.x + lx * cs - ly * sn, j.y + lx * sn + ly * cs,
			-Math.sin(a), Math.cos(a), j.seg[k], amp, j.ph[k], t, dt, 9, 0.7, 0.7, 14);
	}
	for (let k = 0; k < nA; k++) {
		const u = (k - (nA - 1) / 2) * 0.34;
		const lx = u * j.w;
		const ly = -0.12 * j.h;
		const a = j.tilt + u * 0.25;
		chainStep(j.ax, j.ay, j.avx, j.avy, k * MA, MA,
			j.x + lx * cs - ly * sn, j.y + lx * sn + ly * cs,
			-Math.sin(a), Math.cos(a), j.aseg, j.R * 0.1, j.aph[k], t, dt, 10, 3.5, 1, 8);
	}
}

function updatePlankton(dt, fixedGlow) {
	const drag = Math.exp(-dt * 1.4);
	for (const p of plankton) {
		p.x += (p.vx + Math.sin(clock * 0.35 + p.ph) * 5 + p.ix) * p.z * dt;
		p.y += (p.vy + Math.cos(clock * 0.29 + p.ph * 1.7) * 4 + p.iy) * p.z * dt;
		p.ix *= drag;
		p.iy *= drag;
		if (p.x < -4) p.x += W + 8;
		else if (p.x > W + 4) p.x -= W + 8;
		if (p.y < -4) p.y += H + 8;
		else if (p.y > H + 4) p.y -= H + 8;
		let amt = 0;
		for (const j of jellies) {
			const r = j.R * 4;
			const dx = p.x - j.x;
			const dy = p.y - (j.y - j.h * 0.3);
			const d2 = dx * dx + dy * dy;
			if (d2 > r * r) continue;
			const d = Math.sqrt(d2) || 1;
			const f = 1 - d / r;
			amt += f * f * (fixedGlow == null ? j.glow : fixedGlow);
			// a pulse pushes the water, and the plankton in it, away from the bell
			const push = j.thrust * (0.4 + j.boost) * f * 900 * dt;
			p.ix += (dx / d) * push;
			p.iy += (dy / d) * push;
		}
		const to = Math.min(1, amt * 2);
		p.b += (to - p.b) * (1 - Math.exp(-dt * (to > p.b ? 10 : 1.3)));
	}
}

function update(dt) {
	clock += dt;
	// who leads the big jellyfish: the pointer, or the wander path after a couple of seconds without one
	const idle = !pointer.seen || clock - pointer.t > IDLE_AFTER;
	wmix += ((idle ? 1 : 0) - wmix) * (1 - Math.exp(-dt * (idle ? 1.2 : 7)));
	wanderPos(hero, clock, tmp);
	const dx = mix(pointer.x, tmp.x, wmix);
	const dy = mix(pointer.y, tmp.y, wmix);
	const f = 1 - Math.exp(-dt * 2.8);
	aim.x += (clamp(dx, hero.R * 1.2, W - hero.R * 1.2) - aim.x) * f;
	aim.y += (clamp(dy, hero.R * 1.4, H - hero.R * 0.5) - aim.y) * f;
	for (const j of jellies) updateJelly(j, dt);
	updatePlankton(dt);
}

/* ---------- drawing ---------- */
function drawRays() {
	ctx.globalCompositeOperation = 'lighter';
	ctx.fillStyle = rayGrad;
	const bottom = H * 0.95;
	for (const r of rays) {
		const x0 = (r.x + Math.sin(clock * r.sp + r.ph) * r.drift * 0.4) * W;
		const w0 = r.w * W * 0.5;
		const shift = (0.12 + 0.1 * Math.sin(clock * r.sp * 0.7 + r.ph)) * W;
		ctx.globalAlpha = r.a * (0.7 + 0.3 * Math.sin(clock * 0.37 + r.ph * 2));
		ctx.beginPath();
		ctx.moveTo(x0 - w0, 0);
		ctx.lineTo(x0 + w0, 0);
		ctx.lineTo(x0 + shift + w0 * 3.2, bottom);
		ctx.lineTo(x0 + shift - w0 * 3.2, bottom);
		ctx.closePath();
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
}

const PLANK_FILL = ['rgba(160,205,255,0.36)', 'rgba(190,235,255,0.55)', 'rgba(225,248,255,0.82)', 'rgba(255,255,255,0.96)'];
const PLANK_HALO = [null, 'rgba(70,208,251,0.07)', 'rgba(70,208,251,0.12)', 'rgba(70,208,251,0.17)'];

/* the specks, in four brightness buckets, each filled in one go (far ones before the jellyfish, near ones after) */
function drawPlankton(from, to) {
	ctx.globalCompositeOperation = 'lighter';
	for (let b = 0; b < 4; b++) {
		const lo = b === 0 ? -1 : b === 1 ? 0.08 : b === 2 ? 0.3 : 0.6;
		const hi = b === 0 ? 0.08 : b === 1 ? 0.3 : b === 2 ? 0.6 : 2;
		if (b > 0) {
			ctx.beginPath();
			for (let i = from; i < to; i++) {
				const p = plankton[i];
				if (p.b <= lo || p.b > hi) continue;
				const r = (0.6 + 0.9 * p.z) * (1 + 0.7 * p.b) * 4;
				ctx.moveTo(p.x + r, p.y);
				ctx.arc(p.x, p.y, r, 0, TAU);
			}
			ctx.fillStyle = PLANK_HALO[b];
			ctx.fill();
		}
		ctx.beginPath();
		for (let i = from; i < to; i++) {
			const p = plankton[i];
			if (p.b <= lo || p.b > hi) continue;
			const r = (0.6 + 0.9 * p.z) * (1 + 0.7 * p.b);
			ctx.moveTo(p.x + r, p.y);
			ctx.arc(p.x, p.y, r, 0, TAU);
		}
		ctx.fillStyle = PLANK_FILL[b];
		ctx.fill();
	}
	ctx.globalCompositeOperation = 'source-over';
}

/* a chain as one smooth curve through its first `end` points (add it to the open path) */
function curve(X, Y, o, end) {
	ctx.moveTo(X[o], Y[o]);
	for (let i = 1; i < end; i++) {
		const n = o + i;
		ctx.quadraticCurveTo(X[n], Y[n], (X[n] + X[n + 1]) * 0.5, (Y[n] + Y[n + 1]) * 0.5);
	}
	ctx.lineTo(X[o + end], Y[o + end]);
}

function chainsPath(X, Y, count, M, frac) {
	const end = Math.max(2, Math.round((M - 1) * frac));
	ctx.beginPath();
	for (let k = 0; k < count; k++) curve(X, Y, k * M, end);
}

function drawChains(j) {
	const s = 0.6 + 0.4 * j.z; // line weight with depth
	const { nT, M, nA, MA } = j;
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	// oral arms: frilly, pale, a little wider
	chainsPath(j.ax, j.ay, nA, MA, 1);
	ctx.strokeStyle = rgba(j.tint, 0.12);
	ctx.lineWidth = 6.5 * s;
	ctx.stroke();
	ctx.strokeStyle = rgba(j.core, 0.3);
	ctx.lineWidth = 2.2 * s;
	ctx.stroke();

	// tentacles: the whole length thin, then the part nearer the bell again, so they fade toward the tip
	chainsPath(j.tx, j.ty, nT, M, 1);
	ctx.strokeStyle = rgba(j.tint, 0.3);
	ctx.lineWidth = 1.1 * s;
	ctx.stroke();
	chainsPath(j.tx, j.ty, nT, M, 0.74);
	ctx.strokeStyle = rgba(j.tint, 0.07);
	ctx.lineWidth = 6 * s;
	ctx.stroke();
	ctx.strokeStyle = rgba(j.tint, 0.26);
	ctx.lineWidth = 1.4 * s;
	ctx.stroke();
	chainsPath(j.tx, j.ty, nT, M, 0.48);
	ctx.strokeStyle = rgba(j.core, 0.3);
	ctx.lineWidth = 1.5 * s;
	ctx.stroke();
	chainsPath(j.tx, j.ty, nT, M, 0.22);
	ctx.strokeStyle = rgba(j.core, 0.34);
	ctx.lineWidth = 1.8 * s;
	ctx.stroke();

	// a bead of light runs down each tentacle after every pulse (a soft halo, then a bright core); the tips glow
	const halo = new Path2D();
	const core = new Path2D();
	for (let k = 0; k < nT; k++) {
		const u = clamp((j.phase - 0.03 * (k % 5)) / 0.86, 0, 1);
		if (u <= 0 || u >= 1) continue;
		const fi = u * (M - 1);
		const i0 = Math.min(M - 2, Math.floor(fi));
		const f = fi - i0;
		const n = k * M + i0;
		const bx = mix(j.tx[n], j.tx[n + 1], f);
		const by = mix(j.ty[n], j.ty[n + 1], f);
		const r = 1.5 * s * Math.sin(u * Math.PI) + 0.3;
		halo.moveTo(bx + r * 3.4, by);
		halo.arc(bx, by, r * 3.4, 0, TAU);
		core.moveTo(bx + r, by);
		core.arc(bx, by, r, 0, TAU);
	}
	for (let k = 0; k < nT; k++) {
		const n = k * M + M - 1;
		core.moveTo(j.tx[n] + 1.7 * s, j.ty[n]);
		core.arc(j.tx[n], j.ty[n], 1.7 * s, 0, TAU);
	}
	ctx.fillStyle = rgba(j.tint, 0.16);
	ctx.fill(halo);
	ctx.fillStyle = rgba(j.core, 0.9);
	ctx.fill(core);
	ctx.globalCompositeOperation = 'source-over';
}

/* the bell's outline: a dome with a frilly lip (local coordinates, origin at the middle of the rim) */
function bellPath(w, h) {
	ctx.beginPath();
	ctx.moveTo(-w, lipY(-1, h));
	ctx.bezierCurveTo(-w, -h * 1.36, w, -h * 1.36, w, lipY(1, h));
	const N = 8;
	for (let i = 1; i <= N; i++) {
		const u1 = 1 - (2 * i) / N;
		const um = u1 + 1 / N;
		ctx.quadraticCurveTo(um * w, lipY(um, h) + 0.1 * h, u1 * w, lipY(u1, h));
	}
	ctx.closePath();
}

function drawBell(j) {
	const { w, h, c } = j;
	const tint = j.tint;
	// the soft light it gives off
	ctx.globalCompositeOperation = 'lighter';
	let g = ctx.createRadialGradient(0, -h * 0.4, 0, 0, -h * 0.4, w * 2.1);
	g.addColorStop(0, rgba(tint, 0.2));
	g.addColorStop(0.5, rgba(tint, 0.06));
	g.addColorStop(1, rgba(tint, 0));
	ctx.fillStyle = g;
	ctx.fillRect(-w * 2.2, -h * 2.2, w * 4.4, h * 4.4);
	ctx.globalCompositeOperation = 'source-over';

	// the glass body: pale blue, clearest in the middle, denser toward the rim
	bellPath(w, h);
	g = ctx.createRadialGradient(0, -h * 0.5, 0, 0, -h * 0.5, w * 1.2);
	g.addColorStop(0, 'rgba(205, 240, 255, 0.1)');
	g.addColorStop(0.55, 'rgba(120, 200, 255, 0.17)');
	g.addColorStop(0.88, 'rgba(150, 222, 255, 0.3)');
	g.addColorStop(1, 'rgba(205, 240, 255, 0.42)');
	ctx.fillStyle = g;
	ctx.fill();

	ctx.globalCompositeOperation = 'lighter';
	// the inner glow: a four-lobed ring and the light inside it
	g = ctx.createRadialGradient(0, -h * 0.44, 0, 0, -h * 0.44, w * 0.62);
	g.addColorStop(0, rgba(tint, 0.34 + 0.2 * c));
	g.addColorStop(1, rgba(tint, 0));
	ctx.fillStyle = g;
	ctx.fillRect(-w * 0.65, -h * 1.1, w * 1.3, h * 1.3);
	// the ring seen from the side: a soft wide stroke, then a thin brighter one
	ctx.beginPath();
	ctx.ellipse(0, -h * 0.4, w * 0.33, h * 0.21, 0, 0, TAU);
	ctx.strokeStyle = rgba(j.core, 0.1 + 0.06 * c);
	ctx.lineWidth = Math.max(3, w * 0.1);
	ctx.stroke();
	ctx.strokeStyle = rgba(j.core, 0.28 + 0.14 * c);
	ctx.lineWidth = 1.1;
	ctx.stroke();
	// faint canals from the middle to the lip
	ctx.beginPath();
	for (let i = 0; i < 7; i++) {
		const u = -0.88 + i * 0.2933;
		ctx.moveTo(0, -h * 0.5);
		ctx.quadraticCurveTo(u * w * 0.55, -h * 0.72, u * w * 0.96, lipY(u, h) - 0.02 * h);
	}
	ctx.strokeStyle = 'rgba(225, 246, 255, 0.12)';
	ctx.lineWidth = 0.9;
	ctx.stroke();

	// the lip lights up as the bell squeezes
	ctx.beginPath();
	const N = 8;
	for (let i = 0; i <= N; i++) {
		const u = 1 - (2 * i) / N;
		const x = u * w;
		const y = lipY(u, h) + (i > 0 && i < N ? 0.04 * h : 0);
		ctx.moveTo(x + 2.2, y);
		ctx.arc(x, y, 2.2, 0, TAU);
	}
	ctx.fillStyle = rgba(j.core, 0.55 + 0.4 * c);
	ctx.fill();
	ctx.globalCompositeOperation = 'source-over';

	// the rim light: a soft white edge, brightest at the upper left, and a small glint
	bellPath(w, h);
	ctx.strokeStyle = 'rgba(228, 247, 255, 0.5)';
	ctx.lineWidth = 1.3;
	ctx.lineJoin = 'round';
	ctx.stroke();
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(-w * 0.8, -h * 0.34);
	ctx.quadraticCurveTo(-w * 0.74, -h * 0.98, -w * 0.18, -h * 1.0);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
	ctx.lineWidth = 2.2;
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(w * 0.3, -h * 0.98);
	ctx.quadraticCurveTo(w * 0.52, -h * 0.9, w * 0.66, -h * 0.72);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
	ctx.lineWidth = 1.6;
	ctx.stroke();
}

function drawJelly(j) {
	ctx.save();
	ctx.globalAlpha = j.alpha;
	drawChains(j);
	ctx.translate(j.x, j.y);
	ctx.rotate(j.tilt);
	drawBell(j);
	ctx.restore();
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	drawRays();
	drawPlankton(0, plankSplit);
	for (const j of jellies) drawJelly(j);
	drawPlankton(plankSplit, plankton.length);
}

/* the reduced-motion still: one jellyfish, mid-relax, hanging in its drift, with a few specks lit */
function stillFrame() {
	build();
	jellies = [hero];
	wanderPos(hero, 3.2, tmp);
	hero.x = tmp.x;
	hero.y = tmp.y;
	hero.tilt = 0.1;
	hero.phase = 0.52;
	hang(hero);
	for (let i = 0; i < 200; i++) {
		clock += STEP;
		hero.phase = 0.52;
		hero.tilt = 0.1;
		shape(hero);
		stepChains(hero, STEP, clock);
	}
	hero.glow = 0.9;
	for (let i = 0; i < 40; i++) updatePlankton(STEP, 0.8);
	draw();
}

/* ---------- pointer ---------- */
function setPointer(ev) {
	if (ev.isPrimary === false) return;
	const r = canvas.getBoundingClientRect();
	pointer.x = ev.clientX - r.left;
	pointer.y = ev.clientY - r.top;
	pointer.t = clock; // on the simulation's own clock, so a pause or hidden tab doesn't count as idle time
	pointer.seen = true;
}

/* ---------- start ---------- */
function start() {
	phone = canvas.clientWidth < 560;
	layout();
	if (REDUCED) {
		stillFrame();
		pauseBtn.disabled = true;
		pulseBtn.disabled = true;
		let timer = 0;
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => { phone = canvas.clientWidth < 560; layout(); stillFrame(); }, 150);
		});
		return;
	}
	build();

	const ctl = loop(canvas, (dt) => {
		update(dt);
		draw();
	}, { name: 'glass-jellyfish' });

	canvas.addEventListener('pointermove', setPointer);
	canvas.addEventListener('pointerdown', (ev) => {
		setPointer(ev);
		if (!paused) burst(hero, 0.8);
	});

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			phone = canvas.clientWidth < 560;
			layout();
			build();
		}, 150);
	});
	// the info panel can fold away: the paths that keep clear of it follow
	panel.addEventListener('click', (ev) => {
		if (!ev.target.closest('.info-toggle')) return;
		setTimeout(() => { measurePanel(); setBoxes(); }, 60);
	});

	pulseBtn.addEventListener('click', () => {
		burst(hero, 1);
	});
	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		pulseBtn.disabled = paused;
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
