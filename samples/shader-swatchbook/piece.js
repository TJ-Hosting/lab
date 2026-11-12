/*
 * Sample 15 — "Shader Swatchbook".
 * A wall of eight frosted glass tiles, each holding one GPU shader from the Paper Shaders library (mesh gradient, warp, swirl,
 * neuro noise, god rays, smoke ring, voronoi, waves). Every tile shows a still frame; only the picked tile (hovered, focused or
 * tapped) carries the live canvas, so there is one live WebGL context at a time (a second one exists for a moment while a still
 * frame is drawn, then it is disposed). A click opens the picked shader full screen. Three sliders (speed, scale, colour) and a
 * "Copy settings" pill let a visitor take the configuration away; copying only happens on a click.
 *
 * Motion: the library's own requestAnimationFrame loop is never used. Each ShaderMount is created with speed 0 (so it schedules
 * no frames of its own) and is driven from inside loop() (js/lab.js) with setFrame(), which renders synchronously. loop() runs only
 * while a live shader exists and is on screen, the tab is visible, Pause is off and reduced motion is off; so in a hidden tab,
 * off-screen and under reduced motion there are no requestAnimationFrame callbacks. Under reduced motion every tile (and the full
 * screen view) is a still frame and nothing is live. The pointer nudges the picked shader's offset; with no pointer a slow ghost
 * drift does it. Still frames are drawn once into 2D canvases by a short-lived ShaderMount, one at a time.
 *
 * Uses Paper Shaders (@paper-design/shaders 0.0.82), https://github.com/paper-design/shaders, Copyright 2026 Paper,
 * Licensed under the Apache License, Version 2.0 (vendor/paper-design-shaders@0.0.82/LICENSE; its NOTICE sits beside it).
 * NOTICE text: "Paper Shaders. Copyright 2026 Paper. Powered by Paper Shaders: https://shaders.paper.design"
 * Source for the effects: the library's effects index at https://shaders.paper.design (the shaders and their parameter names).
 *
 * What changed from the library's own use: the vendored files are imported one by one (no bundle, no React wrapper); the colours
 * are DS v9 blues, and the Colour slider rotates their hue within a fixed range; uniforms are built here from plain parameter
 * tables; ShaderMount runs at speed 0 and is stepped from loop(); one live mount at a time with still frames for the rest; the
 * wall, the full screen view, the sliders and the copy pill are new; the Waves shader (which has no time input) is animated by
 * scrolling its pattern offset and breathing its amplitude. No library file was edited.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import { ShaderMount } from '../../vendor/paper-design-shaders@0.0.82/shader-mount.js';
import { ShaderFitOptions } from '../../vendor/paper-design-shaders@0.0.82/shader-sizing.js';
import { getShaderColorFromString } from '../../vendor/paper-design-shaders@0.0.82/get-shader-color-from-string.js';
import { getShaderNoiseTexture } from '../../vendor/paper-design-shaders@0.0.82/get-shader-noise-texture.js';
import { meshGradientFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/mesh-gradient.js';
import { warpFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/warp.js';
import { swirlFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/swirl.js';
import { neuroNoiseFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/neuro-noise.js';
import { godRaysFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/god-rays.js';
import { smokeRingFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/smoke-ring.js';
import { voronoiFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/voronoi.js';
import { wavesFragmentShader } from '../../vendor/paper-design-shaders@0.0.82/shaders/waves.js';

/* ---------- the palette: DS v9 blues (navy, royal, azure, sky, pale, mist, cyan light, white) ---------- */

const NAVY = '#16428c';
const DEEP = '#0e3472';
const ROYAL = '#0c6bed';
const AZURE = '#4d9ff3';
const SKY = '#a4c9f6';
const PALE = '#d4e7fb';
const MIST = '#eef7fc';
const CYAN = '#46d0fb';
const WHITE = '#ffffff';

