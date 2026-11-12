/*
 * Sample 17 — "Service Shape-Shifter".
 * Thousands of glowing points that morph between four hosting shapes: a stack of servers, a cloud, a shield with a
 * check mark and a window with code brackets. Each shape is a point cloud sampled in code from surfaces, edges and
 * tubes (the cloud is a union of spheres with a flat base, the shield is a smoothed outline with a domed face), so
 * there are no models and no images. The points sit in a three.js Points object whose vertex shader flies every
 * point from its old position to its new one with its own delay, a swirl around the vertical axis and a little spray,
 * so a change reads as the cloud breaking up and re-forming. A faint haze with a few slow blobs sits behind it, with a
 * field of stars. The picture goes through an EffectComposer: render, UnrealBloom, a small colour-split ShaderPass
 * (red and blue shift apart, and back, during each change), then the output pass for the colour space.
 * Idle, it changes shape every few seconds and the shape turns slowly; tapping the piece, a chip, the Morph button
 * or pressing Enter changes it at once, and a drag turns it by hand. One loop() from js/lab.js drives the motion and is
 * the only thing that calls composer.render (there is no setAnimationLoop), so nothing draws off-screen or in a
 * hidden tab. Under reduced motion one frame of the server stack is rendered and nothing loops; a chip, a tap or a
 * drag then renders once for that input. A browser without WebGL 2 gets a still CSS picture and a short note.
 * On phones there are fewer points, a lower pixel ratio and a half-size bloom; a slow device steps itself down.
 *
 * Idea: particle morphing between point-cloud targets on the GPU (the "Interactive Particle Morphing with Three.js &
 * GLSL" pen by VoXelo on CodePen, https://codepen.io/VoXelo/pen/VYLJYBz). The pen could not be fetched here (its
 * page and its Debug view both answered with a Cloudflare challenge), so this is written from the idea only; no
 * source code was read or copied. The shapes, the sampling, the shaders, the colour-split pass and the controls are new.
 *
 * Uses three.js (three@0.186.1) and four of its addons (EffectComposer, RenderPass, UnrealBloomPass, OutputPass, with
 * ShaderPass), imported unmodified from vendor/three@0.186.1/, which carries its LICENSE.
 *
 * The MIT License
 *
 * Copyright © 2010-2026 three.js authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import * as THREE from '../../vendor/three@0.186.1/build/three.module.js';
import { EffectComposer } from '../../vendor/three@0.186.1/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/three@0.186.1/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../vendor/three@0.186.1/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '../../vendor/three@0.186.1/addons/postprocessing/ShaderPass.js';
import { OutputPass } from '../../vendor/three@0.186.1/addons/postprocessing/OutputPass.js';

const screenEl = document.querySelector('.piece-screen');
const canvas = document.querySelector('.piece');
const deck = document.querySelector('.deck');
const caption = document.querySelector('.caption');
const chips = [...document.querySelectorAll('.chip')];
const info = document.querySelector('.sample-info');
const morphBtn = document.querySelector('[data-action="morph"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const REDUCED = prefersReducedMotion();
const PHONE = innerWidth < 720;

/* ---------- the look ---------- */
const FOV = 30;
const CAM_Z = 12;
const FIT_W = 5.3; // the world-unit box every shape fits in (the camera is zoomed to fit it in the free area)
const FIT_H = 4.3;
const N = PHONE ? 8000 : 15000; // points in the cloud
const N_STARS = PHONE ? 600 : 1500;
const MORPH_SECONDS = 2.3;
const HOLD_SECONDS = 6; // how long a shape rests before the next one forms by itself
const SIZE = PHONE ? 0.046 : 0.034; // a point's size in world units; a phone has fewer points, so each is larger
const TAU = Math.PI * 2;

/* the four shapes: the chip label and the caption (the chip's icon is in the HTML) */
const SHAPES = [
	{ label: 'Server', caption: 'Servers · a place for your site to live' },
	{ label: 'Cloud', caption: 'Cloud · room to grow when you need it' },
	{ label: 'Shield', caption: 'Security · locks and backups, built in' },
	{ label: 'Code', caption: 'Code · ready when you are' },
];

