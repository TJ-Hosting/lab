/*
 * Sample 43 — "Browser-frame project showcase".
 * A generic glass browser window and a matching phone show one of three fictional sample sites. The tall picture of
 * the site is slid up and down inside each screen (transform only, never scrollTop): on hover, on keyboard focus, on
 * a tap, and on a slow idle autopilot when nobody touches it. A frosted sheen sweeps across the glass now and then.
 * Three chips (and the Next site button) swap the site with a cross-fade. One loop() from js/lab.js drives it, so
 * nothing runs off-screen, in a hidden tab, on Pause or under reduced motion; there the frames show the top of the
 * site and the chips swap instantly.
 *
 * Written from the idea only; no source code was read or copied. The idea is Magic UI's browser mockup
 * (https://magicui.design/docs/components/safari, MIT licence, Copyright (c) Magic UI): a frame that shows a website
 * picture, and scrolls it on hover. Only its LICENSE.md was looked at. The frame, the phone, the sheen and the
 * motion are new code, written from scratch for the lab.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const showcase = document.getElementById('showcase');
const win = showcase.querySelector('.window');
const phone = showcase.querySelector('.phone');
const winScreen = win.querySelector('.window__screen');
const winScroller = win.querySelector('.scroller');
const phoneScreen = phone.querySelector('.phone__screen');
const phoneScroller = phone.querySelector('.scroller');
const progress = win.querySelector('.progress');
const sheenWin = win.querySelector('.sheen');
const sheenPhone = phone.querySelector('.sheen');
const chips = [...showcase.querySelectorAll('.chip')];
const layers = [...showcase.querySelectorAll('[data-layer]')];
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const SITES = chips.map((c) => c.dataset.site);

/* ---------- which site is showing ---------- */

let cur = 0;
let userChose = false; // once somebody picks a site, the autopilot stops swapping sites
let onSwap = () => {}; // set by the motion path: the scroll and the sheen answer a swap

function setSite(i, byUser) {
	if (byUser) userChose = true;
	if (i === cur) return;
	cur = i;
	chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
	layers.forEach((l) => {
		const on = l.dataset.layer === SITES[i];
		l.classList.toggle('is-on', on);
		l.setAttribute('aria-hidden', String(!on));
	});
	onSwap();
}

chips.forEach((chip, i) => chip.addEventListener('click', () => setSite(i, true)));
nextBtn.addEventListener('click', () => setSite((cur + 1) % SITES.length, true));

/* ---------- the scroll: a position 0 (top of the site) to 1 (bottom), painted as transforms ---------- */

let pos = 0; // the window's picture
let phonePos = 0; // the phone's picture follows a beat behind
let winRange = 0.5833; // how far each tall picture can slide, as a share of its own height
let phoneRange = 0.3434;
let last = ''; // the last painted values, so a still frame writes nothing

function measure() {
	const share = (scroller, screen) => (scroller.offsetHeight > 0 ? Math.max(0, 1 - screen.offsetHeight / scroller.offsetHeight) : 0);
	winRange = share(winScroller, winScreen);
	phoneRange = share(phoneScroller, phoneScreen);
}

function paint() {
	const a = `translate3d(0, ${(-pos * winRange * 100).toFixed(3)}%, 0)`;
	const b = `translate3d(0, ${(-phonePos * phoneRange * 100).toFixed(3)}%, 0)`;
	const c = `scaleX(${pos.toFixed(4)})`;
	const key = a + b + c;
	if (key === last) return;
	last = key;
	winScroller.style.transform = a;
	phoneScroller.style.transform = b;
	progress.style.transform = c;
}

/* ---------- the sheen: a slanted streak of white, swept once across each glass ---------- */

const SHEEN_S = 1.7; // seconds for one sweep
let sheenT = -1; // seconds into a sweep; -1 = at rest
let sheenIn = 2.2; // seconds until the next one

function paintSheen(el, p, from, to) {
	if (p <= 0 || p >= 1) {
		if (el.style.opacity !== '0') el.style.opacity = '0';
		return;
	}
	const e = p * p * (3 - 2 * p);
	el.style.opacity = Math.sin(Math.PI * p).toFixed(3);
	el.style.transform = `translate3d(${(from + (to - from) * e).toFixed(2)}%, 0, 0) skewX(-16deg)`;
}

