/*
 * Sample 63 — "Page-turn lookbook".
 * A hard-cover sample lookbook on one canvas: the page-flip library curls and shades the pages while you drag a corner,
 * click a page, swipe, or press Previous and Next. The two spreads are each one wide picture, cut here into a left and a
 * right page; the covers are drawn in code. The pictures are illustrative sample content (img/art/page-turn-lookbook-*).
 *
 * Uses StPageFlip (page-flip 2.0.7) by Nodlik, https://nodlik.github.io/StPageFlip/, MIT, vendored unmodified in
 * vendor/page-flip@2.0.7/ with its LICENSE. What this file changes is around it, not in it: a clock and a renderer patch
 * (below) so the library draws only when something moves. Its licence notice:
 *
 *   MIT License
 *   Copyright (c) 2020 Nodlik
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *   documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 *   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 *   persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 *   Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Motion. The library starts a requestAnimationFrame loop of its own that never stops (it redraws the canvas sixty times
 * a second, flipping or not). Here that loop is never handed to the browser: while the library starts up, requestAnimationFrame
 * is swapped for a function that only keeps the library's frame callback (withShim). The callback is then called by hand,
 * from loop() in js/lab.js, with a clock that only runs while we draw, and only while something moves: a flip in flight,
 * a corner nudge, or a few frames after a pointer event. When nothing moves the loop is stopped, so a book at rest, off-screen,
 * in a hidden tab, paused, or under reduced motion costs no frames at all. Under reduced motion the pages jump (the library's
 * turnToPage, no flip) and the book is drawn by direct calls, never by a frame loop.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import { PageFlip } from '../../vendor/page-flip@2.0.7/page-flip.module.js';

const ART = '../../img/art/page-turn-lookbook-';
const PW = 720; // one page, in pixels: nine wide for ten high
const PH = 800;
const SANS = '"Nunito Sans", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const NAVY = '#0a2a63';

/* where the two spreads are cut, in pixels of the 1536 x 1024 pictures: the paper only (no desk, no page edges),
   each page nine tenths as wide as it is high. A 768 px picture would scale these by 0.5. */
const CUT = {
	1: { y: 100, h: 796, l: 52, r: 768 },
	2: { y: 118, h: 772, l: 60, r: 778 },
};

/* what is on each page, for the canvas label (the book has six pages: cover, 1 to 4, back cover) */
const SEEN = [
	'the cover: a pale blue glazed vase on a white plinth, on a blue board',
	'a stack of deep blue glazed bowls',
	'three blue cups and a blue jug, with grey text blocks',
	'blue and white plates on a wooden shelf',
	'a blue and white vase, with grey text blocks',
	'the back cover: a plain blue board with a small sample label',
];

const stage = document.querySelector('.lookbook');
const bookEl = document.getElementById('book');
const flipEl = document.getElementById('flip');
const prevBtn = document.querySelector('[data-action="prev"]');
const nextBtn = document.querySelector('[data-action="next"]');
const readout = document.getElementById('readout');
const tourBtn = document.querySelector('[data-action="tour"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const info = document.querySelector('.sample-info');
const portraitMQ = matchMedia('(max-width: 720px), (max-height: 600px) and (max-width: 1099px)'); // the same query as piece.css

const reduced = prefersReducedMotion(); // fixed for this visit: a change of the setting reloads the page

/* ---------- the pages, cut and drawn in code ---------- */

function loadImg(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`could not load ${src}`));
		img.src = src;
	});
}
/* AVIF where the browser has it, WebP otherwise */
async function art(name, width) {
	try { return await loadImg(`${ART}${name}-${width}.avif`); } catch { return loadImg(`${ART}${name}-${width}.webp`); }
}

function newPage() {
	const c = document.createElement('canvas');
	c.width = PW;
	c.height = PH;
	const g = c.getContext('2d');
	g.imageSmoothingQuality = 'high';
	return [c, g];
}

