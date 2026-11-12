/*
 * Sample 04 — "The split-flap board".
 * A departures board of sample Lab lines that refreshes every few seconds with a row-by-row ripple, plus a box for
 * your own 4 to 20 character line. Each tile is four panels (two static halves behind a clip-path mask, two flaps that
 * turn with rotateX), animated with the Web Animations API. A dark overlay's opacity replaces the source's brightness
 * filter. A flap click sound is Web Audio only and starts only from the visible Sound button. Nothing is sent anywhere.
 *
 * Adapted from "Craft of UI: WAAPI split-flap board" by Jhey (jh3y), https://codepen.io/jh3y/pen/dPyBXOG, MIT licence
 * (CodePen: public Pens are MIT licensed, https://blog.codepen.io/docs/pens/licensing/).
 *
 * Copyright (c) Jhey (jh3y) - https://codepen.io/jh3y/pen/dPyBXOG
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
 * Changes from the source: written as a plain module with no Tweakpane, no remote imports and no web font; tiles and
 * layout rebuilt for a navy board on the day sky (15 columns on phones, 20 on wider screens); the brightness filter
 * became an overlay whose opacity animates; every flip runs at most a few steps through the drum, then lands; flips are
 * governed (paused off-screen, in a hidden tab, and with the Pause button); reduced motion shows one still board.
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

/* ---------- the drum, the sample lines ---------- */

const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-!?&';
const N = DRUM.length;
const idxOf = (ch) => Math.max(0, DRUM.indexOf(ch));
const ALLOWED = /[^A-Z0-9.:\-!?& ]/g;

/* Sample content: Lab lines with made-up times and gates (time, name, gate) */
const LINES = [
	['08:05', 'THE MARK', 'A1'],
	['08:20', 'HUMANITY', 'A3'],
	['08:40', 'PARTICLES', 'B2'],
	['09:05', 'TYPE', 'A4'],
	['09:25', 'WEBGL', 'C1'],
	['09:50', 'SCROLL', 'B5'],
	['10:10', 'POINTER', 'C3'],
	['10:35', 'SVG', 'A2'],
	['10:55', 'UI', 'D1'],
	['11:20', 'DATA', 'B1'],
	['11:45', 'TOYS', 'D4'],
	['12:10', 'IMAGE', 'C6'],
	['12:30', 'GLASS', 'D2'],
	['12:55', 'SKY', 'B4'],
	['13:15', 'FLIP', 'A5'],
];
const FIRST_MESSAGE = 'WELCOME TO THE LAB';

/* a flip never runs the whole drum: at most CAP steps, then it lands (about half a second) */
const CAP = 6;
const STEP_MS = 58;
const ROW_GAP = 380; // the ripple: each row starts this much after the one above
const COL_GAP = 36; // and each tile this much after its left neighbour
const CYCLE_MS = 7000;
const EASE = 'cubic-bezier(0.55, 0, 0.9, 0.6)';

/* ---------- elements ---------- */

