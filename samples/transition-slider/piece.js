/*
 * Sample 58 — "Transition Lab Hero Slider".
 * Three pictures blend into one another through a WebGL 2 fragment shader (OGL draws one full-screen triangle).
 * The shader supplies the three names every gl-transitions function expects: getFromColor(uv), getToColor(uv) and
 * a `progress` from 0 to 1. The pictures are cover-cropped inside the shader (so any window shape fits), and eight
 * transitions (transitions.js) take turns. One loop() runs the slideshow: a hold, then a blend, then the next
 * transition in the chip row. A glass plate names the picture and a ring, redrawn as an SVG arc each frame, shows
 * how far along the cycle is. Scrub mode swaps the timer for the pointer: dragging across the picture, or moving the
 * slider, sets the blend; a slow ghost hand keeps sweeping it when nobody is touching it. Nothing runs off-screen or
 * in a hidden tab, and under reduced motion the first picture is drawn once, the chips and Next cut straight to the
 * next picture, and Scrub moves only while you drag. A browser without WebGL 2 shows the first picture as a plain
 * image with a note.
 *
 * Adapted from the gl-transitions collection (https://github.com/gl-transitions/gl-transitions, commit
 * 0efa1651dfdbc0cdbd57f4cda55f12d8b3dbc0c5), MIT; the transition functions and the authors of each one are named in
 * transitions.js. What is taken here is the contract (a function of uv and `progress` that reads the two pictures
 * through getFromColor and getToColor) and the cover-crop idea; the wrapper shader, the slideshow, the ring, the
 * Scrub mode and the page are new code.
 *
 * MIT License
 *
 * Copyright (c) 2017-present gl-transitions contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * OGL (vendor/ogl@1.0.11) is Unlicense; see vendor/ogl@1.0.11/LICENSE.txt.
 */
import { Renderer } from '../../vendor/ogl@1.0.11/src/core/Renderer.js';
import { Program } from '../../vendor/ogl@1.0.11/src/core/Program.js';
import { Mesh } from '../../vendor/ogl@1.0.11/src/core/Mesh.js';
import { Texture } from '../../vendor/ogl@1.0.11/src/core/Texture.js';
import { Triangle } from '../../vendor/ogl@1.0.11/src/extras/Triangle.js';
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import { TRANSITIONS } from './transitions.js';

const REDUCED = prefersReducedMotion();

/* ---------- the pictures ---------- */
/* fx, fy: where the picture's point of interest sits (0 to 1 from the left and from the top), so a tall window crops around it */
const SLIDES = [
	{ key: 'dawn', cap: 'Dawn glass', fx: 0.54, fy: 0.5 },
	{ key: 'aurora', cap: 'Aurora lake', fx: 0.5, fy: 0.42 },
	{ key: 'cliffs', cap: 'Blue hour cliffs', fx: 0.42, fy: 0.45 },
];
const N = SLIDES.length;
const M = TRANSITIONS.length;
const IMAGE_ASPECT = 1.5; // all three are 3:2
const SIZE = innerWidth <= 720 ? 768 : 1536;
const imageURL = (key, size = SIZE) => `../../img/art/transition-slider-${key}-${size}.webp`;

