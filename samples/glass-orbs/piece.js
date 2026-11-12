/*
 * Sample 14 — "Glass Orbs".
 * Three or four clear glass spheres and capsules float over a pale blue plane that carries the words "TJ-Hosting Lab"
 * on graph paper, and bend and split what is behind them. It is three.js: a MeshPhysicalMaterial with transmission,
 * IOR, thickness and a little dispersion, lit by RoomEnvironment (a room built from boxes in code, no HDR file).
 * The plane's picture is a Canvas 2D drawing used as a CanvasTexture, drawn after Nunito Sans 900 has loaded; its
 * small shader also lays a soft blue shadow with a bright caustic under each orb, so the shadows are refracted too.
 * Drag an orb with a pointer (a raycast picks it, and it moves in the plane); idle, the orbs bob and drift slowly.
 * The two sliders change the glass's IOR and thickness. One loop() from js/lab.js drives the motion and is the only
 * thing that calls renderer.render (there is no setAnimationLoop), so nothing draws off-screen or in a hidden tab.
 * Under reduced motion one frame is rendered and nothing loops; a drag or a slider then renders once for that input.
 * A browser without WebGL gets a still CSS picture and a short note. On phones: three orbs, a lower pixel ratio and
 * a lower transmission resolution.
 *
 * Adapted from "three.js webgl - materials - transmission" (examples/webgl_materials_physical_transmission.html)
 * by the three.js authors, https://threejs.org/examples/webgl_materials_physical_transmission.html (tag r186), MIT.
 * What is taken: the MeshPhysicalMaterial glass recipe (transmission 1, roughness near 0, ior, thickness, specular
 * settings, DoubleSide), a Canvas 2D drawing used as a CanvasTexture, renderer.transmissionResolutionScale, and
 * the one-render-per-change habit for the still. What changed: the single sphere, the UltraHDR background, the
 * lil-gui panel and OrbitControls are gone; there are several orbs (spheres and capsules) with a drag, a drift and
 * soft collisions; the background is a drawn plane with a shader, not an HDR picture; reflections come from
 * RoomEnvironment through PMREMGenerator; dispersion and a faint blue attenuation tint the glass; the sliders are
 * plain HTML; the renderer is driven from loop(); phones get a cheaper setup; a lost context is rebuilt; and
 * a browser without WebGL gets a CSS still. three.js itself is vendored at vendor/three@0.186.1/.
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
import { RoomEnvironment } from '../../vendor/three@0.186.1/addons/environments/RoomEnvironment.js';

const screenEl = document.querySelector('.piece-screen');
const canvas = document.querySelector('.piece');
const bar = document.querySelector('.bar');
const info = document.querySelector('.sample-info');
const iorIn = document.getElementById('ior');
const thickIn = document.getElementById('thick');
const scatterBtn = document.querySelector('[data-action="scatter"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const REDUCED = prefersReducedMotion();
const FONT = '"Nunito Sans", system-ui, sans-serif';

/* ---------- the look ---------- */
const FOV = 24;
const VIEW_H = 10; // world units from the bottom to the top of the plane
const CAM_Z = (VIEW_H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const INK_A = '#0a2a72'; // "TJ-Hosting" in navy
const INK_B = '#0c6bed'; // "Lab" in royal blue, as in the brand lock-up
const MAX_ORBS = 4;
const DAMP = 1.9; // how fast a thrown orb slows down (per second)
const BOUNCE = 0.55;

/* an orb: r is its radius as a share of the piece's unit; k is a capsule's half-length over its radius (0 = sphere);
   slot / slotP are where it starts (landscape / phone), as shares of the free area; z is how far it floats off the plane */
const DEFS = [
	{ r: 0.2, k: 0, a: 0, z: 1.6, slot: [0.4, 0.5], slotP: [0.3, 0.32] },
	{ r: 0.115, k: 1.5, a: -0.55, z: 1.2, slot: [0.67, 0.69], slotP: [0.72, 0.74] },
	{ r: 0.13, k: 0, a: 0, z: 2.0, slot: [0.83, 0.24], slotP: [0.78, 0.14] },
	{ r: 0.085, k: 1.4, a: 1.15, z: 1.4, slot: [0.12, 0.27], slotP: [0.1, 0.4] },
];

/* ---------- state ---------- */
let W = 0;
let H = 0;
let DPR = 1;
let wpp = 1; // world units per CSS pixel
let unit = 400;
let phone = false;
let stacked = false;
let zone = { top: 0, bottom: 0 };
let center = { x: 0, y: 0 };
let t = 0; // idle clock (seconds), advanced only while playing
let paused = false;
let dirty = true;
let lost = false;
let drag = null;
let hover = null;
let sel = 0; // the orb the keyboard moves
let focusRing = false;
let quality = 0;
let fontsOk = false;

let renderer;
let scene;
let camera;
let plane;
let planeMat;
let glass;
let envTarget = null;
let tex = null;
let orbs = [];
const backdrop = document.createElement('canvas');
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- the plane: the drawn picture, plus a blue shadow and a caustic under each orb ---------- */
const VERT = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
const FRAG = `
uniform sampler2D map;
uniform vec2 uSize;
uniform vec4 uOrb[${MAX_ORBS}];
uniform vec4 uDir[${MAX_ORBS}];
varying vec2 vUv;

/* distance from p to the spine of a capsule centred on c with direction d and half-length hl */
float spine( vec2 p, vec2 c, vec2 d, float hl ) {
	vec2 q = p - c;
	float s = clamp( dot( q, d ), - hl, hl );
	return length( q - d * s );
}

void main() {
	vec3 col = texture2D( map, vUv ).rgb;
	vec2 p = vec2( vUv.x, 1.0 - vUv.y ) * uSize;
	float shade = 0.0;
	float glint = 0.0;
	float ring = 0.0;
	for ( int i = 0; i < ${MAX_ORBS}; i ++ ) {
		float on = uDir[ i ].w;
		if ( on < 0.5 ) continue;
		float r = uOrb[ i ].z;
		float hl = uOrb[ i ].w;
		vec2 d = uDir[ i ].xy;
		/* the shadow falls down and a little right, further away the higher the orb floats */
		vec2 c = uOrb[ i ].xy + vec2( 0.5, 1.0 ) * uDir[ i ].z;
		float dist = spine( p, c, d, hl );
		float soft = 8.0 + uDir[ i ].z * 0.55;
		float body = 1.0 - smoothstep( r - soft, r + soft, dist );
		float core = 1.0 - smoothstep( 0.0, r * 0.7, dist );
		shade = max( shade, body );
		glint = max( glint, core * body );
		if ( on > 1.5 ) {
			float e = abs( spine( p, uOrb[ i ].xy, d, hl ) - ( r + 9.0 ) );
			ring = max( ring, 1.0 - smoothstep( 1.0, 2.6, e ) );
		}
	}
	col *= mix( vec3( 1.0 ), vec3( 0.66, 0.78, 0.94 ), shade * 0.8 * ( 1.0 - 0.7 * glint ) );
	col += vec3( 0.045, 0.1, 0.13 ) * glint * shade;
	col = mix( col, vec3( 0.004, 0.1, 0.77 ), ring * 0.75 );
	gl_FragColor = vec4( col, 1.0 );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;

/* ---------- the picture on the plane (Canvas 2D → CanvasTexture), drawn once the font has loaded ---------- */
function drawBackdrop() {
	const w = Math.max(2, Math.round(W * DPR));
	const h = Math.max(2, Math.round(H * DPR));
	backdrop.width = w;
	backdrop.height = h;
	const g = backdrop.getContext('2d');
	const sx = w / W;
	const sy = h / H;
	g.setTransform(sx, 0, 0, sy, 0, 0);

	/* the day sky, with a patch of azure low left and a cyan glow high right */
	const sky = g.createLinearGradient(0, 0, 0, H);
	sky.addColorStop(0, '#fafcfd');
	sky.addColorStop(0.45, '#eef7fc');
	sky.addColorStop(1, '#cfe7fb');
	g.fillStyle = sky;
	g.fillRect(0, 0, W, H);
	let rg = g.createRadialGradient(W * 0.16, H * 0.95, 0, W * 0.16, H * 0.95, Math.max(W, H) * 0.7);
	rg.addColorStop(0, 'rgba(77, 159, 243, 0.3)');
	rg.addColorStop(1, 'rgba(77, 159, 243, 0)');
	g.fillStyle = rg;
	g.fillRect(0, 0, W, H);
	rg = g.createRadialGradient(W * 0.86, H * 0.08, 0, W * 0.86, H * 0.08, Math.max(W, H) * 0.55);
	rg.addColorStop(0, 'rgba(70, 208, 251, 0.26)');
	rg.addColorStop(1, 'rgba(70, 208, 251, 0)');
	g.fillStyle = rg;
	g.fillRect(0, 0, W, H);

	/* graph paper: the glass bends its lines, which shows the lens at work */
	const cell = clamp(Math.round(Math.min(W, H) / 12), 34, 58);
	const ox = center.x - Math.round(center.x / cell) * cell;
	const oy = center.y - Math.round(center.y / cell) * cell;
	g.lineWidth = 1;
	for (let i = -1; ox + i * cell <= W + cell; i++) {
		const x = Math.round(ox + i * cell) + 0.5;
		g.strokeStyle = (i + Math.round(center.x / cell)) % 4 === 0 ? 'rgba(12, 107, 237, 0.24)' : 'rgba(12, 107, 237, 0.12)';
		g.beginPath();
		g.moveTo(x, 0);
		g.lineTo(x, H);
		g.stroke();
	}
	for (let j = -1; oy + j * cell <= H + cell; j++) {
		const y = Math.round(oy + j * cell) + 0.5;
		g.strokeStyle = (j + Math.round(center.y / cell)) % 4 === 0 ? 'rgba(12, 107, 237, 0.24)' : 'rgba(12, 107, 237, 0.12)';
		g.beginPath();
		g.moveTo(0, y);
		g.lineTo(W, y);
		g.stroke();
	}

	/* the wordmark: Nunito Sans 900, navy and royal, with a pale edge so the grid never cuts the letters */
	g.textBaseline = 'alphabetic';
	g.textAlign = 'left';
	const { mA, mB, mSp } = wordMetrics(g);
	const fs = wordSize(mA, mB, mSp);
	const k = fs / 100;
	const cap = fs * 0.705;
	g.font = `900 ${fs}px ${FONT}`;
	const lines = stacked
		? [
			['TJ-Hosting', INK_A, center.x - (mA * k) / 2, center.y - fs * 0.55 + cap / 2],
			['Lab', INK_B, center.x - (mB * k) / 2, center.y + fs * 0.55 + cap / 2],
		]
		: [
			['TJ-Hosting', INK_A, center.x - ((mA + mSp + mB) * k) / 2, center.y + cap / 2],
			['Lab', INK_B, center.x - ((mA + mSp + mB) * k) / 2 + (mA + mSp) * k, center.y + cap / 2],
		];
	g.lineJoin = 'round';
	g.lineWidth = fs * 0.07;
	g.strokeStyle = 'rgba(250, 252, 253, 0.96)';
	for (const [s, , x, y] of lines) g.strokeText(s, x, y);
	g.shadowColor = 'rgba(22, 66, 140, 0.24)';
	g.shadowBlur = fs * 0.07 * sx;
	g.shadowOffsetY = fs * 0.035 * sy;
	for (const [s, c, x, y] of lines) {
		g.fillStyle = c;
		g.fillText(s, x, y);
	}
	g.shadowColor = 'transparent';

	/* a royal-to-cyan stripe under it */
	const baseY = lines[lines.length - 1][3] + fs * 0.2;
	const sw = (stacked ? mB * k : (mA + mSp + mB) * k) * (stacked ? 0.9 : 0.38);
	const sg = g.createLinearGradient(center.x - sw / 2, 0, center.x + sw / 2, 0);
	sg.addColorStop(0, INK_B);
	sg.addColorStop(1, '#46d0fb');
	g.strokeStyle = sg;
	g.lineWidth = Math.max(4, fs * 0.05);
	g.lineCap = 'round';
	g.beginPath();
	g.moveTo(center.x - sw / 2, baseY);
	g.lineTo(center.x + sw / 2, baseY);
	g.stroke();

	/* a fresh texture each time: the size changes with the window */
	if (tex) tex.dispose();
	tex = new THREE.CanvasTexture(backdrop);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.generateMipmaps = false;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	planeMat.uniforms.map.value = tex;
}

const zoneHeight = () => Math.max(60, zone.bottom - zone.top);

/* how wide the words are at 100 px, and the size that fits them to the window */
function wordMetrics(g) {
	g.font = `900 100px ${FONT}`;
	return { mA: g.measureText('TJ-Hosting').width, mB: g.measureText('Lab').width, mSp: g.measureText(' ').width };
}
function wordSize(mA, mB, mSp) {
	return stacked
		? Math.min((W * 0.88 * 100) / mA, zoneHeight() * 0.2)
		: Math.min((Math.min(W * 0.78, 1000) * 100) / (mA + mSp + mB), zoneHeight() * 0.32);
}

/* ---------- the room's light: a procedural environment for the reflections (rebuilt after a lost context) ---------- */
function buildEnv() {
	const pmrem = new THREE.PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	const target = pmrem.fromScene(room, 0.04);
	if (envTarget) envTarget.dispose();
	envTarget = target;
	scene.environment = target.texture;
	scene.environmentIntensity = 1.0;
	room.traverse((o) => {
		if (o.geometry) o.geometry.dispose();
		if (o.material) o.material.dispose();
	});
	pmrem.dispose();
}

/* ---------- the area the piece uses: under the slider bar, and (on a phone) above the info panel ---------- */
function measure() {
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	phone = innerWidth < 720;
	stacked = W < 560;
	const cr = canvas.getBoundingClientRect();
	const br = bar.getBoundingClientRect();
	const ir = info.getBoundingClientRect();
	const top = clamp(br.bottom - cr.top + 10, 0, H * 0.4);
	let bottom = H - 10;
	const panelTop = ir.top - cr.top;
	const overlapX = Math.min(cr.right, ir.right) - Math.max(cr.left, ir.left);
	const spans = overlapX > cr.width * 0.5;
	if (spans && panelTop - 10 - top > 150 && panelTop < H - 40) bottom = panelTop - 10;
	zone = { top, bottom };
	let cy = (top + bottom) / 2;
	if (!spans && overlapX > 0 && panelTop > top + 150) {
		/* the panel sits low on the left: keep the words clear above it */
		const { mA, mB, mSp } = wordMetrics(backdrop.getContext('2d'));
		const fs = wordSize(mA, mB, mSp);
		const half = stacked ? fs * 1.3 : fs * 0.6;
		cy = Math.max(Math.min(cy, panelTop - half - 24), top + half);
	}
	center = { x: W / 2, y: cy };
	unit = phone ? Math.min(zoneHeight(), W * 0.95) : Math.min(zoneHeight(), W * 0.55);
}

/* ---------- the orbs ---------- */
function makeOrbs() {
	orbs = DEFS.map((d, i) => {
		const geo = d.k ? new THREE.CapsuleGeometry(1, 2 * d.k, 16, 48) : new THREE.SphereGeometry(1, 64, 48);
		const mesh = new THREE.Mesh(geo, glass);
		scene.add(mesh);
		return {
			...d,
			mesh,
			bx: 0, by: 0, // where it rests; drift and bob are added to this
			vx: 0, vy: 0,
			ox: 0, oy: 0, oa: 0, // the drift, bob and sway at this moment
			rx: 0, ry: 0, ang: d.a, // what is drawn
			rad: 10, half: 0,
			idle: 1,
			active: true,
			ph: [i * 1.7 + 0.4, i * 2.3 + 1.1, i * 0.9 + 2.2, i * 3.1 + 0.7],
		};
	});
}

/* put an orb on a slot (shares of the window's width and of the free height), a little off it if jitter > 0 */
function placeOrb(o, s, jitter = 0) {
	o.bx = (s[0] + (Math.random() - 0.5) * jitter) * W;
	o.by = zone.top + (s[1] + (Math.random() - 0.5) * jitter) * zoneHeight();
	o.vx = 0;
	o.vy = 0;
}
const slotOf = (o) => (phone ? o.slotP : o.slot);

function sizeOrbs() {
	orbs.forEach((o, i) => {
		o.active = !phone || i < 3;
		o.mesh.visible = o.active;
		o.rad = o.r * unit;
		o.half = o.k * o.rad;
	});
}

const reach = (o) => o.rad + o.half * 0.62; // how far an orb's body reaches, for walls and collisions

/* how far an orb's body reaches sideways and up/down at its resting angle (a capsule is longer than it is wide) */
const extent = (o) => [(o.rad + o.half * Math.abs(Math.cos(o.a))) * 1.04, (o.rad + o.half * Math.abs(Math.sin(o.a))) * 1.04];

function keepInside(o) {
	const [ex, ey] = extent(o);
	o.bx = clamp(o.bx, ex, Math.max(ex, W - ex));
	o.by = clamp(o.by, ey, Math.max(ey, H - ey));
}

/* the drift, the bob and the sway of an orb at idle time tt */
function idleOffsets(o, tt) {
	const A = unit * 0.03;
	const k = o.idle;
	o.ox = (Math.sin(tt * 0.23 + o.ph[0]) * A + Math.sin(tt * 0.51 + o.ph[1]) * A * 0.35) * k;
	o.oy = (Math.cos(tt * 0.19 + o.ph[2]) * A * 0.8 + Math.sin(tt * 0.9 + o.ph[3]) * unit * 0.012) * k;
	o.oa = Math.sin(tt * 0.31 + o.ph[1]) * 0.14 * k;
}

/* one step of the motion: drag, glide, walls, collisions */
function step(dt) {
	const live = orbs.filter((o) => o.active);
	for (const o of live) {
		const grabbed = drag && drag.orb === o;
		o.idle += ((grabbed ? 0.25 : 1) - o.idle) * (1 - Math.exp(-dt * 5));
		idleOffsets(o, t);
		if (grabbed) {
			const nx = drag.tx - o.ox;
			const ny = drag.ty - o.oy;
			const f = 1 - Math.exp(-dt * 22);
			const px = o.bx;
			const py = o.by;
			o.bx += (nx - o.bx) * f;
			o.by += (ny - o.by) * f;
			o.vx += ((o.bx - px) / dt - o.vx) * 0.35;
			o.vy += ((o.by - py) / dt - o.vy) * 0.35;
			o.ang = o.a + o.oa + clamp(o.vx * 0.0006, -0.35, 0.35);
		} else if (!paused) {
			o.bx += o.vx * dt;
			o.by += o.vy * dt;
			const damp = Math.exp(-DAMP * dt);
			o.vx *= damp;
			o.vy *= damp;
			if (Math.abs(o.vx) + Math.abs(o.vy) < 4) { o.vx = 0; o.vy = 0; }
			const [ex, ey] = extent(o);
			if (o.bx < ex) { o.bx = ex; o.vx = Math.abs(o.vx) * BOUNCE; }
			if (o.bx > W - ex) { o.bx = W - ex; o.vx = -Math.abs(o.vx) * BOUNCE; }
			if (o.by < ey) { o.by = ey; o.vy = Math.abs(o.vy) * BOUNCE; }
			if (o.by > H - ey) { o.by = H - ey; o.vy = -Math.abs(o.vy) * BOUNCE; }
			o.ang = o.a + o.oa;
		} else {
			o.ang = o.a + o.oa;
		}
	}
	/* soft collisions: orbs push each other aside, and a held orb is not pushed */
	for (let i = 0; i < live.length; i++) {
		for (let j = i + 1; j < live.length; j++) {
			const a = live[i];
			const b = live[j];
			let dx = b.bx - a.bx;
			let dy = b.by - a.by;
			const d = Math.hypot(dx, dy) || 0.001;
			const min = reach(a) + reach(b);
			if (d >= min) continue;
			dx /= d;
			dy /= d;
			const over = min - d;
			const aHeld = drag && drag.orb === a;
			const bHeld = drag && drag.orb === b;
			const wa = bHeld ? 1 : aHeld ? 0 : 0.5;
			const wb = aHeld ? 1 : bHeld ? 0 : 0.5;
			if (!aHeld) { a.bx -= dx * over * wa; a.by -= dy * over * wa; }
			if (!bHeld) { b.bx += dx * over * wb; b.by += dy * over * wb; }
			if (!paused) {
				const push = Math.min(over * 6, 420);
				if (!aHeld) { a.vx -= dx * push * wa; a.vy -= dy * push * wa; }
				if (!bHeld) { b.vx += dx * push * wb; b.vy += dy * push * wb; }
			}
		}
	}
	for (const o of live) {
		keepInside(o);
		o.rx = o.bx + o.ox;
		o.ry = o.by + o.oy;
	}
}

/* ---------- three.js: put the meshes and the shadow uniforms where the orbs are ---------- */
function syncMeshes() {
	const uO = planeMat.uniforms.uOrb.value;
	const uD = planeMat.uniforms.uDir.value;
	orbs.forEach((o, i) => {
		if (!o.active) {
			uD[i].set(0, 0, 0, 0);
			return;
		}
		const s = (CAM_Z - o.z) / CAM_Z; // an orb nearer the camera is drawn larger, so shrink it to keep its screen size
		o.mesh.position.set((o.rx - W / 2) * wpp * s, -(o.ry - H / 2) * wpp * s, o.z);
		o.mesh.scale.setScalar(o.rad * wpp * s);
		o.mesh.rotation.z = o.k ? -o.ang + Math.PI / 2 : 0;
		uO[i].set(o.rx, o.ry, o.rad, o.half);
		uD[i].set(Math.cos(o.ang), Math.sin(o.ang), o.rad * 0.42 + o.z * 6, focusRing && i === sel ? 2 : 1);
	});
}

function applySize() {
	measure();
	if (W < 4 || H < 4) return false;
	wpp = VIEW_H / H;
	renderer.setPixelRatio(DPR);
	renderer.setSize(W, H, false);
	camera.aspect = W / H;
	camera.updateProjectionMatrix();
	plane.scale.set(W * wpp, H * wpp, 1);
	planeMat.uniforms.uSize.value.set(W, H);
	sizeOrbs();
	drawBackdrop();
	return true;
}

/* ---------- the pointer: raycast to pick an orb, then move it in the plane ---------- */
function local(e) {
	const r = canvas.getBoundingClientRect();
	return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
}

function pick(x, y, slop) {
	syncMeshes();
	scene.updateMatrixWorld();
	ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
	ray.setFromCamera(ndc, camera);
	const hits = ray.intersectObjects(orbs.filter((o) => o.active).map((o) => o.mesh), false);
	if (hits.length) return orbs.find((o) => o.mesh === hits[0].object);
	if (!slop) return null;
	/* a fingertip is bigger than a pixel: take the nearest orb within a little reach of the touch */
	let best = null;
	let bestD = slop;
	for (const o of orbs) {
		if (!o.active) continue;
		const d = Math.hypot(x - o.rx, y - o.ry) - reach(o);
		if (d < bestD) { bestD = d; best = o; }
	}
	return best;
}

function renderNow() {
	if (lost) return;
	syncMeshes();
	renderer.render(scene, camera);
}

canvas.addEventListener('pointerdown', (e) => {
	if (e.pointerType === 'mouse' && e.button !== 0) return;
	const [x, y] = local(e);
	const o = pick(x, y, e.pointerType === 'mouse' ? 0 : 16);
	if (!o) return;
	e.preventDefault();
	canvas.setPointerCapture(e.pointerId);
	canvas.classList.add('is-grabbing');
	o.vx = 0;
	o.vy = 0;
	sel = orbs.indexOf(o);
	drag = { id: e.pointerId, orb: o, gx: x - o.rx, gy: y - o.ry, tx: o.rx, ty: o.ry };
	dirty = true;
	if (REDUCED) moveStill(o, x, y);
});

canvas.addEventListener('pointermove', (e) => {
	const [x, y] = local(e);
	if (drag) {
		if (e.pointerId !== drag.id) return;
		/* tx, ty: where the orb should be drawn; step() takes its drift off to get where it should rest */
		drag.tx = x - drag.gx;
		drag.ty = y - drag.gy;
		dirty = true;
		if (REDUCED) moveStill(drag.orb, x, y);
		return;
	}
	if (e.pointerType !== 'mouse') return;
	const over = pick(x, y, 0);
	if (over !== hover) {
		hover = over;
		canvas.classList.toggle('is-over', !!over);
	}
});

function endDrag(e) {
	if (!drag || e.pointerId !== drag.id) return;
	const o = drag.orb;
	/* a throw: the orb leaves with the speed it had, within reason */
	const sp = Math.hypot(o.vx, o.vy);
	if (sp > 1400) { o.vx *= 1400 / sp; o.vy *= 1400 / sp; }
	if (REDUCED) { o.vx = 0; o.vy = 0; }
	drag = null;
	canvas.classList.remove('is-grabbing');
	dirty = true;
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

/* under reduced motion an orb goes straight to the pointer and the picture is rendered once for it */
function moveStill(o, x, y) {
	if (!drag) return;
	o.bx = x - drag.gx - o.ox;
	o.by = y - drag.gy - o.oy;
	keepInside(o);
	separate();
	o.rx = o.bx + o.ox;
	o.ry = o.by + o.oy;
	renderNow();
}

/* the keyboard: Enter picks the next orb, the arrow keys nudge it */
canvas.addEventListener('keydown', (e) => {
	const live = orbs.filter((o) => o.active);
	if (!live.length) return;
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		sel = (sel + 1) % live.length;
		dirty = true;
		if (REDUCED) renderNow();
		return;
	}
	const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
	if (!dir) return;
	e.preventDefault();
	const o = live[sel % live.length];
	if (REDUCED) {
		o.bx += dir[0] * unit * 0.06;
		o.by += dir[1] * unit * 0.06;
		keepInside(o);
		separate();
		o.rx = o.bx + o.ox;
		o.ry = o.by + o.oy;
		renderNow();
	} else {
		o.vx += dir[0] * 360;
		o.vy += dir[1] * 360;
		dirty = true;
	}
});
canvas.addEventListener('focus', () => {
	focusRing = canvas.matches(':focus-visible');
	dirty = true;
	if (REDUCED && renderer) renderNow();
});
canvas.addEventListener('blur', () => {
	focusRing = false;
	dirty = true;
	if (REDUCED && renderer) renderNow();
});

/* the still: settle overlaps in one go (the same push-apart as the live step, without velocities) */
function separate() {
	const live = orbs.filter((o) => o.active);
	for (let n = 0; n < 4; n++) {
		for (let i = 0; i < live.length; i++) {
			for (let j = i + 1; j < live.length; j++) {
				const a = live[i];
				const b = live[j];
				let dx = b.bx - a.bx;
				let dy = b.by - a.by;
				const d = Math.hypot(dx, dy) || 0.001;
				const min = reach(a) + reach(b);
				if (d >= min) continue;
				dx /= d;
				dy /= d;
				const over = min - d;
				const aHeld = drag && drag.orb === a;
				const bHeld = drag && drag.orb === b;
				if (!aHeld) { a.bx -= dx * over * (bHeld ? 1 : 0.5); a.by -= dy * over * (bHeld ? 1 : 0.5); }
				if (!bHeld) { b.bx += dx * over * (aHeld ? 1 : 0.5); b.by += dy * over * (aHeld ? 1 : 0.5); }
				keepInside(a);
				keepInside(b);
			}
		}
	}
}

/* ---------- the glass sliders ---------- */
function bindSlider(input, out, apply, digits) {
	const min = parseFloat(input.min);
	const max = parseFloat(input.max);
	const sync = () => {
		const v = parseFloat(input.value);
		input.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
		out.textContent = v.toFixed(digits);
		if (glass) {
			apply(v);
			dirty = true;
			if (REDUCED && renderer) renderNow();
		}
	};
	input.addEventListener('input', sync);
	return sync;
}

/* ---------- a browser without WebGL: a CSS still and a short note ---------- */
function fallback() {
	const poster = document.createElement('div');
	poster.className = 'piece poster';
	poster.setAttribute('role', 'img');
	poster.setAttribute('aria-label', 'The words TJ-Hosting Lab on pale blue graph paper, with three clear glass discs. A still picture.');
	poster.innerHTML = '<p class="poster__word" aria-hidden="true">TJ-Hosting <b>Lab</b></p><span class="poster__orb poster__orb--a"></span><span class="poster__orb poster__orb--b"></span><span class="poster__orb poster__orb--c"></span>';
	canvas.replaceWith(poster);
	const note = document.createElement('p');
	note.className = 'poster__note glass glass--pill';
	note.textContent = "This browser can't run WebGL, so here is a still picture.";
	screenEl.append(note);
	[scatterBtn, pauseBtn, iorIn, thickIn].forEach((el) => { el.disabled = true; });
	bindSlider(iorIn, document.getElementById('ior-out'), () => {}, 2)();
	bindSlider(thickIn, document.getElementById('thick-out'), () => {}, 1)();
}

/* wait (briefly) for the heading font, so the picture's letters are the real ones */
function fontReady() {
	const timeout = new Promise((r) => setTimeout(r, 1500));
	const load = document.fonts && document.fonts.load ? document.fonts.load(`900 100px ${FONT}`, 'TJ-Hosting Lab').catch(() => {}) : Promise.resolve();
	return Promise.race([load, timeout]);
}

/* ---------- start ---------- */
async function start() {
	await fontReady();
	fontsOk = !document.fonts || !document.fonts.check || document.fonts.check(`900 20px ${FONT}`);

	/* ask for a throw-away WebGL 2 context first, so a browser without it gets the still, not three.js's console errors */
	const probe = document.createElement('canvas').getContext('webgl2');
	if (!probe) {
		fallback();
		return;
	}
	probe.getExtension('WEBGL_lose_context')?.loseContext();
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
	} catch (err) {
		fallback();
		return;
	}
	const base = Math.min(1.5, window.devicePixelRatio || 1);
	const trs0 = innerWidth < 720 ? 0.6 : 1;
	DPR = base;
	renderer.setClearColor(0xeef7fc, 1);
	renderer.toneMapping = THREE.NoToneMapping;
	renderer.transmissionResolutionScale = trs0;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0, CAM_Z);
	camera.lookAt(0, 0, 0);

	planeMat = new THREE.ShaderMaterial({
		uniforms: {
			map: { value: null },
			uSize: { value: new THREE.Vector2(1, 1) },
			uOrb: { value: Array.from({ length: MAX_ORBS }, () => new THREE.Vector4()) },
			uDir: { value: Array.from({ length: MAX_ORBS }, () => new THREE.Vector4()) },
		},
		vertexShader: VERT,
		fragmentShader: FRAG,
	});
	plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMat);
	scene.add(plane);

	glass = new THREE.MeshPhysicalMaterial({
		color: 0xffffff,
		metalness: 0,
		roughness: 0.03,
		transmission: 1,
		ior: 1.45,
		thickness: 1.2,
		dispersion: 5,
		specularIntensity: 1,
		specularColor: 0xffffff,
		attenuationColor: new THREE.Color(0xa9d2ff),
		attenuationDistance: 12,
		envMapIntensity: 1,
		side: THREE.FrontSide,
	});
	buildEnv();
	makeOrbs();

	const syncIor = bindSlider(iorIn, document.getElementById('ior-out'), (v) => { glass.ior = v; }, 2);
	const syncThick = bindSlider(thickIn, document.getElementById('thick-out'), (v) => { glass.thickness = v; }, 1);
	syncIor();
	syncThick();

	/* if the window has no size yet, the resize observer below sets it up when it does */
	let placed = false;
	const place = () => {
		orbs.forEach((o) => { placeOrb(o, slotOf(o)); keepInside(o); });
		placed = true;
	};
	if (applySize()) place();
	if (!fontsOk && document.fonts && document.fonts.ready) {
		document.fonts.ready.then(() => { drawBackdrop(); dirty = true; if (REDUCED) renderNow(); });
	}

	canvas.addEventListener('webglcontextlost', (e) => {
		e.preventDefault();
		lost = true;
	});
	canvas.addEventListener('webglcontextrestored', () => {
		try {
			buildEnv();
			lost = false;
			dirty = true;
			if (REDUCED) renderNow();
		} catch (err) {
			lost = true;
		}
	});

	/* resize: re-measure, redraw the picture and keep the orbs where they were, as shares of the window */
	let sizedW = W;
	let sizedH = H;
	let timer = 0;
	const onResize = () => {
		if (canvas.clientWidth === sizedW && canvas.clientHeight === sizedH) return;
		const oldW = sizedW;
		const oldH = sizedH;
		if (!applySize()) return;
		sizedW = W;
		sizedH = H;
		if (!placed) place();
		else {
			for (const o of orbs) {
				o.bx *= W / oldW;
				o.by *= H / oldH;
				keepInside(o);
			}
		}
		for (const o of orbs) {
			o.rx = o.bx + o.ox;
			o.ry = o.by + o.oy;
		}
		dirty = true;
		if (REDUCED) renderNow();
	};
	new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(onResize, 120);
	}).observe(canvas);

	/* Scatter: a push in a random direction (a jump to a new arrangement under reduced motion) */
	scatterBtn.addEventListener('click', () => {
		if (REDUCED) {
			const slots = orbs.map(slotOf);
			for (let i = slots.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[slots[i], slots[j]] = [slots[j], slots[i]];
			}
			orbs.forEach((o, i) => {
				placeOrb(o, slots[i], 0.1);
				keepInside(o);
			});
			separate();
			orbs.forEach((o) => { o.rx = o.bx + o.ox; o.ry = o.by + o.oy; });
			renderNow();
			return;
		}
		if (paused) setPaused(false);
		for (const o of orbs) {
			const a = Math.random() * Math.PI * 2;
			const s = 520 + Math.random() * 420;
			o.vx += Math.cos(a) * s;
			o.vy += Math.sin(a) * s;
		}
		dirty = true;
	});

	if (REDUCED) {
		/* one characteristic frame: the orbs at rest around the words, drift caught mid-way; nothing loops */
		t = 5.3;
		orbs.forEach((o) => { idleOffsets(o, t); o.ang = o.a + o.oa; o.rx = o.bx + o.ox; o.ry = o.by + o.oy; });
		renderNow();
		pauseBtn.disabled = true;
		return;
	}

	/* the loop: motion, then the one render. Slow devices step down the pixel ratio and the transmission size. */
	let frames = 0;
	const samples = [];
	loop(canvas, (dt) => {
		if (lost) return;
		if (paused && !drag && !dirty) return;
		if (!paused) t += dt;
		step(dt);
		syncMeshes();
		renderer.render(scene, camera);
		dirty = false;

		frames++;
		if (frames > 40 && quality < 2) {
			samples.push(dt);
			if (samples.length >= 60) {
				samples.sort((a, b) => a - b);
				if (samples[30] > 0.026) {
					quality++;
					DPR = Math.max(1, base * (quality === 1 ? 0.8 : 0.6));
					renderer.transmissionResolutionScale = trs0 * (quality === 1 ? 0.75 : 0.5);
					applySize();
					dirty = true;
				}
				samples.length = 0;
				frames = 20;
			}
		}
	}, { name: 'glass-orbs' });

	pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));
}

/* Pause freezes the drift and the glide; dragging an orb and the sliders still work, and draw */
function setPaused(v) {
	paused = v;
	pauseBtn.setAttribute('aria-pressed', String(v));
	pauseBtn.textContent = v ? 'Play' : 'Pause';
	if (!v) dirty = true;
}

boot();
start().catch(() => {
	/* anything that goes wrong while setting up WebGL ends in the still picture, not a blank window */
	if (!document.querySelector('.poster')) fallback();
});