/* ---------- the eight effects ----------
   params use Paper's own prop names (a uniform is u_ + the name), so the copied settings read like its props.
   fit: how the shape sits in the box (cover fills it, contain keeps it whole, none is a pattern in screen pixels).
   pattern: a "none" pattern's scale follows the host's width, so the full screen view is the same picture, larger.
   rate: Paper's speed (time in seconds times rate). amp: how far the pointer moves the offset. time: where the picture starts (ms). */

const FX = [
	{
		id: 'mesh', name: 'Mesh gradient', component: 'MeshGradient', frag: meshGradientFragmentShader, fit: 'cover', pattern: false,
		rate: 0.7, time: 0, amp: 0.16,
		colors: [ROYAL, AZURE, CYAN, SKY, WHITE],
		params: { distortion: 0.85, swirl: 0.25, grainMixer: 0, grainOverlay: 0 },
		fallback: `radial-gradient(60% 70% at 25% 30%, ${WHITE}, transparent 70%), radial-gradient(70% 80% at 80% 70%, ${CYAN}, transparent 65%), linear-gradient(135deg, ${SKY}, ${ROYAL})`,
	},
	{
		id: 'warp', name: 'Warp', component: 'Warp', frag: warpFragmentShader, noise: true, fit: 'none', pattern: true,
		rate: 3, time: 14000, amp: 0.12,
		colors: [NAVY, ROYAL, AZURE, MIST, CYAN],
		params: { proportion: 0.55, softness: 1, distortion: 0.25, swirl: 0.8, swirlIterations: 10, shapeScale: 0.1, shape: 'checks' },
		enums: { shape: { checks: 0, stripes: 1, edge: 2 } },
		fallback: `linear-gradient(120deg, ${NAVY}, ${ROYAL} 35%, ${AZURE} 65%, ${MIST})`,
	},
	{
		id: 'swirl', name: 'Swirl', component: 'Swirl', frag: swirlFragmentShader, fit: 'cover', pattern: false,
		rate: 0.4, time: 2000, amp: 0.1,
		colors: [MIST, AZURE, ROYAL, CYAN],
		colorProps: { colorBack: NAVY },
		params: { bandCount: 4, twist: 0.2, center: 0.3, proportion: 0.5, softness: 0.6, noiseFrequency: 0.4, noise: 0.15 },
		fallback: `repeating-conic-gradient(from 20deg at 50% 50%, ${NAVY} 0 12%, ${AZURE} 12% 24%, ${MIST} 24% 36%, ${ROYAL} 36% 50%)`,
	},
	{
		id: 'neuro', name: 'Neuro noise', component: 'NeuroNoise', frag: neuroNoiseFragmentShader, fit: 'none', pattern: true,
		rate: 1, time: 0, amp: 0.1,
		colorProps: { colorFront: WHITE, colorMid: CYAN, colorBack: DEEP },
		params: { brightness: 0.2, contrast: 0.2 },
		fallback: `radial-gradient(70% 60% at 30% 40%, ${CYAN}, transparent 70%), linear-gradient(150deg, ${DEEP}, ${ROYAL})`,
	},
	{
		id: 'rays', name: 'God rays', component: 'GodRays', frag: godRaysFragmentShader, noise: true, fit: 'cover', pattern: false,
		rate: 1, time: 5000, amp: 0.12,
		colors: [CYAN, AZURE, PALE],
		colorProps: { colorBack: NAVY, colorBloom: WHITE },
		params: { density: 0.3, spotty: 0.3, midSize: 0.2, midIntensity: 0.4, intensity: 0.8, bloom: 0.4 },
		fallback: `repeating-conic-gradient(from 0deg at 50% 38%, ${NAVY} 0 6%, ${AZURE} 6% 9%), ${NAVY}`,
	},
	{
		id: 'smoke', name: 'Smoke ring', component: 'SmokeRing', frag: smokeRingFragmentShader, noise: true, fit: 'contain', pattern: false,
		rate: 0.8, time: 6000, amp: 0.1,
		colors: [WHITE, CYAN, AZURE, ROYAL],
		colorProps: { colorBack: NAVY },
		params: { thickness: 0.65, radius: 0.28, innerShape: 0.7, noiseScale: 3, noiseIterations: 8 },
		fallback: `radial-gradient(circle at 50% 50%, ${NAVY} 0 25%, ${AZURE} 40%, ${PALE} 52%, ${NAVY} 72%)`,
	},
	{
		id: 'voronoi', name: 'Voronoi', component: 'Voronoi', frag: voronoiFragmentShader, noise: true, fit: 'none', pattern: true,
		rate: 0.6, time: 2500, amp: 0.1,
		colors: [ROYAL, AZURE, CYAN, SKY],
		colorProps: { colorGlow: WHITE, colorGap: WHITE },
		params: { stepsPerColor: 3, distortion: 0.4, gap: 0.04, glow: 0.3 },
		fallback: `conic-gradient(from 30deg at 40% 55%, ${ROYAL}, ${AZURE}, ${CYAN}, ${SKY}, ${ROYAL})`,
	},
	{
		id: 'waves', name: 'Waves', component: 'Waves', frag: wavesFragmentShader, fit: 'none', pattern: true,
		rate: 1, time: 0, amp: 0.1,
		colorProps: { colorFront: ROYAL, colorBack: MIST },
		params: { shape: 1, frequency: 0.5, amplitude: 0.5, spacing: 1.2, proportion: 0.28, softness: 0.1 },
		/* the shader has no time input: scroll the pattern and let the amplitude breathe (ms in, uniforms out) */
		scroll: (ms) => ms * 3.5e-5,
		drive: (ms) => ({ u_amplitude: 0.5 + 0.12 * Math.sin(ms * 7e-4) }),
		fallback: `repeating-linear-gradient(8deg, ${MIST} 0 14px, ${ROYAL} 14px 22px)`,
	},
];