/* ---------- timing ---------- */
const HOLD = 2.6; // seconds a picture rests before the next blend starts
const IDLE = 1.4; // seconds without a touch before the ghost hand sweeps the blend again in Scrub mode
const SWEEP = 3.6; // seconds for the ghost hand to sweep a whole blend
const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);
const unease = (p) => Math.acos(1 - 2 * Math.min(1, Math.max(0, p))) / Math.PI;
const smooth = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/* ---------- the page ---------- */
const screenEl = document.querySelector('.piece-screen');
const slider = document.querySelector('.slider');
const canvas = slider.querySelector('.piece');
const poster = slider.querySelector('.poster');
const plate = slider.querySelector('.plate');
const ringArc = plate.querySelector('.ring__arc');
const countEl = plate.querySelector('.plate__count');
const capEl = plate.querySelector('.plate__cap');
const textEl = plate.querySelector('.plate__text');
const chips = [...slider.querySelectorAll('.chip')];
const scrubRow = slider.querySelector('.scrub');
const range = scrubRow.querySelector('input');
const infoEl = document.querySelector('.sample-info');
const nextBtn = document.querySelector('[data-action="next"]');
const scrubBtn = document.querySelector('[data-action="scrub"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

/* ---------- state ---------- */
const state = {
	cur: 0, // the picture showing (the one being blended in is cur + 1)
	idx: 0, // the transition in use: the one playing, or the one that plays next
	mode: 'auto', // 'auto' (the timer) or 'scrub' (the pointer, or the ghost hand)
	t: 0, // auto: seconds into the cycle (a hold, then the blend)
	progress: 0, // the blend, 0 to 1
	target: 0, // scrub: where the blend is heading
	idle: IDLE, // scrub: seconds since the last touch
	dragging: false,
	paused: false,
	manual: false, // a blend started by a click runs to its end even while paused
};
let ready = false;
let ctl = null; // the loop() controller
let rangeDown = false;

/* ---------- WebGL (OGL) ---------- */
let renderer = null;
let gl = null;
let mesh = null;
let programs = [];
let textures = [];
let images = [];
let maps = [];
let lods = [];
let lost = false;
let dirty = true;
let dpr = Math.min(1.5, window.devicePixelRatio || 1); // heavy fragment work: capped at 1.5, lowered further if frames run long

const U = {
	tFrom: { value: null },
	tTo: { value: null },
	progress: { value: 0 },
	mapFrom: { value: [1, 1, 0, 0] },
	mapTo: { value: [1, 1, 0, 0] },
	lodFrom: { value: 0 },
	lodTo: { value: 0 },
};

const VERT = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* what a gl-transitions function expects to find: getFromColor, getToColor, progress. The pictures are cover-cropped
   here (mapFrom / mapTo = scale and offset into the texture) and sampled at a fixed mip level, so a transition that
   jumps its coordinates (pixelize, dots) leaves no seams */
const HEAD = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform float progress;
uniform vec4 mapFrom;
uniform vec4 mapTo;
uniform float lodFrom;
uniform float lodTo;
in vec2 vUv;
out vec4 fragColor;
vec4 getFromColor(vec2 uv) { return textureLod(tFrom, uv * mapFrom.xy + mapFrom.zw, lodFrom); }
vec4 getToColor(vec2 uv) { return textureLod(tTo, uv * mapTo.xy + mapTo.zw, lodTo); }
`;
const TAIL = `
void main() {
	fragColor = vec4(transition(vUv).rgb, 1.0);
}
`;

function programFor(i) {
	if (!programs[i]) {
		programs[i] = new Program(gl, {
			vertex: VERT,
			fragment: HEAD + TRANSITIONS[i].glsl + TAIL,
			uniforms: U,
			cullFace: false,
			depthTest: false,
			depthWrite: false,
		});
	}
	return programs[i];
}

function initContext() {
	const attrs = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'default' };
	if (!canvas.getContext('webgl2', attrs)) return false;
	renderer = new Renderer({ canvas, dpr, alpha: false, antialias: false, depth: false, webgl: 2 });
	if (!renderer.isWebgl2) return false;
	gl = renderer.gl;
	return true;
}

function buildScene() {
	programs = [];
	textures = images.map((image) => new Texture(gl, {
		image,
		generateMipmaps: true,
		minFilter: gl.LINEAR_MIPMAP_LINEAR,
		magFilter: gl.LINEAR,
	}));
	mesh = new Mesh(gl, { geometry: new Triangle(gl), program: programFor(state.idx) });
	resize();
}

/* the canvas matches the picture area; the cover-crop maps and mip levels follow its shape */
function resize() {
	if (!renderer) return;
	const r = slider.getBoundingClientRect();
	const w = Math.max(2, Math.round(r.width));
	const h = Math.max(2, Math.round(r.height));
	renderer.dpr = dpr;
	renderer.setSize(w, h);
	canvas.style.width = '100%'; // OGL pins the canvas to pixel sizes; the CSS sizes it
	canvas.style.height = '100%';
	const W = canvas.width;
	const H = canvas.height;
	const ca = W / H;
	maps = SLIDES.map((s) => {
		let sx = 1;
		let sy = 1;
		if (ca > IMAGE_ASPECT) sy = IMAGE_ASPECT / ca;
		else sx = ca / IMAGE_ASPECT;
		return [sx, sy, (1 - sx) * s.fx, (1 - sy) * (1 - s.fy)];
	});
	lods = images.map((img, i) => Math.max(0, Math.log2((maps[i][0] * (img.naturalWidth || SIZE)) / W)));
	dirty = true;
	if (ready) frame(true);
}

function render() {
	if (!renderer || lost || !mesh) return;
	const a = state.cur;
	const b = (state.cur + 1) % N;
	U.tFrom.value = textures[a];
	U.tTo.value = textures[b];
	U.mapFrom.value = maps[a];
	U.mapTo.value = maps[b];
	U.lodFrom.value = lods[a];
	U.lodTo.value = lods[b];
	U.progress.value = state.progress;
	mesh.program = programFor(state.idx);
	renderer.render({ scene: mesh });
}

/* ---------- the glass plate, the chips, the ring ---------- */
let shown = -1;
let shownOpacity = -1;
let shownChip = -1;
let shownArc = -1;
let shownRange = -1;
let lastP = -1;
let lastCur = -1;
let lastIdx = -1;

function ringPath(f) {
	const R = 18;
	const C = 22;
	if (f <= 0.002) return '';
	if (f >= 0.998) return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R}`;
	const a = f * Math.PI * 2;
	return `M ${C} ${C - R} A ${R} ${R} 0 ${f > 0.5 ? 1 : 0} 1 ${(C + R * Math.sin(a)).toFixed(2)} ${(C - R * Math.cos(a)).toFixed(2)}`;
}

