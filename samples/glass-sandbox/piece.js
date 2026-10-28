/*
 * Sample 52 — "Glass Sandbox".
 * A falling-sand toy. sim.js holds the world (a typed-array grid of about 30 000 cells, eight elements and a few
 * rules each); scene.js builds the opening picture. This file draws the grid to a canvas in whole-pixel cells,
 * each one lit as a small glass bead (a 1 px highlight and a touch of shade), with a soft cyan glow added around
 * plasma, sparks and hot glass, runs the loop, takes your brush, and plays a
 * scripted auto-pour (plasma, sand, water, ink, spark, plasma) until you draw; when the box fills up it wipes clean,
 * sets the opening scene up again and starts over. The grid is shaped round the shell: a stone shelf is built
 * under the info panel so the sand piles where you can see it. Reduced motion: the opening scene is settled and
 * drawn once (with a frozen thread of falling sand), and each stroke you make jumps straight to its end state.
 *
 * Written from the idea only; no source code was read or copied.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { createWorld, E, SAND, WATER, OIL, FIRE, PLANT, ICE, LAVA, GLASS, WALL, STEAM, STONE } from './sim.js';
import { buildScene, sceneSpots } from './scene.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const info = document.querySelector('.sample-info');
const dock = document.querySelector('[data-dock]');
const readout = document.querySelector('[data-readout]');
const readoutText = readout.querySelector('[data-readout-text]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const clearBtn = document.querySelector('[data-action="clear"]');
const saveBtn = document.querySelector('[data-action="save"]');

const REDUCED = prefersReducedMotion();
const RATE = 90; // simulation steps per second, at the old 5 px cell; cellScale keeps the same speed on the finer grid
const CELLS = 48000; // the grid aims for about this many cells; never finer than 3.2 px, so a phone gets a smaller grid
const MAX_STEPS = 4; // per frame
const GB = 5; // glow block: cells per glow pixel
const STILL_STEPS = 420;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* ---------- colours: all DS v9 blues. Sand runs from pale ice to sky, water is azure, ink and coral are navy and royal,
   spark and plasma are cyan light going to white, ice and glass are white-cyan. No warm colour anywhere. ---------- */

