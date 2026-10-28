/*
 * Sample 34 — "Icon micro-interaction set".
 * A toolbar of six toggle buttons (play and pause, menu and close, sun and moon, sound and mute, heart, lock).
 * Each press morphs its icon between two states with GSAP's MorphSVG, every pair with its own easing, and a small burst
 * of dots flies off through the Web Animations API (transform and opacity only, governed by govern() from js/lab.js).
 * When nobody has pressed for a few seconds the toggles flip one by one in a slow wave. The toggles change nothing else.
 *
 * Adapted from "Morphing Play/Pause (MorphSVG)" by Osmo (osmosupply), https://codepen.io/osmosupply/pen/yyyzMee, MIT
 * (public CodePen pens are MIT licensed: https://blog.codepen.io/docs/licensing/). What was kept from the pen: the idea,
 * the shape of its MorphSVG call (a click morphs an outline path with morphSVG, map "complexity", power4.inOut over 0.5 s,
 * kept here for the play and pause toggle) and the thought of a burst of dots on every click.
 * Everything else is new: the twelve icon shapes (icons.js), the five other easings, the toolbar, the idle wave, the
 * burst (Web Animations, not Physics2D) and the pause handling. The pen's stylesheet, font and cursors are not used.
 *
 *   Copyright (c) Osmo (osmosupply) - https://codepen.io/osmosupply/pen/yyyzMee
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *   documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 *   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *   permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *   the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 *   OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * GSAP 3.13.0 and its MorphSVGPlugin are vendored in vendor/gsap@3.13.0/ under GSAP's Standard "No Charge" licence
 * (https://gsap.com/standard-license; its text is in vendor/gsap@3.13.0/LICENSE.md). They are imported, not copied.
 *
 * GSAP runs its own requestAnimationFrame ticker, so this file owns it: the ticker is put to sleep at once and woken only
 * while a toggle or the wave is tweening; it sleeps again the moment nothing tweens, and the global timeline is paused
 * (so tweens freeze where they are) while the piece is off-screen, the tab is hidden, Pause is pressed or the visitor
 * asks for reduced motion. Under reduced motion no tween is ever created: the icons swap instantly.
 */