function syncChips() {
	if (state.idx === shownChip) return;
	shownChip = state.idx;
	chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === state.idx)));
}

function syncPlate() {
	const p = state.progress;
	const idx = p < 0.5 ? state.cur : (state.cur + 1) % N;
	if (idx !== shown) {
		shown = idx;
		countEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
		capEl.textContent = SLIDES[idx].cap;
	}
	// the caption fades out before the blend is half done and back in after it (the timer only: a hand-held blend keeps it visible)
	const o = state.mode === 'auto' && !REDUCED ? smooth(0, 0.3, Math.abs(p - 0.5)) : 1;
	if (Math.abs(o - shownOpacity) > 0.004) {
		shownOpacity = o;
		textEl.style.opacity = o.toFixed(3);
		textEl.style.transform = `translate3d(0, ${((1 - o) * 6).toFixed(2)}px, 0)`;
	}
}

function syncRing() {
	const total = HOLD + TRANSITIONS[state.idx].seconds;
	const f = state.mode === 'auto' ? state.t / total : state.progress;
	if (Math.abs(f - shownArc) > 0.0015) {
		shownArc = f;
		ringArc.setAttribute('d', ringPath(f));
	}
}

function syncRange() {
	if (state.mode !== 'scrub' || rangeDown) return;
	if (document.activeElement === range && state.idle < IDLE) return; // the visitor is using the keys on it
	const v = Math.round(state.progress * 1000);
	if (v !== shownRange) {
		shownRange = v;
		range.value = String(v);
	}
}

/* one frame of the picture and its furniture */
function frame(force) {
	if (force || dirty || state.progress !== lastP || state.cur !== lastCur || state.idx !== lastIdx) {
		render();
		lastP = state.progress;
		lastCur = state.cur;
		lastIdx = state.idx;
		dirty = false;
	}
	syncChips();
	syncPlate();
	syncRing();
	syncRange();
}

/* ---------- the slideshow ---------- */

function finishHop() {
	state.cur = (state.cur + 1) % N;
	state.idx = (state.idx + 1) % M;
	state.progress = 0;
	state.t = 0;
	state.manual = false;
}

function tickAuto(dt) {
	if (!state.paused || state.manual) state.t += dt;
	const dur = TRANSITIONS[state.idx].seconds;
	if (state.t >= HOLD + dur) finishHop();
	const u = (state.t - HOLD) / TRANSITIONS[state.idx].seconds;
	state.progress = u > 0 ? ease(Math.min(1, u)) : 0;
}

function swapScrub() {
	state.cur = (state.cur + 1) % N;
	state.idx = (state.idx + 1) % M;
	state.progress = 0;
	state.target = 0;
}

