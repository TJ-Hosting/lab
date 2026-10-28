/*
 * Sample 21 — "Brief-to-Launch Horizontal Journey".
 * Five glass panels ride sideways as the page scrolls. The motion is all CSS (piece.css): a view timeline on the tall
 * section moves the strip, the back and front shapes and the track's dot, with only transform and opacity. This file
 * does the small rest: it keeps the track's "current step" and (in the swipeable row) the dot in step with the scroll,
 * wires the stops and the Take the tour / Start again buttons, and makes the row keyboard-reachable. Nothing here runs
 * on a timer or a frame loop: it answers scroll events only.
 *
 * Adapted from "Horizontal Scrolling Section with view-timeline", a CSS scroll-driven animations demo by Bramus
 * (https://scroll-driven-animations.style/demos/horizontal-section/css/), Apache License 2.0. Copyright Bramus (the site
 * publishes no separate copyright line; its footer reads "Built by Bramus, Chrome Developer Relations Engineer at Google").
 * The demo page credits an original by Cameron Knight; that credit is kept here, and that original was not fetched or read.
 * Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0). Unless required by applicable
 * law or agreed to in writing, the work is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied.
 * Changes: the demo has no script; this file is new code. The idea of a section, a sticky stage and a strip moved along a
 * view timeline comes from the demo (see piece.css for what was changed in the styles).
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const REST = 0.06; // piece.css: the ride ends 6% early, so the last panel rests for the final stretch of the scroll

const journey = document.getElementById('journey');
const pin = journey.querySelector('.journey__pin');
const stick = document.getElementById('stick');
const panels = [...journey.querySelectorAll('.panel')];
const stops = [...journey.querySelectorAll('.stop')];
const last = panels.length - 1;

/* the ride is on only where scroll-driven animations exist and motion is allowed; otherwise the page is a swipeable row */
const rides = () => CSS.supports('animation-timeline', 'view()') && !prefersReducedMotion();
const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/* the ride: how far along the strip we are (0 to 1), and the scroll position of a given point on it */
const rideTop = () => journey.getBoundingClientRect().top + scrollY;
const rideLength = () => Math.max(1, journey.offsetHeight - pin.offsetHeight);
const rideAt = (q) => rideTop() + rideLength() * (1 - REST) * q;
const rideProgress = () => Math.min(1, Math.max(0, (scrollY - rideTop()) / rideLength() / (1 - REST)));

/* the row: the same two numbers from the horizontal scroll */
const rowLength = () => Math.max(1, stick.scrollWidth - stick.clientWidth);
const rowProgress = () => Math.min(1, Math.max(0, stick.scrollLeft / rowLength()));

function sync() {
	const ride = rides();
	const q = ride ? rideProgress() : rowProgress();
	if (ride) journey.style.removeProperty('--p'); // the CSS timeline draws the dot and the fill
	else journey.style.setProperty('--p', q.toFixed(4)); // the row has no timeline: the dot and the fill follow the scroll
	const now = Math.round(q * last);
	stops.forEach((b, i) => {
		if (i === now) b.setAttribute('aria-current', 'step');
		else b.removeAttribute('aria-current');
	});
}

/* the row is a scroll area: it needs a name and a place in the tab order; the ride's stage is not a scroll area */
function setMode() {
	const ride = rides();
	journey.dataset.mode = ride ? 'ride' : 'row';
	if (ride) {
		stick.removeAttribute('tabindex');
		stick.removeAttribute('role');
		stick.removeAttribute('aria-label');
	} else {
		stick.tabIndex = 0;
		stick.setAttribute('role', 'region');
		stick.setAttribute('aria-label', 'The five steps: scroll sideways');
	}
	sync();
}

function goTo(i) {
	if (rides()) {
		scrollTo({ top: rideAt(i / last), behavior: behavior() });
	} else {
		const p = panels[i];
		stick.scrollTo({ left: p.offsetLeft + p.offsetWidth / 2 - stick.clientWidth / 2, behavior: behavior() });
	}
}

stops.forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.go))));
document.querySelectorAll('[data-action="tour"]').forEach((b) => b.addEventListener('click', () => {
	if (rides()) scrollTo({ top: rideTop() + rideLength(), behavior: behavior() }); // the very end of the page
	else goTo(last);
}));
document.querySelectorAll('[data-action="again"]').forEach((b) => b.addEventListener('click', () => goTo(0)));

/* the arrow cue under the first card stops nudging once its panel has slid out of view */
const cue = journey.querySelector('.cue');
if (cue) {
	new IntersectionObserver((entries) => {
		cue.toggleAttribute('data-away', !entries[entries.length - 1].isIntersecting);
	}).observe(cue);
}

addEventListener('scroll', sync, { passive: true });
stick.addEventListener('scroll', sync, { passive: true });
addEventListener('resize', sync);
reducedMotionQuery.addEventListener?.('change', setMode);

boot();
setMode();
