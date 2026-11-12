/*
 * Sample 05 — "Liquid distort headline".
 * A headline drawn by Blotter 0.1.0 (MIT, vendored in vendor/blotter@0.1.0/, unchanged) on canvases and bent by one of its
 * GLSL materials: liquid distort, channel split or rolling distort. The code below is new: it only calls Blotter's public API
 * (Text, Material, forText, appendTo, start, stop, uniforms) and drives it from the lab's loop().
 * Pointer speed raises the shader's speed and strength, then eases back; a ghost pointer keeps it alive when nothing moves.
 *
 * Blotter, from https://github.com/bradley/Blotter by Bradley Griffith. Its notice, verbatim from the header of blotter.min.js:
 *
 * The MIT License
 *
 * Copyright © 1986 - ∞, Blotter / Bradley Griffith / http://bradley.computer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * How Blotter is run here (it is a 2017 build with its own requestAnimationFrame loop, which this page never starts):
 * - the instance is made with autostart off, and each loop() tick calls blotter.start() then blotter.stop(), which draws exactly
 *   one frame synchronously and cancels the frame Blotter would have queued. So the only requestAnimationFrame on the page is
 *   loop()'s, and Pause, off-screen, a hidden tab and reduced motion stop everything;
 * - the shaders' time is the uGlobalTime uniform, which this file sets itself from a phase it adds up (speed changes then never
 *   make the picture jump, and a restart does not reset it).
 * - the 411 KB bundle (with its own three.js and underscore, which set the globals THREE and _) is only loaded after a WebGL test.
 */