import { boot, govern, finePointer, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';
import { gsap } from '../../vendor/gsap@3.13.0/index.js';
import { MorphSVGPlugin } from '../../vendor/gsap@3.13.0/MorphSVGPlugin.js';
import { TOGGLES } from './icons.js';

gsap.registerPlugin(MorphSVGPlugin);
gsap.ticker.sleep(); // GSAP starts its ticker when it loads; nothing is tweening yet

const piece = document.getElementById('piece');
const bar = document.getElementById('bar');
const bursts = document.getElementById('bursts');
const pauseBtn = document.querySelector('[data-action="pause"]');
const flipBtn = document.querySelector('[data-action="flip"]');

const START_ON = { heart: true }; // the still frame: the heart starts saved, so there is a filled icon among the outlines
const STEP = 0.55; // seconds between toggles in the wave
const IDLE_FIRST = 1400; // ms after load before the first idle wave
const IDLE_MS = 4500; // ms with nobody pressing before the next one
const MAX_DOTS = 140;

/* ---------- build the toolbar from icons.js ---------- */

bar.innerHTML = TOGGLES.map((d) => `<button class="tog" type="button" aria-pressed="false" aria-label="${d.off.name}">`
	+ `<svg class="ic" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${d.svg}</svg>`
	+ `<span class="tog__state">${d.off.label}</span>`
	+ `<span class="tog__ease" aria-hidden="true">${d.easeName}</span>`
	+ '</button>').join('');

const btns = [...bar.querySelectorAll('.tog')];
const T = TOGGLES.map((def, i) => {
	const btn = btns[i];
	return {
		def,
		btn,
		svg: btn.querySelector('.ic'),
		stateEl: btn.querySelector('.tog__state'),
		morphs: def.morphs.map((m, k) => ({ ...m, el: btn.querySelector(`[data-m="${k}"]`) })),
		parts: (def.props || []).map((p) => ({ ...p, el: btn.querySelector(p.sel) })),
		on: false,
		tl: null,
	};
});

/* ---------- when may anything move? ---------- */

let inView = true;
let userPaused = false;
const live = () => !prefersReducedMotion() && inView && !document.hidden && !userPaused;
const gov = govern(piece); // Web Animations (the bursts) pause with the piece

/* GSAP's ticker: awake only while something tweens */
const busy = new Set();
const track = (tl) => { busy.add(tl); };
const settleTicker = () => { if (!busy.size) gsap.ticker.sleep(); };
const untrack = (tl) => { busy.delete(tl); settleTicker(); };

function sync() {
	if (live()) {
		gsap.globalTimeline.resume(); // GSAP wakes its ticker when it resumes ...
		if (busy.size) gsap.ticker.wake();
		else gsap.ticker.sleep(); // ... so put it back to sleep at once if nothing is mid-tween
		if (idleWaiting) armIdle(1200);
	} else {
		gsap.globalTimeline.pause();
		gsap.ticker.sleep();
	}
}

/* ---------- states ---------- */

function stopTl(t) {
	if (!t.tl) return;
	t.tl.kill();
	busy.delete(t.tl);
	t.tl = null;
}

function setAria(t) {
	const s = t.on ? t.def.on : t.def.off;
	t.btn.setAttribute('aria-pressed', String(t.on));
	t.btn.setAttribute('aria-label', s.name);
	return s;
}

/* jump to a state at once: no morph, no burst (reduced motion, Pause, first paint) */
function snap(t, on) {
	stopTl(t);
	t.on = on;
	t.morphs.forEach((m) => m.el.setAttribute('d', on ? m.on : m.off));
	t.parts.forEach((p) => {
		const vars = { ...(on ? p.on : p.off) };
		if (p.origin) vars.svgOrigin = p.origin;
		gsap.set(p.el, vars);
	});
	gsap.set([t.svg, t.stateEl], { clearProps: 'opacity,transform' });
	t.stateEl.textContent = setAria(t).label;
	settleTicker();
}

/* morph to a state: the shape, the fading parts, the label and a springy press, all in one timeline */
function flip(t, on, { dots = 14 } = {}) {
	if (!live()) {
		snap(t, on);
		return;
	}
	stopTl(t);
	t.on = on;
	const state = setAria(t);
	const d = t.def;
	const tl = gsap.timeline({
		defaults: { duration: d.dur, ease: d.ease },
		onComplete: () => {
			if (t.tl === tl) t.tl = null;
			untrack(tl);
		},
	});
	t.morphs.forEach((m) => {
		const morph = { shape: on ? m.on : m.off, type: m.type || 'linear', map: 'complexity' };
		if (m.shapeIndex !== undefined) morph.shapeIndex = m.shapeIndex;
		tl.to(m.el, { morphSVG: morph }, 0);
	});
	t.parts.forEach((p) => {
		const vars = { ...(on ? p.on : p.off) };
		if (p.origin) vars.svgOrigin = p.origin;
		tl.to(p.el, vars, 0);
	});
	tl.to(t.stateEl, { opacity: 0, y: -5, duration: 0.12, ease: 'power1.in' }, 0)
		.call(() => { t.stateEl.textContent = state.label; }, null, 0.12)
		.fromTo(t.stateEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', immediateRender: false }, 0.12)
		.fromTo(t.svg, { scale: 0.82 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' }, 0);
	t.tl = tl;
	track(tl);
	if (dots) burst(t, dots);
}

/* ---------- the burst: small dots on a ballistic arc, written fresh with the Web Animations API ---------- */

const COLORS = ['#0c6bed', '#4d9ff3', '#46d0fb', '#0b2a63', '#ffffff', '#46d0fb'];
const rand = (a, b) => a + Math.random() * (b - a);

function burst(t, count) {
	if (bursts.childElementCount > MAX_DOTS) return;
	const pr = piece.getBoundingClientRect();
	const ir = t.svg.getBoundingClientRect();
	const ox = ir.left + ir.width / 2 - pr.left;
	const oy = ir.top + ir.height / 2 - pr.top;
	const big = count > 8;

	const ring = document.createElement('i');
	ring.className = 'ring';
	ring.style.left = `${ox}px`;
	ring.style.top = `${oy}px`;
	bursts.append(ring);
	const ra = ring.animate([
		{ transform: 'translate3d(0, 0, 0) scale(0.3)', opacity: 0.8 },
		{ transform: `translate3d(0, 0, 0) scale(${big ? 2.1 : 1.5})`, opacity: 0 },
	], { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' });
	ra.onfinish = ra.oncancel = () => ring.remove();

	for (let i = 0; i < count; i++) {
		const dot = document.createElement('i');
		const shape = Math.random();
		dot.className = shape < 0.62 ? 'dot' : shape < 0.86 ? 'dot dot--bar' : 'dot dot--ring';
		const size = rand(6, 11);
		dot.style.setProperty('--s', `${size}px`);
		dot.style.setProperty('--c', COLORS[(Math.random() * COLORS.length) | 0]);
		dot.style.left = `${ox}px`;
		dot.style.top = `${oy}px`;
		bursts.append(dot);

		const angle = ((-90 + rand(-80, 80)) * Math.PI) / 180;
		const speed = rand(big ? 170 : 110, big ? 330 : 200); // px per second
		const gravity = 760; // px per second squared
		const life = rand(0.85, 1.35); // seconds
		const spin = rand(-260, 260);
		const steps = 8;
		const frames = [];
		for (let k = 0; k <= steps; k++) {
			const s = k / steps;
			const sec = s * life;
			const x = Math.cos(angle) * speed * sec;
			const y = Math.sin(angle) * speed * sec + 0.5 * gravity * sec * sec;
			const scale = k === 0 ? 0.3 : 1 - 0.45 * s * s;
			frames.push({
				transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(spin * s).toFixed(0)}deg) scale(${scale.toFixed(2)})`,
				opacity: s < 0.6 ? 1 : Math.max(0, 1 - (s - 0.6) / 0.4),
				offset: s,
			});
		}
		const a = dot.animate(frames, { duration: life * 1000, delay: Math.random() * 70, easing: 'linear', fill: 'both' });
		a.onfinish = a.oncancel = () => dot.remove();
	}
}

/* ---------- the idle wave ---------- */

let wave = null;
let idleTimer = 0;
let idleWaiting = false;

function cancelWave() {
	if (!wave) return;
	wave.kill();
	busy.delete(wave);
	wave = null;
}

function startWave(manual) {
	cancelWave();
	clearTimeout(idleTimer);
	idleWaiting = false;
	if (!live()) {
		// reduced motion or Pause: Flip all jumps straight to the other states; nothing starts by itself
		if (manual) T.forEach((t) => snap(t, !t.on));
		return;
	}
	const tl = gsap.timeline({
		onComplete: () => {
			if (wave === tl) wave = null;
			untrack(tl);
			armIdle(IDLE_MS);
		},
	});
	T.forEach((t, i) => tl.call(() => flip(t, !t.on, { dots: manual ? 10 : 6 }), null, i * STEP));
	wave = tl;
	track(tl);
}

function armIdle(ms) {
	clearTimeout(idleTimer);
	idleWaiting = false;
	if (prefersReducedMotion()) return;
	idleTimer = setTimeout(idleFire, ms);
}

function idleFire() {
	if (!live()) {
		idleWaiting = true; // sync() sets the timer again when the piece is live
		return;
	}
	// not while someone is using the keyboard on the toolbar, or has the pointer over it
	if (bar.querySelector(':focus-visible') || (finePointer.matches && bar.matches(':hover'))) {
		armIdle(2500);
		return;
	}
	startWave(false);
}

/* ---------- input ---------- */

bar.addEventListener('click', (ev) => {
	const btn = ev.target.closest('.tog');
	if (!btn) return;
	const t = T[btns.indexOf(btn)];
	cancelWave();
	armIdle(IDLE_MS);
	flip(t, !t.on, { dots: 14 });
});

/* a toolbar has one tab stop; the arrow keys, Home and End move between the toggles */
let roving = 0;
function setRoving(i) {
	roving = i;
	btns.forEach((b, k) => { b.tabIndex = k === i ? 0 : -1; });
}
bar.addEventListener('keydown', (ev) => {
	const last = btns.length - 1;
	let n;
	if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') n = roving === last ? 0 : roving + 1;
	else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') n = roving === 0 ? last : roving - 1;
	else if (ev.key === 'Home') n = 0;
	else if (ev.key === 'End') n = last;
	else return;
	ev.preventDefault();
	setRoving(n);
	btns[n].focus();
});
btns.forEach((b, i) => b.addEventListener('focus', () => setRoving(i)));

flipBtn.addEventListener('click', () => {
	armIdle(IDLE_MS);
	startWave(true);
});

pauseBtn.addEventListener('click', () => {
	userPaused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(userPaused));
	pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
	gov.setUserPaused(userPaused);
	sync();
	if (!userPaused) armIdle(IDLE_MS);
});

/* ---------- governance: off-screen, hidden tab, reduced motion ---------- */

new IntersectionObserver((entries) => {
	inView = entries[entries.length - 1].isIntersecting;
	sync();
}).observe(bar);
document.addEventListener('visibilitychange', sync);
reducedMotionQuery.addEventListener?.('change', () => {
	if (prefersReducedMotion()) {
		// settle everything where it is going, stop the wave and the timer, clear the air
		cancelWave();
		clearTimeout(idleTimer);
		T.forEach((t) => snap(t, t.on));
		bursts.replaceChildren();
		pauseBtn.disabled = true;
	} else {
		pauseBtn.disabled = false;
		armIdle(IDLE_MS);
	}
	sync();
});

/* ---------- start ---------- */

boot();
T.forEach((t) => snap(t, START_ON[t.def.key] === true));
setRoving(0);
if (prefersReducedMotion()) {
	pauseBtn.disabled = true;
	sync();
} else {
	sync();
	armIdle(IDLE_FIRST);
}
