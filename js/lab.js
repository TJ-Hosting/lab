/*
 * TJ-Hosting Lab — shared motion helpers.
 * - pauses CSS animation when the tab is hidden (html.is-paused) or a [data-motion] region is off-screen
 * - reveals .rise elements as they scroll in
 * - glass shine and tilt follow the pointer (transform only)
 * - loop(): a requestAnimationFrame loop that only runs while its element is on-screen,
 *   the tab is visible and the user hasn't asked for reduced motion
 */

const root = document.documentElement;
root.classList.add('js');

export const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReducedMotion = () => reducedMotionQuery.matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

const loops = [];
window.__labLoops = loops;

function syncHidden() {
	root.classList.toggle('is-paused', document.hidden);
	loops.forEach((l) => l.sync());
}
document.addEventListener('visibilitychange', syncHidden);
reducedMotionQuery.addEventListener?.('change', () => loops.forEach((l) => l.sync()));

/**
 * loop(element, tick, {always}) → controller
 * tick(dt, t) is called every frame while the element is in view, the tab is visible
 * and reduced motion is off (unless always: true). Returns {start, stop, frames, running}.
 */
export function loop(element, tick, options = {}) {
	const state = { frames: 0, running: false, inView: false, wanted: true, name: options.name || element.id || 'loop' };
	let raf = 0;
	let last = 0;
	const frame = (t) => {
		raf = requestAnimationFrame(frame);
		const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
		last = t;
		state.frames++;
		tick(dt, t / 1000);
	};
	state.sync = () => {
		const go = state.wanted && state.inView && !document.hidden && (options.always || !prefersReducedMotion());
		if (go && !state.running) {
			state.running = true;
			last = 0;
			raf = requestAnimationFrame(frame);
		} else if (!go && state.running) {
			state.running = false;
			cancelAnimationFrame(raf);
		}
	};
	state.start = () => { state.wanted = true; state.sync(); };
	state.stop = () => { state.wanted = false; state.sync(); };
	const io = new IntersectionObserver((entries) => {
		state.inView = entries[entries.length - 1].isIntersecting;
		state.sync();
	}, { threshold: 0 });
	io.observe(element);
	loops.push(state);
	return state;
}

/* the top bar: once the page is scrolled, a soft fade of the sky behind it (DS v9's stuck bar) */
const bar = document.querySelector('.topbar');
if (bar) {
	const stuck = () => bar.classList.toggle('is-stuck', scrollY > 4);
	addEventListener('scroll', stuck, { passive: true });
	stuck();
}

/* [data-motion] regions get .is-live while on-screen (CSS pauses the rest) */
const liveIO = new IntersectionObserver((entries) => {
	entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
}, { rootMargin: '80px 0px' });
export function watchMotion(scope = document) {
	scope.querySelectorAll('[data-motion]').forEach((el) => liveIO.observe(el));
}