/* ---------- state ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');
const wall = $('#wall');
const tune = $('#tune');
const slot = $('.tune-slot');
const full = $('#full');
const fullLive = $('.full__live');
const fullStill = $('.full__still');
const fullName = $('#full-name');
const closeBtn = $('#close');
const openBtn = $('[data-action="open"]');
const pauseBtn = $('[data-action="pause"]');
const nowEl = $('#now');
const statusEl = $('#status');
const copyBtn = $('#copy');
const copyLabel = $('.copy__label');
const box = $('#box');
const info = $('.sample-info');
const sliders = {
	speed: { el: $('#speed'), out: $('#speed-out'), fmt: (v) => `${+v.toFixed(2)}×` },
	scale: { el: $('#scale'), out: $('#scale-out'), fmt: (v) => `${+v.toFixed(2)}×` },
	hue: { el: $('#hue'), out: $('#hue-out'), fmt: (v) => `${v > 0 ? '+' : ''}${v}°` },
};

const cfg = { speed: 1, scale: 1, hue: 0 };
const st = { active: 0, full: false, paused: false, webgl: true, lastType: '', downActive: false, autoCollapsed: false };
const tiles = [...wall.querySelectorAll('.cell')].map((cell, i) => ({
	i,
	cell,
	btn: $('.tile', cell),
	art: $('.tile__art', cell),
	still: $('.tile__still', cell),
	liveHost: $('.tile__live', cell),
	stateEl: $('.tile__state', cell),
}));
let noise = null;
let live = null; // { idx, kind: 'tile' | 'full', eff, mount, host, ro, ready, time, w }
const ptr = { tx: 0, ty: 0, x: 0, y: 0, inside: false };
const seen = new Set(); // tiles on screen (the page scrolls on a phone)

/* ---------- colour: rotate the hue of a hex colour (HSL), cached ---------- */

