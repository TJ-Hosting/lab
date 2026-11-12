/*
 * Sample 56 — "ASCII sculpture".
 * A torus knot made of text characters. three.js draws the knot with a small shader (a key light, a fill, a rim and a depth
 * fade, so it reads as a lit solid) into a WebGL render target a few hundred pixels wide: two samples across and down per
 * text cell, multisampled. The pixels are read back, averaged per cell into one brightness, and turned into a character:
 * brighter cells get denser characters from a ramp (Classic ' .:-=+*#%@', or Blocks drawn as ░ ▒ ▓ █ dot patterns) or, in
 * Binary and TJ, a 0/1 or one of the letters T J - H O S T with brightness shown by colour and weight. The characters
 * are not text in the page: a glyph sheet is drawn once (every character in eight tones of the palette), and each frame
 * drawImage copies one cell of it per lit grid cell onto a Canvas 2D, so no DOM text changes while it runs. Drag turns the
 * knot (a trackball: screen-space turns, with inertia that eases back into a slow idle spin); the arrow keys turn it too.
 * The chips pick the character set; "Warm terminal" swaps the palette for amber and lays faint scan lines over it.
 * One loop() from js/lab.js drives the spin and the draw and is the only thing that renders, so nothing runs off-screen,
 * in a hidden tab or when Paused. Under reduced motion one frozen frame is drawn (Classic, a fixed pose); a chip, the
 * preset or a drag then redraws once for that input and nothing loops. A browser without WebGL 2 gets a still block of
 * pre-rendered text drawn on the canvas, and a short note. On phones the cells are larger (fewer of them) and the pixel
 * ratio is capped at 1.5; a slow device steps the cell size up by itself.
 *
 * Adapted from the three.js AsciiEffect addon (examples/jsm/effects/AsciiEffect.js, r186) by the three.js authors,
 * https://threejs.org/docs/pages/AsciiEffect.html, MIT. What is taken: the pipeline (render, shrink to one pixel per
 * character cell, map each cell's brightness to a character), the default ramp ' .:-=+*#%@', the 0.3 / 0.59 / 0.11
 * brightness weights and the "invert" idea (bright cells take the dense characters, for a light-on-dark screen). What
 * changed: AsciiEffect writes a table of HTML text into the page every frame; this draws the glyph grid on a Canvas 2D from
 * a glyph sheet instead, with a render target read back by readRenderTargetPixels; the cells are averaged from a 2 x 2
 * multisampled render; the knot has its own shader and a trackball with inertia; there are four character sets and a warm
 * preset; and the loop, the pause, the still and the no-WebGL block are this page's. (AsciiEffect itself says its ASCII
 * generation is based on jsascii, https://github.com/hassadee/jsascii; no jsascii code is used here.)
 * three.js itself (three@0.186.1, the core build only) is imported unmodified from vendor/three@0.186.1/, which carries
 * its LICENSE.
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

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const rig = document.querySelector('.rig');
const info = document.querySelector('.sample-info');
const noteEl = document.querySelector('.note');
const chips = [...document.querySelectorAll('[data-set]')];
const warmBtn = document.querySelector('[data-warm]');
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const REDUCED = prefersReducedMotion();
const COARSE = innerWidth < 720 || innerHeight < 520; // a phone: larger cells, fewer of them

/* ---------- the look ---------- */
const FONT = '"JetBrains Mono", ui-monospace, "Cascadia Mono", Menlo, monospace';
const ADVANCE = 0.6; // JetBrains Mono's advance width, in em
const FONT_PX = COARSE ? 13 : 12; // the character size in CSS px
const LINE = 1.1; // cell height as a multiple of the font size
const SS = 2; // render samples across and down per cell
const TIERS = 8; // tones per palette (colour and weight)
const FLOOR = 0.07; // cells dimmer than this stay empty in Binary and TJ
const FOV = 28;
const CAM_Z = 11;
const FIT = 3.8; // world units the knot spans, with a little air
const IDLE_Y = 0.32; // the idle spin, radians per second (about the screen's vertical)
const IDLE_X = 0.07;

/* the character sets. A ramp set picks a character by brightness; a pick set picks it by position and shows brightness
   by tone. Blocks has no font characters: its four shades are dot patterns drawn by the glyph sheet. */