/* ---------- a small seeded random generator, so the shapes are the same on every visit ---------- */
function seeded(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- sampling helpers: each returns a point [x, y, z] (plus a tone where it says so) ---------- */

/* a random point on the surface of a box with half-sizes hx, hy, hz (every face, by area) */
function boxSurface(rnd, hx, hy, hz) {
	const ax = hy * hz;
	const ay = hx * hz;
	const az = hx * hy;
	const r = rnd() * (ax + ay + az);
	const s = rnd() < 0.5 ? -1 : 1;
	let x = (rnd() * 2 - 1) * hx;
	let y = (rnd() * 2 - 1) * hy;
	let z = (rnd() * 2 - 1) * hz;
	if (r < ax) x = s * hx;
	else if (r < ax + ay) y = s * hy;
	else z = s * hz;
	return [x, y, z];
}

/* a random point on one of the twelve edges of a box, longer edges more often */
function boxEdge(rnd, hx, hy, hz) {
	const r = rnd() * (hx + hy + hz);
	const sa = rnd() < 0.5 ? -1 : 1;
	const sb = rnd() < 0.5 ? -1 : 1;
	if (r < hx) return [(rnd() * 2 - 1) * hx, sa * hy, sb * hz];
	if (r < hx + hy) return [sa * hx, (rnd() * 2 - 1) * hy, sb * hz];
	return [sa * hx, sb * hy, (rnd() * 2 - 1) * hz];
}

/* a small round cluster of points (an LED, a window dot) */
function blob(rnd, x, y, z, r, tone) {
	const u = rnd() * 2 - 1;
	const a = rnd() * TAU;
	const s = Math.sqrt(1 - u * u);
	const k = r * Math.cbrt(rnd());
	return [x + k * s * Math.cos(a), y + k * u, z + k * s * Math.sin(a), tone];
}

/* a point on the outline of a rectangle [x0..x1] × [y0..y1] */
function rectPerimeter(rnd, x0, x1, y0, y1) {
	const w = x1 - x0;
	const h = y1 - y0;
	let d = rnd() * 2 * (w + h);
	if (d < w) return [x0 + d, y0];
	d -= w;
	if (d < h) return [x1, y0 + d];
	d -= h;
	if (d < w) return [x1 - d, y1];
	return [x0, y1 - (d - w)];
}

/* an open polyline you can pick random points on: sample() gives a point and the direction of its segment */
function makePath(pts) {
	const segs = [];
	let total = 0;
	for (let i = 0; i < pts.length - 1; i++) {
		const [ax, ay] = pts[i];
		const [bx, by] = pts[i + 1];
		const len = Math.hypot(bx - ax, by - ay);
		segs.push({ ax, ay, dx: (bx - ax) / len, dy: (by - ay) / len, len });
		total += len;
	}
	return {
		sample(rnd) {
			let d = rnd() * total;
			for (const s of segs) {
				if (d <= s.len) return { x: s.ax + s.dx * d, y: s.ay + s.dy * d, dx: s.dx, dy: s.dy };
				d -= s.len;
			}
			const s = segs[segs.length - 1];
			return { x: s.ax + s.dx * s.len, y: s.ay + s.dy * s.len, dx: s.dx, dy: s.dy };
		},
	};
}

/* a point on a round tube of radius r around a path in the xy plane, lifted to z0 */
function tubePoint(path, rnd, r, z0) {
	const s = path.sample(rnd);
	const phi = rnd() * TAU;
	const c = Math.cos(phi) * r;
	const n = Math.sin(phi) * r;
	return [s.x + s.dy * n, s.y - s.dx * n, z0 + c];
}

/* a closed polygon you can pick boundary points on and test points against */
function makePoly(pts) {
	const cum = [0];
	for (let i = 0; i < pts.length; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % pts.length];
		cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
	}
	const total = cum[pts.length];
	return {
		pts,
		boundary(rnd) {
			const d = rnd() * total;
			let lo = 0;
			let hi = pts.length - 1;
			while (lo < hi) {
				const mid = (lo + hi) >> 1;
				if (cum[mid + 1] < d) lo = mid + 1;
				else hi = mid;
			}
			const a = pts[lo];
			const b = pts[(lo + 1) % pts.length];
			const f = (d - cum[lo]) / Math.max(1e-6, cum[lo + 1] - cum[lo]);
			return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
		},
		inside(x, y) {
			let c = false;
			for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
				const [xi, yi] = pts[i];
				const [xj, yj] = pts[j];
				if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
			}
			return c;
		},
		fill(rnd, x0, x1, y0, y1) {
			for (let n = 0; n < 60; n++) {
				const x = x0 + rnd() * (x1 - x0);
				const y = y0 + rnd() * (y1 - y0);
				if (this.inside(x, y)) return [x, y];
			}
			return [0, 0];
		},
	};
}

/* corner cutting: smooths a closed polygon's corners */
function chaikin(pts, iters) {
	let p = pts;
	for (let it = 0; it < iters; it++) {
		const q = [];
		for (let i = 0; i < p.length; i++) {
			const a = p[i];
			const b = p[(i + 1) % p.length];
			q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
		}
		p = q;
	}
	return p;
}

function roundedRect(hx, hy, r, seg) {
	const pts = [];
	const corners = [[hx - r, hy - r, 0], [-hx + r, hy - r, Math.PI / 2], [-hx + r, -hy + r, Math.PI], [hx - r, -hy + r, Math.PI * 1.5]];
	for (const [cx, cy, a0] of corners) {
		for (let i = 0; i <= seg; i++) {
			const a = a0 + (i / seg) * (Math.PI / 2);
			pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
		}
	}
	return pts;
}

/* the parts of a shape are {w, gen}: gen(rnd) → [x, y, z, tone]; w says how many of the points go to that part.
   assemble() deals the points out, then shuffles them, so any first share of them is an even sample of the whole shape
   (a slow device simply draws fewer). The tone picks a colour in the shader: 0 royal, 0.4 azure, 0.7 cyan, 1 white, 1.8 warm. */
function assemble(parts, n, rnd) {
	const sum = parts.reduce((s, p) => s + p.w, 0);
	const counts = parts.map((p) => Math.floor((n * p.w) / sum));
	let used = counts.reduce((a, b) => a + b, 0);
	for (let i = 0; used < n; i = (i + 1) % parts.length, used++) counts[i]++;
	const pos = new Float32Array(n * 3);
	const tone = new Float32Array(n);
	let k = 0;
	parts.forEach((p, i) => {
		for (let j = 0; j < counts[i]; j++, k++) {
			const q = p.gen(rnd);
			pos[k * 3] = q[0];
			pos[k * 3 + 1] = q[1];
			pos[k * 3 + 2] = q[2];
			tone[k] = q[3];
		}
	});
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		for (let c = 0; c < 3; c++) {
			const t = pos[i * 3 + c];
			pos[i * 3 + c] = pos[j * 3 + c];
			pos[j * 3 + c] = t;
		}
		const tt = tone[i];
		tone[i] = tone[j];
		tone[j] = tt;
	}
	return { pos, tone };
}