const hueCache = new Map();
function shift(hex, deg) {
	if (!deg) return hex;
	const key = `${hex}|${deg}`;
	const hit = hueCache.get(key);
	if (hit) return hit;
	const n = parseInt(hex.slice(1), 16);
	const r = (n >> 16) / 255;
	const g = ((n >> 8) & 255) / 255;
	const b = (n & 255) / 255;
	const mx = Math.max(r, g, b);
	const mn = Math.min(r, g, b);
	const l = (mx + mn) / 2;
	const d = mx - mn;
	let h = 0;
	let s = 0;
	if (d > 1e-6) {
		s = d / (1 - Math.abs(2 * l - 1));
		h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	h = (h + deg + 360) % 360;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	const out = `#${[R, G, B].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')}`;
	hueCache.set(key, out);
	return out;
}

/* ---------- uniforms: the effect's parameters, colours and sizing, from the plain tables above ---------- */

// a pattern shader draws in screen pixels, so its scale follows the host width (a little less than 1:1, so the full view shows more detail)
const scaleFor = (eff, w) => cfg.scale * (eff.pattern ? Math.pow(w / 300, 0.8) : 1);

function uniformsFor(eff, w, { texture = true, offset = [0, 0] } = {}) {
	const u = {};
	for (const [k, v] of Object.entries(eff.params)) u[`u_${k}`] = typeof v === 'string' ? eff.enums[k][v] : v;
	for (const [k, v] of Object.entries(eff.colorProps || {})) u[`u_${k}`] = getShaderColorFromString(shift(v, cfg.hue));
	if (eff.colors) {
		u.u_colors = eff.colors.map((c) => getShaderColorFromString(shift(c, cfg.hue)));
		u.u_colorsCount = eff.colors.length;
	}
	u.u_fit = ShaderFitOptions[eff.fit];
	u.u_scale = scaleFor(eff, w);
	u.u_rotation = 0;
	u.u_offsetX = offset[0];
	u.u_offsetY = offset[1];
	u.u_originX = 0.5;
	u.u_originY = 0.5;
	u.u_worldWidth = 0;
	u.u_worldHeight = 0;
	if (texture && eff.noise) u.u_noiseTexture = noise;
	return u;
}

/* ---------- still frames: a short-lived ShaderMount at speed 0, drawn once into a 2D canvas ---------- */

function snapshot(eff, w, h, pr, paint) {
	return new Promise((resolve) => {
		const host = document.createElement('div');
		host.className = 'snap';
		host.style.width = `${w}px`;
		host.style.height = `${h}px`;
		document.body.append(host);
		let mount;
		try {
			mount = new ShaderMount(host, eff.frag, uniformsFor(eff, w), { preserveDrawingBuffer: true }, 0, eff.time, 1, Math.round(w * h * pr * pr));
		} catch (err) {
			host.remove();
			noWebGL();
			resolve(false);
			return;
		}
		// created after the mount's own observer, so it runs after that one has sized the canvas and drawn
		const ro = new ResizeObserver(() => {
			ro.disconnect();
			mount.setFrame(eff.time);
			paint(mount.canvasElement);
			mount.dispose();
			host.remove();
			resolve(true);
		});
		ro.observe(host);
	});
}

async function drawTileStill(i) {
	const T = tiles[i];
	if (live && live.kind === 'tile' && live.idx === i && live.ready) return; // its still is taken from the live canvas when it stops
	const w = T.art.clientWidth;
	const h = T.art.clientHeight;
	if (!w || !h || !st.webgl) return;
	const pr = Math.min(2, window.devicePixelRatio || 1);
	const cw = Math.round(w * pr);
	const ch = Math.round(h * pr);
	await snapshot(FX[i], w, h, pr, (src) => {
		if (T.still.width !== cw || T.still.height !== ch) {
			T.still.width = cw;
			T.still.height = ch;
		}
		T.still.getContext('2d').drawImage(src, 0, 0, cw, ch);
		T.art.classList.add('has-still');
	});
}

/* a queue of tiles whose still frame needs drawing, worked one at a time with a breath between */
const dirty = new Set();
let working = false;
async function work() {
	if (working) return;
	working = true;
	try {
		while (dirty.size && st.webgl) {
			const i = dirty.values().next().value;
			dirty.delete(i);
			await drawTileStill(i);
			await new Promise((r) => setTimeout(r, 24));
		}
	} finally {
		working = false;
	}
}
function markDirty(list) {
	list.forEach((i) => dirty.add(i));
	work();
}
const ALL = tiles.map((t) => t.i);

/* the full screen view's still (reduced motion, and before the live canvas is ready): drawn at the screen's size */
async function drawFullStill(idx) {
	const eff = FX[idx];
	if (!st.webgl) return;
	if (!prefersReducedMotion()) {
		const T = tiles[idx];
		if (T.still.width) {
			fullStill.width = T.still.width;
			fullStill.height = T.still.height;
			fullStill.getContext('2d').drawImage(T.still, 0, 0);
		}
		return;
	}
	const w = full.clientWidth;
	const h = full.clientHeight;
	const pr = Math.min(1.5, window.devicePixelRatio || 1);
	const fw = Math.round(w * pr);
	const fh = Math.round(h * pr);
	await snapshot(eff, w, h, pr, (src) => {
		fullStill.width = fw;
		fullStill.height = fh;
		fullStill.getContext('2d').drawImage(src, 0, 0, fw, fh);
	});
}

/* ---------- no WebGL: painted CSS swatches, the sliders that need it switched off ---------- */

function noWebGL() {
	if (!st.webgl) return;
	st.webgl = false;
	tiles.forEach((T) => {
		T.art.style.background = FX[T.i].fallback;
		T.still.hidden = true;
	});
	full.style.background = FX[st.active].fallback;
	fullStill.hidden = true;
	say('WebGL is not available here, so the tiles are painted swatches.');
	syncControls();
	syncText();
}

/* ---------- the live shader: one at a time, stepped from loop() ---------- */

function stopLive() {
	if (!live) return;
	const L = live;
	live = null;
	FX[L.idx].time = L.time;
	if (L.ready && L.kind === 'tile') {
		// the tile keeps the frame the live canvas stopped on
		const T = tiles[L.idx];
		const src = L.mount.canvasElement;
		if (T.still.width && src.width) {
			T.still.getContext('2d').drawImage(src, 0, 0, T.still.width, T.still.height);
			T.art.classList.add('has-still');
		}
	}
	L.ro.disconnect();
	L.mount.dispose();
	L.host.classList.remove('is-ready');
	updateGate();
}

function startLive() {
	stopLive();
	if (prefersReducedMotion() || !st.webgl) {
		syncText();
		return;
	}
	const idx = st.active;
	const eff = FX[idx];
	const kind = st.full ? 'full' : 'tile';
	const host = st.full ? fullLive : tiles[idx].liveHost;
	const w = host.clientWidth;
	const h = host.clientHeight;
	if (!w || !h) return;
	const pr = Math.min(2, window.devicePixelRatio || 1);
	const cap = kind === 'full' ? Math.min(w * h * pr * pr, 2.2e6) : w * h * pr * pr;
	let mount;
	try {
		mount = new ShaderMount(host, eff.frag, uniformsFor(eff, w), { preserveDrawingBuffer: true }, 0, eff.time, 1, Math.round(cap));
	} catch (err) {
		noWebGL();
		return;
	}
	const L = { idx, kind, eff, mount, host, ready: false, time: eff.time, w };
	// created after the mount's own observer: the first callback means the canvas is sized and drawn; later ones are resizes
	L.ro = new ResizeObserver(() => {
		if (live !== L) return;
		L.w = host.clientWidth;
		if (eff.pattern) mount.setUniformValues({ u_scale: scaleFor(eff, L.w) });
		mount.setFrame(L.time);
		if (!L.ready) {
			L.ready = true;
			host.classList.add('is-ready');
			updateGate();
		}
	});
	L.ro.observe(host);
	live = L;
	syncText();
}

const ctl = loop(main, (dt, t) => tick(dt, t), { name: 'swatchbook' });
ctl.stop();

/* loop() also checks the tab and reduced motion; this adds: a live shader exists, its tile is on screen, Pause is off */
function updateGate() {
	const want = !!live && live.ready && !st.paused && (st.full || seen.has(st.active));
	if (want) ctl.start();
	else ctl.stop();
}

function tick(dt, t) {
	const L = live;
	if (!L || !L.ready) return;
	const eff = L.eff;
	const tx = ptr.inside ? ptr.tx : Math.sin(t * 0.21) * 0.6; // no pointer: a slow ghost drift
	const ty = ptr.inside ? ptr.ty : Math.cos(t * 0.17) * 0.6;
	const k = Math.min(1, dt * 3);
	const moving = Math.abs(tx - ptr.x) + Math.abs(ty - ptr.y) > 1e-3;
	ptr.x += (tx - ptr.x) * k;
	ptr.y += (ty - ptr.y) * k;
	L.time += dt * 1000 * cfg.speed * eff.rate;
	if (cfg.speed === 0 && !moving && !eff.scroll) return; // nothing changed: keep the frame
	const up = { u_offsetX: ptr.x * eff.amp, u_offsetY: ptr.y * eff.amp + (eff.scroll ? eff.scroll(L.time) : 0) };
	if (eff.drive) Object.assign(up, eff.drive(L.time));
	L.mount.setUniformValues(up);
	L.mount.setFrame(L.time);
}

/* the sliders: update the live shader at once, and redraw the other tiles' still frames when the value settles */
function applyCfgToLive() {
	if (!live || !live.ready) return;
	live.mount.setUniformValues(uniformsFor(live.eff, live.w, { texture: false, offset: [ptr.x * live.eff.amp, ptr.y * live.eff.amp] }));
	live.mount.setFrame(live.time);
}
let settle = 0;
function onSlider(key, final) {
	const s = sliders[key];
	const v = parseFloat(s.el.value);
	cfg[key] = v;
	s.out.textContent = s.fmt(v);
	s.el.setAttribute('aria-valuetext', s.fmt(v));
	if (key !== 'hue') {
		const min = parseFloat(s.el.min);
		const max = parseFloat(s.el.max);
		s.el.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
	}
	syncSettings();
	if (key === 'speed') return;
	applyCfgToLive();
	clearTimeout(settle);
	if (final) markDirty(ALL);
	else settle = setTimeout(() => markDirty(ALL), 180);
}
for (const key of Object.keys(sliders)) {
	sliders[key].el.addEventListener('input', () => onSlider(key, false));
	sliders[key].el.addEventListener('change', () => onSlider(key, true));
	onSlider(key, false);
}
clearTimeout(settle);

/* ---------- picking a tile ---------- */

function activate(i) {
	const was = tiles[st.active];
	was.cell.classList.remove('is-active');
	was.btn.removeAttribute('aria-current');
	st.active = i;
	const T = tiles[i];
	T.cell.classList.add('is-active');
	T.btn.setAttribute('aria-current', 'true');
	ptr.inside = false;
	syncText();
	syncSettings();
}
function setActive(i) {
	if (i === st.active && live) return;
	activate(i);
	startLive();
}

function syncText() {
	const rm = prefersReducedMotion();
	const isLive = !!live;
	tiles.forEach((T) => {
		T.stateEl.textContent = T.i === st.active && isLive ? (st.paused ? 'Paused' : 'Live') : 'Still';
	});
	const eff = FX[st.active];
	nowEl.textContent = !st.webgl ? 'Painted swatches · no WebGL' : `${eff.name} · ${rm ? 'Still' : isLive ? (st.paused ? 'Paused' : 'Live') : 'Loading'}`;
	openBtn.textContent = st.full ? 'Close full screen' : 'Open full screen';
}
function syncControls() {
	const rm = prefersReducedMotion();
	pauseBtn.disabled = rm || !st.webgl;
	sliders.speed.el.disabled = rm || !st.webgl;
	sliders.scale.el.disabled = !st.webgl;
	sliders.hue.el.disabled = !st.webgl;
}
function say(text) {
	statusEl.textContent = '';
	setTimeout(() => { statusEl.textContent = text; }, 40);
}

/* hover (mouse and pen) picks a tile after a short dwell, so sweeping across the wall does not compile every shader */
let dwell = 0;
let dwellFor = -1;
let hold = 0; // after the full screen view closes, the pointer may be resting on another tile: don't pick it for a moment
tiles.forEach((T) => {
	const { btn, i } = T;
	// keyboard focus picks it too (a mouse or touch press is handled below)
	btn.addEventListener('focus', () => {
		if (!st.full && btn.matches(':focus-visible')) setActive(i);
	});
	btn.addEventListener('pointerdown', (ev) => {
		st.lastType = ev.pointerType;
		st.downActive = i === st.active;
	});
	btn.addEventListener('click', (ev) => {
		const touch = ev.detail !== 0 && st.lastType === 'touch';
		st.lastType = '';
		if (touch && !st.downActive) setActive(i); // touch: the first tap picks it, the next opens it
		else openFull(i);
	});
	btn.addEventListener('keydown', (ev) => {
		const cols = parseInt(getComputedStyle(wall).getPropertyValue('--cols'), 10) || 4;
		const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
		if (move === undefined) return;
		const to = tiles[i + move];
		if (to) {
			ev.preventDefault();
			to.btn.focus();
		}
	});
});

/* the pointer nudges the picked shader's offset (on its tile, or anywhere in the full screen view) */
wall.addEventListener('pointermove', (ev) => {
	if (ev.pointerType === 'touch' || st.full) return;
	const cell = ev.target.closest('.cell');
	const over = cell ? +cell.dataset.i : -1;
	if (over !== st.active) {
		ptr.inside = false;
		if (over < 0) {
			clearTimeout(dwell);
			dwellFor = -1;
		} else if (dwellFor !== over && performance.now() >= hold) {
			clearTimeout(dwell);
			dwellFor = over;
			dwell = setTimeout(() => {
				dwellFor = -1;
				setActive(over);
			}, 110);
		}
		return;
	}
	clearTimeout(dwell);
	dwellFor = -1;
	const r = tiles[st.active].art.getBoundingClientRect();
	ptr.tx = Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width - 0.5) * 2));
	ptr.ty = Math.max(-1, Math.min(1, ((ev.clientY - r.top) / r.height - 0.5) * 2));
	ptr.inside = true;
});
wall.addEventListener('pointerleave', () => {
	ptr.inside = false;
	clearTimeout(dwell);
	dwellFor = -1;
});
full.addEventListener('pointermove', (ev) => {
	if (ev.pointerType === 'touch') return;
	const r = full.getBoundingClientRect();
	ptr.tx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
	ptr.ty = ((ev.clientY - r.top) / r.height - 0.5) * 2;
	ptr.inside = true;
});
full.addEventListener('pointerleave', () => { ptr.inside = false; });

