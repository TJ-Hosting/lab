/*
 * Sample 60 — "Relief Light Texture Board".
 * A flat board of carved stone, tooled leather or hammered metal, lit by one small lamp. A script (once per picture, at
 * load) reads the picture's light and dark on a canvas, blurs it into a height map, and runs a Sobel filter over that to
 * get the slope of the surface at every pixel; the slopes are stored in a data texture next to the height. A WebGL 2
 * fragment shader (OGL draws one full-screen triangle) turns the slope into a normal, scales it with the Relief slider and
 * lights it from the lamp: diffuse, a specular glint that differs per material, a few steps of self-shadow marched through
 * the height map toward the lamp, and a falloff, so the board is lit only where the lamp is and each carved edge throws a
 * hairline shadow. The lamp follows the pointer or a finger; left alone it drifts on a slow figure of eight. One loop()
 * runs it and the board is drawn only on frames where the lamp, the slider or the material changed; the loop sleeps when
 * everything has settled. It stops off-screen and in a hidden tab. Under reduced motion the board is drawn once, lit from
 * the top left; the lamp then moves only where you point it. A browser without WebGL 2 shows the stone as a plain image.
 *
 * Adapted from the OGL example "Normal Maps" (examples/normal-maps.html at commit b9e653ccac8e08211ce0678695d0a01f722e1fc2)
 * by oframe (Nathan Gordon), https://github.com/oframe/ogl, Unlicense (public domain). What is taken is the idea: a
 * tangent-space normal map whose x and y are scaled by one strength number, then dotted with a light direction. The rest is
 * new code: a flat plane (so no screen-space tangent frame is needed), a point lamp with falloff, the height map and its
 * normals derived from the picture's luminance, the self-shadow march, the three materials and the page. The example's
 * granite textures and rounded-cube model are not used; the three pictures are the site's own.
 *
 * This is free and unencumbered software released into the public domain.
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or
 * as a compiled binary, for any purpose, commercial or non-commercial, and by any means. For more information, please
 * refer to <https://unlicense.org>. OGL (vendor/ogl@1.0.11) is Unlicense too; see vendor/ogl@1.0.11/LICENSE.txt.
 */
import { Renderer } from '../../vendor/ogl@1.0.11/src/core/Renderer.js';
import { Program } from '../../vendor/ogl@1.0.11/src/core/Program.js';
import { Mesh } from '../../vendor/ogl@1.0.11/src/core/Mesh.js';
import { Texture } from '../../vendor/ogl@1.0.11/src/core/Texture.js';
import { Triangle } from '../../vendor/ogl@1.0.11/src/extras/Triangle.js';
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const REDUCED = prefersReducedMotion();
const PHONE = innerWidth <= 720;

/* ---------- the materials ---------- */
/* shine and spec shape the glint (a Blinn-Phong power and its strength); metal tints the glint with the picture's own colour;
   amb is how much of the board shows with the lamp far away */
const MATERIALS = [
	{ key: 'stone', amb: 0.036, shine: 18, spec: 0.28, metal: 0.0, lamp: [1.0, 0.97, 0.9] },
	{ key: 'leather', amb: 0.068, shine: 12, spec: 0.55, metal: 0.25, lamp: [0.92, 0.97, 1.0] },
	{ key: 'metal', amb: 0.055, shine: 60, spec: 1.15, metal: 0.85, lamp: [0.9, 0.97, 1.0] },
];
const TEX_SIZE = PHONE ? 640 : 1254; // which file to load
const WORK = PHONE ? 640 : 1024; // the height map's working size, in pixels
const texURL = (key) => `../../img/art/relief-light-board-${key}-${TEX_SIZE}.webp`;

/* ---------- the lamp ---------- */
const STILL = { x: 0.27, y: 0.3 }; // where the lamp rests for the reduced-motion frame: top left, low over the board
const IDLE = 2.4; // seconds without a touch before the lamp drifts again
const PATH_SPEED = 0.34; // radians a second along the figure of eight
const LAMP_Z = 0.19; // the lamp's height over the board, in board heights (low: raking)
const MIN_TEX_CSS = 560; // the picture is never shown smaller than this many CSS px across, so a phone sees a crop of it