const abgr = (r, g, b, al = 255) => (((al & 255) << 24) | ((clamp(b, 0, 255) & 255) << 16) | ((clamp(g, 0, 255) & 255) << 8) | (clamp(r, 0, 255) & 255)) >>> 0;
const lerp = (p, q, f) => p + (q - p) * f;
/* n shades from colour c0 to colour c1 */
function ramp(c0, c1, n = 8, al = 255) {
	const out = new Uint32Array(n);
	for (let k = 0; k < n; k++) {
		const f = n > 1 ? k / (n - 1) : 0;
		out[k] = abgr(Math.round(lerp(c0[0], c1[0], f)), Math.round(lerp(c0[1], c1[1], f)), Math.round(lerp(c0[2], c1[2], f)), al);
	}
	return out;
}
/* sand: four bands from pale ice (#e6f3fe) to sky (#9fd0fb), each with 16 quiet shades per grain and a rare glint */
const SAND_BASE = [[230, 243, 254], [207, 232, 253], [183, 220, 252], [159, 208, 251]];
const SAND_PAL = new Uint32Array(64);
SAND_BASE.forEach((c, b) => {
	for (let k = 0; k < 16; k++) {
		const d = k === 15 ? 14 : (k - 7) * 1.5; // the last shade is a glint
		SAND_PAL[b * 16 + k] = abgr(Math.round(c[0] + d), Math.round(c[1] + d), Math.round(c[2] + d * 0.5));
	}
});
const WATER_PAL = ramp([48, 148, 246], [76, 178, 254]); // azure, about #3da1fc
const WATER_TOP = ramp([128, 206, 255], [176, 230, 255], 4);
const INK_PAL = ramp([28, 58, 160], [46, 86, 204]); // royal and navy
const INK_TOP = ramp([96, 138, 240], [128, 168, 250], 4);
const CORAL_PAL = ramp([36, 96, 230], [64, 132, 246]);
const CORAL_TOP = ramp([140, 196, 255], [180, 222, 255], 4);
const ICE_PAL = ramp([196, 232, 252], [232, 250, 255], 8, 240);
const ICE_TOP = ramp([244, 253, 255], [255, 255, 255], 4);
/* plasma: glowing cyan (#38bdf8) to white (#e0f7ff), cell by cell */
const PLASMA_PAL = ramp([56, 189, 248], [224, 247, 255]);
const PLASMA_TOP = ramp([196, 238, 255], [255, 255, 255], 4);
const GLASS_PAL = ramp([176, 232, 254], [208, 247, 255], 4, 244);
const GLASS_EDGE = ramp([214, 247, 255], [240, 254, 255], 4, 250); // the pale-blue outline: any side open to the air
const GLASS_TOP = ramp([240, 253, 255], [255, 255, 255], 4);
const WALL_PAL = ramp([22, 36, 68], [34, 52, 96]);
const WALL_TOP = ramp([70, 104, 164], [92, 128, 190], 4);
const STONE_PAL = ramp([30, 50, 104], [48, 76, 140]); // plasma that cooled: a dim navy crust
const STEAM_PAL = ramp([208, 230, 246], [226, 242, 252], 8, 84);
/* hot glass: the heat byte (255 just fused, 0 cold) blends from white-hot light to the cold pale-blue glass */
const GLASS_HOT = new Uint32Array(256);
for (let h = 0; h < 256; h++) {
	const f = Math.pow(h / 255, 1.4);
	GLASS_HOT[h] = abgr(Math.round(lerp(176, 238, f)), Math.round(lerp(232, 253, f)), Math.round(lerp(254, 255, f)), Math.round(lerp(244, 255, f)));
}
/* spark: its remaining life (0 to 255) from a dim royal blue through cyan to a white core */
const SPARK_LUT = new Uint32Array(256);
{
	const stops = [[0, 30, 90, 200], [15, 38, 140, 236], [35, 56, 189, 248], [70, 120, 222, 255], [120, 200, 242, 255], [255, 240, 252, 255]];
	for (let l = 0; l < 256; l++) {
		let s = 1;
		while (s < stops.length - 1 && l > stops[s][0]) s++;
		const p = stops[s - 1];
		const q = stops[s];
		const f = clamp((l - p[0]) / (q[0] - p[0]), 0, 1);
		SPARK_LUT[l] = abgr(Math.round(lerp(p[1], q[1], f)), Math.round(lerp(p[2], q[2], f)), Math.round(lerp(p[3], q[3], f)), 240);
	}
}
const GLOW_RGB = abgr(56, 189, 248, 0); // the cyan of the light itself; alpha is added per glow pixel

/* ---------- the elements in the dock ---------- */

/* the sim keeps its first names for the ids: OIL is ink, FIRE is spark, PLANT is coral, LAVA is plasma */
const ELS = { sand: SAND, water: WATER, ink: OIL, spark: FIRE, coral: PLANT, ice: ICE, plasma: LAVA, glass: GLASS, erase: E };
const ORDER = ['sand', 'water', 'ink', 'spark', 'coral', 'ice', 'plasma', 'glass', 'erase'];
const LABEL = { [SAND]: 'Sand', [WATER]: 'Water', [OIL]: 'Ink', [FIRE]: 'Spark', [PLANT]: 'Coral', [ICE]: 'Ice', [LAVA]: 'Plasma', [GLASS]: 'Glass', [E]: 'Erase' };
const BRUSH_PX = { s: 7, m: 14, l: 26 };

let chosen = SAND;
let brushKey = 'm';

/* ---------- the view ---------- */

const grid = document.createElement('canvas');
const gctx = grid.getContext('2d');
const glowCv = document.createElement('canvas');
const glctx = glowCv.getContext('2d');
let world = null;
let img = null;
let px32 = null;
let gimg = null;
let gpx32 = null;
let glow = null;
let ggw = 0;
let ggh = 0;
let DPR = 1;
let cell = 6; // device pixels per cell
let cellCss = 6;
let cellScale = 1; // how much smaller a cell is than the first version's, so speeds and brush sizes stay the same on screen
let offY = 0; // the grid is anchored bottom-left; its top rows may be cut off
let emitY = 12;
let spots = null;
let sig = '';
let frame = 0;
let clockT = 0;
let ctl = null;
const running = () => !!ctl && ctl.running;