import { boot, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const VENDOR = '../../vendor/blotter@0.1.0/';
const FONT = '"Nunito Sans", system-ui, sans-serif';
const INK = '#071022';
const WORD = 'Liquid type';
const WORD_A = 'Liquid';
const WORD_B = 'type';
const SUB = 'Stir it with your pointer';
const LABEL = `${WORD}. ${SUB}.`;

/* how strong the liquid is at rest and when stirred hard (uv units; the displacement is this times the text's size) */
const VOL_MIN = 0.02;
const VOL_MAX = 0.072;
/* the colour the channel split blends against. The split pulls the red, green and blue of the navy ink apart, so each fringe is
   this colour with one channel taken out; a cool azure keeps them cyan, royal blue and a little green instead of red and violet */
const BLEND = [0.2, 0.62, 0.97, 1];

const card = document.getElementById('ld-card');
const plate = document.getElementById('ld-plate');
const title = document.getElementById('ld-title');
const caption = document.getElementById('ld-caption');
const chips = [...document.querySelectorAll('[data-style]')];
const stirBtn = document.querySelector('[data-action="stir"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;

/* ---------- the styles: which Blotter material, and how the stir drives it ---------- */

const glDeg = (rad) => ((((-rad * 180) / Math.PI) % 360) + 360) % 360;

const STYLES = {
	liquid: {
		caption: 'Noise bends the letters, and a faster pointer stirs it harder.',
		make() {
			const m = new Blotter.LiquidDistortMaterial();
			m.uniforms.uSpeed.value = 1; // time is the phase this file adds up, so the speed stays 1
			m.uniforms.uVolatility.value = VOL_MIN;
			return m;
		},
		prepare(inst) {
			inst.scopes.forEach((sc, i) => { sc.material.uniforms.uSeed.value = 0.1 + i * 7.3; }); // each line its own flow
		},
		drive(inst, s) {
			inst.blotter.material.uniforms.uGlobalTime.value = s.phase;
			const v = lerp(VOL_MIN, VOL_MAX, s.e);
			inst.scopes.forEach((sc, i) => { sc.material.uniforms.uVolatility.value = v * inst.lay.lines[i].volK; });
		}
	},
	split: {
		caption: 'The red, green and blue copies pull apart in the direction you move.',
		make() {
			const m = new Blotter.ChannelSplitMaterial();
			m.uniforms.uOffset.value = 0.02;
			m.uniforms.uRotation.value = 35;
			m.uniforms.uApplyBlur.value = 1;
			m.uniforms.uAnimateNoise.value = 0;
			m.uniforms.uBlendColor.value = BLEND;
			return m;
		},
		drive(inst, s) {
			const u = inst.blotter.material.uniforms;
			u.uOffset.value = 0.015 + 0.06 * s.e;
			u.uRotation.value = glDeg(s.dir);
		}
	},
	rolling: {
		caption: 'A wave rolls through the words and swells with your speed.',
		make() {
			const m = new Blotter.RollingDistortMaterial();
			m.uniforms.uSpeed.value = 1;
			m.uniforms.uSineDistortSpread.value = 0.18;
			m.uniforms.uSineDistortCycleCount.value = 2;
			m.uniforms.uSineDistortAmplitude.value = 0.015;
			m.uniforms.uNoiseDistortVolatility.value = 20;
			m.uniforms.uNoiseDistortAmplitude.value = 0.01;
			m.uniforms.uRotation.value = 0;
			return m;
		},
		drive(inst, s) {
			const u = inst.blotter.material.uniforms;
			u.uGlobalTime.value = s.phase * 0.22;
			u.uSineDistortAmplitude.value = 0.012 + 0.03 * s.e;
			u.uSineDistortSpread.value = 0.18 + 0.1 * s.e;
			u.uDistortPosition.value = [0.5, s.py];
		}
	}
};

/* ---------- the stir: pointer speed in, one smooth energy out ---------- */

const state = {
	e: 0.12, // 0 calm to 1 stirred, what the shaders read
	target: 0, // the pointer's own energy, decaying
	phase: 3, // time for the shaders, added up from the speed
	dir: -0.4, // direction of travel, radians in screen space
	dx: Math.cos(-0.4),
	dy: Math.sin(-0.4),
	px: 0.5, // where over the plate, 0 to 1
	py: 0.5,
	lastTick: 0
};
const pointer = { x: 0, y: 0, px: null, py: null, last: -1e9, seen: false };
/* the reduced-motion still: a calm but clearly bent frame */
const STILL = { e: 0.5, phase: 6.4, dir: -0.55, px: 0.5, py: 0.5 };

/* a slow graphics card (Blotter reads every frame back from the GPU): the cost of a style's draws is averaged once, and if it is
   high the picture is drawn with fewer pixels (ratio 1) and, if still slow, at 30 frames a second, rather than let the page stutter */
const quality = { ratioCap: 2, half: false, sum: 0, frames: 0, skip: 0 };

function onMove(ev) {
	pointer.x = ev.clientX;
	pointer.y = ev.clientY;
	pointer.seen = true;
	pointer.last = performance.now();
}

function advance(dt, t) {
	const now = performance.now();
	if (now - state.lastTick > 250) pointer.px = null; // after a pause, don't read the jump as a fast stroke
	state.lastTick = now;
	// speed of the pointer since the last frame (px per second); a touch or a mouse, same events
	if (pointer.seen && pointer.px !== null) {
		const mx = pointer.x - pointer.px;
		const my = pointer.y - pointer.py;
		const d = Math.hypot(mx, my);
		const v = d / dt;
		state.target = Math.max(state.target, clamp(v / 2000, 0, 1));
		if (v > 90) {
			state.dx = lerp(state.dx, mx / d, 0.2);
			state.dy = lerp(state.dy, my / d, 0.2);
		}
	}
	pointer.px = pointer.x;
	pointer.py = pointer.y;

	// the ghost: a slow wandering pointer that takes over a couple of seconds after the real one rests
	const ghostW = clamp((now - pointer.last - 2200) / 1600, 0, 1);
	const gx = 0.5 + 0.36 * Math.sin(t * 0.41 + 0.7);
	const gy = 0.5 + 0.3 * Math.sin(t * 0.57 + 2.1);
	const gvx = 0.36 * 0.41 * Math.cos(t * 0.41 + 0.7);
	const gvy = 0.3 * 0.57 * Math.cos(t * 0.57 + 2.1);
	const swell = 0.5 + 0.5 * Math.sin(t * 0.5);
	const eGhost = 0.14 + 0.3 * swell * swell;

	state.target *= Math.exp(-dt / 1.1);
	const floor = lerp(0.06, eGhost, ghostW);
	const want = Math.max(state.target, floor);
	state.e += (want - state.e) * (1 - Math.exp(-dt * (want > state.e ? 7 : 2.2)));

	state.phase += dt * (0.12 + 1.6 * state.e);

	let vx = state.dx;
	let vy = state.dy;
	if (ghostW > 0) {
		vx = lerp(vx, gvx, ghostW);
		vy = lerp(vy, gvy, ghostW);
	}
	state.dir = Math.atan2(vy, vx);

	// where the pointer is over the plate (used by the rolling wave)
	const r = plate.getBoundingClientRect();
	const rx = pointer.seen ? clamp((pointer.x - r.left) / r.width, 0, 1) : 0.5;
	const ry = pointer.seen ? clamp((pointer.y - r.top) / r.height, 0, 1) : 0.5;
	state.px = lerp(rx, gx, ghostW);
	state.py = lerp(ry, gy, ghostW);
}

/* ---------- Blotter: loading, layout, building ---------- */

function hasWebGL() {
	try {
		const c = document.createElement('canvas');
		const gl = c.getContext('webgl');
		if (!gl) return false;
		// Blotter packs its uniforms into float textures, so a GPU without them gets the plain text instead of garbage
		const ok = !!gl.getExtension('OES_texture_float');
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return ok;
	} catch (e) {
		return false;
	}
}

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.async = false;
		s.onload = resolve;
		s.onerror = () => reject(new Error(`could not load ${src}`));
		document.head.append(s);
	});
}

