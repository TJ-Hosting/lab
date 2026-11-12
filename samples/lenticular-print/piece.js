/*
 * Sample 61 — "Lenticular tilt print".
 * A square plastic print that changes picture as it tilts, like a lenticular card. vanilla-tilt turns the print in 3D from the pointer
 * (and draws its glare); each time the tilt changes, a Canvas 2D weaves two pictures (a sunrise and a moonrise of the same sea) into
 * fine vertical stripes, one pair of stripes per "lens", and the share of each lens that shows picture B follows the tilt: the sunrise
 * alone at the far left, the moonrise alone at the far right, a mix of stripes between. The canvas is redrawn only when that value
 * changes. A ribbed overlay and a faint sheen band (cyan, azure, a hint of lilac and peach) lie over it.
 *
 * Left alone for three seconds the print rocks by itself, led by a ghost pointer that puts vanilla-tilt's pointer where a hand
 * would and applies it inside our own frame. A touch or pen drags it; the arrow keys, Home and End tilt it from the keyboard; and
 * after a tap on Enable tilt a phone's tilt drives the same ghost pointer (clamped, smoothed; on iOS the permission prompt comes
 * from that tap, never on load). vanilla-tilt keeps a requestAnimationFrame of its own after every mouse input, so the instance exists only while the print is live
 * (on screen, tab visible, not paused, motion allowed) and is destroyed otherwise; its own gyroscope option is left off, because its
 * sensor events would fight the idle rock and it ignores screen rotation. All of the script's own motion runs inside loop() from
 * js/lab.js. Under reduced motion no instance and no loop exist: the print stands at a slight fixed angle with a mix of stripes, and
 * the pointer or the arrow keys still move the stripes (drawn straight from the event, no easing, no 3D tilt).
 *
 * Uses vanilla-tilt 1.8.1 by Șandor Sergiu (micku7zu), https://github.com/micku7zu/vanilla-tilt.js, MIT, vendored unmodified at
 * vendor/vanilla-tilt@1.8.1/ with its LICENSE. The stripe weaving, the ghost pointer, the gyroscope and keyboard input, the print's
 * look and the page are new code. The phone-tilt handling (neutral pose that follows the phone, screen rotation) follows the lab's own
 * glass-diorama-card.
 *
 * MIT License
 *
 * Copyright (c) 2017 Șandor Sergiu (vanilla-tilt)
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
import VanillaTilt from '../../vendor/vanilla-tilt@1.8.1/vanilla-tilt.es2015.js';

const MAX_DEG = 16; // vanilla-tilt's max: the print's tilt at the edge of the box
const IDLE_MS = 3000; // no pointer, key or phone movement for this long: the print rocks by itself
const GYRO_RANGE = 22; // degrees of phone tilt that mean a full tilt of the print
const SWAY_RATE = 0.72; // radians per second: one full rock takes about nine seconds
const STILL = { s: 0.05, rx: 5, ry: -7 }; // the reduced-motion print: stripe value, then tilt in degrees
const PERSPECTIVE = 900;
const KEY_STEP = 0.25;

const box = document.getElementById('print-box');
const print = document.getElementById('print');
const win = print.querySelector('.print__window');
const canvas = print.querySelector('canvas.piece');
const ctx = canvas.getContext('2d');
const imgA = print.querySelector('.art--a img');
const imgB = print.querySelector('.art--b img');
const sheen = print.querySelector('.sheen__band');
const glare = print.querySelector('.js-tilt-glare-inner');
const shadow = box.querySelector('.print-shadow');
const dot = document.querySelector('.meter__dot');
const track = document.querySelector('.meter__track');
const endA = document.querySelector('.meter__end--a');
const endB = document.querySelector('.meter__end--b');
const pauseBtn = document.querySelector('[data-action="pause"]');
const tiltBtn = document.querySelector('[data-action="tilt"]');
const statusEl = document.getElementById('print-status');

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smooth = (x) => x * x * (3 - 2 * x);
const say = (text) => { if (statusEl.textContent !== text) statusEl.textContent = text; };

/* ---------- state ---------- */