/* the bead tile: one cell's worth of light and shade, drawn pixel by pixel, repeated over the whole grid */
let beadPat = null;
let beadCell = 0;
function makeBead(c) {
	const tile = document.createElement('canvas');
	tile.width = c;
	tile.height = c;
	const tctx = tile.getContext('2d');
	const bi = tctx.createImageData(c, c);
	for (let py = 0; py < c; py++) {
		for (let px = 0; px < c; px++) {
			const u = (px + 0.5) / c;
			const v = (py + 0.5) / c;
			const hd = Math.hypot(u - 0.3, v - 0.28) / 0.5;
			const hi = hd < 1 ? Math.pow(1 - hd, 1.6) * 0.46 : 0; // the highlight
			let lo = Math.pow(Math.max(0, (u + v) * 0.5 - 0.46) * 1.9, 2) * 0.3; // the shade
			if (px === c - 1 || py === c - 1) lo += 0.07 * clamp((c - 3) / 4, 0, 1); // a hairline between neighbours, only on larger cells
			const al = hi + lo * (1 - hi);
			const o = (py * c + px) * 4;
			if (al > 0.004) {
				bi.data[o] = (255 * hi + 12 * lo * (1 - hi)) / al; // white light over a deep-blue shade
				bi.data[o + 1] = (255 * hi + 40 * lo * (1 - hi)) / al;
				bi.data[o + 2] = (255 * hi + 110 * lo * (1 - hi)) / al;
				bi.data[o + 3] = Math.min(255, al * 255);
			}
		}
	}
	tctx.putImageData(bi, 0, 0);
	return ctx.createPattern(tile, 'repeat');
}

/* build or rebuild the grid to fit the window, the shelf under the info panel and the dock */
function layout() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	const cw = canvas.clientWidth;
	const ch = canvas.clientHeight;
	const bw = Math.round(cw * DPR);
	const bh = Math.round(ch * DPR);
	if (canvas.width !== bw || canvas.height !== bh) {
		canvas.width = bw;
		canvas.height = bh;
	}
	// a fine grid (about 48 000 cells on a desktop) so the sand reads as light, not as big pixels
	const cssFor = (n) => clamp(Math.sqrt((cw * ch) / n), 3.2, 8);
	cellCss = cssFor(CELLS);
	cell = Math.max(2, Math.round(cellCss * DPR));
	cellScale = Math.max(2, Math.round(cssFor(32000) * DPR)) / cell;
	if (cell !== beadCell) {
		beadCell = cell;
		beadPat = makeBead(cell);
	}
	const gw = Math.ceil(bw / cell);
	const gh = Math.ceil(bh / cell);
	offY = bh - gh * cell;

	// the shelf: bedrock under the info panel, so what you pour is not hidden behind it
	const cr = canvas.getBoundingClientRect();
	const pr = info.getBoundingClientRect();
	const dr = dock.getBoundingClientRect();
	const scale = bw / Math.max(1, cr.width);
	const rowAtTop = Math.floor(((pr.top - cr.top) * scale - offY) / cell) + 1;
	const hL = clamp(gh - (rowAtTop - 2) + 1, 0, Math.floor(gh * 0.55));
	let xr = Math.ceil(((pr.right - cr.left) * scale) / cell) + 2;
	if (xr > gw - 14) xr = gw;
	const heightAt = (x) => (x > xr ? 0 : xr < gw ? hL - Math.max(0, x - (xr - 3)) : hL);
	emitY = clamp(Math.ceil(((dr.bottom - cr.top) * scale - offY) / cell) + 3, 4, Math.floor(gh * 0.5));

	const next = `${gw},${gh},${hL},${xr},${emitY},${cell}`;
	const fresh = !world;
	if (!world || world.gw !== gw || world.gh !== gh) {
		const nw = createWorld(gw, gh);
		if (world) nw.copyFrom(world);
		world = nw;
		grid.width = gw;
		grid.height = gh;
		img = gctx.createImageData(gw, gh);
		px32 = new Uint32Array(img.data.buffer);
		ggw = Math.ceil(gw / GB);
		ggh = Math.ceil(gh / GB);
		glowCv.width = ggw;
		glowCv.height = ggh;
		gimg = glctx.createImageData(ggw, ggh);
		gpx32 = new Uint32Array(gimg.data.buffer);
		glow = new Uint16Array(ggw * ggh);
	}
	if (next === sig && !fresh) return;
	sig = next;
	world.setTerrain(heightAt);
	const basin = xr < gw - 30;
	spots = sceneSpots(basin, basin ? xr + 4 : 3, gw - 2, xr, emitY);
	if (fresh) {
		buildScene(world, spots);
		// a head start so the picture is already alive; the still gets a long one
		const n = REDUCED ? STILL_STEPS : 40;
		for (let k = 0; k < n; k++) world.step();
	}
}

