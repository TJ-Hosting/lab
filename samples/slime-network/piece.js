/*
 * Sample 10 — "Slime Network".
 * A slime-mould (Physarum) simulation in Canvas 2D. About 15,000 agents (about 6,000 on a phone) live on a
 * small trail map (about 320 x 200 cells). Each step an agent sniffs the map at three points just ahead,
 * turns toward the strongest scent, moves one cell and leaves trail behind; then the whole map is blurred a
 * little and faded. What you see is the map, not the agents: its values pick a colour (navy and royal at the
 * edge of a vein, then azure, cyan light and white at its core) and the small image is scaled up smoothly onto
 * the canvas with a soft halo. A few food spots add scent to the map, pulse and slowly drift, so the veins
 * keep finding new routes; pressing and dragging drops more food. If the network ever dies away it reseeds.
 *
 * Written from the idea only; no source code was read or copied. (Agents that sense three points ahead, turn
 * toward the strongest trail and deposit on a diffusing, decaying map are the published Physarum model of
 * Jeff Jones, "Characteristics of pattern formation and evolution in approximations of Physarum transport
 * networks", Artificial Life 16(2), 2010. The code here is new.)
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');
const foodBtn = document.querySelector('[data-action="food"]');
const reseedBtn = document.querySelector('[data-action="reseed"]');
const agentsEl = document.querySelector('[data-agents]');
const foodEl = document.querySelector('[data-food]');

const REDUCED = prefersReducedMotion();
const TAU = Math.PI * 2;

/* ---------- the model (distances in map cells) ---------- */
const STEP_RATE = 80; // simulation steps per second
const MAX_STEPS = 3; // per frame
const SENSE_DIST = 5;
const SENSE_ANGLE = 0.4; // about 23 degrees
const TURN = 0.3; // about 17 degrees
const WOBBLE = 0.1; // a little noise in the heading
const SPEED = 1;
const DEPOSIT = 0.1;
const CLAMP = 1; // the most trail an agent can build up in a cell
const EVAP = 0.02; // trail lost each step, flat
const DIFFUSE = 0.06; // how far each step moves a cell toward its 3 x 3 average
const DECAY = 0.99; // what is left of the trail after a step
const FOOD_DEPOSIT = 0.8; // scent a food spot adds each step at its centre
const FOOD_RADIUS = 5;
const FOOD_MAX = 3;
const DENSITY = 0.235; // agents per cell
const MAX_AGENTS = 15000;
const MIN_AGENTS = 3000;
const CELL_PX = 3.9; // a cell's size on a wide screen; 3 px on a phone
const GLOW_BLOCK = 4; // the halo is the map averaged in 4 x 4 blocks
const STILL_STEPS = 480; // the reduced-motion still is this many steps grown
const WARM_STEPS = 140; // a head start so the first frame already shows veins
const COLLAPSE_COVER = 0.012; // the share of cells above the vein level below which the network counts as dead
const COLLAPSE_TIME = 3; // seconds of that before it reseeds
const VEIN = 0.35; // a cell above this is a vein, for the coverage count

/* ---------- state ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let gw = 0;
let gh = 0;
let sx = 1; // canvas px per cell, across
let sy = 1; // ... and down
let trail = null;
let trailB = null;
let tmp = null;
let ax = null;
let ay = null;
let aa = null;
let target = 0; // agents the screen is sized for
let n = 0; // agents alive (adaptive: may drop on a slow machine)
let simT = 0;
let coverage = 0;
let lowFor = 0;
let intro = 1;
let spots = [];
let held = null;
let acc = 0;
let costEma = 0;
let costFrames = 0;

/* the small images: the map as colour, and its halo */
const gridCanvas = document.createElement('canvas');
const gridCtx = gridCanvas.getContext('2d');
const glowCanvas = document.createElement('canvas');
const glowCtx = glowCanvas.getContext('2d');
let gridImg = null;
let grid32 = null;
let glowImg = null;
let glow32 = null;
let gbw = 0;
let gbh = 0;

/* small xorshift PRNG: the first picture and the reduced-motion still are the same on every visit */
let rs = 2463534242;
const rnd = () => {
	rs ^= rs << 13;
	rs ^= rs >>> 17;
	rs ^= rs << 5;
	return (rs >>> 0) / 4294967296;
};
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* ---------- colour: the trail value picks one of 1024 colours ---------- */