function roundRect(g, x, y, w, h, r) {
	g.beginPath();
	g.moveTo(x + r, y);
	g.arcTo(x + w, y, x + w, y + h, r);
	g.arcTo(x + w, y + h, x, y + h, r);
	g.arcTo(x, y + h, x, y, r);
	g.arcTo(x, y, x + w, y, r);
	g.closePath();
}

/* a glass-blue board with a hinge groove along its spine edge ('left' for the front cover, 'right' for the back) */
function drawBoard(g, hinge) {
	const bg = g.createLinearGradient(0, 0, PW, PH);
	bg.addColorStop(0, '#8cc8f9');
	bg.addColorStop(0.5, '#62a9f0');
	bg.addColorStop(1, '#4f98ea');
	g.fillStyle = bg;
	g.fillRect(0, 0, PW, PH);
	const sheen = g.createLinearGradient(0, 0, 0, PH * 0.55);
	sheen.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
	sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
	g.fillStyle = sheen;
	g.fillRect(0, 0, PW, PH * 0.55);
	const left = hinge === 'left';
	const band = g.createLinearGradient(left ? 0 : PW, 0, left ? 56 : PW - 56, 0);
	band.addColorStop(0, 'rgba(14, 58, 130, 0.42)');
	band.addColorStop(0.5, 'rgba(14, 58, 130, 0.12)');
	band.addColorStop(1, 'rgba(14, 58, 130, 0)');
	g.fillStyle = band;
	g.fillRect(left ? 0 : PW - 56, 0, 56, PH);
	g.fillStyle = 'rgba(14, 58, 130, 0.28)';
	g.fillRect(left ? 40 : PW - 43, 0, 3, PH);
	g.fillStyle = 'rgba(255, 255, 255, 0.5)';
	g.fillRect(left ? 43 : PW - 45, 0, 2, PH);
	g.strokeStyle = 'rgba(255, 255, 255, 0.55)';
	g.lineWidth = 2;
	g.strokeRect(1, 1, PW - 2, PH - 2);
}

function drawCover(img) {
	const [c, g] = newPage();
	drawBoard(g, 'left');
	const pw = 428;
	const ph = 642; // the cover picture is 2 : 3
	const cx = 46 + (PW - 46) / 2;
	const x = Math.round(cx - pw / 2);
	const y = 82;
	g.save();
	g.shadowColor = 'rgba(14, 52, 120, 0.5)';
	g.shadowBlur = 28;
	g.shadowOffsetY = 12;
	g.fillStyle = '#ffffff';
	g.fillRect(x, y, pw, ph);
	g.restore();
	g.drawImage(img, x, y, pw, ph);
	g.textAlign = 'center';
	g.fillStyle = NAVY;
	g.font = `900 46px ${SANS}`;
	g.fillText('Blue glaze', cx, 776);
	g.font = `600 15px ${MONO}`;
	if ('letterSpacing' in g) g.letterSpacing = '3px';
	g.fillText('SAMPLE LOOKBOOK', cx, 52);
	return c;
}

function drawBack() {
	const [c, g] = newPage();
	drawBoard(g, 'right');
	const cx = (PW - 46) / 2;
	const cy = PH / 2;
	g.save();
	g.shadowColor = 'rgba(14, 52, 120, 0.4)';
	g.shadowBlur = 24;
	g.shadowOffsetY = 8;
	roundRect(g, cx - 190, cy - 72, 380, 144, 16);
	g.fillStyle = 'rgba(255, 255, 255, 0.84)';
	g.fill();
	g.restore();
	g.textAlign = 'center';
	g.fillStyle = NAVY;
	g.font = `900 36px ${SANS}`;
	g.fillText('Sample lookbook', cx, cy - 4);
	g.font = `600 18px ${SANS}`;
	g.fillText('The pictures are illustrative.', cx, cy + 32);
	return c;
}