async function loadBlotter() {
	await loadScript(`${VENDOR}blotter.min.js`);
	await Promise.all(['liquidDistortMaterial', 'channelSplitMaterial', 'rollingDistortMaterial'].map((n) => loadScript(`${VENDOR}materials/${n}.js`)));
	if (!window.Blotter || !Blotter.Text || !Blotter.RollingDistortMaterial) throw new Error('Blotter did not start');
}

async function fontsReady() {
	const load = Promise.all([document.fonts.load(`900 100px ${FONT}`), document.fonts.load(`800 100px ${FONT}`)]);
	await Promise.race([load, new Promise((r) => setTimeout(r, 2500))]);
}

const mctx = document.createElement('canvas').getContext('2d');
function em(text, weight) {
	mctx.font = `${weight} 100px ${FONT}`;
	return mctx.measureText(text).width / 100;
}

/* what to draw at this width: one line "Liquid type" and the small line, or on a phone "Liquid" over "type" over the small line.
   Each line gets padding for the bend (the shader samples outside the glyphs, and anything pushed past the canvas is cut) */
function computeLayout() {
	const cs = getComputedStyle(plate);
	const avail = Math.floor(plate.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
	// a tall narrow screen gets "Liquid" over "type", for a bigger word; a short one (a phone on its side, a small phone) keeps one line
	const stacked = avail < 600 && innerHeight >= 740;
	const dpr = window.devicePixelRatio || 1;
	// 1 or 2, never in between: Blotter multiplies the text's pixel size by the ratio and builds an ImageData from the result,
	// which throws on a fractional size (a 125% or 150% screen would break it). Only a sharp screen gets the 4x pixels.
	const ratio = Math.min(quality.ratioCap, dpr >= (stacked ? 1.5 : 2) ? 2 : 1);
	// the canvas is the glyphs plus padding for the bend on both sides, so fit the whole canvas to the width
	const volKOf = (text, weight) => clamp(5.9 / em(text, weight), 0.45, 1.9);
	const kOf = (text, weight) => VOL_MAX * volKOf(text, weight) * 0.7;
	const fit = (text, weight, max) => Math.max(14, Math.min(max, Math.floor(((avail - 14) * (1 - 2 * kOf(text, weight))) / em(text, weight))));
	const spec = (text, weight, fs, leading) => {
		const e = em(text, weight);
		const volK = volKOf(text, weight);
		const textW = e * fs;
		const k = kOf(text, weight);
		const padX = Math.ceil((k * textW) / (1 - 2 * k)) + 6;
		const padY = Math.ceil(fs * 0.075 * volK) + 3;
		return { text, weight, fs, leading, volK, padX, padY, h: Math.round(fs * leading + 2 * padY) };
	};
	let lines;
	if (stacked) {
		const fs = fit(WORD_A, 900, 128);
		lines = [spec(WORD_A, 900, fs, 1.1), spec(WORD_B, 900, fs, 1.1), spec(SUB, 800, Math.min(fit(SUB, 800, 24), 22), 1.25)];
	} else {
		const fs = fit(WORD, 900, 150);
		const sub = clamp(Math.round(fs * 0.25), 19, Math.min(34, fit(SUB, 800, 34)));
		lines = [spec(WORD, 900, fs, 1.1), spec(SUB, 800, sub, 1.25)];
	}
	const total = lines.reduce((a, l) => a + l.h, 0);
	return { stacked, avail, ratio, lines, total, key: `${stacked}|${lines[0].fs}|${ratio}` };
}

function applyLayoutToDom(lay) {
	title.style.setProperty('--fs1', `${lay.lines[0].fs}px`);
	title.style.setProperty('--fs2', `${lay.lines[lay.lines.length - 1].fs}px`);
	const cs = getComputedStyle(plate);
	plate.style.minHeight = `${Math.ceil(lay.total + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom))}px`;
}

function whenReady(blotter) {
	return new Promise((resolve, reject) => {
		const to = setTimeout(() => reject(new Error('Blotter took too long to build')), 9000);
		blotter.on('ready', () => { clearTimeout(to); resolve(); });
	});
}

let layoutCur = null;
let built = {}; // style key -> its Blotter instance for the current layout
let pending = {}; // style key -> a build in flight
let active = null;
let activeKey = 'liquid';
let seq = 0;
let domText = '';
let swapped = false;
let failed = false;

async function build(key, lay) {
	const style = STYLES[key];
	const material = style.make();
	const texts = lay.lines.map((l) => new Blotter.Text(l.text, {
		family: FONT, size: l.fs, weight: l.weight, fill: INK, leading: l.leading,
		paddingLeft: l.padX, paddingRight: l.padX, paddingTop: l.padY, paddingBottom: l.padY
	}));
	const blotter = new Blotter(material, { texts, ratio: lay.ratio, autobuild: true, autostart: false, autoplay: true });
	const ready = whenReady(blotter);
	const scopes = texts.map((t) => blotter.forText(t));
	const set = document.createElement('div');
	set.className = 'ld-set';
	set.hidden = true;
	set.setAttribute('aria-hidden', 'true');
	scopes.forEach((sc) => sc.appendTo(set));
	title.append(set);
	try {
		await ready;
	} catch (e) {
		set.remove();
		throw e;
	}
	// Blotter puts each line's text inside its canvas as fallback content; the heading's aria-label carries the words instead
	scopes.forEach((sc, i) => {
		sc.domElement.textContent = '';
		sc.domElement.style.marginTop = i === 0 ? '0' : `${-Math.round((lay.lines[i - 1].padY + lay.lines[i].padY) * 0.8)}px`;
	});
	const inst = { key, blotter, material, texts, scopes, set, lay };
	style.prepare?.(inst);
	return inst;
}

/* one synchronous frame: set the time and the strengths, then let Blotter draw once and drop the frame it queued */
function draw(inst, s) {
	STYLES[inst.key].drive(inst, s);
	inst.blotter.start();
	inst.blotter.stop();
}

function dispose(inst) {
	try {
		inst.blotter.teardown();
		inst.set.remove();
		inst.blotter._renderer._renderTarget?.dispose();
		inst.blotter.mappingMaterial?.shaderMaterial?.dispose();
	} catch (e) { /* best effort */ }
}

const snapshot = () => (prefersReducedMotion() ? STILL : state);

function setPressed(key) {
	chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.style === key)));
}

