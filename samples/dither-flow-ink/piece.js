/*
 * Sample 13 — "Dither Flow Ink".
 * The words "TJ-Hosting Lab" made of navy and blue pixel dots on the pale sky. A WebGL2 shader keeps two small
 * fields at about 1/5 of the canvas size: ink smoke, which curl noise carries along and which fades quickly, and
 * "wear", which marks where the letters have been rubbed away and which fades slowly. A second shader looks at the
 * fields once per chunky cell and compares them with an 8 x 8 Bayer matrix, so every pixel is ink or nothing and
 * a letter that is half worn away shows as an ordered screen of dots. A slow ghost pointer swipes across the word
 * now and then, so it is alive on load; a real pointer smears it too, and the ghost steps back in when you leave.
 * One loop() drives the step and the draw, so no WebGL work runs off-screen or in a hidden tab. Under reduced
 * motion one smeared frame is run at once and drawn once. A browser without WebGL 2 gets a still picture drawn
 * with Canvas 2D from the same rules.
 *
 * Adapted from dither-flow by Caleb Lemos (caleblemos), https://github.com/caleblemos/dither-flow
 * (commit b154ad8ea96aca31e08d54f0e8b24c7ed948895a), MIT.
 * What is taken: the two-pass design (a low-resolution ping-pong field advected along two octaves of curl noise,
 * and a full-resolution pass that quantises it through a procedural 8 x 8 Bayer matrix per dither cell), the
 * value-noise and curl code, the gaussian splats with their pointer-speed shaping, and the R16F / R8 fallback.
 * What changed: it is a single module in a closure; the field has a second channel (wear) that is advected and
 * fades slowly, so the word is rubbed away and comes back as a dither; the word is drawn by this page into a mask
 * canvas in Nunito Sans 900 and shows as ink (navy for "TJ-Hosting", royal blue for "Lab"), not as a hole punched
 * into paper; the image reveal, the paper colour and the tilt gravity are left out; the pointer uses pointer events;
 * the autonomous walker is replaced by scripted ghost strokes; the sim runs at a fixed 60 steps a second; a lost
 * context is rebuilt; a failed setup draws a still with Canvas 2D.
 *
 * MIT License
 *
 * Copyright (c) 2026 Caleb Lemos
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
const note = document.querySelector('.poster__note');
const smearBtn = document.querySelector('[data-action="smear"]');
const restoreBtn = document.querySelector('[data-action="restore"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const REDUCED = prefersReducedMotion();

/* ---------- the look and the feel ---------- */
const FONT = '"Nunito Sans", system-ui, sans-serif';
const WORD_A = 'TJ-Hosting'; // navy
const WORD_B = 'Lab'; // royal blue, as in the brand lock-up
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const INK_A = hexRGB('#0a2a72'); // the letters of "TJ-Hosting"
const INK_B = hexRGB('#0c6bed'); // the letters of "Lab"
const SMOKE = hexRGB('#3b8ff2'); // dense ink in the air
const WISP = hexRGB('#46d0fb'); // its thin edge, DS v9's cyan light
const AMB = hexRGB('#b4d6f8'); // the faint ambient currents across the window, a pale azure

const STEP = 1 / 60; // the sim runs at 60 steps a second, whatever the display does
const MAX_SPLATS = 12;
const SPLAT_S = 0.85; // pointer ink amount
const ERODE = 1.0; // how much wear a splat leaves, against its ink
const WEAR_MAX = 1.1;
const WEAR_KEEP = 0.9985; // wear fades slowly: a little off the top ...
const WEAR_LIN = 0.0022; // ... and a steady amount, so a rubbed-out word is back in about six seconds
const SMOKE_KEEP = 0.978; // ink in the air fades in about two seconds
const SMOKE_LIN = 0.0012;
const SMOKE_GAIN = 0.2; // how much ink a splat puts in the air
const FLOW = 1.7; // how fast the air carries the ink (the original's 1.0 looked slow beside a word this big)
const WEAR_FLOW = 0.6; // ... and how much of that the rubbed-away marks follow
const GHOST_POWER = 0.72; // the ghost's ink, against a real pointer's
const GHOST_RADIUS = 0.85;
const IDLE_MS = 2600; // the ghost steps back in after this long without a real pointer

