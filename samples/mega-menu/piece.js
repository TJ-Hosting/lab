/*
 * Sample 41 — "Morphing mega-menu".
 * A sample site header whose dropdown is ONE frosted panel. Pointing at (or opening) a menu item scales and moves a single glass layer to that
 * menu's size and place, slides and fades the menu's content inside it, and moves a cyan notch under the item: transform and opacity only,
 * never width or height. Hover has a short intent delay; a tap toggles; the keyboard has Enter, Space, ArrowDown, the arrows and Escape.
 * Under 760px the same markup is an accordion drawer. When nobody has touched it for a few seconds a ghost pointer tours the menu.
 *
 * Written from the idea only; no source code was read or copied. (The idea of one dropdown that resizes to its content, instead of a
 * separate panel per item, is the one in CodyHouse's navigation gem; everything here is new code.)
 */
import { boot, govern, prefersReducedMotion, reducedMotionQuery } from '../../js/lab.js';

const $ = (s, r = document) => r.querySelector(s);
const mm = $('#mm');
const bg = $('#mm-bg');
const notch = $('#mm-notch');
const ghost = $('#mm-ghost');
const burger = $('#mm-burger');
const nav = $('#mm-nav');
const stage = $('.mm-stage');
const items = [...mm.querySelectorAll('.mm-item')];
const triggers = items.map((li) => $('.mm-trigger', li));
const panes = items.map((li) => $('.mm-pane', li));
const nextBtn = $('[data-action="next"]');
const pauseBtn = $('[data-action="pause"]');
const N = items.length;

const HOVER_MS = 120; // hover intent: the pointer must stay this long on an item before its menu opens
const LEAVE_MS = 200; // and must stay away this long before it closes
const DROP = 8; // px the panel rises from when it first opens
const SLIDE = 20; // px the content slides while it cross-fades
const SETTLE = 380; // ms a closed or replaced piece keeps its place before it leaves the tab order
const IDLE_FIRST = 1700; // ms of nobody touching it before the first tour (so it is alive in a first glance) ...
const IDLE = 5000; // ... and before later ones, after a touch
const IDLE_AGAIN = 7000; // ms between tours
const DRAWER = '(max-width: 759.98px)';

const drawerQuery = matchMedia(DRAWER);
const gov = govern(stage);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const still = () => prefersReducedMotion();

let mode = '';
let open = -1; // the open item, or -1
let openedBy = ''; // 'hover' | 'click' | 'key' | 'api' | 'tour' | 'still'
let drawerOpen = false;
let drawerBy = '';
let geo = [];
let W0 = 1;
let H0 = 1;
let lastPointer = 'mouse';
let intentT = 0;
let leaveT = 0;
const offTimers = new Map();

/* ---------- geometry: where each menu sits, and how the one glass layer must be scaled to match ---------- */

function paneT(i, dx = 0, dy = 0) { return `translate3d(${geo[i].x + dx}px, ${dy}px, 0)`; }
function bgT(i, dy = 0) { return `translate3d(${geo[i].x}px, ${dy}px, 0) scale(${geo[i].w / W0}, ${geo[i].h / H0})`; }
function notchT(i, dy = 0) { return `translate3d(${geo[i].nx}px, ${dy}px, 0)`; }

/* change styles without a transition: set them, flush, then give the transition back */
function instant(els, fn) {
	els.forEach((e) => { e.style.transition = 'none'; });
	fn();
	void mm.offsetWidth;
	els.forEach((e) => { e.style.transition = ''; });
}

function setOff(el, off) {
	clearTimeout(offTimers.get(el));
	el.classList.toggle('is-off', off);
}
function offLater(el, stillTrue) {
	clearTimeout(offTimers.get(el));
	if (still()) { if (stillTrue()) el.classList.add('is-off'); return; }
	offTimers.set(el, setTimeout(() => { if (stillTrue()) el.classList.add('is-off'); }, SETTLE));
}