const stage = document.querySelector('.board-stage');
const board = document.getElementById('board');
const grid = document.getElementById('board-grid');
const form = document.getElementById('msg-form');
const input = document.getElementById('msg-input');
const note = document.getElementById('msg-note');
const flipBtn = document.querySelector('[data-action="flip"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const soundBtn = document.querySelector('[data-action="sound"]');
const NOTE_DEFAULT = note.textContent;

const gov = govern(stage);
const wideQuery = matchMedia('(min-width: 601px)');
/* no Web Animations API: the board stays a still, like reduced motion */
const canAnimate = typeof Element.prototype.animate === 'function';
const still = () => prefersReducedMotion() || !canAnimate;

/* ---------- state ---------- */

let layout = null; // {cols, depRows, nameW, gate, msgRows}
let depRows = []; // the departure rows: arrays of tiles
let msgRows = []; // the message rows
let page = 0;
let message = FIRST_MESSAGE;
let gen = 0; // bumped when the board is rebuilt, so old flips stop
let active = 0; // tiles flipping right now
let timer = 0;

/* ---------- building the board ---------- */

function layoutFor() {
	return wideQuery.matches
		? { cols: 20, depRows: 5, nameW: 11, gate: true, msgRows: 1 }
		: { cols: 15, depRows: 4, nameW: 9, gate: false, msgRows: 2 };
}

function makeTile(kind) {
	const el = document.createElement('div');
	el.className = `flip c-${kind}`;
	el.innerHTML =
		'<div class="f f--ut"><b></b><i></i></div>' +
		'<div class="f f--ub"><b></b></div>' +
		'<div class="f f--ft"><b></b></div>' +
		'<div class="f f--fb"><b></b><i></i></div>';
	const [ut, ub, ft, fb] = el.children;
	const tile = {
		el,
		ut, ub, ft, fb,
		ushade: ut.querySelector('i'),
		fshade: fb.querySelector('i'),
		text: [ut, ub, ft, fb].map((f) => f.querySelector('b').appendChild(document.createTextNode(' '))),
		idx: 0,
		target: 0,
		running: false,
	};
	return tile;
}

function labelRow(cells) {
	const row = document.createElement('div');
	row.className = 'row row--label';
	row.setAttribute('aria-hidden', 'true');
	for (const [text, from, to] of cells) {
		const span = document.createElement('span');
		span.textContent = text;
		span.style.gridColumn = `${from} / ${to}`;
		row.append(span);
	}
	return row;
}

function tileRow(cols, kindOf) {
	const row = document.createElement('div');
	row.className = 'row';
	row.setAttribute('aria-hidden', 'true');
	const tiles = [];
	for (let c = 0; c < cols; c++) {
		const tile = makeTile(kindOf(c));
		row.append(tile.el);
		tiles.push(tile);
	}
	grid.append(row);
	return tiles;
}

function build() {
	gen++;
	active = 0;
	layout = layoutFor();
	const { cols, nameW, gate } = layout;
	grid.textContent = '';
	grid.style.setProperty('--cols', cols);

	grid.append(labelRow(gate ? [['Time', 1, 6], ['Sample', 7, 7 + nameW], ['Gate', cols - 1, cols + 1]] : [['Time', 1, 6], ['Sample', 7, cols + 1]]));
	const kindOf = (c) => (c < 5 ? 'time' : gate && c >= cols - 2 ? 'gate' : 'name');
	depRows = Array.from({ length: layout.depRows }, () => tileRow(cols, kindOf));

	const label = labelRow([['Your message', 1, cols + 1]]);
	label.classList.add('row--rule');
	grid.append(label);
	msgRows = Array.from({ length: layout.msgRows }, () => tileRow(cols, () => 'msg'));

	// the finished board, no motion
	depRows.forEach((tiles, r) => rowText(page, r).split('').forEach((ch, c) => setStill(tiles[c], idxOf(ch))));
	messageLines().forEach((line, r) => line.split('').forEach((ch, c) => setStill(msgRows[r][c], idxOf(ch))));
	describe();
}

/* ---------- what the rows say ---------- */

function rowText(pageNo, r) {
	const { cols, nameW, gate, depRows: rows } = layout;
	const [time, name, gateNo] = LINES[(pageNo * rows + r) % LINES.length];
	return gate ? `${time} ${name.padEnd(nameW)} ${gateNo.padEnd(2)}` : `${time} ${name.slice(0, cols - 6).padEnd(cols - 6)}`;
}

function messageLines() {
	const { cols, msgRows: rows } = layout;
	let lines = [message.slice(0, cols)];
	if (rows > 1 && message.length > cols) {
		let cut = message.lastIndexOf(' ', cols);
		if (cut <= 0) cut = cols;
		lines = [message.slice(0, cut).trim(), message.slice(cut).trim().slice(0, cols)];
	}
	while (lines.length < rows) lines.push('');
	// centred on the row
	return lines.map((line) => ' '.repeat(Math.floor((cols - line.length) / 2)).concat(line).padEnd(cols));
}

function describe() {
	const lines = depRows.map((_, r) => {
		const [time, name, gateNo] = LINES[(page * layout.depRows + r) % LINES.length];
		return `${time} ${name.toLowerCase()}${layout.gate ? `, gate ${gateNo}` : ''}`;
	});
	board.setAttribute('aria-label', `A split-flap departures board. Sample content: ${lines.join('; ')}. Your message: ${message.toLowerCase()}.`);
}

/* ---------- one tile ---------- */

function setStill(tile, idx) {
	const ch = DRUM[idx];
	for (const node of tile.text) node.nodeValue = ch;
	tile.idx = idx;
	tile.target = idx;
}

/* a Web Animations API animation that starts paused when the board is held (off-screen, hidden tab, Pause) */
function anim(el, frames, options) {
	const a = el.animate(frames, options);
	if (!gov.isLive()) a.pause();
	return a;
}

/* one step of a flip: the standing flap folds down, the lying flap unfolds, the halves under them dim and brighten */
function stepAnims(tile, duration, delay) {
	const o = { duration, delay, easing: EASE, fill: 'both' };
	return [
		anim(tile.ft, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-180deg)' }], o),
		anim(tile.ub, [{ transform: 'rotateX(180deg)' }, { transform: 'rotateX(0deg)' }], o),
		anim(tile.ushade, [{ opacity: 0.85 }, { opacity: 0 }], o),
		anim(tile.fshade, [{ opacity: 0 }, { opacity: 0.85 }], o),
	];
}

function setFaces(tile, cur, next) {
	const [ut, ub, ft, fb] = tile.text;
	ut.nodeValue = ub.nodeValue = DRUM[next]; // unfolding: what comes next
	ft.nodeValue = fb.nodeValue = DRUM[cur]; // folding: what was showing
}

/* send a tile to `target`, through the drum, starting after `delay` ms */
function flipTo(tile, target, delay) {
	tile.target = target;
	if (tile.idx === target || tile.running) return; // a running flip picks up the new target by itself
	if (still()) {
		setStill(tile, target);
		return;
	}
	tile.running = true;
	run(tile, delay);
}

async function run(tile, delay) {
	const mine = gen;
	let first = true;
	let prev = null;
	active++;
	try {
		while (tile.idx !== tile.target) {
			const cur = tile.idx;
			const remaining = (tile.target - cur + N) % N;
			const next = remaining > CAP ? (tile.target - CAP + N) % N : (cur + 1) % N;
			const left = (tile.target - next + N) % N;
			const duration = (left === 0 ? 150 : left === 1 ? 96 : STEP_MS) + Math.random() * 10;
			setFaces(tile, cur, next);
			const anims = stepAnims(tile, duration, first ? delay : 0);
			if (prev) prev.forEach((a) => a.cancel());
			prev = anims;
			first = false;
			await anims[0].finished;
			if (mine !== gen) return;
			tile.idx = next;
			if (soundOn) tick(left === 0);
		}
		// landed: drop the animations and leave the plain still state (the same picture)
		if (prev) prev.forEach((a) => a.cancel());
		setStill(tile, tile.idx);
	} catch {
		// cancelled (the board was rebuilt)
	} finally {
		if (mine === gen) {
			active--;
			tile.running = false;
		}
	}
}

/* ---------- the board's moves ---------- */

/* a delay that stops with the board: an animation with nothing to animate, so Pause, a hidden tab and
   leaving the screen hold it like every other animation here */
function later(ms) {
	return anim(board, [], { duration: Math.max(1, ms) }).finished;
}

/* the ripple: row by row. Each row is started when its turn comes (not all at once), so the work is spread out. */
let ticket = 0;
function showPage() {
	describe();
	const mine = gen;
	const turn = ++ticket;
	depRows.forEach((tiles, r) => {
		const text = rowText(page, r);
		const go = () => tiles.forEach((tile, c) => flipTo(tile, idxOf(text[c]), c * COL_GAP + Math.random() * 24));
		if (r === 0 || still()) go();
		else later(r * ROW_GAP).then(() => { if (mine === gen && turn === ticket) go(); }, () => {});
	});
}

function showMessage() {
	describe();
	messageLines().forEach((line, r) => {
		msgRows[r].forEach((tile, c) => flipTo(tile, idxOf(line[c]), r * 240 + c * 42 + Math.random() * 20));
	});
}

function nextPage() {
	page++;
	showPage();
}

/* the refresh timer: it fires only while the board is live (on-screen, tab visible, not paused), and never with reduced motion */
function arm(ms) {
	clearTimeout(timer);
	if (still()) return;
	timer = setTimeout(autoTick, ms);
}
function autoTick() {
	if (still()) return;
	if (!gov.isLive()) return arm(800);
	if (active > 0) return arm(600);
	nextPage();
	arm(CYCLE_MS);
}

/* ---------- sound: Web Audio, only after a click on the Sound button ---------- */

let audio = null;
let master = null;
let noise = null;
let soundOn = false;
let lastTick = 0;

function ensureAudio() {
	if (audio) return true;
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!Ctx) return false;
	audio = new Ctx();
	master = audio.createGain();
	master.gain.value = 0;
	master.connect(audio.destination);
	noise = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.05), audio.sampleRate);
	const data = noise.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return true;
}