const SETS = {
	classic: { ramp: ' .:-=+*#%@'.split('') }, // AsciiEffect's default ramp
	blocks: { ramp: [0, 1, 2, 3, 4], shade: true },
	binary: { pick: '01'.split('') },
	tj: { pick: 'TJ-HOST'.split('') },
};
const ORDER = ['classic', 'blocks', 'binary', 'tj'];

/* palettes: stops from the dimmest tone to the brightest, as r g b */
const PALETTES = {
	cool: [[0, [30, 92, 196]], [0.42, [47, 140, 240]], [0.74, [70, 208, 251]], [1, [240, 251, 255]]],
	warm: [[0, [150, 88, 28]], [0.42, [216, 142, 54]], [0.74, [255, 181, 71]], [1, [255, 233, 196]]],
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function toneColour(palette, tier) {
	const x = tier / (TIERS - 1);
	const stops = PALETTES[palette];
	let i = 0;
	while (i < stops.length - 2 && x > stops[i + 1][0]) i++;
	const [x0, c0] = stops[i];
	const [x1, c1] = stops[i + 1];
	const k = clamp((x - x0) / (x1 - x0), 0, 1);
	return `rgb(${Math.round(c0[0] + (c1[0] - c0[0]) * k)}, ${Math.round(c0[1] + (c1[1] - c0[1]) * k)}, ${Math.round(c0[2] + (c1[2] - c0[2]) * k)})`;
}

/* ---------- state ---------- */
const state = { set: 'classic', warm: false };
let W = 0; // the canvas in device pixels
let H = 0;
let DPR = 1;
let scale = 1; // 1, then larger if the device is slow
let cw = 8; // a cell in device pixels
let chh = 14;
let cols = 0;
let rows = 0;
let ox = 0; // the grid's margin inside the canvas
let oy = 0;
let tw = 0; // the render target: SS samples per cell
let th = 0;
let pixels = new Uint8Array(4);
let cellB = new Uint8Array(1); // one brightness per cell, 0 to 255
let atlas = null;
let bgLayer = null;
let scanPattern = null;
let ready = false;
let lost = false;
let webgl = false;
let clock = 0;
let ctl = null;
let renderer;
let target;
let scene;
let camera;
let knot;
let free = { cx: 0, cy: 0, size: 100 }; // where the knot goes, in CSS px inside the canvas

/* the knot's pose: a quaternion, turned in screen space by the drag, the keys and the idle spin */
const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.34, -0.36, 0.1));
const qTmp = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
let omegaX = IDLE_X; // the current spin, radians per second
let omegaY = IDLE_Y;
let drag = null;

function turn(ay, ax) {
	if (ay) rot.premultiply(qTmp.setFromAxisAngle(AXIS_Y, ay));
	if (ax) rot.premultiply(qTmp.setFromAxisAngle(AXIS_X, ax));
	rot.normalize();
}

/* ---------- the knot ---------- */
const KNOT_VERT = /* glsl */ `
varying vec3 vN;
varying float vZ;
void main() {
	vN = normalize(normalMatrix * normal);
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	vZ = -mv.z;
	gl_Position = projectionMatrix * mv;
}`;
/* a key light, a fill, a rim and a depth fade; grey out, so red, green and blue are the same */
const KNOT_FRAG = /* glsl */ `
uniform float uNear;
uniform float uFar;
varying vec3 vN;
varying float vZ;
void main() {
	vec3 n = normalize(vN);
	if (!gl_FrontFacing) n = -n;
	vec3 key = normalize(vec3(-0.5, 0.7, 0.55));
	float diff = max(dot(n, key), 0.0);
	float fill = max(dot(n, normalize(vec3(0.8, -0.35, 0.45))), 0.0);
	float spec = pow(max(dot(n, normalize(key + vec3(0.0, 0.0, 1.0))), 0.0), 34.0);
	float rim = pow(1.0 - max(n.z, 0.0), 3.0);
	float v = 0.17 + 0.64 * pow(diff, 1.3) + 0.1 * fill + 0.5 * spec + 0.26 * rim;
	float depth = clamp((vZ - uNear) / (uFar - uNear), 0.0, 1.0);
	v *= mix(1.15, 0.46, depth);
	gl_FragColor = vec4(vec3(clamp(v, 0.0, 1.0)), 1.0);
}`;

