/*
 * Sample 45 — "Publish button with confetti".
 * A simulated publish: the big button squeezes when pressed, its blue fill runs through three stages like a springy
 * progress bar (Uploading, Optimising, Going live), then it snaps into a tick and fires glass-drop, ring and star
 * confetti. Nothing is sent anywhere. The button, the rail, the preview and the ghost pointer are Web Animations,
 * governed by govern() from js/lab.js; canvas-confetti draws the confetti on this page's own canvas (no Web Worker).
 * Idle, the card publishes by itself, only while the lab is running.
 *
 * Uses canvas-confetti 1.9.4 (vendor/canvas-confetti@1.9.4/, https://github.com/catdad/canvas-confetti), ISC licence:
 *
 *   Copyright (c) 2020, Kiril Vatev
 *
 *   Permission to use, copy, modify, and/or distribute this software for any
 *   purpose with or without fee is hereby granted, provided that the above
 *   copyright notice and this permission notice appear in all copies.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 *   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 *   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 *   ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 *   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 *   ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 *   OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * The rest of this file is new code, written from scratch for the lab (the library is imported, not copied).
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import confetti from '../../vendor/canvas-confetti@1.9.4/confetti.module.mjs';

const stage = document.querySelector('.stage');
const card = document.getElementById('deploy');
const btn = card.querySelector('.publish');
const fill = card.querySelector('.publish__fill');
const counter = card.querySelector('.publish__layer--white');
const sheen = card.querySelector('.publish__sheen');
const texts = [...card.querySelectorAll('.publish__text')];
const ticks = [...card.querySelectorAll('.publish__icon--tick')];
const rail = card.querySelector('.rail');
const segs = [...card.querySelectorAll('.rail__seg')];
const railFills = segs.map((s) => s.querySelector('.rail__fill'));
const status = card.querySelector('.status');
const again = card.querySelector('.again');
const ghost = card.querySelector('.ghost');
const canvas = stage.querySelector('.confetti');
const pauseBtn = document.querySelector('[data-action="pause"]');
const replayBtn = document.querySelector('[data-action="replay"]');

/* the three stages: what the button says, what the status line says, where the bar has got to */
const STAGES = [
	{ label: 'Uploading…', status: 'Uploading… (simulated)', text: 'Uploading', ms: 1500, to: 33 },
	{ label: 'Optimising…', status: 'Optimising… (simulated)', text: 'Optimising', ms: 1400, to: 67 },
	{ label: 'Going live…', status: 'Going live… (simulated)', text: 'Going live', ms: 850, to: 100 },
];
const IDLE_MS = 8000; // nobody has pressed for this long: the card publishes by itself
const HOLD_MS = 5500; // how long the Live state stays before an unattended card resets itself

/* ---------- springs, as Web Animations keyframes ---------- */

/* a damped spring's step response, sampled 0 → 1 (it overshoots 1 when zeta < 1) */
function spring(zeta, n = 30) {
	const wn = zeta < 1 ? 12 : 9;
	const out = [];
	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		let v;
		if (zeta < 1) {
			const wd = wn * Math.sqrt(1 - zeta * zeta);
			v = 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
		} else {
			v = 1 - Math.exp(-wn * t) * (1 + wn * t);
		}
		out.push(v);
	}
	out[0] = 0;
	out[n - 1] = 1;
	return out;
}
const SPRING = spring(0.56); // springy: overshoots about a tenth of the step, then settles
const SETTLE = spring(1); // no overshoot (the last step must not run past the end of the bar)

const offset = (i, list) => i / (list.length - 1);
/* the fill is a full-width bar slid left (translateX -100% = empty, 0 = full); its white label slides the other way */
const fillAt = (p) => `translateX(${(-(100 - Math.max(0, Math.min(100, p)))).toFixed(2)}%)`;
const counterAt = (p) => `translateX(${(100 - Math.max(0, Math.min(100, p))).toFixed(2)}%)`;
const fillFrames = (from, to, sp, at) => sp.map((s, i) => ({ transform: at(from + (to - from) * s), offset: offset(i, sp) }));
const railFrames = (sp) => sp.map((s, i) => ({ transform: `scaleX(${Math.max(0, Math.min(1, s)).toFixed(3)})`, offset: offset(i, sp) }));