/* one flap clap: a short band of noise, a little lower and louder when the flap lands on its character */
function tick(landing) {
	if (!audio || audio.state !== 'running') return;
	const now = audio.currentTime;
	if (now - lastTick < 0.02) return;
	lastTick = now;
	const src = audio.createBufferSource();
	src.buffer = noise;
	const band = audio.createBiquadFilter();
	band.type = 'bandpass';
	band.frequency.value = (landing ? 1500 : 2200) + Math.random() * 1500;
	band.Q.value = 0.9;
	const env = audio.createGain();
	const peak = (landing ? 0.55 : 0.26) * (0.75 + Math.random() * 0.25);
	env.gain.setValueAtTime(0.0001, now);
	env.gain.exponentialRampToValueAtTime(peak, now + 0.002);
	env.gain.exponentialRampToValueAtTime(0.0001, now + (landing ? 0.05 : 0.03));
	src.connect(band).connect(env).connect(master);
	src.start(now);
	src.stop(now + 0.055);
}

function setSound(on) {
	if (on && !ensureAudio()) {
		soundBtn.disabled = true;
		soundBtn.title = 'This browser has no Web Audio';
		return;
	}
	soundOn = on;
	soundBtn.setAttribute('aria-pressed', String(on));
	if (!audio) return;
	if (on) audio.resume();
	master.gain.setTargetAtTime(on ? 0.6 : 0, audio.currentTime, 0.01);
	if (on) {
		// a first clap, so the click confirms the sound is on
		lastTick = 0;
		setTimeout(() => tick(true), 30);
	}
}

