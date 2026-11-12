/*
 * Sample 12 — "Breathing Contour Map".
 * A topographic map on a day-sky screen. A height field is made from 3D simplex noise (two axes of the map plus
 * time, noise.js) sampled on a coarse grid. Each frame the heights are cut into 16 levels: a low-resolution image
 * paints the bands (alternate bands in a frosted-glass tint) and marching squares walks the grid, drawing a line
 * wherever the height crosses a level, with a bolder index line every fifth level. The noise drifts slowly in time
 * so the land breathes. Your pointer raises a gentle hill; hands-free, a ghost pointer wanders and does the same.
 * New map pans and rushes the noise to a different land. Reduced motion: one map, drawn once.
 *
 * Written from the idea only; no source code was read or copied.
 * (The CodePen this idea comes from, "Perlin Noise Contour lines generator" by masty, refuses scripted downloads
 * from this machine, so nothing of it was read; the noise, the marching squares and the painting are new code.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { makeLand } from './noise.js';

const canvas = document.querySelector('.piece');
const grainCanvas = document.querySelector('.grain');
const ctx = canvas.getContext('2d', { alpha: false });
const pauseBtn = document.querySelector('[data-action="pause"]');
const newBtn = document.querySelector('[data-action="new"]');
const strip = document.querySelector('[data-key-strip]');

const REDUCED = prefersReducedMotion();

/* ---------- tuning ---------- */
const LEVELS = 16; // the height field is measured in levels, so band k runs from k to k + 1
const INDEX_EVERY = 5; // a bolder line every fifth level
const Z_RATE = 0.045; // how fast the noise drifts in time (noise units per second): the map's breathing
const SPREAD = 0.75; // how far the noise stretches over the 16 levels (about 2.4 sigma either way)
const HILL_USER = 4.6; // the pointer's hill, in levels high
const HILL_GHOST = 3.4; // the ghost's hill
const IDLE_AFTER = 3.5; // seconds without a pointer before the ghost takes over
const SEED = 7;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (e0, e1, v) => {
	const t = clamp((v - e0) / (e1 - e0), 0, 1);
	return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

/* ---------- colour: pale sky blues for the bands, navy and royal for the lines ---------- */

/* the ramp from the lowest ground to the highest, as r, g, b */
const RAMP = [
	[0.0, 249, 253, 255],
	[0.5, 207, 232, 251],
	[1.0, 150, 197, 243],
];
function ramp(t) {
	t = clamp(t, 0, 1);
	let s = 1;
	while (s < RAMP.length - 1 && t > RAMP[s][0]) s++;
	const a = RAMP[s - 1];
	const b = RAMP[s];
	const f = (t - a[0]) / (b[0] - a[0]);
	return [mix(a[1], b[1], f), mix(a[2], b[2], f), mix(a[3], b[3], f)];
}

/* the colour at height f (in levels): a soft gradient up the ramp, with every other band lifted toward white like
   frosted glass, a bright lip on its lower edge, and the plain bands shading slightly toward their top edge */
function bandColour(f) {
	const k = Math.floor(f);
	const along = f - k;
	let [r, g, b] = ramp(f / LEVELS);
	if ((k & 1) === 1) {
		const lip = 0.1 * (1 - smooth(0, 0.2, along));
		const w = 0.4 + lip;
		r = mix(r, 255, w);
		g = mix(g, 255, w);
		b = mix(b, 255, w);
	} else {
		const dim = 0.05 * smooth(0.55, 1, along);
		r *= 1 - dim;
		g *= 1 - dim * 0.8;
		b *= 1 - dim * 0.3;
	}
	return [r, g, b];
}

/* a lookup table over heights from -1 to LEVELS + 1, packed as little-endian RGBA */
const LUT_N = 2048;
const LUT_SCALE = LUT_N / (LEVELS + 2);
const LUT = new Uint32Array(LUT_N);
(function buildLut() {
	for (let q = 0; q < LUT_N; q++) {
		const [r, g, b] = bandColour((q + 0.5) / LUT_SCALE - 1);
		LUT[q] = (255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r);
	}
})();

const LINE = 'rgba(14, 70, 176, 0.62)'; // royal navy
const LINE_HI = 'rgba(14, 70, 176, 0.85)'; // the same, a little stronger, where lines are drawn half as wide
const LINE_INDEX = 'rgba(8, 34, 108, 0.92)'; // deep navy

/* ---------- the map ---------- */
const land = makeLand(SEED);
let W = 0;
let H = 0;
let DPR = 1;
let phone = false;
let CELL = 8; // grid spacing, px
let K = 5; // band-image pixels per grid cell, along each axis (so a band-image pixel is 2 px)
let cols = 0;
let rows = 0; // grid nodes
let F = new Float32Array(0); // the height at each node, in levels
let S = 280; // px per noise unit
let SIGMA = 120; // the hill's radius, px
const bandCanvas = document.createElement('canvas');
const bandCtx = bandCanvas.getContext('2d');
let bandImg = null;
let band32 = null;

/* the state that moves */
let zBase = 2.1; // the noise's time axis
let zJump = 0; // New map: rushes the time axis ...
let zJumpTo = 0;
let panX = 0; // ... and pans the map sideways
let panXTo = 0;
let hillX = 0;
let hillY = 0;
let hillAmp = 0;
let ptr = { x: 0, y: 0, on: false, last: -99 };

function layout() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
	grainCanvas.width = Math.round(W * DPR);
	grainCanvas.height = Math.round(H * DPR);
	phone = W < 560;
	// a coarser grid on a phone, and on a very large window
	CELL = Math.max(phone ? 12 : 10, Math.ceil(Math.sqrt((W * H) / 10000) / 2) * 2);
	K = CELL / 2;
	cols = Math.ceil(W / CELL) + 1;
	rows = Math.ceil(H / CELL) + 1;
	F = new Float32Array(cols * rows);
	bandCanvas.width = (cols - 1) * K;
	bandCanvas.height = (rows - 1) * K;
	bandImg = bandCtx.createImageData(bandCanvas.width, bandCanvas.height);
	band32 = new Uint32Array(bandImg.data.buffer);
	S = clamp(0.33 * Math.sqrt(W * H), 150, 360);
	SIGMA = clamp(0.17 * Math.min(W, H), 55, 130);
	paintGrain();
}