function buildScene() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(FOV, 1, 4, 20);
	camera.position.set(0, 0, CAM_Z);
	const mat = new THREE.ShaderMaterial({
		vertexShader: KNOT_VERT,
		fragmentShader: KNOT_FRAG,
		uniforms: { uNear: { value: CAM_Z - 2.2 }, uFar: { value: CAM_Z + 2.2 } },
	});
	knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.27, 300, 30, 2, 3), mat);
	scene.add(knot);
	renderer.setClearColor(0x000000, 1);
}

/* ---------- the glyph sheet: every character in eight tones, drawn once ---------- */
function drawShade(g, level, x, y, u, tone) {
	g.fillStyle = tone;
	if (level >= 4) {
		g.fillRect(x, y, cw, chh);
		return;
	}
	for (let j = 0, yy = y; yy < y + chh; j++, yy += u) {
		for (let i = 0, xx = x; xx < x + cw; i++, xx += u) {
			const on = level === 1 ? (i % 2 === 0 && j % 2 === 0) : level === 2 ? (i + j) % 2 === 0 : !(i % 2 === 1 && j % 2 === 1);
			if (on) g.fillRect(xx, yy, Math.min(u, x + cw - xx), Math.min(u, y + chh - yy));
		}
	}
}

function buildAtlas() {
	const set = SETS[state.set];
	const glyphs = set.ramp || set.pick;
	const sheet = document.createElement('canvas');
	sheet.width = glyphs.length * cw;
	sheet.height = TIERS * chh;
	const g = sheet.getContext('2d');
	const palette = state.warm ? 'warm' : 'cool';
	const fontPx = cw / ADVANCE;
	const base = Math.round(chh / 2 + fontPx * 0.365); // the baseline that centres a capital in the cell
	const u = DPR > 1.25 ? 3 : 2;
	g.textAlign = 'center';
	g.textBaseline = 'alphabetic';
	for (let t = 0; t < TIERS; t++) {
		const tone = toneColour(palette, t);
		g.fillStyle = tone;
		g.font = `${300 + t * 60} ${fontPx}px ${FONT}`;
		glyphs.forEach((ch, i) => {
			const x = i * cw;
			const y = t * chh;
			if (set.shade) {
				if (ch > 0) drawShade(g, ch, x, y, u, tone);
			} else if (ch !== ' ') {
				g.fillText(ch, x + cw / 2, y + base);
			}
		});
	}
	atlas = { sheet, count: glyphs.length };
}

/* a hash of a cell, so Binary's digits are the same on every visit */
function hash(c, r) {
	let h = Math.imul(c * 73856093 ^ r * 19349663, 0x45d9f3b);
	h ^= h >>> 15;
	return Math.imul(h, 0x2c1b3c6d) >>> 0;
}

/* the dim text field under the knot: the same characters, very faint, so the screen reads as a screen full of text */
function buildBackdrop() {
	bgLayer = document.createElement('canvas');
	bgLayer.width = W;
	bgLayer.height = H;
	const g = bgLayer.getContext('2d');
	const set = SETS[state.set];
	const n = atlas.count;
	g.globalAlpha = set.shade ? 0.4 : set.pick ? 0.11 : 0.18;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let gi;
			if (set.pick) gi = set.pick.length === 2 ? (hash(c, r) >>> 9) & 1 : (c + r * 2) % n;
			else gi = 1; // the faintest mark of the ramp
			g.drawImage(atlas.sheet, gi * cw, 0, cw, chh, ox + c * cw, oy + r * chh, cw, chh);
		}
	}
	/* Warm terminal: scan lines, one every few pixels, laid over everything */
	const period = Math.max(3, Math.round(DPR * 3));
	const s = document.createElement('canvas');
	s.width = 1;
	s.height = period;
	const sg = s.getContext('2d');
	sg.fillStyle = 'rgba(3, 5, 12, 0.3)';
	sg.fillRect(0, 0, 1, 1);
	scanPattern = ctx.createPattern(s, 'repeat');
}

