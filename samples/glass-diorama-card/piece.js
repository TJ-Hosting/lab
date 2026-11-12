/*
 * Sample 30 — "Glass Diorama Card".
 * A portrait glass card holding a five-layer diorama (sky, floating islands, clouds, a lit tower, sparks). Atropos tilts the card
 * in 3D and slides the layers at their own depths. One foil element lies over the art: its blue-and-lilac bands and its white
 * hotspot follow the card's tilt through CSS variables set once per frame (the two slide by transform only). Left alone for
 * three seconds the card sways by itself, led by a ghost pointer that sends Atropos the same pointer events a hand would,
 * and the sparks twinkle on a canvas. After a tap on Enable motion a phone's tilt drives the same ghost pointer (clamped,
 * smoothed, and off in a hidden tab, off-screen or on Pause). Everything runs inside loop() from js/lab.js. Atropos has a
 * requestAnimationFrame loop of its own, so the instance exists only while the card is live and is destroyed otherwise.
 * Under reduced motion no Atropos instance is made: the card stands at a fixed slight angle with the layers placed by the
 * same rule, the sparks are one still frame, and the pointer does not move the foil.
 *
 * Uses Atropos 2.0.2 by Vladimir Kharlampidi (nolimits4web), https://github.com/nolimits4web/atropos, MIT, vendored at
 * vendor/atropos@2.0.2/ with its LICENSE. The foil glare takes its idea (a specular hotspot and a foil gradient driven by
 * the pointer, with blend modes) from holo-card by Allen (codeweb-dev), https://github.com/codeweb-dev/holo-card, MIT; what
 * changed: new colours (cool cyan, azure and a little lilac), the gradients sit in oversized boxes that slide by transform
 * instead of moving a background position, and the variables are set once per frame. The gyroscope idea (a phone's tilt
 * as the pointer) is from wagerfield/parallax, MIT, as an idea only: none of its code was read or used.
 * The ghost pointer, the sway, the sparks, the layers' art direction and the page are new code.
 *
 * MIT License
 *
 * Copyright (c) 2021 Vladimir Kharlampidi (Atropos)
 * Copyright (c) 2026 Allen (holo-card)
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
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import { Atropos } from '../../vendor/atropos@2.0.2/atropos.mjs';

const MAX_DEG = 15; // Atropos's rotateXMax and rotateYMax
const IDLE_MS = 3000; // no pointer for this long: the card sways by itself
const GYRO_RANGE = 20; // degrees of phone tilt that mean a full tilt of the card
const STILL = { rx: 5, ry: -6 }; // the reduced-motion angle, in degrees
const TAU = Math.PI * 2;

const card = document.getElementById('card');
const rotateEl = card.querySelector('.atropos-rotate');
const foil = card.querySelector('.foil');
const sparksCanvas = card.querySelector('.layer--sparks');
const ctx = sparksCanvas.getContext('2d');
const layers = [...card.querySelectorAll('[data-atropos-offset]')];
const pauseBtn = document.querySelector('[data-action="pause"]');
const motionBtn = document.querySelector('[data-action="motion"]');
const statusEl = document.getElementById('motion-status');

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const say = (text) => { statusEl.textContent = text; };

/* ---------- state ---------- */

let atropos = null; // the Atropos instance, only while the card is live
let inView = false;
let userPaused = false;
let rect = null; // the card's box, measured when needed
let rotX = 0; // the card's tilt as a pointer place, -1 to 1 (left to right), from Atropos's onRotate
let rotY = 0; // -1 to 1 (top to bottom)
let foilX = 0;
let foilY = 0;
let lastFoilX = 99;
let lastFoilY = 99;
let lastInput = -Infinity; // when a real pointer last did something on the card
let hovering = false;
let pressed = false;
let idleAmp = 0;
let ghostU = 0;
let ghostV = 0;
let lastT = 2.3;

const isLive = () => inView && !document.hidden && !userPaused && !prefersReducedMotion();

/* ---------- Atropos, only while live ---------- */

function makeAtropos() {
	return Atropos({
		el: card,
		alwaysActive: true, // the card is "held" from the start, so the ghost pointer can tilt it without a hover
		activeOffset: 34,
		shadowOffset: 90,
		shadowScale: 0.97,
		duration: 320,
		rotateXMax: MAX_DEG,
		rotateYMax: MAX_DEG,
		rotateTouch: true,
		highlight: false, // the foil layer is the glare
		onRotate: (rx, ry) => {
			rotX = ry / MAX_DEG;
			rotY = -rx / MAX_DEG;
		},
	});
}

