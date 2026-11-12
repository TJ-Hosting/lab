/*
 * Sample 35 — "Weather window".
 * A glass window that cycles through clear, cloudy, rain, thunderstorm and snow. Each weather has its own sky (CSS
 * gradients that cross-fade), three layers of clouds drawn here in SVG and moved with transform, and an animated weather
 * icon floating in front. A Day/Night switch swaps to the night sky, the night icons and a moon phase; a sample
 * five-day forecast is read from forecast.json beside this file.
 *
 * The icons are Meteocons' "fill" set: SVG animated with SMIL. SMIL inside an <img> cannot be paused, so each icon's
 * SVG text is fetched (same origin), cleaned (no scripts, no on* attributes, no external references, every id that is
 * used gets a prefix of its own so two icons never share a gradient) and inlined. The page then calls
 * svg.pauseAnimations() / unpauseAnimations() from the state of the lab's loop(): off-screen, in a hidden tab, on
 * Pause. Under reduced motion the still "fill-static" set is used and nothing moves.
 *
 * Icons: Meteocons by Bas Milius (https://github.com/basmilius/meteocons), MIT. The SVG files are used unchanged
 * (vendor/meteocons@0.1.0/), apart from the inlining described above. Everything else here is written new.
 *
 * MIT License
 *
 * Copyright (c) 2020-present Bas Milius
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
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const ICONS = new URL('../../vendor/meteocons@0.1.0/', import.meta.url);
const FORECAST = new URL('forecast.json', import.meta.url);

/* the five weathers: the icon for day and for night (Meteocons names), the words, and how overcast each sky is:
   [pale far, dark far, pale mid, dark mid, pale near, dark near, stars] as opacities */
const CONDS = {
	clear: { label: 'Clear', day: 'clear-day', night: 'clear-night' },
	cloudy: { label: 'Cloudy', day: 'overcast-day', night: 'overcast-night' },
	rain: { label: 'Rain', day: 'partly-cloudy-day-rain', night: 'partly-cloudy-night-rain' },
	storm: { label: 'Thunderstorm', day: 'thunderstorms-day-rain', night: 'thunderstorms-night-rain' },
	snow: { label: 'Snow', day: 'partly-cloudy-day-snow', night: 'partly-cloudy-night-snow' },
};
const KEYS = Object.keys(CONDS);
const SKY = {
	'clear-day': [0.55, 0, 0.75, 0, 0, 0, 0],
	'cloudy-day': [0.8, 0.1, 0.9, 0.3, 0.95, 0.45, 0],
	'rain-day': [0.4, 0.55, 0.3, 0.85, 0.15, 0.95, 0],
	'storm-day': [0, 0.8, 0, 1, 0, 1, 0],
	'snow-day': [0.9, 0, 0.95, 0.05, 0.9, 0.1, 0],
	'clear-night': [0.14, 0, 0.2, 0, 0, 0, 0.95],
	'cloudy-night': [0.2, 0.35, 0.25, 0.5, 0.28, 0.6, 0.3],
	'rain-night': [0.08, 0.55, 0.1, 0.75, 0.08, 0.85, 0.1],
	'storm-night': [0, 0.8, 0, 0.95, 0, 1, 0],
	'snow-night': [0.3, 0.2, 0.36, 0.3, 0.3, 0.3, 0.35],
};

const CYCLE = 6; // seconds of live time on each weather
const HOLD = 4; // extra seconds before the cycle moves on after a choice
const DRIFT = [1 / 150, 1 / 95, 1 / 60]; // cloud layers, in pane widths per second (far, mid, near)
const PARALLAX = [5, 11, 20]; // px of pointer parallax per layer