function cutPage(img, spec, side) {
	const [c, g] = newPage();
	const k = img.naturalWidth / 1536;
	const w = spec.h * (PW / PH);
	g.drawImage(img, (side === 'l' ? spec.l : spec.r) * k, spec.y * k, w * k, spec.h * k, 0, 0, PW, PH);
	return c;
}

async function buildPages() {
	// the covers write text on the canvas: the two fonts are fetched alongside the pictures and waited for (at most 1.5 s)
	const fonts = Promise.all([document.fonts.load(`900 46px ${SANS}`), document.fonts.load(`600 15px ${MONO}`)]).catch(() => {});
	const [cover, s1, s2] = await Promise.all([
		art('cover', 1024), art('spread-1', 1536), art('spread-2', 1536),
		Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]),
	]);
	const sheets = [
		drawCover(cover),
		cutPage(s1, CUT[1], 'l'), cutPage(s1, CUT[1], 'r'),
		cutPage(s2, CUT[2], 'l'), cutPage(s2, CUT[2], 'r'),
		drawBack(),
	];
	return sheets.map((c) => c.toDataURL('image/jpeg', 0.92));
}

/* ---------- the library, with its frame loop taken over ---------- */

let libFrame = null; // the library's own frame callback, kept instead of scheduled

/* run fn with requestAnimationFrame swapped: the first callback it is given is the library's loop, which is kept and not
   scheduled; the loop calling itself again does nothing; any other caller goes through to the real function untouched */
function withShim(fn) {
	const real = window.requestAnimationFrame;
	window.requestAnimationFrame = (cb) => {
		if (libFrame === null) { libFrame = cb; return 0; }
		return cb === libFrame ? 0 : real.call(window, cb);
	};
	try { fn(); } finally { window.requestAnimationFrame = real; }
}

let pf = null;
let render = null;
let fc = null;
let ctx = null;
let canvasEl = null;
let ready = false;
let quiet = false; // true while the page itself moves the book (start-up, resize), so a 'flip' event is not a visitor's
let autoFlip = false; // true from the demo starting a flip until it lands
let userFlipped = false; // the visitor has turned a page: no more nudges
let pointerDown = false;
let paused = false;
let inView = true;
let vt = 0; // the library's clock in ms: it only advances while we draw
let kicks = 0; // frames still owed after an event, so the library can paint what the event changed
let shiftPx = 0;

const live = () => ready && inView && !document.hidden && !paused && !reduced;
const lastIndex = () => pf.getPageCount() - 1;
const canTurn = (dir) => (dir > 0 ? pf.getCurrentPageIndex() < lastIndex() : pf.getCurrentPageIndex() > 0);

/* the canvas is as sharp as the screen (pixel ratio capped at 2); the library works in CSS pixels, so the scale is set
   again before every frame, because the library resets the canvas size on a resize */
function prepareCanvas() {
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	const w = Math.round(canvasEl.offsetWidth * dpr);
	const h = Math.round(canvasEl.offsetHeight * dpr);
	if (canvasEl.width !== w || canvasEl.height !== h) {
		canvasEl.width = w;
		canvasEl.height = h;
	}
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.imageSmoothingQuality = 'high';
}

/* where the book sits across the desk, in pages: a closed cover is the right half of the spread, a closed back cover the
   left half, so the canvas slides half a page sideways to keep the closed book in the middle. It follows the page being
   turned, so it opens and closes with the flip, and follows a drag. */