function measure() {
	if (mode !== 'bar') return;
	const hr = mm.getBoundingClientRect();
	geo = items.map((_, i) => {
		const tr = triggers[i].getBoundingClientRect();
		const w = panes[i].offsetWidth;
		const h = panes[i].offsetHeight;
		const cx = tr.left + tr.width / 2 - hr.left;
		const x = clamp(cx - w / 2, 0, Math.max(0, hr.width - w));
		return { cx, x, w, h, nx: clamp(cx, x + 26, x + w - 26) - 11 };
	});
	W0 = Math.max(1, ...geo.map((g) => g.w));
	H0 = Math.max(1, ...geo.map((g) => g.h));
	bg.style.width = `${W0}px`;
	bg.style.height = `${H0}px`;
	rest();
}

/* put every piece where the current state wants it, without a glide (after a resize or a font change) */
let lastShown = 0;
function rest() {
	if (mode !== 'bar' || !geo.length) return;
	const at = open >= 0 ? open : lastShown;
	instant([bg, notch, ...panes], () => {
		const y = open >= 0 ? 0 : -DROP * 0.6;
		bg.style.transform = bgT(at, y);
		bg.style.opacity = open >= 0 ? '1' : '0';
		notch.style.transform = notchT(at, y);
		notch.style.opacity = open >= 0 ? '1' : '0';
		panes.forEach((p, j) => {
			p.style.transform = paneT(j, 0, j === open ? 0 : -DROP * 0.6);
			p.style.opacity = j === open ? '1' : '0';
			p.classList.toggle('is-active', j === open);
		});
	});
}

/* ---------- opening, switching and closing the panel (the wide bar) ---------- */

function syncAria() {
	triggers.forEach((t, j) => {
		t.setAttribute('aria-expanded', String(j === open));
		items[j].classList.toggle('is-open', j === open);
	});
}

function showBar(i, how) {
	if (i === open) { openedBy = how; return; }
	const prev = open;
	open = i;
	openedBy = how;
	lastShown = i;
	mm.classList.add('is-open');
	[bg, notch, panes[i]].forEach((el) => setOff(el, false));
	if (prev < 0) {
		// first opening: the panel starts a little above its place, invisible, and settles into it
		instant([bg, notch, panes[i]], () => {
			bg.style.transform = bgT(i, -DROP);
			bg.style.opacity = '0';
			notch.style.transform = notchT(i, -DROP);
			notch.style.opacity = '0';
			panes[i].style.transform = paneT(i, 0, -DROP);
			panes[i].style.opacity = '0';
		});
	} else {
		// moving between items: the old content leaves against the direction of travel, the new content arrives from it
		const dir = i > prev ? 1 : -1;
		instant([panes[i]], () => {
			panes[i].style.transform = paneT(i, dir * SLIDE, 0);
			panes[i].style.opacity = '0';
		});
		const out = panes[prev];
		out.classList.remove('is-active');
		out.style.transform = paneT(prev, -dir * SLIDE, 0);
		out.style.opacity = '0';
		offLater(out, () => open !== prev);
	}
	bg.style.transform = bgT(i, 0);
	bg.style.opacity = '1';
	notch.style.transform = notchT(i, 0);
	notch.style.opacity = '1';
	panes[i].classList.add('is-active');
	panes[i].style.transform = paneT(i, 0, 0);
	panes[i].style.opacity = '1';
	syncAria();
}

function hideBar() {
	if (open < 0) return;
	const i = open;
	open = -1;
	openedBy = '';
	mm.classList.remove('is-open');
	const y = -DROP * 0.6;
	bg.style.opacity = '0';
	bg.style.transform = bgT(i, y);
	notch.style.opacity = '0';
	notch.style.transform = notchT(i, y);
	const p = panes[i];
	p.classList.remove('is-active');
	p.style.opacity = '0';
	p.style.transform = paneT(i, 0, y);
	// keyboard focus inside a menu that closes goes back to its button
	if (p.contains(document.activeElement)) triggers[i].focus({ preventScroll: true });
	offLater(bg, () => open < 0);
	offLater(notch, () => open < 0);
	offLater(p, () => open !== i);
	syncAria();
}