const $ = (sel, root = document) => root.querySelector(sel);
const stage = $('.stage');
const pane = $('#pane');
const floatEl = $('#icon-float');
const shadowEl = $('#icon-shadow');
const slot = $('#icon-slot');
const flashEl = $('#flash');
const tempEl = $('#temp');
const condEl = $('#cond');
const subEl = $('#sub');
const moonImg = $('#moon-img');
const moonName = $('#moon-name');
const moonBox = $('#moon');
const strip = $('#strip');
const stripWrap = $('#strip-wrap');
const stripMark = $('#strip-mark');
const announce = $('#announce');
const pauseBtn = $('[data-action="pause"]');
const nextBtn = $('[data-action="next"]');
const chips = [...document.querySelectorAll('[data-cond]')];
const timeBtns = [...document.querySelectorAll('[data-time]')];
const skyEls = [...document.querySelectorAll('.sky-l')];
const clouds = [...document.querySelectorAll('.cl')];

const state = { cond: 'clear', night: false };
let days = [];
let dayButtons = [];

/* ---------- the icons: fetch, clean, inline ---------- */

const textCache = new Map();
function iconText(set, name) {
	const key = `${set}/${name}`;
	if (!textCache.has(key)) {
		textCache.set(key, fetch(new URL(`${set}/${name}.svg`, ICONS)).then((r) => {
			if (!r.ok) throw new Error(`${key}: ${r.status}`);
			return r.text();
		}));
		textCache.get(key).catch(() => textCache.delete(key));
	}
	return textCache.get(key);
}
const staticUrl = (name) => new URL(`fill-static/${name}.svg`, ICONS).href;

/* parse an icon's SVG text into an element that is safe to inline, or null.
   Scripts, foreign content and on* attributes are dropped, links must stay inside the file, and every id that something
   refers to (a gradient, a clip path) gets the prefix, with its references; ids nothing refers to are dropped. */