/* the figure of eight (a Lissajous 1:2) over the board, in 0..1 board units */
function pathAt(phase) {
	return {
		x: 0.5 + 0.34 * Math.sin(phase) + 0.03 * Math.sin(phase * 0.37 + 1.3),
		y: 0.5 + 0.25 * Math.sin(phase * 2 + 0.6),
	};
}
const PHASE0 = -0.78; // the first frame: the lamp upper left, like the still

/* ---------- the page ---------- */
const screenEl = document.querySelector('.piece-screen');
const board = document.querySelector('.board');
const canvas = board.querySelector('.piece');
const poster = board.querySelector('.poster');
const rail = board.querySelector('.rail');
const chips = [...board.querySelectorAll('.chip')];
const range = board.querySelector('#relief');
const rangeOut = board.querySelector('#relief-out');
const infoEl = document.querySelector('.sample-info');
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

/* ---------- state ---------- */
const start0 = REDUCED ? STILL : pathAt(PHASE0);
const state = {
	mat: 0, // the material showing
	relief: Number(range.value) / 100, // 0 to 1
	x: start0.x, // where the lamp is, 0..1 across the board (y down)
	y: start0.y,
	tx: start0.x, // where it is heading
	ty: start0.y,
	phase: PHASE0, // along the figure of eight
	idle: IDLE + 1, // seconds since the visitor last moved the lamp
	hand: false, // a pointer is steering the lamp
	paused: false,
};
let ready = false;
let ctl = null; // the loop() controller
let want = 0; // the material the visitor asked for last (a picture may still be loading)

/* ---------- WebGL (OGL) ---------- */
let renderer = null;
let gl = null;
let mesh = null;
let lost = false;
let dirty = true;
let cssW = 1;
let cssH = 1;
let dpr = Math.min(1.5, window.devicePixelRatio || 1); // heavy fragment work: capped at 1.5, lowered further if frames run long