/* ---------- the accordion drawer (narrow screens) ---------- */

function setDrawer(on, how = '') {
	drawerOpen = on;
	drawerBy = on ? how : '';
	nav.classList.toggle('is-open', on);
	burger.setAttribute('aria-expanded', String(on));
	if (!on) collapseDrawer();
}
function collapseDrawer() {
	panes.forEach((p) => setOff(p, true));
	open = -1;
	openedBy = '';
	syncAria();
}
function showDrawer(i, how) {
	if (!drawerOpen) setDrawer(true, how);
	panes.forEach((p, j) => setOff(p, j !== i));
	open = i;
	openedBy = how;
	syncAria();
}

const show = (i, how) => (mode === 'bar' ? showBar(i, how) : showDrawer(i, how));
const hide = () => (mode === 'bar' ? hideBar() : collapseDrawer());

/* ---------- the mode (wide bar or drawer) ---------- */

function setMode() {
	const m = drawerQuery.matches ? 'drawer' : 'bar';
	if (m === mode) return;
	endTour();
	clearTimeout(intentT);
	clearTimeout(leaveT);
	open = -1;
	openedBy = '';
	drawerOpen = false;
	drawerBy = '';
	mm.classList.remove('is-open');
	nav.classList.remove('is-open');
	burger.setAttribute('aria-expanded', 'false');
	[bg, notch, ...panes].forEach((el) => {
		el.style.transform = '';
		el.style.opacity = '';
		el.style.transition = '';
		el.classList.remove('is-active');
		setOff(el, true);
	});
	mode = m;
	syncAria();
	measure();
	if (still()) openStill();
}

/* the reduced-motion still: the first menu, open (nothing moves; a touch or Escape changes it as usual) */
function openStill() {
	if (mode === 'bar') showBar(0, 'still');
	else { setDrawer(true, 'still'); showDrawer(0, 'still'); }
}

/* ---------- pointer: hover intent, tap to toggle, clicks that go nowhere ---------- */

triggers.forEach((t, i) => {
	t.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
	t.addEventListener('pointerenter', (e) => {
		if (mode !== 'bar' || e.pointerType !== 'mouse') return;
		clearTimeout(leaveT);
		clearTimeout(intentT);
		if (open === i) return;
		intentT = setTimeout(() => show(i, 'hover'), HOVER_MS);
	});
	t.addEventListener('pointerleave', () => clearTimeout(intentT));
	t.addEventListener('click', (e) => {
		activity();
		if (mode === 'drawer') { if (open === i) hide(); else show(i, 'click'); return; }
		if (e.detail === 0) {
			// Enter or Space (or a screen reader's activate): toggle, and go into the menu
			if (open === i) hide();
			else { show(i, 'key'); focusLink(i, 0); }
			return;
		}
		clearTimeout(intentT);
		if (lastPointer === 'mouse') show(i, 'click'); // hover has opened it already: a click never closes it
		else if (open === i) hide(); // a tap on touch or pen toggles
		else show(i, 'click');
	});
});

mm.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') clearTimeout(leaveT); });
mm.addEventListener('pointerleave', (e) => {
	if (mode !== 'bar' || e.pointerType !== 'mouse') return;
	clearTimeout(intentT);
	clearTimeout(leaveT);
	leaveT = setTimeout(() => {
		if (open >= 0 && !keyboardInside()) hideBar();
	}, LEAVE_MS);
});

burger.addEventListener('click', (e) => {
	activity();
	if (drawerOpen) { setDrawer(false); return; }
	setDrawer(true, 'click');
	if (e.detail === 0) triggers[0].focus({ preventScroll: true });
});

/* every sample link and button goes nowhere; choosing a link closes the menu */
document.addEventListener('click', (e) => {
	const a = e.target.closest?.('[data-sample]');
	if (!a) return;
	e.preventDefault();
	if (a.classList.contains('mm-link') || a.classList.contains('mm-more')) {
		const i = panes.findIndex((p) => p.contains(a));
		const fromKey = e.detail === 0;
		if (mode === 'bar') hideBar(); else { collapseDrawer(); setDrawer(false); }
		if (fromKey && i >= 0) triggers[i].focus({ preventScroll: true });
	}
});