/* the grid to the canvas, in whole-pixel cells, then the glow of everything hot */
function render(showRing = true) {
	const { gw, gh, sw, t, a, nz } = world;
	glow.fill(0);
	const shim = (frame >> 4) * 3;
	let o = 0;
	for (let y = 1; y <= gh; y++) {
		let i = y * sw + 1;
		const grow = (((y - 1) / GB) | 0) * ggw;
		for (let x = 1; x <= gw; x++, i++, o++) {
			const ty = t[i];
			if (ty === E) { px32[o] = 0; continue; }
			const n = nz[i];
			const free = t[i - sw] === E; // open to the sky: a surface cell catches the light
			let c;
			switch (ty) {
				case SAND: c = SAND_PAL[((a[i] & 3) << 4) | (n & 15)]; break;
				case WATER: c = free ? WATER_TOP[n & 3] : WATER_PAL[n & 7]; break;
				case OIL: c = free ? INK_TOP[n & 3] : INK_PAL[n & 7]; break;
				case PLANT: c = free ? CORAL_TOP[n & 3] : CORAL_PAL[n & 7]; break;
				case ICE: c = t[i - sw] !== ICE ? ICE_TOP[n & 3] : ICE_PAL[n & 7]; break;
				case LAVA:
					c = free ? PLASMA_TOP[(n + shim) & 3] : PLASMA_PAL[(n + shim) & 7];
					glow[grow + (((x - 1) / GB) | 0)] += 9;
					break;
				case FIRE:
					c = SPARK_LUT[clamp(a[i] + ((n + frame * 7) & 31) - 12, 0, 255)];
					glow[grow + (((x - 1) / GB) | 0)] += 10;
					break;
				case GLASS:
					if (a[i]) {
						c = GLASS_HOT[a[i]];
						glow[grow + (((x - 1) / GB) | 0)] += (a[i] >> 5) + 1;
					} else if (free) c = GLASS_TOP[n & 3];
					else if (t[i - 1] === E || t[i + 1] === E || t[i + sw] === E) c = GLASS_EDGE[n & 3];
					else c = GLASS_PAL[n & 3];
					break;
				case WALL: c = t[i - sw] !== WALL ? WALL_TOP[n & 3] : WALL_PAL[n & 7]; break;
				case STONE: c = STONE_PAL[n & 7]; break;
				case STEAM: c = STEAM_PAL[n & 7]; break;
				default: c = 0;
			}
			px32[o] = c;
		}
	}
	gctx.putImageData(img, 0, 0);
	for (let k = 0; k < glow.length; k++) {
		const v = glow[k];
		gpx32[k] = v ? (GLOW_RGB | ((Math.min(150, v * 0.6) | 0) << 24)) >>> 0 : 0;
	}
	glctx.putImageData(gimg, 0, 0);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(grid, 0, 0, gw, gh, 0, offY, gw * cell, gh * cell);
	// every cell becomes a small glass bead: a 1 px highlight top-left and a touch of shade bottom-right
	// (source-atop, so only the cells that are there take it)
	if (beadPat) {
		ctx.globalCompositeOperation = 'source-atop';
		ctx.save();
		ctx.translate(0, offY);
		ctx.fillStyle = beadPat;
		ctx.fillRect(0, -offY, canvas.width, canvas.height);
		ctx.restore();
	}
	ctx.globalCompositeOperation = 'lighter';
	ctx.imageSmoothingEnabled = true;
	ctx.drawImage(glowCv, 0, 0, ggw, ggh, 0, offY, ggw * GB * cell, ggh * GB * cell);
	ctx.globalCompositeOperation = 'source-over';
	if (showRing) drawRing();
}