const LUT_N = 1024;
const VMAX = 1.5;
/* v, r, g, b, a: a navy-royal edge, azure, cyan light, then white-hot at the core of a vein */
const VEIN_STOPS = [
	[0.0, 8, 40, 130, 0],
	[0.04, 12, 78, 200, 50],
	[0.14, 22, 112, 236, 140],
	[0.38, 77, 159, 243, 225],
	[0.7, 70, 208, 251, 255],
	[1.0, 196, 242, 255, 255],
	[1.5, 255, 255, 255, 255],
];
const HALO_STOPS = [
	[0.0, 20, 110, 235, 0],
	[0.06, 24, 120, 238, 30],
	[0.25, 46, 160, 248, 92],
	[0.6, 70, 208, 251, 150],
	[1.0, 150, 232, 255, 190],
	[1.5, 230, 250, 255, 230],
];
function makeLut(stops) {
	const lut = new Uint32Array(LUT_N);
	const bytes = new Uint8Array(lut.buffer);
	for (let q = 0; q < LUT_N; q++) {
		const v = (q / (LUT_N - 1)) * VMAX;
		let s = 1;
		while (s < stops.length - 1 && v > stops[s][0]) s++;
		const a = stops[s - 1];
		const b = stops[s];
		const f = clamp((v - a[0]) / (b[0] - a[0]), 0, 1);
		const e = f * f * (3 - 2 * f);
		for (let c = 0; c < 4; c++) bytes[q * 4 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * e;
	}
	return lut;
}
const VEIN_LUT = makeLut(VEIN_STOPS);
const HALO_LUT = makeLut(HALO_STOPS);
const LUT_SCALE = (LUT_N - 1) / VMAX;

/* the food spot's glow: a white core, cyan light, then nothing */
const spotSprite = document.createElement('canvas');
spotSprite.width = 128;
spotSprite.height = 128;
{
	const g = spotSprite.getContext('2d');
	const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
	grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
	grad.addColorStop(0.2, 'rgba(230, 250, 255, 0.96)');
	grad.addColorStop(0.36, 'rgba(70, 208, 251, 0.55)');
	grad.addColorStop(0.68, 'rgba(34, 140, 244, 0.15)');
	grad.addColorStop(1, 'rgba(12, 100, 236, 0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, 128, 128);
}

/* ---------- the world ---------- */

function build() {
	DPR = Math.min(1.5, window.devicePixelRatio || 1);
	W = canvas.clientWidth || 800;
	H = canvas.clientHeight || 500;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

	const cell = W < 700 ? 3 : Math.max(CELL_PX, W / 320);
	gw = Math.max(48, Math.round(W / cell));
	gh = Math.max(48, Math.round(H / cell));
	sx = W / gw;
	sy = H / gh;

	const cells = gw * gh;
	trail = new Float32Array(cells);
	trailB = new Float32Array(cells);
	tmp = new Float32Array(cells);
	target = clamp(Math.round(cells * DENSITY), MIN_AGENTS, MAX_AGENTS);
	ax = new Float32Array(target);
	ay = new Float32Array(target);
	aa = new Float32Array(target);

	gridCanvas.width = gw;
	gridCanvas.height = gh;
	gridImg = gridCtx.createImageData(gw, gh);
	grid32 = new Uint32Array(gridImg.data.buffer);
	gbw = Math.ceil(gw / GLOW_BLOCK);
	gbh = Math.ceil(gh / GLOW_BLOCK);
	glowCanvas.width = gbw;
	glowCanvas.height = gbh;
	glowImg = glowCtx.createImageData(gbw, gbh);
	glow32 = new Uint32Array(glowImg.data.buffer);
}

/* agents spread over the whole map, each facing a random way */
function seedAgents() {
	n = target;
	for (let i = 0; i < n; i++) {
		ax[i] = rnd() * gw;
		ay[i] = rnd() * gh;
		aa[i] = rnd() * TAU;
	}
}

/* the food spots: placed far from one another, each drifting on its own slow path */
function placeSpots() {
	const count = W < 700 ? 5 : 7;
	const margin = 12;
	const placed = [];
	for (let i = 0; i < count; i++) {
		let best = null;
		let bestD = -1;
		for (let k = 0; k < 14; k++) {
			const px = margin + rnd() * (gw - 2 * margin);
			const py = margin + rnd() * (gh - 2 * margin);
			let d = 1e9;
			for (const q of placed) d = Math.min(d, Math.hypot(px - q.cx, py - q.cy));
			if (d > bestD) { bestD = d; best = [px, py]; }
		}
		const amp = Math.min(gw, gh) * (0.1 + rnd() * 0.09);
		placed.push({
			user: false,
			cx: best[0],
			cy: best[1],
			ampX: amp * (0.9 + rnd() * 0.5),
			ampY: amp * (0.8 + rnd() * 0.4),
			wx: TAU / (48 + rnd() * 46),
			wy: TAU / (52 + rnd() * 50),
			phx: rnd() * TAU,
			phy: rnd() * TAU,
			pulseW: TAU / (3.6 + rnd() * 2.6),
			pulsePh: rnd() * TAU,
			x: best[0],
			y: best[1],
			grow: 1,
			fade: 1,
			dying: false,
		});
	}
	spots = placed;
	moveSpots(0);
}

function moveSpots(dt) {
	const m = 7;
	for (const s of spots) {
		if (s.user) {
			if (s.dying) s.fade = Math.max(0, s.fade - dt / 3);
			else if (s !== held) {
				s.age += dt;
				if (s.age > 26) s.dying = true;
			}
			if (s.grow < 1) s.grow = Math.min(1, s.grow + dt / 0.6);
			continue;
		}
		s.x = clamp(s.cx + Math.sin(simT * s.wx + s.phx) * s.ampX, m, gw - m);
		s.y = clamp(s.cy + Math.sin(simT * s.wy + s.phy) * s.ampY, m, gh - m);
	}
	if (spots.some((s) => s.user && s.fade <= 0)) spots = spots.filter((s) => !(s.user && s.fade <= 0));
}

function spotPulse(s) {
	return 0.5 + 0.5 * Math.sin(simT * s.pulseW + s.pulsePh);
}

function addFood(x, y) {
	const live = spots.filter((s) => s.user && !s.dying);
	if (live.length >= 5) live[0].dying = true;
	const s = {
		user: true,
		x: clamp(x, 4, gw - 4),
		y: clamp(y, 4, gh - 4),
		age: 0,
		pulseW: TAU / (3.4 + rnd() * 1.6),
		pulsePh: rnd() * TAU,
		grow: 0,
		fade: 1,
		dying: false,
	};
	spots.push(s);
	syncCounts();
	return s;
}

/* ---------- one step ---------- */

/* the map wraps round at its edges, so no vein piles up along a border */
function stepAgents() {
	const cSA = Math.cos(SENSE_ANGLE);
	const sSA = Math.sin(SENSE_ANGLE);
	const w = gw;
	const h = gh;
	const t = trail;
	for (let i = 0; i < n; i++) {
		let x = ax[i];
		let y = ay[i];
		let a = aa[i];
		const ca = Math.cos(a);
		const sa = Math.sin(a);
		// three sensors: ahead, to the left and to the right (the heading turned by plus or minus the sense angle)
		let px = x + ca * SENSE_DIST;
		let py = y + sa * SENSE_DIST;
		if (px < 0) px += w; else if (px >= w) px -= w;
		if (py < 0) py += h; else if (py >= h) py -= h;
		const F = t[(py | 0) * w + (px | 0)];
		px = x + (ca * cSA + sa * sSA) * SENSE_DIST;
		py = y + (sa * cSA - ca * sSA) * SENSE_DIST;
		if (px < 0) px += w; else if (px >= w) px -= w;
		if (py < 0) py += h; else if (py >= h) py -= h;
		const L = t[(py | 0) * w + (px | 0)];
		px = x + (ca * cSA - sa * sSA) * SENSE_DIST;
		py = y + (sa * cSA + ca * sSA) * SENSE_DIST;
		if (px < 0) px += w; else if (px >= w) px -= w;
		if (py < 0) py += h; else if (py >= h) py -= h;
		const R = t[(py | 0) * w + (px | 0)];
		if (F > L && F > R) {
			// the scent is strongest ahead: carry on
		} else if (F < L && F < R) {
			a += rnd() < 0.5 ? -TURN : TURN;
		} else if (L < R) {
			a += TURN;
		} else if (R < L) {
			a -= TURN;
		}
		a += (rnd() - 0.5) * WOBBLE;
		x += Math.cos(a) * SPEED;
		y += Math.sin(a) * SPEED;
		if (x < 0) x += w; else if (x >= w) x -= w;
		if (y < 0) y += h; else if (y >= h) y -= h;
		ax[i] = x;
		ay[i] = y;
		aa[i] = a;
		const k = (y | 0) * w + (x | 0);
		const v = t[k] + DEPOSIT;
		t[k] = v > CLAMP ? CLAMP : v;
	}
}

function feedSpots() {
	for (const s of spots) {
		const k = FOOD_DEPOSIT * (0.55 + 0.45 * spotPulse(s)) * s.grow * s.fade;
		if (k <= 0.001) continue;
		const x0 = Math.max(0, Math.floor(s.x - FOOD_RADIUS));
		const x1 = Math.min(gw - 1, Math.ceil(s.x + FOOD_RADIUS));
		const y0 = Math.max(0, Math.floor(s.y - FOOD_RADIUS));
		const y1 = Math.min(gh - 1, Math.ceil(s.y + FOOD_RADIUS));
		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const d = Math.hypot(x + 0.5 - s.x, y + 0.5 - s.y) / FOOD_RADIUS;
				if (d < 1) {
					const f = 1 - d;
					const v = trail[y * gw + x] + k * f * f;
					trail[y * gw + x] = v > FOOD_MAX ? FOOD_MAX : v;
				}
			}
		}
	}
}