let tilt = null; // the vanilla-tilt instance, only while the print is live
let inView = false;
let userPaused = false;
let rect = null; // the box's layout rectangle (it never moves with the tilt, unlike the print)
let curU = 0; // where the pointer is on the print, -1 (left) to 1 (right), from vanilla-tilt's tiltChange
let curV = 0; // -1 (top) to 1 (bottom)
let shownS = 0; // the stripe value on screen: curU, eased
let drawnS = NaN; // the value last painted
let hovering = false; // a real mouse is over the box
let pressed = false; // a finger or pen is down on it
let lastInput = -Infinity; // when a real pointer, key or phone movement last did something
let keyU = null; // a place chosen with the keys, while it lasts
let keyV = 0;
let idleAmp = 0;
let ghostU = 0;
let ghostV = 0;

const isLive = () => inView && !document.hidden && !userPaused && !prefersReducedMotion();

/* ---------- the canvas: two pictures woven into stripes ---------- */

const offA = document.createElement('canvas'); // each picture scaled once to the canvas's size, so a stripe is a 1:1 copy
const offB = document.createElement('canvas');
let ready = false;
let N = 40; // lenses across the print
let P = 12; // one lens, in canvas pixels
let trackHalf = 49;

function prepare() {
	if (!imgA.complete || !imgA.naturalWidth || !imgB.complete || !imgB.naturalWidth) {
		ready = false;
		return;
	}
	const cw = canvas.width;
	const ch = canvas.height;
	for (const [off, img] of [[offA, imgA], [offB, imgB]]) {
		off.width = cw;
		off.height = ch;
		const c = off.getContext('2d');
		c.imageSmoothingQuality = 'high';
		c.drawImage(img, 0, 0, cw, ch);
	}
	ready = true;
}

/* s: -1 (picture A alone) to 1 (picture B alone). Each lens shows B on its right-hand part, and that part grows with s */
function paint(s) {
	if (!ready) return;
	const ch = canvas.height;
	const t = smooth(clamp((s + 0.8) / 1.6, 0, 1)); // the share of each lens that shows B; both pictures are pure beyond about 0.8
	ctx.drawImage(offA, 0, 0);
	if (t <= 0.003) return;
	if (t >= 0.997) {
		ctx.drawImage(offB, 0, 0);
		return;
	}
	const w = P * t;
	for (let i = 1; i <= N; i++) {
		const x = i * P - w;
		ctx.drawImage(offB, x, 0, w, ch, x, 0, w, ch);
	}
}

/* everything that shows the tilt value: the stripes, the sheen band, the contact shadow and the pill. Called only when s changes */
function render(s) {
	drawnS = s;
	paint(s);
	const k = clamp(s, -1, 1);
	sheen.style.transform = `translate3d(${(-k * 125).toFixed(1)}%, 0, 0) rotate(16deg)`;
	shadow.style.transform = `translate3d(${(-k * 3).toFixed(2)}%, 0, 0)`;
	dot.style.transform = `translate3d(${(k * trackHalf).toFixed(1)}px, 0, 0)`;
	endA.classList.toggle('is-on', k < -0.25);
	endB.classList.toggle('is-on', k > 0.25);
}

function relayout() {
	const w = win.clientWidth;
	const h = win.clientHeight;
	if (!w || !h) return;
	const dpr = Math.min(2, window.devicePixelRatio || 1); // phones at 3x would cost 2.25x the pixels for stripes nobody can tell apart
	canvas.width = Math.round(w * dpr);
	canvas.height = Math.round(h * dpr);
	N = Math.max(10, Math.round(w / (innerWidth < 720 ? 3.6 : 4)));
	P = canvas.width / N;
	win.style.setProperty('--pitch', `${(w / N).toFixed(3)}px`);
	trackHalf = (track.clientWidth - dot.offsetWidth) / 2;
	prepare();
	measure();
	drawnS = NaN;
	render(shownS);
}

