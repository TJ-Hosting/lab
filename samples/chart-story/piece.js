/*
 * Sample 51 — "Shape-Shifting Chart Story".
 * One small made-up dataset (visits and orders for a sample shop site, by region and season) is drawn by Vizzu, a chart library
 * whose WebAssembly engine morphs the same marks from bars to stacked bars, a radial chart, a scatter and bubbles.
 * This file is new code written against Vizzu's public API. Vizzu is vendored unchanged in vendor/vizzu@0.18.0/ with its LICENSE.
 *
 * Vizzu (https://github.com/vizzuhq/vizzu-lib) by Vizzu Inc., Apache-2.0.
 *   Vizzu
 *   Copyright 2021-2025 Vizzu Inc.
 *   This product includes software developed at Vizzu Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable law or agreed
 * to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied; see the License for the specific language governing permissions and limitations.
 * What changed: nothing in Vizzu itself. Written here: the dataset, the five chart states, the TJ-Hosting look (transparent plot,
 * blue palette), the step controls, and the governing of Vizzu's clock (see "driving the engine" below).
 *
 * Driving the engine: Vizzu runs its own timer (a 25 ms setInterval) for as long as its scheduler is on, even when nothing moves.
 * Here that scheduler is switched off after start-up and the engine is stepped from loop() (requestAnimationFrame) only while a
 * morph is in flight, so when the chart rests, is off-screen, or the tab is hidden, nothing runs. Under reduced motion each step
 * jumps to its end state (a zero-length animation, stepped by hand a few times) and nothing loops.
 */
import { boot, govern, loop, prefersReducedMotion } from '../../js/lab.js';

const DWELL = 6500; // ms from one step to the next while the story plays itself
const MORPH = '1400ms'; // Vizzu reads a bare number as seconds, so every duration here carries its unit

/* ---------- the sample data: made up, labelled as such on the page ---------- */

const REGIONS = ['East', 'Central', 'Prairies', 'West', 'North'];
const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];
const VISITS = [[38, 52, 71, 49], [66, 84, 96, 79], [24, 33, 45, 31], [41, 58, 88, 54], [9, 14, 22, 11]]; // thousands, [region][season]
const ORDERS = [[9, 15, 24, 14], [17, 23, 31, 21], [5, 8, 12, 7], [11, 19, 33, 17], [2, 3, 6, 2]]; // hundreds
const R = 'Region';
const S = 'Season';
const V = 'Visits (thousands)';
const O = 'Orders (hundreds)';
const rows = REGIONS.flatMap((r, i) => SEASONS.map((s, j) => ({ r, s, v: VISITS[i][j], o: ORDERS[i][j] })));
const DATA = {
	series: [
		{ name: R, values: rows.map((x) => x.r) },
		{ name: S, values: rows.map((x) => x.s) },
		{ name: V, values: rows.map((x) => x.v) },
		{ name: O, values: rows.map((x) => x.o) },
	],
};
const sum = (a) => a.reduce((x, y) => x + y, 0);
const byRegion = REGIONS.map((name, i) => ({ name, total: sum(VISITS[i]) })).sort((a, b) => b.total - a.total);
const bySeason = SEASONS.map((name, j) => ({ name, total: sum(VISITS.map((row) => row[j])) })).sort((a, b) => b.total - a.total);
const list = (a) => a.map((x) => `${x.name} ${x.total}`).join(', ');

/* ---------- the look: DS v9's blues, cyan as light, one honey accent; the plot and its ground are transparent ---------- */

const INK = '#071022';
const MUTED = '#3b4a66';
const LINE = '#cddff1';
const CLEAR = '#00000000';
// winter blue, spring cyan, summer honey, autumn pale blue: all light enough for the ink labels inside the bubbles (4.5:1 or better)
const SEASON_COLOURS = ['#2b84f0', '#46d0fb', '#ffb547', '#8fbdf2'];

const STYLE = {
	fontFamily: 'Nunito Sans',
	fontWeight: 600,
	backgroundColor: CLEAR,
	logo: { width: 0 },
	plot: {
		backgroundColor: CLEAR,
		marker: {
			colorPalette: SEASON_COLOURS.join(' '),
			fillOpacity: 0.96,
			borderWidth: 1.5,
			borderOpacity: 0.55,
			rectangleSpacing: 0.14,
			circleMinRadius: 0.017,
			circleMaxRadius: 0.1,
			guides: { color: CLEAR },
			label: { color: INK, filter: 'none', fontWeight: 800, format: 'dimensionsFirst' },
		},
		xAxis: {
			color: '#5e80ae',
			ticks: { color: '#5e80ae' },
			interlacing: { color: CLEAR },
			guides: { color: LINE },
			label: { color: MUTED },
			title: { color: MUTED, fontWeight: 700, paddingTop: '2.1em' },
		},
		yAxis: {
			color: CLEAR,
			ticks: { color: CLEAR },
			interlacing: { color: '#4d9ff31c' },
			guides: { color: LINE },
			label: { color: MUTED },
			title: { color: MUTED, fontWeight: 700 },
		},
	},
};

