/*
 * Sample 25 — "Tear the Glass Curtain".
 * A frosted-glass cloth hangs in front of a hero message. Drag to pull it (it tears when stretched too far),
 * right-drag, a fast swipe or the Cut mode to slice it, "Tear it open" to part it with a scripted blade, and
 * "Hang again" to put it back. The cloth itself is cloth.js (a small Verlet simulation); this file draws it
 * on a Canvas 2D layer (pleats, thread weave, a curtain rail), reads the pointer, and drives the controls.
 * A light breeze moves it when nobody touches it. The Verlet step runs inside loop() from js/lab.js, so it
 * stops off-screen, in a hidden tab and under reduced motion (then the curtain is drawn once, already parted).
 *
 * Idea: a Verlet cloth pinned along its top row that tears when stretched, as in the "Tearable Cloth" demo
 * (CodePen pen ALMBPg by Kudriavaya, after Suffick's demo). Written from the idea only; no source code was
 * read or copied. The frosted look, pleats, controls and everything else here are new.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { Cloth } from './cloth.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero__body');
const tearBtn = document.querySelector('[data-action="tear"]');
const cutBtn = document.querySelector('[data-action="cut"]');
const hangBtn = document.querySelector('[data-action="hang"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const reduced = prefersReducedMotion();

const STEP = 1 / 60;
const TRAIL_LIFE = 0.45;

let W = 0;
let H = 0;
let DPR = 1;
let cloth = null;
let pleats = { valley: [], crest: [] }; // the columns of the cloth the soft folds hang from
let acc = 0;
let paused = false;
let cutMode = false;
let blade = null; // the scripted blade of "Tear it open"
let drag = null; // the pointer holding or slicing the cloth
const trail = []; // the blade's recent strokes, for the light it leaves

/* the cloth's colours: shade (pale blue) → mid → near-white → white, in DS v9's sky and glass blues */
const BUCKETS = 15;
const STOPS = [
	[0, [178, 208, 244]],
	[0.5, [212, 231, 251]],
	[0.82, [242, 249, 255]],
	[1, [255, 255, 255]],
];
const PALETTE = Array.from({ length: BUCKETS + 1 }, (_, b) => {
	const v = b / BUCKETS;
	let k = 1;
	while (k < STOPS.length - 1 && STOPS[k][0] < v) k++;
	const [v0, c0] = STOPS[k - 1];
	const [v1, c1] = STOPS[k];
	const f = (v - v0) / (v1 - v0);
	return `rgb(${c0.map((c, n) => Math.round(c + (c1[n] - c) * f)).join(',')})`;
});

function resize() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* a grid of points a little wider than the canvas (so the breeze never shows an edge) and a little longer
   (so the hem hangs out of sight); fewer, larger cells on a phone */
function build() {
	const phone = W < 560;
	const sp = phone ? 26 : 24;
	const cols = Math.ceil(W / sp) + 5;
	const rows = Math.ceil((H * 1.03 + 20) / sp) + 1;
	cloth = new Cloth({
		cols,
		rows,
		sx: sp,
		sy: sp,
		left: -((cols - 1) * sp - W) / 2,
		top: 8,
		iterations: phone ? 5 : 6,
		tear: 1.8,
		breeze: reduced ? 0 : phone ? 0.004 : 0.007,
	});
	// pleats about 120 px apart, a little uneven so the folds don't look machined
	const period = Math.max(3, Math.round(120 / sp));
	pleats = { valley: [], crest: [] };
	for (let k = 0; ; k++) {
		const v = k * period + 1 + Math.round(0.8 * Math.sin(k * 1.7));
		if (v > cols - 3) break;
		pleats.valley.push(v);
		const c = v + Math.round(period / 2);
		if (c <= cols - 3) pleats.crest.push(c);
	}
	cloth.run(reduced ? 60 : 140);
}

/* ---------- drawing ---------- */

/* a cell with all four threads is a quad; one that lost a thread or two still hangs from the rest as a quad
   (three threads) or a corner triangle (two that meet), which is what gives a torn edge its ragged diagonals */
