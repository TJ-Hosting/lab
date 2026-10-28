/*
 * Sample 48 — "Wind snapshot".
 * Forty-eight hours of global wind, 20 to 22 November 2016, as a time-lapse on a world map. wind-gl keeps tens of thousands of
 * particles in GPU textures and moves them through a wind field stored as a picture; the colour shows the speed (cyan, then white,
 * then amber). The library only knows one wind field at a time, so the nine saved maps (one every six hours) are blended here:
 * the two maps either side of "now" are mixed pixel by pixel on the CPU, re-encoded with one shared range, and written into the
 * library's wind texture a few times a second. The trails carry the change from one moment to the next.
 * One loop() from js/lab.js draws every frame (wind-gl has no loop of its own: draw() paints one step), so nothing runs
 * off-screen, in a hidden tab or under reduced motion; there the trails are run for a moment off-screen and drawn once.
 * Coastlines are drawn from the Natural Earth file on a 2D canvas under the WebGL canvas, in the same equirectangular frame.
 * This is saved data from the past, not live weather, and the page says so.
 *
 * Uses wind-gl (the "webgl-wind" repo, commit b1f6468), https://github.com/mapbox/webgl-wind, ISC. The library and the nine
 * GFS wind frames (NOAA data, as encoded and shipped by that repo) are used unmodified from vendor/wind-gl@b1f6468/.
 * The coastlines are Natural Earth 1:110m (public domain), unmodified, from vendor/natural-earth@ca96624/.
 * Everything else in this file (the frame blending, the layout, the time bar, the loop and the still frame) is new code.
 *
 * ISC License
 *
 * Copyright (c) 2016, Mapbox
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const { min, max, round, floor, hypot, exp, cos, PI } = Math;
const REDUCED = prefersReducedMotion();

/* ---------- the data: nine GFS 10 m wind frames, 6-hourly (the repo's JSON "date" fields are malformed, so the times come from the names) ---------- */