/* the brush ring: yours (pointer or keyboard), or the auto-pour's nozzle */
function drawRing() {
	let r = null;
	if (auto.on) {
		if (!REDUCED) r = [auto.ex, auto.ey, 2.2 * cellScale];
	} else if (ptr.show) r = [ptr.x, ptr.y, brushR()];
	else if (kb.on) r = [kb.x, kb.y, brushR()];
	if (!r) return;
	ctx.beginPath();
	ctx.arc(r[0] * cell, offY + r[1] * cell, Math.max(3, r[2] * cell), 0, Math.PI * 2);
	ctx.lineWidth = Math.max(1.5, DPR * 1.5) + 2;
	ctx.strokeStyle = 'rgba(7, 11, 22, 0.5)';
	ctx.stroke();
	ctx.lineWidth = Math.max(1.5, DPR * 1.5);
	ctx.strokeStyle = 'rgba(238, 244, 255, 0.85)';
	ctx.stroke();
}

const brushR = () => Math.max(1.2, BRUSH_PX[brushKey] / cellCss);
const band = () => Math.floor(clockT / 0.9) & 3;
const redraw = () => { if (!running()) render(); };

/* ---------- the auto-pour: a nozzle that plays a short script until you draw ---------- */

const auto = { on: !REDUCED, i: -1, t: 0, clock: 0, ex: 0, ey: 0, dissolve: -1 };
const arenaX = (f) => spots.ax0 + f * (spots.ax1 - spots.ax0);
const SCRIPT = [
	{ el: LAVA, secs: 2.2, x: () => spots.dune },
	{ el: SAND, secs: 4.4, x: (c) => arenaX(0.46 + 0.1 * Math.sin(c * 0.8)) },
	{ el: WATER, secs: 3.4, x: (c) => lerp(spots.pool, spots.ax1, 0.5) + 3 * Math.sin(c * 1.3) },
	{ el: OIL, secs: 2.2, x: () => spots.plants[1] },
	{ el: FIRE, secs: 3.4, x: () => spots.plants[1] },
	{ el: LAVA, secs: 2.0, x: () => spots.ice + 4 },
];

/* the first row below y that holds something: a torch is held just above it */
function surfaceY(x) {
	const { sw, t, gh } = world;
	const col = Math.round(clamp(x, 1, world.gw));
	for (let y = emitY; y <= gh; y++) if (t[y * sw + col] !== E) return y - 1;
	return gh;
}

function updateReadout() {
	let text;
	if (auto.on) text = auto.dissolve >= 0 ? 'Auto-pour · clearing' : `Auto-pour · ${LABEL[SCRIPT[Math.max(0, auto.i)].el]}`;
	else text = `${chosen === E ? 'Eraser' : 'Brush'} · ${LABEL[chosen]}`;
	if (readoutText.textContent !== text) readoutText.textContent = text;
	readout.dataset.mode = auto.on ? 'auto' : 'user';
}

function nextPhase() {
	if (auto.i >= 0 && world.fill() > 0.24) {
		auto.dissolve = 0; // the box is getting full: a soft wipe, then on with the script
		auto.t = 0;
		updateReadout();
		return;
	}
	auto.i = (auto.i + 1) % SCRIPT.length;
	auto.t = SCRIPT[auto.i].secs;
	updateReadout();
}

function autoPour(dt) {
	if (auto.dissolve >= 0) return;
	auto.t -= dt;
	if (auto.t <= 0) nextPhase();
	if (auto.dissolve >= 0) return;
	const P = SCRIPT[auto.i];
	auto.clock += dt;
	const tx = P.x(auto.clock);
	const ty = P.el === FIRE ? surfaceY(auto.ex) - 1 : emitY;
	auto.ex += (tx - auto.ex) * Math.min(1, dt * 2.4);
	auto.ey += (ty - auto.ey) * Math.min(1, dt * 6);
	if (Math.abs(tx - auto.ex) < 7 * cellScale) world.paint(auto.ex, auto.ey, 1.7 * cellScale, P.el, band());
}