function tickScrub(dt) {
	if (!state.dragging) state.idle += dt;
	if (!state.dragging && !state.paused && state.idle > IDLE) state.target = Math.min(1, state.target + dt / SWEEP);
	state.progress += (state.target - state.progress) * (1 - Math.exp(-12 * dt));
	if (Math.abs(state.target - state.progress) < 0.0005) state.progress = state.target;
	if (!state.dragging && state.target >= 0.999 && state.progress >= 0.996) swapScrub();
}

/* start a blend now: the chip's transition, from the picture showing to the next */
function playNow(i) {
	if (!ready) return;
	if (state.progress > 0) {
		// a blend is under way: finish it at once, then start the new one
		state.cur = (state.cur + 1) % N;
		state.progress = 0;
	}
	state.idx = i;
	if (REDUCED) {
		state.cur = (state.cur + 1) % N; // a cut: no blend, the next picture straight away
		frame(true);
		return;
	}
	state.mode = 'auto';
	setScrubUI(false);
	state.t = HOLD;
	state.manual = true;
	wake();
}

function onChip(i) {
	if (!ready) return;
	if (state.mode === 'scrub') {
		state.idx = i;
		if (REDUCED || !(ctl && ctl.running)) frame(true);
		else wake();
		return;
	}
	playNow(i);
}

function onNext() {
	if (!ready) return;
	if (state.mode === 'scrub') {
		state.target = 1;
		state.idle = 0;
		if (REDUCED) { state.progress = 1; swapScrub(); frame(true); } else wake();
		return;
	}
	playNow(state.progress > 0 && !REDUCED ? (state.idx + 1) % M : state.idx);
}

function setScrubUI(on) {
	document.body.classList.toggle('is-scrub', on);
	scrubRow.hidden = !on;
	scrubBtn.setAttribute('aria-pressed', String(on));
}

function onScrub() {
	if (!ready) return;
	const on = state.mode !== 'scrub';
	state.mode = on ? 'scrub' : 'auto';
	state.dragging = false;
	if (on) {
		state.target = state.progress;
		state.idle = 0;
		state.manual = false;
		shownRange = -1;
	} else if (state.progress > 0) {
		// back to the timer: carry on from the same blend
		state.t = HOLD + unease(state.progress) * TRANSITIONS[state.idx].seconds;
		state.manual = state.paused;
	}
	setScrubUI(on);
	if (REDUCED) frame(true); else wake();
}

function onPause() {
	if (!ready || REDUCED) return;
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	state.paused = paused;
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	// a blend that has begun runs to its end before everything rests
	if (paused && state.mode === 'auto' && state.progress > 0) state.manual = true;
	if (!paused) state.manual = false;
	wake();
}

/* the loop sleeps when nothing is moving (paused and settled); anything the visitor does wakes it */
function wake() {
	if (ctl && !REDUCED) ctl.start();
}

function settled() {
	if (!state.paused || state.dragging || state.manual) return false;
	return state.mode === 'auto' || state.progress === state.target;
}

/* ---------- scrubbing by hand ---------- */

function setTarget(x) {
	state.target = Math.min(1, Math.max(0, x));
	state.idle = 0;
	if (REDUCED) {
		state.progress = state.target;
		frame(true);
	} else wake();
}

function pointerX(ev) {
	const r = slider.getBoundingClientRect();
	// a little margin at both ends, so the very left and right are easy to reach
	return ((ev.clientX - r.left) / r.width - 0.04) / 0.92;
}

function endDrag() {
	if (!state.dragging) return;
	state.dragging = false;
	state.idle = 0;
	if (REDUCED) {
		if (state.target >= 0.985) { state.progress = 1; swapScrub(); frame(true); }
	} else wake();
}

slider.addEventListener('pointerdown', (ev) => {
	if (state.mode !== 'scrub' || !ready || ev.button > 0 || ev.target.closest('.rail, .plate')) return;
	state.dragging = true;
	slider.setPointerCapture(ev.pointerId);
	setTarget(pointerX(ev));
});
slider.addEventListener('pointermove', (ev) => {
	if (state.dragging) setTarget(pointerX(ev));
});
slider.addEventListener('pointerup', endDrag);
slider.addEventListener('pointercancel', endDrag);

