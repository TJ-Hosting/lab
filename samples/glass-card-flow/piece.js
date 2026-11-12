/*
 * Sample 20 — "Glass Card Flow".
 * A sideways scroller of glass cards (small website mockups drawn in CSS). The 3D tilt is all CSS (piece.css):
 * scroll-driven animations on transform and opacity. This file does the rest: it copies each card into its floor
 * reflection, keeps the centred card and its name label in step with the scroll, wires Previous, Next, the arrow
 * keys, a mouse drag and the wheel, and drifts the row to the next card every few seconds until the visitor
 * touches it. Without scroll-driven animations, or with reduced motion, the row stays flat and nothing drifts.
 *
 * Adapted from "Cover Flow: Single Animation", a CSS scroll-driven animations demo by Bramus
 * (https://scroll-driven-animations.style/demos/cover-flow/css/), Apache License 2.0.
 * Copyright Bramus (the site publishes no separate copyright line; its footer reads "Built by Bramus, Chrome
 * Developer Relations Engineer at Google").
 * Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0). Unless required
 * by applicable law or agreed to in writing, the work is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied.
 * Changes: the demo's few lines of script (a click-and-drag scroller) are replaced by this file; the albums are
 * CSS-drawn cards; reflections, centre tracking, buttons, keys, wheel, idle drift and reduced-motion handling are
 * new code; no polyfill is loaded.
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const START = 3; // the card in the middle when the page opens, so the first screen shows a fan on both sides
const FIRST_DRIFT_MS = 3200;
const DRIFT_MS = 3400;

const wrap = document.getElementById('flow-wrap');
const flow = document.getElementById('flow');
const items = [...flow.querySelectorAll('.flow__item')];
const nameEl = document.getElementById('flow-name');
const countEl = document.getElementById('flow-count');
const prevBtn = document.querySelector('[data-action="prev"]');
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const total = items.length;

const gov = govern(wrap); // its isLive() tells the drift timer whether to fire: on screen and the tab is visible

let index = START;
let touched = false; // the visitor has interacted: the drift is off
let paused = false;
let timer = 0;
let dir = 1;

const pitch = () => items[0].offsetWidth;
const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');
const clamp = (i) => Math.max(0, Math.min(total - 1, i));
const nameOf = (i) => items[i].getAttribute('aria-label') || '';

/* ---------- the reflections: a flipped copy of each face (the mask in CSS fades it) ---------- */

items.forEach((li) => {
	const card = li.querySelector('.card');
	const face = li.querySelector('.card__face');
	const mirror = document.createElement('div');
	mirror.className = 'card__mirror';
	mirror.setAttribute('aria-hidden', 'true');
	mirror.append(face.cloneNode(true));
	card.append(mirror);
});

/* ---------- the centred card and its label ---------- */