function dissolveStep() {
	const w = 14 * cellScale;
	world.wipe(auto.dissolve - w, auto.dissolve, 0.3);
	auto.dissolve += world.gw / (110 * cellScale);
	if (auto.dissolve > world.gw + w) {
		// clean: set the opening scene up again and start the script over
		auto.dissolve = -1;
		buildScene(world, spots);
		for (let k = 0; k < 40; k++) world.step();
		auto.i = -1;
		nextPhase();
	}
}

function takeOver() {
	if (!auto.on) return;
	auto.on = false;
	auto.dissolve = -1;
	updateReadout();
}

/* ---------- your brush: pointer, touch, pen and keyboard ---------- */

const ptr = { down: false, id: -1, x: 0, y: 0, show: false };
const kb = { on: false, pour: false, x: 0, y: 0 };

function toCell(ev) {
	const r = canvas.getBoundingClientRect();
	const s = canvas.width / r.width;
	return [((ev.clientX - r.left) * s) / cell, ((ev.clientY - r.top) * s - offY) / cell];
}
const paintAt = (x, y) => world.paint(x, y, brushR(), chosen, band());
function stroke(x0, y0, x1, y1) {
	const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Math.max(1, brushR() * 0.6)));
	for (let s = 1; s <= n; s++) paintAt(x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n);
}

/* reduced motion: a stroke ends by letting the world settle at once, drawn once */
function settle() {
	for (let k = 0; k < 360; k++) world.step();
	render();
}

canvas.addEventListener('pointerdown', (ev) => {
	if (ev.button > 0) return;
	ptr.down = true;
	ptr.id = ev.pointerId;
	canvas.setPointerCapture(ev.pointerId);
	[ptr.x, ptr.y] = toCell(ev);
	ptr.show = true;
	takeOver();
	paintAt(ptr.x, ptr.y);
	redraw();
});
canvas.addEventListener('pointermove', (ev) => {
	const [x, y] = toCell(ev);
	if (ptr.down && ev.pointerId === ptr.id) stroke(ptr.x, ptr.y, x, y);
	ptr.x = x;
	ptr.y = y;
	if (ev.pointerType === 'mouse' || ptr.down) ptr.show = true;
	redraw();
});
const lift = (ev) => {
	if (ev.pointerId !== ptr.id) return;
	ptr.down = false;
	if (ev.pointerType !== 'mouse') ptr.show = false;
	if (REDUCED) settle();
	else redraw();
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);
canvas.addEventListener('pointerleave', () => {
	if (ptr.down) return;
	ptr.show = false;
	redraw();
});

canvas.addEventListener('keydown', (ev) => {
	const k = ev.key;
	if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
	if (k.startsWith('Arrow')) {
		ev.preventDefault();
		if (!kb.on) { kb.x = world.gw / 2; kb.y = Math.max(emitY, world.gh * 0.4); }
		kb.on = true;
		const d = (ev.shiftKey ? 8 : 3) * cellScale;
		if (k === 'ArrowLeft') kb.x -= d;
		else if (k === 'ArrowRight') kb.x += d;
		else if (k === 'ArrowUp') kb.y -= d;
		else kb.y += d;
		kb.x = clamp(kb.x, 1, world.gw);
		kb.y = clamp(kb.y, 1, world.gh);
		redraw();
	} else if (k === ' ' || k === 'Enter') {
		ev.preventDefault();
		if (!kb.on) { kb.on = true; kb.x = world.gw / 2; kb.y = Math.max(emitY, world.gh * 0.4); }
		kb.pour = true;
		takeOver();
		paintAt(kb.x, kb.y);
		redraw();
	} else if (/^[1-9]$/.test(k)) {
		pick(ORDER[Number(k) - 1]);
	}
});
canvas.addEventListener('keyup', (ev) => {
	if (ev.key !== ' ' && ev.key !== 'Enter') return;
	kb.pour = false;
	if (REDUCED) settle();
});
canvas.addEventListener('blur', () => {
	kb.on = false;
	kb.pour = false;
	redraw();
});

