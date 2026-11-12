/*
 * Sample 01 — "Humanity, in motion".
 * One intro (letters fly in) then a 12 s cycle per letter:
 *   breathe wave → HUMAN (ITY dims) → UNITY (H, M, A fall away, the rest slide together) → HUMANITY.
 * Only transform and opacity animate. Layout is measured once per build (and on resize).
 */
import { boot, govern, loop, prefersReducedMotion, finePointer } from '../../js/lab.js';

const stage = document.querySelector('.type-stage');
const word = stage.querySelector('.type-word');
const letters = [...word.querySelectorAll('.l')];
const inners = letters.map((l) => l.querySelector('.l__in'));
const caps = [...stage.querySelectorAll('.cap')];
const glint = stage.querySelector('.type-glint');
const pauseBtn = document.querySelector('[data-action="pause"]');
const replayBtn = document.querySelector('[data-action="replay"]');

const CYCLE = 12000;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const UNITY = [1, 4, 5, 6, 7]; // U N I T Y
const FALL = [0, 2, 3]; // H M A
const ITY = [5, 6, 7];

const gov = govern(stage);
let anims = [];

/* deterministic "random" so every replay is the same choreography */
function rand(i, salt) {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
}

function measure() {
	// offsetLeft/offsetWidth ignore transforms, so this is the resting layout even mid-animation
	const boxes = letters.map((l) => ({ x: l.offsetLeft, w: l.offsetWidth }));
	const wordW = boxes.reduce((s, b) => s + b.w, 0);
	const unityW = UNITY.reduce((s, i) => s + boxes[i].w, 0);
	let cursor = (wordW - unityW) / 2;
	const dx = new Array(letters.length).fill(0);
	UNITY.forEach((i) => {
		dx[i] = cursor - boxes[i].x;
		cursor += boxes[i].w;
	});
	return { dx, em: parseFloat(getComputedStyle(word).fontSize) };
}

/* keyframes for one letter over the 12 s cycle (offsets are fractions of CYCLE) */
function cycleFrames(i, m) {
	const at = (ms) => ms / CYCLE;
	const peak = 500 + i * 90;
	const lift = -0.09 * m.em;
	const frames = [
		{ offset: 0, transform: 'none', opacity: 1 },
		{ offset: at(peak - 380), transform: 'none', opacity: 1, easing: 'ease-in-out' },
		{ offset: at(peak), transform: `translate3d(0, ${lift}px, 0) scale(1.06)`, opacity: 1, easing: 'ease-in-out' },
		{ offset: at(peak + 420), transform: 'none', opacity: 1 },
	];
	const isIty = ITY.includes(i);
	const falls = FALL.includes(i);
	const human = isIty ? `translate3d(${0.14 * m.em}px, 0, 0) scale(0.94)` : 'none';
	const humanOpacity = isIty ? 0.16 : 1;
	frames.push(
		{ offset: at(2000), transform: 'none', opacity: 1, easing: EASE },
		{ offset: at(2900), transform: human, opacity: humanOpacity },
		{ offset: at(4400), transform: human, opacity: humanOpacity, easing: EASE },
	);
	let unity;
	let unityOpacity = 1;
	if (falls) {
		const rot = (rand(i, 3) - 0.5) * 40;
		unity = `translate3d(${(rand(i, 4) - 0.5) * 0.4 * m.em}px, ${0.85 * m.em}px, ${-160}px) rotate(${rot}deg) scale(0.7)`;
		unityOpacity = 0.06;
	} else {
		unity = `translate3d(${m.dx[i]}px, 0, 0)`;
	}
	frames.push(
		{ offset: at(5600), transform: unity, opacity: unityOpacity },
		{ offset: at(8300), transform: unity, opacity: unityOpacity, easing: EASE },
		{ offset: at(9700), transform: 'none', opacity: 1 },
		{ offset: 1, transform: 'none', opacity: 1 },
	);
	return frames;
}

function captionFrames(k) {
	const at = (ms) => ms / CYCLE;
	// [fade-in start, fully in, hold until, fully out]
	const windows = [
		[0, 300, 1700, 2100],
		[2400, 2900, 4400, 4800],
		[5300, 5800, 8200, 8600],
		[9600, 10100, 11500, 11950],
	][k];
	const hidden = (o, y) => ({ offset: o, opacity: 0, transform: `translate3d(0, ${y}px, 0)` });
	const shown = (o) => ({ offset: o, opacity: 1, transform: 'none' });
	const f = [];
	if (windows[0] > 0) f.push(hidden(0, 10));
	f.push(hidden(at(windows[0]), 10), shown(at(windows[1])), shown(at(windows[2])), hidden(at(windows[3]), -10));
	if (windows[3] < CYCLE) f.push(hidden(1, -10));
	return f;
}