const WIND_DIR = '../../vendor/wind-gl@b1f6468/wind/';
const COAST_URL = '../../vendor/natural-earth@ca96624/ne_110m_coastline.geojson';
const STAMPS = ['2016112000', '2016112006', '2016112012', '2016112018', '2016112100', '2016112106', '2016112112', '2016112118', '2016112200'];
const LAST = STAMPS.length - 1;
const GW = 360; // the textures are 360 x 180: one pixel per degree, longitude 180 W to 180 E, latitude 90 N to 90 S
const GH = 180;
const CELLS = GW * GH;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad2 = (n) => String(n).padStart(2, '0');
const frameDate = (i) => new Date(Date.UTC(+STAMPS[i].slice(0, 4), +STAMPS[i].slice(4, 6) - 1, +STAMPS[i].slice(6, 8), +STAMPS[i].slice(8, 10)));
const frameText = (i) => {
	const d = frameDate(i);
	return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${pad2(d.getUTCHours())}:00 UTC`;
};

/* ---------- the look ---------- */

/* the colour ramp, by speed as a share of the field's top speed (t 1 = about 35 m/s): cyan, white, then the honey amber */
const RAMP = [
	[0.0, '#123f86'],
	[0.08, '#1f6fcb'],
	[0.18, '#3fc4f7'],
	[0.3, '#c9f2ff'],
	[0.38, '#ffffff'],
	[0.52, '#ffd98a'],
	[0.64, '#ffb547'],
	[1.0, '#ff8a3d'],
];
const FADE = 0.984; // how fast a trail fades each step
const SPEED = 0.3; // how far a particle moves each step
const STEP_HZ = 60; // the simulation runs at 60 steps a second on any screen
const SECS_PER_FRAME = 3; // a saved map every three seconds: the 48 hours run in 24 s
const DENSE = 65536; // 256 x 256 particles
const LIGHT = 16384; // 128 x 128, for phones
const PAD = 12; // the time bar's end padding, as in piece.css (--pad)

/* ---------- elements ---------- */

const screenEl = document.querySelector('.piece-screen');
const infoEl = document.querySelector('.sample-info');
const viewEl = document.querySelector('.map-view');
const mapEl = document.querySelector('.map');
const coastCanvas = document.querySelector('.coast');
const windCanvas = document.querySelector('.wind');
const captionEl = document.querySelector('.caption');
const dockEl = document.querySelector('.dock');
const noteEl = document.querySelector('.note');
const scrubEl = document.querySelector('.scrub');
const thumbEl = document.querySelector('.scrub__thumb');
const fillEl = document.querySelector('.scrub__fill');
const readoutEl = document.querySelector('[data-readout]');
const frameEl = document.querySelector('[data-frame]');
const rampEl = document.querySelector('[data-ramp]');
const dayEl = document.querySelector('[data-day]');
const hourEl = document.querySelector('[data-hour]');
const stepBtn = document.querySelector('[data-action="step"]');
const denseBtn = document.querySelector('[data-action="dense"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const BAR = 34; // the window bar above the map

/* ---------- state ---------- */

const view = { w: 0, h: 0, mapW: 0, mapH: 0, mapTop: 0, panX: 0, dpr: 1, pannable: false, phone: false, centerLon: -40 };
const clock = { t: 0, tween: null, hold: 0, scrubbing: false, uploaded: -1, upAt: 0, railW: 1, thumbX: -1, shown: -1 };
let frames = null; // per frame: u and v as floats already scaled to 0..255 in the shared range
let range = null; // the shared range: { uMin, uMax, vMin, vMax, top } (top = length of the top-right corner, the library's speed scale)
let wind = null; // the WindGL instance
let gl = null;
let glLost = false;
let ctl = null; // the loop controller (null under reduced motion)
let paused = false;
let nudgeUntil = 0;
let dense = true;
let accum = 0;
let slow = 0; // frames seen slower than 26 ms, for the one-time step down to fewer particles
let seen = 0;
let coastJson = null;

const buf = new ArrayBuffer(CELLS * 4);
const bytes = new Uint8Array(buf);
const field = new ImageData(new Uint8ClampedArray(buf), GW, GH); // the blended wind, as the library wants it: u in R, v in G
for (let i = 3; i < bytes.length; i += 4) bytes[i] = 255;

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const ease = (u) => (1 - cos(PI * u)) / 2;
const now = () => performance.now() / 1000;

/* ---------- loading ---------- */

function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`could not load ${url}`));
		img.src = url;
	});
}

async function loadFrames() {
	const read = document.createElement('canvas');
	read.width = GW;
	read.height = GH;
	const rx = read.getContext('2d', { willReadFrequently: true });
	const raw = await Promise.all(STAMPS.map(async (s) => {
		const [meta, img] = await Promise.all([
			fetch(`${WIND_DIR}${s}.json`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
			loadImage(`${WIND_DIR}${s}.png`),
		]);
		return { meta, img };
	}));
	// the shared range covers every frame, so one encoding (and one colour scale) serves the whole time-lapse
	const r = { uMin: Infinity, uMax: -Infinity, vMin: Infinity, vMax: -Infinity };
	raw.forEach(({ meta }) => {
		r.uMin = min(r.uMin, meta.uMin);
		r.uMax = max(r.uMax, meta.uMax);
		r.vMin = min(r.vMin, meta.vMin);
		r.vMax = max(r.vMax, meta.vMax);
	});
	r.top = hypot(r.uMax, r.vMax);
	const ku = 255 / (r.uMax - r.uMin);
	const kv = 255 / (r.vMax - r.vMin);
	const out = raw.map(({ meta, img }) => {
		rx.clearRect(0, 0, GW, GH);
		rx.drawImage(img, 0, 0, GW, GH);
		const px = rx.getImageData(0, 0, GW, GH).data;
		const u = new Float32Array(CELLS);
		const v = new Float32Array(CELLS);
		for (let k = 0; k < CELLS; k++) {
			// decode this frame's own range to metres per second, then to the shared range
			const mu = meta.uMin + ((meta.uMax - meta.uMin) * px[k * 4]) / 255;
			const mv = meta.vMin + ((meta.vMax - meta.vMin) * px[k * 4 + 1]) / 255;
			u[k] = (mu - r.uMin) * ku;
			v[k] = (mv - r.vMin) * kv;
		}
		return { u, v };
	});
	return { out, r };
}

/* ---------- blending: the wind at time t (0 to 8, in saved maps) ---------- */

function blendInto(t) {
	const i0 = min(LAST - 1, floor(t));
	const w = t - i0;
	const A = frames[i0];
	const B = frames[i0 + 1];
	for (let k = 0, p = 0; k < CELLS; k++, p += 4) {
		bytes[p] = A.u[k] + (B.u[k] - A.u[k]) * w + 0.5;
		bytes[p + 1] = A.v[k] + (B.v[k] - A.v[k]) * w + 0.5;
	}
}

/* write the wind at time t into the library's texture (the library only ever sees one field) */
function uploadField(t) {
	if (!gl || !wind || !frames) return;
	blendInto(t);
	gl.bindTexture(gl.TEXTURE_2D, wind.windTexture);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GW, GH, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
	gl.bindTexture(gl.TEXTURE_2D, null);
	clock.uploaded = t;
	clock.upAt = now();
}

/* ---------- the colour ramp, shared by the particles and the legend ---------- */

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function rampColor(t) {
	let i = 0;
	while (i < RAMP.length - 2 && t > RAMP[i + 1][0]) i++;
	const [a, ca] = RAMP[i];
	const [b, cb] = RAMP[i + 1];
	const f = clamp((t - a) / (b - a), 0, 1);
	const x = hex(ca);
	const y = hex(cb);
	return `rgb(${round(x[0] + (y[0] - x[0]) * f)}, ${round(x[1] + (y[1] - x[1]) * f)}, ${round(x[2] + (y[2] - x[2]) * f)})`;
}
function paintLegend() {
	const stops = [];
	for (let s = 0; s <= 30; s += 2.5) stops.push(`${rampColor(s / range.top)} ${((s / 30) * 100).toFixed(1)}%`);
	rampEl.style.background = `linear-gradient(90deg, ${stops.join(', ')})`;
}

/* ---------- WebGL ---------- */

function buildWind() {
	gl = windCanvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, stencil: false });
	if (!gl || !window.WindGL) return false;
	if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 1) return false;
	const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
	if (!hp || hp.precision < 1) return false;
	try {
		wind = new window.WindGL(gl);
		wind.fadeOpacity = FADE;
		wind.dropRate = 0.003;
		wind.dropRateBump = 0.01;
		const ramp = {};
		RAMP.forEach(([stop, color]) => { ramp[stop] = color; });
		wind.setColorRamp(ramp);
		blendInto(clock.t);
		wind.setWind({ image: field, width: GW, height: GH, uMin: range.uMin, uMax: range.uMax, vMin: range.vMin, vMax: range.vMax });
		clock.uploaded = clock.t;
		wind.numParticles = dense ? DENSE : LIGHT;
	} catch (err) {
		wind = null;
		return false;
	}
	setSpeed();
	return true;
}

/* the library never frees what it replaces, so the old textures are deleted here before a new one is made */
function setParticles(n) {
	if (wind.particleStateTexture0) {
		gl.deleteTexture(wind.particleStateTexture0);
		gl.deleteTexture(wind.particleStateTexture1);
		gl.deleteBuffer(wind.particleIndexBuffer);
	}
	wind.numParticles = n;
}
function clearTrails() {
	gl.deleteTexture(wind.backgroundTexture);
	gl.deleteTexture(wind.screenTexture);
	wind.resize();
}
function setSpeed() {
	// a smaller map covers fewer pixels per step, so the particles take a little longer steps there
	if (wind) wind.speedFactor = SPEED * min(1.6, 1168 / max(300, view.mapW));
}

/* run n simulation steps now, for at most `ms` (the first frame, and the still under reduced motion) */
function runSteps(n, ms) {
	if (!wind || glLost) return;
	const t0 = performance.now();
	for (let i = 0; i < n; i++) {
		wind.draw();
		if (performance.now() - t0 > ms) break;
	}
}

/* ---------- the map: layout, coastlines ---------- */

function layout() {
	const sr = screenEl.getBoundingClientRect();
	const pr = infoEl.getBoundingClientRect();
	view.w = sr.width;
	view.h = sr.height - BAR;
	view.phone = innerWidth < 720;
	// the dock sits beside the panel when it has the room, and above it otherwise
	const panelRight = max(0, pr.right - sr.left);
	const beside = view.w - panelRight - 32 >= 430;
	const dl = beside ? panelRight + 16 : 12;
	const dr = beside ? 16 : 12;
	const db = beside ? 16 : clamp(sr.bottom - pr.top + 10, 12, sr.height * 0.8);
	screenEl.style.setProperty('--dl', `${round(dl)}px`);
	screenEl.style.setProperty('--dr', `${dr}px`);
	screenEl.style.setProperty('--db', `${round(db)}px`);

	const plain = screenEl.classList.contains('is-plain');
	const top = captionEl.offsetTop + captionEl.offsetHeight - BAR + 8;
	const dockTop = plain ? view.h - 8 : view.h - db - dockEl.offsetHeight - 8;
	const bottomLimit = plain ? view.h - (beside ? 70 : db + 64) : dockTop;
	const availH = max(110, bottomLimit - top);
	// wide enough: the whole world fits the width; a phone gets a taller map than the width allows and pans it sideways
	let mapH = view.w >= 560 ? min(availH, (view.w - 32) / 2) : min(availH, 340);
	mapH = max(110, floor(mapH));
	view.mapH = mapH;
	view.mapW = mapH * 2;
	view.mapTop = round(top + min(60, max(0, (availH - mapH) / 2)));
	view.pannable = view.mapW > view.w - 4;
	view.dpr = min(1.5, window.devicePixelRatio || 1);

	mapEl.style.setProperty('--mw', `${view.mapW}px`);
	mapEl.style.setProperty('--mh', `${view.mapH}px`);
	viewEl.style.setProperty('--mb', `${view.mapTop + view.mapH}px`);
	viewEl.classList.toggle('is-pannable', view.pannable);
	if (view.pannable) viewEl.tabIndex = 0;
	else viewEl.removeAttribute('tabindex');
	// keep the same longitude in the middle of the window after a resize
	view.panX = view.pannable ? clamp(view.w / 2 - ((view.centerLon + 180) / 360) * view.mapW, view.w - view.mapW, 0) : (view.w - view.mapW) / 2;
	placeMap();

	const cw = round(view.mapW * view.dpr);
	const ch = round(view.mapH * view.dpr);
	const resized = windCanvas.width !== cw || windCanvas.height !== ch;
	if (resized) {
		coastCanvas.width = windCanvas.width = cw;
		coastCanvas.height = windCanvas.height = ch;
		drawCoast();
		if (wind && !glLost) clearTrails();
	}
	setSpeed();
	clock.railW = max(1, scrubEl.clientWidth - 2 * PAD);
	clock.thumbX = -1;
	paintClock();
	return resized;
}

function placeMap() {
	mapEl.style.transform = `translate3d(${view.panX.toFixed(1)}px, ${view.mapTop}px, 0)`;
}

function drawCoast() {
	const ctx = coastCanvas.getContext('2d');
	const W = view.mapW;
	const H = view.mapH;
	ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
	ctx.clearRect(0, 0, W, H);
	const X = (lon) => ((lon + 180) / 360) * W;
	const Y = (lat) => ((90 - lat) / 180) * H;
	// a faint graticule every 30 degrees, the equator a little stronger
	ctx.lineWidth = 1;
	for (let lon = -150; lon <= 150; lon += 30) {
		ctx.strokeStyle = 'rgba(120, 170, 235, 0.08)';
		ctx.beginPath();
		ctx.moveTo(round(X(lon)) + 0.5, 0);
		ctx.lineTo(round(X(lon)) + 0.5, H);
		ctx.stroke();
	}
	for (let lat = -60; lat <= 60; lat += 30) {
		ctx.strokeStyle = lat === 0 ? 'rgba(120, 170, 235, 0.16)' : 'rgba(120, 170, 235, 0.08)';
		ctx.beginPath();
		ctx.moveTo(0, round(Y(lat)) + 0.5);
		ctx.lineTo(W, round(Y(lat)) + 0.5);
		ctx.stroke();
	}
	if (!coastJson) return;
	// the coastlines: a soft azure line (a wide faint pass under a thin one); a line that crosses the date line is broken
	const trace = () => {
		ctx.beginPath();
		for (const f of coastJson.features) {
			const line = f.geometry.coordinates;
			for (let j = 0; j < line.length; j++) {
				const p = line[j];
				if (j && Math.abs(p[0] - line[j - 1][0]) < 180) ctx.lineTo(X(p[0]), Y(p[1]));
				else ctx.moveTo(X(p[0]), Y(p[1]));
			}
		}
	};
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	trace();
	ctx.strokeStyle = 'rgba(77, 159, 243, 0.2)';
	ctx.lineWidth = 3.4;
	ctx.stroke();
	trace();
	ctx.strokeStyle = 'rgba(138, 200, 255, 0.7)';
	ctx.lineWidth = 1.05;
	ctx.stroke();
}

/* ---------- panning the map (a phone shows part of it; drag or the arrow keys) ---------- */

function setPan(x) {
	view.panX = clamp(x, view.w - view.mapW, 0);
	view.centerLon = ((view.w / 2 - view.panX) / view.mapW) * 360 - 180;
	viewEl.classList.add('has-panned');
	placeMap();
}
let pan = null;
viewEl.addEventListener('pointerdown', (e) => {
	if (!view.pannable || (e.pointerType === 'mouse' && e.button !== 0)) return;
	pan = { id: e.pointerId, x: e.clientX, x0: view.panX };
	viewEl.setPointerCapture(e.pointerId);
	viewEl.classList.add('is-panning');
});
viewEl.addEventListener('pointermove', (e) => {
	if (pan && e.pointerId === pan.id) setPan(pan.x0 + e.clientX - pan.x);
});
const endPan = (e) => {
	if (!pan || (e && e.pointerId !== pan.id)) return;
	pan = null;
	viewEl.classList.remove('is-panning');
};
viewEl.addEventListener('pointerup', endPan);
viewEl.addEventListener('pointercancel', endPan);
viewEl.addEventListener('lostpointercapture', endPan);
viewEl.addEventListener('keydown', (e) => {
	if (!view.pannable) return;
	const d = { ArrowLeft: 48, ArrowRight: -48 }[e.key];
	if (!d) return;
	e.preventDefault();
	setPan(view.panX + d);
});

/* ---------- the clock: the time bar, the readout, and getting to a time ---------- */

function paintClock() {
	const f = clock.t / LAST;
	const x = f * clock.railW;
	if (x !== clock.thumbX) {
		clock.thumbX = x;
		thumbEl.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
		fillEl.style.transform = `scaleX(${f.toFixed(4)})`;
	}
	const n = round(clock.t);
	if (n !== clock.shown) {
		clock.shown = n;
		const text = frameText(n);
		const d = frameDate(n);
		dayEl.textContent = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
		hourEl.textContent = ` · ${pad2(d.getUTCHours())}:00 UTC`;
		readoutEl.setAttribute('datetime', d.toISOString());
		frameEl.textContent = `Frame ${n + 1} of ${LAST + 1}`;
		scrubEl.setAttribute('aria-valuenow', String(n));
		scrubEl.setAttribute('aria-valuetext', `${text}, frame ${n + 1} of ${LAST + 1}`);
	}
}

/* something changed the field or the picture while nothing is running: show it */
function showChange() {
	if (REDUCED) scheduleStill();
	else if (paused && ctl) {
		// a short nudge: the loop runs for a second so the new wind carries the trails along, then stops again
		nudgeUntil = now() + 1.1;
		ctl.start();
	}
}

/* jump to time t (in saved maps), no easing */
function seek(t) {
	clock.tween = null;
	clock.t = clamp(t, 0, LAST);
	clock.hold = 0;
	if (REDUCED || paused) {
		uploadField(clock.t);
		paintClock();
		showChange();
	}
}

/* go to saved map n: eased while the loop is running, at once otherwise */
function goTo(n, secs = 0.7) {
	if (REDUCED || paused || !ctl || !ctl.running) {
		seek(n);
		return;
	}
	clock.tween = { from: clock.t, to: n, u: 0, dur: secs };
	clock.hold = 0;
}
function stepFrame(dir) {
	const t = clock.tween ? clock.tween.to : clock.t;
	let n = dir > 0 ? floor(t + 1e-6) + 1 : Math.ceil(t - 1e-6) - 1;
	if (n > LAST) n = 0;
	if (n < 0) n = LAST;
	goTo(n, n === 0 && dir > 0 ? 1.4 : 0.7);
}

function advanceClock(dt) {
	if (clock.tween) {
		const tw = clock.tween;
		tw.u = min(1, tw.u + dt / tw.dur);
		clock.t = tw.from + (tw.to - tw.from) * ease(tw.u);
		if (tw.u >= 1) {
			clock.t = tw.to;
			clock.tween = null;
		}
	} else if (!clock.scrubbing && !paused) {
		if (clock.t >= LAST) {
			// rest on the last map for a moment, then run back to the start
			clock.hold += dt;
			if (clock.hold > 1.2) {
				clock.hold = 0;
				clock.tween = { from: LAST, to: 0, u: 0, dur: 1.8 };
			}
		} else {
			clock.t = min(LAST, clock.t + dt / SECS_PER_FRAME);
		}
	}
}

/* the time bar: a slider by pointer or keys */
function scrubTo(e) {
	const r = scrubEl.getBoundingClientRect();
	let t = clamp((e.clientX - r.left - PAD) / (r.width - 2 * PAD), 0, 1) * LAST;
	if (Math.abs(t - round(t)) < 0.1) t = round(t); // a magnet at each saved map
	seek(t);
}
scrubEl.addEventListener('pointerdown', (e) => {
	if (!frames || (e.pointerType === 'mouse' && e.button !== 0)) return;
	clock.scrubbing = true;
	scrubEl.setPointerCapture(e.pointerId);
	scrubTo(e);
	if (!REDUCED && !paused) {
		// running: hold the clock and show the new wind straight away
		uploadField(clock.t);
		paintClock();
	}
});
scrubEl.addEventListener('pointermove', (e) => {
	if (!clock.scrubbing) return;
	scrubTo(e);
	if (!REDUCED && !paused) {
		uploadField(clock.t);
		paintClock();
	}
});
const endScrub = () => { clock.scrubbing = false; };
scrubEl.addEventListener('pointerup', endScrub);
scrubEl.addEventListener('pointercancel', endScrub);
scrubEl.addEventListener('lostpointercapture', endScrub);
scrubEl.addEventListener('keydown', (e) => {
	if (!frames) return;
	if (e.key === 'ArrowRight' || e.key === 'ArrowUp') stepFrame(1);
	else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') stepFrame(-1);
	else if (e.key === 'Home') goTo(0, 1.2);
	else if (e.key === 'End') goTo(LAST, 1.2);
	else return;
	e.preventDefault();
});

/* ---------- the still frame (reduced motion) ---------- */

let stillTimer = 0;
function scheduleStill() {
	clearTimeout(stillTimer);
	stillTimer = setTimeout(stillFrame, 80);
}
/* run the trails off-screen for a moment, then show the last picture; nothing keeps running */
function stillFrame() {
	if (!wind || glLost) return;
	clearTrails();
	uploadField(clock.t);
	paintClock();
	runSteps(160, 800);
}

/* ---------- one frame ---------- */

function tick(dt) {
	if (glLost) return;
	advanceClock(dt);
	const t = now();
	if (clock.t !== clock.uploaded && t - clock.upAt >= 0.04) uploadField(clock.t);
	// the simulation runs at 60 steps a second whatever the screen's refresh rate
	accum = min(3, accum + dt * STEP_HZ);
	let steps = floor(accum);
	accum -= steps;
	steps = min(steps, dt > 0.03 ? 1 : 2);
	for (let i = 0; i < steps; i++) wind.draw();
	paintClock();
	if (paused && t > nudgeUntil) ctl.stop();
	// a slow machine: step down once to fewer particles
	if (dense && ++seen > 45) {
		slow += dt > 0.026 ? 1 : 0;
		if (seen > 150) {
			if (slow > 90) setDense(false);
			seen = 0;
			slow = 0;
		}
	}
}

/* ---------- controls ---------- */

function setDense(on) {
	dense = on;
	denseBtn.setAttribute('aria-pressed', String(on));
	if (!wind || glLost) return;
	setParticles(on ? DENSE : LIGHT);
	if (REDUCED || paused) showChange(); // running: the loop fills the new trails in
}

function plainMode(message) {
	screenEl.classList.add('is-plain');
	noteEl.textContent = message;
	noteEl.hidden = false;
	[stepBtn, denseBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	scrubEl.setAttribute('aria-disabled', 'true');
	scrubEl.tabIndex = -1;
	layout();
}

async function start() {
	boot();
	// a phone (a narrow or touch-first screen) starts with fewer particles
	dense = innerWidth >= 720 && !matchMedia('(pointer: coarse)').matches;
	denseBtn.setAttribute('aria-pressed', String(dense));
	layout();
	addEventListener('resize', () => {
		clearTimeout(relayoutTimer);
		relayoutTimer = setTimeout(relayout, 140);
	});
	// the panel can fold away, which changes how much room the map has
	new ResizeObserver(() => {
		clearTimeout(relayoutTimer);
		relayoutTimer = setTimeout(relayout, 140);
	}).observe(infoEl);

	const coastP = fetch(COAST_URL).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then((j) => { coastJson = j; drawCoast(); }).catch(() => {});
	let data = null;
	try {
		data = await loadFrames();
	} catch (err) {
		data = null;
	}
	await coastP;
	if (!data) {
		plainMode('The wind data did not load, so this is the map without the wind.');
		return;
	}
	frames = data.out;
	range = data.r;
	paintLegend();
	if (!buildWind()) {
		plainMode("This browser can't run WebGL, so this is the map without the wind.");
		return;
	}
	windCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); glLost = true; });
	windCanvas.addEventListener('webglcontextrestored', () => {
		glLost = false;
		if (buildWind()) {
			runSteps(60, 300);
			if (REDUCED) stillFrame();
		}
	});
	paintClock();

	stepBtn.addEventListener('click', () => stepFrame(1));
	denseBtn.addEventListener('click', () => setDense(denseBtn.getAttribute('aria-pressed') !== 'true'));

	if (REDUCED) {
		// one still frame: no loop, nothing that starts motion
		pauseBtn.disabled = true;
		stillFrame();
		return;
	}

	runSteps(70, 400); // a first picture with trails already in it
	// loop() runs only while the map is on screen, the tab is visible and motion is allowed;
	// wind-gl has no loop of its own, so no WebGL work happens anywhere else
	ctl = loop(viewEl, tick, { name: 'wind-snapshot' });
	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		nudgeUntil = 0;
		if (paused) ctl.stop();
		else ctl.start();
	});
}

let relayoutTimer = 0;
function relayout() {
	const resized = layout();
	if (!wind || glLost) return;
	if (resized) {
		runSteps(40, 150);
		if (REDUCED) stillFrame();
		else if (paused) showChange();
	}
}

start();