/* ---------- the size: the grid, the render target and the camera ---------- */
function freeArea(extraTop = 0) {
	const cr = canvas.getBoundingClientRect();
	const rr = rig.getBoundingClientRect();
	const ir = info.getBoundingClientRect();
	const w = cr.width;
	const h = cr.height;
	const top = clamp(rr.bottom - cr.top + 10 + extraTop, 0, h * 0.5);
	const pad = 12;
	/* the fixed panel covers the lower left: put the knot beside it, or above it, whichever lets it be bigger */
	const panelTop = ir.top - cr.top;
	const above = { x0: 0, x1: w, y0: top, y1: panelTop < h - 20 ? Math.max(top + 80, panelTop - 10) : h - pad };
	const beside = { x0: clamp(ir.right - cr.left + 8, 0, w * 0.7), x1: w, y0: top, y1: h - pad };
	const fit = (r) => Math.max(0, Math.min(r.x1 - r.x0, r.y1 - r.y0));
	const use = ir.bottom < cr.top || fit(above) >= fit(beside) ? above : beside;
	return { cx: (use.x0 + use.x1) / 2, cy: (use.y0 + use.y1) / 2, size: Math.max(60, fit(use) * 0.96), top: rr.bottom - cr.top + 10 };
}

/* aim the camera so the knot is `size` device px across, centred at (cx, cy) device px in the grid */
function aim(cx, cy, size) {
	const gridW = cols * cw;
	const gridH = rows * chh;
	camera.aspect = gridW / gridH;
	const ppu = size / FIT; // pixels per world unit at the knot's middle
	camera.zoom = (ppu * 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z) / gridH;
	camera.setViewOffset(gridW, gridH, gridW / 2 - cx, gridH / 2 - cy, gridW, gridH);
	camera.updateProjectionMatrix();
}

function placeCamera() {
	free = freeArea();
	aim(free.cx * DPR - ox, free.cy * DPR - oy, free.size * DPR);
}

/* the grid itself: `cols` x `rows` cells of cw x chh device px; the render target has SS samples per cell */
function setGrid(c, r) {
	cols = c;
	rows = r;
	tw = cols * SS;
	th = rows * SS;
	pixels = new Uint8Array(tw * th * 4);
	cellB = new Uint8Array(cols * rows);
	if (target) target.dispose();
	target = new THREE.WebGLRenderTarget(tw, th, { samples: 4, depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
}

function sizeCanvas() {
	DPR = Math.min(1.5, window.devicePixelRatio || 1);
	const cssW = canvas.clientWidth;
	const cssH = canvas.clientHeight;
	if (cssW < 8 || cssH < 8) return false;
	W = Math.round(cssW * DPR);
	H = Math.round(cssH * DPR);
	canvas.width = W;
	canvas.height = H;
	const font = FONT_PX * scale;
	cw = Math.max(4, Math.round(font * ADVANCE * DPR));
	chh = Math.max(7, Math.round(font * LINE * DPR));
	ox = (W - Math.floor(W / cw) * cw) >> 1;
	oy = (H - Math.floor(H / chh) * chh) >> 1;
	return true;
}

function layout() {
	if (!sizeCanvas()) return false;
	if (webgl) {
		setGrid(Math.floor(W / cw), Math.floor(H / chh));
		placeCamera();
		buildAtlas();
		buildBackdrop();
	}
	return true;
}

/* ---------- one frame ---------- */
const LUM = [0.3, 0.59, 0.11]; // AsciiEffect's brightness weights

function readBrightness() {
	renderer.readRenderTargetPixels(target, 0, 0, tw, th, pixels);
	const norm = 1 / (SS * SS * 255);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let sum = 0;
			for (let sy = 0; sy < SS; sy++) {
				const rowStart = (th - 1 - (r * SS + sy)) * tw; // pixels are read bottom-up
				for (let sx = 0; sx < SS; sx++) {
					const o = (rowStart + c * SS + sx) * 4;
					sum += LUM[0] * pixels[o] + LUM[1] * pixels[o + 1] + LUM[2] * pixels[o + 2];
				}
			}
			const b = clamp(sum * norm, 0, 1);
			cellB[r * cols + c] = Math.round(Math.pow(b, 0.82) * 255);
		}
	}
}