const EASE = 'cubic-bezier(0.3, 0, 0.3, 1)';
/* squeezed under the press, then it springs back a little too far */
const SQUEEZE = [
	{ transform: 'scale(1, 1)', offset: 0, easing: EASE },
	{ transform: 'scale(0.925, 0.82)', offset: 0.2, easing: EASE },
	{ transform: 'scale(1.045, 1.1)', offset: 0.52, easing: EASE },
	{ transform: 'scale(0.99, 0.975)', offset: 0.78, easing: EASE },
	{ transform: 'scale(1, 1)', offset: 1 },
];
/* the snap into the tick: a short stretch and a squash */
const SNAP = [
	{ transform: 'scale(1, 1)', offset: 0, easing: EASE },
	{ transform: 'scale(1.06, 0.9)', offset: 0.25, easing: EASE },
	{ transform: 'scale(0.975, 1.07)', offset: 0.55, easing: EASE },
	{ transform: 'scale(1, 1)', offset: 1 },
];
const POP = [
	{ transform: 'scale(0) rotate(-24deg)', opacity: 0, offset: 0, easing: EASE },
	{ transform: 'scale(1.35) rotate(5deg)', opacity: 1, offset: 0.55, easing: EASE },
	{ transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 1 },
];
const HOLD = [{ opacity: 1 }, { opacity: 1 }]; // a pause that is itself an animation, so it stops with the lab
/* the idle streak across the blue: it sweeps once, then rests for the rest of the loop */
const SWEEP = [
	{ transform: 'translate3d(-150%, 0, 0) skewX(-18deg)', opacity: 1, offset: 0 },
	{ transform: 'translate3d(360%, 0, 0) skewX(-18deg)', opacity: 1, offset: 0.38 },
	{ transform: 'translate3d(360%, 0, 0) skewX(-18deg)', opacity: 1, offset: 1 },
];

/* ---------- the lab: governed animations ---------- */

const gov = govern(stage);
const anims = new Set();
let state = 'ready'; // ready | running | done
let token = 0; // bumped by every reset, so a run that was cancelled stops where it is
let lastAct = performance.now();
let doneAt = 0;

/* fill 'none' by default: a finished squeeze must not keep overriding the button's own hover and press. The animations
   that hold a value (the fill, the rail, the ghost) say fill: 'both' and are released by hand once the style is set. */
function play(el, frames, opts) {
	const a = el.animate(frames, { fill: 'none', ...opts });
	anims.add(a);
	gov.apply(); // paused at once if the lab is held (off-screen, hidden tab, Pause)
	return a;
}
const finished = (a) => a.finished.then(() => true, () => false);
const release = (...list) => list.forEach((a) => { a.cancel(); anims.delete(a); });