/* a press outside the menu closes it */
document.addEventListener('pointerdown', (e) => {
	if (mm.contains(e.target) || e.target.closest?.('.sample-info')) return;
	if (mode === 'bar') hideBar();
	else if (drawerOpen) setDrawer(false);
}, true);

/* ---------- keyboard ---------- */

const links = (i) => [...panes[i].querySelectorAll('a')];
function focusLink(i, n) {
	const l = links(i);
	(n < 0 ? l[l.length - 1] : l[n])?.focus({ preventScroll: true });
}

/* the nearest link in a direction, by where the links sit on screen */
function neighbour(list, idx, key) {
	const r = list[idx].getBoundingClientRect();
	const cx = r.left + r.width / 2;
	const cy = r.top + r.height / 2;
	const vertical = key === 'ArrowDown' || key === 'ArrowUp';
	let best = null;
	let bestScore = Infinity;
	list.forEach((el, j) => {
		if (j === idx) return;
		const b = el.getBoundingClientRect();
		const dx = b.left + b.width / 2 - cx;
		const dy = b.top + b.height / 2 - cy;
		const ok = key === 'ArrowDown' ? dy > 8 : key === 'ArrowUp' ? dy < -8 : key === 'ArrowRight' ? dx > 8 && Math.abs(dy) < r.height / 2 : dx < -8 && Math.abs(dy) < r.height / 2;
		if (!ok) return;
		const score = (vertical ? Math.abs(dy) : Math.abs(dx)) + (vertical ? Math.abs(dx) : Math.abs(dy)) * 2;
		if (score < bestScore) { bestScore = score; best = el; }
	});
	return best;
}

mm.addEventListener('keydown', (e) => {
	const k = e.key;
	if (!k.startsWith('Arrow') && k !== 'Home' && k !== 'End') return;
	if (e.altKey || e.ctrlKey || e.metaKey) return;
	const t = e.target;
	if (mode === 'drawer') {
		if (t === burger) {
			if (k === 'ArrowDown') {
				e.preventDefault();
				if (!drawerOpen) setDrawer(true, 'key');
				triggers[0].focus({ preventScroll: true });
			}
			return;
		}
		if (k === 'ArrowLeft' || k === 'ArrowRight') return;
		// the drawer is one column: the arrows walk its buttons and the links of the open item
		const list = [...nav.querySelectorAll('.mm-trigger, .mm-pane:not(.is-off) a')];
		const idx = list.indexOf(t);
		if (idx < 0) return;
		e.preventDefault();
		if (idx === 0 && k === 'ArrowUp') { burger.focus(); return; }
		const j = k === 'Home' ? 0 : k === 'End' ? list.length - 1 : clamp(idx + (k === 'ArrowDown' ? 1 : -1), 0, list.length - 1);
		list[j].focus(); // may scroll the drawer, which has its own room on a phone
		return;
	}
	const ti = triggers.indexOf(t);
	if (ti >= 0) {
		if (k === 'ArrowDown') { e.preventDefault(); show(ti, 'key'); focusLink(ti, 0); }
		else if (k === 'ArrowUp' && open === ti) { e.preventDefault(); focusLink(ti, -1); }
		else if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
			e.preventDefault();
			const j = k === 'Home' ? 0 : k === 'End' ? N - 1 : (ti + (k === 'ArrowRight' ? 1 : -1) + N) % N;
			triggers[j].focus({ preventScroll: true });
			if (open >= 0) show(j, 'key'); // the open panel follows the focus
		}
		return;
	}
	const pi = panes.findIndex((p) => p.contains(t));
	if (pi < 0) return;
	const list = links(pi);
	const idx = list.indexOf(t);
	if (idx < 0) return;
	let next = null;
	if (k === 'Home') next = list[0];
	else if (k === 'End') next = list[list.length - 1];
	else {
		next = neighbour(list, idx, k);
		if (!next && k === 'ArrowUp') { e.preventDefault(); triggers[pi].focus({ preventScroll: true }); return; }
	}
	if (next) { e.preventDefault(); next.focus({ preventScroll: true }); }
});

