/*
 * Sample 25 — "Tear the Glass Curtain": the cloth.
 * A small Verlet cloth with no DOM in it: a grid of points joined by threads, pinned along the top row.
 * Each step moves every free point by its own last move (Verlet), adds gravity and a breeze, then relaxes the
 * threads a few times; a thread stretched past `tear` times its rest length snaps. A pointer can hold a small
 * cluster of points (pull), and a segment can cut every thread it crosses (slice).
 *
 * Idea: a Verlet cloth pinned along its top row that tears when stretched, as in the "Tearable Cloth" demo
 * (CodePen pen ALMBPg by Kudriavaya, after Suffick's demo). Written from the idea only; no source code was
 * read or copied. The technique (position-based relaxation of distance constraints) is textbook.
 */

const VMAX = 18; // px per step
const HEADING = 4; // rows

export class Cloth {
	constructor({ cols, rows, sx, sy, left, top, gravity = 0.2, damping = 0.992, tear = 1.8, iterations = 6, breeze = 0.007 }) {
		this.cols = cols;
		this.rows = rows;
		this.sx = sx;
		this.sy = sy;
		this.left = left;
		this.top = top;
		this.gravity = gravity;
		this.damping = damping;
		this.tear = tear;
		this.iterations = iterations;
		this.breeze = breeze;

		const n = cols * rows;
		this.x = new Float32Array(n);
		this.y = new Float32Array(n);
		this.ox = new Float32Array(n);
		this.oy = new Float32Array(n);
		this.pin = new Uint8Array(n);
		this.live = new Uint8Array(n);

		// threads: first every horizontal one (row by row), then every vertical one
		this.nh = (cols - 1) * rows;
		const nc = this.nh + cols * (rows - 1);
		this.nc = nc;
		this.A = new Int32Array(nc);
		this.B = new Int32Array(nc);
		this.rest = new Float32Array(nc);
		this.alive = new Uint8Array(nc);
		// how far each thread may stretch, as a multiple of its rest length: the top rows are a reinforced heading
		// (like a curtain's heading tape), so the sheet tears where it is pulled and never unzips from its rail
		this.strength = new Float32Array(nc);
		let c = 0;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols - 1; i++, c++) {
				this.A[c] = j * cols + i;
				this.B[c] = j * cols + i + 1;
				this.rest[c] = sx;
				this.strength[c] = j < HEADING ? tear * 3 : tear;
			}
		}
		for (let j = 0; j < rows - 1; j++) {
			for (let i = 0; i < cols; i++, c++) {
				this.A[c] = j * cols + i;
				this.B[c] = (j + 1) * cols + i;
				this.rest[c] = sy;
				this.strength[c] = j < HEADING ? tear * 3 : tear;
			}
		}

		this.handles = [];
		this.tx = 0;
		this.ty = 0;
		this.time = 0;
		this.steps = 0;
		this.reset();
	}

	/* the thread ids around the cell whose top-left corner is (i, j) */
	hId(i, j) { return j * (this.cols - 1) + i; }
	vId(i, j) { return this.nh + j * this.cols + i; }
	cellOk(i, j) {
		const a = this.alive;
		return a[this.hId(i, j)] && a[this.hId(i, j + 1)] && a[this.vId(i, j)] && a[this.vId(i + 1, j)];
	}

	/* hang the cloth fresh: every point at rest, the top row pinned; `swing` gives it a gentle sideways swell */
	reset(swing = 0) {
		const { cols, rows, sx, sy, left, top } = this;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const p = j * cols + i;
				this.x[p] = this.ox[p] = left + i * sx;
				this.y[p] = this.oy[p] = top + j * sy;
				this.pin[p] = j === 0 ? 1 : 0;
				this.live[p] = 1;
				if (swing) this.ox[p] = this.x[p] - swing * (j / (rows - 1)) * Math.sin(i * 0.13 + 0.8);
			}
		}
		this.alive.fill(1);
		this.handles.length = 0;
		this.time = 0;
		this.steps = 0;
	}

	/* hold the points within r of (x, y); they follow setTarget() until release(). Returns how many. */
	grab(x, y, r) {
		this.handles.length = 0;
		this.tx = x;
		this.ty = y;
		const { cols, rows } = this;
		const r2 = r * r;
		for (let p = 0; p < cols * rows; p++) {
			if (!this.live[p] || this.pin[p]) continue;
			const dx = this.x[p] - x;
			const dy = this.y[p] - y;
			const d2 = dx * dx + dy * dy;
			if (d2 > r2) continue;
			const w = 1 - Math.sqrt(d2) / r;
			this.handles.push({ p, dx, dy, k: 0.3 + 0.35 * w });
		}
		return this.handles.length;
	}
	setTarget(x, y) { this.tx = x; this.ty = y; }
	/* let go: the whole sheet loses most of its speed, so a stretched cloth settles back instead of whipping */
	release() {
		if (!this.handles.length) return;
		const n = this.cols * this.rows;
		for (let p = 0; p < n; p++) {
			this.ox[p] = this.x[p] - (this.x[p] - this.ox[p]) * 0.15;
			this.oy[p] = this.y[p] - (this.y[p] - this.oy[p]) * 0.15;
		}
		this.handles.length = 0;
	}

	/* cut every thread the segment crosses; returns how many were cut */
	cut(x1, y1, x2, y2) {
		const { x, y, A, B, alive, nc } = this;
		const lx = Math.min(x1, x2) - 0.5;
		const hx = Math.max(x1, x2) + 0.5;
		const ly = Math.min(y1, y2) - 0.5;
		const hy = Math.max(y1, y2) + 0.5;
		const ex = x2 - x1;
		const ey = y2 - y1;
		let n = 0;
		for (let c = 0; c < nc; c++) {
			if (!alive[c]) continue;
			const a = A[c];
			const b = B[c];
			const ax = x[a];
			const ay = y[a];
			const bx = x[b];
			const by = y[b];
			if ((ax < lx && bx < lx) || (ax > hx && bx > hx) || (ay < ly && by < ly) || (ay > hy && by > hy)) continue;
			// the thread's ends on either side of the blade, and the blade's ends on either side of the thread
			const o1 = ex * (ay - y1) - ey * (ax - x1);
			const o2 = ex * (by - y1) - ey * (bx - x1);
			if (o1 * o2 > 0) continue;
			const fx = bx - ax;
			const fy = by - ay;
			const o3 = fx * (y1 - ay) - fy * (x1 - ax);
			const o4 = fx * (y2 - ay) - fy * (x2 - ax);
			if (o3 * o4 > 0) continue;
			alive[c] = 0;
			n++;
		}
		return n;
	}

	/* one fixed step (1/60 s) */
	step() {
		const { cols, rows, x, y, ox, oy, pin, live, A, B, rest, alive, strength, nc } = this;
		const t = (this.time += 1 / 60);
		this.steps++;
		const g = this.gravity;
		const damp = this.damping;
		const gust = this.breeze * (0.8 + 0.2 * Math.sin(t * 0.21));

		for (let j = 0; j < rows; j++) {
			const f = (0.2 + 0.8 * (j / (rows - 1))) * gust;
			for (let i = 0; i < cols; i++) {
				const p = j * cols + i;
				if (!live[p] || pin[p]) continue;
				// (a speed limit keeps a snap from throwing a point across the screen)
				const vx = Math.max(-VMAX, Math.min(VMAX, (x[p] - ox[p]) * damp));
				const vy = Math.max(-VMAX, Math.min(VMAX, (y[p] - oy[p]) * damp));
				ox[p] = x[p];
				oy[p] = y[p];
				const s = Math.sin(t * 0.9 - i * 0.085 + j * 0.03) * 0.65 + Math.sin(t * 0.37 + i * 0.031 - j * 0.05) * 0.35;
				x[p] += vx + f * s;
				y[p] += vy + g + f * 0.3 * Math.sin(t * 1.3 + i * 0.12);
			}
		}

		const hs = this.handles;
		for (let it = 0; it < this.iterations; it++) {
			for (let h = 0; h < hs.length; h++) {
				const o = hs[h];
				const p = o.p;
				if (!live[p]) continue;
				x[p] += (this.tx + o.dx - x[p]) * o.k;
				y[p] += (this.ty + o.dy - y[p]) * o.k;
			}
			for (let c = 0; c < nc; c++) {
				if (!alive[c]) continue;
				const a = A[c];
				const b = B[c];
				if (!live[a] || !live[b]) continue;
				const dx = x[b] - x[a];
				const dy = y[b] - y[a];
				const d2 = dx * dx + dy * dy;
				const L = rest[c];
				if (d2 < 1e-6) continue;
				const d = Math.sqrt(d2);
				const wa = pin[a] ? 0 : 1;
				const wb = pin[b] ? 0 : 1;
				const ws = wa + wb;
				if (!ws) continue;
				// a thread pulls back hard and pushes only a little, so the cloth can bunch into folds
				const k = ((d - L) / d / ws) * (d < L ? 0.4 : 1);
				x[a] += dx * k * wa;
				y[a] += dy * k * wa;
				x[b] -= dx * k * wb;
				y[b] -= dy * k * wb;
			}
		}

		// a thread snaps only if it is still over-stretched after the relaxing, not for a passing overshoot
		for (let c = 0; c < nc; c++) {
			if (!alive[c]) continue;
			const a = A[c];
			const b = B[c];
			const dx = x[b] - x[a];
			const dy = y[b] - y[a];
			const lim = strength[c] * rest[c];
			if (dx * dx + dy * dy > lim * lim) alive[c] = 0;
		}

		if (this.steps % 12 === 0) this.cull();
	}

	/* points that have fallen far out of sight stop costing anything */
	cull() {
		const { cols, rows, x, y, live, A, B, alive, nc } = this;
		const far = this.top + rows * this.sy * 2.2 + 200;
		const side = (cols * this.sx) * 1.5;
		for (let p = 0; p < cols * rows; p++) {
			if (live[p] && (y[p] > far || x[p] < -side || x[p] > side + cols * this.sx)) live[p] = 0;
		}
		for (let c = 0; c < nc; c++) if (alive[c] && (!live[A[c]] || !live[B[c]])) alive[c] = 0;
	}

	run(steps) { for (let s = 0; s < steps; s++) this.step(); }
}