function showNote(text) {
	caption.textContent = text;
	caption.classList.add('is-note');
}

function fallback(message) {
	failed = true;
	document.body.classList.add('ld-static'); // hides the "move across" hint
	ctl.stop();
	Object.values(built).forEach(dispose);
	built = {};
	pending = {};
	active = null;
	title.querySelectorAll('.ld-set').forEach((n) => n.remove());
	if (swapped || !title.querySelector('.ld-l1')) title.innerHTML = domText;
	title.removeAttribute('aria-label');
	swapped = false;
	chips.forEach((c) => { c.disabled = true; });
	stirBtn.disabled = true;
	pauseBtn.disabled = true;
	showNote(message);
}

async function select(key) {
	const my = ++seq;
	activeKey = key;
	setPressed(key);
	try {
		let inst = built[key];
		if (!inst) {
			const lay = layoutCur;
			pending[key] ||= build(key, lay).finally(() => { delete pending[key]; });
			inst = await pending[key];
			if (inst.lay !== layoutCur) { // the window changed shape while it was building
				dispose(inst);
				if (my === seq) await select(key);
				return;
			}
			built[key] = inst;
		}
		if (my !== seq || failed) return;
		draw(inst, snapshot());
		if (!swapped) {
			title.querySelectorAll('.ld-l1, .ld-l2').forEach((n) => n.remove());
			[...title.childNodes].forEach((n) => { if (n.nodeType === 3) n.remove(); }); // the space between the two lines: no text is left in the heading
			title.setAttribute('aria-label', LABEL);
			swapped = true;
		}
		Object.values(built).forEach((o) => { if (o !== inst) o.set.hidden = true; });
		inst.set.hidden = false;
		active = inst;
		quality.frames = 0;
		quality.sum = 0;
		caption.classList.remove('is-note');
		caption.textContent = STYLES[key].caption;
	} catch (e) {
		if (my !== seq || failed) return;
		if (!active) fallback('The shader could not start here, so the headline stays as plain text.');
		else {
			setPressed(active.key);
			activeKey = active.key;
			showNote('That style could not start here.');
		}
	}
}