document.addEventListener('keydown', (e) => {
	if (e.key !== 'Escape') return;
	const inside = mm.contains(document.activeElement);
	if (mode === 'drawer') {
		if (!drawerOpen) return;
		e.preventDefault();
		setDrawer(false);
		if (inside) burger.focus({ preventScroll: true });
		return;
	}
	if (open < 0) return;
	e.preventDefault();
	const i = open;
	hideBar();
	if (inside) triggers[i].focus({ preventScroll: true });
});

/* Tab (or a click) leaving the whole header closes the menu */
mm.addEventListener('focusout', (e) => {
	const to = e.relatedTarget;
	if (!to || mm.contains(to) || to.closest?.('.sample-info')) return;
	if (mode === 'bar') hideBar();
	else if (drawerOpen) setDrawer(false);
});

/* ---------- the idle tour: a ghost pointer visits Services, Pricing and About, then goes ---------- */

let touring = false;
let tourToken = 0;
let paused = false;
let idleT = 0;
let lastAct = 0;
let resumeSoon = false;
let slowEntry = false; // after a hidden tab, the ghost makes a slower entrance
const CANCEL = Symbol('cancel');

/* keyboard focus inside the menu (a mouse click that left focus on a button does not count) */
const keyboardInside = () => {
	const a = document.activeElement;
	return mm.contains(a) && a.matches(':focus-visible');
};

const canTour = () => !paused && !prefersReducedMotion() && gov.isLive() && !touring
	&& open < 0 && !drawerOpen && !keyboardInside() && !mm.matches(':hover');

function armIdle(ms = IDLE) {
	clearTimeout(idleT);
	if (document.hidden || paused || prefersReducedMotion()) return;
	idleT = setTimeout(() => { if (canTour()) runTour(); else armIdle(IDLE); }, ms);
}

/* any touch of the page, pointer or key, ends a tour and starts the wait again */
function activity() {
	const now = performance.now();
	if (!touring && now - lastAct < 160) return;
	lastAct = now;
	if (touring) endTour();
	armIdle(IDLE);
}

function ghostPlace(x, y) {
	ghost.style.transition = 'none';
	ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
	void ghost.offsetWidth;
	ghost.style.transition = '';
}
function ghostGo(x, y, ms) {
	ghost.style.transitionDuration = `${ms}ms, 350ms`;
	ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}
function pointOn(el, fx = 0.5, fy = 0.6) {
	const r = el.getBoundingClientRect();
	const h = mm.getBoundingClientRect();
	return [r.left - h.left + r.width * fx, r.top - h.top + r.height * fy];
}
function press() {
	ghost.classList.remove('is-press');
	void ghost.offsetWidth;
	ghost.classList.add('is-press');
}

async function tourBar(wait, slow) {
	const [sx, sy] = pointOn(triggers[0], 0.9, 0.5);
	ghostPlace(sx + 150, sy + 210);
	ghost.style.opacity = '0';
	await wait(60);
	ghost.style.opacity = '1';
	for (let k = 0; k < 3; k++) {
		const ms = k === 0 ? (slow ? 1400 : 700) : 800;
		const [x, y] = pointOn(triggers[k], 0.62, 0.62);
		ghostGo(x, y, ms);
		await wait(ms + HOVER_MS);
		press();
		show(k, 'tour');
		ghostGo(x + 9, y + 6, 1900); // the pointer drifts a little while it rests, like a hand
		await wait(1900);
	}
	const [ex, ey] = pointOn(triggers[2], 1.2, 0.5);
	ghostGo(ex, ey + 230, 700);
	await wait(250);
	hideBar();
	await wait(300);
	ghost.style.opacity = '0';
	await wait(500);
}

