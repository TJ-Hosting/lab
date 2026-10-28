/*
 * Sample 16 — "Liquid Metal Monogram".
 * The TJ mark poured in liquid metal: the Paper Shaders liquid-metal GLSL shader, masked by the site's own mark (img/brand/tj-mark.svg),
 * sits on a frosted light-glass slab. Moving stripes of light and dark run through the letters and split into red and blue at the
 * edges. The pointer (or a finger dragged over the mark) turns the stripes; with no pointer a slow ghost pointer does it. Two metals,
 * "Chrome" and "Ice blue" (a cyan tint with a stronger split), are switched by a click on the mark, the chips or the panel button, and
 * ease into each other.
 *
 * Motion: the library's own requestAnimationFrame loop is never used. The ShaderMount is created with speed 0 (so it schedules no
 * frames of its own) and is driven from inside loop() (js/lab.js) with setFrame(), which renders synchronously. loop() runs only
 * while the mark is on screen, the tab is visible, Pause is off and reduced motion is off; so off-screen, in a hidden tab and under
 * reduced motion there are no requestAnimationFrame callbacks. Under reduced motion the mark is one still frame of chrome and a
 * metal switch redraws it once.
 *
 * Mask: the SVG's glyph path is taken from the file at runtime (the badge, its outline and the scanline stripes are dropped), drawn
 * solid on a transparent canvas, and run through the library's own toProcessedLiquidMetal() (a Poisson solve that gives the shader
 * an edge-distance map). The result is turned into an image through a data: URL, so no blob: source and no CSP change is needed.
 *
 * Uses Paper Shaders (@paper-design/shaders 0.0.82), https://github.com/paper-design/shaders, Copyright 2026 Paper,
 * Licensed under the Apache License, Version 2.0 (vendor/paper-design-shaders@0.0.82/LICENSE; its NOTICE sits beside it).
 * NOTICE text: "Paper Shaders. Copyright 2026 Paper. Powered by Paper Shaders: https://shaders.paper.design"
 * Source for the effect: the library's Liquid metal shader, https://shaders.paper.design/liquid-metal (parameter names and the
 * mask-image pipeline).
 *
 * What changed from the library's own use: the vendored files are imported one by one (no bundle, no React wrapper); the mask is the
 * TJ glyph rasterised here instead of an uploaded file; ShaderMount runs at speed 0 and is stepped from loop(); the stripe angle is
 * steered by an eased pointer with an idle ghost pointer; the two metals (chrome, ice blue) are parameter sets that ease into each
 * other; the sky plate, the slab, the chips and the no-WebGL fallback are new. No library file was edited.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import { ShaderMount } from '../../vendor/paper-design-shaders@0.0.82/shader-mount.js';
import { ShaderFitOptions } from '../../vendor/paper-design-shaders@0.0.82/shader-sizing.js';
import { getShaderColorFromString } from '../../vendor/paper-design-shaders@0.0.82/get-shader-color-from-string.js';
import { liquidMetalFragmentShader, LiquidMetalShapes, toProcessedLiquidMetal } from '../../vendor/paper-design-shaders@0.0.82/shaders/liquid-metal.js';

const MARK_URL = '../../img/brand/tj-mark.svg';

/* ---------- the two metals ----------
   Paper's own parameter names (a uniform is u_ + the name). tint is [r, g, b, a]; with a = 0 it does nothing (plain chrome).
   shiftRed / shiftBlue: how far the red and blue stripes slide off the green ones (the colour split at the edges).
   repetition: stripes per mark. softness: edge blur. distortion: how much the noise bends the stripes. contour: how hard the
   edge is (to 0.4) and how much the stripes follow the letter's edge (above 0.5). */

const CYAN = getShaderColorFromString('#46d0fb');
const METALS = {
	chrome: { name: 'Chrome', tint: [1, 1, 1, 0], shiftRed: 0.22, shiftBlue: 0.32, repetition: 3.4, softness: 0.1, distortion: 0.1, contour: 0.85 },
	ice: { name: 'Ice blue', tint: [CYAN[0], CYAN[1], CYAN[2], 0.9], shiftRed: 0.32, shiftBlue: 0.5, repetition: 3, softness: 0.12, distortion: 0.11, contour: 0.85 },
};
const ORDER = ['chrome', 'ice'];

const SPEED = 1; // Paper's speed: the shader's clock runs at this many seconds per second
const STILL_MS = 4000; // the reduced-motion frame: where the stripes happen to fall (chosen by eye)
const STILL_ANGLE = 70; // and its stripe angle
const ANGLE_X = 44; // degrees the stripes turn from the left edge to the right edge of the screen
const ANGLE_Y = 18;
const IDLE_AFTER = 2.4; // seconds without a pointer before the ghost pointer takes over

const $ = (sel, root = document) => root.querySelector(sel);
const mark = $('#mark');
const plain = $('#plain');
const chips = [...document.querySelectorAll('.chip')];
const switchBtn = $('[data-action="switch"]');
const pauseBtn = $('[data-action="pause"]');
const status = $('#status');
const info = $('.sample-info');
const stage = $('.stage--metal');
const hint = $('.hint');
const slab = $('.slab');

