/*
 * Sample 37 — "Glass pricing with rolling digits".
 * Three made-up hosting plans (Starter, Business, Pro) on frosted glass, a Monthly / Yearly switch and a stepper for extra
 * email boxes. Every price, the box count and the totals are <number-flow> elements: setting a new value with .update()
 * makes the component roll its digits to it. This file holds the prices, keeps the numbers in step with the controls, writes
 * a plain-text summary line (a polite live region, because the component's shadow DOM is exposed to assistive tech as one
 * labelled image and a change of its label is not announced), and flips the billing switch by itself every ~8 s while
 * nobody is using the page. The conic edge of the featured plan is CSS (piece.css).
 *
 * Uses number-flow@0.6.2 (https://github.com/barvian/number-flow), vendored unmodified in vendor/number-flow@0.6.2/, MIT licence.
 * The page code in this folder is new; it calls the component through its documented custom-element API
 * (update(), format, locales, numberSuffix). The licence of the library:
 *
 * MIT License
 *
 * Copyright (c) 2024 Maxwell Barvian
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
 * Motion: the component animates with the Web Animations API (transform and opacity, through registered custom
 * properties). It starts an animation only when a value changes, so nothing runs at rest; on reduced motion its own
 * respectMotionPreference (on by default) makes every change instant, and here a hidden tab, an off-screen page or Pause
 * finishes a roll in flight. The only continuous motion is the CSS edge on the featured card, governed by govern()
 * and the [data-motion] region.
 */
import '../../vendor/number-flow@0.6.2/index.mjs'; // defines <number-flow>
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

/* ---------- the made-up prices (CAD, whole dollars) ---------- */

const PLANS = {
	starter: { name: 'Starter', m: 8, y: 6 },
	business: { name: 'Business', m: 18, y: 14 },
	pro: { name: 'Pro', m: 38, y: 30 },
};
const BOX = { m: 3, y: 2 }; // one extra email box, per month
const MAX_BOXES = 20;
const IDLE_MS = 8000; // quiet time before the billing switch flips on its own, and the gap between flips
const SETTLE_MS = 450; // the summary line waits for the digits

const stage = document.querySelector('.pricing-stage');
const billingInputs = [...document.querySelectorAll('input[name="billing"]')];
const planInputs = [...document.querySelectorAll('input[name="plan"]')];
const minus = document.getElementById('minus');
const plus = document.getElementById('plus');
const says = document.getElementById('says');
const switchBtn = document.querySelector('[data-action="switch"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

const state = { billing: 'monthly', plan: 'business', boxes: 2 };

/* number-flow needs CSS mod() and round(); without them (a browser before 2023) its digits can't be laid out,
   so plain text is written instead and the page still works */
const flowOK = typeof CSS !== 'undefined' && CSS.supports?.('line-height', 'mod(1,1)');

const CAD = { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 0 };
const money = new Intl.NumberFormat('en-CA', CAD);
const fmtMoney = (n) => money.format(n);

/* ---------- the numbers ---------- */

const flows = [...document.querySelectorAll('number-flow')];
const byKey = (k, plan) => flows.find((f) => f.dataset.k === k && (!plan || f.dataset.plan === plan));
const countFlow = byKey('count');

flows.forEach((f) => {
	f.locales = 'en-CA';
	f.format = f.dataset.k === 'count' ? { maximumFractionDigits: 0 } : CAD;
	if (f.dataset.suffix) f.numberSuffix = f.dataset.suffix;
});

function setNum(flow, value) {
	if (flowOK) flow.update(value);
	else flow.textContent = flow.dataset.k === 'count' ? String(value) : `${fmtMoney(value)}${flow.dataset.suffix || ''}`;
}

/* a roll in flight stops where it would end: used when the page goes quiet (hidden tab, off-screen, Pause, reduced motion) */
function finishRolls() {
	flows.forEach((f) => f.shadowRoot?.getAnimations().forEach((a) => a.finish()));
}

const key = () => (state.billing === 'yearly' ? 'y' : 'm');

const monthly = () => PLANS[state.plan][key()] + state.boxes * BOX[key()]; // the total per month

/* write every number; zero = the opening frame the digits roll up from */
function paint(zero = false) {
	const k = key();
	const z = (n) => (zero ? 0 : n);
	Object.entries(PLANS).forEach(([id, p]) => {
		setNum(byKey('price', id), z(p[k]));
		setNum(byKey('year', id), z(p[k] * 12));
	});
	const month = monthly();
	setNum(byKey('each'), z(BOX[k]));
	setNum(countFlow, z(state.boxes));
	setNum(byKey('sum'), z(month));
	setNum(byKey('sumyear'), z(month * 12));
}

/* ---------- the summary line (a polite live region, only for what the visitor does) ---------- */

let sayTimer = 0;
function summary() {
	const k = key();
	const p = PLANS[state.plan];
	const month = monthly();
	const n = state.boxes;
	const boxes = n === 0 ? 'no extra email boxes' : `${n} extra email ${n === 1 ? 'box' : 'boxes'} at ${fmtMoney(BOX[k])} each`;
	return `${p.name} plan, billed ${state.billing}: ${fmtMoney(p[k])} a month plus ${boxes}. Total ${fmtMoney(month)} a month, ${fmtMoney(month * 12)} over 12 months. Sample prices; nothing is ordered or sent.`;
}
function say(byVisitor) {
	clearTimeout(sayTimer);
	// the autopilot's flips are not announced: the region is switched off for them, and on (before the text changes) for the visitor's
	says.setAttribute('aria-live', byVisitor ? 'polite' : 'off');
	sayTimer = setTimeout(() => { says.textContent = summary(); }, SETTLE_MS);
}

/* ---------- the controls ---------- */

let lastAct = performance.now(); // the last visitor input, or the last flip by the autopilot

/* the chosen plan's ring, the stepper's limits and the summary line follow the state */
function sync(byVisitor = true) {
	planInputs.forEach((i) => i.closest('.plan').classList.toggle('is-chosen', i.checked));
	minus.setAttribute('aria-disabled', String(state.boxes <= 0));
	plus.setAttribute('aria-disabled', String(state.boxes >= MAX_BOXES));
	say(byVisitor);
}
function render(byVisitor = true) {
	paint();
	sync(byVisitor);
}

function setBilling(b, byVisitor = true) {
	state.billing = b;
	billingInputs.forEach((i) => { i.checked = i.value === b; });
	render(byVisitor);
}
function setBoxes(n) {
	state.boxes = Math.max(0, Math.min(MAX_BOXES, n));
	render();
}

billingInputs.forEach((i) => i.addEventListener('change', () => { if (i.checked) setBilling(i.value); }));
planInputs.forEach((i) => {
	i.checked = i.value === state.plan;
	i.addEventListener('change', () => { if (i.checked) { state.plan = i.value; render(); } });
});
minus.addEventListener('click', () => { if (state.boxes > 0) setBoxes(state.boxes - 1); });
plus.addEventListener('click', () => { if (state.boxes < MAX_BOXES) setBoxes(state.boxes + 1); });
switchBtn.addEventListener('click', () => setBilling(state.billing === 'monthly' ? 'yearly' : 'monthly'));

/* any input of the visitor's holds the autopilot back */
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => addEventListener(t, () => { lastAct = performance.now(); }, { capture: true, passive: true }));

