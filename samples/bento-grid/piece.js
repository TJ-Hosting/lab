/*
 * Sample 40 — "Living Glass Bento Grid".
 * Six frosted tiles on a CSS grid (one spans two columns, one two rows), each with a small looping drawing of inline SVG.
 * The loops are CSS animations on transform and opacity; lab.css pauses them in a hidden tab and, because every tile is a
 * [data-motion] region, when the tile is off-screen. Under reduced motion they are never declared, so each drawing sits at its
 * resting pose. This script only handles the tiles' states: hover is pure CSS, a touch tap lifts a tile (the "Learn more"
 * bar slides up), keyboard focus lifts it, "Lift all tiles" lifts every tile, and a "Learn more" press opens a short
 * detail panel built from the tile's data-more text. No timers, no requestAnimationFrame, nothing sent anywhere.
 *
 * Adapted from "Bento Grid" (apps/www/registry/magicui/bento-grid.tsx at commit
 * efe76fc5755eca1142dd4f74c1d6f0ace2887e3c) by Magic UI, https://github.com/magicuidesign/magicui, MIT licence.
 * Docs page: https://magicui.design/docs/components/bento-grid
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
 * What it keeps from the source: a grid of cards with column spans (three columns there, four here) and a fixed row height;
 * a card with a drawing behind its words; on hover the card's words rise (translate-y -40px there), the icon scales down, the
 * drawing scales, and a "Learn more" bar slides up from the bottom edge and fades in (translate-y 10 to 0, opacity 0 to 1,
 * 300 ms); the same bar sits inline on small screens in the source, and here a tap lifts the tile instead.
 * What it changes: no React, Tailwind or Radix, plain HTML, CSS and this module; the tiles are the Lab's light glass (DS v9)
 * and lift on a blue halo (opacity) instead of the source's black overlay; the drawings are new (a gauge, an envelope, a
 * domain tag, a padlock, a calendar with a heartbeat line, a pen), none is the source's marquee, list, beam or calendar;
 * one tile spans two rows; the bar is a button that opens a detail panel instead of a link; the loops pause off-screen,
 * in a hidden tab and under reduced motion.
 */
import { boot, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const grid = document.getElementById('bento');
const tiles = [...grid.querySelectorAll('.tile')];
const liftBtn = document.querySelector('[data-action="lift"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

boot();

/* ---------- touch: a tap lifts a tile (one at a time), a second tap puts it down ---------- */

tiles.forEach((tile) => {
	tile.addEventListener('pointerup', (ev) => {
		if (ev.pointerType !== 'touch' || ev.target.closest('button, .tile__more')) return;
		const on = !tile.classList.contains('is-on');
		tiles.forEach((t) => t.classList.remove('is-on'));
		tile.classList.toggle('is-on', on);
	});
});

/* ---------- keyboard: a tile lifts while focus is inside it (and was put there by the keyboard) ---------- */

grid.addEventListener('focusin', (ev) => {
	const tile = ev.target.closest('.tile');
	if (!tile) return;
	let visible = true;
	try { visible = ev.target.matches(':focus-visible'); } catch { /* an old browser: lift anyway */ }
	if (visible) tile.classList.add('has-focus');
});
grid.addEventListener('focusout', (ev) => {
	const tile = ev.target.closest('.tile');
	if (tile && !tile.contains(ev.relatedTarget)) tile.classList.remove('has-focus');
});

/* ---------- "Learn more": a detail panel slides up over the tile ---------- */

function buildDetail(tile) {
	const layer = document.createElement('div');
	layer.className = 'tile__more';
	layer.inert = true;
	const eyebrow = document.createElement('p');
	eyebrow.className = 'eyebrow';
	eyebrow.textContent = 'Sample content';
	const title = document.createElement('h3');
	title.className = 'tile__more-title';
	title.textContent = tile.querySelector('.tile__title').textContent;
	const text = document.createElement('p');
	text.className = 'tile__more-text';
	text.textContent = tile.dataset.more;
	const back = document.createElement('button');
	back.type = 'button';
	back.className = 'btn btn--sm btn--ghost';
	back.textContent = 'Back';
	layer.append(eyebrow, title, text, back);
	tile.querySelector('.tile__face').append(layer);
	back.addEventListener('click', () => setDetail(tile, false));
	return layer;
}

function setDetail(tile, open) {
	const layer = tile.querySelector('.tile__more') || (open ? buildDetail(tile) : null);
	const more = tile.querySelector('.more');
	if (!layer) return;
	tile.classList.toggle('is-more', open);
	layer.inert = !open;
	more.setAttribute('aria-expanded', String(open));
	if (open) layer.querySelector('button').focus({ preventScroll: true });
	else if (layer.contains(document.activeElement)) more.focus({ preventScroll: true });
}

tiles.forEach((tile) => {
	tile.querySelector('.more').addEventListener('click', () => setDetail(tile, true));
	tile.addEventListener('keydown', (ev) => {
		if (ev.key === 'Escape' && tile.classList.contains('is-more')) setDetail(tile, false);
	});
});

/* ---------- the controls ---------- */

liftBtn.addEventListener('click', () => {
	const on = liftBtn.getAttribute('aria-pressed') !== 'true';
	liftBtn.setAttribute('aria-pressed', String(on));
	grid.classList.toggle('all-on', on);
});

function syncPause() {
	// under reduced motion nothing loops, so there is nothing to pause
	const still = prefersReducedMotion();
	pauseBtn.disabled = still;
	if (still) {
		pauseBtn.setAttribute('aria-pressed', 'false');
		pauseBtn.textContent = 'Pause';
		grid.classList.remove('is-user-paused');
	}
}
pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	grid.classList.toggle('is-user-paused', paused);
});
reducedMotionQuery.addEventListener?.('change', syncPause);
syncPause();