function sync() {
	const live = isLive();
	if (live && !atropos) {
		atropos = makeAtropos();
		measure();
	} else if (!live && atropos) {
		atropos.destroy(); // also stops Atropos's own requestAnimationFrame loop
		atropos = null;
	}
	gyroListen(live && gyro.on);
}

function measure() {
	rect = card.getBoundingClientRect();
}
/* Atropos caches the card's box until a pointerleave: send it one so a resize is seen */
function resetAtroposBox() {
	if (atropos) card.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
}

/* the ghost pointer: the same pointermove a mouse would send, at a place on the card (u, v from -1 to 1) */
function aim(u, v) {
	if (!rect) measure();
	card.dispatchEvent(new PointerEvent('pointermove', {
		pointerType: 'mouse',
		clientX: rect.left + rect.width * (0.5 + u * 0.5),
		clientY: rect.top + rect.height * (0.5 + v * 0.5),
	}));
}

/* what a real pointer is doing (the ghost's events are not trusted, so they do not count) */
const touch = (hover, down) => (e) => {
	if (!e.isTrusted) return;
	if (hover !== null) hovering = hover && e.pointerType !== 'touch';
	if (down !== null) pressed = down;
	lastInput = performance.now();
};
card.addEventListener('pointerenter', touch(true, null));
card.addEventListener('pointerleave', touch(false, false));
card.addEventListener('pointerdown', touch(null, true));
card.addEventListener('pointerup', touch(null, false));
card.addEventListener('pointercancel', touch(null, false));
card.addEventListener('pointermove', touch(null, null));

/* ---------- the phone's tilt ---------- */

const gyro = { on: false, seen: false, listening: false, u: 0, v: 0, bx: null, by: null, t: 0, ax: 0, ay: 0, moved: -Infinity };

function onOrient(e) {
	if (e.gamma == null || e.beta == null) return; // a desktop browser sends one empty event
	const now = performance.now();
	const angle = screen.orientation ? screen.orientation.angle : (window.orientation || 0);
	let x = e.gamma;
	let y = e.beta;
	if (angle === 90) [x, y] = [e.beta, -e.gamma];
	else if (angle === 270 || angle === -90) [x, y] = [-e.beta, e.gamma];
	else if (angle === 180) [x, y] = [-e.gamma, -e.beta];
	if (gyro.bx === null) {
		gyro.bx = gyro.ax = x;
		gyro.by = gyro.ay = y;
		gyro.t = now;
	}
	// the neutral pose follows the phone slowly, so any way of holding it starts level
	const k = 1 - Math.exp(-Math.min(1, (now - gyro.t) / 1000) / 4);
	gyro.t = now;
	gyro.bx += (x - gyro.bx) * k;
	gyro.by += (y - gyro.by) * k;
	// the card turns against the phone, as a window onto a fixed scene does; clamped to the card's full tilt
	gyro.u = clamp(-(x - gyro.bx) / GYRO_RANGE, -1, 1);
	gyro.v = clamp((y - gyro.by) / GYRO_RANGE, -1, 1);
	if (Math.abs(x - gyro.ax) + Math.abs(y - gyro.ay) > 1) {
		gyro.moved = now;
		gyro.ax = x;
		gyro.ay = y;
	}
	gyro.seen = true;
}

function gyroListen(want) {
	if (want && !gyro.listening) {
		gyro.bx = null;
		addEventListener('deviceorientation', onOrient, { passive: true });
		gyro.listening = true;
	} else if (!want && gyro.listening) {
		removeEventListener('deviceorientation', onOrient);
		gyro.listening = false;
	}
}

function setGyro(on) {
	gyro.on = on;
	gyro.seen = false;
	gyro.moved = -Infinity;
	gyro.u = gyro.v = 0;
	motionBtn.setAttribute('aria-pressed', String(on));
	motionBtn.textContent = on ? 'Motion on' : 'Enable motion';
	say(on ? 'Motion on. Tilt your phone to tilt the card.' : 'Motion off.');
	sync();
}

function motionFailed(label, message) {
	setGyro(false);
	motionBtn.textContent = label;
	motionBtn.disabled = true;
	motionBtn.dataset.dead = 'true';
	say(message);
}

