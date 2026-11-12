/*
 * Sample 46 — "Edge Network Globe".
 * A dotted globe with glowing arcs from a Toronto hub to ten world cities, and pulses that run along them.
 * COBE draws the globe, its markers and its arcs in WebGL. The 2.0.1 build has no loop of its own: update() paints
 * one frame, so one loop() from js/lab.js turns the globe, paints it, then draws the pulses on a 2D canvas and moves
 * the city chips (plain DOM, transform and opacity only) with the same turn angles. Nothing runs off-screen, in a
 * hidden tab or under reduced motion; there the globe is painted once, or once per drag or key press.
 * It is not a real network: the arcs are for show, and the page says so.
 *
 * Uses COBE (cobe@2.0.1) by Shu Ding, https://github.com/shuding/cobe, MIT. The library is imported unmodified from
 * vendor/cobe@2.0.1/. What is adapted from its source: the latitude/longitude to unit-vector function, the rotation
 * and screen projection, the "visible" test and the arc curve (a quadratic curve, lifted by markerElevation and
 * arcHeight), so the chips and pulses sit exactly on the globe's own markers and arcs. Its CSS-anchor ids are not used.
 *
 * MIT License
 *
 * Copyright (c) 2021 Shu Ding
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
import createGlobe from '../../vendor/cobe@2.0.1/index.esm.js';

const { PI, sin, cos, atan2, sqrt, exp, min, max } = Math;
const REDUCED = prefersReducedMotion();

const screenEl = document.querySelector('.piece-screen');
const infoEl = document.querySelector('.sample-info');
const globeEl = document.querySelector('.globe');
const canvas = document.querySelector('.piece');
const overlay = document.querySelector('.pulses');
const chipsEl = document.querySelector('.chips');
const fallbackEl = document.querySelector('.globe-fallback');
const pingBtn = document.querySelector('[data-action="ping"]');
const labelsBtn = document.querySelector('[data-action="labels"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const octx = overlay.getContext('2d');

/* ---------- the places: plain facts, latitude and longitude in degrees (an illustration, not a network map) ---------- */

const HUB = { name: 'Toronto', at: [43.65, -79.38] };
const CITIES = [
	{ name: 'Mexico City', at: [19.43, -99.13] },
	{ name: 'São Paulo', at: [-23.55, -46.63] },
	{ name: 'London', at: [51.51, -0.13] },
	{ name: 'Lagos', at: [6.52, 3.38] },
	{ name: 'Johannesburg', at: [-26.2, 28.05] },
	{ name: 'Dubai', at: [25.2, 55.27] },
	{ name: 'Mumbai', at: [19.08, 72.88] },
	{ name: 'Singapore', at: [1.35, 103.82] },
	{ name: 'Tokyo', at: [35.68, 139.65] },
	{ name: 'Sydney', at: [-33.87, 151.21] },
];

/* the artwork palette: cyan, azure, royal on navy, white for the hot spots */
const CYAN = [0.275, 0.816, 0.984];
const WHITE = [0.92, 0.97, 1];

/* ---------- COBE's own geometry, rebuilt so the overlay matches it (see the header) ---------- */

const SURFACE = 0.8; // the globe's radius in its own units
const ELEVATION = 0.05; // markerElevation
const ARC_HEIGHT = 0.4; // arcHeight

function toVec([lat, lng]) {
	const r = (lat * PI) / 180;
	const a = (lng * PI) / 180 - PI;
	const c = cos(r);
	return [-c * cos(a), sin(r), c * sin(a)];
}
const scaled = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v) => {
	const l = sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
	return [v[0] / l, v[1] / l, v[2] / l];
};