async function tourDrawer(wait, slow) {
	const [sx, sy] = pointOn(burger, 0.5, 0.5);
	ghostPlace(sx - 40, sy + 150);
	ghost.style.opacity = '0';
	await wait(60);
	ghost.style.opacity = '1';
	let [x, y] = pointOn(burger, 0.62, 0.62);
	ghostGo(x, y, slow ? 1400 : 700);
	await wait(slow ? 1500 : 800);
	press();
	setDrawer(true, 'tour');
	await wait(900);
	for (let k = 0; k < 3; k++) {
		[x, y] = pointOn(triggers[k], 0.7, 0.55);
		ghostGo(x, y, 750);
		await wait(900);
		press();
		show(k, 'tour');
		ghostGo(x + 8, y + 5, 1500);
		await wait(1500);
	}
	[x, y] = pointOn(burger, 0.62, 0.62);
	ghostGo(x, y, 800);
	await wait(900);
	press();
	setDrawer(false);
	await wait(500);
}

async function runTour() {
	const token = ++tourToken;
	const slow = slowEntry;
	slowEntry = false;
	touring = true;
	const ok = () => token === tourToken && gov.isLive() && !paused && !prefersReducedMotion();
	const wait = (ms) => new Promise((res, rej) => { setTimeout(() => (ok() ? res() : rej(CANCEL)), ms); });
	try {
		await (mode === 'bar' ? tourBar(wait, slow) : tourDrawer(wait, slow));
	} catch (err) {
		if (err !== CANCEL) throw err;
	} finally {
		// still the current tour: it ended by itself (or the page stopped being live): tidy up and wait for the next
		if (token === tourToken) { finishTour(); armIdle(IDLE_AGAIN); }
	}
}

function finishTour() {
	const wasTouring = touring;
	touring = false;
	ghost.style.opacity = '0';
	ghost.classList.remove('is-press');
	if (!wasTouring) return;
	if (mode === 'bar') { if (openedBy === 'tour') hideBar(); }
	else if (drawerBy === 'tour') setDrawer(false);
}
function endTour() {
	tourToken++;
	if (touring) finishTour();
}

['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach((t) => {
	document.addEventListener(t, activity, { passive: true, capture: true });
});
mm.addEventListener('focusin', activity);

/* a hidden tab stops the tour; coming back starts it again after a moment */
document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		resumeSoon = touring;
		endTour();
		clearTimeout(idleT);
	} else {
		slowEntry = resumeSoon;
		armIdle(resumeSoon ? 300 : IDLE);
		resumeSoon = false;
	}
});

/* ---------- the controls ---------- */

nextBtn.addEventListener('click', () => {
	endTour();
	armIdle(IDLE);
	if (mode === 'drawer') {
		if (!drawerOpen) { show(0, 'api'); return; }
		if (open + 1 < N) show(open + 1, 'api');
		else setDrawer(false);
		return;
	}
	if (open + 1 < N) show(open + 1, 'api');
	else hideBar();
});

function syncPause() {
	const reduced = prefersReducedMotion();
	pauseBtn.disabled = reduced;
	pauseBtn.title = reduced ? 'Nothing moves by itself with reduced motion' : '';
}
pauseBtn.addEventListener('click', () => {
	paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	if (paused) { endTour(); clearTimeout(idleT); } else armIdle(700);
});

reducedMotionQuery.addEventListener?.('change', () => {
	syncPause();
	if (prefersReducedMotion()) { endTour(); clearTimeout(idleT); rest(); } else armIdle(IDLE);
});

/* ---------- start ---------- */

boot();
syncPause();
drawerQuery.addEventListener('change', setMode);
setMode();

// widths and heights can change after the fonts load or the window is resized: measure again, once things settle
let roT = 0;
const ro = new ResizeObserver(() => {
	clearTimeout(roT);
	roT = setTimeout(measure, 40);
});
ro.observe(mm);
triggers.forEach((t) => ro.observe(t));
panes.forEach((p) => ro.observe(p));
document.fonts?.ready.then(measure);

if (!still()) armIdle(IDLE_FIRST);