function loadedImage() {
	prepare();
	drawnS = NaN;
	render(shownS);
}
imgA.addEventListener('load', loadedImage);
imgB.addEventListener('load', loadedImage);

/* ---------- vanilla-tilt, only while live ---------- */

function measure() {
	rect = box.getBoundingClientRect();
}

/* vanilla-tilt measures the element it turns, whose bounding box changes with the tilt; the box does not. Hand it the box's numbers */
function syncBox() {
	if (!tilt || !rect) return;
	tilt.left = rect.left;
	tilt.top = rect.top;
	tilt.width = rect.width;
	tilt.height = rect.height;
}

function makeTilt() {
	measure();
	const keep = { u: curU, v: curV };
	tilt = new VanillaTilt(print, {
		max: MAX_DEG,
		perspective: PERSPECTIVE,
		speed: 400,
		scale: 1,
		glare: true,
		'glare-prerender': true, // the glare lives in our own markup, inside the picture
		'max-glare': 0.3,
		gyroscope: false, // the phone's tilt comes through our own handling, below
		'mouse-event-element': box, // the box stays still, so the hit area does not wobble with the tilt
	});
	// the constructor stands the print flat; carry on from where it was (nothing is painted in between)
	curU = ghostU = keep.u;
	curV = ghostV = keep.v;
	syncBox();
	hovering = box.matches(':hover');
	aim(keep.u, keep.v);
}

/* freeze the print where it is, then let the library go: destroy() cancels its requestAnimationFrame and removes its listeners */
function dropTilt() {
	const tf = print.style.transform;
	const gt = glare.style.transform;
	const go = glare.style.opacity;
	tilt.destroy();
	tilt = null;
	print.style.transform = tf;
	glare.style.transform = gt;
	glare.style.opacity = go;
	glare.style.transition = ''; // destroy() cancels the timer that would have cleared the glare's transition
}

function sync() {
	const live = isLive();
	if (live && !tilt) makeTilt();
	else if (!live && tilt) dropTilt();
	gyroListen(live && gyro.on);
}

/* vanilla-tilt reports each update; this is how the stripes know the tilt */
print.addEventListener('tiltChange', (e) => {
	curU = e.detail.percentageX / 50 - 1;
	curV = e.detail.percentageY / 50 - 1;
});

/* the ghost pointer: put the pointer at a place on the box (u, v from -1 to 1) and let vanilla-tilt apply it. A real mouse reaches
   the library as a mousemove, which it applies in a requestAnimationFrame of its own; that would never run here, because each
   frame's loop would cancel the last one's pending update before it came due. So the ghost sets the pointer and calls update()
   straight away (inside our own frame), after cancelling any update the library had queued, so it never has a frame of its own */
function aim(u, v) {
	if (!tilt) return;
	if (tilt.updateCall !== null) cancelAnimationFrame(tilt.updateCall);
	tilt.event = {
		clientX: tilt.left + tilt.width * (0.5 + u * 0.5),
		clientY: tilt.top + tilt.height * (0.5 + v * 0.5),
	};
	tilt.update();
}

/* ---------- what a real pointer is doing ---------- */

function place(e) {
	return [
		clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
		clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
	];
}

/* with motion allowed a touch or pen is forwarded to vanilla-tilt (which only listens for the mouse); under reduced motion
   any pointer sets the stripes directly, once per event, and the print does not turn */
function follow(e) {
	if (!rect) measure();
	const [u, v] = place(e);
	if (tilt) aim(u, v);
	else if (prefersReducedMotion()) stillTo(u);
}

