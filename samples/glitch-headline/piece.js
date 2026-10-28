/*
 * Sample 07 — "Glitch headline".
 * Type a word. Generate rolls a fresh set of random keyframes for it, writes them out as plain CSS (Copy CSS puts that text
 * on the clipboard) and plays the very same CSS as a 1.5-second glitch burst that settles. Seven stacked slices of the word,
 * each clipped to a still horizontal band, jitter sideways with transform only; cyan and royal layers give the RGB split.
 * A burst also plays every 6 to 8 seconds while the piece is on screen and the tab is visible.
 *
 * Adapted from "Glitch Effect" (GUI Challenges) by Adam Argyle (argyleink),
 * https://github.com/argyleink/gui-challenges/tree/82317d0d04c4f38ddf781439e282aa67ecb5b7f6/glitch , Apache-2.0.
 * Copyright: the repository's LICENSE is the unmodified Apache-2.0 text, whose copyright line is still the template's
 * "[yyyy] [name of copyright owner]"; the author named in glitch/package.json is Adam Argyle.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * Changed from the source:
 * - the source animates a random 26-point clip-path polygon over its heading; the Lab animates HTML with transform and
 *   opacity only, so that part is replaced: static clip-path bands (never animated) over stacked copies of the word,
 *   with random translateX keyframes per band;
 * - kept from the source: random keyframes written out as text by a Generate button, step-end timing, short spikes that
 *   reset to rest between them, and the brief skew-and-squash flash (milder here);
 * - new here: the word is typed into an input and sanitised, the cyan and royal RGB split, keyframes shaped to settle,
 *   the written CSS is the CSS that runs, Copy CSS, idle bursts, Pause and reduced-motion handling.
 * Not used: the source's Cyberpunk font and branding, open-props, the Vite build and the GitHub corner link.
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const DEFAULT_WORD = 'Launch day';
const BANDS = 7;
const BURST = 1.5; // seconds
const REST = 0.032; // em: where the cyan and royal copies sit when the word is still
const NOTE = 'Nothing is sent. The word stays on this page.';
const NOT_ALLOWED = /[^A-Za-z0-9À-ÖØ-öø-ÿ ]/g;

const stage = document.querySelector('.glitch-stage');
const word = document.getElementById('g-word');
const base = document.getElementById('g-base');
const form = document.getElementById('g-form');
const input = document.getElementById('g-input');
const codeEl = document.getElementById('g-code');
const note = document.getElementById('g-note');
const copyBtn = document.getElementById('g-copy');
const glitchBtn = document.querySelector('[data-action="glitch"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

let current = DEFAULT_WORD;
let css = '';
let lines = 1;
let timer = 0;
let noteTimer = 0;
let gov = null;
const keys = document.createElement('style');
keys.id = 'g-keys';
document.head.append(keys);

/* ---------- a small seeded random, so the first word is the same every time ---------- */

function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/* ---------- the keyframes: planned, then written as CSS text ---------- */

const num = (n, d = 3) => (Math.abs(n) < 0.5 / 10 ** d ? '0' : n.toFixed(d).replace(/\.?0+$/, '').replace(/^(-?)0\./, '$1.'));
const em = (n) => (Math.abs(n) < 0.0005 ? '0' : `${num(n)}em`);
const pct = (n) => `${num(n, 1)}%`;

/* the moments of the burst: close together at the start, wider apart and weaker towards the end, so it settles */
function spikes(r) {
	const out = [];
	let free = 2;
	for (let i = 0; i < 11; i++) {
		const u = (i + 0.15 + r() * 0.7) / 11;
		const len = 2 + Math.floor(r() * 4); // 30 to 75 ms: two to five frames
		const at = Math.max(free, Math.round(3 + 84 * u ** 1.35));
		if (at + len > 92) break;
		out.push({ at, len, env: (1 - at / 100) ** 1.2 });
		free = at + len + 1; // the next spike starts after this one has reset
	}
	return out;
}