/* blur the map a little (a 3 x 3 average in two passes, wrapping), fade it, and count the cells that are veins */
function diffuse() {
	const w = gw;
	const h = gh;
	const t = trail;
	for (let y = 0; y < h; y++) {
		const row = y * w;
		tmp[row] = (t[row + w - 1] + t[row] + t[row + 1]) / 3;
		for (let x = 1; x < w - 1; x++) tmp[row + x] = (t[row + x - 1] + t[row + x] + t[row + x + 1]) / 3;
		tmp[row + w - 1] = (t[row + w - 2] + t[row + w - 1] + t[row]) / 3;
	}
	const out = trailB;
	let veins = 0;
	for (let y = 0; y < h; y++) {
		const up = (y > 0 ? y - 1 : h - 1) * w;
		const mid = y * w;
		const dn = (y < h - 1 ? y + 1 : 0) * w;
		for (let x = 0; x < w; x++) {
			const blur = (tmp[up + x] + tmp[mid + x] + tmp[dn + x]) / 3;
			let v = (t[mid + x] + (blur - t[mid + x]) * DIFFUSE - EVAP) * DECAY;
			if (v < 0) v = 0;
			out[mid + x] = v;
			if (v > VEIN) veins++;
		}
	}
	trailB = t;
	trail = out;
	coverage = veins / (w * h);
}

