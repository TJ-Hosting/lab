/*
 * Sample 23 — "A Web Request in Milliseconds".
 * One page request as a tall timeline: every step sits as far down the page as its (illustrative) time says. The cards,
 * the server's jobs, the painted page and the two lanes reveal in piece.css, on CSS scroll timelines. This file does the
 * small rest, and only in answer to scrolling: it reads where the counter chip is on the track to show the milliseconds,
 * grows the line to that point, lights the steps time has passed, and wires the two buttons. "Ride the request" scrolls the
 * page for you at 60 ms of trip time per second, through lab.js's loop(), created on the first ride (so nothing runs at rest)
 * and stopped by any wheel, touch or key. Nothing here runs on a timer or when the tab is hidden.
 *
 * Written from the idea only (a vertical scroll-driven timeline whose gaps are proportional to elapsed time, after Bramus's
 * "The Road to Baseline Newly Available" demo on scroll-driven-animations.style, Apache License 2.0); no source code of that
 * demo was read or copied.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const main = document.getElementById('main');
const trip = document.getElementById('trip');
const total = Number(trip.dataset.total);
const nowLine = trip.querySelector('.now');
const out = document.getElementById('ms-now');
const fill = trip.querySelector('.line__fill');
const legs = [...trip.querySelectorAll('.leg')];
const bands = [...trip.querySelectorAll('.band')];
const nodes = [...trip.querySelectorAll('.node:not(.node--end)')];
const rideBtn = document.querySelector('[data-action="ride"]');
const againBtn = document.querySelector('[data-action="again"]');
const starts = legs.map((l) => Number(getComputedStyle(l).getPropertyValue('--at')));
const lasts = legs.map((l) => Number(getComputedStyle(l).getPropertyValue('--ms')));

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/* the trip's own scale, from its box: pixels per millisecond */
const pxPerMs = () => trip.getBoundingClientRect().height / total;

/* where is the chip on the track, in milliseconds? (the chip's stuck wrapper has no height: its top edge is the time) */
let shown = -1;
let current = -2;
function sync() {
	const t = trip.getBoundingClientRect();
	const n = nowLine.getBoundingClientRect();
	const ms = clamp((n.top - t.top) / (t.height / total), 0, total);
	const whole = Math.round(ms);
	if (whole !== shown) {
		shown = whole;
		out.textContent = String(whole);
	}
	fill.style.transform = `scaleY(${(ms / total).toFixed(4)})`;
	// which step is time in, and which has it passed?
	let now = -1;
	starts.forEach((s, i) => { if (ms >= s && ms < s + lasts[i]) now = i; });
	if (ms >= total) now = legs.length - 1;
	if (now !== current) {
		current = now;
		legs.forEach((l, i) => l.classList.toggle('is-now', i === now));
		bands.forEach((b, i) => b.classList.toggle('is-now', i === now));
	}
	nodes.forEach((nd, i) => nd.classList.toggle('is-passed', ms >= starts[i]));
}

/* ---- Ride the request: the page scrolls by itself at 60 ms of trip time per second ---- */
let ctl = null;
let riding = false;
let pos = 0;

/* with reduced motion the button has no ride to offer: it jumps to the end instead, and says so */
const idleLabel = () => (prefersReducedMotion() ? 'Skip to the end' : 'Ride the request');
function setRiding(on) {
	riding = on;
	rideBtn.setAttribute('aria-pressed', String(on));
	rideBtn.textContent = on ? 'Stop the ride' : idleLabel();
	if (!on && ctl) ctl.stop();
}

function ride() {
	if (riding) {
		setRiding(false);
		return;
	}
	if (prefersReducedMotion()) {
		// no motion to run: jump to the finale, where everything is already in place
		scrollTo({ top: maxScroll(), behavior: 'auto' });
		return;
	}
	pos = scrollY >= maxScroll() - 4 ? 0 : scrollY;
	setRiding(true);
	if (!ctl) {
		ctl = loop(main, (dt) => {
			pos += 60 * pxPerMs() * dt;
			const end = maxScroll();
			scrollTo({ top: Math.min(pos, end), behavior: 'instant' });
			if (pos >= end) setRiding(false);
		}, { name: 'ride' });
	}
	ctl.start();
}

/* any wheel, touch or key press takes the page back (the ride button's own keys are its business) */
const inPanel = (ev) => ev.target instanceof Element && ev.target.closest('.sample-info');
const takeBack = (ev) => { if (riding && !inPanel(ev)) setRiding(false); };
addEventListener('wheel', () => { if (riding) setRiding(false); }, { passive: true });
addEventListener('touchstart', takeBack, { passive: true });
addEventListener('keydown', takeBack);

rideBtn.addEventListener('click', ride);
againBtn.addEventListener('click', () => {
	setRiding(false);
	scrollTo({ top: 0, behavior: behavior() });
});

/* with reduced motion switched on after load, a ride in progress ends */
reducedMotionQuery.addEventListener?.('change', () => setRiding(false));

addEventListener('scroll', sync, { passive: true });
addEventListener('resize', sync);

setRiding(false); // sets the button's label for the current motion setting
boot();
sync();
