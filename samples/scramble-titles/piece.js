/*
 * Sample 08 — "Scramble title cards".
 * Three service cards (Hosting, Design, Care) cycle on one glass card. Every line (a big word, a short line, six labels)
 * turns into random characters and settles letter by letter with Anime.js scrambleText, sequenced with createTimeline and
 * stagger. Hover or tap a label to scramble it again; a block cursor runs along it as it settles.
 * Anime.js is never allowed its own requestAnimationFrame loop (engine.useDefaultMainLoop = false): the lab's loop()
 * steps every timeline with seek(), so everything pauses off-screen, in a hidden tab, under the Pause button, and
 * nothing runs under reduced motion. The optional tick sound is Web Audio and starts only from the Sound button.
 *
 * Adapted from "Anime.js Scramble Text timeline demo" by Julian Garnier (https://codepen.io/juliangarnier/pen/vEyYdXN), MIT.
 * What is taken from it: scrambleText as the value of innerHTML, the parameter patterns (from: 'center', perturbation,
 * revealDelay, text overrides) and a grid stagger across a timeline. The rest (the cards, the loop-driven playback,
 * the hover scramble, the block cursor, the sound) is new code.
 * The pen carries no notice of its own; CodePen's licensing page (https://blog.codepen.io/docs/licensing/) says public
 * Pens are MIT licensed, with this licence text:
 *
 *   Copyright (c) YEAR - Julian Garnier - https://codepen.io/juliangarnier/pen/vEyYdXN
 *   (the pen shows no year, and CodePen's template leaves it as YEAR)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *   documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 *   to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *   the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 *   THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 *
 * Library: Anime.js v4.4.0, MIT, Copyright (c) 2025 Julian Garnier (vendor/animejs@4.4.0/LICENSE.md).
 */
import { animate, createTimeline, scrambleText, stagger, engine } from '../../vendor/animejs@4.4.0/anime.esm.min.js';
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

// no requestAnimationFrame of Anime.js's own: loop() below steps the timelines
engine.useDefaultMainLoop = false;
engine.pauseOnDocumentHidden = false;

const CARDS = [
	{ name: 'Hosting', tag: 'A home for your site', labels: ['Web hosting', 'Domain names', 'Business email', 'SSL security', 'Site migration', 'Control panel'] },
	{ name: 'Design', tag: 'Sites that look like you', labels: ['Website design', 'Logo design', 'Brand kit', 'Page layouts', 'Mobile layouts', 'Content pages'] },
	{ name: 'Care', tag: 'Help after launch', labels: ['Updates', 'Backups', 'Monitoring', 'Safety checks', 'Fixes', 'Support'] },
];
// the characters a line passes through (ranges expand: a-z); none of them is special in HTML
const CHARS = 'a-zA-Z0-9!%#_|+=';
const HOLD_MS = 3800;