function plan(seed, lineCount) {
	const r = rng(seed);
	const sign = () => (r() < 0.5 ? -1 : 1);

	// band edges, in percent of the word's box: the first and last run past it, so no letter is cut off
	const lo = lineCount > 1 ? 8 : 15;
	const hi = lineCount > 1 ? 92 : 85;
	const edges = [-30];
	for (let i = 0; i < BANDS - 1; i++) edges.push(lo + ((hi - lo) * (i + 0.5 + (r() - 0.5) * 0.7)) / (BANDS - 1));
	edges.push(130);
	// each band overlaps the one above by a hair, so no seam shows while the slices sit still
	const bands = edges.slice(0, -1).map((top, i) => ({ top: top - (i ? 0.6 : 0), bottom: 100 - edges[i + 1] }));

	const sp = spikes(r);

	const slices = bands.map((_, b) => {
		const frames = [];
		sp.forEach((s, i) => {
			const keep = r() < 0.92 - 0.5 * (s.at / 90) || (i === 0 && b % 2 === 0);
			if (!keep) return;
			frames.push([s.at, `translateX(${em(sign() * (0.02 + r() * 0.13) * s.env)})`], [s.at + s.len, 'none']);
		});
		if (!frames.length && sp[0]) frames.push([sp[0].at, `translateX(${em(sign() * 0.1)})`], [sp[0].at + sp[0].len, 'none']);
		return frames;
	});

	// the RGB split: wider at each spike, back to rest between
	const split = (dir) => sp.flatMap((s) => [
		[s.at, `translateX(${em(dir * (REST + (0.03 + r() * 0.09) * s.env))})`],
		[s.at + s.len, `translateX(${em(dir * REST)})`],
	]);
	const cyan = split(-1);
	const royal = split(1);

	// the source's skew-and-squash flash: two brief ones, well apart
	const skew = [];
	const first = Math.min(1 + Math.floor(r() * 2), Math.max(0, sp.length - 1));
	[first, first + 2 + Math.floor(r() * 2)].forEach((i) => {
		const s = sp[i];
		if (!s) return;
		skew.push(
			[s.at, `skew(${sign() * (18 + Math.round(r() * 14))}deg, ${num(r() * 3 - 1.5, 1)}deg) scaleY(${num(0.5 + r() * 0.3, 2)})`],
			[s.at + 4, 'none'],
		);
	});

	return { bands, slices, cyan, royal, skew };
}

function toCss(text, p) {
	const out = [
		`/* Glitch burst for "${text}"`,
		`   ${BANDS} slices, ${BURST}s, then it settles.`,
		'   Each slice is a copy of the word (ink, cyan, royal)',
		'   clipped to a still band. Only transform moves;',
		'   nothing animates clip-path. Add .is-glitching to play. */',
		'',
	];
	p.bands.forEach((b, i) => out.push(`.glitch-slice-${i + 1} { clip-path: inset(${pct(b.top)} -60% ${pct(b.bottom)} -60%); }`));
	out.push('');
	p.bands.forEach((_, i) => out.push(`.is-glitching .glitch-slice-${i + 1} { animation: glitch-slice-${i + 1} ${BURST}s step-end; }`));
	out.push(
		`.is-glitching .glitch-cyan { animation: glitch-cyan ${BURST}s step-end; }`,
		`.is-glitching .glitch-royal { animation: glitch-royal ${BURST}s step-end; }`,
		`.is-glitching { animation: glitch-skew ${BURST}s step-end; }`,
	);
	const keyframes = (name, frames) => {
		out.push('', `@keyframes ${name} {`);
		frames.forEach(([at, value]) => out.push(`  ${at}% { transform: ${value} }`));
		out.push('}');
	};
	p.slices.forEach((frames, i) => keyframes(`glitch-slice-${i + 1}`, frames));
	keyframes('glitch-cyan', p.cyan);
	keyframes('glitch-royal', p.royal);
	keyframes('glitch-skew', p.skew);
	return out.join('\n');
}

/* ---------- the word and its copies ---------- */

function build() {
	const layer = (cls) => {
		const s = document.createElement('span');
		s.className = cls;
		return s;
	};
	const fringes = ['g-fringe g-fringe--cyan', 'g-fringe g-fringe--royal'].map((cls) => {
		const s = layer(cls);
		s.setAttribute('aria-hidden', 'true');
		return s;
	});
	word.prepend(...fringes);
	for (let i = 0; i < BANDS; i++) {
		const band = layer(`g-band glitch-slice-${i + 1}`);
		band.setAttribute('aria-hidden', 'true');
		band.append(layer('glitch-cyan'), layer('glitch-royal'), layer('glitch-ink'));
		word.append(band);
	}
}

function setText(text) {
	base.textContent = text;
	word.querySelectorAll('.g-fringe, .g-band > span').forEach((s) => { s.textContent = text; });
}

