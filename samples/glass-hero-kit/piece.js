/*
 * Sample 38 — "Aurora hero with beam cards".
 * A frosted glass hero card sits over soft light rays and two slow blobs, in three palettes (Cyan, Azure, Dusk) that
 * crossfade by opacity. Below it, three service cards each carry a beam of light that runs round the border, offset so
 * the beams chase one another. This file builds the aurora (a fixed table of rays per palette, so every visit looks the
 * same), switches the palette, and moves the beams: each card gets four thin strips, one per edge, and a Web Animations
 * API track slides them (transform) and fades them (opacity) so a single comet turns the corners without a break.
 * The rays and blobs themselves are CSS animations inside the [data-motion] stage (piece.css), paused by lab.css
 * off-screen and in a hidden tab; the beams are paused through govern() from js/lab.js. Reduced motion: the rays and
 * blobs stand still, each beam is a static glow at one point on its border, nothing loops. Nothing is sent anywhere,
 * and the figures on the page are labelled placeholders.
 *
 * Adapted from "Light Rays" (apps/www/registry/magicui/light-rays.tsx) and "Border Beam"
 * (apps/www/registry/magicui/border-beam.tsx), both at commit efe76fc5755eca1142dd4f74c1d6f0ace2887e3c, by Magic UI,
 * https://github.com/magicuidesign/magicui, MIT licence (LICENSE.md in that repository). Docs pages:
 * https://magicui.design/docs/components/light-rays and https://magicui.design/docs/components/border-beam
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
 * What it keeps from Light Rays: seven rays per set; each ray's left (8 to 92%), tilt (-28 to 28 degrees), width (160 to
 * 320 px), swing (0.8 to 2.6 degrees), cycle (a 14 s base, each ray 0.75 to 1.25 of it, with a rest at the end), peak
 * opacity (0.6 to 1.1), a length of 70vh that starts 12% above the top, and the same swing-and-fade keyframes (opacity
 * 0 > peak > 0 while the tilt swings one way and back); the two soft radial glows become the two blobs.
 * What it changes: no React, no Motion library; the random values come from a seeded generator so the page is the same
 * every visit; the rays are pre-softened gradients (a half-ellipse, brightest at the top) instead of a blurred,
 * screen-blended div, so nothing blurs while it moves and the rays read on a light sky; the colours are DS v9's cyan and
 * blues, with a navy-and-peach Dusk; delays are negative so the page starts mid-cycle; the blobs drift slowly.
 * What it keeps from Border Beam: a beam is a short gradient (head colour, body colour, transparent tail) moving at
 * constant speed round the card's border, clipped to a thin ring by a mask, with a per-card delay.
 * What it changes: its offset-path / offset-distance animation (not allowed here: only transform and opacity may move)
 * became four strips slid along the four edges, with the keyframes worked out in pixels from the card's measured size
 * and rebuilt when it changes; the cards' delays are set so each beam starts where the one before it leaves.
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const stage = document.querySelector('.kit-stage');
const aurora = document.getElementById('aurora');
const servicesEl = document.getElementById('services');
const cards = [...servicesEl.querySelectorAll('.service')];
const swatches = [...document.querySelectorAll('.swatch')];
const nextBtn = document.querySelector('[data-action="palette"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const hint = document.querySelector('.hint');
const gov = govern(servicesEl);
const canAnimate = typeof Element.prototype.animate === 'function';

/* ---------- the aurora ---------- */

/* colours are "r, g, b"; the Dusk set is navy with one peach ray and a peach blob */
const SETS = {
	cyan: { seed: 7, ray: '70, 208, 251', blobs: [['70, 208, 251', 0.4], ['77, 159, 243', 0.3]] },
	azure: { seed: 19, ray: '12, 107, 237', blobs: [['77, 159, 243', 0.36], ['12, 107, 237', 0.2]] },
	dusk: { seed: 31, ray: '22, 76, 186', accent: '255, 178, 118', blobs: [['16, 64, 160', 0.3], ['255, 188, 128', 0.32]] },
};
const RAYS = 7;
const SPEED = 14; /* seconds: the source's default cycle */