function drawGrid() {
	ctx.clearRect(0, 0, W, H);
	if (state.warm) {
		const cx = (free.cx * DPR);
		const cy = (free.cy * DPR);
		const R = free.size * DPR * 0.75;
		const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
		glow.addColorStop(0, 'rgba(255, 150, 50, 0.13)');
		glow.addColorStop(1, 'rgba(255, 150, 50, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, W, H);
	}
	ctx.drawImage(bgLayer, 0, 0);
	const set = SETS[state.set];
	const sheet = atlas.sheet;
	const n = atlas.count;
	const flip = Math.floor(clock * 1.2);
	const slide = Math.floor(clock * 2.5);
	const floorB = FLOOR * 255;
	for (let r = 0; r < rows; r++) {
		const y = oy + r * chh;
		for (let c = 0; c < cols; c++) {
			const b = cellB[r * cols + c];
			if (b < floorB) continue;
			let gi;
			let tier;
			if (set.ramp) {
				gi = Math.round((b / 255) * (n - 1));
				if (gi === 0) continue;
				tier = Math.min(TIERS - 1, Math.floor((b / 255) * TIERS));
			} else {
				if (set.pick.length === 2) gi = ((hash(c, r) >>> 9) + flip + ((hash(c, r) & 15) >> 2)) & 1; // each digit flips now and then
				else gi = (((c + r * 2 + slide) % n) + n) % n; // the word streams along the rows
				tier = Math.min(TIERS - 1, Math.floor(((b - floorB) / (255 - floorB)) * TIERS));
			}
			const x = ox + c * cw;
			ctx.clearRect(x, y, cw, chh); // the faint backdrop character of this cell makes way
			ctx.drawImage(sheet, gi * cw, tier * chh, cw, chh, x, y, cw, chh);
		}
	}
	if (state.warm) {
		ctx.fillStyle = scanPattern;
		ctx.fillRect(0, 0, W, H);
	}
}

function renderNow() {
	if (!ready || lost) return;
	if (webgl) {
		knot.quaternion.copy(rot);
		renderer.setRenderTarget(target);
		renderer.render(scene, camera);
		readBrightness();
		renderer.setRenderTarget(null);
		drawGrid();
	} else {
		drawStatic();
	}
}

/* a change that needs a redraw when no loop is running (the still, Pause, an off-screen tab that cannot be touched) */
function redraw() {
	if (!ctl || !ctl.running) renderNow();
}

/* ---------- a browser without WebGL 2: a still block of pre-rendered text ---------- */
/* the classic ramp, 62 x 34 cells: the knot rendered once by the pipeline above, at its first pose (the still frame) */
const STILL = [
	'                .:-==++++++==-:.',
	'            .-+*######******+++++=-:',
	'          -*%%@%##*+++++++++++++++++=:.',
	'       .+#%@%#*++====-------===========-.',
	'      =#%%#*+===------::::::-----========:',
	'    .*#%#*+==--------:::::::::::---======--',
	'   -*##*+==------:.          ..:::--======--',
	'  :*##*+=------:           :-=***#####***++=:',
	' .***++=-----:          -+#%%%@@@@@@@@%###****=-:.',
	' +***+=-----.         =*##############*********+++-:',
	':***+==----.      .-=*****++++++++=+++++++++++++++++=-',
	'-++++==---:    .-+***+++=====------------========+=====:',
	'=++++==---:   -*+++++==--------------=---------=========-.',
	'-++++==---: .+++=====--::----:..  :*#%%*+=----------====--:',
	'-++++===--:.++==--:--------=.    .*##%#++=--::-------------:',
	'.=+++====--=+=--::::--::::.      =####*+=---   .------------.',
	' -==++========--:::-.           :##%%*++=--.     :-::--------',
	' .-============-::-.            +##%%*++=-:       :-::-------',
	'  .-=====+++++++++========---::.*#%@%*++=-.       .=-::------.',
	'   .:-======+++++++++++++=======**%@%*+==-.       ==--::-----',
	'     .----================------**#@%*+==-:  ..:-*+=--::----:',
	'       .::----------------------**###*+=--*******++=--::----',
	'         :---:::--------------::*****++=--*****++==--:::---.',
	'         .==++==---:::::::::::::****++==--++++===---:::--.',
	'          -=+**++==-.          :*++++==----------::::-:.',
	'          .==+##*+==-.         -++++===---:::::::::..',
	'           :=+*#%*+++=:       .++++===---:',
	'            :=++#%#***++-:  .-++++==-----',
	'             :==+*###****####*++===-----:',
	'              .-==+**********++==------:',
	'                .-==+++++++++==-------.',
	'                  .:--======----::--:',
	'                     .:::::::::-::.',
	'                         ......',
];

function drawStatic() {
	const rowsN = STILL.length;
	const colsN = STILL.reduce((m, s) => Math.max(m, s.length), 1);
	ctx.clearRect(0, 0, W, H);
	/* the note sits at the top of the free area, the block under it */
	let area = freeArea();
	noteEl.style.left = `${canvas.offsetLeft + area.cx}px`;
	noteEl.style.top = `${canvas.offsetTop + area.top}px`;
	area = freeArea(noteEl.offsetHeight + 6);
	const px = Math.min((area.size * DPR) / (colsN * ADVANCE), (area.size * DPR) / (rowsN * LINE));
	const x0 = area.cx * DPR - (colsN * ADVANCE * px) / 2;
	const y0 = area.cy * DPR - (rowsN * LINE * px) / 2;
	const hi = state.warm ? '#ffe3b4' : '#e7f8ff';
	const lo = state.warm ? '#d88e36' : '#2f8cf0';
	const grad = ctx.createLinearGradient(0, y0, 0, y0 + rowsN * LINE * px);
	grad.addColorStop(0, hi);
	grad.addColorStop(1, lo);
	ctx.fillStyle = grad;
	ctx.font = `600 ${px}px ${FONT}`;
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';
	STILL.forEach((row, i) => ctx.fillText(row, x0, y0 + i * LINE * px));
}

/* ---------- the controls ---------- */
function setSet(key) {
	state.set = key;
	chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.set === key)));
	if (!webgl) return;
	buildAtlas();
	buildBackdrop();
	redraw();
}

