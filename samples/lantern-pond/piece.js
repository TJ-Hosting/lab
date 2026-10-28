/*
 * Sample 57 — "Lantern Pond Ripples".
 * A dusk pond photograph rippled by a small wave simulation on the GPU (WebGL, GLSL). A height field lives in two
 * float textures; each step every cell is pulled toward the average of its neighbours, damped, and added to itself;
 * a "drop" lifts a smooth bump that spreads out as rings. The render shader reads the slope of that field, bends the
 * photo along it, and adds a cyan glint and a cyan caustic where the surface catches the light. Pointer and finger
 * leave ripples; a golden leaf falls and lands with a ring every few seconds, and the two lanterns shed a faint ring
 * now and then, so the pond is alive on load. One loop() drives the simulation, the render and the leaf, so no WebGL
 * work runs off-screen or in a hidden tab. Under reduced motion a few rings are simulated at once, one still frame is
 * drawn and nothing moves. A browser without WebGL float textures gets the photo as a plain picture with a note.
 *
 * Adapted from jQuery Ripples (src/main.js, v0.6.3) by sirxemic / Pim Schreurs,
 * https://github.com/sirxemic/jquery.ripples (commit e90bd54ee5d2b23d04a208ad1248456c42abb289), MIT.
 * What is taken: the ripple simulation and its shaders (the drop bump, the neighbour-average wave update, the
 * normal-from-height refraction with its specular term), the float and half-float texture probing, and the public
 * methods drop(x, y, radius, strength), pause, play, set and destroy. What changed: no jQuery and no CSS background:
 * it is one module with a canvas, a cover-cropped photo (with a focus point) and an options object; the plugin's own
 * requestAnimationFrame loop is gone, the owner calls step() and render() from loop(); drops are queued and applied
 * at the next step; the simulation runs on a fixed 60 Hz clock; render() reads the newest height texture (the
 * source reads the one before it on every other frame); the texture probing runs in the page's own context and also
 * accepts half floats alone; precision falls back to mediump; the picture is drawn opaque; the render shader adds the
 * cyan caustic and glint (the glint was white); pointer events replace mouse and touch events and trace the stroke
 * between events; a lost context is rebuilt; the resolution and the render scale are picked by device and lowered if
 * frames run slow. New: the falling leaf, the lantern rings, the idle life, the reduced-motion still, the fallback.
 *
 * MIT License
 *
 * Copyright (c) 2017 Pim Schreurs
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

const canvas = document.querySelector('.piece');
const leafEl = document.querySelector('.leaf');
const poster = document.querySelector('.poster');
const info = document.querySelector('.sample-info');
const dropBtn = document.querySelector('[data-action="drop"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const REDUCED = prefersReducedMotion();
const PHONE = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
const IMAGE_URL = `../../img/art/lantern-pond-pond-${PHONE ? 768 : 1536}.webp`;
const POSTER_URL = '../../img/art/lantern-pond-pond-1536';

/* where the two lanterns sit on the water in the photo (0..1 across and down the picture) */
const LANTERNS = [{ u: 0.254, v: 0.3 }, { u: 0.695, v: 0.64 }];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (a, b, x) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