/* ---------- the five chart states: each one is complete, so any step can follow any other ---------- */

const none = { set: null };
const state = (o) => ({
	coordSystem: 'cartesian',
	geometry: 'rectangle',
	angle: 0,
	legend: null,
	title: null,
	tooltip: null,
	...o,
	channels: { x: none, y: none, color: none, size: none, label: none, noop: none, lightness: none, ...o.channels },
});
const regionAxis = { set: [R], sort: 'byValue', reverse: true };
/* a phone gets a smaller type size, less room round the plot and bigger bubbles for its narrow plot (the sizes are em or a share of the plot's width) */
const small = matchMedia('(max-width: 720px)');
const em = (n) => `${Math.round(n * (small.matches ? 0.78 : 1) * 100) / 100}em`;
/* the room round the plot: it carries the axis labels and titles, so each state asks for what it needs */
const room = (top, right, bottom, left) => ({
	fontSize: small.matches ? 12 : 13,
	plot: {
		paddingTop: em(top),
		paddingRight: em(right),
		paddingBottom: em(bottom),
		paddingLeft: `${left}em`,
		marker: { circleMaxRadius: small.matches ? 0.15 : 0.1, circleMinRadius: small.matches ? 0.03 : 0.017 },
	},
});

const STEPS = [
	{
		name: 'Bars',
		title: 'Visits by region',
		text: 'One bar for each region. Central brings in the most visits.',
		key: false,
		alt: () => `Bar chart of made-up visits to a sample shop site, by region, in thousands: ${list(byRegion)}.`,
		config: () => state({
			channels: { x: regionAxis, y: { set: [V], sort: 'none', reverse: false }, label: { set: [V] } },
		}),
		style: () => room(3.4, 1, 2.6, 4.7),
	},
	{
		name: 'Stacked',
		title: 'Visits by region and season',
		text: 'The same bars, cut by season. Summer leads every region.',
		key: true,
		alt: () => `Stacked bar chart of the same made-up visits, split by season. Seasons in thousands: ${list(bySeason)}.`,
		config: () => state({
			channels: { x: regionAxis, y: { set: [V, S], sort: 'none', reverse: false }, color: { set: [S] } },
		}),
		style: () => room(3.4, 1, 2.6, 4.7),
	},
	{
		name: 'Radial',
		title: 'Visits by region and season',
		text: 'Bend the bars round a circle and each region becomes a slice.',
		key: true,
		alt: () => `Radial chart of the same made-up visits: one slice for each region, split by season. Regions in thousands: ${list(byRegion)}.`,
		config: () => state({
			coordSystem: 'polar',
			channels: { x: regionAxis, y: { set: [V, S], sort: 'none', reverse: false }, color: { set: [S] } },
		}),
		style: () => room(3.2, 1, 2.8, 1),
	},
	{
		name: 'Scatter',
		title: 'Orders against visits',
		text: 'Each dot is a region in a season. More visits, more orders.',
		key: true,
		alt: () => 'Scatter chart of made-up orders against visits: twenty dots, one for each region in each season, coloured by season. More visits go with more orders.',
		config: () => state({
			geometry: 'circle',
			channels: { x: { set: [V], sort: 'none', reverse: false }, y: { set: [O], sort: 'none', reverse: false }, color: { set: [S] }, noop: { set: [R] } },
		}),
		style: () => room(3.4, 1.6, 4.4, 4.7),
	},
	{
		name: 'Bubbles',
		title: 'Visits by season, in thousands',
		text: 'Pull the dots together by season. Summer is the biggest bubble.',
		key: true,
		alt: () => `Bubble chart of made-up visits by season, in thousands: ${list(bySeason)}. The bigger the bubble, the more visits.`,
		config: () => state({
			geometry: 'circle',
			channels: { size: { set: [V] }, color: { set: [S] }, label: { set: small.matches ? [V] : [S, V] } },
		}),
		style: () => room(1, 1, 1, 1),
	},
];