/* a small deterministic random, so the strokes and the still are the same on every visit */
function seeded(seed) {
	let s = seed % 2147483647 || 1;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

/* ---------- the word: drawn once into a mask canvas, red = "TJ-Hosting", green = "Lab" ---------- */
const maskCanvas = document.createElement('canvas');
let layout = { cx: 0.5, cy: 0.58, hw: 0.4, hh: 0.07, r: 0.075 }; // the word's box in uv (y up) for the ghost's strokes, and the ink radius (in heights)

function buildMask(W, H) {
	maskCanvas.width = Math.max(8, Math.round(W));
	maskCanvas.height = Math.max(8, Math.round(H));
	const g = maskCanvas.getContext('2d');
	g.fillStyle = '#000';
	g.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
	g.textBaseline = 'alphabetic';
	g.textAlign = 'left';
	const base = 100;
	g.font = `900 ${base}px ${FONT}`;
	const wa = g.measureText(WORD_A).width / base;
	const wb = g.measureText(WORD_B).width / base;
	const ws = g.measureText(' ').width / base;
	const cap = g.measureText('H').actualBoundingBoxAscent / base || 0.72;
	/* one line on a wide window, two lines on a narrow one; the word sits above the info panel */
	const narrow = W < 620 || W / H < 0.85;
	let fs;
	let ax;
	let ay;
	let bx;
	let by;
	let boxW;
	let boxH;
	let mid;
	if (!narrow) {
		fs = Math.min((W * 0.8) / (wa + ws + wb), H * 0.26);
		boxW = (wa + ws + wb) * fs;
		boxH = cap * fs;
		mid = H * 0.42;
		ax = (W - boxW) / 2;
		bx = ax + (wa + ws) * fs;
		ay = mid + boxH / 2;
		by = ay;
	} else {
		fs = Math.min((W * 0.86) / wa, H * 0.2);
		const gap = 0.3 * fs;
		boxW = wa * fs;
		boxH = 2 * cap * fs + gap;
		mid = H * 0.28;
		ay = mid - boxH / 2 + cap * fs;
		by = ay + gap + cap * fs;
		ax = (W - wa * fs) / 2;
		bx = (W - wb * fs) / 2;
	}
	g.font = `900 ${fs}px ${FONT}`;
	g.fillStyle = '#f00';
	g.fillText(WORD_A, ax, ay);
	g.fillStyle = '#0f0';
	g.fillText(WORD_B, bx, by);
	/* the pointer's ink is as wide as the letters are tall (a little over half a cap height): 0.075 of the height on a desktop, less on a phone */
	layout = { cx: 0.5, cy: 1 - mid / H, hw: boxW / 2 / W, hh: boxH / 2 / H, r: Math.min(0.075, Math.max(0.58 * cap * fs, 28) / H) };
}

/* the dither cell, in CSS pixels: chunkier on a wide window, finer on a phone so the letters keep their shape */
const cellCss = (W) => Math.max(2, Math.round(W / 400));

/* ---------- ghost strokes: a swipe across part of the word, then a rest ---------- */
const KINDS = [0, 2, 1, 3, 2, 0, 3, 1];
function strokeDef(i) {
	const r = seeded(4001 + i * 7919);
	r();
	return {
		kind: KINDS[i % KINDS.length],
		dur: i === 0 ? 2.4 : 1.4 + r() * 0.5, // seconds the stroke lasts (the first is slow, so a smear is in progress as the page opens)
		rest: 2.4 + r() * 1.6, // seconds before the next
		span: 0.7 + r() * 0.5, // how much of the word's width it covers (in half-widths)
		off: -0.95 + r() * 0.5, // where it starts, in half-widths from the centre
		a: r() * 6,
		flip: i % 3 === 1,
	};
}
function strokePos(def, u) {
	const { cx, cy, hw, hh } = layout;
	const e = u * u * (3 - 2 * u);
	const f = def.flip ? -1 : 1;
	if (def.kind === 0) { // a wavy sweep
		return [cx + f * hw * (def.off + def.span * e), cy + hh * 0.7 * Math.sin(u * 8 + def.a)];
	}
	if (def.kind === 1) { // a slash from the top to the bottom
		return [cx + f * hw * (def.off + 0.4 + def.span * 0.8 * e), cy + hh * 1.5 * (0.9 - 1.8 * e)];
	}
	if (def.kind === 2) { // a loop around the middle of the span
		const a = def.a + u * Math.PI * 2 * 1.3;
		return [cx + f * hw * (def.off + def.span * 0.5 + 0.3 * Math.cos(a)), cy + hh * 1.5 * Math.sin(a)];
	}
	/* a zigzag */
	const z = Math.abs(((u * 3 + 0.5) % 2) - 1) * 2 - 1;
	return [cx + f * hw * (def.off + def.span * e), cy + hh * 1.3 * z];
}

/* ---------- the shaders ---------- */
const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;

/* the sim: R = ink smoke, G = wear. Both are carried along the curl-noise flow. */
const SIM_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPrev;
uniform sampler2D uMask;
uniform float uAspect, uTime, uSmokeKeep, uSmokeLin, uWearKeep, uWearLin, uHeal, uErode, uWearMax, uDt, uGain, uFlow, uWearFlow;
uniform int uSplatCount;
uniform vec4 uSplats[${MAX_SPLATS}];
in vec2 vUv; out vec4 outC;

float hash(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p,p+34.23); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
vec2 curl(vec2 p){
  float e = 0.06;
  float n1 = noise(p+vec2(0.,e)), n2 = noise(p-vec2(0.,e));
  float n3 = noise(p+vec2(e,0.)), n4 = noise(p-vec2(e,0.));
  return vec2(n1-n2, n4-n3) / (2.*e);
}
void main(){
  vec2 p = vUv * vec2(uAspect, 1.);
  vec2 vel = curl(p*4.2 + vec2(0., uTime*0.07))
           + 0.45*curl(p*4.2*2.7 + vec2(uTime*0.11, 0.));
  vel.y += 0.06;
  vec2 step_ = vel * uDt * 0.06 * vec2(1./uAspect, 1.);
  float d = max(texture(uPrev, clamp(vUv - step_ * uFlow, 0., 1.)).r * uSmokeKeep - uSmokeLin, 0.);
  float w = max(texture(uPrev, clamp(vUv - step_ * uFlow * uWearFlow, 0., 1.)).g * uWearKeep - uWearLin - uHeal * 0.025, 0.);
  if (d < 0.012) d = 0.;
  if (w < 0.012) w = 0.;
  vec4 mk = texture(uMask, vec2(vUv.x, 1.-vUv.y));
  float m = clamp(mk.r + mk.g, 0., 1.);
  for(int i=0;i<${MAX_SPLATS};i++){
    if(i>=uSplatCount) break;
    vec4 s = uSplats[i];
    vec2 dd = (vUv - s.xy) * vec2(uAspect, 1.);
    float g = exp(-dot(dd,dd)/(s.z*s.z));
    d += s.w * g * uGain * (1. + 1.6*m);   // letters give off more ink than bare sky
    w += s.w * g * uErode;
  }
  outC = vec4(clamp(d, 0., 1.6), clamp(w, 0., uWearMax), 0., 1.);
}`;

/* the render: one look at the fields per chunky cell, compared with an 8 x 8 Bayer matrix. Ink or nothing. */
const RENDER_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uSim;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform float uCell, uLod, uTime;
uniform vec3 uInkA, uInkB, uSmoke, uWisp, uAmb;
in vec2 vUv; out vec4 outC;

float h21(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p,p+34.23); return fract(p.x*p.y); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y);
}

float bayer8(ivec2 p){
  int x = p.x & 7, y = p.y & 7, v = 0;
  for(int i=0;i<3;i++){
    int xi = (x >> (2-i)) & 1, yi = (y >> (2-i)) & 1;
    v = (v << 2) | ((yi << 1) | (xi ^ yi));
  }
  return (float(v)+0.5)/64.;
}
void main(){
  vec2 cellIdx = floor(gl_FragCoord.xy / uCell);
  vec2 cuv = (cellIdx*uCell + uCell*0.5) / uRes;
  vec2 f = texture(uSim, cuv).rg;                       // R smoke, G wear
  float t = bayer8(ivec2(cellIdx));
  vec4 mk = textureLod(uMask, vec2(cuv.x, 1.-cuv.y), uLod);
  float cov = clamp((max(mk.r, mk.g) - 0.5) * 3. + 0.5, 0., 1.);
  float letter = cov * (1. - clamp(f.g, 0., 1.));       // a worn letter thins out as a dither
  // ambient currents: faint warped streaks of sparse dither drifting across the whole window, so it lives at rest
  vec2 q = cuv * vec2(uRes.x / uRes.y, 1.);
  float warp = vn(q * 2.2 + vec2(uTime * 0.05, 0.)) * 2.4;
  float band = 0.5 + 0.5 * sin((q.y * 5. + warp - uTime * 0.12) * 3.14159);
  float amb = smoothstep(0.84, 1., band) * (0.05 + 0.07 * vn(q * 6. - uTime * 0.03));
  vec4 c = vec4(0.);
  if (letter > t)  c = vec4(mk.g > mk.r ? uInkB : uInkA, 1.);
  else if (f.r > t) c = vec4(f.r > 0.45 ? uSmoke : uWisp, 1.);
  else if (amb > t) c = vec4(uAmb, 1.);
  outC = c;
}`;

function compile(gl, type, src) {
	const sh = gl.createShader(type);
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(sh);
		gl.deleteShader(sh);
		throw new Error(`shader compile failed: ${log}`);
	}
	return sh;
}
function link(gl, fs) {
	const p = gl.createProgram();
	const v = compile(gl, gl.VERTEX_SHADER, VERT);
	const f = compile(gl, gl.FRAGMENT_SHADER, fs);
	gl.attachShader(p, v);
	gl.attachShader(p, f);
	gl.linkProgram(p);
	gl.deleteShader(v);
	gl.deleteShader(f);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`program link failed: ${gl.getProgramInfoLog(p)}`);
	return p;
}