function cleanSvg(text, prefix) {
	const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
	const root = doc.documentElement;
	if (!root || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
	root.querySelectorAll('script, foreignObject, iframe, object, embed, style, link, image, a').forEach((n) => n.remove());
	const all = [root, ...root.querySelectorAll('*')];
	const used = new Set();
	const refs = /url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g;
	for (const el of all) {
		for (const a of [...el.attributes]) {
			const name = a.name.toLowerCase();
			if (name.startsWith('on')) { el.removeAttribute(a.name); continue; }
			if (name === 'href' || name === 'xlink:href') {
				if (a.value.startsWith('#')) used.add(a.value.slice(1));
				else el.removeAttribute(a.name);
				continue;
			}
			if (/url\(/i.test(a.value) && !/^\s*url\(\s*['"]?#/i.test(a.value)) { el.removeAttribute(a.name); continue; }
			for (const m of a.value.matchAll(refs)) used.add(m[2]);
		}
	}
	for (const el of all) {
		const id = el.getAttribute('id');
		if (id === null) continue;
		if (used.has(id)) el.setAttribute('id', `${prefix}-${id}`);
		else el.removeAttribute('id');
	}
	for (const el of all) {
		for (const a of [...el.attributes]) {
			const name = a.name.toLowerCase();
			if ((name === 'href' || name === 'xlink:href') && a.value.startsWith('#')) el.setAttribute(a.name, `#${prefix}-${a.value.slice(1)}`);
			else if (a.value.includes('url(')) el.setAttribute(a.name, a.value.replace(refs, (_, q, id) => `url(#${prefix}-${id})`));
		}
	}
	root.setAttribute('aria-hidden', 'true');
	root.setAttribute('focusable', 'false');
	root.removeAttribute('width');
	root.removeAttribute('height');
	return document.importNode(root, true);
}

/* SMIL: the inlined animated icons, started and stopped with the loop */
const smil = new Set();
const SMIL_FRAME = 1.3; // a paused icon shows this moment of its cycle (rain drops, rays and bolt all in view)
function smilRun(svg, run) {
	try {
		if (run) svg.unpauseAnimations();
		else svg.pauseAnimations();
	} catch { /* an engine without SMIL control just shows the icon */ }
}
function smilSetAll(run) {
	smil.forEach((svg) => smilRun(svg, run));
}

let uid = 0;
let iconSeq = 0;
let wantedIcon = '';
let ctl = null;

async function showIcon(name) {
	const seq = ++iconSeq;
	const animated = !prefersReducedMotion();
	let svg = null;
	try {
		svg = cleanSvg(await iconText(animated ? 'fill' : 'fill-static', name), `wx${++uid}`);
	} catch { svg = null; }
	if (seq !== iconSeq) return; // a newer choice arrived while this one was loading
	const item = document.createElement('div');
	item.className = 'icon__item';
	if (svg) {
		item.append(svg);
	} else { // the file would not load or parse: the still icon as a picture
		const img = new Image();
		img.alt = '';
		img.src = staticUrl(name);
		item.append(img);
	}
	const old = [...slot.children];
	if (animated && old.length) item.classList.add('is-in');
	slot.append(item);
	if (svg && animated) {
		smil.add(svg);
		if (ctl && ctl.running) smilRun(svg, true);
		else {
			smilRun(svg, false);
			try { svg.setCurrentTime(SMIL_FRAME); } catch { /* ignore */ }
		}
	}
	if (animated && old.length) {
		void item.offsetWidth; // start the transition from the .is-in state
		item.classList.remove('is-in');
	}
	old.forEach((o) => {
		const gone = () => {
			const s = o.querySelector('svg');
			if (s) { smilRun(s, false); smil.delete(s); }
			o.remove();
		};
		if (animated) {
			o.classList.add('is-out');
			setTimeout(gone, 750);
		} else gone();
	});
}

/* ---------- state to screen ---------- */

const fmt = (t) => `${t < 0 ? '−' : ''}${Math.abs(t)}°`;
const spoken = (t) => `${t < 0 ? 'minus ' : ''}${Math.abs(t)}`;
const dayFor = (cond) => days.find((d) => d.cond === cond) || null;

let targetTemp = 21;
let shownTemp = 21;
let shownText = '';

function render({ say = false } = {}) {
	const c = CONDS[state.cond];
	const when = state.night ? 'night' : 'day';
	const k = `${state.cond}-${when}`;
	const day = dayFor(state.cond);

	pane.dataset.k = k;
	pane.toggleAttribute('data-night', state.night);
	skyEls.forEach((el) => el.classList.toggle('is-on', el.dataset.k === k));
	const sky = SKY[k];
	clouds.forEach((el, i) => {
		el.style.setProperty('--p', sky[i * 2]);
		el.style.setProperty('--d', sky[i * 2 + 1]);
	});
	pane.style.setProperty('--star', sky[6]);

	chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cond === state.cond)));
	timeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.time === when)));
	dayButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(days[i].cond === state.cond)));
	const di = days.findIndex((d) => d.cond === state.cond);
	if (di >= 0) stripMark.style.setProperty('--i', di);

	condEl.textContent = c.label;
	if (day) {
		targetTemp = state.night ? day.lo : day.hi;
		subEl.textContent = state.night ? `Low tonight, high ${fmt(day.hi)}` : `High today, low ${fmt(day.lo)}`;
		const moonUrl = new URL(`fill-static/moon-${day.moon}.svg`, ICONS).href;
		if (moonImg.src !== moonUrl) moonImg.src = moonUrl;
		moonName.textContent = day.moonLabel;
	} else {
		subEl.textContent = state.night ? 'Low tonight' : 'High today';
	}
	moonBox.setAttribute('aria-hidden', String(!state.night));
	if (!ctl || !ctl.running) shownTemp = targetTemp; // no tween while nothing is moving
	paintTemp();
	flashEl.style.opacity = '0';
	flashT = 99;

	if (wantedIcon !== c[when]) {
		wantedIcon = c[when];
		showIcon(wantedIcon);
	}
	if (say) announce.textContent = `${c.label}, ${spoken(targetTemp)} degrees, ${when}. Sample forecast.`;
}