function shiftOf(spreads, k) {
	const n = spreads.length;
	const i = Math.max(0, Math.min(n - 1, k));
	if (spreads[i].length !== 1) return 0;
	return i === 0 ? -0.5 : i === n - 1 ? 0.5 : 0;
}
function applyShift() {
	let s = 0;
	if (render.getOrientation() === 'landscape') {
		const col = pf.getPageCollection();
		const spreads = col.getSpread();
		const k = col.getCurrentSpreadIndex();
		s = shiftOf(spreads, k);
		const calc = fc.getCalculation();
		if (calc) {
			const forward = calc.getDirection() === 0;
			const done = Math.min(1, Math.max(0, calc.getFlippingProgress() / 100));
			s += (shiftOf(spreads, k + (forward ? 1 : -1)) - s) * (forward ? done : 1 - done);
		}
	}
	const px = Math.round(s * render.getRect().pageWidth * 10) / 10;
	if (px !== shiftPx) {
		shiftPx = px;
		flipEl.style.transform = `translate3d(${px}px, 0, 0)`;
	}
}

/* one frame of the library at the library's clock */
function drawNow() {
	prepareCanvas();
	withShim(() => libFrame(vt));
	applyShift();
}

/* the pump: loop() calls this each frame while a flip, a nudge or a few owed frames are in play, and stops itself after */
let nudge = null;
// render.animation is the library's turn in flight (a plain property of its renderer, version 2.0.7 is pinned): while it is
// set the pump keeps going, and when it is clear and nothing else is owed the pump stops
const pump = loop(bookEl, (dt) => {
	vt += dt * 1000;
	if (nudge) stepNudge(dt);
	drawNow();
	if (kicks > 0) kicks--;
	if (kicks === 0 && !render.animation && !nudge) pump.stop();
}, { name: 'page-turn-lookbook' });
pump.stop(); // at rest it does not run; wake() starts it

function wakeNow() {
	if (!pf) return;
	if (reduced) drawNow();
	else pump.start();
}
/* from inside the library's own calls (events), only a microtask later, so the shim is already off */
function wake(frames = 3) {
	kicks = Math.max(kicks, frames);
	queueMicrotask(wakeNow);
}

/* ---------- the page controls ---------- */

const landscape = () => pf.getOrientation() === 'landscape';

function pageLabel() {
	const i = pf.getCurrentPageIndex();
	if (i === 0) return 'Cover';
	if (i === lastIndex()) return 'Back cover';
	return landscape() ? `Pages ${i}–${i + 1} of ${lastIndex() - 1}` : `Page ${i} of ${lastIndex() - 1}`;
}
function describe() {
	const i = pf.getCurrentPageIndex();
	if (i === 0 || i === lastIndex() || !landscape()) return `${pageLabel()}: ${SEEN[i]}.`;
	return `${pageLabel()}: ${SEEN[i]}; ${SEEN[i + 1]}.`;
}
function setDisabled(btn, off) {
	btn.setAttribute('aria-disabled', String(off));
}
function updateUI() {
	readout.textContent = pageLabel();
	canvasEl.setAttribute('aria-label', describe());
	setDisabled(prevBtn, !canTurn(-1));
	setDisabled(nextBtn, !canTurn(1));
}

function go(dir) {
	if (!ready || !canTurn(dir)) return;
	userTouch();
	if (reduced) {
		quiet = true;
		if (dir > 0) pf.turnToNextPage(); else pf.turnToPrevPage();
		quiet = false;
		userFlipped = true;
		updateUI();
		drawNow();
		return;
	}
	if (dir > 0) pf.flipNext(); else pf.flipPrev(); // a flip in flight is finished first, by the library
	wake();
}

/* ---------- idle life: a demo that turns the pages, then a corner that lifts now and then ---------- */

const DEMO_START = 1200; // ms from ready to the first turn
const DEMO_GAP = 2800; // the demo's turns are slow and calm (1.25 s each), then the page rests
const DEMO_FLIP = 1250; // ms a demo turn takes
const DEMO_HOOK = 1500; // the book opens and goes straight on to the next spread, then settles into the slower pace
const USER_FLIP = 900; // ms a turn takes when the visitor makes it
const NUDGE_FIRST = 3200;
const NUDGE_GAP = 4600;