/* a fine static grain over the whole map: specks of white and navy, drawn once */
function paintGrain() {
	const g = grainCanvas.getContext('2d');
	const tile = document.createElement('canvas');
	tile.width = 160;
	tile.height = 160;
	const tctx = tile.getContext('2d');
	const img = tctx.createImageData(160, 160);
	let seed = 5;
	const rnd = () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
	for (let i = 0; i < 160 * 160; i++) {
		const a = rnd() * rnd() * 20;
		const white = rnd() < 0.5;
		img.data[i * 4] = white ? 255 : 16;
		img.data[i * 4 + 1] = white ? 255 : 48;
		img.data[i * 4 + 2] = white ? 255 : 110;
		img.data[i * 4 + 3] = a;
	}
	tctx.putImageData(img, 0, 0);
	g.fillStyle = g.createPattern(tile, 'repeat');
	g.fillRect(0, 0, grainCanvas.width, grainCanvas.height);
}

/* ---------- the height field ---------- */

function computeField() {
	const z = zBase + zJump;
	const inv = 1 / S;
	const ox = 11.3 + panX;
	const oy = 4.7;
	for (let j = 0; j < rows; j++) {
		const y = oy + j * CELL * inv;
		const row = j * cols;
		for (let i = 0; i < cols; i++) {
			F[row + i] = LEVELS * (0.5 + SPREAD * land(ox + i * CELL * inv, y, z));
		}
	}
	// the hill: a soft bump, added only to the nodes near it
	if (hillAmp > 0.01) {
		const reach = SIGMA * 3;
		const i0 = Math.max(0, Math.floor((hillX - reach) / CELL));
		const i1 = Math.min(cols - 1, Math.ceil((hillX + reach) / CELL));
		const j0 = Math.max(0, Math.floor((hillY - reach) / CELL));
		const j1 = Math.min(rows - 1, Math.ceil((hillY + reach) / CELL));
		const k = -1 / (2 * SIGMA * SIGMA);
		for (let j = j0; j <= j1; j++) {
			const dy = j * CELL - hillY;
			for (let i = i0; i <= i1; i++) {
				const dx = i * CELL - hillX;
				F[j * cols + i] += hillAmp * Math.exp((dx * dx + dy * dy) * k);
			}
		}
	}
}

/* ---------- painting ---------- */