/* the button exists only where the browser has DeviceOrientationEvent; a mouse-only desktop has nothing to read, so it is
   shown there only when the phone-style permission call exists or the device has touch */
const Orient = window.DeviceOrientationEvent;
if (Orient && (typeof Orient.requestPermission === 'function' || navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches)) {
	motionBtn.hidden = false;
	motionBtn.addEventListener('click', async () => {
		if (gyro.on) {
			setGyro(false);
			return;
		}
		if (typeof Orient.requestPermission === 'function') {
			// iOS: the permission prompt must come from this tap
			let answer = 'denied';
			try {
				answer = await Orient.requestPermission();
			} catch (err) {
				answer = 'denied';
			}
			if (answer !== 'granted') {
				motionFailed('Motion blocked', 'Motion is blocked. Allow motion for this site in the browser settings to tilt with your phone.');
				return;
			}
		}
		setGyro(true);
		setTimeout(() => {
			if (gyro.on && !gyro.seen && gyro.listening) motionFailed('No motion sensor', 'No motion sensor found on this device.');
		}, 2500);
	});
}

/* ---------- the sparks (a canvas; the one place the card draws by script) ---------- */

let W = 0;
let H = 0;
const sparks = [];
let sprite = null;

function rng(seed) {
	let a = seed;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function makeSprite() {
	// one glint: a soft cyan halo, a white core and a four-point star, drawn once and stamped
	const s = document.createElement('canvas');
	s.width = s.height = 96;
	const c = s.getContext('2d');
	const g = c.createRadialGradient(48, 48, 0, 48, 48, 48);
	g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
	g.addColorStop(0.16, 'rgba(214, 245, 255, 0.7)');
	g.addColorStop(0.45, 'rgba(70, 208, 251, 0.22)');
	g.addColorStop(1, 'rgba(70, 208, 251, 0)');
	c.fillStyle = g;
	c.fillRect(0, 0, 96, 96);
	c.fillStyle = 'rgba(255, 255, 255, 0.95)';
	c.beginPath();
	c.moveTo(48, 12);
	c.quadraticCurveTo(50.5, 45.5, 84, 48);
	c.quadraticCurveTo(50.5, 50.5, 48, 84);
	c.quadraticCurveTo(45.5, 50.5, 12, 48);
	c.quadraticCurveTo(45.5, 45.5, 48, 12);
	c.fill();
	return s;
}

function seedSparks() {
	const rand = rng(2710);
	const n = innerWidth < 720 ? 14 : 24;
	sparks.length = 0;
	for (let i = 0; i < n; i++) {
		sparks.push({
			x: 0.05 + rand() * 0.9,
			y: 0.04 + rand() * 0.7, // mostly in the sky, above the clouds
			size: 0.5 + rand() * rand() * 1.4,
			phase: rand() * TAU,
			rate: 0.8 + rand() * 1.5,
		});
	}
	sprite = makeSprite();
}

function sizeCanvas() {
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	W = sparksCanvas.clientWidth;
	H = sparksCanvas.clientHeight;
	sparksCanvas.width = Math.max(1, Math.round(W * dpr));
	sparksCanvas.height = Math.max(1, Math.round(H * dpr));
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawSparks(t) {
	lastT = t;
	ctx.clearRect(0, 0, W, H);
	const unit = W / 340;
	for (const s of sparks) {
		const a = 0.5 + 0.5 * Math.sin(t * s.rate + s.phase);
		const k = a * a * a;
		if (k < 0.03) continue;
		const r = (6 + s.size * 11) * unit * (0.7 + 0.3 * k);
		const x = s.x * W + Math.sin(t * 0.35 + s.phase) * 2 * unit;
		const y = s.y * H + Math.cos(t * 0.3 + s.phase * 2) * 2 * unit;
		ctx.globalAlpha = k;
		ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
	}
	ctx.globalAlpha = 1;
}

/* ---------- the foil's variables: written at most once per frame ---------- */

function setFoil(px, py) {
	foil.style.setProperty('--px', px.toFixed(3));
	foil.style.setProperty('--py', py.toFixed(3));
	foil.style.setProperty('--tilt', Math.min(1, Math.hypot(px, py)).toFixed(3));
}

/* ---------- the loop ---------- */

function tick(dt, t) {
	const now = performance.now();
	if (atropos) {
		if (hovering || pressed) {
			// a real pointer is on the card: Atropos follows it, the ghost keeps out
			idleAmp = 0;
			ghostU = ghostV = 0;
		} else {
			const gyroLive = gyro.on && gyro.seen && now - gyro.moved < IDLE_MS;
			let tu = null;
			let tv = null;
			if (gyroLive) {
				idleAmp = 0;
				tu = gyro.u;
				tv = gyro.v;
			} else if (now - lastInput > IDLE_MS) {
				// the sway: two slow, unrelated sines, eased in
				idleAmp = Math.min(1, idleAmp + dt / 1.4);
				tu = Math.sin(t * 0.62) * 0.62 * idleAmp;
				tv = (Math.sin(t * 0.41 + 1.2) * 0.5 - 0.06) * idleAmp;
			}
			if (tu !== null) {
				const k = 1 - Math.exp(-dt * (gyroLive ? 8 : 5));
				ghostU += (tu - ghostU) * k;
				ghostV += (tv - ghostV) * k;
				aim(ghostU, ghostV);
			}
		}
	}
	// the foil follows the card's tilt a little ahead of Atropos's own easing
	const k = 1 - Math.exp(-dt * 7);
	foilX += (rotX - foilX) * k;
	foilY += (rotY - foilY) * k;
	if (Math.abs(foilX - lastFoilX) > 0.002 || Math.abs(foilY - lastFoilY) > 0.002) {
		lastFoilX = foilX;
		lastFoilY = foilY;
		setFoil(foilX, foilY);
	}
	drawSparks(t);
}

const ctl = loop(card, tick, { name: 'glass-diorama-card' });

/* ---------- the reduced-motion still ---------- */

function showStill() {
	card.classList.add('is-still');
	// the same placing Atropos does, once: the card at a slight angle and each layer shifted by its depth
	rotateEl.style.transform = `rotateX(${STILL.rx}deg) rotateY(${STILL.ry}deg)`;
	const px = (STILL.ry / MAX_DEG) * 100;
	const py = (STILL.rx / MAX_DEG) * 100;
	layers.forEach((el) => {
		const offset = parseFloat(el.dataset.atroposOffset) / 100;
		el.style.transform = `translate3d(${px * offset}%, ${-py * offset}%, 0)`;
	});
	setFoil(STILL.ry / MAX_DEG, -STILL.rx / MAX_DEG);
	sizeCanvas();
	drawSparks(2.3);
}

function clearStill() {
	card.classList.remove('is-still');
	rotateEl.style.transform = '';
	layers.forEach((el) => { el.style.transform = ''; });
	foilX = foilY = 0;
	lastFoilX = lastFoilY = 99;
}

function applyMotionPreference() {
	const reduced = prefersReducedMotion();
	pauseBtn.disabled = reduced;
	motionBtn.disabled = reduced || motionBtn.dataset.dead === 'true';
	if (reduced) {
		if (gyro.on) setGyro(false);
		sync();
		showStill();
	} else {
		clearStill();
		sizeCanvas();
		drawSparks(lastT);
		sync();
	}
}

/* ---------- start ---------- */

boot();

/* the card stands above the info panel on narrow screens: tell the CSS how tall the panel is (it folds, and wraps on small phones) */
const stage = card.closest('.stage');
const info = document.querySelector('.sample-info');
if (info && typeof ResizeObserver === 'function') {
	new ResizeObserver(() => stage.style.setProperty('--dock', `${Math.ceil(info.offsetHeight + 18 + 14)}px`)).observe(info);
}

seedSparks();
sizeCanvas();
drawSparks(2.3);

new IntersectionObserver((entries) => {
	inView = entries[entries.length - 1].isIntersecting;
	sync();
}, { threshold: 0 }).observe(card);
document.addEventListener('visibilitychange', sync);
reducedMotionQuery.addEventListener?.('change', applyMotionPreference);

let resizeTimer = 0;
addEventListener('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		sizeCanvas();
		measure();
		resetAtroposBox();
		if (prefersReducedMotion()) showStill();
		else drawSparks(lastT);
	}, 120);
});

pauseBtn.addEventListener('click', () => {
	userPaused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(userPaused));
	pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
	if (userPaused) ctl.stop();
	else ctl.start();
	sync();
});

if (prefersReducedMotion()) applyMotionPreference();