/* a tile's visibility (the page scrolls on a phone): the live shader waits while its tile is off-screen */
const tileIO = new IntersectionObserver((entries) => {
	entries.forEach((e) => {
		const i = tiles.findIndex((T) => T.art === e.target);
		if (e.isIntersecting) seen.add(i);
		else seen.delete(i);
	});
	updateGate();
});
tiles.forEach((T) => tileIO.observe(T.art));

/* ---------- the full screen view ---------- */

function openFull(i) {
	if (st.full) return;
	clearTimeout(dwell);
	activate(i);
	st.full = true;
	document.body.classList.add('is-full');
	slot.style.minHeight = `${tune.offsetHeight}px`;
	wall.inert = true;
	fullName.textContent = FX[i].name;
	full.setAttribute('aria-label', `${FX[i].name}, full screen`);
	full.inert = false;
	full.classList.add('is-open');
	if (!st.webgl) full.style.background = FX[i].fallback;
	// on a phone the panel folds to its title and buttons, so the view keeps the screen
	const toggle = $('.info-toggle', info);
	if (toggle && matchMedia('(max-width: 720px)').matches && info.dataset.collapsed !== 'true') {
		toggle.click();
		st.autoCollapsed = true;
	}
	drawFullStill(i);
	startLive();
	closeBtn.focus({ preventScroll: true });
	say(`${FX[i].name}, full screen. Press Escape to close.`);
}
function closeFull() {
	if (!st.full) return;
	const i = st.active;
	st.full = false;
	stopLive();
	document.body.classList.remove('is-full');
	slot.style.minHeight = '';
	full.classList.remove('is-open');
	full.inert = true;
	wall.inert = false;
	hold = performance.now() + 600;
	if (st.autoCollapsed) {
		$('.info-toggle', info)?.click();
		st.autoCollapsed = false;
	}
	markDirty([i]); // the tile's frame is redrawn from the shader's current time
	startLive();
	tiles[i].btn.focus({ preventScroll: true });
}
closeBtn.addEventListener('click', closeFull);
document.addEventListener('keydown', (ev) => {
	if (ev.key === 'Escape' && st.full) closeFull();
});
openBtn.addEventListener('click', () => (st.full ? closeFull() : openFull(st.active)));