range.addEventListener('pointerdown', () => {
	rangeDown = true;
	state.dragging = true; // holding the slider holds the blend where it is
});
addEventListener('pointerup', () => {
	if (!rangeDown) return;
	rangeDown = false;
	endDrag();
});
range.addEventListener('input', () => {
	setTarget(Number(range.value) / 1000);
	if (REDUCED && state.target >= 0.985) { state.progress = 1; swapScrub(); frame(true); }
});

chips.forEach((c, i) => c.addEventListener('click', () => onChip(i)));
nextBtn.addEventListener('click', onNext);
scrubBtn.addEventListener('click', onScrub);
pauseBtn.addEventListener('click', onPause);

/* ---------- long frames: lower the resolution a step ---------- */
let ema = 1 / 60;
let slow = 0;
function governor(dt) {
	if (state.progress <= 0 || state.progress >= 1) return;
	ema += (dt - ema) * 0.08;
	if (ema > 0.028 && dpr > 0.75) {
		if (++slow > 20) {
			slow = 0;
			ema = 1 / 60;
			dpr = Math.max(0.75, dpr - 0.25);
			resize();
		}
	} else slow = 0;
}

/* compile the other transitions one at a time while a picture is resting, so no blend starts with a stall */
function warm() {
	if (state.progress > 0) return;
	for (let k = 0; k < M; k++) {
		if (!programs[k]) { programFor(k); return; }
	}
}

/* ---------- layout: on a phone the picture stops above the info panel ---------- */
const narrow = matchMedia('(max-width: 720px)');
function updateDock() {
	if (!narrow.matches) {
		slider.style.setProperty('--dock', '0px');
		return;
	}
	const w = screenEl.getBoundingClientRect();
	const p = infoEl.getBoundingClientRect();
	const bottom = Math.max(0, w.bottom - p.top) + 10;
	slider.style.setProperty('--dock', `${Math.round(bottom)}px`);
}

/* ---------- no WebGL: the first picture as a plain image ---------- */
function fallback() {
	ready = false;
	document.body.classList.add('is-fallback');
	canvas.hidden = true;
	const img = poster.querySelector('img');
	img.src = img.dataset.src.replace('-1536', `-${SIZE}`);
	poster.hidden = false;
	plate.querySelector('.ring').setAttribute('hidden', ''); // an SVG element has no .hidden property
	countEl.hidden = true;
	capEl.textContent = SLIDES[0].cap;
	[nextBtn, scrubBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	if (ctl) ctl.stop();
}

/* ---------- start ---------- */
function loadImage(slide) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`could not load ${slide.key}`));
		img.src = imageURL(slide.key);
	});
}

async function start() {
	boot();
	// on a short phone, or a phone held sideways, the panel starts folded so the picture gets the room
	if (matchMedia('(max-width: 720px) and (max-height: 699px), (max-height: 520px)').matches) document.querySelector('.info-toggle')?.click();
	updateDock();
	new ResizeObserver(updateDock).observe(infoEl);
	addEventListener('resize', updateDock);
	narrow.addEventListener('change', updateDock);

	if (REDUCED) pauseBtn.disabled = true;

	if (!initContext()) {
		fallback();
		return;
	}
	try {
		images = await Promise.all(SLIDES.map(loadImage));
	} catch (err) {
		fallback();
		return;
	}
	buildScene();
	ready = true;
	frame(true);

	canvas.addEventListener('webglcontextlost', (ev) => {
		ev.preventDefault();
		lost = true;
		setTimeout(() => { if (lost) fallback(); }, 3000);
	});
	canvas.addEventListener('webglcontextrestored', () => {
		lost = false;
		if (!initContext()) { fallback(); return; }
		buildScene();
		dirty = true;
		frame(true);
	});

	new ResizeObserver(resize).observe(slider);

	if (REDUCED) return; // the first picture, drawn once; nothing else runs

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, (dt) => {
		if (!ready) return;
		if (state.mode === 'auto') tickAuto(dt);
		else tickScrub(dt);
		frame(false);
		governor(dt);
		warm();
		if (settled()) ctl.stop();
	}, { name: 'transition-slider' });
}

start();