/* ---------- the field: two small ping-pong textures and the two passes ---------- */
function createField(cv) {
	const gl = cv.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true });
	if (!gl) return null;
	const F = { lost: false, time: 0, heal: 0 };
	let simProg = null;
	let renderProg = null;
	let texA = null;
	let texB = null;
	let fboA = null;
	let fboB = null;
	let maskTex = null;
	let halfFloat = false;
	let simW = 2;
	let simH = 2;
	let aspect = 1;
	let cell = 2;
	let lod = 0;
	const uni = new Map();
	const pending = [];
	const arr = new Float32Array(MAX_SPLATS * 4);

	const u = (prog, name) => {
		const key = `${prog === simProg ? 's' : 'r'}:${name}`;
		if (!uni.has(key)) uni.set(key, gl.getUniformLocation(prog, name));
		return uni.get(key);
	};
	const makeTex = (minFilter) => {
		const t = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return t;
	};
	const allocSim = (w, h) => {
		const t = makeTex(gl.LINEAR);
		if (halfFloat) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, w, h, 0, gl.RG, gl.HALF_FLOAT, null);
		else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, w, h, 0, gl.RG, gl.UNSIGNED_BYTE, null);
		return t;
	};
	const freeSim = () => {
		[fboA, fboB].forEach((r) => { if (r) gl.deleteFramebuffer(r); });
		[texA, texB].forEach((t) => { if (t) gl.deleteTexture(t); });
		fboA = fboB = texA = texB = null;
	};
	const buildSim = () => {
		freeSim();
		texA = allocSim(simW, simH);
		texB = allocSim(simW, simH);
		const mk = (tex) => {
			const f = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, f);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
			return f;
		};
		fboA = mk(texA);
		fboB = mk(texB);
		/* the first framebuffer is still bound: if it (or the second) is refused as half float, rebuild in 8 bits */
		const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
		const okA = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		if (!(ok && okA) && halfFloat) {
			halfFloat = false;
			buildSim();
		}
	};
	const uploadMask = (source) => {
		gl.bindTexture(gl.TEXTURE_2D, maskTex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		gl.generateMipmap(gl.TEXTURE_2D);
	};

	/* everything that belongs to the context, so a lost one can be rebuilt */
	F.init = () => {
		uni.clear();
		simProg = link(gl, SIM_FRAG);
		renderProg = link(gl, RENDER_FRAG);
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		halfFloat = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
		maskTex = makeTex(gl.LINEAR_MIPMAP_LINEAR);
		uploadMask(new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1));
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		texA = texB = fboA = fboB = null;
	};

	F.resize = (w, h, dpr, cellCssPx) => {
		aspect = w / h;
		cv.width = Math.round(w * dpr);
		cv.height = Math.round(h * dpr);
		cell = Math.max(2, Math.round(cellCssPx * dpr));
		lod = Math.max(0, Math.log2(cell / dpr));
		simW = Math.max(110, Math.round(w / 5));
		simH = Math.max(110, Math.round(h / 5));
		buildSim();
	};
	F.setMask = (source) => { if (!F.lost) uploadMask(source); };
	F.clear = () => {
		pending.length = 0;
		[fboA, fboB].forEach((f) => {
			gl.bindFramebuffer(gl.FRAMEBUFFER, f);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
		});
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};

	/* a pointer (or ghost) stroke: ink and wear along the path, shaped by how fast it moves */
	F.stroke = (st, nx, ny, power = 1, rad = 1) => {
		const r = layout.r * rad;
		if (st.has) {
			const dx = nx - st.x;
			const dy = ny - st.y;
			const dist = Math.hypot(dx * aspect, dy);
			if (dist < 0.0004) return;
			const speed = Math.min(1.6, dist * 34);
			const n = Math.min(6, Math.max(1, Math.ceil(dist / (r * 0.6))));
			for (let i = 1; i <= n; i++) {
				pending.push({ x: st.x + (dx * i) / n, y: st.y + (dy * i) / n, r, s: (SPLAT_S * power * (0.35 + speed * 0.75)) / Math.sqrt(n) });
			}
		} else {
			pending.push({ x: nx, y: ny, r, s: SPLAT_S * power * 0.6 });
		}
		if (pending.length > 80) pending.splice(0, pending.length - 80);
		st.x = nx;
		st.y = ny;
		st.has = true;
	};
	F.strokeEnd = (st) => { st.has = false; };

	F.step = () => {
		if (F.lost) return;
		F.time += STEP;
		const n = Math.min(pending.length, MAX_SPLATS);
		for (let i = 0; i < n; i++) {
			const s = pending[i];
			arr[i * 4] = s.x;
			arr[i * 4 + 1] = s.y;
			arr[i * 4 + 2] = s.r;
			arr[i * 4 + 3] = s.s;
		}
		pending.splice(0, n);
		gl.useProgram(simProg);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
		gl.viewport(0, 0, simW, simH);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texA);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, maskTex);
		gl.uniform1i(u(simProg, 'uPrev'), 0);
		gl.uniform1i(u(simProg, 'uMask'), 1);
		gl.uniform1f(u(simProg, 'uAspect'), aspect);
		gl.uniform1f(u(simProg, 'uTime'), F.time);
		gl.uniform1f(u(simProg, 'uDt'), STEP);
		gl.uniform1f(u(simProg, 'uSmokeKeep'), SMOKE_KEEP);
		/* in 8 bits a small subtraction rounds to nothing, so the fade steps are made larger */
		gl.uniform1f(u(simProg, 'uSmokeLin'), halfFloat ? SMOKE_LIN : 0.0045);
		gl.uniform1f(u(simProg, 'uWearKeep'), WEAR_KEEP);
		gl.uniform1f(u(simProg, 'uWearLin'), halfFloat ? WEAR_LIN : 0.0045);
		gl.uniform1f(u(simProg, 'uHeal'), F.heal > 0 ? 1 : 0);
		gl.uniform1f(u(simProg, 'uErode'), ERODE);
		gl.uniform1f(u(simProg, 'uGain'), SMOKE_GAIN);
		gl.uniform1f(u(simProg, 'uFlow'), FLOW);
		gl.uniform1f(u(simProg, 'uWearFlow'), WEAR_FLOW);
		gl.uniform1f(u(simProg, 'uWearMax'), WEAR_MAX);
		gl.uniform1i(u(simProg, 'uSplatCount'), n);
		gl.uniform4fv(u(simProg, 'uSplats'), arr);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		if (F.heal > 0) F.heal--;
		let t = texA; texA = texB; texB = t;
		t = fboA; fboA = fboB; fboB = t;
	};

	F.render = () => {
		if (F.lost) return;
		gl.useProgram(renderProg);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, cv.width, cv.height);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texA);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, maskTex);
		gl.uniform1i(u(renderProg, 'uSim'), 0);
		gl.uniform1i(u(renderProg, 'uMask'), 1);
		gl.uniform2f(u(renderProg, 'uRes'), cv.width, cv.height);
		gl.uniform1f(u(renderProg, 'uCell'), cell);
		gl.uniform1f(u(renderProg, 'uLod'), lod);
		gl.uniform3f(u(renderProg, 'uInkA'), ...INK_A);
		gl.uniform3f(u(renderProg, 'uInkB'), ...INK_B);
		gl.uniform3f(u(renderProg, 'uSmoke'), ...SMOKE);
		gl.uniform3f(u(renderProg, 'uWisp'), ...WISP);
		gl.uniform3f(u(renderProg, 'uAmb'), ...AMB);
		gl.uniform1f(u(renderProg, 'uTime'), F.time);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	};

	try {
		F.init();
	} catch (err) {
		return { failed: true };
	}
	return F;
}