/* .rise elements fade/slide in once */
const riseIO = new IntersectionObserver((entries) => {
	entries.forEach((e) => {
		if (e.isIntersecting) {
			e.target.classList.add('is-in');
			riseIO.unobserve(e.target);
		}
	});
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
export function watchRise(scope = document) {
	scope.querySelectorAll('.rise:not(.is-in)').forEach((el) => riseIO.observe(el));
}

/* glass shine + tilt (pointer devices only, never with reduced motion) */
export function enhanceGlass(scope = document) {
	if (!finePointer.matches || prefersReducedMotion()) return;
	scope.querySelectorAll('.glass[data-shine]:not([data-shine-ready])').forEach((el) => {
		el.dataset.shineReady = '';
		const shine = document.createElement('span');
		shine.className = 'glass__shine';
		shine.setAttribute('aria-hidden', 'true');
		el.prepend(shine);
		const tilt = el.classList.contains('glass--interactive') ? parseFloat(el.dataset.tilt || '5') : 0;
		let raf = 0;
		let px = 0;
		let py = 0;
		const apply = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const x = px - r.left;
			const y = py - r.top;
			el.style.setProperty('--shine-x', `${x}px`);
			el.style.setProperty('--shine-y', `${y}px`);
			if (tilt) {
				el.style.setProperty('--tilt-y', `${((x / r.width) - 0.5) * tilt}deg`);
				el.style.setProperty('--tilt-x', `${(0.5 - (y / r.height)) * tilt}deg`);
			}
		};
		el.addEventListener('pointermove', (ev) => {
			px = ev.clientX;
			py = ev.clientY;
			if (!raf) raf = requestAnimationFrame(apply);
		});
		el.addEventListener('pointerleave', () => {
			el.style.setProperty('--tilt-x', '0deg');
			el.style.setProperty('--tilt-y', '0deg');
		});
	});
}

/* pointer parallax for [data-depth] children of a [data-parallax] scene */
export function parallax(scene) {
	if (!scene || prefersReducedMotion()) return;
	const items = [...scene.querySelectorAll('[data-depth]')];
	let tx = 0;
	let ty = 0;
	let x = 0;
	let y = 0;
	const ctl = loop(scene, () => {
		x += (tx - x) * 0.06;
		y += (ty - y) * 0.06;
		items.forEach((el) => {
			const d = parseFloat(el.dataset.depth);
			el.style.transform = `translate3d(${x * d}px, ${y * d}px, 0)`;
		});
	}, { name: 'parallax' });
	addEventListener('pointermove', (ev) => {
		tx = (ev.clientX / innerWidth - 0.5) * 2;
		ty = (ev.clientY / innerHeight - 0.5) * 2;
	}, { passive: true });
	return ctl;
}

/**
 * govern(element): pauses every Web Animations API animation inside `element`
 * while it is off-screen or the tab is hidden, and resumes them afterwards.
 * Returns {isLive(), userPaused, setUserPaused(bool)} so a pause button can join in.
 */
export function govern(element) {
	const ctl = { inView: true, userPaused: false };
	// only animations this governor paused are played again: play() on a CSS animation held by a stylesheet rule
	// ([data-motion], .is-paused) overrides that rule for good, and a piece may have paused one on purpose (lab-05)
	const held = new WeakSet();
	const apply = () => {
		const live = ctl.inView && !document.hidden && !ctl.userPaused;
		element.getAnimations({ subtree: true }).forEach((a) => {
			if (live && a.playState === 'paused' && held.has(a)) {
				held.delete(a);
				a.play();
			} else if (!live && a.playState === 'running') {
				held.add(a);
				a.pause();
			}
		});
		element.classList.toggle('is-held', !live);
	};
	ctl.isLive = () => ctl.inView && !document.hidden && !ctl.userPaused;
	ctl.setUserPaused = (v) => { ctl.userPaused = v; apply(); };
	ctl.apply = apply;
	new IntersectionObserver((entries) => {
		ctl.inView = entries[entries.length - 1].isIntersecting;
		apply();
	}).observe(element);
	document.addEventListener('visibilitychange', apply);
	return ctl;
}

/* sample pages: the info panel can fold away so the piece gets the whole screen */
function infoToggle() {
	const info = document.querySelector('.sample-info');
	if (!info || info.querySelector('.info-toggle')) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'info-toggle';
	btn.setAttribute('aria-expanded', 'true');
	btn.setAttribute('aria-label', 'Hide the description');
	btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
	btn.addEventListener('click', () => {
		const collapsed = info.dataset.collapsed !== 'true';
		info.dataset.collapsed = String(collapsed);
		btn.setAttribute('aria-expanded', String(!collapsed));
		btn.setAttribute('aria-label', collapsed ? 'Show the description' : 'Hide the description');
	});
	info.append(btn);
}

export function boot(scope = document) {
	infoToggle();
	watchMotion(scope);
	watchRise(scope);
	enhanceGlass(scope);
}

syncHidden();