const U = {
	tAlbedo: { value: null },
	tRelief: { value: null },
	uCss: { value: [1, 1] },
	uTexCss: { value: MIN_TEX_CSS },
	uLight: { value: [0.3, 0.3] },
	uLz: { value: 100 },
	uRelief: { value: 0.6 },
	uMat: { value: [0.07, 18, 0.3, 0] },
	uLamp: { value: [1, 1, 1] },
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

/* tRelief: r, g = the surface slope in x and y (height units per pixel of a 1254 px picture, squared-companded so the soft
   grain keeps its precision in 8 bits), a = the blurred height, 0 to 1. Everything is in CSS pixels, y down, like the picture. */
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D tAlbedo;
uniform sampler2D tRelief;
uniform vec2 uCss;      // the board, in CSS px
uniform float uTexCss;  // the square picture's side, in CSS px (never less than the board's longer side)
uniform vec2 uLight;    // the lamp over the board, 0..1 (y down)
uniform float uLz;      // the lamp's height, in CSS px
uniform float uRelief;  // 0 (flat) to 1 and beyond
uniform vec4 uMat;      // ambient, shininess, specular, metal
uniform vec3 uLamp;     // the lamp's colour
in vec2 vUv;
out vec4 fragColor;

const float GMAX = 0.3;   // the steepest slope the data texture holds
const float DEPTH = 7.0;  // how many pixels tall the height map's 1.0 stands at Relief 1

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
	vec2 pc = vec2(vUv.x, 1.0 - vUv.y) * uCss;
	vec2 tuv = 0.5 + (pc - 0.5 * uCss) / uTexCss;
	float m = min(uCss.x, uCss.y);

	vec4 rl = texture(tRelief, tuv);
	vec2 e = rl.rg * 2.0 - 1.0;
	vec2 g = sign(e) * e * e * GMAX;
	float k = uRelief * DEPTH;
	vec3 N = normalize(vec3(-g * k, 1.0));

	vec3 Lv = vec3(uLight * uCss, uLz) - vec3(pc, 0.0);
	float dist = length(Lv);
	vec3 Ld = Lv / dist;
	float q = dist / (0.38 * m);
	float u = 1.0 + q * q;
	float att = 1.0 / (u * u * sqrt(u));

	/* a few steps of self-shadow: walk from this pixel toward the lamp through the height map; a ridge above the ray blocks it */
	float h0 = rl.a * k;
	float dl = length(Lv.xy);
	vec2 dn = Lv.xy / max(dl, 1.0);
	float rise = uLz / max(dl, 1.0);
	float sh = 1.0;
	for (int i = 1; i <= 8; i++) {
		float s = float(i) * 2.6;
		float hq = textureLod(tRelief, tuv + dn * (s / uTexCss), 0.0).a * k;
		sh = min(sh, 1.0 - smoothstep(0.0, 1.5, hq - (h0 + rise * s)));
	}

	vec3 alb = pow(texture(tAlbedo, tuv).rgb, vec3(2.2));
	float dif = max(dot(N, Ld), 0.0);
	vec3 H = normalize(Ld + vec3(0.0, 0.0, 1.0));
	float sp = pow(max(dot(N, H), 0.0), uMat.y) * uMat.z;
	vec3 specCol = mix(uLamp, alb * uLamp * 2.2, uMat.w);
	float lit = att * sh;

	/* the board with the lamp far away: a faint cool light from the top left, so the relief never goes completely flat */
	float moon = 0.55 + 0.45 * dot(N, normalize(vec3(-0.5, -0.6, 0.62)));
	vec3 col = alb * (uMat.x * moon * vec3(0.55, 0.75, 1.0) + uLamp * dif * lit * 2.3) + specCol * sp * lit;

	/* the lamp itself: a small hot bead and a soft halo, so you can see where it is even over a dark patch */
	float dp = length(pc - uLight * uCss) / m;
	col += uLamp * (0.75 * exp(-dp * dp / 0.00035) + 0.14 * exp(-dp * dp / 0.012));

	col = 1.0 - exp(-col * 1.3);
	col = pow(col, vec3(1.0 / 2.2));
	col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
	fragColor = vec4(col, 1.0);
}
`;

function initContext() {
	const attrs = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'default' };
	if (!canvas.getContext('webgl2', attrs)) return false;
	renderer = new Renderer({ canvas, dpr, alpha: false, antialias: false, depth: false, webgl: 2 });
	if (!renderer.isWebgl2) return false;
	gl = renderer.gl;
	return true;
}

function buildScene() {
	const program = new Program(gl, {
		vertex: VERT,
		fragment: FRAG,
		uniforms: U,
		cullFace: false,
		depthTest: false,
		depthWrite: false,
	});
	mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
	// the pictures' textures belong to the context: rebuild any that were made for an earlier one
	MATERIALS.forEach((mat) => { mat.tex = null; });
	resize();
}

/* the canvas matches the board's box */
function resize() {
	if (!renderer) return;
	const r = canvas.getBoundingClientRect();
	cssW = Math.max(2, Math.round(r.width));
	cssH = Math.max(2, Math.round(r.height));
	renderer.dpr = dpr;
	renderer.setSize(cssW, cssH);
	canvas.style.width = '100%'; // OGL pins the canvas to pixel sizes; the CSS sizes it
	canvas.style.height = '100%';
	dirty = true;
	if (ready) frame(true);
}

function render() {
	if (!renderer || lost || !mesh) return;
	const mat = MATERIALS[state.mat];
	if (!mat.tex) return;
	U.tAlbedo.value = mat.tex.albedo;
	U.tRelief.value = mat.tex.relief;
	U.uCss.value = [cssW, cssH];
	U.uTexCss.value = Math.max(cssW, cssH, MIN_TEX_CSS);
	U.uLight.value = [state.x, state.y];
	U.uLz.value = LAMP_Z * Math.min(cssW, cssH);
	U.uRelief.value = state.relief * 2.0;
	U.uMat.value = [mat.amb, mat.shine, mat.spec, mat.metal];
	U.uLamp.value = mat.lamp;
	renderer.render({ scene: mesh });
}

/* ---------- the height map and its slopes ---------- */

/* a box blur along one line of a square array, edges clamped */
function blurLine(src, dst, off, stride, N, r) {
	const inv = 1 / (2 * r + 1);
	let acc = 0;
	for (let k = -r; k <= r; k++) acc += src[off + Math.min(N - 1, Math.max(0, k)) * stride];
	for (let i = 0; i < N; i++) {
		dst[off + i * stride] = acc * inv;
		acc += src[off + Math.min(N - 1, i + r + 1) * stride] - src[off + Math.max(0, i - r) * stride];
	}
}

/* three box blurs in each direction come close to a Gaussian (the source array is never written) */
function blur(src, N, r) {
	const n = N * N;
	const t = new Float32Array(n);
	let a = src;
	let o = new Float32Array(n);
	for (let pass = 0; pass < 3; pass++) {
		for (let y = 0; y < N; y++) blurLine(a, t, y * N, 1, N, r);
		for (let x = 0; x < N; x++) blurLine(t, o, x, N, N, r);
		if (pass === 0) { a = o; o = new Float32Array(n); } else { const u = a; a = o; o = u; }
	}
	return a;
}

/* the picture's light and dark -> a height map, blurred, then Sobel -> slopes. Returns RGBA bytes: rg = the squared-companded
   slope, a = the height (blurred a little more, for the shadows). The blur is the fix for the noise a raw luminance gives. */
function buildRelief(img, N) {
	const cv = document.createElement('canvas');
	cv.width = N;
	cv.height = N;
	const cx = cv.getContext('2d', { willReadFrequently: true });
	cx.drawImage(img, 0, 0, N, N);
	const px = cx.getImageData(0, 0, N, N).data;
	const n = N * N;
	const lum = new Float32Array(n);
	let sum = 0;
	for (let i = 0; i < n; i++) {
		const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
		lum[i] = l;
		sum += l;
	}
	const mean = sum / n;
	let varSum = 0;
	for (let i = 0; i < n; i++) varSum += (lum[i] - mean) * (lum[i] - mean);
	const sd = Math.sqrt(varSum / n) || 0.1;
	for (let i = 0; i < n; i++) lum[i] = Math.min(1, Math.max(0, 0.5 + (lum[i] - mean) / (4 * sd)));

	const s = N / 1024; // blur radii are set for a 1024 px map
	const fine = blur(lum, N, Math.max(1, Math.round(1 * s)));
	const coarse = blur(lum, N, Math.max(2, Math.round(3 * s)));
	const hn = new Float32Array(n); // what the slopes are taken from: mostly the fine blur, with some of the coarse
	for (let i = 0; i < n; i++) hn[i] = fine[i] * 0.6 + coarse[i] * 0.4;

	const out = new Uint8Array(n * 4);
	const GMAX = 0.3;
	const toRef = N / 1254; // slopes are kept per pixel of the biggest picture, so both sizes light alike
	const pack = (g) => {
		const c = Math.sqrt(Math.min(1, Math.abs(g * toRef) / GMAX));
		return Math.round((0.5 + 0.5 * Math.sign(g) * c) * 255);
	};
	for (let y = 0; y < N; y++) {
		const ym = Math.max(0, y - 1) * N;
		const y0 = y * N;
		const yp = Math.min(N - 1, y + 1) * N;
		for (let x = 0; x < N; x++) {
			const xm = Math.max(0, x - 1);
			const xp = Math.min(N - 1, x + 1);
			const gx = (hn[ym + xp] + 2 * hn[y0 + xp] + hn[yp + xp] - hn[ym + xm] - 2 * hn[y0 + xm] - hn[yp + xm]) / 8;
			const gy = (hn[yp + xm] + 2 * hn[yp + x] + hn[yp + xp] - hn[ym + xm] - 2 * hn[ym + x] - hn[ym + xp]) / 8;
			const o = (y0 + x) * 4;
			out[o] = pack(gx);
			out[o + 1] = pack(gy);
			out[o + 2] = 255;
			out[o + 3] = Math.round(Math.min(1, Math.max(0, fine[y0 + x] * 0.35 + coarse[y0 + x] * 0.65)) * 255);
		}
	}
	return out;
}

/* ---------- loading the pictures ---------- */

function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`could not load ${url}`));
		img.src = url;
	});
}

/* a material's pictures and its height map: loaded and worked out once, then kept */
async function ensure(i) {
	const mat = MATERIALS[i];
	if (!mat.work) {
		mat.work = (async () => {
			const img = await loadImage(texURL(mat.key));
			await new Promise((r) => setTimeout(r, 0)); // let the page paint before the filter runs
			mat.img = img;
			mat.data = buildRelief(img, WORK);
		})();
	}
	await mat.work;
	if (!mat.tex && gl) {
		const linear = { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR, flipY: false };
		mat.tex = {
			albedo: new Texture(gl, { image: mat.img, ...linear }),
			relief: new Texture(gl, { image: mat.data, width: WORK, height: WORK, ...linear }),
		};
	}
	return mat;
}

/* ---------- the chips, the slider, the buttons ---------- */

function syncChips() {
	chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === state.mat)));
}

async function setMaterial(i) {
	if (!ready) return;
	want = i;
	if (i === state.mat) return;
	try {
		await ensure(i);
	} catch (err) {
		return; // a picture that won't load leaves the board as it was
	}
	if (want !== i) return; // the visitor has asked for another since
	state.mat = i;
	syncChips();
	dirty = true;
	if (REDUCED || !(ctl && ctl.running)) frame(true);
	else wake();
}

function setRelief(v) {
	state.relief = v;
	range.style.setProperty('--p', `${Math.round(v * 100)}%`);
	rangeOut.textContent = String(Math.round(v * 100));
	dirty = true;
	if (REDUCED || !(ctl && ctl.running)) frame(true);
	else wake();
}

chips.forEach((c, i) => c.addEventListener('click', () => setMaterial(i)));
nextBtn.addEventListener('click', () => setMaterial((state.mat + 1) % MATERIALS.length));
range.addEventListener('input', () => setRelief(Number(range.value) / 100));

pauseBtn.addEventListener('click', () => {
	if (!ready || REDUCED) return;
	state.paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(state.paused));
	pauseBtn.textContent = state.paused ? 'Play' : 'Pause';
	wake();
});

/* ---------- steering the lamp ---------- */

function aim(x, y) {
	state.tx = Math.min(1, Math.max(0, x));
	state.ty = Math.min(1, Math.max(0, y));
	state.idle = 0;
	if (REDUCED) {
		// no easing, no loop: the lamp goes where it is pointed, and the board is drawn once
		state.x = state.tx;
		state.y = state.ty;
		frame(true);
	} else wake();
}

function pointerAim(ev) {
	const r = canvas.getBoundingClientRect();
	aim((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
}

const onRail = (ev) => !!ev.target.closest('.rail');

board.addEventListener('pointerdown', (ev) => {
	if (!ready || ev.button > 0 || onRail(ev)) return;
	state.hand = true;
	if (ev.pointerType !== 'mouse') {
		try { board.setPointerCapture(ev.pointerId); } catch (err) { /* the pointer is already gone */ }
	}
	pointerAim(ev);
});
board.addEventListener('pointermove', (ev) => {
	if (!ready || onRail(ev)) return;
	if (ev.pointerType === 'touch' && !state.hand) return; // a finger steers only while it is down
	state.hand = true;
	pointerAim(ev);
});
function letGo(ev) {
	if (ev.pointerType === 'mouse' && ev.type === 'pointerup') return; // a mouse keeps steering until it leaves
	if (!state.hand) return;
	state.hand = false;
	state.idle = 0;
	wake();
}
board.addEventListener('pointerup', letGo);
board.addEventListener('pointercancel', letGo);
board.addEventListener('pointerleave', (ev) => {
	if (ev.pointerType === 'touch') return;
	if (state.hand) { state.hand = false; state.idle = 0; wake(); }
});

canvas.addEventListener('keydown', (ev) => {
	if (!ready) return;
	const step = ev.shiftKey ? 0.14 : 0.05;
	const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
	if (!d) return;
	ev.preventDefault();
	aim(state.tx + d[0], state.ty + d[1]);
});

/* ---------- one frame ---------- */

let lastX = -1;
let lastY = -1;
let lastRelief = -1;
let lastMat = -1;

function frame(force) {
	if (force || dirty || state.x !== lastX || state.y !== lastY || state.relief !== lastRelief || state.mat !== lastMat) {
		render();
		lastX = state.x;
		lastY = state.y;
		lastRelief = state.relief;
		lastMat = state.mat;
		dirty = false;
	}
}

function tick(dt) {
	if (!state.hand) state.idle += dt;
	const drifting = !state.hand && !state.paused && state.idle > IDLE;
	if (drifting) {
		state.phase += dt * PATH_SPEED;
		const p = pathAt(state.phase);
		state.tx = p.x;
		state.ty = p.y;
	}
	// the lamp keeps up with a hand quickly and glides back onto its path slowly
	const rate = drifting ? 3 : 15;
	const f = 1 - Math.exp(-rate * dt);
	state.x += (state.tx - state.x) * f;
	state.y += (state.ty - state.y) * f;
	if (Math.abs(state.tx - state.x) < 0.0003 && Math.abs(state.ty - state.y) < 0.0003) {
		state.x = state.tx;
		state.y = state.ty;
	}
	frame(false);
	governor(dt);
	if (settled()) ctl.stop();
}

/* the loop sleeps when nothing can move: the lamp is held (by a hand, or by Pause) and has arrived */
function settled() {
	return (state.hand || state.paused) && state.x === state.tx && state.y === state.ty && !dirty;
}

function wake() {
	if (ctl && !REDUCED) ctl.start();
}

/* long frames: lower the resolution a step */
let ema = 1 / 60;
let slow = 0;
function governor(dt) {
	ema += (dt - ema) * 0.08;
	if (ema > 0.028 && dpr > 0.75) {
		if (++slow > 24) {
			slow = 0;
			ema = 1 / 60;
			dpr = Math.max(0.75, dpr - 0.25);
			resize();
		}
	} else slow = 0;
}

/* ---------- layout: on a phone the board stops above the info panel ---------- */
const narrow = matchMedia('(max-width: 720px)');
function updateDock() {
	if (!narrow.matches) {
		board.style.setProperty('--dock', '0px');
		return;
	}
	const w = screenEl.getBoundingClientRect();
	const p = infoEl.getBoundingClientRect();
	const bottom = Math.max(0, w.bottom - p.top) + 10;
	board.style.setProperty('--dock', `${Math.round(bottom)}px`);
}

/* ---------- no WebGL: the stone as a plain image ---------- */
function fallback() {
	ready = false;
	document.body.classList.add('is-fallback');
	canvas.hidden = true;
	const img = poster.querySelector('img');
	img.src = img.dataset.src.replace('-1254', `-${TEX_SIZE}`);
	poster.hidden = false;
	rail.hidden = true;
	[nextBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	if (ctl) ctl.stop();
}

/* ---------- start ---------- */
async function start() {
	boot();
	// on a short phone, or a phone held sideways, the panel starts folded so the board gets the room
	if (matchMedia('(max-width: 720px) and (max-height: 699px), (max-height: 520px)').matches) document.querySelector('.info-toggle')?.click();
	updateDock();
	new ResizeObserver(updateDock).observe(infoEl);
	addEventListener('resize', updateDock);
	narrow.addEventListener('change', updateDock);

	setRelief(state.relief);
	if (REDUCED) pauseBtn.disabled = true;

	if (!initContext()) {
		fallback();
		return;
	}
	buildScene();
	try {
		await ensure(0);
	} catch (err) {
		fallback();
		return;
	}
	ready = true;
	frame(true);

	canvas.addEventListener('webglcontextlost', (ev) => {
		ev.preventDefault();
		lost = true;
		setTimeout(() => { if (lost) fallback(); }, 3000);
	});
	canvas.addEventListener('webglcontextrestored', async () => {
		lost = false;
		if (!initContext()) { fallback(); return; }
		buildScene();
		try { await ensure(state.mat); } catch (err) { fallback(); return; }
		dirty = true;
		frame(true);
	});

	new ResizeObserver(resize).observe(canvas);

	// the other two pictures arrive while the first is being looked at, so a chip answers at once
	setTimeout(() => { MATERIALS.forEach((_, i) => { if (i) ensure(i).catch(() => {}); }); }, 1200);

	if (REDUCED) return; // the board, drawn once, lit from the top left; nothing else runs

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'relief-light-board' });
}

start();