/* ---------- the still picture in Canvas 2D (no WebGL 2): the same rules, run on the CPU ---------- */
function bayer8(px, py) {
	const x = px & 7;
	const y = py & 7;
	let v = 0;
	for (let i = 0; i < 3; i++) {
		const xi = (x >> (2 - i)) & 1;
		const yi = (y >> (2 - i)) & 1;
		v = (v << 2) | ((yi << 1) | (xi ^ yi));
	}
	return (v + 0.5) / 64;
}

function cpuStill(cv) {
	const W = cv.clientWidth;
	const H = cv.clientHeight;
	if (W < 4 || H < 4) return;
	buildMask(W, H);
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	cv.width = Math.round(W * dpr);
	cv.height = Math.round(H * dpr);
	const cell = Math.max(2, Math.round(cellCss(W) * dpr));
	const gw = Math.ceil(cv.width / cell);
	const gh = Math.ceil(cv.height / cell);
	const small = document.createElement('canvas');
	small.width = gw;
	small.height = gh;
	const sg = small.getContext('2d', { willReadFrequently: true });
	sg.imageSmoothingQuality = 'high';
	sg.drawImage(maskCanvas, 0, 0, gw, gh);
	const m = sg.getImageData(0, 0, gw, gh).data;

	/* smoke and wear from one sweep, as a few dozen gaussian blobs that have drifted up and thinned */
	const D = new Float32Array(gw * gh);
	const E = new Float32Array(gw * gh);
	const def = strokeDef(0);
	const aspect = W / H;
	const R = layout.r * GHOST_RADIUS;
	const N = 34;
	for (let j = 0; j <= N; j++) {
		const u = (0.72 * j) / N; // the stroke, caught most of the way through
		const p = strokePos(def, u);
		const age = (0.72 - u) * def.dur + 0.25;
		const sx = p[0] + 0.012 * Math.sin(age * 3 + j * 0.7);
		const sy = p[1] + 0.035 * age;
		const rs = R * (1 + 0.35 * age);
		const wd = 0.12 * Math.exp(-age * 0.6);
		const we = 0.16 * Math.exp(-age * 0.08);
		for (let y = 0; y < gh; y++) {
			const v = 1 - (y + 0.5) / gh;
			for (let x = 0; x < gw; x++) {
				const uu = (x + 0.5) / gw;
				const k = y * gw + x;
				const dx = (uu - sx) * aspect;
				const dy = v - sy;
				D[k] += wd * Math.exp(-(dx * dx + dy * dy) / (rs * rs)) * (1 + 1.6 * Math.min(1, (m[k * 4] + m[k * 4 + 1]) / 255));
				const ex = (uu - p[0]) * aspect;
				const ey = v - p[1];
				E[k] += we * Math.exp(-(ex * ex + ey * ey) / (R * R)) * ERODE;
			}
		}
	}
	const out = sg.createImageData(gw, gh);
	const rgb = (c) => c.map((q) => Math.round(q * 255));
	const cols = [rgb(INK_A), rgb(INK_B), rgb(SMOKE), rgb(WISP)];
	for (let y = 0; y < gh; y++) {
		for (let x = 0; x < gw; x++) {
			const k = y * gw + x;
			const t = bayer8(x, y);
			const mr = m[k * 4] / 255;
			const mg = m[k * 4 + 1] / 255;
			const cov = Math.min(1, Math.max(0, (Math.max(mr, mg) - 0.5) * 3 + 0.5));
			const letter = cov * (1 - Math.min(1, Math.min(WEAR_MAX, E[k])));
			const d = Math.min(1.6, D[k]);
			let c = null;
			if (letter > t) c = mg > mr ? cols[1] : cols[0];
			else if (d > t && d > 0.012) c = d > 0.45 ? cols[2] : cols[3];
			if (c) {
				out.data[k * 4] = c[0];
				out.data[k * 4 + 1] = c[1];
				out.data[k * 4 + 2] = c[2];
				out.data[k * 4 + 3] = 255;
			}
		}
	}
	sg.putImageData(out, 0, 0);
	const ctx = cv.getContext('2d');
	ctx.clearRect(0, 0, cv.width, cv.height);
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(small, 0, 0, gw * cell, gh * cell);
}