/* the bands: every band-image pixel takes the height bilinearly from the four nodes round it, then a colour */
function paintBands() {
	const cw = cols - 1;
	const bw = bandCanvas.width;
	for (let cj = 0; cj < rows - 1; cj++) {
		const r0 = cj * cols;
		const r1 = r0 + cols;
		for (let ci = 0; ci < cw; ci++) {
			const a = F[r0 + ci];
			const b = F[r0 + ci + 1];
			const d = F[r1 + ci];
			const c = F[r1 + ci + 1];
			for (let sy = 0; sy < K; sy++) {
				const fy = (sy + 0.5) / K;
				const left = a + (d - a) * fy;
				const step = ((b + (c - b) * fy) - left) / K;
				let f = left + step * 0.5;
				let o = (cj * K + sy) * bw + ci * K;
				for (let sx = 0; sx < K; sx++) {
					let q = ((f + 1) * LUT_SCALE) | 0;
					q = q < 0 ? 0 : q >= LUT_N ? LUT_N - 1 : q;
					band32[o++] = LUT[q];
					f += step;
				}
			}
		}
	}
	bandCtx.putImageData(bandImg, 0, 0);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'low';
	ctx.drawImage(bandCanvas, 0, 0, bandCanvas.width * CELL / K, bandCanvas.height * CELL / K);
}

/* the lines: marching squares. For each whole level, a cell's four corners make a 4-bit case (which corners are at or
   above the level) and the line is a segment between two of the cell's edges, placed along each edge by linear
   interpolation; the two saddle cases are settled by the centre's height. Segments that meet on a shared grid
   edge are then walked into long polylines (open lines and closed loops), which a canvas strokes far faster
   than thousands of separate little segments. */
let segCap = 0;
let sx1; let sy1; let sx2; let sy2; // a segment's two ends
let se1; let se2; // ... and the grid edges they lie on (2 * node + 0 for a horizontal edge, + 1 for a vertical one)
let seen; // per segment: already drawn
let link = new Int32Array(0); // per grid edge, the (up to) two segments that end on it, for the level being traced
let cmin = new Float32Array(0);
let cmax = new Float32Array(0);
let segN = 0;
let segTotal = 0;

function ensureTraceBuffers() {
	const cells = (cols - 1) * (rows - 1);
	if (segCap < cells * 2) {
		segCap = cells * 2;
		sx1 = new Float32Array(segCap); sy1 = new Float32Array(segCap);
		sx2 = new Float32Array(segCap); sy2 = new Float32Array(segCap);
		se1 = new Int32Array(segCap); se2 = new Int32Array(segCap);
		seen = new Uint8Array(segCap);
	}
	if (link.length !== cols * rows * 4) link = new Int32Array(cols * rows * 4).fill(-1);
	if (cmin.length !== cells) { cmin = new Float32Array(cells); cmax = new Float32Array(cells); }
}

function addSeg(xa, ya, ea, xb, yb, eb) {
	const n = segN++;
	sx1[n] = xa; sy1[n] = ya; se1[n] = ea;
	sx2[n] = xb; sy2[n] = yb; se2[n] = eb;
	// remember it on both of its grid edges
	let q = ea * 2;
	if (link[q] < 0) link[q] = n; else link[q + 1] = n;
	q = eb * 2;
	if (link[q] < 0) link[q] = n; else link[q + 1] = n;
}

/* the segment on the far side of grid edge e from segment s, or -1 */
function across(e, s) {
	const q = e * 2;
	const a = link[q];
	return a === s ? link[q + 1] : a;
}