function paintTemp() {
	const t = fmt(Math.round(shownTemp));
	if (t !== shownText) {
		shownText = t;
		tempEl.textContent = t;
	}
}

/* the five small day buttons, from forecast.json (text set with textContent, never as markup) */
function buildStrip() {
	strip.textContent = '';
	stripWrap.classList.add('is-ready');
	dayButtons = days.map((d) => {
		const li = document.createElement('li');
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'day glass glass--sm';
		b.setAttribute('aria-pressed', 'false');
		b.setAttribute('aria-label', `${d.name}: ${CONDS[d.cond].label}, high ${spoken(d.hi)}, low ${spoken(d.lo)}`);
		const name = document.createElement('span');
		name.className = 'day__name';
		name.textContent = d.day;
		const ico = document.createElement('span');
		ico.className = 'day__ico';
		const img = new Image();
		img.alt = '';
		img.width = 54;
		img.height = 54;
		ico.append(img);
		const hi = document.createElement('span');
		hi.className = 'day__hi';
		hi.textContent = fmt(d.hi);
		const lo = document.createElement('span');
		lo.className = 'day__lo';
		lo.textContent = fmt(d.lo);
		b.append(name, ico, hi, lo);
		b.addEventListener('click', () => choose(d.cond));
		li.append(b);
		strip.append(li);
		return b;
	});
	paintStripIcons();
}
function paintStripIcons() {
	const when = state.night ? 'night' : 'day';
	dayButtons.forEach((b, i) => {
		const url = staticUrl(CONDS[days[i].cond][when]);
		const img = b.querySelector('img');
		img.parentNode.dataset.k = `${days[i].cond}-${when}`;
		if (img.src !== url) img.src = url;
	});
}

/* ---------- choosing ---------- */

let cycleClock = 0;

function choose(cond, { auto = false } = {}) {
	if (!CONDS[cond]) return;
	state.cond = cond;
	cycleClock = auto ? 0 : -HOLD;
	render({ say: !auto });
}
function next({ auto = false } = {}) {
	choose(KEYS[(KEYS.indexOf(state.cond) + 1) % KEYS.length], { auto });
}
function setTime(night) {
	if (state.night === night) return;
	state.night = night;
	cycleClock = -HOLD;
	paintStripIcons();
	render({ say: true });
}

chips.forEach((b) => b.addEventListener('click', () => choose(b.dataset.cond)));
timeBtns.forEach((b) => b.addEventListener('click', () => setTime(b.dataset.time === 'night')));
nextBtn.addEventListener('click', () => next());

/* ---------- motion: one loop() for the cycle, the clouds, the float, the number and the lightning ---------- */

const driftPhase = [0, 0, 0];
let bobPhase = 0;
let ghostPhase = 0;
let px = 0;
let py = 0;
let aimX = 0;
let aimY = 0;
let lastPointer = -1e9;
let flashT = 99;
let nextFlash = 2.5;

/* the idle autopilot is a slow ghost pointer, so the window is alive without a hand; a real pointer takes over */
pane.addEventListener('pointermove', (e) => {
	const r = pane.getBoundingClientRect();
	aimX = ((e.clientX - r.left) / r.width) * 2 - 1;
	aimY = ((e.clientY - r.top) / r.height) * 2 - 1;
	lastPointer = performance.now();
}, { passive: true });
pane.addEventListener('pointerleave', () => { lastPointer = -1e9; });

/* every transform of the piece, written from the state above (also used once for the still frame) */
function layout() {
	clouds.forEach((el, i) => {
		const x = (-driftPhase[i] * 50).toFixed(3);
		el.style.transform = `translate3d(calc(${x}% + ${(px * PARALLAX[i]).toFixed(2)}px), ${(py * PARALLAX[i] * 0.5).toFixed(2)}px, 0)`;
	});
	const bob = Math.sin(bobPhase * 1.25);
	floatEl.style.transform = `translate3d(${(px * 9).toFixed(2)}px, ${(bob * 7 + py * 5).toFixed(2)}px, 0)`;
	shadowEl.style.transform = `scale(${(1 - bob * 0.06).toFixed(3)})`;
}