const TRI = [null, [0, 1, 2], [1, 0, 3], [2, 3, 0], [3, 2, 1]]; // corner kinds: top-left, top-right, bottom-left, bottom-right

function draw() {
	ctx.clearRect(0, 0, W, H);
	const { x, y, cols, rows, sx, sy, alive } = cloth;
	const rowSpan = rows - 1;

	// the cells: lit by how the folds lean and squeeze, by tension, and a little by height
	let n = 0;
	const list = cellList(cols, rows);
	for (let j = 0; j < rowSpan; j++) {
		for (let i = 0; i < cols - 1; i++) {
			const t = alive[cloth.hId(i, j)];
			const b2 = alive[cloth.hId(i, j + 1)];
			const l = alive[cloth.vId(i, j)];
			const r = alive[cloth.vId(i + 1, j)];
			const count = t + b2 + l + r;
			let kind = 0;
			if (count < 2) continue;
			if (count === 2) {
				if (t && l) kind = 1;
				else if (t && r) kind = 2;
				else if (b2 && l) kind = 3;
				else if (b2 && r) kind = 4;
				else continue;
			}
			const a = j * cols + i;
			const c = a + cols + 1;
			if ((x[a] < -40 && x[c] < -40) || (x[a] > W + 40 && x[c] > W + 40) || y[a] > H + 40) continue;
			const wx = (x[a + 1] - x[a] + x[c] - x[a + cols]) / (2 * sx);
			const lean = (x[a + cols] - x[a] + x[c] - x[a + 1]) / (2 * sy);
			const area = ((x[c] - x[a]) * (y[a + cols] - y[a + 1]) - (x[a + cols] - x[a + 1]) * (y[c] - y[a])) / (2 * sx * sy);
			const fold = Math.min(0.7, Math.max(0, 1 - wx));
			let v = 0.97 - 0.17 * (j / rowSpan) - fold * 0.5 + Math.max(-0.3, Math.min(0.3, lean)) * 0.5 - Math.max(0, area - 1.2) * 0.3;
			v = Math.min(1, Math.max(0, v));
			list[n++] = ((Math.round(v * BUCKETS) << 27) | (kind << 24) | a) >>> 0;
		}
	}
	// one path and one fill per colour. Each cell is grown a little from its centre, so neighbours overlap
	// instead of leaving a hairline seam (a stroke along every edge cost far more than it was worth)
	const GROW = 1.07;
	for (let k = 0; k <= BUCKETS; k++) {
		let any = false;
		ctx.beginPath();
		for (let m = 0; m < n; m++) {
			const e = list[m];
			if (e >>> 27 !== k) continue;
			const kind = (e >>> 24) & 7;
			const a = e & 0xffffff;
			any = true;
			if (kind === 0) {
				const b = a + 1;
				const d = a + cols;
				const c = d + 1;
				const mx = (x[a] + x[b] + x[c] + x[d]) * 0.25;
				const my = (y[a] + y[b] + y[c] + y[d]) * 0.25;
				ctx.moveTo(mx + (x[a] - mx) * GROW, my + (y[a] - my) * GROW);
				ctx.lineTo(mx + (x[b] - mx) * GROW, my + (y[b] - my) * GROW);
				ctx.lineTo(mx + (x[c] - mx) * GROW, my + (y[c] - my) * GROW);
				ctx.lineTo(mx + (x[d] - mx) * GROW, my + (y[d] - my) * GROW);
			} else {
				// the corner point first, then its two neighbours (the third side is a diagonal, not a thread)
				const o = TRI[kind];
				const p0 = a + (o[0] & 1) + (o[0] >> 1) * cols;
				const p1 = a + (o[1] & 1) + (o[1] >> 1) * cols;
				const p2 = a + (o[2] & 1) + (o[2] >> 1) * cols;
				const mx = (x[p0] + x[p1] + x[p2]) / 3;
				const my = (y[p0] + y[p1] + y[p2]) / 3;
				ctx.moveTo(mx + (x[p0] - mx) * GROW, my + (y[p0] - my) * GROW);
				ctx.lineTo(mx + (x[p1] - mx) * GROW, my + (y[p1] - my) * GROW);
				ctx.lineTo(mx + (x[p2] - mx) * GROW, my + (y[p2] - my) * GROW);
			}
			ctx.closePath();
		}
		if (!any) continue;
		ctx.fillStyle = PALETTE[k];
		ctx.fill();
	}

	// light on top of the cloth only (source-atop paints where the cloth already is): soft pleats that hang
	// from fixed columns of the cloth, so they sway and squeeze with it, and a fixed light that slides over them
	ctx.globalCompositeOperation = 'source-atop';
	drawPleats();
	const light = ctx.createLinearGradient(0, 0, W, H * 0.7);
	light.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
	light.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
	light.addColorStop(0.62, 'rgba(255, 255, 255, 0.3)');
	light.addColorStop(0.78, 'rgba(255, 255, 255, 0)');
	ctx.fillStyle = light;
	ctx.fillRect(0, 0, W, H);
	const depth = ctx.createLinearGradient(0, 0, 0, H);
	depth.addColorStop(0, 'rgba(77, 159, 243, 0)');
	depth.addColorStop(1, 'rgba(77, 159, 243, 0.16)');
	ctx.fillStyle = depth;
	ctx.fillRect(0, 0, W, H);
	ctx.globalCompositeOperation = 'source-over';

	// the threads: a faint weave, so a torn edge frays instead of ending clean
	ctx.beginPath();
	const { A, B, nc } = cloth;
	for (let c = 0; c < nc; c++) {
		if (!alive[c]) continue;
		const a = A[c];
		const b = B[c];
		if (y[a] > H + 30 && y[b] > H + 30) continue;
		ctx.moveTo(x[a], y[a]);
		ctx.lineTo(x[b], y[b]);
	}
	ctx.lineWidth = 0.8;
	ctx.strokeStyle = 'rgba(94, 128, 174, 0.14)';
	ctx.stroke();

	drawRail();
	drawBlade();
}