/* ---------- the motion ---------- */

const hovering = new Set();
let focusKey = false; // a keyboard user is on one of the chips
let touchHold = false; // a tap on a frame holds the page at the bottom; another tap lets it go
let lastType = 'mouse';
let wanting = false;

/* a glide from the current position to `to`, ease in and out; secPerFull = seconds for the whole page */
const tw = { from: 0, to: 0, t: 0, dur: 0 };
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - ((-2 * k + 2) ** 3) / 2);
function glide(to, secPerFull) {
	tw.from = pos;
	tw.to = to;
	tw.t = 0;
	tw.dur = Math.max(0.5, Math.abs(to - pos) * secPerFull);
}

/* the autopilot: what the page does when nobody is touching it. A step is a wait, a glide, or a site swap. */
const IDLE = [['wait', 1.2], ['go', 1, 9], ['wait', 1.6], ['go', 0, 4.8], ['wait', 0.8], ['swap']];
let idleI = 0;
let holdT = 1;
function nextIdle() {
	const s = IDLE[idleI++ % IDLE.length];
	if (s[0] === 'wait') holdT = s[1];
	else if (s[0] === 'go') glide(s[1], s[2]);
	else if (s[0] === 'swap' && !userChose) setSite((cur + 1) % SITES.length, false);
}

function tick(dt) {
	const want = hovering.size > 0 || focusKey || touchHold;
	if (want !== wanting) {
		wanting = want;
		if (want) glide(1, 7); // someone is looking: down to the bottom, slowly
		else { glide(0, 3.4); holdT = 2.4; idleI = 0; } // let go: back to the top, then the autopilot takes over
	}

	if (tw.t < tw.dur) {
		tw.t = Math.min(tw.dur, tw.t + dt);
		pos = tw.from + (tw.to - tw.from) * ease(tw.t / tw.dur);
	} else if (want) {
		if (pos < 1) glide(1, 7); // a swap sent the page back to the top while somebody is still looking
	} else if (holdT > 0) {
		holdT -= dt;
	} else {
		nextIdle();
	}
	const d = pos - phonePos;
	phonePos = Math.abs(d) < 0.0002 ? pos : phonePos + d * (1 - Math.exp(-dt * 4.2));
	paint();

	sheenIn -= dt;
	if (sheenT < 0 && sheenIn <= 0) { sheenT = 0; sheenIn = 8.5; }
	if (sheenT >= 0) {
		sheenT += dt;
		if (sheenT > SHEEN_S + 0.4) sheenT = -1;
	}
	paintSheen(sheenWin, sheenT / SHEEN_S, -140, 380);
	paintSheen(sheenPhone, (sheenT - 0.3) / SHEEN_S, -150, 230);
}

function startMotion() {
	measure();
	new ResizeObserver(() => { measure(); last = ''; paint(); }).observe(showcase);

	// the pointer: a mouse or pen over a frame scrolls it; a tap on a frame holds it open (touch has no hover)
	[win, phone].forEach((el) => {
		el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') hovering.add(el); });
		el.addEventListener('pointerleave', () => hovering.delete(el));
		el.addEventListener('pointercancel', () => hovering.delete(el));
		el.addEventListener('click', () => { if (lastType === 'touch') touchHold = !touchHold; });
	});
	showcase.addEventListener('pointerdown', (e) => { lastType = e.pointerType; }, true);

	// the keyboard: a chip with a focus ring counts as focus on the whole showcase (a mouse click on a chip does not)
	showcase.addEventListener('focusin', (e) => { focusKey = e.target.matches(':focus-visible'); });
	showcase.addEventListener('focusout', () => { focusKey = false; });

	// a swap: the old site glides back to the top while the new one fades in, and a sheen sweeps over it
	onSwap = () => {
		touchHold = false;
		glide(0, 1.4);
		holdT = 1.6;
		idleI = 0;
		sheenT = 0;
		sheenIn = 8.5;
	};

	// loop() runs only while the showcase is on screen, the tab is visible and motion is allowed
	const ctl = loop(showcase, tick, { name: 'browser-frame-showcase' });
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
if (prefersReducedMotion()) {
	// the still: the top of each site, no scroll, no sheen; the chips and Next swap at once (the CSS drops the cross-fade)
	pauseBtn.disabled = true;
} else {
	startMotion();
}
