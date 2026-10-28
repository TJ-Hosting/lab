/*
 * Sample 36 — "Liquid-glass lens panels".
 * A pill menu, a round button and one lens card refract a blue ribbons picture: liquid-glass-js copies the backdrop under each
 * glass shape and bends the copy with an SVG displacement map drawn on a canvas (coloured edges, a bright rim). The lens card
 * drifts slowly and can be dragged; the pill and the button stand still under their labels. Without the filter, or if it fails,
 * the same shapes are plain frosted glass (css/glass.css).
 *
 * Adapted from liquid-glass-js@0.1.0 (README) by Eamon Liu (eamonliu) (https://cdn.jsdelivr.net/npm/liquid-glass-js@0.1.0/README.md), MIT.
 * The library is used as vendored in vendor/liquid-glass-js@0.1.0/ (unchanged). What this file changes, on the lens instances only:
 * the lens window is moved with transform instead of left and top, the card is kept inside the picture, and a cheaper filter
 * (no coloured edges) can take over if frames run long.
 *
 * MIT License
 *
 * Copyright (c) 2026 Eamon Liu
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
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';
import LiquidGlass from '../../vendor/liquid-glass-js@0.1.0/liquid-glass.esm.js';

const root = document.documentElement;
const screenEl = document.querySelector('.piece-screen');
const backdrop = document.querySelector('.backdrop');
const backdropImg = backdrop.querySelector('img');
const navEl = document.getElementById('lens-nav');
const roundEl = document.getElementById('lens-round');
const NAV_RADIUS = 14; // the menu's lens matches its rounded rectangle (DS v9's nav shape)
const stateEl = document.getElementById('lens-state');
const stateText = document.getElementById('lens-state-text'); // the chip's words (its cyan dot stays)
const cardEl = document.getElementById('lens-card'); // the plain frosted stand-in, shown only without the lenses
const panelEl = document.querySelector('.sample-info');
const hintEl = document.querySelector('.hint');
const moveBtn = document.querySelector('[data-action="move"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const reduced = prefersReducedMotion();

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* three strengths for the card, cycled by the round button (convexity -1 is a concave lens: it shrinks) */
const PRESETS = [
	{ name: 'gentle', tint: 0.1, scale: 34, depth: 34, curvature: 2.2, convexity: 1, chroma: 0.08, edge: 0.6 },
	{ name: 'strong', tint: 0.1, scale: 72, depth: 56, curvature: 3, convexity: 1, chroma: 0.16, edge: 0.8 },
	{ name: 'inverted', tint: 0.1, scale: 40, depth: 40, curvature: 2.2, convexity: -1, chroma: 0.1, edge: 0.6 },
];
let presetIndex = 1; // starts on "strong"

/* ---------- can the filter run here? ---------- */

function canBend() {
	try {
		if (typeof SVGFEDisplacementMapElement === 'undefined' || typeof SVGFEImageElement === 'undefined') return false;
		if (!CSS.supports('filter', 'url(#a)') || !CSS.supports('clip-path', 'inset(1px round 4px)')) return false;
		if (!CSS.supports('background', 'color-mix(in srgb, #fff 50%, transparent)')) return false; // the labels' white tint needs it
		return !!document.createElement('canvas').getContext('2d');
	} catch {
		return false;
	}
}

/* ---------- the lenses ---------- */

let lenses = null; // { pill, round, card }
const built = []; // every lens made so far, so a half-built set can still be taken down
let mode = 'off'; // 'on' once the lenses run; 'off' is plain frosted glass

const box = { minX: 0, maxX: 0, minY: 0, maxY: 0 }; // where the card drifts
const reach = { minX: 0, maxX: 0, minY: 0, maxY: 0 }; // where the card may be dragged: the whole picture
const origin = { x: 0, y: 0 }; // the picture's top-left on the screen (the label layer starts there too)
const size = { w: 320, h: 210, r: 56 };
let wide = true;
let layoutKey = '';

let x = 0;
let y = 0;
let heading = 0.42;
let speed = 46;
let glideTo = null;
let holdUntil = 0; // after a drag or a key press the card stays put for a few seconds
let dragging = false;
let cheap = false;