/* soft ribbons down chosen columns of the cloth: shade in the valleys, white on the crests */
const VALLEY = [
	[64, 0.045, [120, 170, 235]],
	[40, 0.06, [110, 165, 235]],
	[22, 0.08, [100, 160, 235]],
];
const CREST = [
	[40, 0.22, [255, 255, 255]],
	[22, 0.3, [255, 255, 255]],
	[9, 0.42, [255, 255, 255]],
];
function drawPleats() {
	const { cols, rows, x, y, alive } = cloth;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const todo = [...pleats.valley.map((i) => [i, VALLEY]), ...pleats.crest.map((i) => [i, CREST])];
	for (const [i, set] of todo) {
		for (const [w, a, rgb] of set) {
			ctx.beginPath();
			let pen = false;
			for (let j = 0; j < rows; j++) {
				const p = j * cols + i;
				if (y[p] > H + 30) break;
				if (pen && !alive[cloth.vId(i, j - 1)]) pen = false;
				if (pen) ctx.lineTo(x[p], y[p]);
				else ctx.moveTo(x[p], y[p]);
				pen = true;
			}
			ctx.lineWidth = w;
			ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
			ctx.stroke();
		}
	}
}

let listBuf = null;
function cellList(cols, rows) {
	const need = (cols - 1) * (rows - 1);
	if (!listBuf || listBuf.length < need) listBuf = new Uint32Array(need);
	return listBuf;
}