function traceLines() {
	const thin = new Path2D();
	const bold = new Path2D();
	segTotal = 0;
	ensureTraceBuffers();
	const C = CELL;
	const cw = cols - 1;
	let kMin = Infinity;
	let kMax = -Infinity;
	for (let j = 0; j < rows - 1; j++) {
		const r0 = j * cols;
		const r1 = r0 + cols;
		for (let i = 0; i < cw; i++) {
			const a = F[r0 + i];
			const b = F[r0 + i + 1];
			const c = F[r1 + i + 1];
			const d = F[r1 + i];
			const lo = Math.min(a, b, c, d);
			const hi = Math.max(a, b, c, d);
			cmin[j * cw + i] = lo;
			cmax[j * cw + i] = hi;
			if (lo < kMin) kMin = lo;
			if (hi > kMax) kMax = hi;
		}
	}
	for (let k = Math.floor(kMin) + 1; k <= Math.floor(kMax); k++) {
		const path = k % INDEX_EVERY === 0 ? bold : thin;
		segN = 0;
		for (let j = 0; j < rows - 1; j++) {
			const r0 = j * cols;
			const r1 = r0 + cols;
			const y0 = j * C;
			const y1 = y0 + C;
			for (let i = 0; i < cw; i++) {
				const m = j * cw + i;
				if (cmin[m] >= k || cmax[m] < k) continue; // this cell is wholly above or wholly below the level
				const a = F[r0 + i]; // top left
				const b = F[r0 + i + 1]; // top right
				const c = F[r1 + i + 1]; // bottom right
				const d = F[r1 + i]; // bottom left
				const ha = a >= k;
				const hb = b >= k;
				const hc = c >= k;
				const hd = d >= k;
				const cs = (ha ? 8 : 0) | (hb ? 4 : 0) | (hc ? 2 : 0) | (hd ? 1 : 0);
				const x0 = i * C;
				const x1 = x0 + C;
				// where the line crosses each edge (found only on edges whose two corners differ), and that edge's id
				let tx = 0; let rx = 0; let bx = 0; let ly = 0;
				const eT = 2 * (j * cols + i);
				const eB = eT + 2 * cols;
				const eL = eT + 1;
				const eR = eT + 3;
				if (ha !== hb) tx = x0 + ((k - a) / (b - a)) * C;
				if (hb !== hc) rx = y0 + ((k - b) / (c - b)) * C;
				if (hd !== hc) bx = x0 + ((k - d) / (c - d)) * C;
				if (ha !== hd) ly = y0 + ((k - a) / (d - a)) * C;
				switch (cs) {
					case 1: case 14: addSeg(x0, ly, eL, bx, y1, eB); break; // L-B
					case 2: case 13: addSeg(bx, y1, eB, x1, rx, eR); break; // B-R
					case 3: case 12: addSeg(x0, ly, eL, x1, rx, eR); break; // L-R
					case 4: case 11: addSeg(tx, y0, eT, x1, rx, eR); break; // T-R
					case 6: case 9: addSeg(tx, y0, eT, bx, y1, eB); break; // T-B
					case 7: case 8: addSeg(tx, y0, eT, x0, ly, eL); break; // T-L
					case 5: case 10: {
						// 5: b and d above; 10: a and c above. A high centre joins the two corners that are above.
						const high = (a + b + c + d) * 0.25 >= k;
						if (cs === 5 ? !high : high) { addSeg(tx, y0, eT, x0, ly, eL); addSeg(bx, y1, eB, x1, rx, eR); } // T-L and B-R
						else { addSeg(tx, y0, eT, x1, rx, eR); addSeg(x0, ly, eL, bx, y1, eB); } // T-R and L-B
						break;
					}
					default: break;
				}
			}
		}
		segTotal += segN;
		// walk the segments into polylines
		seen.fill(0, 0, segN);
		for (let s = 0; s < segN; s++) {
			if (seen[s]) continue;
			// back up to the start of this line, or all the way round if it is a loop
			let cur = s;
			let edge = se1[s];
			let loop_ = false;
			for (;;) {
				const o = across(edge, cur);
				if (o < 0) break;
				if (o === s) { loop_ = true; break; }
				edge = se1[o] === edge ? se2[o] : se1[o];
				cur = o;
			}
			// then walk forward from there, rounding the corners: each vertex becomes the control point of a curve
			// that ends halfway to the next one, so the coarse grid still draws smooth lines
			let px = se1[cur] === edge ? sx1[cur] : sx2[cur];
			let py = se1[cur] === edge ? sy1[cur] : sy2[cur];
			path.moveTo(px, py);
			let first = true;
			for (;;) {
				seen[cur] = 1;
				const to = se1[cur] === edge ? se2[cur] : se1[cur];
				const vx = to === se1[cur] ? sx1[cur] : sx2[cur];
				const vy = to === se1[cur] ? sy1[cur] : sy2[cur];
				if (first) path.lineTo((px + vx) * 0.5, (py + vy) * 0.5);
				else path.quadraticCurveTo(px, py, (px + vx) * 0.5, (py + vy) * 0.5);
				first = false;
				px = vx;
				py = vy;
				const nxt = across(to, cur);
				if (nxt < 0 || seen[nxt]) break;
				cur = nxt;
				edge = to;
			}
			path.lineTo(px, py);
			if (loop_) path.closePath();
		}
		// clear the edge table for the next level
		for (let n = 0; n < segN; n++) {
			link[se1[n] * 2] = -1; link[se1[n] * 2 + 1] = -1;
			link[se2[n] * 2] = -1; link[se2[n] * 2 + 1] = -1;
		}
	}
	return { thin, bold };
}

function strokeLines({ thin, bold }) {
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	// thin lines stay about one device pixel wide (the canvas's fast hairline path), whatever the pixel ratio
	ctx.strokeStyle = DPR > 1 ? LINE_HI : LINE;
	ctx.lineWidth = DPR > 1 ? 1 / DPR : 0.95;
	ctx.stroke(thin);
	ctx.strokeStyle = LINE_INDEX;
	ctx.lineWidth = DPR > 1 ? 1.5 : 1.9;
	ctx.stroke(bold);
}

