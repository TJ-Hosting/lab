/*
 * Sample 42 — "Tilted testimonial wall".
 * Three columns of sample review cards on a tilted CSS 3D plane. The page holds one copy of each column; this file adds
 * the second copy that lets each column loop without a seam, marks the wall ready, and wires the two buttons. The motion
 * itself is CSS (piece.css): a transform animation per column, paused by lab.css off-screen and in a hidden tab,
 * and by piece.css under the pointer, on keyboard focus and from the Pause button. Flatten eases the plane to flat
 * and back. Reduced motion: no loop and no tilt (CSS), a still 3 x 3 grid; both buttons are switched off. Every review is
 * placeholder text, labelled as sample content, and nothing is sent anywhere.
 *
 * Adapted from "Marquee" (apps/www/registry/magicui/marquee.tsx) at commit efe76fc5755eca1142dd4f74c1d6f0ace2887e3c, by
 * Magic UI, https://github.com/magicuidesign/magicui, MIT licence (LICENSE.md in that repository).
 * Docs page: https://magicui.design/docs/components/marquee
 *
 * MIT License
 *
 * Copyright (c) Magic UI
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
 *
 * What it keeps from Marquee: the list is rendered twice in a row and both copies slide by their own height plus the
 * gap, so the loop has no seam (its "repeat" prop, here always one extra copy); reverse and pause-on-hover as
 * animation-direction and animation-play-state.
 * What it changes: no React; the copy is made here with cloneNode and hidden from assistive technology (aria-hidden and
 * inert), so a reader hears each card once; the buttons, the flat pose and the reduced-motion grid are new code.
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const wall = document.getElementById('wall');
const flatBtn = document.querySelector('[data-action="flatten"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const cols = [...wall.querySelectorAll('.col')];
const colLabels = cols.map((c) => c.getAttribute('aria-label'));

boot();

/* the looping copy of each column: the same cards, once more, for the seam-free loop */
wall.querySelectorAll('.track').forEach((track) => {
	const copy = track.cloneNode(true);
	copy.classList.add('track--copy');
	copy.setAttribute('aria-hidden', 'true');
	copy.setAttribute('inert', '');
	track.after(copy);
});
wall.classList.add('is-ready');

/* ---------- the controls ---------- */

flatBtn.addEventListener('click', () => {
	const flat = flatBtn.getAttribute('aria-pressed') !== 'true';
	flatBtn.setAttribute('aria-pressed', String(flat));
	flatBtn.textContent = flat ? 'Tilt again' : 'Flatten';
	wall.classList.toggle('is-flat', flat);
});

pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	wall.classList.toggle('is-user-paused', paused);
});

/* under reduced motion the wall is already still and flat, so both controls are off */
function syncStill() {
	const still = prefersReducedMotion();
	flatBtn.disabled = still;
	pauseBtn.disabled = still;
	// a column is a stop in the tab order only while there is motion for it to hold still
	cols.forEach((c, i) => {
		if (still) c.removeAttribute('tabindex'); else c.setAttribute('tabindex', '0');
		c.setAttribute('aria-label', still ? `Column ${i + 1} of 3.` : colLabels[i]);
	});
	if (still) {
		flatBtn.setAttribute('aria-pressed', 'false');
		flatBtn.textContent = 'Flatten';
		pauseBtn.setAttribute('aria-pressed', 'false');
		pauseBtn.textContent = 'Pause';
		wall.classList.remove('is-flat', 'is-user-paused');
	}
}
reducedMotionQuery.addEventListener?.('change', syncStill);
syncStill();
