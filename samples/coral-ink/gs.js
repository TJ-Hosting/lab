/*
 * Sample 09 — "Coral Ink Reactor": the Gray-Scott reaction-diffusion model, no DOM in here.
 * Written from the idea only; no source code was read or copied. (The pen this sample is inspired by could not be
 * fetched, so this is new code. The equations and the (F, k) numbers are the published model of Gray and Scott,
 * explored by Pearson, 1993; they are maths, not code.)
 *
 *   du/dt = Du * lap(u) - u v^2 + F (1 - u)
 *   dv/dt = Dv * lap(v) + u v^2 - (F + k) v
 *
 * Two Float32Array fields on a grid with a one-cell border (zero-flux walls), a 9-point Laplacian
 * (0.2 on the four neighbours, 0.05 on the four corners, -1 in the centre), Du = 1, Dv = 0.5, dt = 1.
 */

export const PRESETS = [
	{ name: 'Coral', F: 0.0545, k: 0.062 },
	{ name: 'Worms', F: 0.0545, k: 0.0635 },
	{ name: 'Mitosis', F: 0.0367, k: 0.0649 },
	{ name: 'Holes', F: 0.039, k: 0.058 },
	{ name: 'Fingerprint', F: 0.029, k: 0.057 },
	{ name: 'Rings', F: 0.018, k: 0.051 },
];

const DU = 1;
const DV = 0.5;

export class Reactor {
	constructor(gw, gh) {
		this.alloc(gw, gh);
		this.clear();
	}

	alloc(gw, gh) {
		this.gw = gw;
		this.gh = gh;
		this.sw = gw + 2;
		const n = this.sw * (gh + 2);
		this.u = new Float32Array(n);
		this.v = new Float32Array(n);
		this.u2 = new Float32Array(n);
		this.v2 = new Float32Array(n);
	}

	/* an empty dish: all substrate (u = 1), no ink (v = 0) */
	clear() {
		this.u.fill(1);
		this.v.fill(0);
	}

	/* a soft drop of ink at grid position (cx, cy), radius r cells: some substrate eaten, some ink laid down */
	drop(cx, cy, r) {
		const { gw, gh, sw, u, v } = this;
		const x0 = Math.max(1, Math.floor(cx - r));
		const x1 = Math.min(gw, Math.ceil(cx + r));
		const y0 = Math.max(1, Math.floor(cy - r));
		const y1 = Math.min(gh, Math.ceil(cy + r));
		const r2 = r * r;
		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
				if (d2 >= r2) continue;
				const w = 1 - d2 / r2;
				const i = y * sw + x;
				const uu = 1 - 0.5 * Math.min(1, w * 2);
				if (uu < u[i]) u[i] = uu;
				const vv = 0.25 * Math.min(1, w * 2);
				if (vv > v[i]) v[i] = vv;
			}
		}
	}

	/* the average amount of ink, from a sparse sample of the grid (cheap enough to call every few frames) */
	ink() {
		const { gw, gh, sw, v } = this;
		let sum = 0;
		let n = 0;
		for (let y = 2; y <= gh; y += 3) {
			for (let x = 2; x <= gw; x += 3) {
				sum += v[y * sw + x];
				n++;
			}
		}
		return n ? sum / n : 0;
	}

	/* keep the picture across a resize: every new cell takes the nearest old one */
	resample(gw, gh) {
		if (gw === this.gw && gh === this.gh) return;
		const old = { u: this.u, v: this.v, gw: this.gw, gh: this.gh, sw: this.sw };
		this.alloc(gw, gh);
		const { sw, u, v } = this;
		for (let y = 1; y <= gh; y++) {
			const oy = 1 + Math.min(old.gh - 1, Math.floor(((y - 0.5) * old.gh) / gh));
			for (let x = 1; x <= gw; x++) {
				const ox = 1 + Math.min(old.gw - 1, Math.floor(((x - 0.5) * old.gw) / gw));
				u[y * sw + x] = old.u[oy * old.sw + ox];
				v[y * sw + x] = old.v[oy * old.sw + ox];
			}
		}
		this.walls();
	}

	/* zero-flux walls: the border copies the cell next to it */
	walls(a = this.u, b = this.v) {
		const { gw, gh, sw } = this;
		const last = (gh + 1) * sw;
		for (let x = 1; x <= gw; x++) {
			a[x] = a[sw + x];
			b[x] = b[sw + x];
			a[last + x] = a[gh * sw + x];
			b[last + x] = b[gh * sw + x];
		}
		for (let y = 0; y <= gh + 1; y++) {
			const row = y * sw;
			a[row] = a[row + 1];
			b[row] = b[row + 1];
			a[row + gw + 1] = a[row + gw];
			b[row + gw + 1] = b[row + gw];
		}
	}

	/* advance n steps with feed rate F and kill rate k */
	step(n, F, k) {
		const { gw, gh, sw } = this;
		const FK = F + k;
		for (let s = 0; s < n; s++) {
			const u = this.u;
			const v = this.v;
			const u2 = this.u2;
			const v2 = this.v2;
			for (let y = 1; y <= gh; y++) {
				const row = y * sw;
				for (let i = row + 1, end = row + gw; i <= end; i++) {
					const a = u[i];
					const b = v[i];
					const lu = -a + 0.2 * (u[i - 1] + u[i + 1] + u[i - sw] + u[i + sw]) + 0.05 * (u[i - sw - 1] + u[i - sw + 1] + u[i + sw - 1] + u[i + sw + 1]);
					const lv = -b + 0.2 * (v[i - 1] + v[i + 1] + v[i - sw] + v[i + sw]) + 0.05 * (v[i - sw - 1] + v[i - sw + 1] + v[i + sw - 1] + v[i + sw + 1]);
					const r = a * b * b;
					u2[i] = a + DU * lu - r + F * (1 - a);
					v2[i] = b + DV * lv + r - FK * b;
				}
			}
			this.walls(u2, v2);
			this.u = u2;
			this.v = v2;
			this.u2 = u;
			this.v2 = v;
		}
	}
}