/* put the card at (x, y), inside the picture; in lens mode that is the library's moveTo, without it a transform on the stand-in */
function place(nx, ny) {
	x = clamp(nx, reach.minX, reach.maxX);
	y = clamp(ny, reach.minY, reach.maxY);
	if (mode === 'on') lenses.card.moveTo(x, y);
	else cardEl.style.transform = `translate(${Math.round(x - origin.x)}px, ${Math.round(y - origin.y)}px)`;
}

/* The library moves a lens window with left and top. Here it moves with transform, and the copy inside it moves back the other way,
   so the picture under the glass stays where it is on the screen. */
function adopt(g, { clampMove = false } = {}) {
	for (const el of [g.lensEl, g.lensInner]) {
		el.style.removeProperty('left');
		el.style.removeProperty('top');
	}
	let sized = '';
	g.placeLens = function placeLens() {
		const M = this.margin;
		const lx = Math.round(this.lensX) - M;
		const ly = Math.round(this.lensY) - M;
		this.lensEl.style.transform = `translate(${lx}px, ${ly}px)`;
		this.lensInner.style.transform = `translate(${this.bgX - lx}px, ${this.bgY - ly}px)`;
		const p = this.params;
		const key = `${p.width}x${p.height}r${p.radius}`;
		const s = this.glassEl.style;
		if (key !== sized) {
			sized = key;
			s.width = `${p.width}px`;
			s.height = `${p.height}px`;
			s.borderRadius = `${Math.min(p.radius, p.width / 2, p.height / 2)}px`;
		}
		s.transform = `translate(${Math.round(this.lensX)}px, ${Math.round(this.lensY)}px)`;
	};
	if (clampMove) {
		const move = g.moveTo.bind(g);
		g.moveTo = (mx, my) => move(clamp(mx, reach.minX, reach.maxX), clamp(my, reach.minY, reach.maxY));
		// while a frame budget is blown the cheaper filter stays on, also after a drag ends
		const mode_ = g.setDragMode.bind(g);
		g.setDragMode = (on) => mode_(on || cheap);
	}
	g.placeLens();
}

function measure() {
	const bd = backdrop.getBoundingClientRect();
	const nav = navEl.getBoundingClientRect();
	const rnd = roundEl.getBoundingClientRect();
	const st = stateEl.getBoundingClientRect();
	const pan = panelEl.getBoundingClientRect();
	origin.x = bd.left;
	origin.y = bd.top;
	wide = bd.width >= 640;
	size.w = wide ? 320 : 200;
	size.h = wide ? 210 : 140;
	size.r = wide ? 56 : 42;
	size.h = clamp(Math.round(bd.height * 0.34), 110, size.h); // a short window gets a shorter card
	size.r = Math.min(size.r, size.h / 2);
	speed = wide ? 46 : 36;
	const pad = wide ? 20 : 12;
	reach.minX = bd.left + pad;
	reach.maxX = Math.max(reach.minX, bd.right - pad - size.w);
	reach.minY = bd.top + pad;
	reach.maxY = Math.max(reach.minY, bd.bottom - pad - size.h);
	// the drift stays below the menu row and clear of the description panel: either above it or beside it, whichever has more room
	const top = Math.min(Math.max(nav.bottom, rnd.bottom, wide ? 0 : st.bottom) + 14, reach.maxY);
	const above = { minX: reach.minX, maxX: reach.maxX, minY: top, maxY: Math.max(top, Math.min(reach.maxY, pan.top - 12 - size.h)) };
	const beside = { minX: Math.min(reach.maxX, Math.max(reach.minX, pan.right + 16)), maxX: reach.maxX, minY: top, maxY: reach.maxY };
	const room = (r) => Math.min(r.maxX - r.minX, 400) * Math.min(r.maxY - r.minY, 400);
	Object.assign(box, room(beside) > room(above) ? beside : above);
	return { bd, nav, rnd };
}

const keyOf = ({ bd, nav, rnd }) => [bd.left, bd.top, bd.width, bd.height, nav.left, nav.top, nav.width, nav.height, rnd.left, rnd.top, rnd.width, size.w, size.h].map(Math.round).join(',');