const card = document.getElementById('card');
const rail = document.getElementById('rail');
const titleEl = document.getElementById('card-title');
const tabs = [...document.querySelectorAll('[data-card]')];
const nextBtn = document.querySelector('[data-action="next"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const soundBtn = document.querySelector('[data-action="sound"]');

/* a slot is one scrambling line: the fixed box, its text, its block cursor */
function slotOf(root) {
	const el = root.querySelector('.scr');
	return { root, el, blk: root.querySelector('.blk'), live: false, last: '', f: -1 };
}
const word = slotOf(document.getElementById('slot-word'));
const tag = slotOf(document.getElementById('slot-tag'));
const chips = [...document.querySelectorAll('.chip')];
const labels = chips.map((c) => slotOf(c.querySelector('.slot')));
const allSlots = [word, tag, ...labels];

let index = 0;
let userPaused = false;
let ctl = null;

/* ---------- sound: Web Audio, only after a click on the Sound button ---------- */

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const NOTES = [1318, 1480, 1760, 1976, 2217, 2637];
let audio = null;
let master = null;
let soundOn = false;
let lastBlip = 0;

function ensureAudio() {
	if (audio) return true;
	if (!AudioCtx) return false;
	try { audio = new AudioCtx(); } catch { return false; }
	master = audio.createGain();
	master.gain.value = 0;
	master.connect(audio.destination);
	return true;
}

/* one tick: a very short triangle blip on a random note, at most about 18 a second */
function blip() {
	if (!soundOn || !audio || audio.state !== 'running') return;
	const now = audio.currentTime;
	if (now - lastBlip < 0.055) return;
	lastBlip = now;
	const osc = audio.createOscillator();
	const env = audio.createGain();
	osc.type = 'triangle';
	osc.frequency.value = NOTES[Math.floor(Math.random() * NOTES.length)];
	env.gain.setValueAtTime(0.0001, now);
	env.gain.exponentialRampToValueAtTime(0.5, now + 0.003);
	env.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
	osc.connect(env).connect(master);
	osc.start(now);
	osc.stop(now + 0.06);
}

/* the sound context only runs while sound is on, motion is allowed, the page is not paused and the tab is visible */
function syncAudio() {
	if (!audio) return;
	const want = soundOn && !userPaused && !document.hidden && !prefersReducedMotion();
	master.gain.setTargetAtTime(want ? 0.2 : 0, audio.currentTime, 0.01);
	if (want) audio.resume(); else audio.suspend();
}

function setSound(on) {
	if (on && !ensureAudio()) {
		soundBtn.disabled = true;
		soundBtn.title = 'This browser has no Web Audio';
		return;
	}
	soundOn = on;
	soundBtn.setAttribute('aria-pressed', String(on));
	syncAudio();
	if (on) { lastBlip = 0; setTimeout(blip, 40); } // a first tick, so the click confirms the sound is on
}

/* ---------- scrambleText, wrapped so each line knows when it is live ---------- */

/* scrambleText(...) is a function-valued property: (target, index, length) gives the tween with its own modifier.
   The wrapper lets every line tell the page when it is scrambling (the colour, the block cursor, the tick).
   slots and texts are parallel arrays, so one add() can stagger a whole group of lines. */
function scr(slots, texts, o) {
	const dur = o.duration;
	const settle = o.settle;
	const make = scrambleText({ text: (_, i) => texts[i], chars: CHARS, from: o.from, duration: dur, settleDuration: settle, perturbation: o.perturb || 0, revealDelay: o.reveal || 0 });
	return (target, i, n, tween) => {
		const s = slots[i];
		const cells = Math.max(s.el.textContent.length, texts[i].length);
		const p = make(target, i, n, tween);
		const inner = p.modifier;
		p.modifier = (t) => {
			const out = inner(t);
			const live = t > 0 && t < 1;
			if (live !== s.live) {
				s.live = live;
				s.root.classList.toggle('is-live', live);
				s.root.classList.toggle('is-typing', live && !!o.cursor);
			}
			if (live) {
				if (o.cursor) {
					// the leftmost cell still scrambling: nothing settles before settleDuration / duration of the run
					const H = settle / dur;
					const Y = (1 - H) / cells;
					const f = Math.min(cells - 1, t < H ? 0 : Math.floor((t - H) / Y) + 1);
					if (f !== s.f) {
						s.f = f;
						s.root.style.setProperty('--f', String(f));
					}
				}
				if (out !== s.last) blip();
			}
			s.last = out;
			return out;
		};
		return p;
	};
}

/* ---------- the player: every animation is seeked from loop(), nothing else moves it ---------- */

const jobs = new Map(); // key (a slot, or 'card') -> { anim, t, dur, slots, done }
let phase = 'hold';
let cycleT = 0; // ms since this card began
let cycleTotal = HOLD_MS;
let holdT = 0;
let ghostIn = 1800;
let railShown = -1;

function endJob(key, finish) {
	const job = jobs.get(key);
	if (!job) return;
	jobs.delete(key);
	if (finish) job.anim.seek(job.dur);
	job.slots.forEach((s) => {
		s.live = false;
		s.f = -1;
		s.root.classList.remove('is-live', 'is-typing');
	});
	if (finish && job.done) job.done();
}

function addJob(key, anim, slots, done) {
	endJob(key, false);
	jobs.set(key, { anim, t: 0, dur: anim.duration, slots, done });
}

function setText(s, text) {
	s.el.textContent = text;
	s.last = text;
}

function setCardText(i) {
	const c = CARDS[i];
	setText(word, c.name);
	setText(tag, c.tag);
	labels.forEach((s, k) => setText(s, c.labels[k]));
}

/* the names a screen reader gets: always the real words, never the noise */
function syncNames(i) {
	const c = CARDS[i];
	tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
	titleEl.setAttribute('aria-label', `${c.name}. ${c.tag}`);
	chips.forEach((b, k) => b.setAttribute('aria-label', c.labels[k]));
}

function columnCount() {
	return new Set(chips.map((c) => c.offsetLeft)).size || 1;
}

function motionAllowed() {
	return !prefersReducedMotion() && !userPaused;
}

/* a whole card: the word types in from the left behind a block cursor, the short line and the labels
   settle outward from their centres, the labels staggered across the grid */
function playCard(i) {
	const c = CARDS[i];
	const cols = columnCount();
	const rows = Math.ceil(chips.length / cols);
	const tl = createTimeline({ autoplay: false, defaults: { composition: 'none' } });
	tl.add(word.el, { innerHTML: scr([word], [c.name], { from: 'left', duration: 820, settle: 360, cursor: true }) }, 0);
	tl.add(tag.el, { innerHTML: scr([tag], [c.tag], { from: 'center', duration: 900, settle: 420, perturb: 0.25, reveal: 80 }) }, 200);
	// the library's stagger decides each label's start across the grid, from its centre
	tl.add(labels.map((s) => s.el), { innerHTML: scr(labels, c.labels, { from: 'center', duration: 700, settle: 320, perturb: 0.3 }) },
		stagger([0, 520], { grid: [cols, rows], from: 'center', start: 380 }));
	return tl;
}

function goTo(i) {
	index = i;
	syncNames(i);
	// whatever was scrambling snaps to its settled text first, so no line waits half-scrambled for its turn
	[...jobs.keys()].forEach((k) => endJob(k, true));
	if (!motionAllowed()) {
		setCardText(i);
		phase = 'hold';
		holdT = 0;
		cycleT = 0;
		cycleTotal = HOLD_MS;
		return;
	}
	const tl = playCard(i);
	phase = 'in';
	cycleT = 0;
	cycleTotal = tl.duration + HOLD_MS;
	addJob('card', tl, allSlots, () => {
		setCardText(i);
		phase = 'hold';
		holdT = 0;
		ghostIn = 1500;
	});
}

/* hover, tap or keyboard on a label: scramble just that label again, with the block cursor */
function rescramble(k) {
	const s = labels[k];
	if (!motionAllowed() || jobs.has('card') || jobs.has(s)) return;
	const text = CARDS[index].labels[k];
	const dur = 560 + text.length * 26;
	const anim = animate(s.el, { autoplay: false, composition: 'none', innerHTML: scr([s], [text], { from: 'left', duration: dur, settle: 260, cursor: true }) });
	addJob(s, anim, [s], () => setText(s, text));
}

function tick(dt) {
	const ms = dt * 1000;
	for (const [key, job] of [...jobs]) {
		job.t += ms;
		if (job.t >= job.dur) endJob(key, true);
		else job.anim.seek(job.t);
	}
	cycleT += ms;
	if (phase === 'hold') {
		holdT += ms;
		ghostIn -= ms;
		if (ghostIn <= 0) {
			// an idle ghost pointer: now and then one label scrambles by itself
			const free = labels.map((_, k) => k).filter((k) => !jobs.has(labels[k]));
			if (free.length) rescramble(free[Math.floor(Math.random() * free.length)]);
			ghostIn = 1300 + Math.random() * 1100;
		}
		if (holdT >= HOLD_MS) goTo((index + 1) % CARDS.length);
	}
	const p = Math.min(1, cycleT / cycleTotal);
	if (Math.abs(p - railShown) > 0.002) {
		railShown = p;
		rail.style.transform = `scaleX(${p.toFixed(4)})`;
	}
}

/* ---------- controls ---------- */

function applyMotionState() {
	const still = prefersReducedMotion();
	card.toggleAttribute('data-still', still);
	pauseBtn.disabled = still;
	soundBtn.disabled = still || !AudioCtx;
	if (still) {
		// the finished card, no scrambling, nothing left running
		jobs.forEach((_, key) => endJob(key, false));
		setCardText(index);
		syncNames(index);
		rail.style.transform = '';
		if (soundOn) setSound(false);
	}
	syncAudio();
}

tabs.forEach((t) => t.addEventListener('click', () => goTo(Number(t.dataset.card))));
nextBtn.addEventListener('click', () => goTo((index + 1) % CARDS.length));
soundBtn.addEventListener('click', () => setSound(!soundOn));
chips.forEach((b, k) => {
	// pointerenter covers a mouse, a pen and a first touch; click covers the keyboard and a later tap
	b.addEventListener('pointerenter', () => rescramble(k));
	b.addEventListener('click', () => rescramble(k));
});

pauseBtn.addEventListener('click', () => {
	userPaused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(userPaused));
	pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
	if (userPaused) ctl.stop(); else ctl.start();
	syncAudio();
});
document.addEventListener('visibilitychange', syncAudio);
reducedMotionQuery.addEventListener?.('change', applyMotionState);

boot();
syncNames(0);
ctl = loop(card, tick, { name: 'scramble-titles' });
applyMotionState();
// the first card decodes itself as the page opens (it is already written in the HTML, so nothing waits on the script)
if (motionAllowed()) goTo(0);