/* ---------- shape 1: a rack of three servers ---------- */
function serverShape(n, rnd) {
	const HX = 1.8;
	const HY = 0.45;
	const HZ = 0.78;
	const parts = [];
	const bays = [[-1.55, -0.95], [-0.82, -0.22], [-0.09, 0.51]];
	[1.2, 0, -1.2].forEach((cy, u) => {
		/* the box: bright edges and a sparse skin */
		parts.push({ w: 0.27, gen: () => { const [x, y, z] = boxEdge(rnd, HX, HY, HZ); return [x, y + cy, z, 0.82 + (rnd() - 0.5) * 0.2]; } });
		parts.push({ w: 0.12, gen: () => { const [x, y, z] = boxSurface(rnd, HX, HY, HZ); return [x, y + cy, z, 0.2 + rnd() * 0.22]; } });
		/* three drive bays on the front, and a vent grille */
		parts.push({ w: 0.2, gen: () => { const b = bays[(rnd() * 3) | 0]; const [x, y] = rectPerimeter(rnd, b[0], b[1], -0.24, 0.24); return [x, y + cy, HZ + 0.004, 0.66 + rnd() * 0.14]; } });
		parts.push({ w: 0.14, gen: () => { const i = (rnd() * 7) | 0; return [0.76 + i * 0.1, cy + (rnd() * 2 - 1) * 0.2, HZ + 0.004, 0.46 + rnd() * 0.14]; } });
		/* two LEDs: one white, one warm (the middle unit's is white too) */
		parts.push({ w: 0.022, gen: () => blob(rnd, 1.52, cy + 0.15, HZ + 0.01, 0.045, 0.95) });
		parts.push({ w: 0.022, gen: () => blob(rnd, 1.52, cy - 0.14, HZ + 0.01, 0.045, u === 1 ? 0.95 : 1.8) });
	});
	/* the two rack rails, front and back */
	parts.push({ w: 0.26, gen: () => [(rnd() < 0.5 ? -1 : 1) * 2.07, (rnd() * 2 - 1) * 1.95, (rnd() < 0.5 ? -1 : 1) * HZ, 0.34 + rnd() * 0.16] });
	return assemble(parts, n, rnd);
}

/* ---------- shape 2: a cloud (a union of spheres with a flat base) ---------- */
const CLOUD = [[-1.3, -0.42, 0.76], [-0.5, 0.08, 1.0], [0.55, 0.34, 1.14], [1.42, -0.22, 0.82], [0.05, -0.55, 0.82], [-0.15, 0.78, 0.6]];
const CLOUD_BASE = -1.05;
const CLOUD_Z = 0.62; // the cloud is a little flatter front to back
const CLOUD_K = 1.2; // and scaled up to fill the box
const CLOUD_AREA = CLOUD.map((c) => c[2] * c[2]);
const CLOUD_AREA_SUM = CLOUD_AREA.reduce((a, b) => a + b, 0);

function cloudSurface(rnd, yMax) {
	for (let tries = 0; tries < 400; tries++) {
		let r = rnd() * CLOUD_AREA_SUM;
		let i = 0;
		while (i < CLOUD.length - 1 && r > CLOUD_AREA[i]) { r -= CLOUD_AREA[i]; i++; }
		const [cx, cy, rad] = CLOUD[i];
		const u = rnd() * 2 - 1;
		const a = rnd() * TAU;
		const s = Math.sqrt(1 - u * u);
		const x = cx + rad * s * Math.cos(a);
		const y = cy + rad * u;
		const z = rad * s * Math.sin(a);
		if (y < CLOUD_BASE || y > yMax) continue;
		let ok = true;
		for (let j = 0; j < CLOUD.length; j++) {
			if (j === i) continue;
			const dx = x - CLOUD[j][0];
			const dy = y - CLOUD[j][1];
			if (dx * dx + dy * dy + z * z < CLOUD[j][2] * CLOUD[j][2] * 0.985) { ok = false; break; }
		}
		if (ok) return [x, y, z];
	}
	return [0, CLOUD_BASE, 0];
}

function cloudShape(n, rnd) {
	const parts = [];
	const out = (x, y, z, tone) => [x * CLOUD_K, y * CLOUD_K, z * CLOUD_Z * CLOUD_K, tone];
	/* the skin of the union */
	parts.push({ w: 0.8, gen: () => { const [x, y, z] = cloudSurface(rnd, 9); return out(x, y, z, 0.42 + 0.42 * ((y - CLOUD_BASE) / 2.5) + (rnd() - 0.5) * 0.16); } });
	/* the flat base: points on the plane, inside the union */
	parts.push({ w: 0.1, gen: () => {
		for (let t = 0; t < 400; t++) {
			const x = -2.2 + rnd() * 4.5;
			const z = (rnd() * 2 - 1) * 1.15;
			for (const [cx, cy, r] of CLOUD) {
				const dy = CLOUD_BASE - cy;
				if (Math.abs(dy) < r && (x - cx) ** 2 + dy * dy + z * z < r * r) return out(x, CLOUD_BASE, z, 0.3 + rnd() * 0.15);
			}
		}
		return out(0, CLOUD_BASE, 0, 0.3);
	} });
	/* the rim where the skin meets the base: a bright line */
	parts.push({ w: 0.12, gen: () => { const [x, y, z] = cloudSurface(rnd, CLOUD_BASE + 0.07); return out(x, y, z, 0.92 + (rnd() - 0.5) * 0.1); } });
	return assemble(parts, n, rnd);
}

/* ---------- shape 3: a shield with a check mark ---------- */
const SHIELD = makePoly(chaikin([[0, 2.0], [1.55, 1.45], [1.55, 0.2], [1.3, -0.7], [0.7, -1.45], [0, -2.0], [-0.7, -1.45], [-1.3, -0.7], [-1.55, 0.2], [-1.55, 1.45]], 3));
const SHIELD_IN = makePoly(SHIELD.pts.map(([x, y]) => [x * 0.8, (y - 0.05) * 0.84 + 0.05]));
const shieldFront = (x, y) => 0.55 - 0.35 * (x / 1.55) ** 2 - 0.12 * (y / 2) ** 2 + 0.1 * (1 - Math.abs(x) / 1.55);
const shieldBack = (x) => -0.32 + 0.16 * (x / 1.55) ** 2;