let sheenAnim = null;
function startSheen() {
	stopSheen();
	if (prefersReducedMotion()) return;
	sheenAnim = play(sheen, SWEEP, { duration: 4600, delay: 1400, iterations: Infinity, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
}
function stopSheen() {
	if (sheenAnim) release(sheenAnim);
	sheenAnim = null;
}

/* ---------- the button, the rail and the words ---------- */

function setFill(p) {
	fill.style.transform = fillAt(p);
	counter.style.transform = counterAt(p);
}
const setText = (s) => texts.forEach((t) => { t.textContent = s; });
function setProgress(now, text) {
	rail.setAttribute('aria-valuenow', String(now));
	rail.setAttribute('aria-valuetext', text);
}
function setStage(i) {
	const st = STAGES[i];
	setText(st.label);
	status.textContent = st.status;
	card.classList.add(`is-${i + 1}`);
	segs.forEach((s, k) => s.classList.toggle('is-current', k === i));
	setProgress(i === 0 ? 0 : STAGES[i - 1].to, st.text);
}
function stageDone(i) {
	segs[i].classList.remove('is-current');
	segs[i].classList.add('is-done');
	railFills[i].style.transform = 'scaleX(1)';
	setProgress(STAGES[i].to, `${STAGES[i].text} done`);
}

function toReady() {
	state = 'ready';
	card.dataset.state = 'ready';
	['is-1', 'is-2', 'is-3'].forEach((c) => card.classList.remove(c));
	segs.forEach((s) => s.classList.remove('is-current', 'is-done'));
	railFills.forEach((f) => { f.style.transform = 'scaleX(0)'; });
	setFill(100);
	setText('Publish site');
	setProgress(0, 'Not started');
	btn.removeAttribute('aria-disabled');
	btn.removeAttribute('aria-busy');
	btn.setAttribute('aria-label', 'Publish site, simulated');
	again.inert = true;
	startSheen();
}

function reset() {
	token++;
	anims.forEach((a) => a.cancel());
	anims.clear();
	clearConfetti();
	toReady();
	status.textContent = 'Ready. Simulation only.';
}

function toRunning(look = true) {
	state = 'running';
	if (look) {
		card.dataset.state = 'running';
		stopSheen();
	}
	btn.setAttribute('aria-disabled', 'true');
	btn.setAttribute('aria-busy', 'true');
	btn.setAttribute('aria-label', 'Publishing, simulated');
	again.inert = true;
}

function toDone() {
	state = 'done';
	doneAt = performance.now();
	card.dataset.state = 'done';
	setText('Live');
	status.textContent = 'Live! Nothing was uploaded.';
	setProgress(100, 'Live');
	btn.removeAttribute('aria-busy');
	btn.setAttribute('aria-label', 'Live, simulated. Press to publish again');
	again.inert = false;
	// a keyboard user who pressed Publish keeps going from the next control
	if (document.activeElement === btn && btn.matches(':focus-visible')) again.focus({ preventScroll: true });
}

/* ---------- a publish, with motion ---------- */

async function run() {
	if (state !== 'ready') return;
	const my = ++token;
	const alive = () => my === token;
	toRunning(false); // the card keeps its ready look (the arrow, the blue) until the blue has wiped away

	warmConfetti();
	// the press: a squeeze, and the blue wipes away to the right, leaving the pale track to fill
	play(btn, SQUEEZE, { duration: 560 });
	const wipeA = play(fill, [{ transform: fillAt(100) }, { transform: 'translateX(101%)' }], { duration: 300, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'both' });
	const wipeB = play(counter, [{ transform: counterAt(100) }, { transform: 'translateX(-101%)' }], { duration: 300, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'both' });
	if (!(await finished(wipeA)) || !alive()) return;
	card.dataset.state = 'running';
	stopSheen();
	setFill(0);
	release(wipeA, wipeB);

	let from = 0;
	for (let i = 0; i < STAGES.length; i++) {
		const st = STAGES[i];
		setStage(i);
		const sp = i === STAGES.length - 1 ? SETTLE : SPRING;
		const opts = { duration: st.ms, easing: 'linear', fill: 'both' };
		const a = play(fill, fillFrames(from, st.to, sp, fillAt), opts);
		const b = play(counter, fillFrames(from, st.to, sp, counterAt), opts);
		const c = play(railFills[i], railFrames(sp), opts);
		if (!(await finished(a)) || !alive()) return;
		setFill(st.to);
		stageDone(i);
		release(a, b, c);
		from = st.to;
		if (i < STAGES.length - 1 && (!(await finished(play(status, HOLD, { duration: 170 }))) || !alive())) return;
	}

	toDone();
	play(btn, SNAP, { duration: 560 });
	ticks.forEach((t) => play(t, POP, { duration: 560 }));
	burst();
}

/* ---------- a publish, with reduced motion: the labels step through, nothing moves ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function runStill() {
	if (state !== 'ready') return;
	const my = ++token;
	const alive = () => my === token;
	toRunning();
	for (let i = 0; i < STAGES.length; i++) {
		setStage(i);
		setFill(i === 0 ? 0 : STAGES[i - 1].to);
		await sleep(350);
		if (!alive()) return;
		setFill(STAGES[i].to);
		stageDone(i);
	}
	toDone();
}

const start = () => (prefersReducedMotion() ? runStill() : run());

/* ---------- the confetti ---------- */

/* shapes drawn as SVG paths in a 100 × 100 box; canvas-confetti scales each to about 10 px (times scalar) */
const PATHS = {
	drop: 'M50 6C50 6 20 42 20 64a30 30 0 0 0 60 0C80 42 50 6 50 6Z',
	ring: 'M50 12a38 38 0 1 0 0.01 0ZM50 28a22 22 0 1 1-0.01 0Z',
	star: 'M50 4l13.2 29.6 32.3 3.4-24.2 21.6 7 31.7L50 74l-28.3 16.3 7-31.7L4.5 37l32.3-3.4Z',
};
const MATRIX = [0.1, 0, 0, 0.1, -5, -5];
const COLOURS = ['#0c6bed', '#4d9ff3', '#46d0fb', '#ffffff', '#0558dc'];
let fire = null;
let shapes = null;

/* made on the first burst, so a reduced-motion visit never builds it */
function loadConfetti() {
	if (fire) return true;
	try {
		fire = confetti.create(canvas, { resize: true, useWorker: false, disableForReducedMotion: true });
	} catch (err) {
		return false;
	}
	try {
		const make = (d) => confetti.shapeFromPath({ path: d, matrix: MATRIX });
		shapes = { drop: make(PATHS.drop), ring: make(PATHS.ring), star: make(PATHS.star) };
	} catch (err) {
		shapes = null; // no Path2D here: plain circles and stars instead
	}
	return true;
}

/* everything in the air goes, at once: hidden tab, off-screen, Pause, a reset */
function clearConfetti() {
	if (fire) fire.reset();
	canvas.classList.remove('is-firing');
}

/* the canvas is sized here, one pixel per CSS pixel, while nothing is flying (the library only sizes it once) */
function sizeCanvas() {
	const c = canvas.getBoundingClientRect();
	if (c.width && c.height && (canvas.width !== Math.round(c.width) || canvas.height !== Math.round(c.height))) {
		canvas.width = Math.round(c.width);
		canvas.height = Math.round(c.height);
	}
	return c;
}

/* at the press, while the button is busy squeezing: build the shapes and the canvas, so the burst itself has no setup to do */
function warmConfetti() {
	if (prefersReducedMotion() || !loadConfetti()) return;
	sizeCanvas();
	canvas.getContext('2d');
}

function burst() {
	if (prefersReducedMotion() || !gov.isLive()) return;
	if (!loadConfetti()) return;
	const c = sizeCanvas();
	const b = btn.getBoundingClientRect();
	if (!c.width || !c.height) return;
	const k = c.width < 560 ? 0.6 : 1; // fewer pieces on a phone
	const y = (b.top + b.height * 0.35 - c.top) / c.height;
	const xl = (b.left + b.width * 0.16 - c.left) / c.width;
	const xr = (b.left + b.width * 0.84 - c.left) / c.width;
	const xm = (b.left + b.width * 0.5 - c.left) / c.width;
	const drops = shapes ? [shapes.drop, shapes.drop, shapes.drop, shapes.ring, 'circle'] : ['circle'];
	const stars = shapes ? [shapes.star, shapes.star, shapes.drop] : ['star'];
	const base = { colors: COLOURS, ticks: 200, gravity: 0.85, decay: 0.9, disableForReducedMotion: true, zIndex: 1 };
	canvas.classList.add('is-firing');
	const done = [
		fire({ ...base, particleCount: Math.round(36 * k), angle: 62, spread: 52, startVelocity: 40, scalar: 1.7, origin: { x: xl, y }, shapes: drops }),
		fire({ ...base, particleCount: Math.round(36 * k), angle: 118, spread: 52, startVelocity: 40, scalar: 1.7, origin: { x: xr, y }, shapes: drops }),
		fire({ ...base, particleCount: Math.round(28 * k), angle: 90, spread: 74, startVelocity: 48, scalar: shapes ? 1.9 : 1.3, origin: { x: xm, y }, shapes: stars }),
	];
	Promise.all(done).then(() => canvas.classList.remove('is-firing'));
}

document.addEventListener('visibilitychange', () => { if (document.hidden) clearConfetti(); });
new IntersectionObserver((entries) => {
	if (!entries[entries.length - 1].isIntersecting) clearConfetti();
}).observe(stage);

/* ---------- the idle autopilot: a ghost pointer presses Publish ---------- */

let idleTimer = 0;
let ghosting = false;
let ghostToken = 0;

function stopGhost() {
	ghostToken++;
	ghosting = false;
	ghost.getAnimations().forEach((a) => { a.cancel(); anims.delete(a); });
	ghost.style.opacity = '0';
}

async function ghostPress() {
	if (ghosting || state !== 'ready') return;
	ghosting = true;
	const my = ++ghostToken;
	const alive = () => my === ghostToken && state === 'ready';
	const c = card.getBoundingClientRect();
	const b = btn.getBoundingClientRect();
	const tx = b.left - c.left + b.width * 0.64 - 17;
	const ty = b.top - c.top + b.height * 0.52 - 17;
	const at = (x, y, s, o) => ({ transform: `translate3d(${x}px, ${y}px, 0) scale(${s})`, opacity: o });
	const glide = play(ghost, [
		{ ...at(tx + 120, ty + 150, 0.7, 0), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
		{ ...at(tx, ty, 1, 1), offset: 0.7 },
		{ ...at(tx, ty, 0.78, 1), offset: 0.9 },
		{ ...at(tx, ty, 0.78, 1), offset: 1 },
	], { duration: 1300, fill: 'both' });
	const ok = await finished(glide);
	if (!ok || !alive()) { if (my === ghostToken) stopGhost(); return; }
	ghosting = false;
	const away = play(ghost, [at(tx, ty, 0.78, 1), at(tx + 10, ty + 14, 1.15, 0)], { duration: 380, easing: 'ease-out', fill: 'both' });
	run();
	finished(away).then(() => { if (my === ghostToken) { release(glide, away); ghost.style.opacity = '0'; } });
}

function armIdle(ms) {
	clearTimeout(idleTimer);
	if (prefersReducedMotion()) return;
	idleTimer = setTimeout(idleTick, ms);
}
function idleTick() {
	if (prefersReducedMotion()) return;
	const now = performance.now();
	// never while the lab is held, and never under a keyboard user's focus
	if (!gov.isLive() || card.querySelector(':focus-visible') || ghosting) return armIdle(1000);
	if (state === 'ready') {
		const wait = lastAct + IDLE_MS - now;
		if (wait > 50) return armIdle(wait);
		ghostPress();
		return armIdle(1500);
	}
	if (state === 'done') {
		const wait = doneAt + HOLD_MS - now;
		if (wait > 50) return armIdle(wait);
		reset();
		lastAct = performance.now();
		return armIdle(IDLE_MS);
	}
	armIdle(1000);
}

/* ---------- controls ---------- */

/* a person did something: the idle clock starts again, and a ghost in flight gives way */
function touched() {
	lastAct = performance.now();
	if (ghosting || ghost.getAnimations().length) stopGhost();
	armIdle(IDLE_MS);
}
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, touched, { passive: true }));

function setPaused(paused) {
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	gov.setUserPaused(paused);
	if (paused) clearConfetti();
}

function restart() {
	if (gov.userPaused) setPaused(false);
	if (state !== 'ready') reset();
	start();
}
/* the big button works while it waits, and once it says Live it publishes again; mid-run it does nothing */
btn.addEventListener('click', () => { if (state !== 'running') restart(); });
again.addEventListener('click', () => {
	btn.focus({ preventScroll: true }); // keep the keyboard's place when this button goes away
	restart();
});
replayBtn.addEventListener('click', restart);

pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

/* reduced motion switched on or off while the page is open */
reducedMotionQuery.addEventListener?.('change', () => {
	stopGhost();
	reset();
	pauseBtn.disabled = prefersReducedMotion();
	armIdle(IDLE_MS);
});

/* ---------- go ---------- */

boot();
toReady();
if (prefersReducedMotion()) {
	pauseBtn.disabled = true; // nothing loops, so there is nothing to pause
} else {
	armIdle(IDLE_MS);
}