/* small deterministic PRNG so the still frame is the same on every visit */
function seeded(seed) {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

/* ---------- the ripples engine (adapted from the plugin's src/main.js) ---------- */

const VERTEX = `attribute vec2 vertex;
varying vec2 coord;
void main() {
	coord = vertex * 0.5 + 0.5;
	gl_Position = vec4(vertex, 0.0, 1.0);
}`;

const PRECISION = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

/* a drop lifts a smooth cosine bump of the height field */
const DROP_FRAGMENT = `${PRECISION}
const float PI = 3.141592653589793;
uniform sampler2D texture;
uniform vec2 center;
uniform float radius;
uniform float strength;
varying vec2 coord;
void main() {
	vec4 info = texture2D(texture, coord);
	float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);
	drop = 0.5 - cos(drop * PI) * 0.5;
	info.r += drop * strength;
	gl_FragColor = info;
}`;

/* r is the height, g the velocity: pulled toward the neighbours' average, damped, integrated */
const UPDATE_FRAGMENT = `${PRECISION}
uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;
void main() {
	vec4 info = texture2D(texture, coord);
	vec2 dx = vec2(delta.x, 0.0);
	vec2 dy = vec2(0.0, delta.y);
	float average = (
		texture2D(texture, coord - dx).r +
		texture2D(texture, coord - dy).r +
		texture2D(texture, coord + dx).r +
		texture2D(texture, coord + dy).r
	) * 0.25;
	info.g += (average - info.r) * 2.0;
	info.g *= 0.995;
	info.r += info.g;
	gl_FragColor = info;
}`;

const RENDER_VERTEX = `precision highp float;
attribute vec2 vertex;
uniform vec2 topLeft;
uniform vec2 bottomRight;
uniform vec2 containerRatio;
varying vec2 ripplesCoord;
varying vec2 backgroundCoord;
void main() {
	backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);
	backgroundCoord.y = 1.0 - backgroundCoord.y;
	ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;
	gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);
}`;

/* the photo bent along the slope of the water, then a cyan glint where the slope faces the light,
   and a cyan caustic where the surface curves like a lens (crests) */
const RENDER_FRAGMENT = `${PRECISION}
uniform sampler2D samplerBackground;
uniform sampler2D samplerRipples;
uniform vec2 delta;
uniform float perturbance;
varying vec2 ripplesCoord;
varying vec2 backgroundCoord;
const vec3 CYAN = vec3(0.275, 0.816, 0.984);
void main() {
	float height = texture2D(samplerRipples, ripplesCoord).r;
	float heightX = texture2D(samplerRipples, vec2(ripplesCoord.x + delta.x, ripplesCoord.y)).r;
	float heightY = texture2D(samplerRipples, vec2(ripplesCoord.x, ripplesCoord.y + delta.y)).r;
	float heightMX = texture2D(samplerRipples, vec2(ripplesCoord.x - delta.x, ripplesCoord.y)).r;
	float heightMY = texture2D(samplerRipples, vec2(ripplesCoord.x, ripplesCoord.y - delta.y)).r;
	vec3 dx = vec3(delta.x, heightX - height, 0.0);
	vec3 dy = vec3(0.0, heightY - height, delta.y);
	vec2 offset = -normalize(cross(dy, dx)).xz;
	float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);
	float lens = max(0.0, (4.0 * height - heightX - heightY - heightMX - heightMY)) * 55.0;
	vec3 photo = texture2D(samplerBackground, backgroundCoord + offset * perturbance).rgb;
	vec3 light = mix(vec3(1.0), CYAN, 0.55) * specular * 0.85 + CYAN * min(lens, 1.0) * 0.45;
	gl_FragColor = vec4(photo + light, 1.0);
}`;

/* Which float texture can we draw into? Float first, then half float. Returns {type, linear} or null. */
function probeConfig(gl) {
	const ext = {};
	[
		'OES_texture_float', 'OES_texture_half_float', 'OES_texture_float_linear', 'OES_texture_half_float_linear',
		'WEBGL_color_buffer_float', 'EXT_color_buffer_half_float',
	].forEach((name) => {
		const e = gl.getExtension(name);
		if (e) ext[name] = e;
	});
	const configs = [];
	if (ext.OES_texture_float) configs.push({ type: gl.FLOAT, linear: !!ext.OES_texture_float_linear });
	if (ext.OES_texture_half_float) configs.push({ type: ext.OES_texture_half_float.HALF_FLOAT_OES, linear: !!ext.OES_texture_half_float_linear });
	if (!configs.length) return null;

	const texture = gl.createTexture();
	const framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	let found = null;
	for (const c of configs) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, c.type, null);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
			found = c;
			break;
		}
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.deleteFramebuffer(framebuffer);
	gl.deleteTexture(texture);
	return found;
}

/**
 * createRipples(canvas, options) → the water, or null when the browser can't draw into float textures.
 * options: resolution (cells on the longest side of the field), dropRadius (CSS px), perturbance, interactive,
 * imageUrl, view(w, h) → {zoom, x, y} (how far the cover crop is zoomed and where it sits, 0..1; optional), maxDpr, preserve, onImage().
 * Methods: drop(x, y, radius, strength) in CSS px from the canvas's top left, step(dt), render(), simulate(n),
 * reset(), fit(), pause(), play(), set(property, value), setScale(s), toElement(u, v), destroy().
 */
