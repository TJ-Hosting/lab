/*
 * Sample 62 — "Frosted Window Wipe".
 * A snowy night street seen through a fogged window pane. One WebGL canvas (OGL draws one full-screen triangle) shows the
 * glass. An OGL Flowmap, a small float render target that holds "where the glass has been touched" and fades by itself,
 * remembers every wipe: the pointer or a finger stamps a soft disc along its path, and the stamp decays over about four
 * seconds. The fragment shader reads that map as a wipe mask: where it is high the street is sharp (a little blurred as the
 * wipe fades, by mip level), and everywhere else it is a frosted copy of the same picture, blurred once on a small canvas at
 * load, then brightened, tinted pale blue and laid over with a grain of tiny beads and frost crystals that were grown once on a
 * canvas along the pane's edges (the glass is thicker there, so it clears least). A few water drops slide down in stops and
 * starts, catch up with each other and merge; each is a small lens in the shader that shows the street upside down, and each
 * leaves a thin clear trail that fogs over again. With nobody touching it, a ghost finger wipes a slow arc every few seconds.
 * One loop() drives the flowmap, the drops, the ghost and the drawing, so none of it runs off-screen, in a hidden tab or on
 * Pause. Under reduced motion one still frame is drawn (one clear arc, half faded) and nothing moves; a pointer then wipes the
 * glass on demand, without any loop, and the wipe stays until you press Fog it up. A browser without WebGL 2 or float render
 * targets gets the picture under a frosted CSS overlay, with a note.
 *
 * Adapted from the OGL example "Mouse Flowmap" (examples/mouse-flowmap.html at commit b9e653ccac8e08211ce0678695d0a01f722e1fc2)
 * by oframe (Nathan Gordon), https://github.com/oframe/ogl, Unlicense (public domain). What is taken: the flowmap wiring (a
 * Flowmap whose uniform is read by the display shader, a mouse position in 0..1 with y flipped, a velocity vector, the aspect
 * ratio, one update() per frame, and the stamp's velocity and speed channels). What changed: the flowmap does not bend a water
 * texture; its speed channel is a wipe mask that shows a sharp picture through a frosted one, and its velocity channel only
 * smears the clear edge. Stamps are a unit direction, so a slow wipe clears as well as a fast one, and several are laid along
 * each pointer step; the decay is set from the frame time, so it takes the same four seconds at any frame rate; pointer events
 * (mouse, touch, pen) and the keyboard replace mouse and touch events. The example's water.jpg is not used. New code: the
 * frosted look, the frost crystals, the beads, the water drops and their trails, the ghost finger, the reduced-motion still, the
 * poster. OGL's Flowmap.js is used unmodified (vendor/ogl@1.0.11).
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
import { Flowmap } from '../../vendor/ogl@1.0.11/src/extras/Flowmap.js';
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const REDUCED = prefersReducedMotion();
const NARROW = matchMedia('(max-width: 720px)').matches;
const PHONE = matchMedia('(max-width: 720px), (pointer: coarse)').matches;

/* ---------- tuning ---------- */
const HALF = 0.85; // seconds for a wipe to fade to half; with the shader's thresholds the fog is back in about four seconds
const FLOW_SIZE = PHONE ? 192 : 256; // the flowmap's side, in texels
const STAMP_MIN = 28; // the stamp's radius in CSS px: 6% of the window's height, kept between these
const STAMP_MAX = 48;
const FOCUS = [0.64, 0.5]; // the part of the picture that stays in view when a narrow window crops it
const ND = 5; // water drops
const NT = 10; // their trails (a drop's trail outlives it while it fogs over)
const TRAIL_LIFE = 7; // seconds for a dead drop's trail to fog over
const TRAIL_LEN = 190; // CSS px of trail kept behind a sliding drop; older glass fogs over
const BREATH = 1.1; // seconds that Fog it up speeds the fogging
const GHOST_GAP = 4; // seconds of rest after a ghost wipe: a wipe about every 6 s
const GHOST_FIRST = 0.4; // seconds before the first ghost wipe
const BLUR_W = 192; // the fog's blur is made at this width, then stretched

/* the ghost finger's arcs: quadratic curves over the window in 0..1 (y down). A narrow window squeezes them into its top
   half, where the info panel does not cover them. */
const ARCS = [
	{ a: [0.3, 0.52], c: [0.52, 0.14], b: [0.86, 0.5], dur: 2.5 },
	{ a: [0.9, 0.24], c: [0.62, 0.82], b: [0.38, 0.4], dur: 2.7 },
	{ a: [0.42, 0.7], c: [0.74, 0.3], b: [0.94, 0.62], dur: 2.4 },
	{ a: [0.14, 0.3], c: [0.46, 0.7], b: [0.8, 0.2], dur: 2.8 },
];

const IMG_URL = (w) => `../../img/art/frosted-window-street-${w}.webp`;
const POSTER_URL = '../../img/art/frosted-window-street-1536';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (x) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };

/* a small deterministic PRNG: the frost, the drops and the still are the same on every visit */
function seeded(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ---------- the page ---------- */
const screenEl = document.querySelector('.piece-screen');
const canvas = screenEl.querySelector('.piece');
const poster = screenEl.querySelector('.poster');
const hintEl = document.querySelector('.hint');
const fogBtn = document.querySelector('[data-action="fog"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

/* ---------- state ---------- */
let renderer = null;
let gl = null;
let mesh = null;
let flowmap = null;
let lost = false;
let ready = false;
let ctl = null; // the loop() controller
let paused = false;
let cssW = 1;
let cssH = 1;
let dpr = Math.min(1.5, window.devicePixelRatio || 1); // a fragment shader on a full window: capped at 1.5, lowered further if frames run long
let imgW = 1536;
let imgH = 1024;
let stampR = STAMP_MAX;
let breath = 0; // seconds left of the quick fog-over
let flowQuiet = 99; // seconds since anything was stamped; the flowmap is left alone once it has faded
let image = null; // the loaded picture
let blurCv = null;
const frostCv = document.createElement('canvas');
let noiseData = null;
let tex = null;
let frostTimer = 0;

const rnd = seeded(20261028);

const U = {
	tImage: { value: null },
	tBlur: { value: null },
	tFlow: { value: null },
	tFrost: { value: null },
	tNoise: { value: null },
	uCss: { value: [1, 1] },
	uImgOff: { value: [0, 0] },
	uImgScale: { value: [1, 1] },
	uDrop: { value: Array.from({ length: ND }, () => [0, 0, 0, 0]) },
	uTrail: { value: Array.from({ length: NT }, () => [0, 0, 0, 0]) },
	uTrailA: { value: new Array(NT).fill(0) },
	uFinger: { value: [0, 0, 0] },
};

/* ---------- the shaders ---------- */
const VERT = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* Everything is in CSS pixels with y up (vUv's way), over the window. tFlow: b is how recently the glass was wiped here (1 when
   just wiped, fading to 0), rg the direction of the wipe. tFrost: r the frost crystals, g how thick the frost is (high at the
   edges). tNoise: 128 px of random bytes, repeating, read with linear filtering as value noise. */
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D tImage;
uniform sampler2D tBlur;
uniform sampler2D tFlow;
uniform sampler2D tFrost;
uniform sampler2D tNoise;
uniform vec2 uCss;
uniform vec2 uImgOff;
uniform vec2 uImgScale;
uniform vec4 uDrop[${ND}];    // x, y, radius, how much it shows
uniform vec4 uTrail[${NT}];   // x, top, bottom, half width
uniform float uTrailA[${NT}]; // how clear each trail still is
uniform vec3 uFinger;         // x, y, strength: the fingertip, a soft smudge of light
in vec2 vUv;
out vec4 fragColor;

float hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.xx + p3.yz) * p3.zy);
}

/* one grid of condensation beads: x is the bead's body, y its pinprick of light */
vec2 beads(vec2 p, float cell, float thr) {
	vec2 g = p / cell;
	vec2 id = floor(g);
	vec3 h = vec3(hash22(id), hash12(id + 17.0));
	vec2 bq = fract(g) - 0.5 - (h.xy - 0.5) * 0.4;
	float on = step(thr, h.z);
	float rad = 0.12 + 0.12 * h.z;
	return on * vec2(smoothstep(rad, rad - 0.06, length(bq)), smoothstep(rad * 0.5, 0.0, length(bq - vec2(-0.05, 0.05))));
}