const pulse = (x) => (x < 0 || x > 0.32 ? 0 : Math.sin((x / 0.32) * Math.PI) ** 2);

function tick(dt) {
	cycleClock += dt;
	if (cycleClock >= CYCLE) next({ auto: true });

	ghostPhase += dt;
	bobPhase += dt;
	const fresh = performance.now() - lastPointer < 2500;
	const goalX = fresh ? aimX : Math.sin(ghostPhase * 0.32);
	const goalY = fresh ? aimY : Math.sin(ghostPhase * 0.21 + 1.3) * 0.6;
	const k = Math.min(1, dt * 2.4);
	px += (goalX - px) * k;
	py += (goalY - py) * k;
	for (let i = 0; i < 3; i++) driftPhase[i] = (driftPhase[i] + dt * DRIFT[i]) % 1;
	layout();

	if (shownTemp !== targetTemp) {
		shownTemp += (targetTemp - shownTemp) * Math.min(1, dt * 7);
		if (Math.abs(targetTemp - shownTemp) < 0.05) shownTemp = targetTemp;
		paintTemp();
	}

	// a soft double flash behind the storm: two slow pulses, then a pause of several seconds (never more than 3 a second)
	if (state.cond === 'storm') {
		nextFlash -= dt;
		if (nextFlash <= 0) { flashT = 0; nextFlash = 4.2; }
	}
	if (flashT < 1) {
		flashT += dt;
		flashEl.style.opacity = (0.26 * (pulse(flashT) + 0.7 * pulse(flashT - 0.42))).toFixed(3);
		if (flashT >= 1) flashEl.style.opacity = '0';
	}
}

/* the one loop. loop() runs only while the window is on screen, the tab is visible and motion is allowed;
   its sync() is wrapped so the SMIL timelines of the inlined icons follow exactly the same state */
ctl = loop(stage, tick, { name: 'weather-window' });
{
	const baseSync = ctl.sync;
	let was = false;
	ctl.sync = () => {
		baseSync();
		if (ctl.running === was) return;
		was = ctl.running;
		smilSetAll(was);
		if (!was) { flashEl.style.opacity = '0'; flashT = 99; }
	};
}

pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	if (paused) ctl.stop(); else ctl.start();
});

/* reduced motion: the still icon set, no loop, no Pause; if the setting changes while the page is open, the icon is swapped */
function motionSetting() {
	pauseBtn.disabled = prefersReducedMotion();
	if (wantedIcon) showIcon(wantedIcon);
}
reducedMotionQuery.addEventListener?.('change', motionSetting);

/* ---------- start ---------- */

boot();
pauseBtn.disabled = prefersReducedMotion();
render();
layout();

fetch(FORECAST).then((r) => {
	if (!r.ok) throw new Error(String(r.status));
	return r.json();
}).then((data) => {
	days = (Array.isArray(data.days) ? data.days : []).filter((d) => CONDS[d.cond] && Number.isFinite(d.hi) && Number.isFinite(d.lo)).slice(0, 5);
	buildStrip();
	render();
}).catch(() => {
	const li = document.createElement('li');
	li.textContent = 'The sample forecast could not be loaded.';
	strip.append(li);
	stripWrap.classList.add('is-empty');
});

/* warm the cache with the icons the cycle will want next */
if (!prefersReducedMotion()) {
	const warm = () => KEYS.forEach((key) => ['day', 'night'].forEach((t) => iconText('fill', CONDS[key][t]).catch(() => {})));
	if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 });
	else setTimeout(warm, 1500);
}