let plan = 'none'; // 'demo' | 'nudge' | 'none'
let timer = 0;
let tour = []; // turns still to make: +1 forward, -1 back
let turns = 0; // demo turns made so far

function schedule(ms) {
	clearTimeout(timer);
	timer = setTimeout(runPlan, ms);
}
function runPlan() {
	timer = 0;
	if (!live()) return; // resume() sets it going again
	if (plan === 'demo') demoStep();
	else if (plan === 'nudge') nudgeStart();
}
/* the way through the book from where it is: on to the back cover, then back to the first spread */
function planTour() {
	const col = pf.getPageCollection();
	const n = col.getSpread().length;
	const k = col.getCurrentSpreadIndex();
	return [...Array(Math.max(0, n - 1 - k)).fill(1), ...Array(Math.max(0, n - 2)).fill(-1)];
}
function demoStep() {
	const dir = tour.shift();
	if (dir === undefined || !canTurn(dir)) { endDemo(); return; }
	autoFlip = true;
	pf.getSettings().flippingTime = DEMO_FLIP; // read by the library whenever a turn starts
	if (dir > 0) pf.flipNext(); else pf.flipPrev();
	if (!render.animation) autoFlip = false; // the library did not start a turn
	wake();
	turns++;
	if (tour.length) schedule(turns === 1 ? DEMO_HOOK : DEMO_GAP);
	else endDemo();
}
function endDemo() {
	tour = [];
	plan = userFlipped ? 'none' : 'nudge';
	if (plan === 'nudge') schedule(NUDGE_FIRST);
}

/* the corner nudge: the library's own drag, played by hand: a finger on the bottom corner of the right-hand page that
   slides in a little and back */
function nudgeStart() {
	if (!canTurn(1) || render.animation || fc.getState() !== 'read' || pointerDown) { schedule(NUDGE_GAP); return; }
	const r = render.getRect();
	const p0 = { x: r.left + r.width - 3, y: r.top + r.height - 3 };
	pf.startUserTouch(p0);
	nudge = { t: 0, dur: 1.5, p0, last: p0, dx: r.pageWidth * 0.2, dy: r.height * 0.06, moved: false };
	wake();
}
function stepNudge(dt) {
	nudge.t = Math.min(1, nudge.t + dt / nudge.dur);
	const s = 0.5 - 0.5 * Math.cos(Math.PI * 2 * nudge.t);
	const p = { x: nudge.p0.x - nudge.dx * s, y: nudge.p0.y - nudge.dy * s };
	pf.userMove(p, true);
	nudge.last = p;
	if (Math.hypot(p.x - nudge.p0.x, p.y - nudge.p0.y) > 5) nudge.moved = true;
	if (nudge.t >= 1) {
		endNudge();
		if (plan === 'nudge') schedule(NUDGE_GAP);
	}
}
/* the finger lets go: the library lays the page back. Aborted at once (a visitor arrives) the page is laid back
   without waiting; before it has moved there is nothing to lay back, and no click to send */
function endNudge(instant = false) {
	const n = nudge;
	nudge = null;
	if (!n) return;
	if (n.moved) {
		pf.userStop(n.last, false);
		if (instant) render.finishAnimation();
	} else {
		pf.userStop(n.last, true);
	}
	wake();
}
const abortNudge = () => endNudge(true);

/* the first touch ends the demo; the nudges go on until a page has been turned */
function userTouch() {
	abortNudge();
	pf.getSettings().flippingTime = USER_FLIP;
	readout.setAttribute('aria-live', 'polite'); // announce page changes from now on (the demo's would be noise)
	if (plan === 'demo') {
		tour = [];
		plan = userFlipped ? 'none' : 'nudge';
		if (plan === 'nudge') schedule(NUDGE_FIRST); else clearTimeout(timer);
	}
}

