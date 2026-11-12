/*
 * Sample 54 — "Pixel planet maker": the world generator and the pixel renderer.
 * makeWorld(seed) turns one 32-bit seed into a whole little world: a two-word name from this page's own word lists,
 * a kind (ocean, ice, gas giant, lava, dune or crater world), its palette, noise offsets, an optional ring and up to
 * two moons, and a starfield. paintWorld() draws that world into a small pixel buffer: every pixel of a sphere is
 * lit by one light direction, shaded from 3D value noise, then snapped to a short colour ramp through a 4 x 4 Bayer
 * matrix, so the light edge shows as a screen of dots. The atmosphere, ring, moons and stars are drawn the same way
 * and sorted with a depth buffer. All colours are blues, with a warm accent only on lava and dune worlds.
 * piece.js scales the buffer up with image-rendering: pixelated.
 *
 * Written from the idea only; no source code was read or copied.
 */

const { sin, cos, sqrt, floor, ceil, abs, min, max, PI, exp, hypot, atan2 } = Math;
export const TAU = PI * 2;

/* ---------- a small seeded random generator (mulberry32) ---------- */

export function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ---------- 3D value noise from a permutation table ---------- */

const PERM = new Uint8Array(512);
{
	const r = rng(0x9e3779b9);
	const p = Array.from({ length: 256 }, (_, i) => i);
	for (let i = 255; i > 0; i--) {
		const j = (r() * (i + 1)) | 0;
		const t = p[i];
		p[i] = p[j];
		p[j] = t;
	}
	for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

function noise3(x, y, z) {
	const xf = floor(x);
	const yf = floor(y);
	const zf = floor(z);
	const X = xf & 255;
	const Y = yf & 255;
	const Z = zf & 255;
	x -= xf;
	y -= yf;
	z -= zf;
	const u = x * x * (3 - 2 * x);
	const v = y * y * (3 - 2 * y);
	const w = z * z * (3 - 2 * z);
	const A = PERM[X] + Y;
	const B = PERM[X + 1] + Y;
	const AA = PERM[A] + Z;
	const AB = PERM[A + 1] + Z;
	const BA = PERM[B] + Z;
	const BB = PERM[B + 1] + Z;
	const c000 = PERM[AA];
	const c001 = PERM[AA + 1];
	const c010 = PERM[AB];
	const c011 = PERM[AB + 1];
	const c100 = PERM[BA];
	const c101 = PERM[BA + 1];
	const c110 = PERM[BB];
	const c111 = PERM[BB + 1];
	const x00 = c000 + (c100 - c000) * u;
	const x01 = c001 + (c101 - c001) * u;
	const x10 = c010 + (c110 - c010) * u;
	const x11 = c011 + (c111 - c011) * u;
	const y0 = x00 + (x10 - x00) * v;
	const y1 = x01 + (x11 - x01) * v;
	return (y0 + (y1 - y0) * w) / 255;
}

function fbm(x, y, z, octaves) {
	let s = 0;
	let a = 0.5;
	let n = 0;
	for (let i = 0; i < octaves; i++) {
		s += a * noise3(x, y, z);
		n += a;
		a *= 0.5;
		x *= 2.03;
		y *= 2.03;
		z *= 2.03;
	}
	return s / n;
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------- colour: packed little-endian pixels, ramps and the Bayer matrix ---------- */

const hex = (s) => {
	const n = parseInt(s.slice(1), 16);
	return (255 << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16);
};
const ramp = (...list) => Uint32Array.from(list.map(hex));
const pack = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (i, j) => (B4[((j & 3) << 2) | (i & 3)] + 0.5) / 16;
const B8Q = [0, 2, 3, 1];
export const bay8 = (i, j) => (4 * B4[((j & 3) << 2) | (i & 3)] + B8Q[(((j >> 2) & 1) << 1) | ((i >> 2) & 1)] + 0.5) / 64;

/* the colour a tone (0..1) picks from a ramp, dithered by the threshold b (0..1) */
function pick(r, t, b) {
	const n = r.length - 1;
	const k = (t < 0 ? 0 : t > 1 ? 1 : t) * n;
	let i = k | 0;
	if (k - i > b) i++;
	return r[i > n ? n : i];
}

/* the palettes: DS v9 blues (navy, royal, azure, sky, pale, cyan light). Warm only on lava and dune. */
const PAL = {
	ocean: [
		{
			sea: ramp('#081a4a', '#0b3a9c', '#0c6bed', '#4d9ff3', '#9fd3fb'),
			land: ramp('#14264f', '#2c4c86', '#5a84bd', '#9bbbe2', '#d4e4f6'),
		},
		{
			sea: ramp('#050f30', '#0a2a78', '#0558dc', '#3f8ff0', '#8cc6fb'),
			land: ramp('#1a2644', '#38507f', '#6882b0', '#a4b9d8', '#d9e3f2'),
		},
		{
			sea: ramp('#06203f', '#0a4f8c', '#0f86c9', '#46d0fb', '#a6ecff'),
			land: ramp('#102a52', '#2b5a94', '#5a8fc4', '#9fc6e6', '#d8ecf8'),
		},
	],
	cap: ramp('#6f90c4', '#b5cdee', '#e6f1fc', '#ffffff'),
	cloud: ramp('#27407f', '#5f7fc0', '#b9cdee', '#f4f8ff'),
	ice: [
		{ body: ramp('#16295a', '#3560b0', '#7fa8e6', '#c7defa', '#f7fbff'), crack: ramp('#0a2a78', '#0c4fc4', '#1578f1') },
		{ body: ramp('#0a2a55', '#1c6fb5', '#5cb6ee', '#bfe8fb', '#f4fdff'), crack: ramp('#07306a', '#0b5fc0', '#2f93f0') },
	],
	gas: [
		{ band: ramp('#071533', '#0a2a78', '#0558dc', '#3f8ff0', '#8cc6fb', '#d5ecfd', '#ffffff'), storm: ramp('#0a3a8a', '#2f86e6', '#9fd3fb', '#ffffff') },
		{ band: ramp('#08143a', '#13307a', '#2a5cc4', '#5f9ae8', '#a9cdf5', '#e4f1fd', '#ffffff'), storm: ramp('#0b4a9a', '#46d0fb', '#bdeaff', '#ffffff') },
		{ band: ramp('#061a38', '#0a3d78', '#0f6fc0', '#46a8ee', '#9ad8fb', '#d8f2fd', '#ffffff'), storm: ramp('#0a2a78', '#3f8ff0', '#a9e2ff', '#ffffff') },
	],
	warmBand: ramp('#7a3a1a', '#ff8a3d', '#ffb547', '#ffe2a6'),
	lava: {
		crust: ramp('#070c1e', '#101c3e', '#1d3166', '#34528f', '#5f82c0'),
		glow: ramp('#d4561a', '#ff8a3d', '#ffb547', '#ffe6a8'),
	},
	dune: ramp('#0a1838', '#1b3570', '#3d62a8', '#86a6d6', '#d5def0', '#ffe0a0'),
	rock: ramp('#0a1330', '#1b2c58', '#3a5690', '#7a9bd0', '#c6d8f0'),
	moon: ramp('#0b1738', '#26427a', '#5f84bf', '#a9c4e8', '#e8f1fb'),
	rings: [ramp('#2f4f8c', '#5f86c4', '#9bbbe6', '#cfe0f6'), ramp('#1f4aa8', '#4d87e0', '#8fbcf0', '#d4e9fc')],
	/* the atmosphere: bright inner edge, cyan outer edge, two dim glows */
	atm: { inner: hex('#bfeaff'), outer: hex('#46d0fb'), glow1: hex('#0c2a6e'), glow2: hex('#12409a') },
	atmDune: { inner: hex('#cfe3f6'), outer: hex('#7fb4ee'), glow1: hex('#0c2a6e'), glow2: hex('#12409a') },
	atmLava: { inner: hex('#8cc6fb'), outer: hex('#2f86e6'), glow1: hex('#0a1f58'), glow2: hex('#0f3585') },
	bg: ramp('#040919', '#060d24', '#08133a', '#0a1a4a'),
};

const STAR_TINT = [[236, 244, 255], [170, 208, 255], [110, 214, 252], [140, 175, 235]];

/* ---------- the word lists: this page's own, plain and generic ---------- */

const WORDS_A = ['Amber', 'Ashen', 'Bright', 'Calm', 'Cinder', 'Clear', 'Cobalt', 'Copper', 'Crisp', 'Dawn', 'Distant', 'Drifting', 'Dusky', 'Early', 'Faint', 'Frosted', 'Gentle', 'Gilded', 'Glacial', 'Golden', 'Hollow', 'Hushed', 'Indigo', 'Ivory', 'Kind', 'Late', 'Lone', 'Lucky', 'Marble', 'Mellow', 'Midnight', 'Misty', 'Modest', 'Narrow', 'Nimble', 'Northern', 'Opal', 'Pale', 'Patient', 'Quiet', 'Restless', 'Rolling', 'Rustic', 'Sable', 'Silent', 'Silver', 'Slow', 'Soft', 'Southern', 'Steady', 'Still', 'Stormy', 'Swift', 'Tawny', 'Tidy', 'Velvet', 'Wandering', 'Warm', 'Wide', 'Wintry'];
const WORDS_B = ['Anchor', 'Arbour', 'Beacon', 'Bell', 'Bridge', 'Brook', 'Cairn', 'Canyon', 'Cove', 'Crown', 'Dune', 'Ember', 'Fable', 'Ferry', 'Field', 'Fjord', 'Garden', 'Gate', 'Glade', 'Harbour', 'Haven', 'Hearth', 'Hill', 'Island', 'Journey', 'Keep', 'Lagoon', 'Lantern', 'Ledge', 'Lookout', 'Maple', 'Meadow', 'Mill', 'Orchard', 'Outpost', 'Pasture', 'Pier', 'Pine', 'Pond', 'Quay', 'Reach', 'Ridge', 'River', 'Sail', 'Shore', 'Spire', 'Spring', 'Stair', 'Summit', 'Tide', 'Trail', 'Valley', 'Vale', 'Watch', 'Wharf', 'Willow', 'Wind'];

const KINDS = [
	{ id: 'ocean', label: 'Ocean world', w: 26 },
	{ id: 'ice', label: 'Ice world', w: 14 },
	{ id: 'gas', label: 'Gas giant', w: 20 },
	{ id: 'lava', label: 'Lava world', w: 12 },
	{ id: 'dune', label: 'Dune world', w: 14 },
	{ id: 'rock', label: 'Crater world', w: 14 },
];
const KIND_TOTAL = KINDS.reduce((s, k) => s + k.w, 0);

/* ---------- one world from one seed ---------- */

export function makeWorld(seed) {
	seed >>>= 0;
	const r = rng(seed);
	const rr = (a, b) => a + (b - a) * r();
	const of = (list) => list[(r() * list.length) | 0];
	const name = `${of(WORDS_A)} ${of(WORDS_B)}`;
	let pickKind = r() * KIND_TOTAL;
	let kindIndex = 0;
	for (let i = 0; i < KINDS.length; i++) {
		pickKind -= KINDS[i].w;
		if (pickKind < 0) { kindIndex = i; break; }
	}
	const kind = KINDS[kindIndex];
	const o = Array.from({ length: 9 }, () => r() * 180);

	const w = { seed, name, kind: kindIndex, id: kind.id, label: kind.label, o };
	w.ang = r() * TAU;
	w.cang = r() * TAU;
	w.spin = rr(0.07, 0.12) * (r() < 0.15 ? -1 : 1);
	w.cspin = w.spin * 1.3 + 0.02;

	/* the spin axis: pitched toward the viewer, rolled a little; U and V span the equator */
	const pitch = rr(0.2, 0.52);
	const roll = rr(-0.45, 0.45);
	const ax = sin(roll) * cos(pitch);
	const ay = -cos(roll) * cos(pitch);
	const az = sin(pitch);
	const ul = hypot(ay, ax);
	const ux = ay / ul;
	const uy = -ax / ul;
	w.axis = [ax, ay, az];
	w.U = [ux, uy, 0];
	w.V = [-az * uy, az * ux, ax * uy - ay * ux];

	w.atmo = [1, 0.85, 0.9, 0.45, 0.55, 0][kindIndex];
	w.atm = kind.id === 'dune' ? PAL.atmDune : kind.id === 'lava' ? PAL.atmLava : PAL.atm;
	w.cloud = false;

	switch (kind.id) {
		case 'ocean':
			w.pal = of(PAL.ocean);
			w.sea = rr(0.5, 0.6);
			w.cap = rr(0.8, 0.9);
			w.cloud = r() < 0.85;
			w.cthr = rr(0.6, 0.68);
			break;
		case 'ice':
			w.pal = of(PAL.ice);
			w.cloud = r() < 0.4;
			w.cthr = rr(0.6, 0.66);
			break;
		case 'gas':
			w.pal = of(PAL.gas);
			w.bands = rr(9, 17);
			w.warp = rr(2, 5);
			w.storm = r() < 0.6 ? { lon: rr(0, TAU), lat: rr(-0.55, 0.35), sz: rr(0.8, 1.2) } : null;
			w.warm = r() < 0.3 ? { lat: rr(-0.5, 0.5), wd: rr(0.03, 0.05) } : null;
			break;
		case 'rock': {
			w.craters = [];
			for (let i = 0; i < 18; i++) {
				const z = rr(-1, 1);
				const t = rr(0, TAU);
				const s = sqrt(1 - z * z);
				const big = r() < 0.25;
				w.craters.push({ x: s * cos(t), y: z, z: s * sin(t), r: big ? rr(0.2, 0.34) : rr(0.07, 0.17) });
			}
			break;
		}
		default:
	}

	/* a ring, sometimes (gas giants most often) */
	const ringChance = [0.3, 0.25, 0.55, 0.1, 0.2, 0.08][kindIndex];
	if (r() < ringChance) {
		const rin = rr(1.22, 1.38);
		w.ring = { in: rin, out: min(1.9, rin + rr(0.38, 0.58)), pal: of(PAL.rings), gap: rr(0.35, 0.7), gapW: rr(0.025, 0.05), freq: rr(8, 14), o: rr(0, 100) };
	} else {
		w.ring = null;
	}

	/* up to two moons: orbit radius in planet radii, size in pixels at a 128 px planet */
	const pm = r();
	const moonCount = pm < 0.25 ? 0 : pm < 0.7 ? 1 : 2;
	w.moons = [];
	for (let i = 0; i < moonCount; i++) {
		w.moons.push({
			orbit: w.ring ? 1.98 + i * 0.09 : 1.3 + i * 0.18 + rr(0, 0.04),
			size: rr(3.4, 6),
			phase: rr(0, TAU),
			speed: rr(0.12, 0.22) * (i ? 0.7 : 1) * (r() < 0.2 ? -1 : 1),
			incl: rr(-0.35, 0.35),
			o: rr(0, 120),
		});
	}

	/* the starfield: positions as fractions of the picture, so a poster can reuse it */
	const sr = rng(seed ^ 0x5bd1e995);
	w.stars = [];
	for (let i = 0; i < 360; i++) {
		const q = sr();
		w.stars.push({ x: sr(), y: sr(), tint: (sr() * 4) | 0, size: q < 0.07 ? 2 : q < 0.3 ? 1 : 0, ph: sr() * TAU, sp: 0.5 + sr() * 1.1 });
	}
	return w;
}

export function seedText(seed) {
	const s = (seed >>> 0).toString(16).toUpperCase().padStart(8, '0');
	return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export function describeWorld(w) {
	const parts = [w.label];
	parts.push(w.moons.length === 0 ? 'no moons' : w.moons.length === 1 ? '1 moon' : '2 moons');
	if (w.ring) parts.push('rings');
	return parts.join(' · ');
}

/* the light: the pointer's distance from the planet (in planet radii) becomes an angle from straight on */
export function lightFrom(u, v) {
	const r = hypot(u, v);
	if (r < 1e-4) return [0, 0, 1];
	const phi = min(r * 0.62, 1.4);
	const s = sin(phi);
	return [(s * u) / r, (s * v) / r, cos(phi)];
}

/* the idle light: a slow wander that starts from the upper left */
export function ghostLight(t) {
	return [1.35 * sin(0.21 * t - 0.9), 0.95 * sin(0.17 * t - 0.6)];
}

/* the largest radius, in pixels, at which the planet with its ring and moons fits a box of boxW x boxH pixels (at most 62: a disc of about 128 px) */
export function fitRadius(w, boxW, boxH) {
	let ex = w.ring ? w.ring.out + 0.05 : 1.25;
	for (const m of w.moons) ex = max(ex, m.orbit + 0.14);
	return max(12, min(62, boxW / 2 / ex, boxH / 2 / 1.3));
}


/* ---------- the surfaces ---------- */

/* the frame being painted: the spin axis, and the cloud layer's own turn */
let Ax = 0;
let Ay = 0;
let Az = 1;
let c1x = 0;
let c1y = 0;
let c1z = 0;
let c2x = 0;
let c2y = 0;
let c2z = 0;

/* clouds: a stretched noise layer that turns a little faster than the ground; its edge is a screen of dots */
function clouds(w, col, tone, b, nx, ny, nz) {
	const o = w.o;
	const kx = nx * c1x + ny * c1y + nz * c1z;
	const ky = nx * Ax + ny * Ay + nz * Az;
	const kz = nx * c2x + ny * c2y + nz * c2z;
	const cv = fbm(kx * 2.4 + o[6], ky * 3.6 + o[7], kz * 2.4 + o[8], 3);
	return (cv - w.cthr) * 7 > b ? pick(PAL.cloud, tone * 0.95 + 0.05, b) : col;
}

/* qx, qy, qz: the point on the ground (the planet's own frame); tone: the light, 0..1; b: this pixel's dither threshold;
   nx, ny, nz: the normal as seen from the viewer (for the cloud layer) */
function shade(w, qx, qy, qz, tone, b, nx, ny, nz) {
	const o = w.o;
	switch (w.kind) {
		case 0: { // ocean: seas, pale land, polar caps, clouds
			let h = fbm(qx * 2.1 + o[0], qy * 2.1 + o[1], qz * 2.1 + o[2], 4);
			h = (h - 0.5) * 1.5 + 0.5;
			let col;
			if (abs(qy) > w.cap + (noise3(qx * 5 + o[3], qy * 5 + o[4], qz * 5 + o[5]) - 0.5) * 0.22) {
				col = pick(PAL.cap, tone * 0.9 + 0.08, b);
			} else if (h > w.sea) {
				col = pick(w.pal.land, tone * (0.72 + (h - w.sea) * 1.7), b);
			} else {
				col = pick(w.pal.sea, tone * (0.8 + (h - 0.25) * 0.4), b);
			}
			return w.cloud ? clouds(w, col, tone, b, nx, ny, nz) : col;
		}
		case 1: { // ice: pale plains, blue cracks, thin cloud
			const h = fbm(qx * 2.7 + o[0], qy * 2.7 + o[1], qz * 2.7 + o[2], 4);
			const crack = abs(fbm(qx * 3.1 + o[3], qy * 3.1 + o[4], qz * 3.1 + o[5], 3) - 0.5);
			let col = crack < 0.017 ? pick(w.pal.crack, tone * 1.05, b) : pick(w.pal.body, tone * (0.78 + (h - 0.5) * 0.9), b);
			if (w.cloud) col = clouds(w, col, tone, b, nx, ny, nz);
			return col;
		}
		case 2: { // gas giant: bands bent by noise, a storm, sometimes one warm stripe
			const warp = fbm(qx * 1.4 + o[0], qy * 0.7 + o[1], qz * 1.4 + o[2], 3);
			const streak = noise3(qx * 2.6 + o[3], qy * 16 + o[4], qz * 2.6 + o[5]);
			const bnd = (0.5 + 0.5 * sin(qy * w.bands + (warp - 0.5) * w.warp * 3)) * 0.72 + streak * 0.28;
			let col = pick(w.pal.band, tone * (0.45 + 0.75 * bnd), b);
			if (w.warm && abs(qy - w.warm.lat + (warp - 0.5) * 0.12) < w.warm.wd) col = pick(PAL.warmBand, tone * (0.55 + 0.45 * bnd), b);
			if (w.storm) {
				let dl = atan2(qz, qx) - w.storm.lon;
				if (dl > PI) dl -= TAU; else if (dl < -PI) dl += TAU;
				const cl = sqrt(max(0, 1 - qy * qy));
				const dla = qy - w.storm.lat;
				const dlo = dl * cl;
				const ds = (dlo * dlo) / (0.2 * w.storm.sz) + (dla * dla) / (0.026 * w.storm.sz);
				if (ds < 1) {
					const swirl = 0.5 + 0.5 * sin(atan2(dla, dlo) * 2 + ds * 6);
					col = pick(w.pal.storm, tone * (0.5 + 0.5 * swirl) * (0.7 + 0.3 * (1 - ds)), b);
				}
			}
			return col;
		}
		case 3: { // lava: a dark blue crust cut by glowing cracks
			const h = fbm(qx * 3 + o[0], qy * 3 + o[1], qz * 3 + o[2], 4);
			const v = abs(fbm(qx * 2.2 + o[3], qy * 2.2 + o[4], qz * 2.2 + o[5], 4) - 0.5);
			const thick = 0.016 + 0.03 * (1 - h);
			if (v < thick) return pick(PAL.lava.glow, 0.3 + 0.7 * (1 - v / thick), b);
			return pick(PAL.lava.crust, tone * (0.85 + (h - 0.5) * 0.9), b);
		}
		case 4: { // dunes: ripples and basins; only the brightest lit tones turn warm
			const u = fbm(qx * 1.5 + o[0], qy * 2.2 + o[1], qz * 1.5 + o[2], 3);
			const rip = 0.5 + 0.5 * sin(u * 20 + qy * 4 + o[3]);
			const basin = fbm(qx * 2.4 + o[4], qy * 2.4 + o[5], qz * 2.4 + o[6], 3);
			return pick(PAL.dune, tone * (0.72 + 0.28 * rip) + (basin - 0.5) * 0.35 * (0.3 + tone), b);
		}
		default: { // a crater world: bowls with bright rims
			let h = fbm(qx * 2.3 + o[0], qy * 2.3 + o[1], qz * 2.3 + o[2], 4);
			const cr = w.craters;
			for (let i = 0; i < cr.length; i++) {
				const c = cr[i];
				const dx = qx - c.x;
				const dy = qy - c.y;
				const dz = qz - c.z;
				const d2 = dx * dx + dy * dy + dz * dz;
				const lim = c.r * 1.35;
				if (d2 > lim * lim) continue;
				const f = sqrt(d2) / c.r;
				if (f < 1) h -= 0.3 * (1 - f * f);
				const e = (f - 1) / 0.16;
				h += 0.24 * exp(-e * e);
			}
			return pick(PAL.rock, tone + (h - 0.5) * 0.95 * (0.25 + tone), b);
		}
	}
}

/* ---------- painting ---------- */

function paintStars(out, bw, bh, w, time) {
	const n = min(360, max(60, Math.round((bw * bh) / 210)));
	const st = w.stars;
	for (let k = 0; k < n; k++) {
		const s = st[k];
		const x = floor(s.x * bw);
		const y = floor(s.y * bh);
		const tw = 0.55 + 0.45 * sin(time * s.sp + s.ph);
		const lv = tw > 0.86 ? 1 : tw > 0.62 ? 0.72 : 0.48;
		const t = STAR_TINT[s.tint];
		out[y * bw + x] = pack((t[0] * lv) | 0, (t[1] * lv) | 0, (t[2] * lv) | 0);
		if (s.size === 2) {
			const arm = pack((t[0] * lv * 0.5) | 0, (t[1] * lv * 0.5) | 0, (t[2] * lv * 0.55) | 0);
			if (x > 0) out[y * bw + x - 1] = arm;
			if (x < bw - 1) out[y * bw + x + 1] = arm;
			if (y > 0) out[(y - 1) * bw + x] = arm;
			if (y < bh - 1) out[(y + 1) * bw + x] = arm;
		}
	}
}

/* a night gradient in four dithered tones, for the poster */
function paintBackdrop(out, bw, bh) {
	for (let j = 0; j < bh; j++) {
		const t = j / (bh - 1);
		for (let i = 0; i < bw; i++) out[j * bw + i] = pick(PAL.bg, t * t * 0.9 + 0.05, bay(i, j));
	}
}

/**
 * paintWorld(out, depth, bw, bh, cx, cy, N, w, L, time, bg): draws one frame of world w.
 * out: Uint32Array of bw*bh packed pixels; depth: Float32Array of the same size (scratch);
 * (cx, cy): the planet's centre in pixels; R: its radius in pixels (see fitRadius); L: the light direction (a unit
 * vector, z toward the viewer); time: seconds, for the twinkle and the moons; bg: fill a night backdrop first.
 * The planet's own turn is w.ang (and w.cang for its clouds), advanced by the caller.
 */
export function paintWorld(out, depth, bw, bh, cx, cy, R, w, L, time, bg) {
	out.fill(0);
	depth.fill(-9);
	if (bg) paintBackdrop(out, bw, bh);
	paintStars(out, bw, bh, w, time);

	const Lx = L[0];
	const Ly = L[1];
	const Lz = L[2];
	Ax = w.axis[0];
	Ay = w.axis[1];
	Az = w.axis[2];
	const ux = w.U[0];
	const uy = w.U[1];
	const vx = w.V[0];
	const vy = w.V[1];
	const vz = w.V[2];
	const c = cos(w.ang);
	const s = sin(w.ang);
	const e1x = c * ux + s * vx;
	const e1y = c * uy + s * vy;
	const e1z = s * vz;
	const e2x = -s * ux + c * vx;
	const e2y = -s * uy + c * vy;
	const e2z = c * vz;
	const cc = cos(w.cang);
	const cs = sin(w.cang);
	c1x = cc * ux + cs * vx;
	c1y = cc * uy + cs * vy;
	c1z = cs * vz;
	c2x = -cs * ux + cc * vx;
	c2y = -cs * uy + cc * vy;
	c2z = cc * vz;

	/* the atmosphere's halo and glow, behind everything else */
	if (w.atmo > 0) {
		const hw = 0.17;
		const gw = 0.5;
		const ext = 1 + hw + gw;
		const x0 = max(0, floor(cx - ext * R));
		const x1 = min(bw - 1, ceil(cx + ext * R));
		const y0 = max(0, floor(cy - ext * R));
		const y1 = min(bh - 1, ceil(cy + ext * R));
		const A = w.atm;
		for (let j = y0; j <= y1; j++) {
			const dy = (j + 0.5 - cy) / R;
			for (let i = x0; i <= x1; i++) {
				const dx = (i + 0.5 - cx) / R;
				const rr = dx * dx + dy * dy;
				if (rr <= 1 || rr > ext * ext) continue;
				const r = sqrt(rr);
				const lit = clamp01(((dx * Lx + dy * Ly) / r + 0.35) / 1.35) * w.atmo;
				const b = bay(i, j);
				let col = 0;
				if (r < 1 + hw) {
					const a = 1 - (r - 1) / hw;
					if (a * a * lit * 1.6 > b) col = a > 0.5 ? A.inner : A.outer;
				} else {
					const g = 1 - (r - 1 - hw) / gw;
					const v = g * g * lit * 0.55;
					if (v > b) col = v > 0.28 ? A.glow2 : A.glow1;
				}
				if (col) {
					out[j * bw + i] = col;
					depth[j * bw + i] = -8;
				}
			}
		}
	}

	/* the planet */
	{
		const x0 = max(0, floor(cx - R));
		const x1 = min(bw - 1, ceil(cx + R));
		const y0 = max(0, floor(cy - R));
		const y1 = min(bh - 1, ceil(cy + R));
		const rimCol = w.atm.inner;
		for (let j = y0; j <= y1; j++) {
			const dy = (j + 0.5 - cy) / R;
			for (let i = x0; i <= x1; i++) {
				const dx = (i + 0.5 - cx) / R;
				const rr = dx * dx + dy * dy;
				if (rr > 1) continue;
				const nz = sqrt(1 - rr);
				const d = dx * Lx + dy * Ly + nz * Lz;
				let tone = (d + 0.32) / 1.32;
				tone = tone < 0.03 ? 0.03 : tone > 1 ? 1 : tone;
				const qx = dx * e1x + dy * e1y + nz * e1z;
				const qy = dx * Ax + dy * Ay + nz * Az;
				const qz = dx * e2x + dy * e2y + nz * e2z;
				const b = bay(i, j);
				let col = shade(w, qx, qy, qz, tone, b, dx, dy, nz);
				if (w.atmo > 0) {
					const rim = 1 - nz;
					if (rim * rim * rim * rim * (0.25 + 0.75 * tone) * w.atmo * 2.6 > b) col = rimCol;
				}
				out[j * bw + i] = col;
				depth[j * bw + i] = nz;
			}
		}
	}

	/* the ring: the equatorial plane meets each pixel's line of sight; the planet's shadow falls on it */
	if (w.ring) {
		const rg = w.ring;
		const x0 = max(0, floor(cx - rg.out * R));
		const x1 = min(bw - 1, ceil(cx + rg.out * R));
		const y0 = max(0, floor(cy - rg.out * R));
		const y1 = min(bh - 1, ceil(cy + rg.out * R));
		const faceLit = sqrt(abs(Ax * Lx + Ay * Ly + Az * Lz));
		for (let j = y0; j <= y1; j++) {
			const dy = (j + 0.5 - cy) / R;
			for (let i = x0; i <= x1; i++) {
				const dx = (i + 0.5 - cx) / R;
				const z = -(Ax * dx + Ay * dy) / Az;
				const rho = sqrt(dx * dx + dy * dy + z * z);
				if (rho < rg.in || rho > rg.out) continue;
				const idx = j * bw + i;
				if (z <= depth[idx]) continue;
				const t = (rho - rg.in) / (rg.out - rg.in);
				if (abs(t - rg.gap) < rg.gapW) continue;
				let dens = 1.1 + 0.8 * (noise3(t * rg.freq + rg.o, 1.7, 4.2) - 0.5);
				dens *= min(1, t * 14) * min(1, (1 - t) * 14);
				const b = bay(i, j);
				if (dens <= b) continue;
				const ts = -(dx * Lx + dy * Ly + z * Lz);
				let shadow = false;
				if (ts > 0) {
					const qx = dx + ts * Lx;
					const qy = dy + ts * Ly;
					const qz = z + ts * Lz;
					shadow = qx * qx + qy * qy + qz * qz < 1;
				}
				const tone = shadow ? 0.04 : clamp01((0.25 + 0.75 * faceLit) * (0.3 + 0.42 * dens));
				out[idx] = pick(rg.pal, tone, b);
				depth[idx] = z;
			}
		}
	}

	/* the moons: shaded pixel balls on tilted orbits, in front of or behind the planet by depth */
	for (let m = 0; m < w.moons.length; m++) {
		const mo = w.moons[m];
		const ph = mo.phase + mo.speed * time;
		// the orbit plane: the equator tipped by mo.incl about U
		const ci = cos(mo.incl);
		const si = sin(mo.incl);
		const nxo = ci * Ax + si * w.V[0];
		const nyo = ci * Ay + si * w.V[1];
		const nzo = ci * Az + si * w.V[2];
		// W = cross(orbit normal, U): the second axis of the orbit
		const wx = -nzo * uy;
		const wy = nzo * ux;
		const wz = nxo * uy - nyo * ux;
		const px = mo.orbit * (cos(ph) * ux + sin(ph) * wx);
		const py = mo.orbit * (cos(ph) * uy + sin(ph) * wy);
		const pz = mo.orbit * (sin(ph) * wz);
		const mr = max(2.5, (mo.size * R) / 48);
		const mx = cx + px * R;
		const my = cy + py * R;
		const x0 = max(0, floor(mx - mr));
		const x1 = min(bw - 1, ceil(mx + mr));
		const y0 = max(0, floor(my - mr));
		const y1 = min(bh - 1, ceil(my + mr));
		for (let j = y0; j <= y1; j++) {
			const dy = (j + 0.5 - my) / mr;
			for (let i = x0; i <= x1; i++) {
				const dx = (i + 0.5 - mx) / mr;
				const rr = dx * dx + dy * dy;
				if (rr > 1) continue;
				const nz = sqrt(1 - rr);
				const z = pz + (nz * mr) / R;
				const idx = j * bw + i;
				if (z <= depth[idx]) continue;
				const d = dx * Lx + dy * Ly + nz * Lz;
				const tone = clamp01((d + 0.3) / 1.3);
				const tex = fbm(dx * 2.2 + mo.o, dy * 2.2 + mo.o * 0.7, nz * 2.2 + 3.1, 3);
				out[idx] = pick(PAL.moon, tone * (0.78 + (tex - 0.5) * 1.1), bay(i, j));
				depth[idx] = z;
			}
		}
	}
}