function setWarm(on) {
	state.warm = on;
	warmBtn.setAttribute('aria-pressed', String(on));
	if (webgl) {
		buildAtlas();
		buildBackdrop();
	}
	redraw();
}

function setPaused(v) {
	pauseBtn.setAttribute('aria-pressed', String(v));
	pauseBtn.textContent = v ? 'Play' : 'Pause';
	if (!ctl) return;
	if (v) ctl.stop(); else ctl.start();
}

let bound = false;
function bindControls() {
	if (bound) return;
	bound = true;
	chips.forEach((c) => c.addEventListener('click', () => setSet(c.dataset.set)));
	nextBtn.addEventListener('click', () => setSet(ORDER[(ORDER.indexOf(state.set) + 1) % ORDER.length]));
	warmBtn.addEventListener('click', () => setWarm(warmBtn.getAttribute('aria-pressed') !== 'true'));
	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));
}

function bindDrag() {
	canvas.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		canvas.setPointerCapture(e.pointerId);
		canvas.classList.add('is-grabbing');
		drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
		omegaX = 0;
		omegaY = 0;
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		const now = performance.now();
		const dt = Math.max(0.008, (now - drag.t) / 1000);
		const ay = (e.clientX - drag.x) * 0.011;
		const ax = (e.clientY - drag.y) * 0.011;
		turn(ay, ax);
		/* the hand's speed, smoothed, for the throw on release */
		omegaY = clamp(omegaY * 0.6 + (ay / dt) * 0.4, -7, 7);
		omegaX = clamp(omegaX * 0.6 + (ax / dt) * 0.4, -7, 7);
		drag.x = e.clientX;
		drag.y = e.clientY;
		drag.t = now;
		redraw();
	});
	const end = (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		/* a pause before letting go means no throw */
		if (performance.now() - drag.t > 90) {
			omegaX = 0;
			omegaY = 0;
		}
		drag = null;
		canvas.classList.remove('is-grabbing');
	};
	canvas.addEventListener('pointerup', end);
	canvas.addEventListener('pointercancel', end);
	canvas.addEventListener('keydown', (e) => {
		const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
		if (!k) return;
		e.preventDefault();
		turn(k[0] * 0.18, k[1] * 0.18);
		redraw();
	});
}

