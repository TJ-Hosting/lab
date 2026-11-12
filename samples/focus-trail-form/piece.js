/*
 * Sample 44 — "Focus-trail contact form".
 * A demo contact form (Name, Email, Message) on frosted glass. A canvas laid over the card draws a glowing head that slides to
 * whichever field has focus, trailing a fading tail; valid fields get a tick and make the head grow, invalid ones shake.
 * Send turns the button into a paper plane that flies off, and the card shows "Sent (not really)" and clears itself: the page
 * has no password field, no request, no cookie and no storage, and says so. When nobody touches it for a few seconds the head
 * takes a slow tour of the fields (it never types and never moves focus). Under reduced motion, or paused, there is no loop:
 * one still frame is drawn on every focus or input, with no tail, no tour, no shake and no plane flight.
 *
 * Adapted from "Focusss v2" (CodePen) by Hakim El Hattab (hakimel), https://codepen.io/hakimel/pen/zYzdJvK , MIT licence.
 * CodePen's terms say public Pens are MIT licensed (https://blog.codepen.io/docs/licensing/); the pen itself carries no licence
 * line and no year of its own, so the copyright line below follows CodePen's template ("Copyright (c) YEAR - YOUR NAME - URL TO
 * ORIGINAL") without a year.
 *
 * Copyright (c) Hakim El Hattab (hakimel) - https://codepen.io/hakimel/pen/zYzdJvK
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 *  including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Kept from the source: one canvas over the form; a head that eases towards the focused field (a lerp of 0.2 per frame at 60 fps)
 * and swings sideways when focus changes; a tail made of the head's recent positions; the head growing when its field is valid;
 * a tick drawn with a line dash that is revealed as the field becomes valid; live validation on input.
 * Changed: a contact form, not a sign-up (no password, no checkboxes; a textarea instead); the page's native focus outline is
 * kept (the source removes it); the tail is time-based, tapered and faded, with a cyan glow; the head has a halo and a rim;
 * the tick sits in a small badge that stays on a valid field after focus has moved on; the glow lives in a gutter at the card's
 * left edge; invalid fields shake (CSS, transform only) and show a short message; Send becomes a paper plane (Web Animations,
 * transform and opacity) and a "Sent (not really)" plate; an idle tour; a demo "Fill sample" button; the pixel ratio is capped
 * at 2; everything runs through loop() so it stops off-screen and in a hidden tab; reduced motion and Pause draw one still frame.
 * Not used: the source's Roboto font, normalize.css, the sign-up copy, the checkboxes and the link to the author's profile.
 */