const real = (e) => e.isTrusted;
box.addEventListener('pointerenter', (e) => {
	if (!real(e)) return;
	measure();
	if (e.pointerType === 'mouse') hovering = true;
	lastInput = performance.now();
	keyU = null;
});
box.addEventListener('pointerleave', (e) => {
	if (!real(e)) return;
	if (e.pointerType === 'mouse') hovering = false;
	lastInput = performance.now();
});
box.addEventListener('pointerdown', (e) => {
	if (!real(e)) return;
	measure();
	keyU = null;
	lastInput = performance.now();
	if (e.pointerType !== 'mouse') {
		pressed = true;
		follow(e);
	}
});
box.addEventListener('pointermove', (e) => {
	if (!real(e)) return;
	lastInput = performance.now();
	if (e.pointerType === 'mouse') {
		if (tilt) syncBox();
		else if (prefersReducedMotion()) {
			if (!rect) measure();
			stillTo(place(e)[0]);
		}
	} else if (pressed) follow(e);
});
const release = (e) => {
	if (!real(e)) return;
	if (e.pointerType !== 'mouse') pressed = false;
	lastInput = performance.now();
};
box.addEventListener('pointerup', release);
box.addEventListener('pointercancel', release);

/* the keyboard: arrows tilt in steps, Home and End show one picture alone. The same ghost pointer does the turning */
box.addEventListener('keydown', (e) => {
	if (e.altKey || e.ctrlKey || e.metaKey) return;
	const from = tilt ? (keyU ?? curU) : shownS;
	let u = null;
	if (e.key === 'ArrowLeft') u = from - KEY_STEP;
	else if (e.key === 'ArrowRight') u = from + KEY_STEP;
	else if (e.key === 'Home') u = -1;
	else if (e.key === 'End') u = 1;
	else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		if (!tilt) return;
		e.preventDefault();
		keyU = keyU ?? curU;
		keyV = clamp((keyV || curV) + (e.key === 'ArrowUp' ? -KEY_STEP : KEY_STEP), -1, 1);
		lastInput = performance.now();
		return;
	}
	if (u === null) return;
	e.preventDefault();
	u = clamp(u, -1, 1);
	if (!tilt && !prefersReducedMotion()) return; // paused: the print stays where it is
	lastInput = performance.now();
	if (tilt) {
		keyU = u;
		if (keyV === 0) keyV = curV;
	} else {
		stillTo(u);
	}
	say(u < -0.45 ? 'Mostly sunrise' : u > 0.45 ? 'Mostly moonrise' : 'A mix of sunrise and moonrise');
});

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
	// the pointer sits on the side the phone is tipped towards, as if the print were held in front of you
	gyro.u = clamp((x - gyro.bx) / GYRO_RANGE, -1, 1);
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
	tiltBtn.setAttribute('aria-pressed', String(on));
	tiltBtn.textContent = on ? 'Tilt on' : 'Enable tilt';
	say(on ? 'Tilt on. Tilt your phone to tilt the print.' : 'Tilt off.');
	sync();
}

function tiltFailed(label, message) {
	setGyro(false);
	tiltBtn.textContent = label;
	tiltBtn.disabled = true;
	tiltBtn.dataset.dead = 'true';
	say(message);
}

/* the button exists only where the browser has DeviceOrientationEvent and a sensor is likely: the phone-style permission call, or touch */
const Orient = window.DeviceOrientationEvent;
if (Orient && (typeof Orient.requestPermission === 'function' || navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches)) {
	tiltBtn.hidden = false;
	tiltBtn.addEventListener('click', async () => {
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
				tiltFailed('Tilt blocked', 'Tilt is blocked. Allow motion for this site in the browser settings to tilt with your phone.');
				return;
			}
		}
		setGyro(true);
		setTimeout(() => {
			if (gyro.on && !gyro.seen && gyro.listening) tiltFailed('No tilt sensor', 'No tilt sensor found on this device.');
		}, 2500);
	});
}

/* ---------- the loop ---------- */

