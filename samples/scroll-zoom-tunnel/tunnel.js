/*
 * Sample 19 — "The scroll tunnel".
 * Glass tiles of hosting words fly toward the camera as the page scrolls, and a tile marked "Your site"
 * settles in the middle. The motion is all CSS (tunnel.css): scroll-driven animations on transform and opacity.
 * This file only wires the buttons and keeps the demo button out of reach until it has faded in.
 *
 * Written from the idea only; no source code was read or copied.
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const root = document.documentElement;
const cta = document.querySelector('.tunnel__cta');

/* the tunnel is on only where scroll-driven animations exist and motion is allowed; otherwise the page is a still grid */
const canFly = () => CSS.supports('animation-timeline', 'scroll()') && !prefersReducedMotion();
const maxScroll = () => Math.max(0, root.scrollHeight - innerHeight);
const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/* the demo button fades in at the end of the scroll: until then it is inert, so it can't be focused or tapped unseen */
function sync() {
	cta.inert = canFly() && scrollY < maxScroll() * 0.9;
}

document.querySelectorAll('[data-action="start"]').forEach((b) => {
	b.addEventListener('click', () => scrollTo({ top: 0, behavior: behavior() }));
});
document.querySelectorAll('[data-action="end"]').forEach((b) => {
	b.addEventListener('click', () => scrollTo({ top: maxScroll(), behavior: behavior() }));
});

addEventListener('scroll', sync, { passive: true });
addEventListener('resize', sync);
reducedMotionQuery.addEventListener?.('change', sync);

boot();
sync();
