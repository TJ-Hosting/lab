/*
 * Sample 11 — "Streamline Ink Poster": the composer.
 * Pure maths, no page code. It makes the poster's drawing in four steps:
 *   1. a seed becomes a small random generator and a 2D simplex noise (the simplex lattice is the published idea,
 *      from Stefan Gustavson's public-domain write-up; this code is written fresh);
 *   2. the noise (plus, for some seeds, a swirl or a fan around a centre) gives a direction at every point of the
 *      poster: a flow field;
 *   3. a streamline tracer follows that field from random starting points, forwards and backwards, in short steps.
 *      A spatial grid holds every point already placed; a trace stops when it would come closer than the two
 *      ribbons' half-widths plus a small gap to a point in the grid (the even-spacing idea behind Jobard and
 *      Lefer's streamlines and the collision-packed flow fields of generative-art posters);
 *   4. ribbons are placed widest first, so the broad ones claim the page and ever thinner ones fill the gaps.
 * The work is cut into slices (step(ms)), so a page can spend a few milliseconds a frame and stay smooth.
 *
 * Written from the idea only; no source code was read or copied.
 * (The CodePen this idea comes from, "Perlin Noise Flow" by Jeff Robbins, refuses scripted downloads from this
 * machine, so nothing of it was read; the noise, the tracer and the packing are new code.)
 */

export const POSTER_W = 800;
export const POSTER_H = 1000; // the usual height; a phone's square poster passes 800

const TAU = Math.PI * 2;
const STEP = 2; // distance between traced points, in poster units
const MARGIN = 40; // ribbons may run this far past the edge (the canvas clips them: the art bleeds)
const CELL = 8; // spatial grid cell size
const MAX_STEPS = 420; // per direction
const MAX_TURN = 4.4; // radians a ribbon may turn in all before it stops (so none curls onto itself)
const MAX_LINES = 4600;

/* a small deterministic generator (xorshift32, seed scrambled first), so a seed always draws the same poster */
function makeRand(seed) {
	let s = (Math.imul((seed >>> 0) + 1, 2654435761) ^ 0x9e3779b9) >>> 0 || 1;
	const next = () => {
		s ^= s << 13; s >>>= 0;
		s ^= s >>> 17;
		s ^= s << 5; s >>>= 0;
		return s / 4294967296;
	};
	for (let i = 0; i < 8; i++) next();
	return next;
}

/* 2D simplex noise: a permutation of 0..255 and 16 gradient directions, both shuffled from the seed.
   Returns noise(x, y) in about -1..1. */
function makeNoise(rand) {
	const perm = new Uint8Array(512);
	const p = new Uint8Array(256);
	for (let i = 0; i < 256; i++) p[i] = i;
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		const t = p[i]; p[i] = p[j]; p[j] = t;
	}
	for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
	const gx = new Float32Array(16);
	const gy = new Float32Array(16);
	const turn = rand() * TAU;
	for (let k = 0; k < 16; k++) {
		gx[k] = Math.cos(turn + (k * TAU) / 16);
		gy[k] = Math.sin(turn + (k * TAU) / 16);
	}
	const F = 0.5 * (Math.sqrt(3) - 1); // skew the square grid into triangles
	const G = (3 - Math.sqrt(3)) / 6; // and unskew
	const SCALE = 98; // makes the sum of the three corners reach about ±1 with unit gradients
	return (x, y) => {
		const s = (x + y) * F;
		const i = Math.floor(x + s);
		const j = Math.floor(y + s);
		const t = (i + j) * G;
		const x0 = x - (i - t);
		const y0 = y - (j - t);
		const i1 = x0 > y0 ? 1 : 0; // which of the two triangles in the cell
		const j1 = 1 - i1;
		const x1 = x0 - i1 + G;
		const y1 = y0 - j1 + G;
		const x2 = x0 - 1 + 2 * G;
		const y2 = y0 - 1 + 2 * G;
		const ii = i & 255;
		const jj = j & 255;
		let n = 0;
		let a = 0.5 - x0 * x0 - y0 * y0;
		if (a > 0) {
			const g = perm[ii + perm[jj]] & 15;
			a *= a;
			n += a * a * (gx[g] * x0 + gy[g] * y0);
		}
		a = 0.5 - x1 * x1 - y1 * y1;
		if (a > 0) {
			const g = perm[ii + i1 + perm[jj + j1]] & 15;
			a *= a;
			n += a * a * (gx[g] * x1 + gy[g] * y1);
		}
		a = 0.5 - x2 * x2 - y2 * y2;
		if (a > 0) {
			const g = perm[ii + 1 + perm[jj + 1]] & 15;
			a *= a;
			n += a * a * (gx[g] * x2 + gy[g] * y2);
		}
		return SCALE * n;
	};
}

/* the flow field: a function from a point to a direction (an angle). Three kinds, chosen by the seed:
   a sweep (noise bends one general direction), a swirl (round a centre) and a fan (out from a point off the page) */
