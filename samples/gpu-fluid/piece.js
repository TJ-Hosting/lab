/*
 * Sample 18 — "Ink Tide GPU Fluid".
 * A Navier-Stokes fluid simulation on the GPU (WebGL, GLSL): every frame the shaders add the splats, curl the
 * currents, solve pressure so the flow stays incompressible, and carry the velocity and the dye along it. The dye
 * is only ever cyan, azure, royal blue and white, drawn on a deep navy ground. When nobody is touching it a slow
 * Lissajous "ghost finger" keeps stirring, so the page is alive on load. One loop() drives the step and the draw,
 * so no WebGL work runs off-screen or in a hidden tab. Under reduced motion: a few seconds of the simulation run
 * at once, one still frame is drawn, nothing moves. A browser without float render targets gets a CSS poster.
 *
 * Adapted from WebGL Fluid Simulation (script.js) by Pavel Dobryakov,
 * https://github.com/PavelDoGreat/WebGL-Fluid-Simulation (commit a2d292931f19d9b3b9f564e23e6c32729d2121c3), MIT.
 * What is taken: the simulation and its GLSL shaders (splat, advection, divergence, curl, vorticity, pressure,
 * gradient subtract, bloom, the shaded display), the framebuffer and half-float format handling, and the pointer
 * splat maths. What changed: it is one module, in a closure, with no globals; dat.gui, the mobile promo popup, the
 * analytics calls, the store and social links, screenshot capture, the sun rays, the dithering image and the
 * checkerboard are all left out; the display shader draws a navy ground and the dye with a soft shoulder and a
 * little noise instead of the dithering image; the dye is a locked blue palette (not random hues); the pointer
 * code uses pointer events, and a ghost finger and a still frame under reduced motion are new; the resolutions are
 * picked by device and lowered if frames run slow; WebGL 2 uses linear filtering on half floats (the core spec
 * allows it); a lost context is rebuilt; a failed setup shows a poster.
 *
 * MIT License
 *
 * Copyright (c) 2017 Pavel Dobryakov
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
const poster = document.querySelector('.poster');
const pauseBtn = document.querySelector('[data-action="pause"]');
const splashBtn = document.querySelector('[data-action="splash"]');
const clearBtn = document.querySelector('[data-action="clear"]');

const REDUCED = prefersReducedMotion();
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* small deterministic PRNG so the still frame is the same on every visit */
function seeded(seed) {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

/* ---------- the palette: royal, azure, cyan, white (the dye never takes any other hue) ---------- */

const PALETTE = [
	[0.03, 0.32, 0.90], // royal      #0a5ce0
	[0.30, 0.62, 0.95], // azure      #4d9ff3
	[0.27, 0.82, 0.98], // cyan light #46d0fb
	[0.92, 0.97, 1.0], //  white      #ebf7ff
];

/* u 0..1 walks the ramp royal, azure, cyan, white */
function ramp(u) {
	const x = clamp(u, 0, 1) * (PALETTE.length - 1);
	const i = Math.min(PALETTE.length - 2, Math.floor(x));
	const f = x - i;
	const a = PALETTE[i];
	const b = PALETTE[i + 1];
	return { r: a[0] + (b[0] - a[0]) * f, g: a[1] + (b[1] - a[1]) * f, b: a[2] + (b[2] - a[2]) * f };
}

/* a random dye colour: mostly azure to cyan, royal and white now and then; a little brighter than the source's 0.15
   splat after the saturation lift in the display */
const DYE_GAIN = 0.16;
function dyeColor(rnd, gain = DYE_GAIN) {
	const u = rnd() < 0.1 ? 0.86 + rnd() * 0.14 : 0.12 + rnd() * 0.58;
	const c = ramp(u);
	return { r: c.r * gain, g: c.g * gain, b: c.b * gain };
}

/* ---------- the fluid engine (adapted from the source's script.js) ---------- */

/* resolutions by device: [sim, dye] short sides, best first; the loop steps down a tier if frames run slow */
const TIERS = {
	desktop: [[128, 1024], [128, 640], [96, 448]],
	phone: [[64, 512], [64, 384], [48, 256]],
};

function createFluid(cnv, preserve) {
	const params = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: preserve, powerPreference: 'high-performance' };
	let gl = cnv.getContext('webgl2', params);
	const isWebGL2 = !!gl;
	if (!isWebGL2) gl = cnv.getContext('webgl', params) || cnv.getContext('experimental-webgl', params);
	if (!gl) return null;

	/* float render targets: WebGL 2 needs EXT_color_buffer_float (or the half-float one), WebGL 1 needs half floats.
	   Extensions must be asked for again after a lost context is restored. */
	let halfFloatTexType;
	let supportLinearFiltering;
	function enableExtensions() {
		if (isWebGL2) {
			if (!gl.getExtension('EXT_color_buffer_float')) gl.getExtension('EXT_color_buffer_half_float');
			supportLinearFiltering = true; // RGBA16F, RG16F and R16F are filterable in core WebGL 2
			halfFloatTexType = gl.HALF_FLOAT;
			return true;
		}
		const halfFloat = gl.getExtension('OES_texture_half_float');
		if (!halfFloat) return false;
		gl.getExtension('EXT_color_buffer_half_float');
		supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
		halfFloatTexType = halfFloat.HALF_FLOAT_OES;
		return true;
	}
	if (!enableExtensions()) return null;
	gl.clearColor(0, 0, 0, 1);

	function supportRenderTextureFormat(internalFormat, format, type) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.deleteFramebuffer(fbo);
		gl.deleteTexture(texture);
		return ok;
	}
	function getSupportedFormat(internalFormat, format, type) {
		if (!supportRenderTextureFormat(internalFormat, format, type)) {
			if (!isWebGL2) return null;
			if (internalFormat === gl.R16F) return getSupportedFormat(gl.RG16F, gl.RG, type);
			if (internalFormat === gl.RG16F) return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
			return null;
		}
		return { internalFormat, format };
	}
	let formatRGBA;
	let formatRG;
	let formatR;
	if (isWebGL2) {
		formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType);
		formatRG = getSupportedFormat(gl.RG16F, gl.RG, halfFloatTexType);
		formatR = getSupportedFormat(gl.R16F, gl.RED, halfFloatTexType);
	} else {
		formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
		formatRG = formatRGBA;
		formatR = formatRGBA;
	}
	if (!formatRGBA || !formatRG || !formatR) return null;

	const config = {
		DENSITY_DISSIPATION: 0.7,
		VELOCITY_DISSIPATION: 0.2,
		PRESSURE: 0.8,
		PRESSURE_ITERATIONS: 20,
		CURL: 30,
		SPLAT_RADIUS: 0.25,
		SPLAT_FORCE: 6000,
		SHADING: supportLinearFiltering,
		BLOOM: supportLinearFiltering,
		BLOOM_ITERATIONS: 6,
		BLOOM_RESOLUTION: 192,
		BLOOM_INTENSITY: 0.45,
		BLOOM_THRESHOLD: 0.55,
		BLOOM_SOFT_KNEE: 0.7,
	};
	const quality = { sim: 128, dye: 1024 };
	let lost = false;

	/* ---- shaders and programs ---- */

	function compileShader(type, source, keywords) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, (keywords || []).map((k) => `#define ${k}\n`).join('') + source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(shader)}`);
		return shader;
	}
	function createProgram(vertexShader, fragmentShader) {
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.bindAttribLocation(program, 0, 'aPosition');
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`program: ${gl.getProgramInfoLog(program)}`);
		const uniforms = {};
		const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < count; i++) {
			const name = gl.getActiveUniform(program, i).name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}
		return { program, uniforms, bind() { gl.useProgram(program); } };
	}

	const fragment = (src, keywords) => compileShader(gl.FRAGMENT_SHADER, src, keywords);
	const baseVertexSource = `
		precision highp float;
		attribute vec2 aPosition;
		varying vec2 vUv;
		varying vec2 vL;
		varying vec2 vR;
		varying vec2 vT;
		varying vec2 vB;
		uniform vec2 texelSize;
		void main () {
			vUv = aPosition * 0.5 + 0.5;
			vL = vUv - vec2(texelSize.x, 0.0);
			vR = vUv + vec2(texelSize.x, 0.0);
			vT = vUv + vec2(0.0, texelSize.y);
			vB = vUv - vec2(0.0, texelSize.y);
			gl_Position = vec4(aPosition, 0.0, 1.0);
		}`;

	const copySource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		uniform sampler2D uTexture;
		void main () {
			gl_FragColor = texture2D(uTexture, vUv);
		}`;

	const clearSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		uniform sampler2D uTexture;
		uniform float value;
		void main () {
			gl_FragColor = value * texture2D(uTexture, vUv);
		}`;

	/* the display: a navy ground, the dye on it with a soft shoulder (cyan to white where it is thick), shaded
	   edges, bloom, and a pinch of noise so the dark gradient does not band */
	const displaySource = `
		precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		varying vec2 vL;
		varying vec2 vR;
		varying vec2 vT;
		varying vec2 vB;
		uniform sampler2D uTexture;
		uniform sampler2D uBloom;
		uniform vec2 texelSize;

		float hash (vec2 p) {
			return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
		}

		void main () {
			vec3 c = texture2D(uTexture, vUv).rgb;

		#ifdef SHADING
			vec3 lc = texture2D(uTexture, vL).rgb;
			vec3 rc = texture2D(uTexture, vR).rgb;
			vec3 tc = texture2D(uTexture, vT).rgb;
			vec3 bc = texture2D(uTexture, vB).rgb;

			float dx = length(rc) - length(lc);
			float dy = length(tc) - length(bc);

			vec3 n = normalize(vec3(dx, dy, length(texelSize)));
			vec3 l = vec3(0.0, 0.0, 1.0);

			float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
			c *= diffuse;
		#endif

		#ifdef BLOOM
			c += texture2D(uBloom, vUv).rgb;
		#endif

			vec3 top = vec3(0.016, 0.035, 0.094);
			vec3 low = vec3(0.039, 0.114, 0.290);
			vec3 ground = mix(low, top, smoothstep(0.0, 1.0, vUv.y));
			ground *= 1.0 - 0.4 * smoothstep(0.35, 0.95, distance(vUv, vec2(0.5)));

			vec3 col = vec3(1.0) - (vec3(1.0) - ground) * exp(-c * 2.4);
			// lift the saturation the tone curve washes out, so thin dye reads as light, not steel
			float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
			col = clamp(mix(vec3(luma), col, 1.35), 0.0, 1.0);
			col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
			gl_FragColor = vec4(col, 1.0);
		}`;

	const bloomPrefilterSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying vec2 vUv;
		uniform sampler2D uTexture;
		uniform vec3 curve;
		uniform float threshold;
		void main () {
			vec3 c = texture2D(uTexture, vUv).rgb;
			float br = max(c.r, max(c.g, c.b));
			float rq = clamp(br - curve.x, 0.0, curve.y);
			rq = curve.z * rq * rq;
			c *= max(rq, br - threshold) / max(br, 0.0001);
			gl_FragColor = vec4(c, 0.0);
		}`;

	const bloomBlurSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying vec2 vL;
		varying vec2 vR;
		varying vec2 vT;
		varying vec2 vB;
		uniform sampler2D uTexture;
		void main () {
			vec4 sum = vec4(0.0);
			sum += texture2D(uTexture, vL);
			sum += texture2D(uTexture, vR);
			sum += texture2D(uTexture, vT);
			sum += texture2D(uTexture, vB);
			sum *= 0.25;
			gl_FragColor = sum;
		}`;

	const bloomFinalSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying vec2 vL;
		varying vec2 vR;
		varying vec2 vT;
		varying vec2 vB;
		uniform sampler2D uTexture;
		uniform float intensity;
		void main () {
			vec4 sum = vec4(0.0);
			sum += texture2D(uTexture, vL);
			sum += texture2D(uTexture, vR);
			sum += texture2D(uTexture, vT);
			sum += texture2D(uTexture, vB);
			sum *= 0.25;
			gl_FragColor = sum * intensity;
		}`;

	const splatSource = `
		precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D uTarget;
		uniform float aspectRatio;
		uniform vec3 color;
		uniform vec2 point;
		uniform float radius;
		void main () {
			vec2 p = vUv - point.xy;
			p.x *= aspectRatio;
			vec3 splat = exp(-dot(p, p) / radius) * color;
			vec3 base = texture2D(uTarget, vUv).xyz;
			gl_FragColor = vec4(base + splat, 1.0);
		}`;

	const advectionSource = `
		precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D uVelocity;
		uniform sampler2D uSource;
		uniform vec2 texelSize;
		uniform vec2 dyeTexelSize;
		uniform float dt;
		uniform float dissipation;

		vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
			vec2 st = uv / tsize - 0.5;
			vec2 iuv = floor(st);
			vec2 fuv = fract(st);
			vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
			vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
			vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
			vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
			return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
		}

		void main () {
		#ifdef MANUAL_FILTERING
			vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
			vec4 result = bilerp(uSource, coord, dyeTexelSize);
		#else
			vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
			vec4 result = texture2D(uSource, coord);
		#endif
			float decay = 1.0 + dissipation * dt;
			gl_FragColor = result / decay;
		}`;

	const divergenceSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		varying highp vec2 vL;
		varying highp vec2 vR;
		varying highp vec2 vT;
		varying highp vec2 vB;
		uniform sampler2D uVelocity;
		void main () {
			float L = texture2D(uVelocity, vL).x;
			float R = texture2D(uVelocity, vR).x;
			float T = texture2D(uVelocity, vT).y;
			float B = texture2D(uVelocity, vB).y;
			vec2 C = texture2D(uVelocity, vUv).xy;
			if (vL.x < 0.0) { L = -C.x; }
			if (vR.x > 1.0) { R = -C.x; }
			if (vT.y > 1.0) { T = -C.y; }
			if (vB.y < 0.0) { B = -C.y; }
			float div = 0.5 * (R - L + T - B);
			gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
		}`;

	const curlSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		varying highp vec2 vL;
		varying highp vec2 vR;
		varying highp vec2 vT;
		varying highp vec2 vB;
		uniform sampler2D uVelocity;
		void main () {
			float L = texture2D(uVelocity, vL).y;
			float R = texture2D(uVelocity, vR).y;
			float T = texture2D(uVelocity, vT).x;
			float B = texture2D(uVelocity, vB).x;
			float vorticity = R - L - T + B;
			gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
		}`;

	const vorticitySource = `
		precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		varying vec2 vL;
		varying vec2 vR;
		varying vec2 vT;
		varying vec2 vB;
		uniform sampler2D uVelocity;
		uniform sampler2D uCurl;
		uniform float curl;
		uniform float dt;
		void main () {
			float L = texture2D(uCurl, vL).x;
			float R = texture2D(uCurl, vR).x;
			float T = texture2D(uCurl, vT).x;
			float B = texture2D(uCurl, vB).x;
			float C = texture2D(uCurl, vUv).x;
			vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
			force /= length(force) + 0.0001;
			force *= curl * C;
			force.y *= -1.0;
			vec2 velocity = texture2D(uVelocity, vUv).xy;
			velocity += force * dt;
			velocity = min(max(velocity, -1000.0), 1000.0);
			gl_FragColor = vec4(velocity, 0.0, 1.0);
		}`;

	const pressureSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		varying highp vec2 vL;
		varying highp vec2 vR;
		varying highp vec2 vT;
		varying highp vec2 vB;
		uniform sampler2D uPressure;
		uniform sampler2D uDivergence;
		void main () {
			float L = texture2D(uPressure, vL).x;
			float R = texture2D(uPressure, vR).x;
			float T = texture2D(uPressure, vT).x;
			float B = texture2D(uPressure, vB).x;
			float C = texture2D(uPressure, vUv).x;
			float divergence = texture2D(uDivergence, vUv).x;
			float pressure = (L + R + B + T - divergence) * 0.25;
			gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
		}`;

	const gradientSubtractSource = `
		precision mediump float;
		precision mediump sampler2D;
		varying highp vec2 vUv;
		varying highp vec2 vL;
		varying highp vec2 vR;
		varying highp vec2 vT;
		varying highp vec2 vB;
		uniform sampler2D uPressure;
		uniform sampler2D uVelocity;
		void main () {
			float L = texture2D(uPressure, vL).x;
			float R = texture2D(uPressure, vR).x;
			float T = texture2D(uPressure, vT).x;
			float B = texture2D(uPressure, vB).x;
			vec2 velocity = texture2D(uVelocity, vUv).xy;
			velocity.xy -= vec2(R - L, T - B);
			gl_FragColor = vec4(velocity, 0.0, 1.0);
		}`;

	let P = null; // the programs
	let blit = null;
	let dye = null;
	let velocity = null;
	let divergence = null;
	let curl = null;
	let pressure = null;
	let bloom = null;
	let bloomFramebuffers = [];
	const displayPrograms = {};

	function build() {
		enableExtensions();
		gl.clearColor(0, 0, 0, 1);
		const baseVertex = compileShader(gl.VERTEX_SHADER, baseVertexSource);
		const make = (src, keywords) => createProgram(baseVertex, fragment(src, keywords));
		P = {
			copy: make(copySource),
			clear: make(clearSource),
			bloomPrefilter: make(bloomPrefilterSource),
			bloomBlur: make(bloomBlurSource),
			bloomFinal: make(bloomFinalSource),
			splat: make(splatSource),
			advection: make(advectionSource, supportLinearFiltering ? null : ['MANUAL_FILTERING']),
			divergence: make(divergenceSource),
			curl: make(curlSource),
			vorticity: make(vorticitySource),
			pressure: make(pressureSource),
			gradientSubtract: make(gradientSubtractSource),
		};
		for (const k of Object.keys(displayPrograms)) delete displayPrograms[k];
		displayPrograms.baseVertex = baseVertex;

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
		blit = (target) => {
			if (target == null) {
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			} else {
				gl.viewport(0, 0, target.width, target.height);
				gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
			}
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		};
		/* a fresh start (or a rebuilt context): nothing from an earlier context is kept or deleted */
		dye = null;
		velocity = null;
		divergence = null;
		curl = null;
		pressure = null;
		bloom = null;
		bloomFramebuffers = [];
	}

	function displayProgram(withBloom) {
		const keywords = [];
		if (config.SHADING) keywords.push('SHADING');
		if (withBloom) keywords.push('BLOOM');
		const key = keywords.join(',') || 'plain';
		if (!displayPrograms[key]) displayPrograms[key] = createProgram(displayPrograms.baseVertex, fragment(displaySource, keywords));
		return displayPrograms[key];
	}

	/* ---- framebuffers ---- */

	function createFBO(w, h, internalFormat, format, type, param) {
		gl.activeTexture(gl.TEXTURE0);
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.viewport(0, 0, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT);
		return {
			texture,
			fbo,
			width: w,
			height: h,
			texelSizeX: 1 / w,
			texelSizeY: 1 / h,
			attach(id) {
				gl.activeTexture(gl.TEXTURE0 + id);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				return id;
			},
		};
	}

	function createDoubleFBO(w, h, internalFormat, format, type, param) {
		let fbo1 = createFBO(w, h, internalFormat, format, type, param);
		let fbo2 = createFBO(w, h, internalFormat, format, type, param);
		return {
			width: w,
			height: h,
			texelSizeX: fbo1.texelSizeX,
			texelSizeY: fbo1.texelSizeY,
			get read() { return fbo1; },
			set read(v) { fbo1 = v; },
			get write() { return fbo2; },
			set write(v) { fbo2 = v; },
			swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
		};
	}

	function deleteFBO(f) {
		gl.deleteFramebuffer(f.fbo);
		gl.deleteTexture(f.texture);
	}

	function resizeFBO(target, w, h, internalFormat, format, type, param) {
		const next = createFBO(w, h, internalFormat, format, type, param);
		P.copy.bind();
		gl.uniform1i(P.copy.uniforms.uTexture, target.attach(0));
		blit(next);
		deleteFBO(target);
		return next;
	}

	function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
		if (target.width === w && target.height === h) return target;
		target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
		deleteFBO(target.write);
		target.write = createFBO(w, h, internalFormat, format, type, param);
		target.width = w;
		target.height = h;
		target.texelSizeX = 1 / w;
		target.texelSizeY = 1 / h;
		return target;
	}

	function getResolution(resolution) {
		let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
		if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
		const min = Math.round(resolution);
		const max = Math.round(resolution * aspectRatio);
		return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
	}

	function initFramebuffers() {
		/* the dye never needs more texels than the canvas has pixels */
		const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);
		const dyeShort = Math.min(quality.dye, Math.max(256, shortSide), supportLinearFiltering ? 4096 : 512);
		const simRes = getResolution(quality.sim);
		const dyeRes = getResolution(dyeShort);
		const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		gl.disable(gl.BLEND);

		dye = dye == null
			? createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, halfFloatTexType, filtering)
			: resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, halfFloatTexType, filtering);
		velocity = velocity == null
			? createDoubleFBO(simRes.width, simRes.height, formatRG.internalFormat, formatRG.format, halfFloatTexType, filtering)
			: resizeDoubleFBO(velocity, simRes.width, simRes.height, formatRG.internalFormat, formatRG.format, halfFloatTexType, filtering);

		if (divergence) deleteFBO(divergence);
		if (curl) deleteFBO(curl);
		divergence = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);
		curl = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);
		if (pressure) { deleteFBO(pressure.read); deleteFBO(pressure.write); }
		pressure = createDoubleFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, halfFloatTexType, gl.NEAREST);

		initBloomFramebuffers(filtering);
	}

	function initBloomFramebuffers(filtering) {
		bloomFramebuffers.forEach(deleteFBO);
		bloomFramebuffers.length = 0;
		if (bloom) deleteFBO(bloom);
		bloom = null;
		if (!config.BLOOM) return;
		const res = getResolution(config.BLOOM_RESOLUTION);
		bloom = createFBO(res.width, res.height, formatRGBA.internalFormat, formatRGBA.format, halfFloatTexType, filtering);
		for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
			const width = res.width >> (i + 1);
			const height = res.height >> (i + 1);
			if (width < 2 || height < 2) break;
			bloomFramebuffers.push(createFBO(width, height, formatRGBA.internalFormat, formatRGBA.format, halfFloatTexType, filtering));
		}
	}

	/* ---- the simulation step and the draw ---- */

	function step(dt) {
		gl.disable(gl.BLEND);

		P.curl.bind();
		gl.uniform2f(P.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(P.curl.uniforms.uVelocity, velocity.read.attach(0));
		blit(curl);

		P.vorticity.bind();
		gl.uniform2f(P.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(P.vorticity.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(P.vorticity.uniforms.uCurl, curl.attach(1));
		gl.uniform1f(P.vorticity.uniforms.curl, config.CURL);
		gl.uniform1f(P.vorticity.uniforms.dt, dt);
		blit(velocity.write);
		velocity.swap();

		P.divergence.bind();
		gl.uniform2f(P.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(P.divergence.uniforms.uVelocity, velocity.read.attach(0));
		blit(divergence);

		P.clear.bind();
		gl.uniform1i(P.clear.uniforms.uTexture, pressure.read.attach(0));
		gl.uniform1f(P.clear.uniforms.value, config.PRESSURE);
		blit(pressure.write);
		pressure.swap();

		P.pressure.bind();
		gl.uniform2f(P.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(P.pressure.uniforms.uDivergence, divergence.attach(0));
		for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
			gl.uniform1i(P.pressure.uniforms.uPressure, pressure.read.attach(1));
			blit(pressure.write);
			pressure.swap();
		}

		P.gradientSubtract.bind();
		gl.uniform2f(P.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(P.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(P.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
		blit(velocity.write);
		velocity.swap();

		P.advection.bind();
		gl.uniform2f(P.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		if (!supportLinearFiltering) gl.uniform2f(P.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
		const velocityId = velocity.read.attach(0);
		gl.uniform1i(P.advection.uniforms.uVelocity, velocityId);
		gl.uniform1i(P.advection.uniforms.uSource, velocityId);
		gl.uniform1f(P.advection.uniforms.dt, dt);
		gl.uniform1f(P.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
		blit(velocity.write);
		velocity.swap();

		if (!supportLinearFiltering) gl.uniform2f(P.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
		gl.uniform1i(P.advection.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(P.advection.uniforms.uSource, dye.read.attach(1));
		gl.uniform1f(P.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
		blit(dye.write);
		dye.swap();
	}

	function applyBloom(source, destination) {
		if (bloomFramebuffers.length < 2) return false;
		let last = destination;

		gl.disable(gl.BLEND);
		P.bloomPrefilter.bind();
		const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
		gl.uniform3f(P.bloomPrefilter.uniforms.curve, config.BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);
		gl.uniform1f(P.bloomPrefilter.uniforms.threshold, config.BLOOM_THRESHOLD);
		gl.uniform1i(P.bloomPrefilter.uniforms.uTexture, source.attach(0));
		blit(last);

		P.bloomBlur.bind();
		for (let i = 0; i < bloomFramebuffers.length; i++) {
			const dest = bloomFramebuffers[i];
			gl.uniform2f(P.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
			gl.uniform1i(P.bloomBlur.uniforms.uTexture, last.attach(0));
			blit(dest);
			last = dest;
		}

		gl.blendFunc(gl.ONE, gl.ONE);
		gl.enable(gl.BLEND);
		for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
			const baseTex = bloomFramebuffers[i];
			gl.uniform2f(P.bloomBlur.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
			gl.uniform1i(P.bloomBlur.uniforms.uTexture, last.attach(0));
			blit(baseTex);
			last = baseTex;
		}

		gl.disable(gl.BLEND);
		P.bloomFinal.bind();
		gl.uniform2f(P.bloomFinal.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
		gl.uniform1i(P.bloomFinal.uniforms.uTexture, last.attach(0));
		gl.uniform1f(P.bloomFinal.uniforms.intensity, config.BLOOM_INTENSITY);
		blit(destination);
		return true;
	}

	function render() {
		const useBloom = config.BLOOM && bloom && applyBloom(dye.read, bloom);
		gl.disable(gl.BLEND);
		const dp = displayProgram(!!useBloom);
		dp.bind();
		if (config.SHADING) gl.uniform2f(dp.uniforms.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
		gl.uniform1i(dp.uniforms.uTexture, dye.read.attach(0));
		if (useBloom) gl.uniform1i(dp.uniforms.uBloom, bloom.attach(1));
		blit(null);
	}

	/* ---- splats ---- */

	function correctRadius(radius) {
		const aspectRatio = cnv.width / cnv.height;
		return aspectRatio > 1 ? radius * aspectRatio : radius;
	}

	/* x, y in 0..1 (y up); dx, dy the push; color {r, g, b} the dye */
	function splat(x, y, dx, dy, color) {
		P.splat.bind();
		gl.uniform1i(P.splat.uniforms.uTarget, velocity.read.attach(0));
		gl.uniform1f(P.splat.uniforms.aspectRatio, cnv.width / cnv.height);
		gl.uniform2f(P.splat.uniforms.point, x, y);
		gl.uniform3f(P.splat.uniforms.color, dx, dy, 0);
		gl.uniform1f(P.splat.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
		blit(velocity.write);
		velocity.swap();

		gl.uniform1i(P.splat.uniforms.uTarget, dye.read.attach(0));
		gl.uniform3f(P.splat.uniforms.color, color.r, color.g, color.b);
		blit(dye.write);
		dye.swap();
	}

	function clearAll() {
		gl.clearColor(0, 0, 0, 1);
		for (const f of [dye.read, dye.write, velocity.read, velocity.write, pressure.read, pressure.write]) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
			gl.viewport(0, 0, f.width, f.height);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	}

	/* the canvas follows its CSS size (at most 1.5 device pixels per CSS pixel); true when the buffer changed */
	function resize() {
		const dpr = Math.min(1.5, window.devicePixelRatio || 1);
		const w = Math.max(2, Math.floor(cnv.clientWidth * dpr));
		const h = Math.max(2, Math.floor(cnv.clientHeight * dpr));
		if (cnv.width === w && cnv.height === h) return false;
		cnv.width = w;
		cnv.height = h;
		if (!lost) initFramebuffers();
		return true;
	}

	function setQuality(sim, dyeRes) {
		quality.sim = sim;
		quality.dye = dyeRes;
		if (!lost) initFramebuffers();
	}

	build();
	cnv.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		lost = true;
	});
	cnv.addEventListener('webglcontextrestored', () => {
		try {
			build();
			initFramebuffers();
			lost = false;
		} catch (err) {
			console.warn(err);
		}
	});

	return {
		step: (dt) => { if (!lost) step(dt); },
		render: () => { if (!lost) render(); },
		splat: (...a) => { if (!lost) splat(...a); },
		clear: () => { if (!lost) clearAll(); },
		resize,
		setQuality,
		get lost() { return lost; },
	};
}

/* ---------- the piece: input, the ghost finger, the loop ---------- */

const PHONE = matchMedia('(pointer: coarse)').matches || innerWidth < 720;
const tiers = PHONE ? TIERS.phone : TIERS.desktop;
let tier = 0;

const GHOST_GAIN = 3.5; // the ghost's push, against the source's raw pointer delta
const GHOST_DYE = 0.1; // the dye it leaves each frame (a user's splat is DYE_GAIN)
const GHOST_IDLE = 1.6; // seconds without input before the ghost steps in
const FRAME = 1 / 60;

let fluid = null;
try {
	fluid = createFluid(canvas, REDUCED);
} catch (err) {
	console.warn(err);
	fluid = null;
}

/* the ghost finger: a slow Lissajous in 0..1 space; position at time t */
function ghostAt(t, phase) {
	return {
		x: 0.5 + 0.3 * Math.sin(t * 0.67 + phase) + 0.07 * Math.sin(t * 1.9 + 0.8),
		y: 0.5 + 0.26 * Math.sin(t * 0.95 + 1.3 + phase * 0.7) + 0.06 * Math.cos(t * 1.5),
	};
}

function correctDelta(dx, dy) {
	const aspect = canvas.width / canvas.height;
	return { dx: aspect < 1 ? dx * aspect : dx, dy: aspect > 1 ? dy / aspect : dy };
}

/* one ghost splat at time t, as strong as `strength` (0..1) */
function ghostSplat(t, strength, phase = 0) {
	const a = ghostAt(t, phase);
	const b = ghostAt(t - FRAME, phase);
	const d = correctDelta(a.x - b.x, a.y - b.y);
	const u = 0.1 + 0.42 * (0.5 + 0.5 * Math.sin(t * 0.21 + phase * 2)) + 0.1 * Math.sin(t * 1.7);
	const c = ramp(u);
	const g = GHOST_DYE * strength * (0.7 + 0.3 * Math.sin(t * 0.8));
	fluid.splat(a.x, a.y, d.dx * 6000 * GHOST_GAIN * strength, d.dy * 6000 * GHOST_GAIN * strength, { r: c.r * g, g: c.g * g, b: c.b * g });
}

/* a handful of big splats to start from */
function burst(count, rnd) {
	for (let i = 0; i < count; i++) {
		const c = dyeColor(rnd, DYE_GAIN * 3.2);
		fluid.splat(0.12 + rnd() * 0.76, 0.12 + rnd() * 0.76, 900 * (rnd() - 0.5), 900 * (rnd() - 0.5), c);
	}
}

/* ---- the still: used under reduced motion; the same strokes as the ghost, run at once, drawn once ---- */
let stillVariant = 0;
function paintStill() {
	fluid.resize();
	fluid.clear();
	const rnd = seeded(11 + stillVariant * 7);
	burst(5, rnd);
	let t = 3 + stillVariant * 19;
	for (let i = 0; i < 300; i++) {
		ghostSplat(t, 1, stillVariant * 0.9);
		fluid.step(FRAME);
		t += FRAME;
	}
	fluid.render();
}

function showPoster() {
	canvas.hidden = true;
	poster.hidden = false;
	[splashBtn, clearBtn, pauseBtn].forEach((b) => { b.disabled = true; });
}

function start() {
	if (!fluid) {
		showPoster();
		return;
	}
	fluid.setQuality(...tiers[0]);
	fluid.resize();

	if (REDUCED) {
		paintStill();
		pauseBtn.disabled = true;
		clearBtn.disabled = true;
		/* Splash jumps straight to the end state: a new still */
		splashBtn.addEventListener('click', () => {
			stillVariant = (stillVariant + 1) % 6;
			paintStill();
		});
		let timer = 0;
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(paintStill, 150);
		});
		return;
	}

	/* ---- input: pointer events (mouse hovers and stirs; touch and pen stir while down) ---- */
	const inputs = new Map();
	const taps = [];
	const rnd = Math.random;
	let lastInput = -1e9;
	let colorTimer = 0;
	let paused = false;
	const nowS = () => performance.now() / 1000;

	const where = (e) => {
		const r = canvas.getBoundingClientRect();
		return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
	};
	canvas.addEventListener('pointerdown', (e) => {
		if (paused) return;
		try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable: keep going */ }
		const p = where(e);
		inputs.set(e.pointerId, { x: p.x, y: p.y, dx: 0, dy: 0, moved: false, color: dyeColor(rnd) });
		taps.push({ x: p.x, y: p.y, color: dyeColor(rnd, DYE_GAIN * 3) });
		lastInput = nowS();
	});
	canvas.addEventListener('pointermove', (e) => {
		if (paused) return;
		let s = inputs.get(e.pointerId);
		if (!s) {
			if (e.pointerType !== 'mouse') return;
			const p0 = where(e);
			s = { x: p0.x, y: p0.y, dx: 0, dy: 0, moved: false, color: dyeColor(rnd) };
			inputs.set(e.pointerId, s);
		}
		const p = where(e);
		const d = correctDelta(p.x - s.x, p.y - s.y);
		s.x = p.x;
		s.y = p.y;
		s.dx += d.dx;
		s.dy += d.dy;
		s.moved = true;
		lastInput = nowS();
	});
	const lift = (e) => { inputs.delete(e.pointerId); };
	canvas.addEventListener('pointerup', lift);
	canvas.addEventListener('pointercancel', lift);
	canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') lift(e); });

	/* ---- the frame ---- */
	let ghostStrength = 0;
	let frames = 0;
	const samples = [];
	let first = true;
	let wantSplash = 0;
	let wantClear = false;

	function frame(dt, t) {
		if (fluid.lost) return;
		fluid.resize();
		if (wantClear) {
			wantClear = false;
			fluid.clear();
		}
		if (first) {
			first = false;
			burst(6, seeded(5));
		}
		if (wantSplash) {
			burst(wantSplash, rnd);
			wantSplash = 0;
		}

		colorTimer += dt * 10;
		if (colorTimer >= 1) {
			colorTimer %= 1;
			inputs.forEach((s) => { s.color = dyeColor(rnd); });
		}

		for (const tap of taps.splice(0)) fluid.splat(tap.x, tap.y, 700 * (rnd() - 0.5), 700 * (rnd() - 0.5), tap.color);
		inputs.forEach((s) => {
			if (!s.moved) return;
			fluid.splat(s.x, s.y, s.dx * 6000, s.dy * 6000, s.color);
			s.dx = 0;
			s.dy = 0;
			s.moved = false;
		});

		/* the ghost finger steps in after a pause in the input and eases out when you come back */
		const idle = nowS() - lastInput > GHOST_IDLE && inputs.size === 0;
		ghostStrength += ((idle ? 1 : 0) - ghostStrength) * Math.min(1, dt * 1.4);
		if (ghostStrength > 0.03) ghostSplat(t, ghostStrength);

		fluid.step(Math.min(dt, FRAME));
		fluid.render();

		/* too slow for the device? step the resolution down a tier (never more than twice) */
		frames++;
		if (frames > 45 && tier < tiers.length - 1) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.026) {
					tier++;
					fluid.setQuality(...tiers[tier]);
				}
				samples.length = 0;
				frames = 20;
			}
		}
	}

	const ctl = loop(canvas, frame, { name: 'gpu-fluid' });

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			/* while paused the loop does not resize, so redraw once for the new size */
			if (paused && !document.hidden && !fluid.lost) {
				fluid.resize();
				fluid.render();
			}
		}, 150);
	});

	const setPaused = (v) => {
		paused = v;
		pauseBtn.setAttribute('aria-pressed', String(v));
		pauseBtn.textContent = v ? 'Play' : 'Pause';
		if (v) { inputs.clear(); ctl.stop(); } else { lastInput = nowS(); ctl.start(); }
	};
	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

	/* Splash and Clear act at the top of the loop's next frame; while paused, Splash plays on first */
	splashBtn.addEventListener('click', () => {
		if (paused) setPaused(false);
		wantSplash = 5 + Math.floor(Math.random() * 6);
	});
	clearBtn.addEventListener('click', () => {
		if (paused) {
			fluid.clear();
			fluid.render();
		} else wantClear = true;
	});
}

boot();
start();