/* ---------- start ---------- */
let fellBack = false;
function fallback() {
	if (fellBack) return;
	fellBack = true;
	webgl = false;
	canvas.setAttribute('aria-label', 'A three-lobed knot drawn as a grid of text characters in cyan and blue on a dark navy screen. A still picture.');
	noteEl.hidden = false;
	document.querySelector('.hint')?.setAttribute('hidden', '');
	chips.forEach((c) => { c.disabled = true; });
	nextBtn.disabled = true;
	pauseBtn.disabled = true;
	canvas.style.cursor = 'default';
	canvas.style.touchAction = 'auto';
	bindControls();
	let timer = 0;
	const ro = new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(() => { if (layout()) renderNow(); }, 100);
	});
	ro.observe(canvas);
	ro.observe(info);
	if (layout()) {
		ready = true;
		renderNow();
	}
}

function start() {
	/* ask for a throw-away WebGL 2 context first, so a browser without it gets the still, not three.js's console errors */
	const probe = document.createElement('canvas').getContext('webgl2');
	if (!probe) {
		fallback();
		return;
	}
	probe.getExtension('WEBGL_lose_context')?.loseContext();
	try {
		renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
	} catch (err) {
		fallback();
		return;
	}
	webgl = true;
	renderer.setPixelRatio(1);
	renderer.domElement.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		lost = true;
	});
	renderer.domElement.addEventListener('webglcontextrestored', () => {
		lost = false;
		if (ready) redraw();
	});
	buildScene();

	bindControls();
	bindDrag();

	let sizedW = 0;
	let sizedH = 0;

	/* the glyph sheet wants the mono font: wait for it (a second at most), then draw the first frame */
	const fonts = document.fonts ? document.fonts.load(`600 ${FONT_PX}px "JetBrains Mono"`).catch(() => {}) : Promise.resolve();
	const timeout = new Promise((resolve) => setTimeout(resolve, 1200));
	Promise.race([fonts, timeout]).then(() => {
		if (layout()) {
			sizedW = canvas.clientWidth;
			sizedH = canvas.clientHeight;
			ready = true;
			renderNow();
		}
		/* else: no size yet; the observer below sets it up when it has one */
	});
	document.fonts?.addEventListener?.('loadingdone', () => {
		if (ready && webgl) {
			buildAtlas();
			buildBackdrop();
			redraw();
		}
	});

	/* a resize or a fold of the panel */
	let timer = 0;
	const onResize = () => {
		if (canvas.clientWidth === sizedW && canvas.clientHeight === sizedH && ready) {
			placeCamera(); // only the panel moved
		} else if (!layout()) {
			return;
		}
		sizedW = canvas.clientWidth;
		sizedH = canvas.clientHeight;
		ready = true;
		redraw();
	};
	const ro = new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(onResize, 100);
	});
	ro.observe(canvas);
	ro.observe(info);

	if (REDUCED) {
		/* one frozen frame: Classic, the first pose. Chips, the preset and a drag redraw once; nothing loops. */
		pauseBtn.disabled = true;
		return;
	}

	/* the loop: the spin, then the one render. A slow device steps the cell size up. */
	let frames = 0;
	const samples = [];
	ctl = loop(canvas, (dt) => {
		if (!ready || lost) return;
		clock += dt;
		if (!drag) {
			const k = 1 - Math.exp(-dt * 1.4);
			omegaY += (IDLE_Y - omegaY) * k;
			omegaX += (IDLE_X - omegaX) * k;
			turn(omegaY * dt, omegaX * dt);
		}
		renderNow();

		frames++;
		if (frames > 45 && scale < 1.5) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.026) {
					scale *= 1.25;
					layout();
				}
				samples.length = 0;
				frames = 25;
			}
		}
	}, { name: 'ascii-sculpture' });
}

boot();
try {
	start();
} catch (err) {
	/* anything that goes wrong while setting up WebGL ends in the still block, not a blank window */
	fallback();
}