function makeField(rand, noiseA, noiseB, PH) {
	const f1 = 0.0013 + rand() * 0.0015; // noise cycles per poster unit: broad bends
	const f2 = f1 * 2.4;
	const ox = rand() * 200;
	const oy = rand() * 200;
	const mode = rand();
	const bend = 0.7 + rand() * 0.6;
	if (mode < 0.4) {
		const base = rand() * TAU;
		const spread = (0.8 + rand() * 0.9) * Math.PI;
		return { kind: 'sweep', at: (x, y) => base + (noiseA(x * f1 + ox, y * f1 + oy) + 0.35 * noiseB(x * f2 + oy, y * f2 + ox)) * spread };
	}
	if (mode < 0.75) {
		const cx = POSTER_W * (0.1 + rand() * 0.8);
		const cy = PH * (0.1 + rand() * 0.8);
		const dir = rand() < 0.5 ? 1 : -1;
		const inward = (rand() - 0.5) * 0.5;
		return { kind: 'swirl', at: (x, y) => Math.atan2(y - cy, x - cx) + dir * (Math.PI / 2) + inward + noiseA(x * f1 + ox, y * f1 + oy) * bend + 0.25 * noiseB(x * f2 + oy, y * f2 + ox) };
	}
	const side = rand();
	const cx = side < 0.5 ? POSTER_W * (0.2 + rand() * 0.6) : (rand() < 0.5 ? -0.35 : 1.35) * POSTER_W;
	const cy = side < 0.5 ? (rand() < 0.5 ? -0.4 : 1.4) * PH : PH * (0.2 + rand() * 0.6);
	return { kind: 'fan', at: (x, y) => Math.atan2(y - cy, x - cx) + noiseA(x * f1 + ox, y * f1 + oy) * bend * 0.75 + 0.2 * noiseB(x * f2 + oy, y * f2 + ox) };
}

/** the width profile of a ribbon along its length, 0..1: pointed at both ends, widest at `peak` (0..1) */
export function taper(s, k) {
	return Math.pow(Math.sin(Math.PI * Math.pow(s, k)), 0.75);
}

/**
 * createComposer(seed, unit) → { lines, done, step(ms), seed, kind }
 * `unit` is poster units per screen pixel, so the thinnest ribbons and the gaps stay about the same size on screen
 * on a phone as on a desktop. Each line is { pts (x, y pairs), w, k (taper shape), tone (0..1 along the palette),
 * pick (0..1, chooses an accent) }.
 */