let mount = null;
let ctl = null;
let metal = 'chrome';
let ms = 1800; // the shader's clock, in milliseconds (a Paper "frame")
let cur = { ...METALS.chrome, tint: [...METALS.chrome.tint] }; // the values on screen (they ease toward the picked metal)
const aim = { x: 0, y: 0 }; // where the light points, -1 to 1 (eased toward the pointer, or toward the ghost)
const ptr = { x: 0, y: 0, last: -99 }; // the last real pointer, and when (seconds on the shader's clock)
let ghostMs = 0;
const drag = { id: -1, x: 0, y: 0, t: 0, moved: false };

const phone = () => innerWidth < 720 || matchMedia('(pointer: coarse)').matches;
/* the render scale: 2x (the library's own default, which also smooths a 1x screen), 1.5x on phones */
const renderScale = () => (phone() ? 1.5 : 2);

/* ---------- the mask: the TJ glyph from the site's own mark, solid on a transparent canvas ---------- */

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('image failed to load'));
		img.src = src;
	});
}

async function buildMask(size) {
	const res = await fetch(MARK_URL);
	if (!res.ok) throw new Error('the mark could not be fetched');
	const svg = new DOMParser().parseFromString(await res.text(), 'image/svg+xml').documentElement;
	if (svg.localName !== 'svg' || !svg.querySelector('path')) throw new Error('the mark has no glyph');
	// keep only the glyph: no badge (the rects), no gradients or stripe mask (the defs), one flat colour
	svg.querySelectorAll('rect, defs').forEach((n) => n.remove());
	svg.querySelectorAll('[mask]').forEach((n) => n.removeAttribute('mask'));
	svg.querySelectorAll('path').forEach((n) => n.setAttribute('fill', '#000'));
	svg.setAttribute('width', String(size));
	svg.setAttribute('height', String(size));
	const glyph = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`);

	const raster = document.createElement('canvas');
	raster.width = size;
	raster.height = size;
	raster.getContext('2d').drawImage(glyph, 0, 0, size, size); // transparent everywhere but the glyph

	// the library's own step: shape mask to an edge-distance map (R) and the cut-out (G)
	const { imageData } = await toProcessedLiquidMetal(raster.toDataURL('image/png'));
	const out = document.createElement('canvas');
	out.width = imageData.width;
	out.height = imageData.height;
	out.getContext('2d').putImageData(imageData, 0, 0);
	return loadImage(out.toDataURL('image/png'));
}

/* ---------- drawing ---------- */

const lerp = (a, b, k) => a + (b - a) * k;

/* one frame: set what changed, then render once (setFrame renders synchronously, because the mount is at speed 0) */
function paint() {
	mount.setUniformValues({
		u_angle: 70 + aim.x * ANGLE_X + aim.y * ANGLE_Y,
		u_colorTint: [...cur.tint],
		u_shiftRed: cur.shiftRed,
		u_shiftBlue: cur.shiftBlue,
		u_repetition: cur.repetition,
		u_softness: cur.softness,
		u_distortion: cur.distortion,
		u_contour: cur.contour,
	});
	mount.setFrame(ms);
}

function ease(dt) {
	const target = METALS[metal];
	const k = 1 - Math.exp(-dt * 5);
	for (const key of ['shiftRed', 'shiftBlue', 'repetition', 'softness', 'distortion', 'contour']) cur[key] = lerp(cur[key], target[key], k);
	cur.tint = cur.tint.map((v, i) => lerp(v, target.tint[i], k));
}

function snap() {
	const target = METALS[metal];
	cur = { ...target, tint: [...target.tint] };
}

function tick(dt) {
	ms += dt * 1000 * SPEED;
	const t = ms / 1000;
	// the light follows the pointer; with none for a while, a slow ghost pointer wanders instead
	let tx = ptr.x;
	let ty = ptr.y;
	if (t - ptr.last > IDLE_AFTER) {
		ghostMs += dt * 1000;
		const g = ghostMs / 1000;
		tx = Math.sin(g * 0.42) * 0.85;
		ty = Math.sin(g * 0.31 + 1.3) * 0.6;
	}
	const k = 1 - Math.exp(-dt * 3.2);
	aim.x += (tx - aim.x) * k;
	aim.y += (ty - aim.y) * k;
	ease(dt);
	paint();
}

/* the reduced-motion still: one finished frame of the picked metal, drawn once */
function still() {
	aim.x = (STILL_ANGLE - 70) / ANGLE_X;
	aim.y = 0;
	ms = STILL_MS;
	snap();
	paint();
}

/* ---------- the metals ---------- */

function setMetal(key, { announce = true } = {}) {
	if (!METALS[key] || !mount) return;
	metal = key;
	chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.metal === key)));
	mark.setAttribute('aria-label', `The TJ mark in liquid ${METALS[key].name.toLowerCase()}. Move the pointer to turn the light; click it to switch the metal.`);
	if (announce) status.textContent = `${METALS[key].name} metal`;
	// nothing is running (paused, off-screen or reduced motion): jump to it and redraw once
	if (!ctl.running) {
		snap();
		paint();
	}
}

const nextMetal = () => ORDER[(ORDER.indexOf(metal) + 1) % ORDER.length];

/* ---------- pointer: hover turns the light; a finger dragged over the mark does too; a tap on the mark switches ---------- */

function steer(x, y) {
	if (prefersReducedMotion()) return;
	ptr.x = Math.max(-1, Math.min(1, x));
	ptr.y = Math.max(-1, Math.min(1, y));
	ptr.last = ms / 1000;
}

function wire() {
	addEventListener('pointermove', (e) => {
		if (e.pointerType === 'touch') return; // a finger steers only while it is dragging the mark
		steer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
	}, { passive: true });

	mark.addEventListener('pointerdown', (e) => {
		drag.id = e.pointerId;
		drag.x = e.clientX;
		drag.y = e.clientY;
		drag.t = performance.now();
		drag.moved = false;
		if (e.pointerType === 'touch') mark.setPointerCapture?.(e.pointerId);
	});
	mark.addEventListener('pointermove', (e) => {
		if (e.pointerId !== drag.id) return;
		if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) drag.moved = true;
		if (e.pointerType === 'touch' && drag.moved) {
			const r = mark.getBoundingClientRect();
			steer(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
		}
	});
	mark.addEventListener('pointerup', (e) => {
		if (e.pointerId !== drag.id) return;
		drag.id = -1;
		if (!drag.moved && performance.now() - drag.t < 700) setMetal(nextMetal());
	});
	mark.addEventListener('pointercancel', () => { drag.id = -1; });

	chips.forEach((c) => c.addEventListener('click', () => setMetal(c.dataset.metal)));
	switchBtn.addEventListener('click', () => setMetal(nextMetal()));
}

/* ---------- a browser without WebGL (or a failed set-up): the plain mark and a short note ---------- */

function fallback() {
	mark.hidden = true;
	plain.hidden = false;
	slab.classList.add('is-plain');
	[...chips, switchBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	if (hint) hint.hidden = true;
	mount?.dispose();
	mount = null;
}

/* ---------- start ---------- */

function measureDock() {
	// the room the fixed panel takes on a narrow screen (it folds away, so this changes)
	stage.style.setProperty('--dock', `${Math.ceil(info.getBoundingClientRect().height) + 18 + 14}px`);
}

async function start() {
	boot();
	measureDock();
	new ResizeObserver(measureDock).observe(info);

	// a throw-away WebGL 2 context first, so a browser without it gets the plain mark and not the library's console errors
	const probe = document.createElement('canvas').getContext('webgl2');
	if (!probe) { fallback(); return; }
	probe.getExtension('WEBGL_lose_context')?.loseContext();

	try {
		const image = await buildMask(phone() ? 768 : 1024);
		const rect = mark.getBoundingClientRect();
		const pr = renderScale();
		const uniforms = {
			u_image: image,
			u_colorBack: [0, 0, 0, 0],
			u_colorTint: [...cur.tint],
			u_softness: cur.softness,
			u_repetition: cur.repetition,
			u_shiftRed: cur.shiftRed,
			u_shiftBlue: cur.shiftBlue,
			u_distortion: cur.distortion,
			u_contour: cur.contour,
			u_angle: 70,
			u_shape: LiquidMetalShapes.none,
			u_isImage: true,
			u_fit: ShaderFitOptions.contain,
			u_scale: 1.18,
			u_rotation: 0,
			u_offsetX: 0,
			u_offsetY: 0,
			u_originX: 0.5,
			u_originY: 0.5,
			u_worldWidth: 0,
			u_worldHeight: 0,
		};
		// speed 0: the mount never asks for a frame itself; loop() steps it. The pixel ratio and a pixel budget (render scale squared) set the cost.
		mount = new ShaderMount(mark, liquidMetalFragmentShader, uniforms, {}, 0, ms, pr, Math.round(rect.width * rect.height * pr * pr), ['u_image']);
		mount.canvasElement.setAttribute('aria-hidden', 'true');
		mount.canvasElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });
	} catch (err) {
		fallback();
		return;
	}

	ctl = loop(mark, (dt) => tick(dt), { name: 'liquid-metal' });
	wire();
	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (!mount) return;
			const r = mark.getBoundingClientRect();
			const p = renderScale();
			mount.setMaxPixelCount(Math.round(r.width * r.height * p * p)); // redraws once at the current frame
		}, 150);
	});

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});

	const sync = () => {
		pauseBtn.disabled = prefersReducedMotion();
		if (prefersReducedMotion()) still();
	};
	reducedMotionQuery.addEventListener?.('change', sync);
	sync();
	if (!prefersReducedMotion()) paint(); // the first frame, before the loop's first tick

	mark.classList.add('is-ready');
}

start();