/* the window changed size: rebuild only if the lines or the size they need really changed */
async function relayout() {
	if (failed || !layoutCur) return;
	const lay = computeLayout();
	if (lay.stacked === layoutCur.stacked && lay.ratio === layoutCur.ratio && Math.abs(lay.lines[0].fs - layoutCur.lines[0].fs) < 6) return;
	const stale = Object.values(built);
	layoutCur = lay;
	built = {};
	applyLayoutToDom(lay);
	await select(activeKey);
	stale.forEach((o) => { if (o !== active) dispose(o); });
}

function governor(cost) {
	const q = quality;
	q.frames++;
	// judge each style once, over frames 21 to 100 after it starts (the first ones are its shader compiling); a hitch counts at most 30 ms
	if (q.frames <= 20 || q.frames > 100) return;
	q.sum += Math.min(cost, 30);
	if (q.frames < 100) return;
	const avg = q.sum / 80;
	q.sum = 0;
	if (avg > 9 && active.lay.ratio > 1) {
		q.ratioCap = 1;
		relayout();
	} else if (avg > 12) {
		q.half = true;
	}
}

/* ---------- start ---------- */

let ctl = { stop() {}, start() {}, running: false };

function syncControls() {
	const still = prefersReducedMotion();
	const paused = pauseBtn.getAttribute('aria-pressed') === 'true';
	pauseBtn.disabled = still || failed;
	stirBtn.disabled = still || paused || failed;
}

async function start() {
	domText = title.innerHTML;
	boot();

	ctl = loop(card, (dt, t) => {
		if (!active) return;
		advance(dt, t);
		if (quality.half && (quality.skip ^= 1)) return;
		const t0 = performance.now();
		draw(active, state);
		governor(performance.now() - t0);
	}, { name: 'liquid-distort' });

	addEventListener('pointermove', onMove, { passive: true });
	plate.addEventListener('pointerdown', (ev) => {
		onMove(ev);
		if (!prefersReducedMotion()) state.target = Math.max(state.target, 0.75);
	});

	chips.forEach((c) => c.addEventListener('click', () => { if (!failed && c.dataset.style !== activeKey) select(c.dataset.style); }));
	stirBtn.addEventListener('click', () => {
		const a = Math.random() * Math.PI * 2;
		state.target = 1;
		state.dx = Math.cos(a);
		state.dy = Math.sin(a);
		pointer.last = performance.now();
	});
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
		syncControls();
	});
	reducedMotionQuery.addEventListener?.('change', syncControls);
	syncControls();

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(relayout, 200);
	});

	if (!hasWebGL()) {
		fallback('WebGL is off or missing in this browser, so the headline stays as plain text.');
		return;
	}
	try {
		await Promise.all([fontsReady(), loadBlotter()]);
		layoutCur = computeLayout();
		applyLayoutToDom(layoutCur);
		Blotter.webglRenderer.domElement.addEventListener('webglcontextlost', (ev) => {
			ev.preventDefault();
			fallback('The graphics card dropped WebGL, so the headline stays as plain text.');
		});
	} catch (e) {
		fallback('The shader could not start here, so the headline stays as plain text.');
		return;
	}
	await select('liquid');
}

start();