function simulate(steps) {
	for (let s = 0; s < steps; s++) {
		simT += 1 / STEP_RATE;
		moveSpots(1 / STEP_RATE);
		stepAgents();
		feedSpots();
		diffuse();
	}
}

/* ---------- drawing ---------- */

function draw() {
	// the map as colour
	const t = trail;
	const total = gw * gh;
	for (let i = 0; i < total; i++) {
		let q = (t[i] * LUT_SCALE) | 0;
		if (q > LUT_N - 1) q = LUT_N - 1;
		grid32[i] = VEIN_LUT[q];
	}
	gridCtx.putImageData(gridImg, 0, 0);

	// its halo: the map averaged in blocks
	const B = GLOW_BLOCK;
	for (let by = 0; by < gbh; by++) {
		const y0 = by * B;
		const y1 = Math.min(gh, y0 + B);
		for (let bx = 0; bx < gbw; bx++) {
			const x0 = bx * B;
			const x1 = Math.min(gw, x0 + B);
			let sum = 0;
			for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) sum += t[y * gw + x];
			let q = ((sum / ((x1 - x0) * (y1 - y0))) * LUT_SCALE) | 0;
			if (q > LUT_N - 1) q = LUT_N - 1;
			glow32[by * gbw + bx] = HALO_LUT[q];
		}
	}
	glowCtx.putImageData(glowImg, 0, 0);

	ctx.clearRect(0, 0, W, H);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.globalAlpha = intro;
	ctx.globalCompositeOperation = 'lighter';
	ctx.drawImage(glowCanvas, 0, 0, gbw * B * sx, gbh * B * sy);
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(gridCanvas, 0, 0, W, H);

	// the food spots: a soft glow that breathes with the scent they give off, and a ring that spreads at each pulse
	ctx.globalCompositeOperation = 'lighter';
	ctx.strokeStyle = 'rgb(120, 220, 255)';
	ctx.lineWidth = 1.5;
	for (const s of spots) {
		const p = spotPulse(s);
		const life = (0.35 + 0.65 * s.grow) * (0.4 + 0.6 * s.fade);
		const r = (FOOD_RADIUS * 1.45 + p * 4.5) * sx * life;
		ctx.globalAlpha = (0.38 + 0.62 * p) * s.fade;
		ctx.drawImage(spotSprite, s.x * sx - r, s.y * sy - r, r * 2, r * 2);
		const q = ((((simT * s.pulseW + s.pulsePh) / TAU) % 1) + 1) % 1;
		const a = (1 - q) * (1 - q) * 0.5 * s.fade * s.grow;
		if (a > 0.01) {
			ctx.globalAlpha = a;
			ctx.beginPath();
			ctx.arc(s.x * sx, s.y * sy, (FOOD_RADIUS * 0.9 + q * FOOD_RADIUS * 3) * sx, 0, TAU);
			ctx.stroke();
		}
	}
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
}