function tick(dt, t) {
	const now = performance.now();
	if (tilt) {
		let tu = null;
		let tv = 0;
		if (hovering || pressed) {
			// a real pointer is on the print: vanilla-tilt follows it, the ghost keeps out
			idleAmp = 0;
		} else if (keyU !== null && now - lastInput < IDLE_MS) {
			tu = keyU;
			tv = keyV;
			idleAmp = 0;
		} else if (gyro.on && gyro.seen && now - gyro.moved < IDLE_MS) {
			tu = gyro.u;
			tv = gyro.v;
			idleAmp = 0;
		} else if (now - lastInput > IDLE_MS) {
			// the rock: two slow, unrelated sines, eased in. It reaches both ends, so both pictures show
			keyU = null;
			keyV = 0;
			idleAmp = Math.min(1, idleAmp + dt / 1.4);
			tu = Math.sin(t * SWAY_RATE) * 0.97 * idleAmp;
			tv = (Math.sin(t * 0.47 + 1.2) * 0.5 - 0.05) * idleAmp;
		} else {
			idleAmp = 0; // holding where a finger or the mouse left it
		}
		if (tu === null) {
			ghostU = curU;
			ghostV = curV;
		} else {
			const k = 1 - Math.exp(-dt * (gyro.on && gyro.seen && now - gyro.moved < IDLE_MS ? 9 : 5));
			ghostU += (tu - ghostU) * k;
			ghostV += (tv - ghostV) * k;
			aim(ghostU, ghostV);
		}
	}
	// the stripes follow the tilt a little behind the print's own turn, and are painted only when the value has moved
	shownS += (curU - shownS) * (1 - Math.exp(-dt * 12));
	if (Math.abs(shownS - drawnS) > 0.002) render(shownS);
}

const ctl = loop(box, tick, { name: 'lenticular-print' });

/* ---------- the reduced-motion still ---------- */

function stillTo(u) {
	curU = shownS = u;
	render(u);
}

function showStill() {
	print.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${STILL.rx}deg) rotateY(${STILL.ry}deg) scale3d(1, 1, 1)`;
	glare.style.transform = 'rotate(205deg) translate(-50%, -50%)';
	glare.style.opacity = '0.2';
	stillTo(STILL.s);
}

function clearStill() {
	print.style.transform = '';
	glare.style.transform = '';
	glare.style.opacity = '';
	curU = curV = shownS = ghostU = ghostV = 0;
	keyU = null;
	keyV = 0;
	lastInput = -Infinity;
	drawnS = NaN;
	render(0);
}

function applyMotionPreference() {
	const reduced = prefersReducedMotion();
	pauseBtn.disabled = reduced;
	tiltBtn.disabled = reduced || tiltBtn.dataset.dead === 'true';
	if (reduced) {
		if (gyro.on) setGyro(false);
		sync();
		showStill();
	} else {
		clearStill();
		sync();
	}
}

/* ---------- start ---------- */

boot();

/* the print stands above the info panel on narrow screens: tell the CSS how tall the panel is (it folds, and wraps on small phones) */
const stage = box.closest('.stage');
const info = document.querySelector('.sample-info');
if (info && typeof ResizeObserver === 'function') {
	new ResizeObserver(() => stage.style.setProperty('--dock', `${Math.ceil(info.offsetHeight + 18 + 14)}px`)).observe(info);
}

relayout();

new IntersectionObserver((entries) => {
	inView = entries[entries.length - 1].isIntersecting;
	sync();
}, { threshold: 0 }).observe(box);
document.addEventListener('visibilitychange', sync);
reducedMotionQuery.addEventListener?.('change', applyMotionPreference);

let resizeTimer = 0;
const onResize = () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		relayout();
		syncBox();
		if (prefersReducedMotion()) stillTo(shownS);
	}, 100);
};
addEventListener('resize', onResize);
if (typeof ResizeObserver === 'function') new ResizeObserver(onResize).observe(box);

pauseBtn.addEventListener('click', () => {
	userPaused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(userPaused));
	pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
	if (userPaused) ctl.stop();
	else ctl.start();
	sync();
});

if (prefersReducedMotion()) applyMotionPreference();