/* ---------- the page ---------- */

const story = document.getElementById('story');
const plotEl = document.getElementById('plot');
const titleEl = document.getElementById('chart-title');
const keyEl = document.getElementById('key');
const keysEl = document.getElementById('keys');
const capEl = document.getElementById('cap');
const kickEl = document.getElementById('cap-kick');
const textEl = document.getElementById('cap-text');
const capBody = capEl.querySelector('.cap__body');
const tickBar = capEl.querySelector('.tick i');
const stepBtns = [...document.querySelectorAll('.step')];
const prevBtn = document.querySelector('[data-action="prev"]');
const nextBtn = document.querySelector('[data-action="next"]');
const replayBtn = document.querySelector('[data-action="replay"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

// govern() holds the countdown bar (the story's clock) off-screen, in a hidden tab and on Pause. It gets only the bar's own
// element: govern() pauses every animation and transition under the element it is given, and the controls must keep theirs.
const gov = govern(capEl.querySelector('.tick'));
let chart = null;
let rendering = null;
let engine = null; // loop(): steps Vizzu's clock, only while a morph is in flight
let inflight = 0;
let index = 0;
let tickAnim = null;

SEASONS.forEach((name, j) => {
	const li = document.createElement('li');
	li.style.setProperty('--dot', SEASON_COLOURS[j]);
	li.textContent = name;
	keyEl.append(li);
});

/* the words, buttons and key follow the step at once; Vizzu then draws the morph */
function paint(i, { animate }) {
	const step = STEPS[i];
	stepBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
	titleEl.textContent = step.title;
	kickEl.textContent = `Step ${i + 1} of ${STEPS.length} · ${step.name}`;
	textEl.textContent = step.text;
	keysEl.dataset.mode = step.key ? 'seasons' : 'total';
	plotEl.setAttribute('aria-label', step.alt());
	if (animate) capBody.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
}

/* the story's clock: a thin bar fills over DWELL (transform only, a Web Animation, paused by govern()), then the story moves on */
function armTick() {
	if (tickAnim) {
		tickAnim.onfinish = null;
		tickAnim.cancel();
		tickAnim = null;
	}
	if (prefersReducedMotion() || !chart) return;
	tickAnim = tickBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DWELL, easing: 'linear', fill: 'both' });
	// the story only moves on while its chart is on screen; otherwise the countdown starts over
	tickAnim.onfinish = () => (engine && !engine.inView ? armTick() : show(index + 1));
	gov.apply();
}

/* a morph is a promise that only moves while the engine is stepped */
function engineOn() {
	inflight++;
	engine.start();
}
function engineOff() {
	inflight = Math.max(0, inflight - 1);
	if (!inflight) engine.stop();
}

/* reduced motion: a zero-length animation lands on its first updates, so step the engine by hand a few times, no loop */
function land(promise) {
	let done = false;
	let n = 0;
	promise.then(() => { done = true; }, () => { done = true; });
	const nudge = () => {
		if (done || ++n > 40) return;
		rendering.update();
		setTimeout(nudge, 16);
	};
	setTimeout(nudge, 0);
}