function createRipples(cnv, options) {
	const opt = Object.assign({ resolution: 256, dropRadius: 20, perturbance: 0.03, interactive: true, imageUrl: null, view: null, maxDpr: 1.5, preserve: false, onImage: null }, options);
	const params = { alpha: false, depth: false, stencil: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: !!opt.preserve };
	const gl = cnv.getContext('webgl', params) || cnv.getContext('experimental-webgl', params);
	if (!gl) return null;

	let config = null;
	let programs = {};
	let quad = null;
	let backgroundTexture = null;
	let textures = [];
	let framebuffers = [];
	let cur = 0; // the index of the newest height texture
	let resolution = opt.resolution;
	let scale = 1;
	let cssW = 0;
	let cssH = 0;
	let image = null;
	let imageW = 3;
	let imageH = 2;
	let lost = false;
	let running = true;
	let acc = 0;
	const queue = [];
	const bounds = { topLeft: new Float32Array(2), bottomRight: new Float32Array(2), ratio: new Float32Array([1, 1]), bx: 0, by: 0, bw: 1, bh: 1 };
	const textureDelta = new Float32Array(2);

	function createProgram(vertexSource, fragmentSource, names) {
		const compile = (type, source) => {
			const shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`compile error: ${gl.getShaderInfoLog(shader)}`);
			return shader;
		};
		const program = { id: gl.createProgram(), locations: {} };
		gl.attachShader(program.id, compile(gl.VERTEX_SHADER, vertexSource));
		gl.attachShader(program.id, compile(gl.FRAGMENT_SHADER, fragmentSource));
		gl.bindAttribLocation(program.id, 0, 'vertex');
		gl.linkProgram(program.id);
		if (!gl.getProgramParameter(program.id, gl.LINK_STATUS)) throw new Error(`link error: ${gl.getProgramInfoLog(program.id)}`);
		names.forEach((n) => { program.locations[n] = gl.getUniformLocation(program.id, n); });
		return program;
	}

	function bindTexture(texture, unit) {
		gl.activeTexture(gl.TEXTURE0 + (unit || 0));
		gl.bindTexture(gl.TEXTURE_2D, texture);
	}

	function drawQuad() {
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	/* two ping-pong textures for the height field; they start flat (all zeros) */
	function allocate() {
		textures.forEach((t) => gl.deleteTexture(t));
		framebuffers.forEach((f) => gl.deleteFramebuffer(f));
		textures = [];
		framebuffers = [];
		const filter = config.linear ? gl.LINEAR : gl.NEAREST;
		for (let i = 0; i < 2; i++) {
			const texture = gl.createTexture();
			const framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, config.type, null);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
			textures.push(texture);
			framebuffers.push(framebuffer);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		cur = 0;
		textureDelta[0] = 1 / resolution;
		textureDelta[1] = 1 / resolution;
		gl.useProgram(programs.update.id);
		gl.uniform2fv(programs.update.locations.delta, textureDelta);
		gl.useProgram(programs.render.id);
		gl.uniform2fv(programs.render.locations.delta, textureDelta);
	}

	function uploadImage() {
		gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		if (image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([7, 17, 45, 255]));
	}

	/* every GL object is made here, so a restored context can have them all made again */
	function setup() {
		config = probeConfig(gl);
		if (!config) return false;
		gl.enableVertexAttribArray(0);
		quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
		programs = {
			drop: createProgram(VERTEX, DROP_FRAGMENT, ['texture', 'center', 'radius', 'strength']),
			update: createProgram(VERTEX, UPDATE_FRAGMENT, ['texture', 'delta']),
			render: createProgram(RENDER_VERTEX, RENDER_FRAGMENT, ['topLeft', 'bottomRight', 'containerRatio', 'samplerBackground', 'samplerRipples', 'delta', 'perturbance']),
		};
		backgroundTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // the photo is not a power of two
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		uploadImage();
		allocate();
		return true;
	}

	/* the photo covers the canvas, positioned by focus (like background-size: cover with a background-position) */
	function computeBounds() {
		if (!cssW || !cssH) return;
		const v = opt.view ? opt.view(cssW, cssH) : { zoom: 1, x: 0.5, y: 0.5 };
		const s = Math.max(cssW / imageW, cssH / imageH) * v.zoom;
		const bw = imageW * s;
		const bh = imageH * s;
		const bx = (cssW - bw) * v.x;
		const by = (cssH - bh) * v.y;
		bounds.topLeft[0] = -bx / bw;
		bounds.topLeft[1] = -by / bh;
		bounds.bottomRight[0] = bounds.topLeft[0] + cssW / bw;
		bounds.bottomRight[1] = bounds.topLeft[1] + cssH / bh;
		const maxSide = Math.max(cssW, cssH);
		bounds.ratio[0] = cssW / maxSide;
		bounds.ratio[1] = cssH / maxSide;
		bounds.bx = bx;
		bounds.by = by;
		bounds.bw = bw;
		bounds.bh = bh;
	}

	function fit() {
		const w = cnv.clientWidth;
		const h = cnv.clientHeight;
		if (!w || !h) return false;
		cssW = w;
		cssH = h;
		const pixelRatio = Math.min(window.devicePixelRatio || 1, opt.maxDpr) * scale;
		const pw = Math.max(1, Math.round(w * pixelRatio));
		const ph = Math.max(1, Math.round(h * pixelRatio));
		if (cnv.width !== pw || cnv.height !== ph) {
			cnv.width = pw;
			cnv.height = ph;
		}
		computeBounds();
		return true;
	}

	function loadImage() {
		if (!opt.imageUrl) return;
		const img = new Image();
		img.onload = () => {
			image = img;
			imageW = img.naturalWidth;
			imageH = img.naturalHeight;
			if (!lost) uploadImage();
			computeBounds();
			if (opt.onImage) opt.onImage(true);
		};
		img.onerror = () => { if (opt.onImage) opt.onImage(false); };
		img.src = opt.imageUrl;
	}

	/* ---- the simulation ---- */

	function applyDrop(x, y, radius, strength) {
		const longest = Math.max(cssW, cssH);
		gl.viewport(0, 0, resolution, resolution);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1 - cur]);
		bindTexture(textures[cur], 0);
		gl.useProgram(programs.drop.id);
		gl.uniform2f(programs.drop.locations.center, (2 * x - cssW) / longest, (cssH - 2 * y) / longest);
		gl.uniform1f(programs.drop.locations.radius, radius / longest);
		gl.uniform1f(programs.drop.locations.strength, strength);
		drawQuad();
		cur = 1 - cur;
	}

	function flush() {
		for (const d of queue.splice(0)) applyDrop(d[0], d[1], d[2], d[3]);
	}

	function update() {
		gl.viewport(0, 0, resolution, resolution);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1 - cur]);
		bindTexture(textures[cur], 0);
		gl.useProgram(programs.update.id);
		drawQuad();
		cur = 1 - cur;
	}

	const api = {
		get lost() { return lost; },
		get size() { return { w: cssW, h: cssH }; },
		get dropRadius() { return opt.dropRadius; },
		get interactive() { return opt.interactive && running; },
		fit,

		/* a drop at (x, y) CSS px from the canvas's top left; applied at the next step */
		drop(x, y, radius, strength) {
			if (queue.length < 64) queue.push([x, y, radius, strength]);
		},

		/* the owner's loop calls this every frame: queued drops, then the waves on a fixed 60 Hz clock */
		step(dt) {
			if (lost || !cssW) return;
			flush();
			if (!running) return;
			acc += dt * 60;
			let n = 0;
			while (acc >= 0.9 && n < 3) {
				update();
				acc -= 1;
				n++;
			}
			if (acc > 3) acc = 0;
		},

		/* n steps at once (drops included), for the still frame */
		simulate(n) {
			if (lost || !cssW) return;
			flush();
			for (let i = 0; i < n; i++) update();
		},

		render() {
			if (lost || !cssW) return;
			const p = programs.render;
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, cnv.width, cnv.height);
			gl.useProgram(p.id);
			bindTexture(backgroundTexture, 0);
			bindTexture(textures[cur], 1);
			gl.uniform1f(p.locations.perturbance, opt.perturbance);
			gl.uniform2fv(p.locations.topLeft, bounds.topLeft);
			gl.uniform2fv(p.locations.bottomRight, bounds.bottomRight);
			gl.uniform2fv(p.locations.containerRatio, bounds.ratio);
			gl.uniform1i(p.locations.samplerBackground, 0);
			gl.uniform1i(p.locations.samplerRipples, 1);
			drawQuad();
		},

		/* flat water again */
		reset() {
			queue.length = 0;
			if (!lost) allocate();
		},

		/* a different canvas pixel density: 1 is full, lower is cheaper */
		setScale(s) {
			scale = s;
			fit();
		},

		/* a point on the photo (0..1 across, 0..1 down) → CSS px on the canvas */
		toElement(u, v) {
			return { x: bounds.bx + u * bounds.bw, y: bounds.by + v * bounds.bh };
		},

		pause() { running = false; },
		play() { running = true; },

		set(property, value) {
			switch (property) {
				case 'dropRadius':
				case 'perturbance':
				case 'interactive':
					opt[property] = value;
					break;
				case 'imageUrl':
					opt.imageUrl = value;
					loadImage();
					break;
				default:
			}
		},

		destroy() {
			queue.length = 0;
			cnv.removeEventListener('webglcontextlost', onLost);
			cnv.removeEventListener('webglcontextrestored', onRestored);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		},
	};

	function onLost(e) {
		e.preventDefault();
		lost = true;
	}
	function onRestored() {
		lost = false;
		try {
			if (setup()) {
				fit();
				api.render();
			}
		} catch (err) {
			lost = true;
		}
	}
	cnv.addEventListener('webglcontextlost', onLost);
	cnv.addEventListener('webglcontextrestored', onRestored);

	try {
		if (!setup()) return null;
	} catch (err) {
		return null;
	}
	fit();
	loadImage();
	return api;
}