/* ---------- life cycle ---------- */

function fmt(v) {
	return String(v).replace(/\B(?=(\d{3})+$)/g, ',');
}
let shownAgents = -1;
let shownFood = -1;
function syncCounts() {
	if (n !== shownAgents) { shownAgents = n; agentsEl.textContent = fmt(n); }
	let food = 0;
	for (const s of spots) if (!s.dying) food++;
	if (food !== shownFood) { shownFood = food; foodEl.textContent = String(food); }
}

/* a fresh network: an empty map and agents spread everywhere (the first one, and a reseed after the old one died) */
function restart(seed) {
	if (seed) rs = seed >>> 0 || 1;
	trail.fill(0);
	trailB.fill(0);
	simT = 0;
	acc = 0;
	lowFor = 0;
	held = null;
	seedAgents();
	placeSpots();
	syncCounts();
}

function stillFrame(seed) {
	restart(seed);
	simulate(STILL_STEPS);
	intro = 1;
	draw();
	syncCounts();
}

function start() {
	build();

	if (REDUCED) {
		stillFrame(2463534242);
		pauseBtn.disabled = true;
		foodBtn.disabled = true;
		reseedBtn.addEventListener('click', () => stillFrame((Math.random() * 4294967295) | 0));
		let rt = 0;
		addEventListener('resize', () => {
			clearTimeout(rt);
			rt = setTimeout(() => { build(); stillFrame(2463534242); }, 150);
		});
		return;
	}

	restart(2463534242);
	simulate(WARM_STEPS);
	draw();
	syncCounts();

	const ctl = loop(canvas, (dt) => {
		const t0 = performance.now();
		moveHeld();
		acc += dt * STEP_RATE;
		const steps = Math.min(MAX_STEPS, Math.floor(acc));
		acc -= Math.floor(acc);
		if (steps > 0) {
			simulate(steps);
			if (intro < 1) intro = Math.min(1, intro + dt / 0.9);
			// a network that has died away starts again
			lowFor = coverage < COLLAPSE_COVER ? lowFor + dt : 0;
			if (lowFor > COLLAPSE_TIME) {
				restart(0);
				intro = 0;
			}
			draw();
		}
		// a slow machine gets fewer agents rather than a slow page (judged after a warm-up, on a running average)
		costEma += ((performance.now() - t0) - costEma) * 0.06;
		if (++costFrames > 150 && costEma > 12 && n > MIN_AGENTS) {
			n = Math.max(MIN_AGENTS, Math.floor(n * 0.85));
			costFrames = 60;
			costEma = 9;
		}
		syncCounts();
	}, { name: 'slime-network' });

	/* pointer: press and drag to drop food (it stays, pulsing, for a while after you let go) */
	let pointerXY = null;
	const toCells = (e) => {
		const r = canvas.getBoundingClientRect();
		return [((e.clientX - r.left) / r.width) * gw, ((e.clientY - r.top) / r.height) * gh];
	};
	function moveHeld() {
		if (held && pointerXY) {
			held.x = clamp(pointerXY[0], 4, gw - 4);
			held.y = clamp(pointerXY[1], 4, gh - 4);
		}
	}
	// while paused nothing steps, so a change is drawn straight away
	const redraw = () => {
		if (ctl.running) return;
		for (const s of spots) if (s.grow < 1) s.grow = 1;
		draw();
	};
	canvas.addEventListener('pointerdown', (e) => {
		if (e.button > 0) return;
		pointerXY = toCells(e);
		held = addFood(pointerXY[0], pointerXY[1]);
		canvas.setPointerCapture?.(e.pointerId);
		redraw();
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!held) return;
		pointerXY = toCells(e);
		moveHeld();
		redraw();
	});
	const release = () => {
		if (held) held.age = 0;
		held = null;
		pointerXY = null;
	};
	canvas.addEventListener('pointerup', release);
	canvas.addEventListener('pointercancel', release);
	canvas.addEventListener('lostpointercapture', release);

	foodBtn.addEventListener('click', () => {
		const x = gw * (0.18 + rnd() * 0.64);
		const y = gh * (0.18 + rnd() * 0.64);
		addFood(x, y);
		redraw();
	});
	reseedBtn.addEventListener('click', () => {
		restart((performance.now() * 1000) | 0);
		simulate(24);
		intro = 0;
		if (!ctl.running) { intro = 1; draw(); }
	});

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			build();
			restart(2463534242);
			simulate(WARM_STEPS);
			intro = 1;
			draw();
			syncCounts();
		}, 150);
	});

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