function shieldShape(n, rnd) {
	const parts = [];
	const tick = makePath([[-0.7, 0.1], [-0.22, -0.4], [0.72, 0.62]]);
	/* the rim: a wall around the edge, front to back */
	parts.push({ w: 0.3, gen: () => { const [x, y] = SHIELD.boundary(rnd); const f = shieldFront(x, y); const b = shieldBack(x); return [x, y, b + (f - b) * rnd(), 0.9 + (rnd() - 0.5) * 0.18]; } });
	/* the domed face, and a quieter back */
	parts.push({ w: 0.22, gen: () => { const [x, y] = SHIELD.fill(rnd, -1.6, 1.6, -2.05, 2.05); return [x, y, shieldFront(x, y), 0.3 + 0.25 * ((y + 2) / 4) + rnd() * 0.15]; } });
	parts.push({ w: 0.06, gen: () => { const [x, y] = SHIELD.fill(rnd, -1.6, 1.6, -2.05, 2.05); return [x, y, shieldBack(x), 0.14 + rnd() * 0.12]; } });
	/* an inner border line on the face */
	parts.push({ w: 0.12, gen: () => { const [x, y] = SHIELD_IN.boundary(rnd); return [x, y, shieldFront(x, y) + 0.03, 0.62 + rnd() * 0.14]; } });
	/* the check mark: a bright tube floating just in front of the face */
	parts.push({ w: 0.16, gen: () => {
		const p = tubePoint(tick, rnd, 0.13, 0);
		return [p[0], p[1], shieldFront(p[0], p[1]) + 0.24 + p[2], 0.86 + (rnd() - 0.5) * 0.1];
	} });
	return assemble(parts, n, rnd);
}

/* ---------- shape 4: a code window with < / > brackets ---------- */
const WINDOW = makePoly(roundedRect(2.6, 1.7, 0.3, 6));

function codeShape(n, rnd) {
	const parts = [];
	const lt = makePath([[-0.78, 0.92], [-1.72, 0], [-0.78, -0.92]]);
	const gt = makePath([[0.78, 0.92], [1.72, 0], [0.78, -0.92]]);
	const sl = makePath([[0.42, 1.12], [-0.42, -1.12]]);
	const Z0 = 0.18;
	const R = 0.15;
	/* the three tubes: the brackets and the slash */
	parts.push({ w: 0.09, gen: () => { const p = tubePoint(lt, rnd, R, Z0); return [p[0], p[1], p[2], 0.8 + (rnd() - 0.5) * 0.1]; } });
	parts.push({ w: 0.09, gen: () => { const p = tubePoint(gt, rnd, R, Z0); return [p[0], p[1], p[2], 0.8 + (rnd() - 0.5) * 0.1]; } });
	parts.push({ w: 0.07, gen: () => { const p = tubePoint(sl, rnd, R * 0.9, Z0); return [p[0], p[1], p[2], 0.62 + (rnd() - 0.5) * 0.1]; } });
	/* the window behind them: an outline with a little depth, a title bar line, three dots and a quiet fill */
	parts.push({ w: 0.22, gen: () => { const [x, y] = WINDOW.boundary(rnd); return [x, y, -0.62 + rnd() * 0.24, 0.5 + rnd() * 0.16]; } });
	parts.push({ w: 0.05, gen: () => [(rnd() * 2 - 1) * 2.55, 1.2, -0.38, 0.5 + rnd() * 0.12] });
	parts.push({ w: 0.01, gen: () => blob(rnd, -2.28, 1.46, -0.36, 0.055, 0.9) });
	parts.push({ w: 0.01, gen: () => blob(rnd, -2.06, 1.46, -0.36, 0.055, 0.7) });
	parts.push({ w: 0.01, gen: () => blob(rnd, -1.84, 1.46, -0.36, 0.055, 1.8) });
	parts.push({ w: 0.12, gen: () => { const [x, y] = WINDOW.fill(rnd, -2.6, 2.6, -1.7, 1.7); return [x, y, -0.5, 0.16 + rnd() * 0.16]; } });
	return assemble(parts, n, rnd);
}

/* the four shapes, built once (about a fifth of a second at most) */
function buildShapes() {
	return [serverShape(N, seeded(11)), cloudShape(N, seeded(23)), shieldShape(N, seeded(37)), codeShape(N, seeded(53))];
}

/* ---------- the shaders ---------- */
/* the points: each one flies from `position` to `aTo`, after a delay of its own, along a swirl */
const POINTS_VERT = `
uniform float uMix;
uniform float uTime;
uniform float uSize;
uniform float uViewH;
attribute vec3 aTo;
attribute float aToneA;
attribute float aToneB;
attribute vec4 aRand;
varying float vTone;
varying float vArc;
varying float vFade;
void main() {
	float delay = aRand.x * 0.42;
	float m = clamp( ( uMix - delay ) / 0.58, 0.0, 1.0 );
	float e = m * m * ( 3.0 - 2.0 * m );
	float arc = sin( 3.14159265 * e );
	vec3 p = mix( position, aTo, e );
	float ang = arc * ( 1.2 + aRand.y * 1.6 );
	float cs = cos( ang );
	float sn = sin( ang );
	p.xz = mat2( cs, - sn, sn, cs ) * p.xz;
	p += ( aRand.yzw - 0.5 ) * 2.2 * arc;
	p += 0.016 * vec3( sin( uTime * 1.3 + aRand.y * 40.0 ), sin( uTime * 1.1 + aRand.z * 40.0 ), sin( uTime * 1.7 + aRand.w * 40.0 ) );
	vec4 mv = modelViewMatrix * vec4( p, 1.0 );
	gl_Position = projectionMatrix * mv;
	float depth = - mv.z;
	float s = uSize * ( 0.62 + aRand.w * 0.76 ) * ( 1.0 + 0.7 * arc );
	gl_PointSize = max( 1.0, s * projectionMatrix[ 1 ][ 1 ] * uViewH * 0.5 / depth );
	vTone = mix( aToneA, aToneB, e );
	vArc = arc;
	vFade = clamp( 1.12 - ( depth - 8.0 ) * 0.1, 0.42, 1.12 ) * ( 0.86 + 0.14 * sin( uTime * 2.0 + aRand.x * 60.0 ) );
}`;
const POINTS_FRAG = `
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uWarm;
uniform float uBright;
varying float vTone;
varying float vArc;
varying float vFade;
void main() {
	float d = length( gl_PointCoord - 0.5 ) * 2.0;
	if ( d > 1.0 ) discard;
	float a = pow( 1.0 - d, 1.7 );
	vec3 c = mix( uC0, uC1, smoothstep( 0.0, 0.45, vTone ) );
	c = mix( c, uC2, smoothstep( 0.35, 0.75, vTone ) );
	c = mix( c, uC3, smoothstep( 0.7, 1.0, vTone ) );
	c = mix( c, uWarm, smoothstep( 1.25, 1.7, vTone ) );
	c = mix( c, uC3, vArc * 0.3 );
	gl_FragColor = vec4( c, a * uBright * vFade );
}`;