/* ---------- the page: the pond, the leaf, the lanterns, the controls ---------- */

const ripples = createRipples(canvas, {
	resolution: PHONE ? 160 : 256,
	dropRadius: 20,
	perturbance: PHONE ? 0.02 : 0.024,
	imageUrl: IMAGE_URL,
	/* a phone held upright crops to a tall strip: zoom in a little and aim it so the second lantern sits above the panel */
	view: (w, h) => (h > w * 1.15 ? { zoom: 1.22, x: 0.77, y: 1 } : { zoom: 1, x: 0.64, y: 0.5 }),
	preserve: REDUCED,
	onImage,
});

let stillPaint = null;
let ctl = null;

function onImage(ok) {
	if (!ok) {
		showPoster();
		return;
	}
	canvas.classList.add('is-ready');
	/* the photo arrives after the first frames: a still or a paused pond draws once more */
	if (REDUCED) stillPaint?.();
	else if (!ctl || !ctl.running) ripples.render();
}

function showPoster() {
	if (ripples) ripples.destroy();
	canvas.hidden = true;
	leafEl.style.display = 'none';
	const picture = document.createElement('picture');
	const source = document.createElement('source');
	source.type = 'image/avif';
	source.srcset = `${POSTER_URL}.avif`;
	const img = document.createElement('img');
	img.src = `${POSTER_URL}.webp`;
	img.alt = 'A dark blue pond at dusk with lily pads and two glowing paper lanterns.';
	img.width = 1536;
	img.height = 1024;
	picture.append(source, img);
	poster.prepend(picture);
	poster.hidden = false;
	[dropBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	document.querySelector('.hint')?.setAttribute('hidden', '');
}

/* the lantern spots that are on the canvas right now (a phone's crop may hide one) */
function lanternSpots() {
	const { w, h } = ripples.size;
	return LANTERNS.map((l) => ripples.toElement(l.u, l.v)).filter((p) => p.x > 20 && p.x < w - 20 && p.y > 20 && p.y < h - 20);
}

/* a landing spot on open water: not under the panel, not near an edge */
function pickLanding(rnd) {
	const { w, h } = ripples.size;
	const cr = canvas.getBoundingClientRect();
	const ir = info.getBoundingClientRect();
	for (let i = 0; i < 14; i++) {
		const x = w * (0.12 + rnd() * 0.76);
		const y = h * (0.16 + rnd() * 0.68);
		const sx = cr.left + x;
		const sy = cr.top + y;
		const underPanel = sx > ir.left - 36 && sx < ir.right + 36 && sy > ir.top - 36 && sy < ir.bottom + 36;
		if (!underPanel) return { x, y };
	}
	return { x: w * 0.6, y: h * 0.3 };
}

function placeLeaf(x, y, rot, s, opacity) {
	leafEl.style.transform = `translate3d(${(x - 17).toFixed(1)}px, ${(y - 24).toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
	leafEl.style.opacity = opacity.toFixed(3);
}

function start() {
	if (!ripples) {
		showPoster();
		return;
	}

	/* ---- reduced motion: a few frozen rings, drawn once; the button draws another set ---- */
	if (REDUCED) {
		let variant = 0;
		stillPaint = () => {
			if (!ripples.fit()) return;
			ripples.reset();
			const rnd = seeded(23 + variant * 13);
			const R = ripples.dropRadius;
			const spots = lanternSpots();
			const land = pickLanding(rnd);
			const plan = [
				[spots[variant % spots.length] || land, R * 1.6, 0.085, 74],
				[pickLanding(rnd), R * 1.3, 0.09, 46],
				[spots[(variant + 1) % spots.length] || land, R * 1.4, 0.07, 28],
				[land, R * 1.2, 0.085, 12],
			];
			for (const [p, radius, strength, steps] of plan) {
				ripples.drop(p.x, p.y, radius, strength);
				ripples.simulate(steps);
			}
			ripples.render();
			placeLeaf(land.x, land.y, -28 + variant * 41, 1, 0.96);
		};
		stillPaint();
		pauseBtn.disabled = true;
		dropBtn.addEventListener('click', () => {
			variant = (variant + 1) % 6;
			stillPaint();
		});
		new ResizeObserver(() => stillPaint()).observe(canvas);
		return;
	}

	/* ---- input: pointer events (a mouse leaves a trail as it moves; touch and pen while down) ---- */
	const rnd = Math.random;
	const trail = new Map();
	const down = new Set();
	let paused = false;
	const where = (e) => {
		const r = canvas.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	canvas.addEventListener('pointerdown', (e) => {
		if (paused || !ripples.interactive) return;
		try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable: keep going */ }
		const p = where(e);
		down.add(e.pointerId);
		trail.set(e.pointerId, p);
		ripples.drop(p.x, p.y, ripples.dropRadius * 1.5, 0.12);
	});
	canvas.addEventListener('pointermove', (e) => {
		if (paused || !ripples.interactive) return;
		if (e.pointerType !== 'mouse' && !down.has(e.pointerId)) return;
		const p = where(e);
		const q = trail.get(e.pointerId) || p;
		trail.set(e.pointerId, p);
		/* a quick stroke jumps several pixels per event: drop along the way so the trail has no gaps */
		const dist = Math.hypot(p.x - q.x, p.y - q.y);
		const n = clamp(Math.round(dist / (ripples.dropRadius * 0.7)), 1, 6);
		for (let i = 1; i <= n; i++) {
			const f = i / n;
			ripples.drop(q.x + (p.x - q.x) * f, q.y + (p.y - q.y) * f, ripples.dropRadius, 0.012);
		}
	});
	const lift = (e) => { down.delete(e.pointerId); trail.delete(e.pointerId); };
	canvas.addEventListener('pointerup', lift);
	canvas.addEventListener('pointercancel', lift);
	canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') lift(e); });

	/* ---- the leaf: it falls, lands with a ring, floats a while, and sinks ---- */
	const leaf = { phase: 'wait', t: 0, dur: 0.5, lx: 0, ly: 0, ox: 0, oy: 0, sway: 0, rot: 0, spin: 0, drift: 0, echo: false };
	function startFall() {
		const p = pickLanding(rnd);
		leaf.phase = 'fall';
		leaf.t = 0;
		leaf.dur = 2;
		leaf.lx = p.x;
		leaf.ly = p.y;
		leaf.ox = (rnd() - 0.4) * 150;
		leaf.oy = -(90 + rnd() * 60);
		leaf.sway = 20 + rnd() * 14;
		leaf.rot = rnd() * 360;
		leaf.spin = (rnd() < 0.5 ? -1 : 1) * (110 + rnd() * 80);
		leaf.drift = (rnd() - 0.5) * 36;
		leaf.echo = false;
	}
	function stepLeaf(dt) {
		leaf.t += dt;
		const R = ripples.dropRadius;
		if (leaf.phase === 'wait') {
			if (leaf.t >= leaf.dur) startFall();
		} else if (leaf.phase === 'fall') {
			const u = clamp(leaf.t / leaf.dur, 0, 1);
			const k = 1 - u;
			const near = Math.pow(k, 1.3);
			const swing = Math.sin(u * Math.PI * 3) * k * leaf.sway;
			placeLeaf(
				leaf.lx + leaf.ox * near + swing,
				leaf.ly + leaf.oy * near,
				leaf.rot + leaf.spin * Math.pow(k, 1.1) + Math.sin(u * 9) * 12 * k,
				1 + 0.9 * Math.pow(k, 1.2),
				smooth(0, 0.28, u),
			);
			if (u >= 1) {
				ripples.drop(leaf.lx, leaf.ly, R * 1.3, 0.065);
				leaf.phase = 'float';
				leaf.t = 0;
				leaf.dur = 2.6;
			}
		} else if (leaf.phase === 'float') {
			const w = clamp(leaf.t / leaf.dur, 0, 1);
			if (!leaf.echo && leaf.t > 0.3) {
				leaf.echo = true;
				ripples.drop(leaf.lx, leaf.ly, R, 0.028);
			}
			placeLeaf(
				leaf.lx + leaf.drift * w,
				leaf.ly + 7 * w,
				leaf.rot + w * 9,
				1 - 0.07 * w,
				1 - smooth(0.5, 1, w),
			);
			if (w >= 1) {
				leafEl.style.opacity = '0';
				leaf.phase = 'wait';
				leaf.t = 0;
				leaf.dur = 0.4 + rnd() * 0.9;
			}
		}
	}

	/* the lanterns rock a little and shed a faint ring now and then */
	let lanternT = -0.8;
	let lanternIdx = 0;
	function stepLanterns(dt) {
		lanternT += dt;
		if (lanternT < 2.8) return;
		lanternT = 0;
		const spots = lanternSpots();
		if (!spots.length) return;
		const s = spots[lanternIdx++ % spots.length];
		ripples.drop(s.x, s.y + 22, ripples.dropRadius * 1.1, 0.024);
	}

	/* ---- the frame ---- */
	let first = true;
	let frames = 0;
	let tier = 0;
	const samples = [];
	function frame(dt) {
		if (ripples.lost) return;
		if (first) {
			/* a few rings to start from, already spread */
			first = false;
			const spots = lanternSpots();
			const land = pickLanding(seeded(5));
			[[spots[0] || land, 1.5, 0.06, 34], [spots[1] || land, 1.3, 0.055, 20], [land, 1.2, 0.06, 8]].forEach(([p, r, s, steps]) => {
				ripples.drop(p.x, p.y, ripples.dropRadius * r, s);
				ripples.simulate(steps);
			});
		}
		stepLeaf(dt);
		stepLanterns(dt);
		ripples.step(dt);
		ripples.render();

		/* too slow for the device? draw fewer pixels (never more than twice) */
		frames++;
		if (frames > 45 && tier < 2) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.028) {
					tier++;
					ripples.setScale([1, 0.75, 0.55][tier]);
				}
				samples.length = 0;
				frames = 20;
			}
		}
	}

	ctl = loop(canvas, frame, { name: 'lantern-pond' });

	new ResizeObserver(() => {
		if (ripples.fit()) ripples.render(); // a resized canvas is cleared: draw it again before the next paint
	}).observe(canvas);

	const setPaused = (v) => {
		paused = v;
		pauseBtn.setAttribute('aria-pressed', String(v));
		pauseBtn.textContent = v ? 'Play' : 'Pause';
		if (v) {
			down.clear();
			trail.clear();
			ripples.pause();
			ctl.stop();
		} else {
			ripples.play();
			ctl.start();
		}
	};
	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

	/* the primary button, for the keyboard: a big ring at a lantern (or on open water if neither is in view) */
	let which = 0;
	dropBtn.addEventListener('click', () => {
		if (paused) setPaused(false);
		const spots = lanternSpots();
		const q = spots.length ? spots[which++ % spots.length] : pickLanding(rnd);
		ripples.drop(q.x, q.y + 26, ripples.dropRadius * 1.7, 0.1);
	});
}

boot();
start();