function onFlip() {
	if (!ready) return;
	updateUI();
	if (quiet) return;
	if (autoFlip) { autoFlip = false; return; }
	userFlipped = true; // a visitor turned a page
	plan = 'none';
	clearTimeout(timer);
	abortNudge();
}

/* back in view, in a visible tab, or played again: a rest that was cut short is not waited out */
function resume() {
	if (!live()) return;
	wake();
	if (plan !== 'none') schedule(render.animation ? 1400 : 450);
}

/* ---------- layout ---------- */

/* the library goes to one page at a time when its box is narrower than twice minWidth (and usePortrait is on): a huge
   minWidth makes that "always", a tiny one "never", so the choice follows the same media query as piece.css */
function setPortrait(on) {
	const s = pf.getSettings();
	s.usePortrait = on;
	s.minWidth = on ? 100000 : 1;
}

function relayout() {
	if (!ready) return;
	quiet = true;
	setPortrait(portraitMQ.matches);
	pf.getUI().update(); // the library measures the canvas and decides one page or two
	quiet = false;
	updateUI();
	drawNow();
}
let relayoutQueued = false;
function queueRelayout() {
	if (relayoutQueued) return;
	relayoutQueued = true;
	queueMicrotask(() => { relayoutQueued = false; relayout(); });
}

/* the info panel is fixed at the bottom left: the book sits above it, however tall it is */
function setDock() {
	const bottom = parseFloat(getComputedStyle(info).bottom) || 18;
	document.querySelector('.lookbook-stage').style.setProperty('--dock', `${Math.round(info.offsetHeight + bottom + 14)}px`);
}

/* ---------- start ---------- */