/* ---------- Pause ---------- */

pauseBtn.addEventListener('click', () => {
	st.paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(st.paused));
	pauseBtn.textContent = st.paused ? 'Play' : 'Pause';
	updateGate();
	syncText();
});

/* ---------- Copy settings: only on a click ---------- */

function settingsText() {
	const eff = FX[st.active];
	const out = {
		shader: eff.component,
		library: '@paper-design/shaders@0.0.82',
		speed: +(eff.rate * cfg.speed).toFixed(3),
		scale: +cfg.scale.toFixed(2),
		fit: eff.fit,
	};
	if (eff.colors) out.colors = eff.colors.map((c) => shift(c, cfg.hue));
	for (const [k, v] of Object.entries(eff.colorProps || {})) out[k] = shift(v, cfg.hue);
	Object.assign(out, eff.params);
	// two-space JSON, with each colour list on one line
	return JSON.stringify(out, null, 2).replace(/\[\s+([^\]]+?)\s+\]/g, (m, inner) => `[${inner.replace(/\s*\n\s*/g, ' ')}]`);
}
/* the readout under the sliders shows exactly what Copy settings will copy */
function syncSettings() {
	box.value = settingsText();
}
let copyTimer = 0;
function flash(label) {
	copyLabel.textContent = label;
	copyBtn.classList.add('is-done');
	clearTimeout(copyTimer);
	copyTimer = setTimeout(() => {
		copyLabel.textContent = 'Copy settings';
		copyBtn.classList.remove('is-done');
	}, 2000);
}
copyBtn.addEventListener('click', async () => {
	const text = settingsText();
	let ok = false;
	try {
		await navigator.clipboard.writeText(text);
		ok = true;
	} catch (err) {
		ok = false;
	}
	if (ok) {
		box.classList.remove('is-forced');
		flash('Copied');
		say(`Copied the ${FX[st.active].name} settings.`);
	} else {
		box.classList.add('is-forced');
		box.value = text;
		box.focus();
		box.select();
		say('The browser would not copy for us. The settings are selected: press Control and C.');
	}
});

/* ---------- reduced motion, resize ---------- */

reducedMotionQuery.addEventListener?.('change', () => {
	syncControls();
	if (prefersReducedMotion()) stopLive();
	else startLive();
	markDirty(ALL);
	syncText();
});

let rz = 0;
addEventListener('resize', () => {
	clearTimeout(rz);
	rz = setTimeout(() => {
		const changed = tiles.some((T) => Math.abs(T.art.clientWidth * (Math.min(2, devicePixelRatio || 1)) - T.still.width) > 2);
		if (changed) markDirty(ALL);
	}, 220);
});

/* ---------- start ---------- */

boot();
syncControls();
activate(0);
(async () => {
	noise = getShaderNoiseTexture();
	try { await noise.decode(); } catch (err) { /* the data URL decodes at once in practice */ }
	await drawTileStill(0);
	startLive();
	markDirty(ALL.slice(1));
})();