/* ---------- the dock ---------- */

const elButtons = [...dock.querySelectorAll('[data-el]')];
const sizeButtons = [...dock.querySelectorAll('[data-size]')];

function pick(key) {
	chosen = ELS[key];
	elButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.el === key)));
	updateReadout();
}
elButtons.forEach((b) => b.addEventListener('click', () => pick(b.dataset.el)));
sizeButtons.forEach((b) => b.addEventListener('click', () => {
	brushKey = b.dataset.size;
	sizeButtons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
	redraw();
}));

/* ---------- the panel's buttons ---------- */

clearBtn.addEventListener('click', () => {
	takeOver();
	world.clear();
	redraw();
});

/* a snapshot: the canvas on the night ground, saved by a temporary link (nothing is sent anywhere) */
saveBtn.addEventListener('click', () => {
	render(false);
	const out = document.createElement('canvas');
	out.width = canvas.width;
	out.height = canvas.height;
	const c = out.getContext('2d');
	const g = c.createLinearGradient(0, 0, 0, out.height);
	g.addColorStop(0, '#0b1426');
	g.addColorStop(1, '#070b16');
	c.fillStyle = g;
	c.fillRect(0, 0, out.width, out.height);
	const rg = c.createRadialGradient(out.width * 0.62, out.height * 0.2, 0, out.width * 0.62, out.height * 0.2, out.width * 0.5);
	rg.addColorStop(0, 'rgba(76, 195, 255, 0.14)');
	rg.addColorStop(1, 'rgba(76, 195, 255, 0)');
	c.fillStyle = rg;
	c.fillRect(0, 0, out.width, out.height);
	c.drawImage(canvas, 0, 0);
	redraw();
	out.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'glass-sandbox.png';
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 2000);
	}, 'image/png');
});

/* ---------- running ---------- */

let acc = 0;
let msStep = 0.4;
let maxSteps = MAX_STEPS;
function tick(dt, t) {
	clockT = t;
	acc += dt * RATE * cellScale;
	const n = Math.min(maxSteps, acc | 0);
	acc -= acc | 0;
	const t0 = performance.now();
	for (let k = 0; k < n; k++) {
		if (auto.dissolve >= 0) dissolveStep();
		world.step();
	}
	// keep the simulation inside about 8 ms a frame on any device
	if (n) {
		msStep += ((performance.now() - t0) / n - msStep) * 0.1;
		maxSteps = clamp(Math.floor(8 / Math.max(msStep, 0.05)), 1, MAX_STEPS);
	}
	if (auto.on) autoPour(dt);
	if (ptr.down) paintAt(ptr.x, ptr.y);
	if (kb.pour) paintAt(kb.x, kb.y);
	frame++;
	if (frame % 20 === 0) updateReadout();
	render();
}

function start() {
	layout();
	let timer = 0;
	const relayout = () => { layout(); render(); };
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(relayout, 150);
	});
	// the panel and the dock change height when the web font arrives
	document.fonts?.ready.then(relayout);
	if (REDUCED) {
		pauseBtn.disabled = true;
		pauseBtn.setAttribute('aria-disabled', 'true');
		// a frozen moment of a pour: a loose stream of sand grains falling onto the dune
		const bottom = surfaceY(spots.dune) - 2;
		for (let y = emitY; y < bottom; y++) {
			if ((y * 37) % 11 > 6) continue; // a loose, uneven thread
			const f = (y - emitY) / Math.max(1, bottom - emitY);
			world.paint(spots.dune + Math.sin(y * 0.21) * 1.4, y, (1.7 - 0.8 * f) * cellScale, SAND, (y >> 4) & 3);
		}
		updateReadout();
		render();
		return;
	}
	nextPhase();
	auto.ex = SCRIPT[0].x(0);
	auto.ey = emitY;
	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'glass-sandbox' });
	render();
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
// the panel and the dock change height when the web font arrives, so lay the grid out after that (but never wait long)
info.getBoundingClientRect();
await Promise.race([document.fonts ? document.fonts.ready : null, new Promise((done) => { setTimeout(done, 1200); })]);
start();