/* the stars: tiny fixed points that twinkle a little */
const STARS_VERT = `
uniform float uTime;
uniform float uSize;
uniform float uViewH;
attribute float aSeed;
varying float vTw;
void main() {
	vec4 mv = modelViewMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mv;
	gl_PointSize = max( 1.0, uSize * ( 0.6 + aSeed ) * projectionMatrix[ 1 ][ 1 ] * uViewH * 0.5 / - mv.z );
	vTw = 0.55 + 0.45 * sin( uTime * ( 0.6 + aSeed ) + aSeed * 90.0 );
}`;
const STARS_FRAG = `
uniform vec3 uColor;
varying float vTw;
void main() {
	float d = length( gl_PointCoord - 0.5 ) * 2.0;
	if ( d > 1.0 ) discard;
	gl_FragColor = vec4( uColor, ( 1.0 - d ) * vTw * 0.8 );
}`;

/* the haze behind everything: the night's navy with three soft blobs that drift slowly */
const HAZE_VERT = `
varying vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`;
const HAZE_FRAG = `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform vec3 uBase;
uniform vec3 uRoyal;
uniform vec3 uAzure;
uniform vec3 uCyan;
varying vec2 vUv;
float blob( vec2 p, vec2 c, vec2 s ) {
	vec2 d = ( p - c ) / s;
	return exp( - dot( d, d ) );
}
void main() {
	float asp = uRes.x / uRes.y;
	vec2 p = vec2( vUv.x * asp, vUv.y );
	float t = uTime;
	float wob = 0.78 + 0.34 * sin( p.x * 4.2 + t * 0.07 ) * sin( p.y * 3.6 - t * 0.05 );
	vec3 col = uBase;
	col += uCyan * 0.075 * blob( p, vec2( asp * ( 0.8 + 0.04 * sin( t * 0.05 ) ), 0.84 ), vec2( 0.55 * asp, 0.4 ) ) * wob;
	col += uAzure * 0.1 * blob( p, vec2( asp * 0.2, 0.1 + 0.03 * cos( t * 0.04 ) ), vec2( 0.6 * asp, 0.4 ) ) * wob;
	col += uRoyal * 0.16 * blob( p, vec2( uCenter.x * asp + 0.04 * sin( t * 0.06 ), uCenter.y ), vec2( 0.34 * asp, 0.42 ) ) * wob;
	vec2 q = vUv - 0.5;
	col *= 1.0 - 0.4 * dot( q, q );
	gl_FragColor = vec4( col, 1.0 );
}`;

/* the colour split: red and blue slide apart (and back) around a centre line while a change is under way */
const SPLIT_SHADER = {
	uniforms: { tDiffuse: { value: null }, uAmount: { value: 0 } },
	vertexShader: `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
	fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uAmount;
varying vec2 vUv;
void main() {
	vec2 c = vUv - 0.5;
	vec2 off = ( vec2( 0.4, 0.0 ) + c * 1.7 ) * uAmount;
	vec4 g = texture2D( tDiffuse, vUv );
	float r = texture2D( tDiffuse, vUv + off ).r;
	float b = texture2D( tDiffuse, vUv - off ).b;
	gl_FragColor = vec4( r, g.g, b, g.a );
}`,
};

/* ---------- state ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let baseDPR = 1;
let quality = 0;
let drawN = N;

let renderer;
let scene;
let camera;
let composer;
let bloom;
let split;
let pointsMat;
let hazeMat;
let starsMat;
let points;
let stars;
let geo;
let attrFrom;
let attrTo;
let attrToneA;
let attrToneB;
let rand; // per point: delay, and three random numbers for the swirl and the spray
let shapes = [];
let cur = 0; // the shape the points are at, or flying to
let mix = 1; // how far the flight has got, 0 to 1 (1 = at rest)
let intro = false; // the first flight (out of a scatter) has no colour split
let clock = 0; // seconds of playing time
let idle = 0; // seconds since the last change
let spinDir = 1;
let userYaw = 0;
let userPitch = 0;
let paused = false;
let dirty = true;
let lost = false;
let drag = null;
let swapTimer = 0;
const center = { x: 0, y: 0 };

/* ---------- the flight in script: where each point is now (used when a new change starts mid-flight) ---------- */
function bake() {
	const from = attrFrom.array;
	const to = attrTo.array;
	const tA = attrToneA.array;
	const tB = attrToneB.array;
	for (let i = 0; i < N; i++) {
		const delay = rand[i * 4] * 0.42;
		const m = clamp((mix - delay) / 0.58, 0, 1);
		const e = m * m * (3 - 2 * m);
		const arc = Math.sin(Math.PI * e);
		const ry = rand[i * 4 + 1];
		const rz = rand[i * 4 + 2];
		const rw = rand[i * 4 + 3];
		let x = from[i * 3] + (to[i * 3] - from[i * 3]) * e;
		let y = from[i * 3 + 1] + (to[i * 3 + 1] - from[i * 3 + 1]) * e;
		let z = from[i * 3 + 2] + (to[i * 3 + 2] - from[i * 3 + 2]) * e;
		const ang = arc * (1.2 + ry * 1.6);
		const cs = Math.cos(ang);
		const sn = Math.sin(ang);
		const nx = cs * x + sn * z;
		const nz = -sn * x + cs * z;
		x = nx + (ry - 0.5) * 2.2 * arc;
		y += (rz - 0.5) * 2.2 * arc;
		z = nz + (rw - 0.5) * 2.2 * arc;
		from[i * 3] = x;
		from[i * 3 + 1] = y;
		from[i * 3 + 2] = z;
		tA[i] = tA[i] + (tB[i] - tA[i]) * e;
	}
}