const hubVec = toVec(HUB.at);
const places = [HUB, ...CITIES].map((p, i) => {
	const v = toVec(p.at);
	// a local frame on the sphere for the arrival ripple
	const e1 = unit(cross(Math.abs(v[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0], v));
	return { ...p, v, e1, e2: cross(v, e1), hub: i === 0 };
});

/* an arc: the quadratic curve COBE draws between two places */
const arcs = CITIES.map((c, i) => {
	const to = places[i + 1].v;
	const k = SURFACE + ELEVATION;
	const mid = unit([hubVec[0] + to[0], hubVec[1] + to[1], hubVec[2] + to[2]]);
	return { d: scaled(hubVec, k), o: scaled(mid, SURFACE + ARC_HEIGHT + ELEVATION), e: scaled(to, k), period: 3.4 + (i % 3) * 0.3, offset: i * 0.41 };
});
function arcPoint(a, u) {
	const m = 1 - u;
	const k0 = m * m;
	const k1 = 2 * m * u;
	const k2 = u * u;
	return [k0 * a.d[0] + k1 * a.o[0] + k2 * a.e[0], k0 * a.d[1] + k1 * a.o[1] + k2 * a.e[1], k0 * a.d[2] + k1 * a.o[2] + k2 * a.e[2]];
}

/* ---------- the view: where the globe sits in its box, and how it is turned ---------- */

const view = { cw: 0, ch: 0, dpr: 1, scale: 1, radius: 1, aspect: 1, phone: false };
const rot = { cp: 1, sp: 0, ct: 1, st: 0 };
const state = { phi: 0, theta: 0, spin: 0, vel: 0, idle: 9, T: 0, drag: false };
const THETA_REST = 0.35;
const SPIN = 0.11; // radians per second, a turn in a minute
state.phi = atan2(hubVec[0], hubVec[2]) - 0.8; // Toronto left of centre, the Atlantic in the middle
state.theta = THETA_REST;

function setRotation() {
	rot.cp = cos(state.phi);
	rot.sp = sin(state.phi);
	rot.ct = cos(state.theta);
	rot.st = sin(state.theta);
}
/* a point on or above the globe → pixels in the globe's box, depth, and whether it is seen (not behind the ball) */
function toScreen(p, out) {
	const { cp, sp, ct, st } = rot;
	const x = cp * p[0] + sp * p[2];
	const y = sp * st * p[0] + ct * p[1] - cp * st * p[2];
	const z = -sp * ct * p[0] + st * p[1] + cp * ct * p[2];
	out.x = (((x / view.aspect) * view.scale + 1) / 2) * view.cw;
	out.y = ((1 - y * view.scale) / 2) * view.ch;
	out.z = z;
	out.vis = z >= 0 || x * x + y * y >= SURFACE * SURFACE;
	return out;
}

/* ---------- the globe ---------- */

function hasWebGL() {
	const probe = document.createElement('canvas');
	const gl = probe.getContext('webgl2') || probe.getContext('webgl');
	if (!gl) return false;
	gl.getExtension('WEBGL_lose_context')?.loseContext();
	return true;
}

let globe = null;

function measure() {
	// keep the globe clear of the fixed panel: put it beside the panel if that gives the bigger ball, else above it
	const sr = screenEl.getBoundingClientRect();
	const pr = infoEl.getBoundingClientRect();
	const fullW = sr.width;
	const fullH = sr.height - 34;
	const left = max(0, pr.right - sr.left - 50); // the box may run under the panel: the ball is smaller than its box
	const bottom = max(0, sr.bottom - pr.top + 10);
	const beside = min(fullW - left, fullH);
	const above = min(fullW, fullH - bottom);
	if (beside >= above) {
		screenEl.style.setProperty('--gl', `${Math.round(left)}px`);
		screenEl.style.setProperty('--gb', '0px');
	} else {
		screenEl.style.setProperty('--gl', '0px');
		screenEl.style.setProperty('--gb', `${Math.round(bottom)}px`);
	}
	view.cw = max(160, globeEl.clientWidth);
	view.ch = max(160, globeEl.clientHeight);
	view.phone = innerWidth < 720;
	view.dpr = min(1.5, window.devicePixelRatio || 1);
	view.aspect = view.cw / view.ch;
	// the ball takes 74% of the shorter side, which leaves room for the arcs that rise above it
	const diameter = 0.74 * min(view.cw, view.ch);
	view.scale = diameter / (SURFACE * view.ch);
	view.radius = diameter / 2;
	overlay.width = Math.round(view.cw * view.dpr);
	overlay.height = Math.round(view.ch * view.dpr);
	octx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
}

function globeOptions() {
	return {
		width: view.cw,
		height: view.ch,
		devicePixelRatio: view.dpr,
		phi: state.phi,
		theta: state.theta,
		scale: view.scale,
		dark: 0.9,
		diffuse: 1.2,
		mapSamples: view.phone ? 7000 : 14000,
		mapBrightness: 5,
		mapBaseBrightness: 0.06,
		baseColor: [0.11, 0.33, 0.5],
		glowColor: [0.12, 0.36, 0.8],
		markerColor: CYAN,
		arcColor: CYAN,
		arcWidth: 0.9,
		arcHeight: ARC_HEIGHT,
		markerElevation: ELEVATION,
		markers: places.map((p) => ({ location: p.at, size: p.hub ? 0.075 : 0.035, color: p.hub ? WHITE : CYAN })),
		arcs: CITIES.map((c) => ({ from: HUB.at, to: c.at })),
	};
}

/* ---------- the pulses (a 2D canvas over the globe) ---------- */

const TRAVEL = 1.6; // seconds from the hub to a city
const RIPPLE = 1.1; // seconds for the ring that opens on arrival
const pingAt = arcs.map(() => -99);
const sprite = (() => {
	const s = document.createElement('canvas');
	s.width = s.height = 64;
	const g = s.getContext('2d');
	const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	grad.addColorStop(0, 'rgba(235, 250, 255, 1)');
	grad.addColorStop(0.25, 'rgba(120, 225, 255, 0.6)');
	grad.addColorStop(1, 'rgba(70, 208, 251, 0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, 64, 64);
	return s;
})();
const ease = (u) => (1 - cos(PI * u)) / 2;
const pt = { x: 0, y: 0, z: 0, vis: false };
const pt2 = { x: 0, y: 0, z: 0, vis: false };

function glow(x, y, r, alpha) {
	octx.globalAlpha = alpha;
	octx.drawImage(sprite, x - r, y - r, 2 * r, 2 * r);
}

/* one launch of arc i, tt seconds after it left the hub (boost > 1 for a ping) */
function drawLaunch(i, tt, boost) {
	if (tt < 0) return;
	const a = arcs[i];
	if (tt < TRAVEL) {
		const u = ease(tt / TRAVEL);
		// a trail: short segments behind the head, fading
		const steps = 9;
		let prev = toScreen(arcPoint(a, u), pt);
		let px = prev.x;
		let py = prev.y;
		let pv = prev.vis;
		octx.lineCap = 'round';
		for (let s = 1; s <= steps; s++) {
			const uu = max(0, u - (s * 0.2) / steps);
			const q = toScreen(arcPoint(a, uu), pt2);
			if (pv && q.vis) {
				const f = 1 - s / (steps + 1);
				octx.globalAlpha = f * f * 0.9;
				octx.strokeStyle = '#46d0fb';
				octx.lineWidth = (1.2 + 3 * f) * boost;
				octx.beginPath();
				octx.moveTo(px, py);
				octx.lineTo(q.x, q.y);
				octx.stroke();
			}
			px = q.x;
			py = q.y;
			pv = q.vis;
		}
		const h = toScreen(arcPoint(a, u), pt);
		if (h.vis) {
			glow(h.x, h.y, (view.phone ? 12 : 17) * boost, 1);
			octx.globalAlpha = 1;
			octx.fillStyle = '#ffffff';
			octx.beginPath();
			octx.arc(h.x, h.y, 2.6 * boost, 0, 2 * PI);
			octx.fill();
		}
	} else if (tt < TRAVEL + RIPPLE) {
		const p = (tt - TRAVEL) / RIPPLE;
		const pl = places[i + 1];
		const ang = 0.02 + 0.16 * (1 - (1 - p) * (1 - p) * (1 - p));
		const ca = cos(ang);
		const sa = sin(ang);
		const rad = SURFACE + ELEVATION * 0.4;
		octx.globalAlpha = (1 - p) * (1 - p) * min(1, boost);
		octx.strokeStyle = '#9be8ff';
		octx.lineWidth = 2;
		octx.beginPath();
		let pen = false;
		for (let s = 0; s <= 40; s++) {
			const b = (s / 40) * 2 * PI;
			const cb = cos(b) * sa;
			const sb = sin(b) * sa;
			const w = [(pl.v[0] * ca + pl.e1[0] * cb + pl.e2[0] * sb) * rad, (pl.v[1] * ca + pl.e1[1] * cb + pl.e2[1] * sb) * rad, (pl.v[2] * ca + pl.e1[2] * cb + pl.e2[2] * sb) * rad];
			const q = toScreen(w, pt);
			if (q.vis) {
				if (pen) octx.lineTo(q.x, q.y);
				else octx.moveTo(q.x, q.y);
				pen = true;
			} else pen = false;
		}
		octx.stroke();
		// a soft flash where it lands
		const c = toScreen(scaled(pl.v, SURFACE + ELEVATION), pt);
		if (c.vis) glow(c.x, c.y, 16 * (1 - p) + 6, (1 - p) * 0.7);
	}
}

function drawPulses() {
	octx.clearRect(0, 0, view.cw, view.ch);
	octx.globalCompositeOperation = 'lighter';
	const T = state.T;
	// the hub breathes
	const hub = toScreen(scaled(hubVec, SURFACE + ELEVATION), pt);
	if (hub.vis) glow(hub.x, hub.y, 20 + 4 * sin(T * 2.2), 0.55);
	for (let i = 0; i < arcs.length; i++) {
		const a = arcs[i];
		drawLaunch(i, (T + a.offset) % a.period, 1);
		drawLaunch(i, T - pingAt[i], 1.35);
	}
	octx.globalAlpha = 1;
	octx.globalCompositeOperation = 'source-over';
}

/* ---------- the city chips (plain DOM: left and top stay 0, the transform does the moving) ---------- */

const smooth = (a, b, x) => {
	const t = min(1, max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const chips = places.map((p) => {
	const el = document.createElement('span');
	el.className = p.hub ? 'chip chip--hub' : 'chip';
	el.textContent = p.name;
	chipsEl.append(el);
	return { el, v: scaled(p.v, SURFACE + ELEVATION), gap: p.hub ? 40 : 24, last: '' };
});
let labelsOn = true;

function placeChips() {
	const front = view.phone ? [0.24, 0.46] : [0.1, 0.32];
	for (const c of chips) {
		const q = toScreen(c.v, pt);
		const zn = q.z / (SURFACE + ELEVATION);
		const op = labelsOn ? (q.vis ? smooth(front[0], front[1], zn) : 0) : 0;
		// the chip sits outside the marker, on the side away from the middle; it swaps sides smoothly near the middle
		const s = smooth(0, 1, 0.5 + (q.x - view.cw / 2) / (view.radius * 0.5));
		const gap = (s - 0.5) * c.gap; // the hub marker is bigger, so its chip stands further off
		const tf = `translate3d(${(q.x + gap).toFixed(1)}px, ${q.y.toFixed(1)}px, 0) translate(${(-(1 - s) * 100).toFixed(1)}%, -50%)`;
		if (tf !== c.last) {
			c.el.style.transform = tf;
			c.last = tf;
		}
		c.el.style.opacity = op < 0.01 ? '0' : op.toFixed(2);
	}
}

/* ---------- one frame ---------- */

function render() {
	setRotation();
	globe.update({ phi: state.phi, theta: state.theta });
	drawPulses();
	placeChips();
}

function advance(dt) {
	state.T += dt;
	state.idle += dt;
	const resting = !state.drag && state.idle > 1.8;
	// the spin eases to a stop when you grab the globe and eases back in after you let go
	state.spin += ((resting ? SPIN : 0) - state.spin) * (1 - exp(-dt * 1.6));
	state.vel *= exp(-dt * (state.drag ? 9 : 2.4));
	if (!state.drag) {
		state.phi += (state.spin + state.vel) * dt;
		if (resting) state.theta += (THETA_REST - state.theta) * (1 - exp(-dt * 0.7));
	}
}

/* the reduced-motion still: every arc drawn, pulses frozen part-way, a few rings open */
function stillFrame() {
	state.T = 4.4;
	render();
	// the map texture arrives a moment after the globe is created, so paint again as it lands (no animation, only a repaint)
	[90, 300, 800].forEach((ms) => setTimeout(render, ms));
}

/* ---------- start ---------- */

let ctl = null;
let relayoutTimer = 0;

function relayout() {
	measure();
	if (!globe) return;
	globe.update({ width: view.cw, height: view.ch, scale: view.scale });
	if (!ctl || !ctl.running) render();
}

function start() {
	boot();
	measure();
	addEventListener('resize', () => {
		clearTimeout(relayoutTimer);
		relayoutTimer = setTimeout(relayout, 120);
	});
	// the panel can fold away, which changes how much room the globe has
	new ResizeObserver(() => {
		clearTimeout(relayoutTimer);
		relayoutTimer = setTimeout(relayout, 120);
	}).observe(infoEl);
	if (!hasWebGL()) {
		// no WebGL: a flat picture and a note, kept clear of the panel like the globe is
		globeEl.hidden = true;
		fallbackEl.hidden = false;
		document.querySelector('.hint')?.setAttribute('hidden', '');
		[pingBtn, labelsBtn, pauseBtn].forEach((b) => { b.disabled = true; });
		return;
	}
	globe = createGlobe(canvas, globeOptions());

	// turning it: drag, or the arrow keys
	let pointer = null;
	const touched = () => {
		state.idle = 0;
		if (!ctl || !ctl.running) render();
	};
	globeEl.addEventListener('pointerdown', (e) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
		state.drag = true;
		globeEl.setPointerCapture(e.pointerId);
		globeEl.classList.add('is-dragging');
		state.idle = 0;
	});
	globeEl.addEventListener('pointermove', (e) => {
		if (!pointer || e.pointerId !== pointer.id) return;
		const now = performance.now();
		const dx = e.clientX - pointer.x;
		const dy = e.clientY - pointer.y;
		const secs = max(0.008, (now - pointer.t) / 1000);
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.t = now;
		state.phi += dx / view.radius;
		state.theta = min(1.1, max(-1.1, state.theta + dy / view.radius));
		state.vel = REDUCED ? 0 : min(5, max(-5, state.vel * 0.5 + (dx / view.radius / secs) * 0.5));
		touched();
	});
	const release = (e) => {
		if (!pointer || (e && e.pointerId !== pointer.id)) return;
		pointer = null;
		state.drag = false;
		globeEl.classList.remove('is-dragging');
		state.idle = 0;
	};
	globeEl.addEventListener('pointerup', release);
	globeEl.addEventListener('pointercancel', release);
	globeEl.addEventListener('lostpointercapture', release);
	globeEl.addEventListener('keydown', (e) => {
		const step = { ArrowLeft: [-0.16, 0], ArrowRight: [0.16, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
		if (!step) return;
		e.preventDefault();
		state.phi += step[0];
		state.theta = min(1.1, max(-1.1, state.theta + step[1]));
		touched();
	});

	labelsBtn.addEventListener('click', () => {
		labelsOn = labelsBtn.getAttribute('aria-pressed') !== 'true';
		labelsBtn.setAttribute('aria-pressed', String(labelsOn));
		chipsEl.hidden = !labelsOn;
		if (!ctl || !ctl.running) render();
	});

	if (REDUCED) {
		// one still frame: no loop, nothing that starts motion
		pingBtn.disabled = true;
		pauseBtn.disabled = true;
		stillFrame();
		return;
	}

	// loop() runs only while the globe is on screen, the tab is visible and motion is allowed;
	// COBE has no loop of its own, so no WebGL work happens anywhere else
	ctl = loop(globeEl, (dt) => {
		advance(dt);
		render();
	}, { name: 'edge-network-globe' });

	pingBtn.addEventListener('click', () => {
		arcs.forEach((a, i) => { pingAt[i] = state.T + i * 0.09; });
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		pingBtn.disabled = paused;
		if (paused) ctl.stop(); else ctl.start();
	});
	// the first frame, before the loop's observer has reported
	render();
	[90, 300].forEach((ms) => setTimeout(() => { if (!ctl.running) render(); }, ms));
}

start();