void main() {
	vec2 pc = vUv * uCss;
	vec2 iuv = uImgOff + vUv * uImgScale;
	vec2 pxToImg = uImgScale / uCss;

	float nLo = texture(tNoise, pc / 8960.0).r;        // blobs about 70 px across
	float nMid = texture(tNoise, pc / 2304.0 + 0.31).g; // about 18 px
	float nHi = texture(tNoise, pc / 640.0 + 0.67).b;   // about 5 px

	/* the wipe: the flowmap's speed channel with a rough edge, so the cleared glass has the ragged rim of a finger in condensation */
	vec4 fl = texture(tFlow, vUv);
	float jit = ((nMid - 0.5) * 0.12 + (nHi - 0.5) * 0.05) * smoothstep(0.0, 0.25, fl.b);
	float w = smoothstep(0.03, 0.22, fl.b + jit);

	/* frost is thickest at the pane's edges and clears least there */
	vec2 fr = texture(tFrost, vUv).rg;
	float thick = clamp(fr.g * (0.6 + 0.8 * nLo), 0.0, 1.0);
	w *= 1.0 - 0.92 * thick;

	/* the water drops' trails: thin clear lines that thin out and fog over toward their far end, with a wet ridge along each side */
	float tw = 0.0;
	float tr = 0.0;
	for (int i = 0; i < ${NT}; i++) {
		float a = uTrailA[i];
		if (a > 0.003) {
			vec4 t = uTrail[i];
			float along = clamp((pc.y - t.z) / max(t.y - t.z, 1.0), 0.0, 1.0); // 0 at the drop, 1 at the far end
			float cy = clamp(pc.y, t.z, t.y);
			float wob = sin(pc.y * 0.06 + t.x * 0.13) * 0.8 + (nHi - 0.5) * 1.4;
			float d = length(vec2(pc.x - t.x - wob, pc.y - cy));
			float aa = a * (1.0 - 0.95 * smoothstep(0.0, 1.0, along));
			tw = max(tw, smoothstep(t.w, t.w * 0.4, d) * aa);
			tr = max(tr, smoothstep(t.w * 0.6, t.w, d) * (1.0 - smoothstep(t.w, t.w * 2.3, d)) * aa);
		}
	}
	float wipe = max(w, tw * 0.9 * (1.0 - 0.7 * thick));

	/* the fog: the pre-blurred picture, brightened, pale blue, a little uneven */
	vec3 fog = texture(tBlur, iuv).rgb * 1.3 + vec3(0.05, 0.085, 0.14);
	fog = mix(fog, vec3(0.6, 0.77, 0.96), 0.14 + 0.14 * nLo);
	fog *= 0.93 + 0.14 * nMid;

	/* condensation beads, two sizes: tiny round lenses with a pinprick of light, in some of the cells */
	vec2 bd = beads(pc, 6.0, 0.62) + beads(pc + 31.0, 10.3, 0.7);
	fog += (bd.x * 0.04 + bd.y * 0.15) * vec3(0.8, 0.92, 1.0);

	/* frost crystals and thick frost */
	fog = mix(fog, vec3(0.88, 0.95, 1.0), clamp(0.5 * fr.r + 0.4 * thick, 0.0, 0.85));
	fog = mix(vec3(dot(fog, vec3(0.299, 0.587, 0.114))), fog, 0.82); // a little less blue

	/* the clear glass: the sharp picture, a little blurred as the wipe fades (a mip level), its edge smeared along the stroke */
	float rim = wipe * (1.0 - wipe) * 4.0;
	vec2 smear = fl.rg * pxToImg * 7.0 * rim;
	vec3 sharp = textureLod(tImage, iuv + smear, (1.0 - wipe) * 3.0).rgb * 1.12 + 0.012;
	sharp += rim * vec3(0.06, 0.1, 0.16);
	vec3 col = mix(fog, sharp, wipe);
	col += tr * (1.0 - 0.6 * wipe) * 0.17 * vec3(0.85, 0.94, 1.0);

	/* water drops: each one a small lens that shows the street upside down, wide-angle, with a dark rim and a catch of light */
	for (int i = 0; i < ${ND}; i++) {
		vec4 dp = uDrop[i];
		if (dp.w > 0.003) {
			vec2 q = (pc - dp.xy) / vec2(1.0, 1.15);
			float dl = length(q);
			if (dl < dp.z + 1.5) {
				float m = smoothstep(dp.z + 0.7, dp.z - 0.7, dl);
				vec2 o = q / dp.z;
				vec2 cuv = uImgOff + (dp.xy / uCss) * uImgScale;
				vec3 lens = textureLod(tImage, cuv - o * dp.z * 2.2 * pxToImg, 0.0).rgb * 1.25 + 0.05;
				lens = mix(lens, col * 1.05, 0.3);
				float edge = smoothstep(0.5, 1.0, length(o));
				lens = lens * (1.0 - 0.3 * edge) + edge * vec3(0.1, 0.15, 0.22) * (0.5 + 0.5 * smoothstep(0.0, 0.8, -o.y));
				lens += smoothstep(0.42, 0.0, length(o - vec2(-0.35, 0.4))) * 0.8;
				lens += smoothstep(0.5, 0.0, length(o - vec2(0.2, -0.55))) * vec3(0.07, 0.12, 0.18);
				col = mix(col, lens, m * dp.w);
			}
		}
	}

	/* the fingertip: a soft smudge of light and a faint ring */
	float fd = length(pc - uFinger.xy);
	float fring = (fd - 26.0) / 4.0;
	col += uFinger.z * (0.1 * exp(-fd * fd / 578.0) + 0.06 * exp(-fring * fring)) * vec3(0.78, 0.92, 1.0);

	/* the pane's edge catches the light */
	float ed = min(min(pc.x, uCss.x - pc.x), min(pc.y, uCss.y - pc.y));
	col += vec3(0.5, 0.74, 1.0) * 0.2 * smoothstep(2.5, 0.0, ed);

	col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
	fragColor = vec4(col, 1.0);
}
`;

/* ---------- WebGL (OGL) ---------- */

function initContext() {
	// ask for the context first, with the attributes OGL will ask for, so a browser without WebGL 2 is not logged as an error
	const attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'default' };
	if (!canvas.getContext('webgl2', attrs)) return false;
	try {
		renderer = new Renderer({ canvas, dpr, alpha: false, antialias: false, depth: false, webgl: 2 });
	} catch (err) {
		return false;
	}
	if (!renderer.isWebgl2) return false;
	gl = renderer.gl;
	try {
		flowmap = new Flowmap(gl, { size: FLOW_SIZE, falloff: 0.15, alpha: 1, dissipation: 1, type: gl.HALF_FLOAT });
		// the flowmap needs a float render target; some phones cannot draw into one
		renderer.bindFramebuffer(flowmap.mask.write);
		const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		renderer.bindFramebuffer();
		return ok;
	} catch (err) {
		return false;
	}
}

function makeNoise() {
	const r = seeded(77);
	const d = new Uint8Array(128 * 128 * 4);
	for (let i = 0; i < d.length; i++) d[i] = Math.floor(r() * 256);
	return d;
}

function buildScene() {
	const linear = { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR };
	tex = {
		image: new Texture(gl, { image, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR }),
		blur: new Texture(gl, { image: blurCv, ...linear }),
		frost: new Texture(gl, { image: frostCv, ...linear }),
		noise: new Texture(gl, { image: noiseData, width: 128, height: 128, wrapS: gl.REPEAT, wrapT: gl.REPEAT, flipY: false, ...linear }),
	};
	U.tImage.value = tex.image;
	U.tBlur.value = tex.blur;
	U.tFrost.value = tex.frost;
	U.tNoise.value = tex.noise;
	U.tFlow = flowmap.uniform; // the flowmap swaps its two targets, so the uniform object itself is shared
	const program = new Program(gl, {
		vertex: VERT,
		fragment: FRAG,
		uniforms: U,
		cullFace: false,
		depthTest: false,
		depthWrite: false,
	});
	mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
}

/* the canvas matches its box; the picture covers it, keeping FOCUS in view */
function resize() {
	if (!renderer) return;
	const r = canvas.getBoundingClientRect();
	const w = Math.max(2, Math.round(r.width));
	const h = Math.max(2, Math.round(r.height));
	const oldW = cssW;
	const oldH = cssH;
	cssW = w;
	cssH = h;
	renderer.dpr = dpr;
	renderer.setSize(w, h);
	canvas.style.width = ''; // OGL pins the canvas to pixel sizes; the stylesheet sizes it
	canvas.style.height = '';

	const ca = w / h;
	const ia = imgW / imgH;
	const sx = ca > ia ? 1 : ca / ia;
	const sy = ca > ia ? ia / ca : 1;
	U.uCss.value = [w, h];
	U.uImgScale.value = [sx, sy];
	U.uImgOff.value = [clamp(FOCUS[0] - sx / 2, 0, 1 - sx), clamp(FOCUS[1] - sy / 2, 0, 1 - sy)];

	stampR = clamp(h * 0.06, STAMP_MIN, STAMP_MAX);
	if (flowmap) {
		flowmap.aspect = w / h;
		flowmap.mesh.program.uniforms.uFalloff.value = stampR / h; // the stamp's radius, in the window's heights
	}
	if (ready && (oldW !== w || oldH !== h)) {
		dropsRescale(w / oldW, h / oldH);
		// the frost is grown for this window's shape; a resize grows it again once the dragging has stopped
		clearTimeout(frostTimer);
		frostTimer = setTimeout(() => { makeFrost(); if (tex) tex.frost.needsUpdate = true; if (!live()) draw(); }, 180);
		if (!live()) draw();
	}
}

const live = () => !!(ctl && ctl.running);

function draw() {
	if (!renderer || !ready || lost || !mesh) return;
	packDrops();
	renderer.render({ scene: mesh });
}

/* ---------- the fog's blur, the frost crystals ---------- */

/* a box blur along every line of a width x height float array: the running sum slides one pixel at a time, edges clamped */
function boxBlur(src, dst, w, h, r, horizontal) {
	const lines = horizontal ? h : w;
	const n = horizontal ? w : h;
	const step = horizontal ? 1 : w;
	const inv = 1 / (2 * r + 1);
	for (let l = 0; l < lines; l++) {
		const off = horizontal ? l * w : l;
		let acc = 0;
		for (let k = -r; k <= r; k++) acc += src[off + clamp(k, 0, n - 1) * step];
		for (let i = 0; i < n; i++) {
			dst[off + i * step] = acc * inv;
			acc += src[off + Math.min(n - 1, i + r + 1) * step] - src[off + Math.max(0, i - r) * step];
		}
	}
}

/* the picture shrunk to a small canvas and blurred three times over: the fog's colour. It is stretched back up smoothly. */
function makeBlur() {
	const bw = BLUR_W;
	const bh = Math.round((BLUR_W * imgH) / imgW);
	const cv = document.createElement('canvas');
	cv.width = bw;
	cv.height = bh;
	const cx = cv.getContext('2d', { willReadFrequently: true });
	cx.imageSmoothingQuality = 'high';
	cx.drawImage(image, 0, 0, bw, bh);
	const data = cx.getImageData(0, 0, bw, bh);
	const px = data.data;
	const n = bw * bh;
	const r = PHONE ? 5 : 4;
	const a = new Float32Array(n);
	const b = new Float32Array(n);
	for (let c = 0; c < 3; c++) {
		for (let i = 0; i < n; i++) a[i] = px[i * 4 + c];
		for (let pass = 0; pass < 3; pass++) {
			boxBlur(a, b, bw, bh, r, true);
			boxBlur(b, a, bw, bh, r, false);
		}
		for (let i = 0; i < n; i++) px[i * 4 + c] = a[i];
	}
	cx.putImageData(data, 0, 0);
	return cv;
}

/* the frost, grown once on a canvas the shape of the window: red is the crystals (fern-like stems that grow inward from the
   edges and fork), green is how thick the frost lies (heavy at the edges, uneven). Both are added on black. */
function makeFrost() {
	const k = Math.min(1, 1024 / Math.max(cssW, cssH));
	const fw = Math.max(64, Math.round(cssW * k));
	const fh = Math.max(64, Math.round(cssH * k));
	frostCv.width = fw;
	frostCv.height = fh;
	const cx = frostCv.getContext('2d');
	const r = seeded(20261028);
	const u = Math.min(fw, fh);
	cx.globalCompositeOperation = 'source-over';
	cx.fillStyle = '#000';
	cx.fillRect(0, 0, fw, fh);
	cx.globalCompositeOperation = 'lighter';

	// thickness: a gradient in from each edge, then uneven patches
	const D = u * 0.17;
	const ramp = (x0, y0, x1, y1) => {
		const g = cx.createLinearGradient(x0, y0, x1, y1);
		g.addColorStop(0, 'rgba(0,255,0,0.95)');
		g.addColorStop(0.25, 'rgba(0,255,0,0.55)');
		g.addColorStop(0.6, 'rgba(0,255,0,0.16)');
		g.addColorStop(1, 'rgba(0,255,0,0)');
		return g;
	};
	cx.fillStyle = ramp(0, 0, D, 0); cx.fillRect(0, 0, D, fh);
	cx.fillStyle = ramp(fw, 0, fw - D, 0); cx.fillRect(fw - D, 0, D, fh);
	cx.fillStyle = ramp(0, 0, 0, D); cx.fillRect(0, 0, fw, D);
	cx.fillStyle = ramp(0, fh, 0, fh - D); cx.fillRect(0, fh - D, fw, D);
	for (let i = 0; i < 46; i++) {
		const side = Math.floor(r() * 4);
		const t = r();
		const x = side === 0 ? 0 : side === 1 ? fw : t * fw;
		const y = side === 2 ? 0 : side === 3 ? fh : t * fh;
		const rad = u * (0.05 + 0.13 * r());
		const g = cx.createRadialGradient(x, y, 0, x, y, rad);
		g.addColorStop(0, `rgba(0,255,0,${0.25 + 0.3 * r()})`);
		g.addColorStop(1, 'rgba(0,255,0,0)');
		cx.fillStyle = g;
		cx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
	}

	// crystals: ferns. A stem grows inward from the edge; along it, pairs of fronds sweep forward and shorten toward the tip,
	// and each frond carries a few short barbs. Thin and pale.
	cx.lineCap = 'round';
	const lw0 = Math.max(1, u / 520);
	const alpha = [0.8, 0.6, 0.42];
	function frond(x, y, ang, len, depth) {
		let px = x;
		let py = y;
		let a = ang;
		const n = Math.max(2, Math.round(len / 4.5));
		const bend = (r() - 0.5) * 0.012; // each stem curves a little
		cx.strokeStyle = `rgba(255,0,0,${alpha[depth]})`;
		for (let i = 1; i <= n; i++) {
			const f = i / n;
			a += bend + (r() - 0.5) * 0.1;
			const nx = px + (Math.cos(a) * len) / n;
			const ny = py + (Math.sin(a) * len) / n;
			cx.lineWidth = lw0 * Math.pow(0.68, depth) * (1 - 0.6 * f);
			cx.beginPath();
			cx.moveTo(px, py);
			cx.lineTo(nx, ny);
			cx.stroke();
			if (depth < 2 && i % 2 === 1 && f < 0.92) {
				const bl = len * (1 - f) * (depth === 0 ? 0.46 : 0.4) * (0.75 + r() * 0.4);
				if (bl > 4) {
					const sweep = 0.95 + r() * 0.2; // swept forward, about 55 degrees
					frond(nx, ny, a + sweep, bl, depth + 1);
					frond(nx, ny, a - sweep, bl, depth + 1);
					cx.strokeStyle = `rgba(255,0,0,${alpha[depth]})`;
				}
			}
			px = nx;
			py = ny;
		}
	}
	const gap = u * 0.034;
	const stem = () => u * (0.04 + 0.13 * Math.pow(r(), 2.2));
	for (let x = gap * r(); x < fw; x += gap * (0.7 + 0.6 * r())) {
		frond(x, -2, Math.PI / 2 + (r() - 0.5) * 0.9, stem(), 0);
		frond(x, fh + 2, -Math.PI / 2 + (r() - 0.5) * 0.9, stem(), 0);
	}
	for (let y = gap * r(); y < fh; y += gap * (0.7 + 0.6 * r())) {
		frond(-2, y, (r() - 0.5) * 0.9, stem(), 0);
		frond(fw + 2, y, Math.PI + (r() - 0.5) * 0.9, stem(), 0);
	}
	// the corners grow the longest fans
	for (const [cxp, cyp, base] of [[0, 0, Math.PI / 4], [fw, 0, (3 * Math.PI) / 4], [0, fh, -Math.PI / 4], [fw, fh, (-3 * Math.PI) / 4]]) {
		for (let i = 0; i < 9; i++) frond(cxp, cyp, base + (r() - 0.5) * 1.5, u * (0.09 + 0.16 * r()), 0);
	}
}

/* ---------- the water drops ---------- */
/* positions are CSS px, y down, over the window */
const drops = Array.from({ length: ND }, () => ({ on: false, x: 0, y: 0, r: 4, a: 0, go: 0, rest: 0, vmax: 30, wait: 0, trail: -1 }));
const trails = Array.from({ length: NT }, () => ({ on: false, live: false, x: 0, y0: 0, y1: 0, hw: 2, a: 0 }));
const dropScale = () => clamp(cssW / 1100, 0.75, 1.1);

function allocTrail() {
	let best = -1;
	for (let i = 0; i < NT; i++) if (!trails[i].on) return i;
	for (let i = 0; i < NT; i++) if (!trails[i].live && (best < 0 || trails[i].a < trails[best].a)) best = i;
	return best;
}

function spawnDrop(d) {
	const sc = dropScale();
	d.r = (4.2 + rnd() * 4.0) * sc;
	// often above and near another drop, so it catches up and the two merge
	const mates = drops.filter((o) => o !== d && o.on && o.y > cssH * 0.2 && o.y < cssH * 0.68);
	if (mates.length && rnd() < 0.7) {
		const m = mates[Math.floor(rnd() * mates.length)];
		d.x = clamp(m.x + (rnd() - 0.5) * 20, 12, cssW - 12);
		d.y = Math.max(6, m.y - (34 + rnd() * 70));
	} else {
		d.x = cssW * (0.08 + 0.84 * rnd());
		d.y = cssH * (0.03 + 0.22 * rnd());
	}
	d.on = true;
	d.a = 0;
	d.go = 0;
	d.rest = rnd() * 1.2;
	d.vmax = 14 + 6 * d.r;
	const ti = allocTrail();
	d.trail = ti;
	if (ti >= 0) {
		const t = trails[ti];
		t.on = true;
		t.live = true;
		t.x = d.x;
		t.y0 = d.y;
		t.y1 = d.y;
		t.hw = Math.max(1.8, d.r * 0.42);
		t.a = 0.9;
	}
}

function endDrop(d) {
	d.on = false;
	d.wait = 1.6 + rnd() * 3.4;
	if (d.trail >= 0) trails[d.trail].live = false;
	d.trail = -1;
}

function stepDrops(dt) {
	for (const d of drops) {
		if (!d.on) {
			d.wait -= dt;
			if (d.wait <= 0) spawnDrop(d);
			continue;
		}
		d.a = Math.min(1, d.a + dt / 0.8);
		if (d.go > 0) {
			d.go -= dt;
			d.y += d.vmax * (0.55 + 0.45 * Math.sin(Math.min(1, (0.4 + d.go) / 1.4) * Math.PI)) * dt;
		} else {
			d.rest -= dt;
			if (d.rest <= 0) {
				d.go = 0.5 + rnd() * 1.2;
				d.rest = 0.7 + rnd() * 2.0;
				d.vmax = (14 + 6 * d.r) * (0.7 + 0.6 * rnd());
			}
		}
		if (d.trail >= 0) {
			const t = trails[d.trail];
			t.y1 = d.y;
			t.y0 = Math.max(t.y0, d.y - TRAIL_LEN * dropScale());
		}
		if (d.y > cssH + 10) endDrop(d);
	}
	// two drops that touch become one: the bigger takes the smaller's water and runs on faster
	for (let i = 0; i < ND; i++) {
		for (let j = i + 1; j < ND; j++) {
			const a = drops[i];
			const b = drops[j];
			if (!a.on || !b.on) continue;
			const rr = a.r + b.r;
			if (Math.abs(a.x - b.x) < rr * 0.7 && Math.abs(a.y - b.y) < rr * 0.9) {
				const big = a.r >= b.r ? a : b;
				const small = big === a ? b : a;
				big.r = Math.min(10 * dropScale(), Math.hypot(big.r, small.r * 0.9));
				big.go = Math.max(big.go, 0.9);
				big.vmax = Math.max(big.vmax, 14 + 6 * big.r);
				if (big.trail >= 0) trails[big.trail].hw = Math.max(trails[big.trail].hw, big.r * 0.42);
				endDrop(small);
			}
		}
	}
	const fade = (breath > 0 ? 8 : 1) * dt / TRAIL_LIFE;
	for (const t of trails) {
		if (!t.on) continue;
		if (!t.live) {
			t.a -= fade;
			if (t.a <= 0) { t.on = false; t.a = 0; }
		} else if (breath > 0) t.a = Math.max(0, t.a - dt / 0.5);
		else if (t.a < 0.9) t.a = Math.min(0.9, t.a + dt / 2.5); // a sliding drop's trail comes back after a breath
	}
}

function dropsRescale(fx, fy) {
	for (const d of drops) { d.x *= fx; d.y *= fy; }
	for (const t of trails) { t.x *= fx; t.y0 *= fy; t.y1 *= fy; }
}

function dropsClear() {
	drops.forEach((d) => { d.on = false; d.trail = -1; d.wait = rnd() * 0.5; });
	trails.forEach((t) => { t.on = false; t.live = false; t.a = 0; });
}

/* hand the drops and the fingertip to the shader (the shader's y is up) */
const finger = { x: 0, y: 0, v: 0 };
function packDrops() {
	for (let i = 0; i < ND; i++) {
		const d = drops[i];
		const v = U.uDrop.value[i];
		v[0] = d.x; v[1] = cssH - d.y; v[2] = d.r; v[3] = d.on ? d.a : 0;
	}
	for (let i = 0; i < NT; i++) {
		const t = trails[i];
		const v = U.uTrail.value[i];
		v[0] = t.x; v[1] = cssH - t.y0; v[2] = cssH - t.y1; v[3] = t.hw;
		U.uTrailA.value[i] = t.on ? t.a : 0;
	}
	U.uFinger.value = [finger.x, cssH - finger.y, finger.v];
}

/* ---------- the flowmap: stamping and fading ---------- */

function flowPass(dissipation, mx, my, vx, vy) {
	flowmap.mesh.program.uniforms.uDissipation.value = dissipation;
	if (mx === null) {
		flowmap.mouse.set(-1, -1); // far outside the map: no stamp, only the fading
		flowmap.velocity.set(0, 0);
	} else {
		flowmap.mouse.set(mx, my);
		flowmap.velocity.set(vx, vy);
	}
	flowmap.update();
}

/* one straight stretch of wipe, in CSS px (y down): a stamp every third of its radius, each with a unit direction so a slow wipe
   clears as well as a fast one. `decay` fades the whole map once, on the first stamp. Returns how many stamps went down. */
function stampSegment(x0, y0, x1, y1, decay) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len = Math.hypot(dx, dy);
	const vx = len > 0.01 ? dx / len : 0;
	const vy = len > 0.01 ? dy / len : 1;
	const n = clamp(Math.ceil(len / (stampR * 0.35)), 1, 16);
	for (let i = 1; i <= n; i++) {
		const t = i / n;
		flowPass(i === 1 ? decay : 1, (x0 + dx * t) / cssW, 1 - (y0 + dy * t) / cssH, vx, vy);
	}
}

/* fade the map by dt (unless decay is off) and lay the strokes into it */
function flowStep(dt, strokes, fades = true) {
	const half = breath > 0 ? 0.12 : HALF;
	const decay = fades ? Math.pow(0.5, dt / half) : 1;
	if (strokes.length) {
		strokes.forEach((s, i) => stampSegment(s.x0, s.y0, s.x1, s.y1, i === 0 ? decay : 1));
		flowQuiet = 0;
	} else if (fades && flowQuiet < 7) {
		flowPass(decay, null);
		flowQuiet += dt;
		if (flowQuiet >= 7) flowPass(0, null); // faded: set it to exactly nothing and leave it be
	}
}

function flowClear() {
	flowPass(0, null);
	flowQuiet = 99;
}

/* ---------- the ghost finger ---------- */
const ghost = { active: false, t: 0, arc: 0, wait: GHOST_FIRST, last: null, glow: 0 };

function arcPoint(a, s) {
	const u = 1 - s;
	let x = u * u * a.a[0] + 2 * u * s * a.c[0] + s * s * a.b[0];
	let y = u * u * a.a[1] + 2 * u * s * a.c[1] + s * s * a.b[1];
	if (NARROW) y = 0.07 + y * 0.46;
	return { x: x * cssW, y: y * cssH };
}

function ghostStep(dt, strokes) {
	if (!ghost.active) {
		ghost.wait -= dt;
		if (ghost.wait > 0) {
			if (!kb.on) finger.v = Math.max(0, finger.v - dt * 4);
			return;
		}
		ghost.active = true;
		ghost.t = 0;
		ghost.last = null;
	}
	const arc = ARCS[ghost.arc % ARCS.length];
	ghost.t += dt;
	const u = clamp(ghost.t / arc.dur, 0, 1);
	const p = arcPoint(arc, smooth(u));
	const from = ghost.last || p;
	strokes.push({ x0: from.x, y0: from.y, x1: p.x, y1: p.y });
	ghost.last = p;
	finger.x = p.x;
	finger.y = p.y;
	finger.v = Math.min(1, ghost.t / 0.25) * Math.min(1, (arc.dur - ghost.t) / 0.35);
	if (u >= 1) {
		ghostStop(GHOST_GAP);
		ghost.arc++;
	}
}

function ghostStop(wait) {
	ghost.active = false;
	ghost.last = null;
	ghost.wait = Math.max(ghost.wait, wait);
	if (!kb.on) finger.v = 0;
}

/* ---------- steering it: pointer and keyboard ---------- */
const input = { x: 0, y: 0, last: null, moved: false };
const kb = { on: false, x: 0, y: 0, q: [] };

function touched() {
	// someone is here: the ghost steps aside and waits a while after the last touch
	if (ghost.active) ghostStop(0);
	ghost.wait = Math.max(ghost.wait, 3.5);
}

/* when no loop is running (reduced motion, Pause) a wipe is laid down on the spot, without fading anything */
function applyNow() {
	const strokes = [];
	if (input.moved) {
		const from = input.last || input;
		strokes.push({ x0: from.x, y0: from.y, x1: input.x, y1: input.y });
		input.last = { x: input.x, y: input.y };
		input.moved = false;
	}
	while (kb.q.length) strokes.push(kb.q.shift());
	if (strokes.length) {
		flowStep(0, strokes, false);
		draw();
	}
}

function pointerPoint(ev, fresh) {
	if (!ready) return;
	const r = canvas.getBoundingClientRect();
	input.x = ev.clientX - r.left;
	input.y = ev.clientY - r.top;
	if (fresh) input.last = null;
	input.moved = true;
	kb.on = false;
	touched();
	if (!live()) applyNow();
}

canvas.addEventListener('pointerdown', (ev) => {
	if (ev.button > 0) return;
	if (ev.pointerType !== 'mouse') {
		try { canvas.setPointerCapture(ev.pointerId); } catch (err) { /* the pointer is already gone */ }
	}
	pointerPoint(ev, true);
});
canvas.addEventListener('pointermove', (ev) => {
	// a mouse wipes as it passes; a finger or a pen wipes while it is down
	if (ev.pointerType !== 'mouse' && ev.buttons === 0) return;
	pointerPoint(ev, false);
});
const letGo = () => { input.last = null; };
canvas.addEventListener('pointerup', letGo);
canvas.addEventListener('pointercancel', letGo);
canvas.addEventListener('pointerleave', letGo);

canvas.addEventListener('focus', () => {
	if (!ready || !canvas.matches(':focus-visible')) return; // a click also focuses it; only the keyboard shows the fingertip
	kb.on = true;
	if (!kb.x) { kb.x = cssW * 0.58; kb.y = cssH * 0.4; }
	finger.x = kb.x;
	finger.y = kb.y;
	finger.v = 1;
	if (!live()) draw();
});
canvas.addEventListener('blur', () => {
	kb.on = false;
	if (!ghost.active) finger.v = 0;
	if (!live() && ready) draw();
});
canvas.addEventListener('keydown', (ev) => {
	if (!ready) return;
	const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
	if (!d) return;
	ev.preventDefault();
	if (!kb.x) { kb.x = cssW * 0.58; kb.y = cssH * 0.4; }
	const step = Math.min(cssW, cssH) * (ev.shiftKey ? 0.14 : 0.05);
	const nx = clamp(kb.x + d[0] * step, 6, cssW - 6);
	const ny = clamp(kb.y + d[1] * step, 6, cssH - 6);
	kb.q.push({ x0: kb.x, y0: kb.y, x1: nx, y1: ny });
	kb.x = nx;
	kb.y = ny;
	kb.on = true;
	finger.x = nx;
	finger.y = ny;
	finger.v = 1;
	touched();
	if (!live()) applyNow();
});

/* ---------- one frame ---------- */

function tick(dt) {
	const strokes = [];
	if (input.moved) {
		const from = input.last || input;
		strokes.push({ x0: from.x, y0: from.y, x1: input.x, y1: input.y });
		input.last = { x: input.x, y: input.y };
		input.moved = false;
	}
	while (kb.q.length) strokes.push(kb.q.shift());
	ghostStep(dt, strokes);
	if (breath > 0) breath = Math.max(0, breath - dt);
	stepDrops(dt);
	flowStep(dt, strokes);
	draw();
	governor(dt);
}

/* long frames: lower the resolution a step */
let ema = 1 / 60;
let slow = 0;
function governor(dt) {
	ema += (dt - ema) * 0.08;
	if (ema > 0.028 && dpr > 0.7) {
		if (++slow > 24) {
			slow = 0;
			ema = 1 / 60;
			dpr = Math.max(0.7, dpr - 0.25);
			resize();
		}
	} else slow = 0;
}

/* ---------- the reduced-motion still, and the starting state ---------- */

function resetSim() {
	flowClear();
	dropsClear();
	// the drops start spread down the glass, each with a trail already behind it, and the first few seconds are played through
	const sc = dropScale();
	drops.forEach((d, i) => {
		spawnDrop(d);
		d.y = cssH * (0.1 + 0.17 * i + 0.07 * rnd());
		d.x = cssW * (0.1 + 0.8 * rnd());
		d.a = 1;
		const t = trails[d.trail];
		if (t) {
			t.x = d.x;
			t.y1 = d.y;
			t.y0 = Math.max(0, d.y - (50 + rnd() * 140) * sc);
		}
	});
	for (let i = 0; i < 100; i++) stepDrops(0.05);
}

/* one clear arc, drawn once and half faded: the ghost's first wipe, played through without drawing, then one frame */
function stillFrame() {
	resetSim();
	const arc = ARCS[0];
	let last = null;
	const dt = 1 / 60;
	for (let t = dt; t <= arc.dur + 1e-6; t += dt) {
		const p = arcPoint(arc, smooth(t / arc.dur));
		flowStep(dt, [{ x0: (last || p).x, y0: (last || p).y, x1: p.x, y1: p.y }]);
		last = p;
	}
	finger.v = 0;
	draw();
}

/* ---------- Fog it up, Pause ---------- */

fogBtn.addEventListener('click', () => {
	if (!ready) return;
	if (live()) {
		breath = BREATH; // the wipes fade at once, over about a second
		ghostStop(0);
		ghost.wait = Math.max(ghost.wait, BREATH + 1.2);
	} else {
		// at rest (Pause, reduced motion): the glass fogs over at once; a sliding drop keeps a trail from where it is now
		flowClear();
		trails.forEach((t) => {
			if (t.live) t.y0 = t.y1;
			else { t.on = false; t.a = 0; }
		});
		draw();
	}
});

pauseBtn.addEventListener('click', () => {
	if (!ready || REDUCED) return;
	paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	if (paused) {
		ctl.stop();
		if (!kb.on) finger.v = 0;
		draw();
	} else ctl.start();
});

/* ---------- no WebGL: the picture under a frosted CSS overlay ---------- */

function fallback() {
	ready = false;
	document.body.classList.add('is-fallback');
	canvas.hidden = true;
	if (ctl) ctl.stop();
	if (!poster.querySelector('picture')) {
		const picture = document.createElement('picture');
		const source = document.createElement('source');
		source.type = 'image/avif';
		source.srcset = `${POSTER_URL}.avif`;
		const img = document.createElement('img');
		img.src = `${POSTER_URL}.webp`;
		img.alt = 'A snowy night street with lit windows, seen from above through a window.';
		img.width = 1536;
		img.height = 1024;
		picture.append(source, img);
		poster.prepend(picture);
	}
	poster.hidden = false;
	[fogBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	hintEl?.setAttribute('hidden', '');
}

/* ---------- start ---------- */

function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`could not load ${url}`));
		img.src = url;
	});
}

async function start() {
	boot();
	// on a short phone, or a phone held sideways, the panel starts folded so the glass gets the room
	if (matchMedia('(max-width: 720px) and (max-height: 699px), (max-height: 520px)').matches) document.querySelector('.info-toggle')?.click();
	if (REDUCED) pauseBtn.disabled = true;

	if (!initContext()) {
		fallback();
		return;
	}
	resize();
	// the small picture is enough unless a narrow window crops it so far that it would be soft
	const ca = cssW / cssH;
	const visible = Math.min(1, ca / 1.5);
	const wide = (cssW * dpr) / visible > 760 ? 1536 : 768;
	try {
		image = await loadImage(IMG_URL(wide));
	} catch (err) {
		fallback();
		return;
	}
	imgW = image.naturalWidth || 1536;
	imgH = image.naturalHeight || 1024;
	noiseData = makeNoise();
	blurCv = makeBlur();
	makeFrost();
	buildScene();
	ready = true;
	resize();
	if (REDUCED) stillFrame();
	else {
		resetSim();
		draw();
	}
	canvas.classList.add('is-ready');

	canvas.addEventListener('webglcontextlost', (ev) => {
		ev.preventDefault();
		lost = true;
		setTimeout(() => { if (lost) fallback(); }, 3000);
	});
	canvas.addEventListener('webglcontextrestored', () => {
		lost = false;
		if (!initContext()) { fallback(); return; }
		buildScene();
		resize();
		flowClear();
		draw();
	});

	new ResizeObserver(resize).observe(canvas);

	if (REDUCED) return; // the still, drawn once; nothing else runs

	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	ctl = loop(canvas, tick, { name: 'frosted-window' });
}

start();