/* a browser without WebGL 2: a new canvas (the old one is spoken for), a note, and the still */
function fallback() {
	const c2 = document.createElement('canvas');
	c2.className = canvas.className;
	c2.setAttribute('role', 'img');
	c2.setAttribute('aria-label', 'The words TJ-Hosting Lab in navy and blue pixel dots, smeared by a plume of blue ink. A still picture.');
	canvas.replaceWith(c2);
	note.hidden = false;
	[smearBtn, restoreBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	let timer = 0;
	const draw = () => cpuStill(c2);
	draw();
	new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(draw, 150);
	}).observe(c2);
}

/* wait (briefly) for the heading font, so the mask is drawn in it */
function fontReady() {
	const timeout = new Promise((r) => setTimeout(r, 1500));
	const load = document.fonts && document.fonts.load ? document.fonts.load(`900 100px ${FONT}`, 'TJ-Hosting Lab').catch(() => {}) : Promise.resolve();
	return Promise.race([load, timeout]);
}

async function start() {
	const field = createField(canvas);
	await fontReady();
	if (!field || field.failed) {
		fallback();
		return;
	}

	const base = Math.min(2, window.devicePixelRatio || 1);
	const tiers = [base, Math.min(base, 1.5), 1].filter((v, i, a) => i === 0 || v < a[i - 1]);
	let tier = 0;

	/* size the canvas, redraw the word's mask, rebuild the fields, draw once */
	let sizedW = 0;
	let sizedH = 0;
	function applySize() {
		const W = canvas.clientWidth;
		const H = canvas.clientHeight;
		if (W < 4 || H < 4 || field.lost) return;
		sizedW = W;
		sizedH = H;
		buildMask(W, H);
		field.resize(W, H, tiers[tier], cellCss(W));
		field.setMask(maskCanvas);
		field.clear();
		if (REDUCED) paintStill(variant); else field.render();
	}

	/* ---- the still, for reduced motion: one ghost stroke run at once, then a moment of drifting ---- */
	let variant = 0;
	function paintStill(v) {
		field.clear();
		field.time = 7 + v * 5.3;
		const def = strokeDef(v);
		const st = { x: 0, y: 0, has: false };
		const n = Math.round(def.dur * 60);
		for (let i = 0; i <= n; i++) {
			const p = strokePos(def, i / n);
			field.stroke(st, p[0], p[1], GHOST_POWER * 0.9, GHOST_RADIUS * 0.9);
			field.step();
		}
		for (let i = 0; i < 24; i++) field.step();
		field.render();
	}

	canvas.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		field.lost = true;
	});
	canvas.addEventListener('webglcontextrestored', () => {
		try {
			field.lost = false;
			field.init();
			applySize();
		} catch (err) {
			field.lost = true;
		}
	});

	let timer = 0;
	const ro = new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (canvas.clientWidth !== sizedW || canvas.clientHeight !== sizedH) applySize();
		}, 120);
	});

	if (REDUCED) {
		applySize();
		ro.observe(canvas);
		pauseBtn.disabled = true;
		/* Smear jumps straight to the end state: another smeared still. Restore: the word whole. */
		smearBtn.addEventListener('click', () => {
			variant = (variant + 1) % 8;
			paintStill(variant);
		});
		restoreBtn.addEventListener('click', () => {
			field.clear();
			field.render();
		});
		return;
	}

	/* ---- input: pointer events (a mouse smears as it moves; touch and pen smear while down) ---- */
	const strokes = new Map();
	const ghostSt = { x: 0, y: 0, has: false };
	let lastInput = -1e9;
	let paused = false;
	const isDown = () => { for (const st of strokes.values()) if (st.down) return true; return false; };
	const where = (e) => {
		const r = canvas.getBoundingClientRect();
		return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
	};
	canvas.addEventListener('pointerdown', (e) => {
		if (paused) return;
		try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable: carry on */ }
		const st = { x: 0, y: 0, has: false, down: true };
		strokes.set(e.pointerId, st);
		const p = where(e);
		field.stroke(st, p[0], p[1], 1.3);
		lastInput = performance.now();
	});
	canvas.addEventListener('pointermove', (e) => {
		if (paused) return;
		let st = strokes.get(e.pointerId);
		if (!st) {
			if (e.pointerType !== 'mouse') return;
			st = { x: 0, y: 0, has: false };
			strokes.set(e.pointerId, st);
		}
		const p = where(e);
		field.stroke(st, p[0], p[1]);
		lastInput = performance.now();
	});
	const lift = (e) => { strokes.delete(e.pointerId); };
	canvas.addEventListener('pointerup', lift);
	canvas.addEventListener('pointercancel', lift);
	canvas.addEventListener('pointerleave', (e) => {
		if (e.pointerType === 'mouse' && !(strokes.get(e.pointerId) || {}).down) strokes.delete(e.pointerId);
	});

	/* ---- the ghost: a stroke, a rest, the next stroke; its clock only runs while nobody else is stirring ---- */
	let gIdx = 0;
	let gDef = strokeDef(0);
	let gT = -0.35; // a short wait before the first swipe
	function ghostStep() {
		const idle = performance.now() - lastInput > IDLE_MS && !isDown();
		if (!idle) {
			field.strokeEnd(ghostSt);
			return;
		}
		gT += STEP;
		if (gT < 0) return;
		if (gT > gDef.dur + gDef.rest) {
			gIdx++;
			gDef = strokeDef(gIdx);
			gT = 0;
		}
		if (gT <= gDef.dur) {
			const p = strokePos(gDef, gT / gDef.dur);
			field.stroke(ghostSt, p[0], p[1], GHOST_POWER, GHOST_RADIUS);
		} else field.strokeEnd(ghostSt);
	}

	/* ---- the frame: fixed 60 Hz steps, one draw ---- */
	let acc = 0;
	let frames = 0;
	const samples = [];
	function frame(dt) {
		if (field.lost) return;
		acc += dt;
		let n = 0;
		while (acc >= STEP * 0.95 && n < 3) {
			acc -= STEP;
			n++;
			ghostStep();
			field.step();
		}
		if (acc > STEP * 2) acc = 0;
		if (n) field.render();

		/* too slow for the device? draw at a lower pixel ratio (never more than twice) */
		frames++;
		if (frames > 45 && tier < tiers.length - 1) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.026) {
					tier++;
					applySize();
				}
				samples.length = 0;
				frames = 20;
			}
		}
	}

	applySize();
	ro.observe(canvas);
	const ctl = loop(canvas, frame, { name: 'dither-flow-ink' });

	const setPaused = (v) => {
		paused = v;
		pauseBtn.setAttribute('aria-pressed', String(v));
		pauseBtn.textContent = v ? 'Play' : 'Pause';
		if (v) {
			strokes.clear();
			ctl.stop();
		} else {
			lastInput = performance.now();
			ctl.start();
		}
	};
	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

	/* Smear sends the ghost across the word now; Restore speeds the word's return and gives it a moment of peace */
	smearBtn.addEventListener('click', () => {
		if (paused) setPaused(false);
		lastInput = -1e9;
		field.strokeEnd(ghostSt);
		gIdx++;
		gDef = strokeDef(gIdx);
		gT = 0;
	});
	restoreBtn.addEventListener('click', () => {
		if (paused) {
			field.clear();
			field.render();
			return;
		}
		field.heal = 80;
		field.strokeEnd(ghostSt);
		gIdx++;
		gDef = strokeDef(gIdx);
		gT = -1.6;
	});
}

boot();
start();
