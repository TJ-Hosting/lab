/*
 * Sample 59 — "Liquid Hover Gallery".
 * Three glass cards, each holding the same two pictures (a glass wave and a field of cornflowers). Hover a card, tap it,
 * or focus it with the keyboard, and the first picture melts into the second. What steers the melt is a displacement map,
 * and each card has its own, drawn on a canvas in code: liquid noise (a domain-warped fractal noise), a radial swirl, and
 * diagonal stripes. One three.js renderer and one transparent canvas lie over the row and draw all three cards, each
 * into its own viewport; the cards themselves are plain glass buttons that never move. The tween library is replaced by
 * two small easing functions that run inside one loop() from js/lab.js, which is the only caller of renderer.render, so
 * nothing draws off-screen or in a hidden tab. When nobody points, a slow demo hovers the cards one after another.
 * Under reduced motion each card shows its first picture, still; a hover, tap or Swap all then cuts straight to the
 * second. A browser without WebGL shows the first picture of each card as a plain image, with a short note.
 *
 * Adapted from hover-effect (WebGL Distortion Hover Effects) by Robin Delaporte (robin-dela),
 * https://github.com/robin-dela/hover-effect (commit 1938cbff22a0379c5c5f17355550961374e7754c, src/hover-effect.js), MIT.
 * What is taken: the fragment shader's idea and structure (two pictures, a displacement picture, an angle and an
 * intensity for each side, and a 0 to 1 factor that fades one into the other while pushing both along the displacement)
 * and the expo.out easing with the original's speeds. What changed: GSAP is gone (the easing runs in loop()); the
 * displacement pictures are drawn in code, as signed vectors, instead of loaded; one renderer draws three viewports
 * instead of one renderer per card; the pictures are cover-fitted from the card's shape and mip-mapped; the corners
 * are rounded in the shader; hover is mouse and pen only, tap and keyboard focus
 * toggle; the idle demo, the pause and the reduced-motion still are new; and the image loading and the page are new code.
 * three.js itself is vendored at vendor/three@0.186.1/ (MIT, see its LICENSE).
 *
 * MIT License
 *
 * Copyright (c) 2018 Robin Delaporte, Aarni Koskela
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
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import * as THREE from '../../vendor/three@0.186.1/build/three.module.js';

const REDUCED = prefersReducedMotion();

const stage = document.querySelector('.gallery-stage');
const row = document.querySelector('.gallery__row');
const canvas = document.querySelector('.gallery__gl');
const panel = document.querySelector('.sample-info');
const swapBtn = document.querySelector('[data-action="swap"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const noteFallback = document.querySelector('.note--fallback');
const noteSample = document.querySelector('.note:not(.note--fallback)');

/* ---------- the three looks ----------
   angle: [first picture, second picture], in radians: how the displacement field is turned for each side
   (the second side usually turns it half a circle, so the pictures are pushed in opposite directions)
   intensity: [first, second], how far a picture is pushed at most, as a share of its own size */
const LOOKS = [
	{ name: 'Liquid', draw: drawLiquid, angle: [0.7, 0.7 + Math.PI], intensity: [0.42, 0.42] },
	{ name: 'Swirl', draw: drawSwirl, angle: [-0.3, Math.PI - 0.3], intensity: [0.62, 0.62] },
	{ name: 'Stripes', draw: drawStripes, angle: [0, Math.PI], intensity: [0.3, 0.3] },
];

/* the original's speeds, in seconds, for a hover or a tap (expo.out); the demo is slower and gentler (sine in-out) */
const SPEED = { in: 1.6, out: 1.2 };
const DEMO_SPEED = { in: 2.2, out: 2.0 };
/* the demo: one card at a time is "hovered" for HOLD seconds, a new one every STEP seconds; it waits WAIT seconds after any touch */
const WAIT = 2.2;
const STEP = 3.4;
const HOLD = 2.6;
const IMAGE_ASPECT = 2 / 3; // both pictures are 2:3