/* a small seeded generator (mulberry32): the same rays every visit */
function seeded(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function buildAurora() {
	const frag = document.createDocumentFragment();
	for (const [name, def] of Object.entries(SETS)) {
		const rnd = seeded(def.seed);
		const set = document.createElement('div');
		set.className = 'aurora__set';
		set.dataset.set = name;
		def.blobs.forEach(([rgb, alpha], i) => {
			const blob = document.createElement('div');
			blob.className = `blob blob--${i + 1}`;
			blob.style.setProperty('--bc', rgb);
			blob.style.setProperty('--ba', String(alpha));
			set.append(blob);
		});
		const rays = document.createElement('div');
		rays.className = 'rays';
		for (let i = 0; i < RAYS; i++) {
			const ray = document.createElement('div');
			ray.className = 'ray';
			const cycle = SPEED * (0.75 + rnd() * 0.5);
			/* spread the starting phases across the cycle (the source delays each ray by a random share of it) */
			const shift = ((i + rnd() * 0.7) / RAYS) * cycle;
			const s = ray.style;
			s.setProperty('--left', (8 + (i + rnd() * 0.9) * (84 / RAYS)).toFixed(1));
			s.setProperty('--rot', (-28 + rnd() * 56).toFixed(1));
			s.setProperty('--w', String(Math.round(160 + rnd() * 160)));
			s.setProperty('--swing', (0.8 + rnd() * 1.8).toFixed(2));
			s.setProperty('--dur', `${(cycle * 1.1).toFixed(2)}s`);
			s.setProperty('--shift', shift.toFixed(2));
			s.setProperty('--peak', (0.6 + rnd() * 0.5).toFixed(2));
			s.setProperty('--rc', def.accent && i === 3 ? def.accent : def.ray);
			rays.append(ray);
		}
		set.append(rays);
		frag.append(set);
	}
	aurora.append(frag);
}

/* ---------- the palette ---------- */

const NAMES = Object.keys(SETS);

function setPalette(name) {
	stage.dataset.palette = name;
	swatches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.palette === name)));
}

swatches.forEach((b) => b.addEventListener('click', () => setPalette(b.dataset.palette)));
nextBtn.addEventListener('click', () => {
	setPalette(NAMES[(NAMES.indexOf(stage.dataset.palette) + 1) % NAMES.length]);
});

/* ---------- the beams ---------- */

const SPEED_PX = 150; /* px per second along the border */
const beams = cards.map((card) => {
	/* the crisp ring, and a copy of it for the soft halo under it */
	const crisp = card.querySelector('.beam');
	const glow = crisp.cloneNode(true);
	glow.classList.add('beam--glow');
	crisp.before(glow);
	const rings = [crisp, glow];
	const pick = (k) => rings.map((r) => r.querySelector(`.beam__s--${k}`));
	return { card, rings, strips: { t: pick('t'), r: pick('r'), b: pick('b'), l: pick('l') }, anims: [], W: 0, H: 0 };
});

/* where each strip sits when the comet's head is s px round the border (clockwise from the top-left corner), L long.
   Each strip has windows [from, to, transform at s]; the left strip has two, because the comet's tail reaches over the
   start of the loop. */
function tracks(W, H, L) {
	const P = 2 * (W + H);
	return {
		P,
		t: [[0, W + L, (s) => `translate3d(${s - L}px, 0, 0)`]],
		r: [[W, W + H + L, (s) => `translate3d(0, ${s - W - L}px, 0)`]],
		b: [[W + H, 2 * W + H + L, (s) => `translate3d(${2 * W + H - s}px, 0, 0)`]],
		l: [[0, L, (s) => `translate3d(0, ${-s}px, 0)`], [2 * W + H, P, (s) => `translate3d(0, ${P - s}px, 0)`]],
	};
}

/* keyframes for one strip over one lap: visible (opacity 1) while the comet overlaps its edge, parked and invisible
   otherwise. Two keyframes at one offset make the jump between the two states. */