function cancelAll() {
	anims.forEach((a) => a.cancel());
	anims = [];
}

function build() {
	cancelAll();
	if (prefersReducedMotion()) return; // CSS shows the still frame
	const m = measure();
	const introEnd = 1500 + letters.length * 95;

	letters.forEach((el, i) => {
		const rx = (rand(i, 1) - 0.5) * 2.4 * m.em;
		const ry = (rand(i, 2) - 0.5) * 1.6 * m.em;
		const intro = el.animate([
			{ transform: `translate3d(${rx}px, ${ry}px, -900px) rotateX(${(rand(i, 5) - 0.5) * 140}deg) rotateY(${(rand(i, 6) - 0.5) * 180}deg)`, opacity: 0 },
			{ opacity: 1, offset: 0.55 },
			{ transform: 'none', opacity: 1 },
		], { duration: 1500, delay: 150 + i * 95, easing: EASE, fill: 'backwards' });
		const cycle = el.animate(cycleFrames(i, m), { duration: CYCLE, delay: introEnd, iterations: Infinity });
		anims.push(intro, cycle);
	});

	caps.forEach((c, k) => {
		anims.push(c.animate(captionFrames(k), { duration: CYCLE, delay: introEnd, iterations: Infinity, fill: 'backwards' }));
	});

	// one glass glint per cycle, as the word settles (the sweep takes the first 15% of the cycle)
	anims.push(glint.animate([
		{ offset: 0, transform: 'translate3d(-150%, 0, 0) rotate(18deg)', opacity: 0, easing: 'ease-in-out' },
		{ offset: 0.02, opacity: 1 },
		{ offset: 0.13, opacity: 1 },
		{ offset: 0.15, transform: 'translate3d(600%, 0, 0) rotate(18deg)', opacity: 0 },
		{ offset: 1, transform: 'translate3d(600%, 0, 0) rotate(18deg)', opacity: 0 },
	], { duration: CYCLE, delay: introEnd - 600, iterations: Infinity }));

	measureCentres();
	gov.apply();
}

/* pointer lean: the inner span of each letter tilts toward the pointer */
const pointer = { x: -1, y: -1, active: false };
const lean = inners.map(() => ({ rx: 0, ry: 0, z: 0 }));
let centres = [];
/* resting letter centres, read once per build/scroll so the frame loop never reads layout */
function measureCentres() {
	const w = word.getBoundingClientRect();
	centres = letters.map((l) => ({ x: w.left + l.offsetLeft + l.offsetWidth / 2, y: w.top + l.offsetTop + l.offsetHeight / 2 }));
}
addEventListener('scroll', measureCentres, { passive: true });
if (!prefersReducedMotion()) {
	stage.addEventListener('pointermove', (e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.active = true;
	});
	stage.addEventListener('pointerleave', () => { pointer.active = false; });
	loop(stage, () => {
		inners.forEach((el, i) => {
			let tx = 0;
			let ty = 0;
			let tz = 0;
			if (pointer.active && centres[i]) {
				const dx = (pointer.x - centres[i].x) / innerWidth;
				const dy = (pointer.y - centres[i].y) / innerHeight;
				const near = Math.max(0, 1 - Math.hypot(dx, dy) * 3.2);
				ty = dx * 38;
				tx = -dy * 30;
				tz = near * 60;
			}
			const s = lean[i];
			s.rx += (tx - s.rx) * 0.08;
			s.ry += (ty - s.ry) * 0.08;
			s.z += (tz - s.z) * 0.08;
			el.style.transform = `translateZ(${s.z.toFixed(1)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
		});
	}, { name: 'type-lean' });
}

pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	gov.setUserPaused(paused);
});
replayBtn.addEventListener('click', () => {
	pauseBtn.setAttribute('aria-pressed', 'false');
	pauseBtn.textContent = 'Pause';
	gov.userPaused = false;
	build();
});

let resizeTimer = 0;
addEventListener('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(build, 250);
});

boot();
document.fonts.ready.then(build);