/* ---------- the pieces of the scene ---------- */
function makeScatter(rnd) {
	const pos = new Float32Array(N * 3);
	const tone = new Float32Array(N);
	for (let i = 0; i < N; i++) {
		const u = rnd() * 2 - 1;
		const a = rnd() * TAU;
		const s = Math.sqrt(1 - u * u);
		const r = 3.2 + rnd() * 4.2;
		pos[i * 3] = r * s * Math.cos(a);
		pos[i * 3 + 1] = r * u * 0.8;
		pos[i * 3 + 2] = r * s * Math.sin(a);
		tone[i] = 0.2 + rnd() * 0.6;
	}
	return { pos, tone };
}

function makeStars(rnd) {
	const pos = new Float32Array(N_STARS * 3);
	const seed = new Float32Array(N_STARS);
	for (let i = 0; i < N_STARS; i++) {
		pos[i * 3] = (rnd() * 2 - 1) * 36;
		pos[i * 3 + 1] = (rnd() * 2 - 1) * 22;
		pos[i * 3 + 2] = -4 - rnd() * 32;
		seed[i] = rnd();
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
	return g;
}

function buildScene() {
	const rnd = seeded(2026);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
	camera.position.set(0, 0, CAM_Z);

	const col = (hex) => new THREE.Color(hex);

	/* the haze: one big triangle that covers the view */
	const hg = new THREE.BufferGeometry();
	hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
	hazeMat = new THREE.ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			uRes: { value: new THREE.Vector2(1, 1) },
			uCenter: { value: new THREE.Vector2(0.5, 0.5) },
			uBase: { value: col('#070b16') },
			uRoyal: { value: col('#0a64d6') },
			uAzure: { value: col('#1c80f2') },
			uCyan: { value: col('#46d0fb') },
		},
		vertexShader: HAZE_VERT,
		fragmentShader: HAZE_FRAG,
		depthTest: false,
		depthWrite: false,
	});
	const haze = new THREE.Mesh(hg, hazeMat);
	haze.frustumCulled = false;
	haze.renderOrder = -10;
	scene.add(haze);

	/* the stars */
	starsMat = new THREE.ShaderMaterial({
		uniforms: { uTime: { value: 0 }, uSize: { value: 0.05 }, uViewH: { value: 800 }, uColor: { value: col('#cfe4ff') } },
		vertexShader: STARS_VERT,
		fragmentShader: STARS_FRAG,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	stars = new THREE.Points(makeStars(rnd), starsMat);
	stars.frustumCulled = false;
	stars.renderOrder = -5;
	scene.add(stars);

	/* the cloud of points: `position` is where a point starts, aTo where it ends */
	shapes = buildShapes();
	const scatter = makeScatter(rnd);
	rand = new Float32Array(N * 4);
	for (let i = 0; i < rand.length; i++) rand[i] = rnd();
	geo = new THREE.BufferGeometry();
	attrFrom = new THREE.BufferAttribute(scatter.pos, 3).setUsage(THREE.DynamicDrawUsage);
	attrTo = new THREE.BufferAttribute(new Float32Array(shapes[0].pos), 3).setUsage(THREE.DynamicDrawUsage);
	attrToneA = new THREE.BufferAttribute(scatter.tone, 1).setUsage(THREE.DynamicDrawUsage);
	attrToneB = new THREE.BufferAttribute(new Float32Array(shapes[0].tone), 1).setUsage(THREE.DynamicDrawUsage);
	geo.setAttribute('position', attrFrom);
	geo.setAttribute('aTo', attrTo);
	geo.setAttribute('aToneA', attrToneA);
	geo.setAttribute('aToneB', attrToneB);
	geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
	pointsMat = new THREE.ShaderMaterial({
		uniforms: {
			uMix: { value: 0 },
			uTime: { value: 0 },
			uSize: { value: SIZE },
			uViewH: { value: 800 },
			uBright: { value: PHONE ? 0.7 : 0.62 },
			uC0: { value: col('#1c80f2') },
			uC1: { value: col('#4d9ff3') },
			uC2: { value: col('#46d0fb') },
			uC3: { value: col('#ffffff') },
			uWarm: { value: col('#ffb45a') },
		},
		vertexShader: POINTS_VERT,
		fragmentShader: POINTS_FRAG,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	points = new THREE.Points(geo, pointsMat);
	points.frustumCulled = false;
	points.rotation.order = 'YXZ';
	scene.add(points);
}

function buildComposer() {
	composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.75, 0.5, 0.06);
	composer.addPass(bloom);
	split = new ShaderPass(SPLIT_SHADER);
	split.enabled = false;
	composer.addPass(split);
	composer.addPass(new OutputPass());
}

/* ---------- the size: where the shape may go, and how big ---------- */
function measure() {
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	const cr = canvas.getBoundingClientRect();
	const dr = deck.getBoundingClientRect();
	const ir = info.getBoundingClientRect();
	const top = clamp(dr.bottom - cr.top + 8, 0, H * 0.5);
	const pad = 14;
	/* the fixed panel covers the lower left: put the shape beside it, or above it, whichever lets it be bigger */
	const panelTop = ir.top - cr.top;
	const above = { x0: 0, x1: W, y0: top, y1: panelTop < H - 20 ? Math.max(top + 60, panelTop - 10) : H - pad };
	const beside = { x0: clamp(ir.right - cr.left + 6, 0, W * 0.6), x1: W, y0: top, y1: H - pad };
	const fitK = PHONE ? 0.92 : 0.86;
	const fit = (r) => Math.min(((r.x1 - r.x0) * fitK) / FIT_W, ((r.y1 - r.y0) * fitK) / FIT_H);
	const use = ir.bottom < cr.top || fit(above) >= fit(beside) ? above : beside;
	const ppu = Math.max(20, fit(use)); // pixels per world unit at the middle of the shape
	center.x = (use.x0 + use.x1) / 2;
	center.y = (use.y0 + use.y1) / 2;
	return ppu;
}

function applySize() {
	const ppu = measure();
	if (W < 4 || H < 4) return false;
	renderer.setPixelRatio(DPR);
	renderer.setSize(W, H, false);
	composer.setPixelRatio(DPR);
	composer.setSize(W, H);
	if (PHONE) bloom.setSize(W * DPR * 0.5, H * DPR * 0.5); // half the bloom on a phone
	camera.aspect = W / H;
	camera.zoom = (ppu * 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z) / H;
	camera.setViewOffset(W, H, W / 2 - center.x, H / 2 - center.y, W, H);
	camera.updateProjectionMatrix();
	pointsMat.uniforms.uViewH.value = H * DPR;
	starsMat.uniforms.uViewH.value = H * DPR;
	hazeMat.uniforms.uRes.value.set(W, H);
	hazeMat.uniforms.uCenter.value.set(center.x / W, 1 - center.y / H);
	return true;
}

/* ---------- the change from one shape to the next ---------- */
function setCaption(i) {
	chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
	clearTimeout(swapTimer);
	if (REDUCED) {
		caption.textContent = SHAPES[i].caption;
		return;
	}
	caption.classList.add('is-swap');
	swapTimer = setTimeout(() => {
		caption.textContent = SHAPES[i].caption;
		caption.classList.remove('is-swap');
	}, 170);
}

function loadTarget(i) {
	attrTo.array.set(shapes[i].pos);
	attrToneB.array.set(shapes[i].tone);
	attrTo.needsUpdate = true;
	attrToneB.needsUpdate = true;
}

function morphTo(i, byUser) {
	if (i === cur) return;
	if (REDUCED) {
		/* no flight: the shape is simply there */
		cur = i;
		attrFrom.array.set(shapes[i].pos);
		attrToneA.array.set(shapes[i].tone);
		attrFrom.needsUpdate = true;
		attrToneA.needsUpdate = true;
		loadTarget(i);
		mix = 1;
		setCaption(i);
		renderNow();
		return;
	}
	if (byUser && paused) setPaused(false);
	if (mix >= 1) {
		/* at rest: the old shape becomes the start of the flight */
		attrFrom.array.set(shapes[cur].pos);
		attrToneA.array.set(shapes[cur].tone);
	} else {
		bake();
	}
	attrFrom.needsUpdate = true;
	attrToneA.needsUpdate = true;
	loadTarget(i);
	cur = i;
	mix = 0;
	idle = 0;
	intro = false;
	spinDir = -spinDir;
	setCaption(i);
	dirty = true;
}
const next = (k = 1) => (cur + k + SHAPES.length) % SHAPES.length;

/* ---------- one frame ---------- */
function frame() {
	const swing = Math.sin(Math.PI * clamp(mix, 0, 1)) * 0.6 * spinDir;
	const yaw = (REDUCED ? -0.24 : Math.sin(clock * 0.16) * 0.5) + userYaw + swing;
	const pitch = 0.15 + (REDUCED ? 0 : Math.sin(clock * 0.11 + 1.3) * 0.05) + userPitch;
	points.rotation.y = yaw;
	points.rotation.x = pitch;
	stars.rotation.y = yaw * 0.1;
	stars.rotation.x = pitch * 0.1;
	pointsMat.uniforms.uMix.value = mix;
	pointsMat.uniforms.uTime.value = clock;
	starsMat.uniforms.uTime.value = clock;
	hazeMat.uniforms.uTime.value = clock;
	/* the colour split swells and fades through each change (not in the first gather) */
	const amount = intro || mix >= 1 ? 0 : Math.pow(Math.sin(Math.PI * mix), 1.4) * 0.0085;
	split.uniforms.uAmount.value = amount;
	split.enabled = amount > 0.0003;
	composer.render();
}

function renderNow() {
	if (lost || !composer) return;
	frame();
}

function setPaused(v) {
	paused = v;
	pauseBtn.setAttribute('aria-pressed', String(v));
	pauseBtn.textContent = v ? 'Play' : 'Pause';
	if (!v) dirty = true;
}

/* ---------- a browser without WebGL: a CSS still and a short note ---------- */
function fallback() {
	const poster = document.createElement('div');
	poster.className = 'piece poster';
	poster.setAttribute('role', 'img');
	poster.setAttribute('aria-label', 'A stack of three servers drawn in glowing blue dots on dark navy. A still picture.');
	poster.innerHTML = '<div class="poster__stack" aria-hidden="true"><span class="poster__unit"></span><span class="poster__unit"></span><span class="poster__unit"></span></div>';
	canvas.replaceWith(poster);
	const note = document.createElement('p');
	note.className = 'poster__note glass glass--pill';
	note.textContent = "This browser can't run WebGL, so here is a still picture.";
	screenEl.append(note);
	[morphBtn, pauseBtn, ...chips].forEach((el) => { el.disabled = true; });
}

/* ---------- start ---------- */
function start() {
	/* ask for a throw-away WebGL 2 context first, so a browser without it gets the still, not three.js's console errors */
	const probe = document.createElement('canvas').getContext('webgl2');
	if (!probe) {
		fallback();
		return;
	}
	probe.getExtension('WEBGL_lose_context')?.loseContext();
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
	} catch (err) {
		fallback();
		return;
	}
	baseDPR = Math.min(1.5, window.devicePixelRatio || 1);
	DPR = baseDPR;
	renderer.setClearColor(0x070b16, 1);
	buildScene();
	buildComposer();
	if (!applySize()) {
		/* the window has no size yet: the observer below sets it up when it does */
		W = 800;
		H = 600;
	}

	/* the first picture: under reduced motion the server stack at rest; otherwise the points gather out of a scatter */
	if (REDUCED) {
		attrFrom.array.set(shapes[0].pos);
		attrToneA.array.set(shapes[0].tone);
		attrFrom.needsUpdate = true;
		attrToneA.needsUpdate = true;
		mix = 1;
		setCaption(0);
		renderNow();
		pauseBtn.disabled = true;
		morphBtn.textContent = 'Next shape';
	} else {
		mix = 0;
		intro = true;
	}

	/* the controls */
	chips.forEach((c) => c.addEventListener('click', () => {
		const i = Number(c.dataset.shape);
		if (i === cur) { if (paused) setPaused(false); return; }
		morphTo(i, true);
	}));
	morphBtn.addEventListener('click', () => morphTo(next(), true));
	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

	/* the canvas: a tap morphs, a drag turns, Enter and the arrow keys work too */
	canvas.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		canvas.setPointerCapture(e.pointerId);
		canvas.classList.add('is-grabbing');
		drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false, yaw: userYaw, pitch: userPitch };
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		const dx = e.clientX - drag.sx;
		const dy = e.clientY - drag.sy;
		if (!drag.moved && Math.hypot(dx, dy) > 7) drag.moved = true;
		if (!drag.moved) return;
		userYaw = drag.yaw + dx * 0.0085;
		userPitch = clamp(drag.pitch + dy * 0.006, -0.7, 0.7);
		idle = 0;
		dirty = true;
		if (REDUCED) renderNow();
	});
	const endDrag = (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		const tap = !drag.moved && e.type === 'pointerup' && performance.now() - drag.t < 700;
		drag = null;
		canvas.classList.remove('is-grabbing');
		dirty = true;
		if (tap) morphTo(next(), true);
	};
	canvas.addEventListener('pointerup', endDrag);
	canvas.addEventListener('pointercancel', endDrag);
	canvas.addEventListener('keydown', (e) => {
		const k = { Enter: 1, ' ': 1, ArrowRight: 1, ArrowLeft: -1 }[e.key];
		if (!k) return;
		e.preventDefault();
		morphTo(next(k), true);
	});

	canvas.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		lost = true;
	});
	canvas.addEventListener('webglcontextrestored', () => {
		lost = false;
		dirty = true;
		if (REDUCED) renderNow();
	});

	/* a resize or a fold of the panel: re-measure and keep going */
	let timer = 0;
	let sizedW = 0;
	let sizedH = 0;
	let sizedIR = '';
	const onResize = () => {
		const ir = info.getBoundingClientRect();
		const key = `${Math.round(ir.width)}x${Math.round(ir.height)}`;
		if (canvas.clientWidth === sizedW && canvas.clientHeight === sizedH && key === sizedIR) return;
		if (!applySize()) return;
		sizedW = W;
		sizedH = H;
		sizedIR = key;
		dirty = true;
		if (REDUCED) renderNow();
	};
	const ro = new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(onResize, 100);
	});
	ro.observe(canvas);
	ro.observe(info);
	sizedW = W;
	sizedH = H;
	sizedIR = `${Math.round(info.getBoundingClientRect().width)}x${Math.round(info.getBoundingClientRect().height)}`;

	if (REDUCED) return;

	/* the loop: motion, then the one render. A slow device steps down the pixel ratio and the number of points. */
	let frames = 0;
	const samples = [];
	loop(canvas, (dt) => {
		if (lost) return;
		if (paused && !drag && !dirty) return;
		if (!paused) {
			clock += dt;
			idle += dt;
		}
		if (mix < 1) {
			if (!paused) mix = Math.min(1, mix + dt / MORPH_SECONDS);
			if (mix >= 1) {
				intro = false;
				idle = 0;
			}
		} else if (!paused && !drag && idle > HOLD_SECONDS) {
			morphTo(next(), false);
		}
		if (!drag) {
			userYaw *= Math.exp(-dt * 0.55);
			userPitch *= Math.exp(-dt * 0.7);
		}
		frame();
		dirty = false;

		frames++;
		if (frames > 45 && quality < 2) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.026) {
					quality++;
					DPR = Math.max(1, baseDPR * (quality === 1 ? 0.8 : 0.6));
					drawN = Math.round(N * (quality === 1 ? 0.75 : 0.55));
					geo.setDrawRange(0, drawN);
					applySize();
					dirty = true;
				}
				samples.length = 0;
				frames = 25;
			}
		}
	}, { name: 'shape-shifter' });
}

boot();
try {
	start();
} catch (err) {
	/* anything that goes wrong while setting up WebGL ends in the still picture, not a blank window */
	if (!document.querySelector('.poster')) fallback();
}