/* ---------- controls ---------- */

function syncMotionControls() {
	const off = still();
	pauseBtn.disabled = off;
	soundBtn.disabled = off || !(window.AudioContext || window.webkitAudioContext);
	if (off && soundOn) setSound(false);
	flipBtn.textContent = off ? 'Next lines' : 'Flip now';
}

flipBtn.addEventListener('click', () => {
	nextPage();
	arm(CYCLE_MS);
});

pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	gov.setUserPaused(paused);
});

soundBtn.addEventListener('click', () => setSound(!soundOn));

/* your own line: uppercase A-Z, 0-9 and a few symbols; shown on the board only, nothing is sent */
input.addEventListener('input', () => {
	const before = input.value;
	const clean = before.toUpperCase().replace(ALLOWED, '');
	if (clean !== before) {
		const caret = input.selectionStart - (before.length - clean.length);
		input.value = clean;
		input.setSelectionRange(Math.max(0, caret), Math.max(0, caret));
	}
	input.removeAttribute('aria-invalid');
	note.classList.remove('is-error');
	note.textContent = NOTE_DEFAULT;
});

form.addEventListener('submit', (ev) => {
	ev.preventDefault();
	const text = input.value.toUpperCase().replace(ALLOWED, '').trim().replace(/\s+/g, ' ');
	if (text.length < 4 || text.length > 20) {
		input.setAttribute('aria-invalid', 'true');
		note.classList.add('is-error');
		note.textContent = 'Please use 4 to 20 characters.';
		input.focus();
		return;
	}
	message = text;
	input.value = text;
	note.textContent = 'On the board. Nothing is sent.';
	showMessage();
});

/* ---------- start ---------- */

function rebuild() {
	build();
	arm(CYCLE_MS);
}
wideQuery.addEventListener('change', rebuild);
reducedMotionQuery.addEventListener?.('change', () => {
	syncMotionControls();
	build();
	arm(1200);
});

boot();
// a short phone: the description starts folded away (the shell's own toggle), so the board is not hidden behind it
if (matchMedia('(max-width: 600px) and (max-height: 700px)').matches) document.querySelector('.info-toggle')?.click();
syncMotionControls();
document.fonts.ready.then(() => {
	build();
	// the first refresh comes soon, so the board is alive when the page opens
	arm(700);
});
