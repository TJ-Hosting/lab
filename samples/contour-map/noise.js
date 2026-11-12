/*
 * Sample 12 — "Breathing Contour Map": the noise.
 * 3D simplex noise (two spatial axes plus time) and a small three-octave blend of it, so the land can drift
 * slowly in the third axis and "breathe". The simplex lattice is the published idea (Ken Perlin's simplex
 * noise, described in Stefan Gustavson's public-domain write-up); this code is written fresh for this
 * sample: nothing is copied from any source.
 *
 * Written from the idea only; no source code was read or copied.
 */

/* the 12 gradient directions (the edge midpoints of a cube), flattened */
const GRAD = new Float32Array([
	1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
	1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
	0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
]);
const F3 = 1 / 3;
const G3 = 1 / 6;

/* a tiny deterministic generator, so a seed always draws the same land */
function prng(seed) {
	let s = (seed >>> 0) || 1;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

/** makeNoise(seed) → noise3(x, y, z) in about -1..1 (typically within ±0.6). */
export function makeNoise(seed = 1) {
	const rnd = prng(seed);
	const p = new Uint8Array(256);
	for (let i = 0; i < 256; i++) p[i] = i;
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		const t = p[i];
		p[i] = p[j];
		p[j] = t;
	}
	const perm = new Uint8Array(512);
	const gi = new Uint8Array(512); // the gradient's index (0..11) at each permutation slot
	for (let i = 0; i < 512; i++) {
		perm[i] = p[i & 255];
		gi[i] = perm[i] % 12;
	}

	return function noise3(x, y, z) {
		// skew the point into the cubic lattice to find its simplex cell
		const s = (x + y + z) * F3;
		const i = Math.floor(x + s);
		const j = Math.floor(y + s);
		const k = Math.floor(z + s);
		const t = (i + j + k) * G3;
		const x0 = x - (i - t);
		const y0 = y - (j - t);
		const z0 = z - (k - t);

		// which of the six tetrahedra the point is in decides the order the corners are visited
		let i1; let j1; let k1; let i2; let j2; let k2;
		if (x0 >= y0) {
			if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
			else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
			else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
		} else if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
		else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
		else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }

		const x1 = x0 - i1 + G3;
		const y1 = y0 - j1 + G3;
		const z1 = z0 - k1 + G3;
		const x2 = x0 - i2 + 2 * G3;
		const y2 = y0 - j2 + 2 * G3;
		const z2 = z0 - k2 + 2 * G3;
		const x3 = x0 - 1 + 3 * G3;
		const y3 = y0 - 1 + 3 * G3;
		const z3 = z0 - 1 + 3 * G3;

		const ii = i & 255;
		const jj = j & 255;
		const kk = k & 255;
		let n = 0;
		let q = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
		if (q > 0) {
			const g = gi[ii + perm[jj + perm[kk]]] * 3;
			q *= q;
			n += q * q * (GRAD[g] * x0 + GRAD[g + 1] * y0 + GRAD[g + 2] * z0);
		}
		q = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
		if (q > 0) {
			const g = gi[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
			q *= q;
			n += q * q * (GRAD[g] * x1 + GRAD[g + 1] * y1 + GRAD[g + 2] * z1);
		}
		q = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
		if (q > 0) {
			const g = gi[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
			q *= q;
			n += q * q * (GRAD[g] * x2 + GRAD[g + 1] * y2 + GRAD[g + 2] * z2);
		}
		q = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
		if (q > 0) {
			const g = gi[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
			q *= q;
			n += q * q * (GRAD[g] * x3 + GRAD[g + 1] * y3 + GRAD[g + 2] * z3);
		}
		return 32 * n;
	};
}

/**
 * makeLand(seed) → land(x, y, z): three octaves blended, normalised to about -1..1 (most values within ±0.6).
 * Each finer octave drifts in z a little faster, so the broad hills move slowly and the small folds quicker.
 */
export function makeLand(seed = 1) {
	const n = makeNoise(seed);
	return function land(x, y, z) {
		return (n(x, y, z) + 0.5 * n(x * 2.03 + 17.1, y * 2.03 - 9.4, z * 1.5 + 3.3) + 0.2 * n(x * 4.11 - 5.7, y * 4.11 + 21.9, z * 2.2 + 8.8)) / 1.7;
	};
}