/* ---------- motion: the autopilot, Pause, and what stops it ---------- */

const gov = govern(stage); // on screen, tab visible, not paused: its isLive() tells the autopilot whether to fire
let timer = 0;

const quiet = () => !prefersReducedMotion() && gov.isLive() && !stage.querySelector(':focus-visible');

function arm() {
	clearTimeout(timer);
	if (prefersReducedMotion()) return; // no timers start motion
	timer = setTimeout(tick, Math.max(400, lastAct + IDLE_MS - performance.now()));
}
function tick() {
	const now = performance.now();
	if (!quiet()) {
		lastAct = now; // not running (hidden, off-screen, paused, or a keyboard visitor is here): count again from the next quiet moment
	} else if (now - lastAct >= IDLE_MS - 30) {
		setBilling(state.billing === 'monthly' ? 'yearly' : 'monthly', false);
		lastAct = now;
	}
	arm();
}

function setPaused(p) {
	pauseBtn.setAttribute('aria-pressed', String(p));
	pauseBtn.textContent = p ? 'Play' : 'Pause';
	gov.setUserPaused(p);
	if (p) finishRolls();
	else lastAct = performance.now();
}
pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

function syncMotion() {
	const reduced = prefersReducedMotion();
	pauseBtn.disabled = reduced;
	if (reduced) {
		clearTimeout(timer);
		finishRolls();
	} else {
		lastAct = performance.now();
		arm();
	}
}
reducedMotionQuery.addEventListener?.('change', syncMotion);

/* a roll never runs on in a hidden tab or off-screen: the page lands on the final numbers */
document.addEventListener('visibilitychange', () => { if (document.hidden) finishRolls(); });
new IntersectionObserver((entries) => { if (!entries[entries.length - 1].isIntersecting) finishRolls(); }).observe(stage);

/* ---------- start ---------- */

boot();
const opening = !prefersReducedMotion() && flowOK && document.visibilityState === 'visible';
paint(opening); // with the opening on, the digits start at zero
sync(false);
clearTimeout(sayTimer);
says.textContent = summary(); // shown from the start, but not announced
syncMotion();
stage.classList.add('is-ready');

/* the opening: once the font is in, the numbers roll up from zero (only while the page is running; otherwise they just appear) */
if (opening) {
	(document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(() => {
		paint();
		if (prefersReducedMotion() || !gov.isLive()) finishRolls();
	}, 350));
}