function layout(force = false) {
	const m = measure();
	const { nav, rnd } = m;
	const key = keyOf(m);
	const changed = force || key !== layoutKey;
	layoutKey = key;
	if (mode === 'on' && changed) {
		const { pill, round, card } = lenses;
		Object.assign(pill.params, { width: nav.width, height: nav.height, radius: NAV_RADIUS });
		Object.assign(round.params, { width: rnd.width, height: rnd.height, radius: rnd.width / 2 });
		Object.assign(card.params, { width: size.w, height: size.h, radius: size.r });
		pill.lensX = nav.left;
		pill.lensY = nav.top;
		round.lensX = rnd.left;
		round.lensY = rnd.top;
		for (const g of [pill, round, card]) g.refresh(); // re-copy the backdrop, redraw the maps, realign
	}
	if (mode === 'off') {
		cardEl.style.width = `${size.w}px`;
		cardEl.style.height = `${size.h}px`;
	}
	place(x, y);
}

function restPoint() {
	x = box.minX + (box.maxX - box.minX) * (wide ? 0.6 : 0.5);
	y = box.minY + (box.maxY - box.minY) * (wide ? 0.36 : 0.45);
	heading = wide ? 0.42 : 0.9;
}

/* ---------- the drift ---------- */

const dts = [];
let warm = 0;

function tick(dt, t) {
	// a slow check on the frame budget: if the median frame is long, the cheaper filter takes over (once)
	if (mode === 'on' && !cheap && ++warm > 30) {
		dts.push(dt);
		if (dts.length >= 90) {
			const sorted = dts.splice(0).sort((a, b) => a - b);
			if (sorted[45] > 0.026) {
				cheap = true;
				lenses.card.setDragMode(true);
			}
		}
	}
	if (dragging || performance.now() < holdUntil) return;

	// after a drop outside the drifting area, glide back into it
	if (!glideTo && (x < box.minX - 0.5 || x > box.maxX + 0.5 || y < box.minY - 0.5 || y > box.maxY + 0.5)) {
		glideTo = { x: clamp(x, box.minX, box.maxX), y: clamp(y, box.minY, box.maxY) };
	}
	if (glideTo) {
		const dx = glideTo.x - x;
		const dy = glideTo.y - y;
		const d = Math.hypot(dx, dy);
		if (d < 1) {
			glideTo = null;
			return;
		}
		const v = clamp(d * 3.4, 50, 360); // fast at first, easing out
		const s = Math.min(d, v * dt);
		place(x + (dx / d) * s, y + (dy / d) * s);
		return;
	}
	// a slow wander with bounces off the edges of the area
	heading += Math.sin(t * 0.43 + 0.8) * 0.5 * dt;
	let vx = Math.cos(heading);
	let vy = Math.sin(heading);
	let nx = x + vx * speed * dt;
	let ny = y + vy * speed * dt;
	if (nx < box.minX) { nx = box.minX; vx = Math.abs(vx); } else if (nx > box.maxX) { nx = box.maxX; vx = -Math.abs(vx); }
	if (ny < box.minY) { ny = box.minY; vy = Math.abs(vy); } else if (ny > box.maxY) { ny = box.maxY; vy = -Math.abs(vy); }
	heading = Math.atan2(vy, vx);
	place(nx, ny);
}

/* ---------- start ---------- */

function applyPreset(i) {
	const p = PRESETS[i];
	if (mode === 'on') lenses.card.set(p);
	stateText.textContent = `Sample UI · Lens: ${p.name}`;
}

/* plain frosted glass: the labels keep their .glass look and the card is a frosted stand-in moved by transform */
function useFrosted() {
	while (built.length) {
		try { built.pop().destroy(); } catch { /* a half-built lens has nothing more to remove */ }
	}
	lenses = null;
	mode = 'off';
	root.dataset.lens = 'off';
	cardEl.hidden = false;
	roundEl.disabled = true;
	stateText.textContent = 'Sample UI · Plain frosted glass';
	hintEl.textContent = 'Frosted glass';
	layout(true);
}

