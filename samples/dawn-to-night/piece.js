/*
 * Sample 24 — "Dawn to night parallax".
 * The landscape is moved by CSS alone (piece.css): scroll-driven animations on transform and opacity, all tied to the page's
 * scroll position. This file does the small rest: it names the stop you are at (Day, Dusk or Night) for the strip and for
 * screen readers, wires the strip's buttons and the two buttons in the panel, and, in browsers without scroll timelines,
 * sets the scene's data-state from the scroll position so the CSS can ease between its three poses. With reduced motion the
 * page is not tall and the scene is a still dusk; the buttons switch it between the three poses at once.
 * It runs on scroll events and clicks only: no timers, no animation frames.
 *
 * Adapted from "Get started with scroll-driven animations in CSS", a Chrome codelab by Bramus Van Damme, Google Chrome for
 * Developers (https://codelabs.developers.google.com/scroll-driven-animations), code samples under the Apache License 2.0.
 * Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0). Unless required by applicable
 * law or agreed to in writing, the work is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied.
 * Changes: the codelab has no script; this file is new code. See piece.css for what was taken from the codelab's styles.
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const STATES = ['day', 'dusk', 'night'];
const root = document.documentElement;
const scene = document.getElementById('scene');
const stops = [...document.querySelectorAll('.stop')];

/* a scroll timeline drives the scene only where it exists and motion is allowed; otherwise the scene shows one of three poses */
const timeline = () => CSS.supports('animation-timeline', 'scroll()') && !prefersReducedMotion();
/* the page is tall (there is something to scroll through) only when motion is allowed */
const tall = () => !prefersReducedMotion();
const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

let span = 1; // how far the page can scroll
let now = -1; // the stop shown now: 0, 1 or 2

const measure = () => { span = Math.max(1, root.scrollHeight - innerHeight); };
const fromScroll = () => Math.round(Math.min(1, Math.max(0, scrollY / span)) * (STATES.length - 1));

/* shows stop i: marks the strip and (without a timeline) sets the scene's pose */
function show(i) {
	if (i === now) return;
	now = i;
	stops.forEach((b, k) => {
		if (k === i) b.setAttribute('aria-current', 'step');
		else b.removeAttribute('aria-current');
	});
	if (!timeline()) scene.dataset.state = STATES[i];
}

function sync() {
	if (tall()) show(fromScroll());
}

/* go to a stop: scroll to its place on the timeline, or (reduced motion) switch the still at once */
function goTo(i) {
	if (tall()) {
		measure();
		scrollTo({ top: (span * i) / (STATES.length - 1), behavior: behavior() });
	} else {
		show(i);
	}
}

stops.forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.i))));
document.querySelector('[data-action="night"]').addEventListener('click', () => goTo(STATES.length - 1));
document.querySelector('[data-action="day"]').addEventListener('click', () => goTo(0));

function setup() {
	measure();
	now = -1;
	if (tall()) {
		show(fromScroll());
	} else {
		scene.dataset.state = 'dusk';
		show(1); // the still: a dusk
	}
}

/* the stacked layout (small screens) places the scene and the strip above the description panel: tell the CSS how tall it is */
const info = document.querySelector('.sample-info');
const dtn = document.getElementById('dtn');
new ResizeObserver(() => dtn.style.setProperty('--panel-h', `${info.offsetHeight}px`)).observe(info);

addEventListener('scroll', sync, { passive: true });
addEventListener('resize', () => { measure(); sync(); });
reducedMotionQuery.addEventListener?.('change', setup);

boot();
setup();