/* how long a frame's drawing takes, smoothed: on a slow machine the map redraws every other frame (the drift is slow
   enough that 30 Hz looks the same), so it never holds the page up */
let cost = 0;
let skip = false;
function render() {
	const t0 = performance.now();
	computeField();
	paintBands();
	strokeLines(traceLines());
	cost += (performance.now() - t0 - cost) * 0.1;
}

/* ---------- the hill: your pointer, or a ghost ---------- */

function ghostAt(t) {
	if (phone) {
		// the info panel covers the lower half of a phone: the ghost stays in the upper part
		return [W * (0.5 + 0.32 * Math.sin(t * 0.13 + 1.1) + 0.1 * Math.sin(t * 0.31)), H * (0.3 + 0.15 * Math.sin(t * 0.097 + 0.4) + 0.05 * Math.sin(t * 0.23 + 2))];
	}
	return [W * (0.5 + 0.3 * Math.sin(t * 0.13 + 1.1) + 0.1 * Math.sin(t * 0.31)), H * (0.5 + 0.26 * Math.sin(t * 0.097 + 0.4) + 0.08 * Math.sin(t * 0.23 + 2))];
}

function step(dt, t) {
	zBase += dt * Z_RATE;
	const ease = 1 - Math.exp(-dt * 2.4);
	zJump += (zJumpTo - zJump) * ease;
	panX += (panXTo - panX) * ease;

	const user = ptr.on || t - ptr.last < IDLE_AFTER;
	let tx;
	let ty;
	let amp;
	if (user) {
		tx = ptr.x;
		ty = ptr.y;
		amp = ptr.on ? HILL_USER : 0;
	} else {
		[tx, ty] = ghostAt(t);
		amp = HILL_GHOST;
	}
	const follow = 1 - Math.exp(-dt * (user ? 9 : 2.5));
	hillX += (tx - hillX) * follow;
	hillY += (ty - hillY) * follow;
	hillAmp += (amp - hillAmp) * (1 - Math.exp(-dt * 2.2));
}

/* the reduced-motion still: a finished map, a gentle hill at rest, drawn once */
function stillFrame() {
	[hillX, hillY] = phone ? [W * 0.66, H * 0.3] : [W * 0.68, H * 0.38];
	hillAmp = HILL_GHOST;
	render();
}

/* ---------- pointer ---------- */

function toCanvas(ev) {
	const r = canvas.getBoundingClientRect();
	return [ev.clientX - r.left, ev.clientY - r.top];
}
canvas.addEventListener('pointermove', (ev) => {
	if (REDUCED) return;
	[ptr.x, ptr.y] = toCanvas(ev);
	ptr.on = true;
	ptr.last = performance.now() / 1000;
});
canvas.addEventListener('pointerdown', (ev) => {
	if (REDUCED) return;
	[ptr.x, ptr.y] = toCanvas(ev);
	ptr.on = true;
	ptr.last = performance.now() / 1000;
});
const release = () => {
	ptr.on = false;
	ptr.last = performance.now() / 1000;
};
canvas.addEventListener('pointerleave', release);
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

/* ---------- the key: one swatch per band ---------- */
function buildKey() {
	if (!strip) return;
	for (let k = 0; k < LEVELS; k++) {
		const [r, g, b] = bandColour(k + 0.5);
		const sw = document.createElement('span');
		sw.style.background = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
		if (k > 0 && k % INDEX_EVERY === 0) sw.className = 'is-index';
		strip.append(sw);
	}
}

/* ---------- start ---------- */

function newMap() {
	zJumpTo += 2.6;
	panXTo += 1.7;
}

function start() {
	layout();
	buildKey();
	if (REDUCED) {
		stillFrame();
		pauseBtn.disabled = true;
		newBtn.addEventListener('click', () => {
			zBase += 2.6; // jump straight to another land
			panX += 1.7;
			panXTo = panX;
			stillFrame();
		});
		addEventListener('resize', () => { layout(); stillFrame(); });
		return;
	}
	const ctl = loop(canvas, (dt, t) => {
		step(dt, t);
		skip = cost > 10 && !skip; // a slow machine: every other frame
		if (!skip) render();
	}, { name: 'contour-map' });
	// draw straight away, so there is a map even before the first frame
	hillX = W * 0.5;
	hillY = H * 0.4;
	render();

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => { layout(); render(); }, 150);
	});

	newBtn.addEventListener('click', newMap);
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