function frames(P, segs) {
	const kf = [];
	const at = (s, opacity, transform) => kf.push({ offset: Math.min(1, Math.max(0, s / P)), opacity, transform });
	if (segs[0][0] > 0) at(0, 0, segs[0][2](segs[0][0]));
	segs.forEach(([a, b, f], i) => {
		if (a > 0 && (i === 0 || a > segs[i - 1][1])) at(a, 0, f(a));
		at(a, 1, f(a));
		at(b, 1, f(b));
		const next = segs[i + 1];
		if (b < P) at(b, 0, next ? next[2](next[0]) : f(b));
	});
	if (kf[kf.length - 1].offset < 1) at(P, 0, kf[kf.length - 1].transform);
	return kf;
}

/* a card's laps: how far each card's beam trails the one before it, as a share of the lap, so a beam leaving a card's
   top-right corner is arriving at the next card's top-left (in a row), or one quarter lap behind (in a column) */
function lagOf(b, i) {
	if (i === 0) return 0;
	const prev = beams[i - 1].card;
	const sameRow = Math.abs(prev.offsetTop - b.card.offsetTop) < 4;
	const P = 2 * (b.W + b.H);
	if (!sameRow) return 0.25;
	const gap = b.card.offsetLeft - (prev.offsetLeft + prev.offsetWidth);
	return Math.min(0.45, (b.W + gap) / P);
}

function clearStrips(b) {
	b.anims.forEach((a) => a.cancel());
	b.anims = [];
	Object.values(b.strips).flat().forEach((el) => { el.style.opacity = ''; el.style.transform = ''; });
}

/* one card's beam: measured from the card, rebuilt whenever its size changes */
function build(b, i) {
	const W = b.card.offsetWidth;
	const H = b.card.offsetHeight;
	if (!W || !H) return;
	/* keep the place in the lap across a rebuild */
	const keep = b.anims.length ? b.anims[0].effect.getComputedTiming().progress : null;
	clearStrips(b);
	b.W = W;
	b.H = H;
	const L = Math.round(Math.min(120, Math.max(64, W * 0.3)));
	b.rings.forEach((r) => r.style.setProperty('--L', `${L}px`));
	const tr = tracks(W, H, L);
	const P = tr.P;

	if (prefersReducedMotion() || !canAnimate) {
		/* one still glow on the top edge, the three cards a little apart */
		const s = W * (0.3 + 0.3 * i);
		for (const key of ['t', 'r', 'b', 'l']) {
			const seg = tr[key].find(([a, z]) => s >= a && s <= z);
			b.strips[key].forEach((el) => {
				el.style.opacity = seg ? '1' : '0';
				if (seg) el.style.transform = seg[2](s);
			});
		}
		return;
	}

	const D = Math.round((P / SPEED_PX) * 1000);
	const start = keep ?? ((((0.4 * W / P) - i * lagOf(b, i)) % 1) + 1) % 1;
	for (const key of ['t', 'r', 'b', 'l']) {
		const kf = frames(P, tr[key]);
		b.strips[key].forEach((el) => b.anims.push(el.animate(kf, { duration: D, iterations: Infinity, delay: -start * D, easing: 'linear' })));
	}
	gov.apply();
}

function buildAll() {
	/* measure all first: a card's lag reads its neighbour's size */
	beams.forEach((b) => { b.W = b.card.offsetWidth; b.H = b.card.offsetHeight; });
	beams.forEach(build);
}

/* ---------- controls ---------- */

let paused = false;

function setPaused(v) {
	paused = v;
	pauseBtn.setAttribute('aria-pressed', String(v));
	pauseBtn.textContent = v ? 'Play' : 'Pause';
	stage.classList.toggle('is-user-paused', v);
	gov.setUserPaused(v);
}

pauseBtn.addEventListener('click', () => setPaused(!paused));

function applyMotionPreference() {
	const still = prefersReducedMotion();
	pauseBtn.disabled = still;
	if (still && paused) setPaused(false);
	if (hint) hint.textContent = still ? 'Reduced motion · light held still' : 'Try the three palettes';
	buildAll();
}

/* ---------- start ---------- */

boot();
buildAurora();
applyMotionPreference();

/* measure again when a card changes size (a resize, or the font arriving) */
let timer = 0;
const ro = new ResizeObserver(() => {
	clearTimeout(timer);
	timer = setTimeout(buildAll, 120);
});
cards.forEach((c) => ro.observe(c));

reducedMotionQuery.addEventListener?.('change', applyMotionPreference);