async function start() {
	boot();
	setDock();
	new ResizeObserver(setDock).observe(info);

	const urls = await buildPages();
	pf = new PageFlip(flipEl, {
		width: PW,
		height: PH,
		size: 'stretch', // the book fits the box piece.css gives it, keeping the page shape
		autoSize: false,
		minWidth: portraitMQ.matches ? 100000 : 1, // see setPortrait()
		maxWidth: 1000,
		minHeight: 120,
		maxHeight: 1400,
		showCover: true, // the front and back covers stand alone, the pages between are spreads
		usePortrait: portraitMQ.matches, // one page at a time on a phone
		drawShadow: true,
		maxShadowOpacity: 0.5,
		flippingTime: USER_FLIP,
		swipeDistance: 24,
		showPageCorners: true,
		useMouseEvents: !reduced, // under reduced motion nothing drags or flips: only the buttons (and a click) turn the page
		startPage: reduced ? 1 : 0, // reduced motion: the book lies open at the first spread
	});
	let inited;
	const initDone = new Promise((resolve) => { inited = resolve; });
	pf.on('init', inited);
	pf.on('flip', onFlip);
	pf.on('changeOrientation', () => { if (ready) updateUI(); });
	pf.on('changeState', () => { if (ready) wake(); });

	quiet = true;
	withShim(() => pf.loadFromImages(urls));
	quiet = false;
	if (libFrame === null) throw new Error('the page-flip frame loop was not found');
	render = pf.getRender();
	fc = pf.getFlipController();
	ctx = render.getContext();
	canvasEl = flipEl.querySelector('canvas');
	canvasEl.setAttribute('role', 'img');

	// paint on a clear canvas (the library paints it white), and tint the library's black page shadows the desk's blue
	render.clear = function () {
		const g = this.getContext();
		g.save();
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, this.canvas.width, this.canvas.height);
		g.restore();
	};
	const makeGradient = ctx.createLinearGradient.bind(ctx);
	ctx.createLinearGradient = (...a) => {
		const grad = makeGradient(...a);
		const add = grad.addColorStop.bind(grad);
		grad.addColorStop = (offset, color) => add(offset, String(color).replace('rgba(0, 0, 0,', 'rgba(14, 40, 92,'));
		return grad;
	};

	await initDone; // the library's own start-up (a timeout of 1 ms) has run
	for (let tries = 0; tries < 100 && Array.from({ length: pf.getPageCount() }, (_, i) => pf.getPage(i)).some((p) => p.isLoad === false); tries++) {
		await new Promise((r) => setTimeout(r, 30));
	}
	ready = true;
	relayout();
	stage.classList.add('is-ready');
	[prevBtn, nextBtn].forEach((b) => setDisabled(b, true));
	updateUI();

	/* input */
	prevBtn.addEventListener('click', () => go(-1));
	nextBtn.addEventListener('click', () => go(1));
	bookEl.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
		else if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
	});
	stage.addEventListener('pointerdown', () => { pointerDown = true; userTouch(); }, true);
	addEventListener('pointerup', () => { pointerDown = false; if (!reduced) wake(6); });
	addEventListener('pointercancel', () => { pointerDown = false; });
	addEventListener('pointermove', (e) => {
		if (reduced) return;
		if (e.pointerType === 'mouse') abortNudge(); // the library follows the mouse while a finger is down: not mine
		// only what can change the book: over the canvas, a drag, or a lifted corner on its way back
		if (e.target === canvasEl || pointerDown || fc.getState() !== 'read') wake();
	}, { passive: true });
	if (reduced) {
		// no drag, no flip: a click on a page turns it, without the animation
		document.querySelector('.hint').textContent = 'Click a page to turn it';
		canvasEl.style.cursor = 'pointer';
		canvasEl.addEventListener('click', (e) => {
			const r = canvasEl.getBoundingClientRect();
			go(e.clientX - r.left < r.width / 2 ? -1 : 1);
		});
	}
	addEventListener('resize', queueRelayout);
	new ResizeObserver(queueRelayout).observe(bookEl);
	portraitMQ.addEventListener('change', queueRelayout);
	reducedMotionQuery.addEventListener('change', () => location.reload());

	/* pause and the demo button */
	if (reduced) {
		pauseBtn.setAttribute('aria-disabled', 'true');
		pauseBtn.setAttribute('title', 'Nothing moves while reduced motion is on');
		tourBtn.setAttribute('aria-disabled', 'true');
		tourBtn.setAttribute('title', 'Turned off while reduced motion is on');
		return;
	}
	const setPaused = (v) => {
		paused = v;
		pauseBtn.setAttribute('aria-pressed', String(v));
		pauseBtn.textContent = v ? 'Play' : 'Pause';
	};
	pauseBtn.addEventListener('click', () => {
		setPaused(!paused);
		if (paused) {
			clearTimeout(timer);
			abortNudge();
			if (render.animation) render.finishAnimation(); // a turn in flight lands at once
			drawNow();
			// not one more frame: after the wake-ups the landing turn has just queued
			queueMicrotask(() => { kicks = 0; if (!nudge) pump.stop(); });
		} else {
			resume();
		}
	});
	tourBtn.addEventListener('click', () => {
		setPaused(false);
		abortNudge();
		if (render.animation) render.finishAnimation();
		readout.setAttribute('aria-live', 'off');
		tour = planTour();
		turns = 1; // no quick second turn after the button
		plan = 'demo';
		schedule(150);
	});

	new IntersectionObserver((entries) => {
		const was = inView;
		inView = entries[entries.length - 1].isIntersecting;
		if (inView && !was) resume(); // back in view (the first callback only confirms what we assumed)
	}).observe(bookEl);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) clearTimeout(timer); else resume();
	});

	// the demo: the book is closed at first, then it turns through the pages
	tour = planTour();
	plan = 'demo';
	schedule(DEMO_START);
}

start().catch((err) => {
	console.warn('page-turn-lookbook:', err.message);
	stage.classList.add('is-failed');
	const note = document.createElement('p');
	note.className = 'note glass glass--soft';
	note.textContent = 'This browser could not draw the lookbook.';
	stage.append(note);
});