function makeLenses() {
	const { nav, rnd } = measure();
	const make = (opts) => {
		const g = new LiquidGlass({ background: backdrop, glow: 0, blur: 0, ...opts });
		built.push(g);
		return g;
	};
	const pill = make({ draggable: false, zIndex: 6, x: nav.left, y: nav.top, width: nav.width, height: nav.height, radius: NAV_RADIUS, scale: 26, depth: 24, curvature: 2.2, chroma: 0.09, edge: 0.55, tint: 0.58 });
	const round = make({ draggable: false, zIndex: 6, x: rnd.left, y: rnd.top, width: rnd.width, height: rnd.height, radius: rnd.width / 2, scale: 24, depth: 26, curvature: 2.2, chroma: 0.09, edge: 0.55, tint: 0.58 });
	const card = make({ draggable: true, zIndex: 4, x, y, width: size.w, height: size.h, radius: size.r, ...PRESETS[presetIndex] });
	adopt(pill);
	adopt(round);
	adopt(card, { clampMove: true });
	lenses = { pill, round, card };
	mode = 'on';
	root.dataset.lens = 'on';
	layoutKey = keyOf(measure()); // the lenses were just made at these sizes and places
	place(x, y);

	// the card takes keys too: the arrows move it
	const ge = card.glassEl;
	ge.tabIndex = 0;
	ge.setAttribute('role', 'group');
	ge.setAttribute('aria-label', 'Glass lens. Drag it, or press the arrow keys to move it.');
	ge.addEventListener('pointerdown', () => { dragging = true; });
	const letGo = () => {
		if (!dragging) return;
		dragging = false;
		holdUntil = performance.now() + 3000; // it rests where it was dropped, then drifts again
		glideTo = null;
		x = card.lensX;
		y = card.lensY;
	};
	ge.addEventListener('pointerup', letGo);
	ge.addEventListener('pointercancel', letGo);
	ge.addEventListener('lostpointercapture', letGo);
	ge.addEventListener('keydown', (ev) => {
		const step = ev.shiftKey ? 72 : 24;
		const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
		if (!d) return;
		ev.preventDefault();
		glideTo = null;
		holdUntil = performance.now() + 3000;
		place(x + d[0], y + d[1]);
	});
	// a refusal of the maps or the filter by the page's policy means the glass cannot work
	document.addEventListener('securitypolicyviolation', useFrosted);
	// the picture arriving late (slow network) leaves the copies stale
	if (!backdropImg.complete) backdropImg.addEventListener('load', () => layout(true), { once: true });
}

async function start() {
	boot();
	stateText.textContent = `Sample UI · Lens: ${PRESETS[presetIndex].name}`;

	// the sample menu goes nowhere: it only moves its highlight
	navEl.addEventListener('click', (ev) => {
		const a = ev.target.closest('a');
		if (!a) return;
		ev.preventDefault();
		navEl.querySelectorAll('a').forEach((el) => el.removeAttribute('aria-current'));
		a.setAttribute('aria-current', 'true');
	});

	// the picture must be ready before it is copied under the glass
	try {
		await Promise.race([backdropImg.decode(), new Promise((r) => setTimeout(r, 2000))]);
	} catch { /* the blue ground still stands in */ }

	measure();
	restPoint();
	if (canBend()) {
		try {
			makeLenses();
		} catch (err) {
			console.warn('liquid-glass lens could not start; showing plain frosted glass:', err && err.message);
			useFrosted();
		}
	} else {
		useFrosted();
	}
	place(x, y);

	// layout follows the window and the description panel (it folds away)
	let timer = 0;
	const later = () => { clearTimeout(timer); timer = setTimeout(() => layout(), 120); };
	addEventListener('resize', later);
	new ResizeObserver(later).observe(panelEl);

	roundEl.addEventListener('click', () => {
		if (mode !== 'on') return;
		presetIndex = (presetIndex + 1) % PRESETS.length;
		applyPreset(presetIndex);
	});

	const randomSpot = () => ({
		x: box.minX + Math.random() * (box.maxX - box.minX),
		y: box.minY + Math.random() * (box.maxY - box.minY),
	});

	if (reduced) {
		// the still frame: the card at its resting place; no loop and nothing that starts motion.
		// Dragging still works (no inertia), and "Move the lens" jumps straight to its new place.
		pauseBtn.disabled = true;
		moveBtn.addEventListener('click', () => {
			const s = randomSpot();
			place(s.x, s.y);
		});
		return;
	}

	// loop() runs only while the window is on screen, the tab is visible and motion is allowed
	const ctl = loop(screenEl, tick, { name: 'liquid-glass-lens' });

	moveBtn.addEventListener('click', () => {
		const s = randomSpot();
		holdUntil = 0;
		heading = Math.random() * Math.PI * 2;
		if (ctl.running) glideTo = s;
		else place(s.x, s.y); // paused: jump straight there
	});

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

start();