export function createComposer(seed, unit = 1.25, PH = POSTER_H) {
	const rand = makeRand(seed);
	const noiseA = makeNoise(rand);
	const noiseB = makeNoise(rand);
	const noiseC = makeNoise(rand); // colour regions
	const field = makeField(rand, noiseA, noiseB, PH);
	const angle = field.at;
	const fc = 0.0011 + rand() * 0.0012;
	const cox = rand() * 300;
	const coy = rand() * 300;

	const wmax = 11 + rand() * 15; // the widest ribbon this poster allows
	const pxu = Math.max(unit, 0.8); // one screen pixel, in poster units
		const phases = [
		{ tries: 40, lo: 0.55 * wmax, hi: wmax, minLen: 150, len: [320, 900], skew: 1.2, gap: 1.7 * pxu },
		{ tries: 240, lo: 0.26 * wmax, hi: 0.5 * wmax, minLen: 90, len: [170, 520], skew: 1.3, gap: 1.7 * pxu },
		{ tries: 2400, lo: 3 * pxu, hi: Math.max(5.5 * pxu, 0.24 * wmax), minLen: 50, len: [80, 300], skew: 1.3, gap: 1.6 * pxu },
		{ tries: 14000, lo: 1.3 * pxu, hi: 3 * pxu, minLen: 26, len: [40, 170], skew: 1.5, gap: 1.4 * pxu },
		{ tries: 16000, lo: 0.8 * pxu, hi: 1.4 * pxu, minLen: 18, len: [24, 100], skew: 1, gap: 1 * pxu },
	];

	/* the spatial grid of everything placed so far: a linked list of points per cell */
	const gw = Math.ceil((POSTER_W + 2 * MARGIN) / CELL) + 1;
	const gh = Math.ceil((PH + 2 * MARGIN) / CELL) + 1;
	const head = new Int32Array(gw * gh).fill(-1);
	let cap = 1 << 17;
	let px = new Float32Array(cap);
	let py = new Float32Array(cap);
	let pr = new Float32Array(cap);
	let nxt = new Int32Array(cap);
	let count = 0;
	let rmax = 0;

	function insert(x, y, r) {
		if (count >= cap) {
			cap *= 2;
			const grow = (a, T) => { const b = new T(cap); b.set(a); return b; };
			px = grow(px, Float32Array); py = grow(py, Float32Array); pr = grow(pr, Float32Array); nxt = grow(nxt, Int32Array);
		}
		const c = Math.floor((x + MARGIN) / CELL) + gw * Math.floor((y + MARGIN) / CELL);
		px[count] = x; py[count] = y; pr[count] = r; nxt[count] = head[c]; head[c] = count++;
		if (r > rmax) rmax = r;
	}

	/* true if a ribbon of half-width r centred here would sit too close to one already placed */
	function blocked(x, y, r, gap) {
		const reach = r + gap + rmax;
		const x0 = Math.max(0, Math.floor((x - reach + MARGIN) / CELL));
		const x1 = Math.min(gw - 1, Math.floor((x + reach + MARGIN) / CELL));
		const y0 = Math.max(0, Math.floor((y - reach + MARGIN) / CELL));
		const y1 = Math.min(gh - 1, Math.floor((y + reach + MARGIN) / CELL));
		for (let cy = y0; cy <= y1; cy++) {
			for (let cx = x0; cx <= x1; cx++) {
				for (let k = head[cx + gw * cy]; k >= 0; k = nxt[k]) {
					const lim = r + gap + pr[k];
					const dx = px[k] - x;
					const dy = py[k] - y;
					if (dx * dx + dy * dy < lim * lim) return true;
				}
			}
		}
		return false;
	}

	const bufF = new Float32Array(2 * MAX_STEPS);
	const bufB = new Float32Array(2 * MAX_STEPS);

	/* follow the field from (x, y) in one direction (dir = 1 or -1); returns the points written to buf.
	   A generator: it hands control back every 24 steps, so a slice of work can end on time mid-ribbon. */
	function* trace(x, y, dir, r, buf, limit, gap) {
		let n = 0;
		let turn = 0;
		let prev = angle(x, y);
		for (let i = 0; i < limit; i++) {
			const a = angle(x, y);
			let d = a - prev;
			d -= TAU * Math.round(d / TAU);
			prev = a;
			turn += Math.abs(d);
			if (turn > MAX_TURN) break;
			if ((Math.abs(d) / STEP) * r > 0.8) break; // bending too tightly for this width
			x += Math.cos(a) * dir * STEP;
			y += Math.sin(a) * dir * STEP;
			if (x < -MARGIN || x > POSTER_W + MARGIN || y < -MARGIN || y > PH + MARGIN) break;
			if (blocked(x, y, r, gap)) break;
			buf[2 * n] = x;
			buf[2 * n + 1] = y;
			n++;
			if (n % 24 === 0) yield;
		}
		return n;
	}

	const lines = [];
	const out = { lines, done: false, seed, kind: field.kind, step: null };
	let phase = 0;
	let tries = 0;
	let misses = 0;

	function* attempt(ph) {
		const w = ph.lo + (ph.hi - ph.lo) * Math.pow(rand(), ph.skew);
		const r = w / 2;
		const sx = rand() * POSTER_W;
		const sy = rand() * PH;
		const tone = 0.5 + 0.5 * noiseC(sx * fc + cox, sy * fc + coy) * 1.35 + (rand() - 0.5) * 0.2;
		const pick = rand();
		const peak = 0.3 + rand() * 0.4;
		if (blocked(sx, sy, r, ph.gap)) return false;
		// how long this ribbon may grow, shared at random between its two ends
		const total = Math.min(2 * MAX_STEPS, Math.ceil((ph.len[0] + (ph.len[1] - ph.len[0]) * rand()) / STEP));
		const fSteps = Math.min(MAX_STEPS, Math.round(total * (0.25 + 0.5 * rand())));
		const nf = yield* trace(sx, sy, 1, r, bufF, fSteps, ph.gap);
		const nb = yield* trace(sx, sy, -1, r, bufB, Math.min(MAX_STEPS, total - fSteps), ph.gap);
		const n = nb + 1 + nf;
		if ((n - 1) * STEP < ph.minLen) return false;
		const pts = new Float32Array(2 * n);
		for (let i = 0; i < nb; i++) {
			pts[2 * i] = bufB[2 * (nb - 1 - i)];
			pts[2 * i + 1] = bufB[2 * (nb - 1 - i) + 1];
		}
		pts[2 * nb] = sx;
		pts[2 * nb + 1] = sy;
		for (let i = 0; i < nf; i++) {
			pts[2 * (nb + 1 + i)] = bufF[2 * i];
			pts[2 * (nb + 1 + i) + 1] = bufF[2 * i + 1];
		}
		const k = Math.log(0.5) / Math.log(peak);
		const line = { pts, w, k, tone: Math.min(1, Math.max(0, tone)), pick };
		// the ribbon's own taper is what the next ribbons must keep clear of
		for (let i = 0; i < n; i++) insert(pts[2 * i], pts[2 * i + 1], 0.5 * w * taper(i / (n - 1), k));
		lines.push(line);
		return true;
	}

	/** work for up to `ms` milliseconds; sets .done when the last slice of the last phase is finished */
	let job = null;
	out.step = (ms) => {
		const t0 = performance.now();
		while (!out.done) {
			const ph = phases[phase];
			if (!job) job = attempt(ph);
			const r = job.next();
			if (r.done) {
				job = null;
				if (r.value) misses = 0; else misses++;
				tries++;
				if (tries >= ph.tries || misses > 1200 || lines.length >= MAX_LINES) {
					phase++;
					tries = 0;
					misses = 0;
					if (phase >= phases.length || lines.length >= MAX_LINES) out.done = true;
				}
			}
			if (performance.now() - t0 >= ms) break;
		}
		return out.done;
	};
	return out;
}