function mark(i, { animate = true } = {}) {
	items.forEach((li, n) => {
		li.classList.toggle('is-centre', n === i);
		if (n === i) li.setAttribute('aria-current', 'true');
		else li.removeAttribute('aria-current');
	});
	nameEl.textContent = nameOf(i);
	countEl.textContent = `${i + 1} / ${total}`;
	if (animate && !prefersReducedMotion() && gov.isLive()) {
		nameEl.animate(
			[{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
			{ duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
		);
	}
}

function readIndex() {
	return clamp(Math.round(flow.scrollLeft / pitch()));
}

let resizing = false; // while the window is being resized, the scroll position is ours to keep, not to read

function onScroll() {
	if (resizing) return;
	const i = readIndex();
	if (i !== index) {
		index = i;
		mark(i);
	}
}

function goTo(i, { instant = false } = {}) {
	flow.scrollTo({ left: clamp(i) * pitch(), behavior: instant ? 'auto' : behavior() });
}

/* Previous and Next (and the keys) wrap around; the wheel and the drift do not */
const wrapTo = (i) => (i + total) % total;

/* ---------- the visitor takes over: the drift stops and stays off ---------- */

function syncPause() {
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
}

function touch() {
	if (touched) return;
	touched = true;
	paused = true;
	clearTimeout(timer);
	nameEl.setAttribute('aria-live', 'polite'); // a screen reader hears the name once the visitor drives
	syncPause();
}

/* ---------- the idle drift ---------- */

function schedule(ms = DRIFT_MS) {
	clearTimeout(timer);
	if (paused || prefersReducedMotion()) return;
	timer = setTimeout(drift, ms);
}

function drift() {
	// hidden, off-screen, or being hovered: skip this beat and look again later
	if (!gov.isLive() || flow.matches(':hover') || flow.classList.contains('is-dragging')) {
		schedule(1200);
		return;
	}
	if (index + dir < 0 || index + dir > total - 1) dir = -dir;
	goTo(index + dir);
	schedule();
}

pauseBtn.addEventListener('click', () => {
	if (paused) {
		paused = false;
		touched = false;
		nameEl.setAttribute('aria-live', 'off');
		syncPause();
		schedule(900);
	} else {
		paused = true;
		clearTimeout(timer);
		syncPause();
	}
});

/* ---------- input: buttons, keys, wheel, mouse drag, click ---------- */

prevBtn.addEventListener('click', () => { touch(); goTo(wrapTo(index - 1)); });
nextBtn.addEventListener('click', () => { touch(); goTo(wrapTo(index + 1)); });

flow.addEventListener('keydown', (e) => {
	let to = null;
	if (e.key === 'ArrowRight') to = wrapTo(index + 1);
	else if (e.key === 'ArrowLeft') to = wrapTo(index - 1);
	else if (e.key === 'Home') to = 0;
	else if (e.key === 'End') to = total - 1;
	if (to === null) return;
	e.preventDefault();
	touch();
	goTo(to);
});

/* a mouse wheel turns the row one card at a time (a trackpad's sideways swipe scrolls it natively) */
let lastWheel = 0;
flow.addEventListener('wheel', (e) => {
	if (e.ctrlKey) return;
	touch();
	if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
	e.preventDefault();
	const now = performance.now();
	if (now - lastWheel < 260) return;
	lastWheel = now;
	goTo(index + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

/* touch and pen scroll natively; a mouse drags the row (snapping is off while it moves) */
let drag = null;
let dragged = false;
flow.addEventListener('pointerdown', (e) => {
	touch();
	if (e.pointerType !== 'mouse' || e.button !== 0) return;
	drag = { x: e.clientX, left: flow.scrollLeft, id: e.pointerId, moved: false };
});
flow.addEventListener('pointermove', (e) => {
	if (!drag || e.pointerId !== drag.id) return;
	const dx = e.clientX - drag.x;
	if (!drag.moved) {
		if (Math.abs(dx) < 6) return;
		drag.moved = true;
		flow.classList.add('is-dragging');
		flow.setPointerCapture(drag.id);
	}
	flow.scrollLeft = drag.left - dx * 1.3;
});
function endDrag() {
	if (!drag) return;
	const moved = drag.moved;
	drag = null;
	if (!moved) return;
	dragged = true;
	setTimeout(() => { dragged = false; }, 0); // swallow the click that ends a drag
	goTo(readIndex());
	setTimeout(() => flow.classList.remove('is-dragging'), 520); // snapping comes back once it has settled
}
flow.addEventListener('pointerup', endDrag);
flow.addEventListener('pointercancel', endDrag);

/* a click on a card brings it to the middle */
flow.addEventListener('click', (e) => {
	if (dragged) return;
	const li = e.target.closest('.flow__item');
	if (!li) return;
	const i = items.indexOf(li);
	if (i !== index) { touch(); goTo(i); }
});

flow.addEventListener('scroll', onScroll, { passive: true });

/* keyboard focus anywhere in the piece or on its controls counts as the visitor taking over */
document.querySelector('.controls').addEventListener('focusin', (e) => {
	if (e.target !== pauseBtn) touch();
});
flow.addEventListener('focusin', touch);

/* ---------- start ---------- */

function centre() {
	flow.scrollLeft = index * pitch();
}

let resizeTimer = 0;
addEventListener('resize', () => {
	resizing = true;
	centre();
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => { resizing = false; centre(); }, 150);
});

reducedMotionQuery.addEventListener?.('change', () => {
	pauseBtn.disabled = prefersReducedMotion();
	if (prefersReducedMotion()) clearTimeout(timer);
	else schedule(FIRST_DRIFT_MS);
});

boot();
centre();
mark(index, { animate: false });
syncPause();
if (prefersReducedMotion()) {
	// a still: the flat row with the centred card marked, nothing drifting
	pauseBtn.disabled = true;
} else {
	schedule(FIRST_DRIFT_MS);
}