import { boot, govern, loop, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const TAU = Math.PI * 2;
const R = 8; // the head's radius at rest
const CHECK_R = 13; // ... when its field is valid
const BADGE_R = 9.5; // the badge a valid field keeps
const TAIL_S = 0.3; // seconds of tail
const IDLE_S = 3; // seconds of quiet before the head takes its tour
const DWELL_S = 1.5; // seconds the tour rests at each stop
const RESET_MS = 5000; // how long "Sent (not really)" stays
const TICK_L = 13.5; // length of the tick's path, for the line dash

const SAMPLE = {
	name: 'Sam Sample',
	email: 'sam@example.com',
	message: 'Hello! This is sample text for the demo form.',
};
const RULES = {
	name: { ok: (v) => v.trim().length >= 2, msg: 'Enter your name' },
	email: { ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Check the email address' },
	message: { ok: (v) => v.trim().length >= 10, msg: 'Write at least 10 characters' },
};
const DEFAULT_NOTE = 'Send is for show. Nothing leaves this page.';

const stage = document.querySelector('.focus-stage');
const card = document.getElementById('card');
const body = document.getElementById('card-body');
const canvas = document.getElementById('trail');
const ctx = canvas.getContext('2d');
const note = document.getElementById('card-note');
const sendBtn = document.getElementById('send');
const sentEl = document.getElementById('sent');
const againBtn = document.getElementById('again');
const flightLayer = document.getElementById('flight');
const fillBtn = document.querySelector('[data-action="fill"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

/* the three fields and the Send button: each is a place the head can go */
const stops = [...card.querySelectorAll('[data-field]')].map((wrap) => ({
	key: wrap.dataset.field,
	wrap,
	control: wrap.querySelector('.field__control'),
	msg: wrap.querySelector('.field__msg'),
	valid: false,
	err: false, // showing its error message
	v: 0, // the tick's progress, 0 to 1
	tv: 0, // ... and where it is heading
	x: 0,
	y: 0,
}));
const sendStop = { key: 'send', wrap: sendBtn.parentElement, control: sendBtn, valid: false, v: 0, tv: 0, x: 0, y: 0 };
const all = [...stops, sendStop];
const stopOf = (el) => all.find((s) => s.control === el);

const head = { x: NaN, y: NaN, r: R, a: 1, vx: 0, shake: 0 };
const trail = []; // the head's recent positions: {x, y, t}

let W = 0;
let H = 0;
let DPR = 1;
let headStop = stops[0]; // where the head is heading
let lastStop = null;
let focused = null; // the stop whose control has focus
let lastFocus = null; // ... or had it last
let tour = null; // {i, at} while the idle tour runs
let lastInput = performance.now() / 1000;
let wasBusy = true;
let busy = ''; // '', 'sending' or 'sent'
let paused = false;
let resetTimer = 0;
let fillTimers = [];

/* ---------- layout: where each stop's head sits, in the canvas's own pixels ---------- */

function layout() {
	const cr = canvas.getBoundingClientRect();
	all.forEach((s) => {
		const wr = s.wrap.getBoundingClientRect();
		// offsetLeft and offsetTop ignore transforms, so a shaking field does not shake the head
		const left = wr.left - cr.left + s.control.offsetLeft;
		s.x = left / 2; // halfway between the card's edge and the control
		s.y = wr.top - cr.top + s.control.offsetTop + (s.control.tagName === 'TEXTAREA' ? 24 : s.control.offsetHeight / 2);
	});
}

function resize() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.max(1, Math.round(W * DPR));
	canvas.height = Math.max(1, Math.round(H * DPR));
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	layout();
	render();
}

/* ---------- the drawing ---------- */

/* a filled strip through the points, each with its own width, shaded from transparent at the old end to `alpha` at the new one */
function ribbon(pts, scale, rgb, alpha) {
	const n = pts.length;
	const first = pts[0];
	const last = pts[n - 1];
	if (n < 2 || Math.hypot(last.x - first.x, last.y - first.y) < 1) return;
	const left = [];
	const right = [];
	for (let i = 0; i < n; i++) {
		const a = pts[Math.max(0, i - 1)];
		const b = pts[Math.min(n - 1, i + 1)];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		const hw = (pts[i].w * scale) / 2;
		left.push([pts[i].x - (dy / len) * hw, pts[i].y + (dx / len) * hw]);
		right.push([pts[i].x + (dy / len) * hw, pts[i].y - (dx / len) * hw]);
	}
	const g = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
	g.addColorStop(0, `rgba(${rgb}, 0)`);
	g.addColorStop(1, `rgba(${rgb}, ${alpha})`);
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.moveTo(left[0][0], left[0][1]);
	for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
	for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
	ctx.closePath();
	ctx.fill();
}

function draw(t) {
	ctx.clearRect(0, 0, W, H);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const sx = Math.sin(t * 52) * 3.5 * head.shake; // a small jolt when the field it sits on is invalid
	const hx = head.x + sx;
	const hy = head.y;

	// the tail: a ribbon through the head's recent positions, widest at the head, fading to a point
	if (trail.length) {
		const pts = trail.map((p) => ({ x: p.x, y: p.y, w: head.r * 1.3 * Math.max(0, 1 - (t - p.t) / TAIL_S) }));
		pts.push({ x: hx, y: hy, w: head.r * 1.3 });
		ribbon(pts, 2.3, '70, 208, 251', 0.26 * head.a); // the cyan glow, wider
		ribbon(pts, 1, '20, 117, 242', 0.62 * head.a); // the core
	}

	// the badge a valid field keeps once the head has moved on
	stops.forEach((s) => {
		if (s.v < 0.02) return;
		const k = Math.min(1, s.v * 1.15);
		ctx.fillStyle = `rgba(70, 208, 251, ${0.26 * k})`;
		ctx.beginPath();
		ctx.arc(s.x, s.y, BADGE_R * k + 3, 0, TAU);
		ctx.fill();
		ctx.fillStyle = '#0c6bed';
		ctx.beginPath();
		ctx.arc(s.x, s.y, BADGE_R * k, 0, TAU);
		ctx.fill();
	});

	// the head: a halo, a body with a bright spot, a white rim
	if (!Number.isNaN(hx)) {
		ctx.globalAlpha = head.a;
		const halo = ctx.createRadialGradient(hx, hy, head.r * 0.4, hx, hy, head.r * 3.4);
		halo.addColorStop(0, 'rgba(70, 208, 251, 0.55)');
		halo.addColorStop(1, 'rgba(70, 208, 251, 0)');
		ctx.fillStyle = halo;
		ctx.beginPath();
		ctx.arc(hx, hy, head.r * 3.4, 0, TAU);
		ctx.fill();
		const core = ctx.createRadialGradient(hx - head.r * 0.35, hy - head.r * 0.4, head.r * 0.1, hx, hy, head.r);
		core.addColorStop(0, '#9aeaff');
		core.addColorStop(0.45, '#2a8cf5');
		core.addColorStop(1, '#0c6bed');
		ctx.fillStyle = core;
		ctx.beginPath();
		ctx.arc(hx, hy, head.r, 0, TAU);
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(hx, hy, head.r - 0.75, 0, TAU);
		ctx.stroke();
		ctx.globalAlpha = 1;
	}

	// the ticks, on top of the head and the badges: a white stroke revealed with a line dash
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 2.6;
	ctx.setLineDash([TICK_L, TICK_L]);
	stops.forEach((s) => {
		if (s.v < 0.04) return;
		ctx.lineDashOffset = TICK_L * (1 - Math.min(1, s.v));
		ctx.beginPath();
		ctx.moveTo(s.x - 4.5, s.y + 0.5);
		ctx.lineTo(s.x - 1.5, s.y + 3.5);
		ctx.lineTo(s.x + 4.5, s.y - 3.5);
		ctx.stroke();
	});
	ctx.setLineDash([]);
}

/* the still frame: the head sits on its stop, no tail, ticks complete */
function drawStill() {
	head.x = headStop.x;
	head.y = headStop.y;
	head.vx = 0;
	head.shake = 0;
	head.r = headStop.valid ? CHECK_R : R;
	head.a = 1;
	trail.length = 0;
	stops.forEach((s) => { s.v = s.tv; });
	lastStop = headStop;
	wasBusy = true;
	draw(performance.now() / 1000);
}

/* something changed: the loop, if it is running, will draw it; otherwise draw the still frame now */
function render() {
	if (ctl && ctl.running) wasBusy = true;
	else drawStill();
}

/* ---------- the loop: the head's motion, the tour, the ticks ---------- */

const homeStop = () => focused || lastFocus || stops[0];
const canTour = () => !focused && !busy && !paused && !prefersReducedMotion();

function step(dt, t) {
	const frame = dt * 60;

	// the idle tour: slow visits to the fields, with no typing and no focus
	if (!tour && canTour() && t - lastInput > IDLE_S) tour = { i: 0, at: t };
	if (tour) {
		if (!canTour()) {
			tour = null;
			headStop = homeStop();
		} else {
			if (t - tour.at > DWELL_S) {
				tour.i = (tour.i + 1) % all.length;
				tour.at = t;
			}
			headStop = all[tour.i];
		}
	}

	// the head eases to its stop; a change of stop swings it sideways first
	if (Number.isNaN(head.x)) {
		head.x = headStop.x;
		head.y = headStop.y;
	}
	if (headStop !== lastStop) {
		head.vx = -(1.6 + Math.abs(headStop.y - head.y) / 90);
		lastStop = headStop;
	}
	const k = 1 - 0.84 ** frame;
	head.x += (headStop.x - head.x) * k;
	head.y += (headStop.y - head.y) * k;
	head.vx *= 0.8 ** frame;
	head.x += head.vx * frame;
	head.shake *= 0.9 ** frame;

	let tr = headStop.valid && !tour ? CHECK_R : R;
	if (tour) tr += 1.4 * (0.5 + 0.5 * Math.sin(t * 4.2)); // a slow breath while it tours
	head.r += (tr - head.r) * k;
	const ta = busy ? 0 : !tour && !focused && lastFocus ? 0.6 : 1; // gone while it sends, dimmer once focus has left the form
	head.a += (ta - head.a) * k * 0.6;

	// the ticks
	let ticking = false;
	stops.forEach((s) => {
		if (Math.abs(s.tv - s.v) > 0.004) {
			s.v += (s.tv - s.v) * (1 - 0.86 ** frame);
			ticking = true;
		} else {
			s.v = s.tv;
		}
	});

	// the tail: where the head has been in the last 0.3 s
	const last = trail[trail.length - 1];
	if (!last || Math.hypot(last.x - head.x, last.y - head.y) > 0.4) trail.push({ x: head.x, y: head.y, t });
	while (trail.length && t - trail[0].t > TAIL_S) trail.shift();

	const moving = Math.abs(headStop.x - head.x) > 0.05 || Math.abs(headStop.y - head.y) > 0.05 || Math.abs(head.vx) > 0.02;
	const busyNow = tour || moving || ticking || trail.length > 1 || head.shake > 0.01 || Math.abs(tr - head.r) > 0.02 || Math.abs(ta - head.a) > 0.01;
	if (!busyNow) {
		head.x = headStop.x;
		head.y = headStop.y;
		head.r = tr;
		head.a = ta;
	}
	if (busyNow || wasBusy) draw(t); // one more frame after it settles
	wasBusy = !!busyNow;
}

/* ---------- fields: validation, messages, shake ---------- */

function paint(s) {
	const ok = s.valid;
	const show = !ok && s.err;
	s.wrap.classList.toggle('is-valid', ok);
	s.wrap.classList.toggle('is-invalid', show);
	if (show) s.control.setAttribute('aria-invalid', 'true');
	else s.control.removeAttribute('aria-invalid');
	s.msg.textContent = ok ? 'Looks good' : show ? RULES[s.key].msg : '';
}

function update(s) {
	s.valid = RULES[s.key].ok(s.control.value);
	s.tv = s.valid ? 1 : 0;
	if (s.valid) s.err = false;
	paint(s);
}

function motionOn() {
	return !prefersReducedMotion() && !paused;
}

function shake(s) {
	if (!motionOn()) return;
	const el = s.control;
	el.classList.remove('is-shaking');
	void el.offsetWidth; // restart the animation
	el.classList.add('is-shaking');
	if (headStop === s) head.shake = 1;
	wasBusy = true;
}
card.addEventListener('animationend', (e) => e.target.classList.remove('is-shaking'));

function say(text, isError = false) {
	note.textContent = text;
	note.classList.toggle('is-error', isError);
}

function syncFillLabel() {
	fillBtn.textContent = stops.some((s) => s.control.value) ? 'Clear form' : 'Fill sample';
}

/* ---------- attention: any input stops the tour ---------- */

function poke() {
	lastInput = performance.now() / 1000;
	if (tour) {
		tour = null;
		headStop = homeStop();
		render();
	}
}
addEventListener('pointerdown', poke, { passive: true });
addEventListener('pointermove', poke, { passive: true });
addEventListener('keydown', poke, { passive: true });

card.addEventListener('focusin', (e) => {
	const s = stopOf(e.target);
	if (!s) return;
	poke();
	focused = s;
	lastFocus = s;
	headStop = s;
	render();
});

card.addEventListener('focusout', (e) => {
	const s = stopOf(e.target);
	if (!s) return;
	if (!e.relatedTarget || !card.contains(e.relatedTarget)) focused = null;
	// leaving a field that has something wrong with it: say so, and shake
	if (s.control.value && !s.valid && !busy) {
		s.err = true;
		paint(s);
		shake(s);
	}
	render();
});

card.addEventListener('input', (e) => {
	const s = stopOf(e.target);
	if (!s || s === sendStop) return;
	cancelFill();
	update(s);
	if (note.classList.contains('is-error')) say(DEFAULT_NOTE);
	syncFillLabel();
	render();
});

/* ---------- Fill sample: a demo of the ticks ---------- */

function cancelFill() {
	fillTimers.forEach(clearTimeout);
	fillTimers = [];
}

function fillSample() {
	cancelFill();
	if (busy) return;
	const empty = stops.every((s) => !s.control.value);
	if (!empty) {
		stops.forEach((s) => {
			s.control.value = '';
			s.err = false;
			update(s);
		});
		say(DEFAULT_NOTE);
		syncFillLabel();
		render();
		return;
	}
	const put = (s) => {
		s.control.value = SAMPLE[s.key];
		update(s);
		if (note.classList.contains('is-error')) say(DEFAULT_NOTE);
		if (!focused) headStop = s;
		syncFillLabel();
		render();
	};
	if (!motionOn()) {
		stops.forEach(put);
		return;
	}
	stops.forEach((s, i) => fillTimers.push(setTimeout(() => put(s), 120 + i * 480)));
	fillTimers.push(setTimeout(() => {
		if (!focused) headStop = sendStop;
		render();
	}, 120 + stops.length * 480));
}

/* ---------- Send: a plane flies off, nothing is sent ---------- */

const PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 15 22l-4-9-9-4z" fill="#ffffff" stroke="#0c6bed" stroke-width="1.7" stroke-linejoin="round"/><path d="M22 2 11 13" fill="none" stroke="#0c6bed" stroke-width="1.7" stroke-linecap="round"/></svg>';

function planeFrames(dx, dy, k) {
	return [
		{ offset: 0, transform: 'translate(0px, 0px) scale(0.4) rotate(0deg)', opacity: 0, easing: 'ease-out' },
		{ offset: 0.14, transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: k, easing: 'ease-in-out' },
		{ offset: 0.3, transform: `translate(${dx * 0.05}px, ${dy * 0.05}px) scale(1.08) rotate(-10deg)`, opacity: k, easing: 'ease-in' },
		{ offset: 0.62, transform: `translate(${dx * 0.36}px, ${dy * 0.38}px) scale(0.9) rotate(-14deg)`, opacity: k, easing: 'ease-in' },
		{ offset: 1, transform: `translate(${dx}px, ${dy}px) scale(0.32) rotate(-8deg)`, opacity: 0 },
	];
}

/* the button melts away while a disc with a paper plane grows in its place and takes off; three fainter planes follow it */
function flight() {
	const r = sendBtn.getBoundingClientRect();
	const cx = r.left + r.width / 2;
	const cy = r.top + r.height / 2;
	const dx = Math.min(innerWidth * 0.5, 640);
	const dy = -Math.min(innerHeight * 0.55, 460);
	const anims = [];
	[1, 0.4, 0.26, 0.14].forEach((k, g) => {
		const el = document.createElement('span');
		el.className = 'plane';
		el.style.left = `${cx}px`;
		el.style.top = `${cy}px`;
		el.innerHTML = (g === 0 ? '<i class="plane__disc"></i>' : '') + PLANE;
		flightLayer.append(el);
		anims.push(el.animate(planeFrames(dx, dy, k), { duration: 1500, delay: g * 90, easing: 'linear', fill: 'both' }));
		if (g === 0) {
			anims.push(el.firstChild.animate(
				[{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0, offset: 0.5 }],
				{ duration: 1500, easing: 'linear', fill: 'both' },
			));
		}
	});
	sendBtn.classList.add('is-launched');
	return Promise.all(anims.map((a) => a.finished));
}

function showSent() {
	flightLayer.replaceChildren();
	busy = 'sent';
	sentEl.inert = false;
	sentEl.setAttribute('aria-hidden', 'false');
	sentEl.classList.add('is-on');
	againBtn.focus({ preventScroll: true });
	body.inert = true;
	say('Sent (not really). Nothing was sent or stored.');
	scheduleReset(RESET_MS);
}

function scheduleReset(ms) {
	clearTimeout(resetTimer);
	resetTimer = setTimeout(() => {
		// wait while the tab is hidden or the card is off-screen
		if (!gov.isLive()) scheduleReset(1000);
		else reset();
	}, ms);
}

function reset() {
	clearTimeout(resetTimer);
	const hadFocus = card.contains(document.activeElement);
	sentEl.classList.remove('is-on');
	sentEl.inert = true;
	sentEl.setAttribute('aria-hidden', 'true');
	body.inert = false;
	card.reset();
	stops.forEach((s) => {
		s.err = false;
		update(s);
	});
	sendBtn.classList.remove('is-launched');
	busy = '';
	say(DEFAULT_NOTE);
	syncFillLabel();
	focused = null;
	lastFocus = null;
	headStop = stops[0];
	lastInput = performance.now() / 1000;
	layout();
	if (hadFocus) stops[0].control.focus({ preventScroll: true });
	render();
}

function send() {
	if (busy) return;
	poke();
	cancelFill();
	const bad = stops.filter((s) => !RULES[s.key].ok(s.control.value));
	if (bad.length) {
		bad.forEach((s) => {
			s.err = true;
			paint(s);
			shake(s);
		});
		bad[0].control.focus();
		say(`${bad.length === 1 ? 'One field needs' : 'Some fields need'} a fix. Nothing was sent.`, true);
		return;
	}
	busy = 'sending';
	headStop = sendStop;
	say('Sending (not really).');
	if (!motionOn()) {
		showSent();
		return;
	}
	const done = () => showSent();
	flight().then(done, done);
	body.inert = true;
	render();
}

card.addEventListener('submit', (e) => {
	e.preventDefault(); // nothing is ever submitted
	send();
});
againBtn.addEventListener('click', () => reset());

/* ---------- the panel's buttons ---------- */

fillBtn.addEventListener('click', fillSample);

function setPaused(p) {
	paused = p;
	pauseBtn.setAttribute('aria-pressed', String(p));
	pauseBtn.textContent = p ? 'Play' : 'Pause';
	gov.setUserPaused(p);
	if (p) {
		ctl.stop();
		tour = null;
		headStop = homeStop();
		drawStill();
	} else {
		lastInput = performance.now() / 1000;
		ctl.start();
		render();
	}
}
pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

function syncMotion() {
	const reduced = prefersReducedMotion();
	pauseBtn.disabled = reduced;
	if (reduced) {
		tour = null;
		cancelFill();
		headStop = homeStop();
		drawStill();
	} else {
		lastInput = performance.now() / 1000;
		ctl.sync();
	}
}

/* ---------- start ---------- */

boot();
const gov = govern(stage);
const ctl = loop(canvas, step, { name: 'focus-trail' });
reducedMotionQuery.addEventListener?.('change', syncMotion);
new ResizeObserver(resize).observe(card);
document.fonts?.ready.then(() => {
	layout();
	render();
});
stops.forEach(update);
syncMotion();
resize();