/* one morph (or one jump): resolves when Vizzu has landed on the target */
async function morph(step, jump) {
	const target = { config: step.config(), style: step.style() };
	if (jump) {
		const p = chart.animate(target, { duration: '0ms' });
		land(p);
		return p;
	}
	engineOn();
	try {
		return await chart.animate(target, { duration: MORPH, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
	} finally {
		engineOff();
	}
}

/* One morph runs at a time. A step asked for while another morph is running is remembered (only the latest counts),
   and the running morph is sped to its end so the chart lands on what was asked for without playing every step in between. */
let running = false;
let want = null;

async function drain() {
	running = true;
	try {
		while (want) {
			const { step, instant: jump } = want;
			want = null;
			try {
				await morph(step, jump || prefersReducedMotion());
			} catch (e) {
				console.warn('chart step:', e && e.message ? e.message : e);
			}
		}
	} finally {
		running = false;
	}
}

function show(i, { instant = false } = {}) {
	index = (i + STEPS.length) % STEPS.length;
	paint(index, { animate: !!chart && !instant && !prefersReducedMotion() });
	armTick();
	if (!chart) return;
	want = { step: STEPS[index], instant };
	if (!running) return drain();
	try { chart.animation.seek('100%'); } catch (e) { /* nothing running yet: drain() picks the new step up */ }
}

/* ---------- the plain chart for browsers that cannot run the engine ---------- */

function fallback(reason) {
	console.info('chart story: showing the plain chart,', reason);
	const NS = 'http://www.w3.org/2000/svg';
	const el = (name, attrs, text) => {
		const n = document.createElementNS(NS, name);
		Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
		if (text != null) n.textContent = text;
		return n;
	};
	// drawn at the plot's own pixel size, so its text stays the size of the page's text on a phone and on a desktop
	const draw = () => {
		const W = Math.max(240, Math.round(plotEl.clientWidth));
		const H = Math.max(160, Math.round(plotEl.clientHeight));
		const left = 40;
		const top = 30;
		const base = H - 24;
		const max = Math.ceil(byRegion[0].total / 100) * 100;
		const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'plain', role: 'img', 'aria-label': STEPS[0].alt(), focusable: 'false' });
		for (let g = 0; g <= max; g += 100) {
			const y = base - ((base - top) * g) / max;
			svg.append(el('line', { x1: left, x2: W - 6, y1: y, y2: y, class: 'plain__grid' }));
			svg.append(el('text', { x: left - 8, y: y + 4, class: 'plain__axis', 'text-anchor': 'end' }, String(g)));
		}
		const slot = (W - 6 - left) / byRegion.length;
		byRegion.forEach((d, k) => {
			const h = ((base - top) * d.total) / max;
			const x = left + k * slot + slot * 0.14;
			const mid = x + slot * 0.36;
			svg.append(el('rect', { x, y: base - h, width: slot * 0.72, height: h, rx: 6, class: 'plain__bar' }));
			svg.append(el('text', { x: mid, y: base - h - 6, class: 'plain__val', 'text-anchor': 'middle' }, String(d.total)));
			svg.append(el('text', { x: mid, y: base + 17, class: 'plain__axis', 'text-anchor': 'middle' }, d.name));
		});
		svg.append(el('text', { x: 4, y: 11, class: 'plain__axis plain__axis--title' }, V));
		plotEl.replaceChildren(svg);
	};
	plotEl.removeAttribute('role');
	plotEl.removeAttribute('aria-label');
	draw();
	new ResizeObserver(draw).observe(plotEl);
	titleEl.textContent = STEPS[0].title;
	keysEl.dataset.mode = 'total';
	story.classList.add('is-plain');
	kickEl.textContent = 'Plain chart';
	textEl.textContent = 'The chart engine could not start, so here are plain bars.';
	[...stepBtns, prevBtn, nextBtn, replayBtn, pauseBtn].forEach((b) => { b.disabled = true; });
	capEl.querySelector('.cap__nav').hidden = true;
	story.querySelector('.steps').hidden = true;
}

/* ---------- start ---------- */

async function start() {
	boot();
	if (typeof WebAssembly !== 'object') return fallback('no WebAssembly');
	try {
		const { default: Vizzu } = await import('../../vendor/vizzu@0.18.0/vizzu.min.js');
		// canvas text only uses a font that is already loaded
		await Promise.race([document.fonts.load('700 13px "Nunito Sans"'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
		chart = new Vizzu(plotEl, { data: DATA, style: STYLE });
		await chart.initializing;
		chart.feature('scheduler', false); // no timer of its own from here on
		rendering = chart.feature('rendering');
		engine = loop(plotEl, () => rendering.update(), { name: 'vizzu' });
		engine.stop();
	} catch (e) {
		chart = null;
		return fallback(e && e.message ? e.message : String(e));
	}

	small.addEventListener('change', () => show(index, { instant: true })); // a turned phone gets the other sizes at once
	stepBtns.forEach((b, k) => b.addEventListener('click', () => show(k)));
	prevBtn.addEventListener('click', () => show(index - 1));
	nextBtn.addEventListener('click', () => show(index + 1));
	replayBtn.addEventListener('click', () => {
		gov.setUserPaused(false);
		story.classList.remove('is-paused');
		pauseBtn.setAttribute('aria-pressed', 'false');
		pauseBtn.textContent = 'Pause';
		show(0);
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		gov.setUserPaused(paused);
		story.classList.toggle('is-paused', paused);
	});

	if (prefersReducedMotion()) {
		pauseBtn.disabled = true;
		show(0, { instant: true });
		return;
	}
	// the first view opens from the bubbles and settles into the bars; a step asked for meanwhile waits its turn
	running = true;
	try {
		await morph(STEPS[4], true);
	} catch (e) { /* the first morph below draws the chart anyway */ }
	running = false;
	if (want) drain();
	else show(0);
}

start();
