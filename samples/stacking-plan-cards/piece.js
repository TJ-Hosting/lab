/*
 * Sample 22 — "Sticky Stacking Plan Cards".
 * Five glass plan cards stick to the top of the page, one a little lower than the last, and each shrinks as the next one
 * slides over it. The motion is all CSS (piece.css): a scroll timeline on the list moves only transform and opacity.
 * This file does the small rest: it reads how many cards there are from the list and numbers them (--n and --i, which the
 * CSS maths use), keeps track of which card is in front (the rail's "current" tick, and the Next plan button), lights the
 * rail's ticks itself where there is no scroll timeline (an older browser, or reduced motion), and wires the rail and the
 * two buttons. Nothing here runs on a timer or a frame loop: it answers scrolling and resizing only.
 *
 * New code, written from the idea of the "Stacking Cards" CSS scroll-driven animations demo on scroll-driven-animations.style
 * (https://scroll-driven-animations.style/demos/stacking-cards/css/); that demo's stylesheet and script were not downloaded
 * or read, and none of its code is used here.
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const plans = document.getElementById('plans');
const stack = document.getElementById('stack');
const cards = [...stack.children];
const ticks = [...plans.querySelectorAll('.tick')];
const rail = plans.querySelector('.rail');
const nextBtn = document.querySelector('[data-action="next"]');
const againBtn = document.querySelector('[data-action="again"]');
const last = cards.length - 1;

/* the card count and each card's place come from the list, not from the styles */
plans.style.setProperty('--n', cards.length);
cards.forEach((li, i) => li.style.setProperty('--i', i));
ticks.forEach((t, i) => t.style.setProperty('--i', i));

/* the scroll-driven layout is on only where the browser has scroll timelines and motion is welcome (same test as piece.css) */
const scrolls = () => CSS.supports('animation-timeline', 'view()') && CSS.supports('timeline-scope', '--stack') && !prefersReducedMotion();

/* which cards have stuck: one observer per card watching a thin band along the top of the screen that ends just below
   where that card sticks, so a card counts as "reached" once its top has climbed into its stuck place */
let reached = cards.map((_, i) => i === 0);
let observers = [];

function paint() {
	const cur = Math.max(0, reached.lastIndexOf(true));
	plans.dataset.current = String(cur);
	ticks.forEach((t, i) => {
		const btn = t.querySelector('button');
		t.classList.toggle('is-lit', i <= cur);
		if (i === cur) btn.setAttribute('aria-current', 'step');
		else btn.removeAttribute('aria-current');
	});
	rail.style.setProperty('--fill', (last ? cur / last : 1).toFixed(3));
	nextBtn.textContent = cur === last ? 'Back to start' : 'Next plan';
}

function watch() {
	observers.forEach((o) => o.disconnect());
	observers = cards.map((li, i) => {
		const top = parseFloat(getComputedStyle(li).top) || 0;
		const o = new IntersectionObserver((entries) => {
			reached[i] = entries[entries.length - 1].isIntersecting;
			paint();
		}, { rootMargin: `0px 0px ${-Math.max(0, innerHeight - top - 8)}px 0px` });
		o.observe(li);
		return o;
	});
}

function setMode() {
	plans.dataset.mode = scrolls() ? 'scroll' : 'plain';
	paint();
}

/* the scroll position at which card i has just stuck (the same count the timeline uses) */
function stuckAt(i) {
	if (i <= 0) return 0;
	const T = parseFloat(getComputedStyle(cards[0]).top) || 0;
	const step = (parseFloat(getComputedStyle(cards[1]).top) || 0) - T;
	const pitch = cards[0].offsetHeight - step;
	return Math.round(stack.getBoundingClientRect().top + scrollY - T + i * pitch + 2);
}
const goTo = (i) => scrollTo({ top: stuckAt(Math.min(last, Math.max(0, i))) });
const now = () => Math.max(0, reached.lastIndexOf(true));

ticks.forEach((t, i) => t.querySelector('button').addEventListener('click', () => goTo(i)));
nextBtn.addEventListener('click', () => goTo(now() === last ? 0 : now() + 1));
againBtn.addEventListener('click', () => goTo(0));

let timer = 0;
addEventListener('resize', () => {
	clearTimeout(timer);
	timer = setTimeout(watch, 150);
});
reducedMotionQuery.addEventListener?.('change', setMode);

boot();
setMode();
watch();