const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const sineInOut = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, x));

/* ---------- displacement maps, drawn in code ----------
   Each map is a canvas whose red and green channels hold a vector, 0.5 meaning zero. The shader reads it as a push of
   up to +-1 (then turns it by the card's angle and scales it by the card's intensity). v runs up, as in uv space. */

function hash(x, y, s) {
	let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x, y, s) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const xf = x - xi;
	const yf = y - yi;
	const u = xf * xf * (3 - 2 * xf);
	const v = yf * yf * (3 - 2 * yf);
	const a = hash(xi, yi, s);
	const b = hash(xi + 1, yi, s);
	const c = hash(xi, yi + 1, s);
	const d = hash(xi + 1, yi + 1, s);
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s) {
	let sum = 0;
	let amp = 0.5;
	for (let o = 0; o < 4; o++) {
		sum += amp * noise(x, y, s + o);
		x = x * 2.03 + 17.1;
		y = y * 2.03 + 3.7;
		amp *= 0.5;
	}
	return sum / 0.9375;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
	const t = clamp((v - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

/* one pixel loop shared by the three maps: fn(u, v) returns [dx, dy] in -1..1 */
function paint(w, h, fn) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const ctx = c.getContext('2d');
	const img = ctx.createImageData(w, h);
	const px = img.data;
	for (let j = 0; j < h; j++) {
		for (let i = 0; i < w; i++) {
			const [dx, dy] = fn((i + 0.5) / w, 1 - (j + 0.5) / h);
			const k = (j * w + i) * 4;
			px[k] = Math.round((clamp(dx, -1, 1) * 0.5 + 0.5) * 255);
			px[k + 1] = Math.round((clamp(dy, -1, 1) * 0.5 + 0.5) * 255);
			px[k + 2] = 128;
			px[k + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	return c;
}

/* Liquid: two fractal noises, each bent by two others (a domain warp), so the push flows in slow eddies */
function drawLiquid() {
	return paint(176, 176, (u, v) => {
		const x = u * 2.6;
		const y = v * 2.6;
		const qx = fbm(x, y, 1);
		const qy = fbm(x + 5.2, y + 1.3, 5);
		const dx = fbm(x + 3.2 * qx + 1.7, y + 3.2 * qy + 9.2, 9);
		const dy = fbm(x + 3.2 * qx + 8.3, y + 3.2 * qy + 2.8, 13);
		return [(dx - 0.5) * 3, (dy - 0.5) * 3];
	});
}

/* Swirl: the push that turns each point about the card's centre by an angle that is largest in the middle and
   fades to nothing towards the edges; the card is 2:3, so the circle is worked out in height units */
function drawSwirl() {
	const w = 192;
	const h = 288;
	const aspect = w / h;
	const TWIST = 2.9; // radians at the centre
	const REACH = 0.64; // where the twist has died away, in heights
	const MAX = 0.6; // the largest push, in uv, mapped to 1
	return paint(w, h, (u, v) => {
		const px = (u - 0.5) * aspect;
		const py = v - 0.5;
		const r = Math.hypot(px, py);
		const a = TWIST * (1 - smooth(0, REACH, r));
		const c = Math.cos(a);
		const s = Math.sin(a);
		const dpx = c * px - s * py - px;
		const dpy = s * px + c * py - py;
		return [dpx / aspect / MAX, dpy / MAX];
	});
}

/* Stripes: seven soft-edged diagonal slats, each pushed along its own length, one way then the other, some further than others */
function drawStripes() {
	return paint(384, 384, (u, v) => {
		const across = (v - u) * 7 * Math.PI;
		const f = clamp(Math.sin(across) * 1.6, -1, 1);
		const reach = 0.7 + 0.3 * Math.sin(across * 0.43 + 1.1);
		const m = f * reach * 0.7071;
		return [m, m];
	});
}

/* ---------- the shader: hover-effect's, with signed maps, a cover fit and rounded corners ---------- */
const VERT = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D disp;
uniform float uMix;
uniform vec2 uAngle;
uniform vec2 uInt;
uniform vec2 uCover;
uniform vec2 uPx;
uniform float uRadius;

mat2 rot( float a ) {
	float s = sin( a );
	float c = cos( a );
	return mat2( c, - s, s, c );
}

void main() {
	vec2 d = ( texture2D( disp, vUv ).rg - 0.5 ) * 2.0;
	vec2 uv = ( vUv - 0.5 ) * uCover + 0.5;
	vec2 p1 = uv + rot( uAngle.x ) * d * uInt.x * uMix;
	vec2 p2 = uv + rot( uAngle.y ) * d * uInt.y * ( 1.0 - uMix );
	vec3 a = texture2D( tex1, p1 ).rgb;
	vec3 b = texture2D( tex2, p2 ).rgb;
	vec3 col = mix( a, b, uMix );

	vec2 q = abs( vUv - 0.5 ) * uPx - ( 0.5 * uPx - uRadius );
	float dist = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 ) - uRadius;
	float alpha = clamp( 0.5 - dist, 0.0, 1.0 );
	gl_FragColor = vec4( col * alpha, alpha );
}`;

/* ---------- the cards ---------- */
const cards = [...row.querySelectorAll('.card')].map((el, i) => ({
	el,
	view: el.querySelector('.card__view'),
	img: el.querySelector('img'),
	look: LOOKS[i],
	hover: false, // a mouse or pen is over it
	focus: false, // keyboard focus
	on: false, // switched on by a tap, a click, Enter or Swap all
	p: 0, // how far the morph has got, 0 (first picture) to 1 (second)
	to: 0, // where it is heading
	fast: true, // the last thing that moved it was a person, so it uses the original's speed and easing
	tw: null, // the running tween: { from, to, el, dur, ease }
	rect: null,
	radius: 12,
	mat: null,
}));

let renderer = null;
let scene = null;
let camera = null;
let mesh = null;
let ready = false;
let lost = false;
let dirty = true;
let paused = false;
let DPR = 1;
let W = 0;
let H = 0;
let idle = WAIT - 0.6; // seconds since a person last touched a card; the demo starts a moment after the first frame
let phase = 0; // the demo's clock

/* ---------- layout: the panel is fixed at the bottom left, so the row stops above it ---------- */
function updateDock() {
	const p = panel.getBoundingClientRect();
	stage.style.setProperty('--dock', `${Math.round(Math.max(0, innerHeight - p.top) + 10)}px`);
}

function layout() {
	const r = row.getBoundingClientRect();
	if (r.width < 4 || r.height < 4) return false;
	W = r.width;
	H = r.height;
	renderer.setPixelRatio(DPR);
	renderer.setSize(W, H, false);
	for (const c of cards) {
		const v = c.view.getBoundingClientRect();
		c.rect = { x: v.left - r.left, y: v.top - r.top, w: v.width, h: v.height };
		c.radius = parseFloat(getComputedStyle(c.view).borderTopLeftRadius) || 12;
	}
	return true;
}

/* ---------- drawing: clear once, then one viewport per card ---------- */
function render() {
	if (!ready || lost || W < 4) return;
	renderer.setScissorTest(false);
	renderer.clear();
	for (const c of cards) {
		const { x, y, w, h } = c.rect;
		if (w < 2 || h < 2) continue;
		const u = c.mat.uniforms;
		u.uMix.value = c.p;
		const aspect = w / h;
		if (aspect > IMAGE_ASPECT) u.uCover.value.set(1, IMAGE_ASPECT / aspect);
		else u.uCover.value.set(aspect / IMAGE_ASPECT, 1);
		u.uPx.value.set(w * DPR, h * DPR);
		u.uRadius.value = c.radius * DPR;
		mesh.material = c.mat;
		renderer.setViewport(x, H - y - h, w, h);
		renderer.render(scene, camera);
	}
	dirty = false;
}

/* ---------- the easing: a tween per card, advanced by loop()'s dt ---------- */
function retarget(c, to) {
	if (c.to === to) return;
	c.to = to;
	if (REDUCED) {
		c.p = to;
		c.tw = null;
		return;
	}
	const speed = c.fast ? SPEED : DEMO_SPEED;
	c.tw = { from: c.p, to, el: 0, dur: to ? speed.in : speed.out, ease: c.fast ? expoOut : sineInOut };
}

function advance(c, dt) {
	const tw = c.tw;
	if (!tw) return false;
	tw.el += dt;
	const x = Math.min(1, tw.el / tw.dur);
	c.p = x >= 1 ? tw.to : tw.from + (tw.to - tw.from) * tw.ease(x);
	if (x >= 1) c.tw = null;
	return true;
}

/* one frame of the show: who wants what (people first, then the demo), the tweens, and a render if anything changed */
let frames = 0;
const samples = [];
let slow = 0;
function tick(dt) {
	if (lost) return;
	const busy = cards.some((c) => c.hover || c.focus);
	if (busy) idle = 0;
	else idle += dt;
	const demoRuns = !busy && idle >= WAIT;
	if (demoRuns && !paused) phase += dt;
	else if (!demoRuns) phase = 0;

	let changed = dirty;
	cards.forEach((c, i) => {
		const user = c.hover || c.focus || c.on;
		const q = (phase % (STEP * cards.length)) - i * STEP;
		const demo = demoRuns && q >= 0 && q < HOLD;
		if (user) c.fast = true;
		else if (demo) c.fast = false;
		retarget(c, user || demo ? 1 : 0);
		if (advance(c, dt)) changed = true;
	});
	if (changed) render();

	/* a slow machine steps the pixel ratio down once, never below 1 */
	frames++;
	if (frames > 40 && DPR > 1) {
		samples.push(dt);
		if (samples.length >= 60) {
			samples.sort((a, b) => a - b);
			slow = samples[30] > 0.03 ? slow + 1 : 0;
			samples.length = 0;
			if (slow >= 2) {
				slow = 0;
				DPR = Math.max(1, DPR * 0.75);
				if (layout()) render();
			}
		}
	}
}

/* ---------- people ---------- */
function touch() {
	idle = 0;
	/* under reduced motion there is no tween: the card cuts straight to where it is wanted */
	if (REDUCED && ready) {
		cards.forEach((c) => {
			c.p = c.to = c.hover || c.focus || c.on ? 1 : 0;
			c.tw = null;
		});
		render();
	}
}

function bindCards() {
	for (const c of cards) {
		const el = c.el;
		/* hover is for a mouse or a pen; on a touch screen a tap toggles instead, so a finger never makes it flicker */
		el.addEventListener('pointerenter', (e) => {
			if (e.pointerType === 'touch') return;
			c.hover = true;
			touch();
		});
		el.addEventListener('pointerleave', (e) => {
			if (e.pointerType === 'touch') return;
			c.hover = false;
			touch();
		});
		el.addEventListener('focus', () => {
			if (!el.matches(':focus-visible')) return;
			c.focus = true;
			touch();
		});
		el.addEventListener('blur', () => {
			c.focus = false;
			touch();
		});
		el.addEventListener('click', () => {
			c.on = !c.on;
			el.setAttribute('aria-pressed', String(c.on));
			touch();
		});
	}
	swapBtn.addEventListener('click', () => {
		const allOn = cards.every((c) => c.on);
		cards.forEach((c) => {
			c.on = !allOn;
			c.el.setAttribute('aria-pressed', String(c.on));
		});
		touch();
	});
	if (REDUCED) {
		pauseBtn.disabled = true;
		return;
	}
	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
	});
}

/* ---------- no WebGL: the first picture in every card, a short note, and nothing to press ---------- */
function fallback() {
	ready = false;
	try { if (renderer) renderer.dispose(); } catch (err) { /* nothing to free */ }
	renderer = null;
	document.body.classList.add('is-fallback');
	row.classList.add('is-fallback');
	canvas.remove();
	cards.forEach((c) => {
		c.el.disabled = true;
		c.el.setAttribute('aria-label', `${c.look.name}: a glass wave sculpture on pale blue`);
	});
	noteFallback.hidden = false;
	noteSample.hidden = true;
	swapBtn.disabled = true;
	pauseBtn.disabled = true;
}

/* ---------- start ---------- */
function imageReady(img) {
	if (img.complete && img.naturalWidth) return Promise.resolve();
	return new Promise((resolve, reject) => {
		img.addEventListener('load', resolve, { once: true });
		img.addEventListener('error', () => reject(new Error('image')), { once: true });
	});
}

async function start() {
	updateDock();
	new ResizeObserver(updateDock).observe(panel);
	addEventListener('resize', updateDock);
	bindCards();

	/* ask for a throw-away WebGL 2 context first, so a browser without it gets the plain images, not console errors */
	const probe = document.createElement('canvas').getContext('webgl2');
	if (!probe) {
		fallback();
		return;
	}
	probe.getExtension('WEBGL_lose_context')?.loseContext();
	try {
		renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
	} catch (err) {
		fallback();
		return;
	}
	DPR = Math.min(2, window.devicePixelRatio || 1);
	renderer.setClearColor(0x000000, 0);
	renderer.autoClear = false;

	/* the two pictures: the browser has already chosen the 512 or the 1024 file for the first card's image; the second follows it */
	await imageReady(cards[0].img);
	const src1 = cards[0].img.currentSrc || cards[0].img.src;
	const src2 = src1.replace('-wave-', '-cornflowers-');
	const loader = new THREE.TextureLoader();
	const [tex1, tex2] = await Promise.all([loader.loadAsync(src1), loader.loadAsync(src2)]);
	const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
	for (const t of [tex1, tex2]) {
		t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
		t.anisotropy = aniso;
	}

	/* a full-viewport quad: each card draws it into its own viewport */
	scene = new THREE.Scene();
	camera = new THREE.Camera();
	const geometry = new THREE.PlaneGeometry(2, 2);
	for (const c of cards) {
		const map = new THREE.CanvasTexture(c.look.draw());
		map.generateMipmaps = false;
		map.minFilter = map.magFilter = THREE.LinearFilter;
		c.mat = new THREE.ShaderMaterial({
			uniforms: {
				tex1: { value: tex1 },
				tex2: { value: tex2 },
				disp: { value: map },
				uMix: { value: 0 },
				uAngle: { value: new THREE.Vector2(...c.look.angle) },
				uInt: { value: new THREE.Vector2(...c.look.intensity) },
				uCover: { value: new THREE.Vector2(1, 1) },
				uPx: { value: new THREE.Vector2(1, 1) },
				uRadius: { value: 12 },
			},
			vertexShader: VERT,
			fragmentShader: FRAG,
			blending: THREE.NoBlending,
			depthTest: false,
			depthWrite: false,
		});
	}
	mesh = new THREE.Mesh(geometry, cards[0].mat);
	mesh.frustumCulled = false;
	scene.add(mesh);

	canvas.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		lost = true;
	});
	canvas.addEventListener('webglcontextrestored', () => {
		lost = false;
		dirty = true;
		render();
	});

	ready = true;
	if (layout()) render();
	/* the canvas is cleared by a resize, so the picture is redrawn in the same callback, before the next paint */
	new ResizeObserver(() => {
		if (layout()) render();
	}).observe(row);

	if (REDUCED) return; // the first picture in each card, drawn once; nothing loops

	loop(row, tick, { name: 'liquid-hover-gallery' });
}

boot();
start().catch(() => {
	/* anything that goes wrong while setting up WebGL ends in the plain images, not a blank row */
	if (!document.body.classList.contains('is-fallback')) fallback();
});