/* the curtain rail: a pale bar with its blue shadow, and a few rings the cloth hangs from */
function drawRail() {
	const g = ctx.createLinearGradient(0, 0, 0, 15);
	g.addColorStop(0, '#ffffff');
	g.addColorStop(1, '#c4dcf6');
	const sh = ctx.createLinearGradient(0, 15, 0, 34);
	sh.addColorStop(0, 'rgba(22, 66, 140, 0.2)');
	sh.addColorStop(1, 'rgba(22, 66, 140, 0)');
	ctx.fillStyle = sh;
	ctx.fillRect(0, 15, W, 19);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, W, 15);
	ctx.fillStyle = 'rgba(94, 128, 174, 0.45)';
	ctx.fillRect(0, 14.5, W, 1);
	const { x, cols } = cloth;
	ctx.lineWidth = 1.4;
	ctx.strokeStyle = 'rgba(86, 116, 168, 0.75)';
	ctx.fillStyle = '#f6fbff';
	for (let i = 0; i < cols; i += 3) {
		if (x[i] < -6 || x[i] > W + 6) continue;
		ctx.beginPath();
		ctx.arc(x[i], 17, 3.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

/* the blade: a thin royal-blue line with a cyan glow that fades, and a spark at the tip of the scripted one */
function drawBlade() {
	ctx.lineCap = 'round';
	for (const s of trail) {
		const a = Math.max(0, 1 - s.age / TRAIL_LIFE);
		ctx.beginPath();
		ctx.moveTo(s.x1, s.y1);
		ctx.lineTo(s.x2, s.y2);
		ctx.lineWidth = 7;
		ctx.strokeStyle = `rgba(70, 208, 251, ${0.28 * a})`;
		ctx.stroke();
		ctx.lineWidth = 1.8;
		ctx.strokeStyle = `rgba(5, 95, 233, ${0.9 * a})`;
		ctx.stroke();
	}
	if (blade) {
		const g = ctx.createRadialGradient(blade.x, blade.y, 0, blade.x, blade.y, 18);
		g.addColorStop(0, 'rgba(255, 255, 255, 1)');
		g.addColorStop(0.3, 'rgba(70, 208, 251, 0.75)');
		g.addColorStop(1, 'rgba(70, 208, 251, 0)');
		ctx.fillStyle = g;
		ctx.fillRect(blade.x - 18, blade.y - 18, 36, 36);
	}
}

function slash(x1, y1, x2, y2) {
	if (Math.hypot(x2 - x1, y2 - y1) < 0.5) return;
	cloth.cut(x1, y1, x2, y2);
	trail.push({ x1, y1, x2, y2, age: 0 });
}

/* ---------- the scripted blade: opens the curtain like a pair of drapes, in one sweep ---------- */

/* The cut runs up the left of the message, over its top in a rounded arch, and down the right: the panel
   in between falls away and the two sides stay hanging from the rail. The edge wanders a little so it looks
   torn rather than ruled. `stubs` are the last stretches below the window, cut before the blade starts. */
function openingPath() {
	const r = hero.getBoundingClientRect();
	const c = canvas.getBoundingClientRect();
	const cx = r.left + r.width / 2 - c.left;
	const N_EXP = 3.5;
	const grow = Math.pow(2, 1 / N_EXP);
	// wide enough to clear the message, never wider than the cloth has side drapes to hang from
	const rx = Math.min(grow * (r.width / 2 + 30), W * (W < 560 ? 0.47 : 0.36));
	const ry = Math.min(grow * (r.height / 2 + 26), H * 0.4);
	const cy = Math.max(r.top + r.height / 2 - c.top, ry * 1.08 + 56);
	const wy = (y) => 1 + 0.05 * Math.sin(y * 0.021 + 0.7) + 0.03 * Math.sin(y * 0.047 + 2.1);
	const wth = (th) => 1 + 0.05 * Math.sin(th * 5 + 0.7) + 0.03 * Math.sin(th * 11 + 2.1);
	const y0 = H + 8;
	const hem = cloth.top + cloth.rows * cloth.sy + 30;
	const pts = [];
	for (let y = y0; y > cy; y -= 24) pts.push([cx - rx * wy(y), y]);
	const N = 64;
	for (let k = 0; k <= N; k++) {
		const th = -Math.PI + (k / N) * Math.PI;
		const co = Math.cos(th);
		const si = Math.sin(th);
		const w = wth(th);
		pts.push([cx + Math.sign(co) * Math.pow(Math.abs(co), 2 / N_EXP) * rx * w, cy + Math.sign(si) * Math.pow(Math.abs(si), 2 / N_EXP) * ry * w]);
	}
	for (let y = cy + 24; y < y0 + 24; y += 24) pts.push([cx + rx * wy(y), y]);
	const stubs = [
		[pts[0][0], pts[0][1], pts[0][0], hem],
		[pts[pts.length - 1][0], pts[pts.length - 1][1], pts[pts.length - 1][0], hem],
	];
	return { pts, stubs };
}
const along = (pts, s) => {
	const i = Math.min(pts.length - 2, Math.floor(s));
	const f = s - i;
	return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
};
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
const BLADE_TIME = 1.3;

function startBlade() {
	if (blade || paused) return;
	endDrag();
	const { pts, stubs } = openingPath();
	for (const [x1, y1, x2, y2] of stubs) cloth.cut(x1, y1, x2, y2);
	blade = { pts, t: 0, s: 0, x: pts[0][0], y: pts[0][1] };
	tearBtn.disabled = true;
}

function stepBlade(dt) {
	if (!blade) return;
	blade.t += dt;
	const s = ease(Math.min(1, blade.t / BLADE_TIME)) * (blade.pts.length - 1);
	const [nx, ny] = along(blade.pts, s);
	// follow the path point by point so a curve is cut, not a chord
	for (let q = Math.floor(blade.s) + 1; q <= Math.floor(s); q++) {
		slash(blade.x, blade.y, blade.pts[q][0], blade.pts[q][1]);
		blade.x = blade.pts[q][0];
		blade.y = blade.pts[q][1];
	}
	slash(blade.x, blade.y, nx, ny);
	blade.x = nx;
	blade.y = ny;
	blade.s = s;
	if (blade.t >= BLADE_TIME) {
		blade = null;
		tearBtn.disabled = paused;
	}
}

/* ---------- the pointer ---------- */

const GRAB = () => (W < 560 ? 40 : 46);

function local(ev) {
	const r = canvas.getBoundingClientRect();
	return [ev.clientX - r.left, ev.clientY - r.top];
}

function endDrag() {
	if (drag && canvas.hasPointerCapture?.(drag.id)) canvas.releasePointerCapture(drag.id);
	if (cloth) cloth.release();
	drag = null;
	canvas.classList.remove('is-drag');
}

function beginSlice() {
	drag.mode = 'cut';
	cloth.release();
	canvas.classList.remove('is-drag');
	canvas.classList.add('is-cut');
}

function begin(ev, slice) {
	ev.preventDefault();
	try { canvas.setPointerCapture(ev.pointerId); } catch { /* a pointer that is already gone */ }
	const [px, py] = local(ev);
	drag = { id: ev.pointerId, mode: slice ? 'cut' : 'pull', touch: ev.pointerType !== 'mouse', t0: performance.now(), path: [[px, py]], len: 0, lx: px, ly: py };
	if (slice) canvas.classList.add('is-cut');
	else {
		cloth.grab(px, py, GRAB());
		canvas.classList.add('is-drag');
	}
}
const free = () => !(reduced || paused || drag || blade);

canvas.addEventListener('pointerdown', (ev) => {
	if (!free() || ev.button > 2 || !ev.isPrimary) return;
	begin(ev, ev.button === 2 || cutMode);
});

canvas.addEventListener('pointermove', (ev) => {
	// some browsers send no pointerdown for the right button: a move with it held starts the slice
	if (!drag && ev.buttons === 2 && ev.pointerType === 'mouse' && ev.isPrimary && free()) begin(ev, true);
	if (!drag || ev.pointerId !== drag.id) return;
	const fine = ev.getCoalescedEvents?.();
	for (const e of fine && fine.length ? fine : [ev]) {
		const [px, py] = local(e);
		if (drag.mode === 'pull') {
			cloth.setTarget(px, py);
			// on a touch screen there is no right button: a swipe that starts fast is a slice
			drag.len += Math.hypot(px - drag.lx, py - drag.ly);
			drag.path.push([px, py]);
			if (drag.touch && performance.now() - drag.t0 < 160 && drag.len > 110) {
				beginSlice();
				for (let q = 1; q < drag.path.length; q++) slash(drag.path[q - 1][0], drag.path[q - 1][1], drag.path[q][0], drag.path[q][1]);
			}
		} else {
			slash(drag.lx, drag.ly, px, py);
		}
		drag.lx = px;
		drag.ly = py;
	}
});

for (const type of ['pointerup', 'pointercancel']) {
	canvas.addEventListener(type, (ev) => {
		if (!drag || ev.pointerId !== drag.id) return;
		endDrag();
		canvas.classList.toggle('is-cut', cutMode);
	});
}
canvas.addEventListener('lostpointercapture', () => { if (drag) { cloth.release(); drag = null; canvas.classList.remove('is-drag'); canvas.classList.toggle('is-cut', cutMode); } });
canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());

/* ---------- the controls ---------- */

function setCut(on) {
	cutMode = on;
	cutBtn.setAttribute('aria-pressed', String(on));
	canvas.classList.toggle('is-cut', on);
}

function hangAgain() {
	endDrag();
	blade = null;
	trail.length = 0;
	cloth.reset(reduced ? 0 : 1.6);
	tearBtn.disabled = paused;
	if (reduced) { cloth.run(60); draw(); } else if (paused) draw();
}

/* the end state, for reduced motion: cut the opening, let the panel fall */
function partedStill() {
	cloth.reset(0);
	const { pts, stubs } = openingPath();
	for (const [x1, y1, x2, y2] of stubs) cloth.cut(x1, y1, x2, y2);
	for (let q = 1; q < pts.length; q++) cloth.cut(pts[q - 1][0], pts[q - 1][1], pts[q][0], pts[q][1]);
	cloth.run(320);
	draw();
}

/* a flap already torn, so the idea reads at a glance: a short ragged slit in from the right edge, below the
   message; the cloth under it sags and curls away. Hang again mends it. */
function tornFlap() {
	const phone = W < 560; // on a phone the panel covers the lower half, so the flap sits higher
	const x0 = W + 6;
	const y0 = H * (phone ? 0.3 : 0.5);
	const x1 = W * (phone ? 0.62 : 0.8);
	const y1 = H * (phone ? 0.45 : 0.7);
	const N = 9;
	let px = x0;
	let py = y0;
	for (let q = 1; q <= N; q++) {
		const u = q / N;
		const nx = x0 + (x1 - x0) * u + Math.sin(q * 2.3) * 7;
		const ny = y0 + (y1 - y0) * u + Math.cos(q * 1.7) * 7;
		cloth.cut(px, py, nx, ny);
		px = nx;
		py = ny;
	}
}

/* ---------- start ---------- */

function frame(dt) {
	acc += dt;
	let n = 0;
	while (acc >= STEP && n < 3) {
		cloth.step();
		acc -= STEP;
		n++;
	}
	if (n === 3) acc = 0;
	stepBlade(dt);
	for (let k = trail.length - 1; k >= 0; k--) {
		trail[k].age += dt;
		if (trail[k].age > TRAIL_LIFE) trail.splice(k, 1);
	}
	draw();
}

function start() {
	resize();
	build();
	boot();

	if (reduced) {
		// the curtain is already parted: one still frame, nothing running
		partedStill();
		document.fonts?.ready.then(partedStill); // the message may reflow once Nunito Sans is in
		cutBtn.disabled = true;
		pauseBtn.disabled = true;
		tearBtn.addEventListener('click', () => { partedStill(); });
		hangBtn.addEventListener('click', hangAgain);
		let timer = 0;
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => { resize(); build(); partedStill(); }, 150);
		});
		return;
	}

	tornFlap();
	draw();
	const ctl = loop(canvas, (dt) => frame(dt), { name: 'tear-the-curtain' });

	tearBtn.addEventListener('click', startBlade);
	hangBtn.addEventListener('click', hangAgain);
	cutBtn.addEventListener('click', () => setCut(!cutMode));
	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		tearBtn.disabled = paused || !!blade;
		cutBtn.disabled = paused;
		canvas.classList.toggle('is-paused', paused);
		if (paused) {
			endDrag();
			ctl.stop();
		} else ctl.start();
	});

	// a new size is a new curtain: the grid is made for the window it hangs in
	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (canvas.clientWidth === W && canvas.clientHeight === H) return;
			endDrag();
			blade = null;
			resize();
			build();
			tornFlap();
			if (paused) draw();
		}, 150);
	});
}

start();