/* the biggest size at which the word fits: on one line when that is still big, else wrapped at its spaces */
function fit() {
	const avail = word.clientWidth;
	if (!avail) return;
	const REF = 100;
	const maxFs = Math.max(30, Math.min(208, innerHeight * 0.3));
	word.classList.remove('is-nowrap');
	word.style.setProperty('--fs', `${REF}px`);
	word.classList.add('is-measure');
	const wLine = base.offsetWidth; // offsetWidth, not a rect: the skew flash must not skew the measure
	word.classList.replace('is-measure', 'is-measure-min');
	const wLongest = base.offsetWidth;
	word.classList.remove('is-measure-min');
	const oneLine = ((REF * avail) / wLine) * 0.985;
	const wrapped = ((REF * avail) / wLongest) * 0.985;
	const nowrap = oneLine >= maxFs * 0.58 || oneLine >= wrapped;
	let fs = Math.max(24, Math.min(maxFs, nowrap ? oneLine : wrapped));
	const apply = () => word.style.setProperty('--fs', `${Math.floor(fs * 10) / 10}px`);
	word.classList.toggle('is-nowrap', nowrap);
	apply();
	// a word that wraps must not grow so tall that the box under it ends up beneath the fixed panel
	for (let i = 0; i < 3 && base.offsetHeight > innerHeight * 0.34 && fs > 24; i++) {
		fs = Math.max(24, fs * ((innerHeight * 0.34) / base.offsetHeight) * 0.98);
		apply();
	}
	lines = Math.max(1, Math.round(base.offsetHeight / (fs * 1.02)));
}

/* roll a new set of keyframes for a word (the first roll is always the same) and write them out */
function generate(text, first = false) {
	current = text;
	setText(text);
	fit();
	const seed = first ? 7 : (Math.random() * 2 ** 32) >>> 0;
	css = toCss(text, plan(seed, lines));
	keys.textContent = css; // the page runs exactly the text it shows
	codeEl.textContent = css;
	codeEl.scrollTop = 0;
}

/* ---------- bursts ---------- */

function burst() {
	if (prefersReducedMotion()) return;
	word.classList.remove('is-glitching');
	void word.offsetWidth; // restart from the first keyframe
	word.classList.add('is-glitching');
}
word.addEventListener('animationend', (e) => {
	if (e.target === word && e.animationName === 'glitch-skew') word.classList.remove('is-glitching');
});

function schedule(ms) {
	clearTimeout(timer);
	if (prefersReducedMotion()) return;
	timer = setTimeout(() => {
		if (!prefersReducedMotion() && gov.isLive() && !word.classList.contains('is-glitching')) burst();
		schedule(6000 + Math.random() * 2000);
	}, ms);
}

function setPaused(paused) {
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	gov.setUserPaused(paused);
}

function syncMotion() {
	const reduced = prefersReducedMotion();
	glitchBtn.disabled = reduced;
	pauseBtn.disabled = reduced;
	if (reduced) {
		clearTimeout(timer);
		word.classList.remove('is-glitching');
	} else {
		schedule(1200);
	}
}

/* ---------- the word box ---------- */

function say(text, isError = false, restore = false) {
	clearTimeout(noteTimer);
	note.textContent = text;
	note.classList.toggle('is-error', isError);
	if (restore) noteTimer = setTimeout(() => { note.textContent = NOTE; }, 2600);
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const raw = input.value;
	const stripped = raw.replace(NOT_ALLOWED, '');
	const text = stripped.replace(/\s+/g, ' ').trim().slice(0, 18);
	if (raw.trim() && text.length < 2) {
		input.setAttribute('aria-invalid', 'true');
		say('Use 2 to 18 letters, numbers or spaces.', true);
		return;
	}
	input.removeAttribute('aria-invalid');
	const keep = text || current; // an empty box just rolls a new glitch for the same word
	if (text) input.value = text;
	generate(keep);
	const reduced = prefersReducedMotion();
	if (!reduced) {
		setPaused(false);
		burst();
	}
	const kept = stripped.length !== raw.length ? ' Letters, numbers and spaces only.' : '';
	say(`Showing "${keep}".${reduced ? ' Motion is off, so it stays still.' : ''}${kept}`);
});
input.addEventListener('input', () => {
	input.removeAttribute('aria-invalid');
	note.classList.remove('is-error');
});

function selectCode() {
	const range = document.createRange();
	range.selectNodeContents(codeEl);
	const sel = getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

copyBtn.addEventListener('click', async () => {
	let ok = false;
	try {
		await navigator.clipboard.writeText(css);
		ok = true;
	} catch {
		ok = false;
	}
	if (ok) {
		say(`Copied the CSS for "${current}".`, false, true);
		copyBtn.textContent = 'Copied';
		setTimeout(() => { copyBtn.textContent = 'Copy CSS'; }, 1800);
	} else {
		selectCode();
		say('Could not copy here. The CSS is selected: press Ctrl+C.', true);
	}
});

glitchBtn.addEventListener('click', () => {
	setPaused(false);
	burst();
});
pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

/* ---------- start ---------- */

boot();
build();
gov = govern(stage);
reducedMotionQuery.addEventListener?.('change', syncMotion);

let resizeTimer = 0;
addEventListener('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(fit, 120);
});

// the font decides the width of the word: fit once it has loaded, so the size does not change under the first burst
const ready = document.fonts?.load ? document.fonts.load('900 100px "Nunito Sans"').catch(() => {}) : Promise.resolve();
ready.then(() => {
	generate(DEFAULT_WORD, true);
	syncMotion();
});
