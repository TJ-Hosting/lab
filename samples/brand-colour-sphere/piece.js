/*
 * Sample 32 — "The brand colour sphere".
 * A colour sphere in the spirit of Runge's Farbkugel, drawn as an inline SVG: one polygon per patch, hue slices
 * around the poles, lightness rings from white (top) to black (bottom), all worked out in OKLCH around a base
 * colour you pick. Every frame a quaternion turns the patches' corners and their outlines are redrawn (only the
 * patches facing you). Drag to turn it with inertia, a slow idle spin about its own axis, a click copies a hex.
 *
 * Written from the idea only; no source code was read or copied. The vector, quaternion and colour code is new.
 * The idea: meodai's "RYBitten SVG Color Sphere" pen on CodePen (public pens are MIT); its code was not fetched or read.
 * The OKLab conversion matrices are Björn Ottosson's (https://bottosson.github.io/posts/oklab/), published by him
 * into the public domain (also offered under the MIT licence); used here as public domain.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const $ = (s) => document.querySelector(s);
const SVG_NS = 'http://www.w3.org/2000/svg';
const orb = $('#orb');
const svg = $('#sphere');
const patchG = $('#patches');
const pickOut = $('#pick-out');
const pickIn = $('#pick-in');
const halo = $('#halo');
const readout = $('#readout');
const chip = $('#readout-chip');
const hexEl = $('#readout-hex');
const detailEl = $('#readout-detail');
const noteEl = $('#copy-note');
const nameEl = $('#base-name');
const swatchBox = $('#swatches');
const pauseBtn = $('[data-action="pause"]');
const rollBtn = $('[data-action="roll"]');
const uprightBtn = $('[data-action="upright"]');
const nearBtn = $('[data-action="near"]');

const still = () => prefersReducedMotion();
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- colour: hex <-> OKLCH, gamut fitting ---------- */

const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex) {
	const n = parseInt(hex.slice(1), 16);
	const r = toLin(((n >> 16) & 255) / 255);
	const g = toLin(((n >> 8) & 255) / 255);
	const b = toLin((n & 255) / 255);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) / DEG) + 360) % 360 };
}

function oklchToLinear(L, C, h) {
	const a = C * Math.cos(h * DEG);
	const b = C * Math.sin(h * DEG);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
}

const fits = (rgb) => rgb.every((c) => c >= -0.0004 && c <= 1.0004);

/* the largest chroma not above `C` that still fits sRGB at this lightness and hue */
function fitChroma(L, C, h) {
	if (fits(oklchToLinear(L, C, h))) return C;
	let lo = 0;
	let hi = C;
	for (let i = 0; i < 13; i++) {
		const mid = (lo + hi) / 2;
		if (fits(oklchToLinear(L, mid, h))) lo = mid; else hi = mid;
	}
	return lo;
}

function oklchToHex(L, C, h) {
	return `#${oklchToLinear(L, C, h).map((c) => Math.round(255 * toGamma(clamp(c, 0, 1))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/* ---------- vectors and quaternions ([x, y, z, w]) ---------- */

const qMul = (a, b) => [
	a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
	a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
	a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
	a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

function qNorm(a) {
	const n = Math.hypot(a[0], a[1], a[2], a[3]) || 1;
	return [a[0] / n, a[1] / n, a[2] / n, a[3] / n];
}

function qAxis(ax, ay, az, angle) {
	const len = Math.hypot(ax, ay, az);
	if (!len || !angle) return [0, 0, 0, 1];
	const s = Math.sin(angle / 2) / len;
	return [ax * s, ay * s, az * s, Math.cos(angle / 2)];
}

function qSlerp(a, b, t) {
	let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	let bb = b;
	if (d < 0) { d = -d; bb = [-b[0], -b[1], -b[2], -b[3]]; }
	if (d > 0.9995) return qNorm(a.map((v, i) => v + (bb[i] - v) * t));
	const th = Math.acos(d);
	const sa = Math.sin((1 - t) * th) / Math.sin(th);
	const sb = Math.sin(t * th) / Math.sin(th);
	return qNorm(a.map((v, i) => v * sa + bb[i] * sb));
}

const M = new Float64Array(9); // the current rotation matrix, row by row

function qToMatrix(q) {
	const [x, y, z, w] = q;
	M[0] = 1 - 2 * (y * y + z * z); M[1] = 2 * (x * y - z * w); M[2] = 2 * (x * z + y * w);
	M[3] = 2 * (x * y + z * w); M[4] = 1 - 2 * (x * x + z * z); M[5] = 2 * (y * z - x * w);
	M[6] = 2 * (x * z - y * w); M[7] = 2 * (y * z + x * w); M[8] = 1 - 2 * (x * x + y * y);
}

/* ---------- the palette's bases ---------- */

const BASES = [
	{ name: 'Royal', hex: '#055FE9' },
	{ name: 'Azure', hex: '#4D9FF3' },
	{ name: 'Cyan', hex: '#46D0FB' },
	{ name: 'Honey', hex: '#FFB547' },
	{ name: 'Leaf', hex: '#2FBF8F' },
	{ name: 'Coral', hex: '#F26B5B' },
];

/* ---------- the sphere: patches ---------- */

const CX = 260;
const CY = 260;
const R = 250;
const compact = matchMedia('(max-width: 720px)');
let N = 0; // hue slices
let RINGS = 0; // lightness rings (odd, so one ring sits on the equator)
let patches = [];
let baseIdx = 2;
let near = false;
let pick = 0;
let hover = -1;
let front = 0;

const unit = (th, ph) => [Math.cos(ph) * Math.sin(th), Math.sin(ph), Math.cos(ph) * Math.cos(th)];

function build() {
	// the cost is capped for phones: fewer slices and rings
	N = compact.matches ? 24 : 36;
	RINGS = compact.matches ? 11 : 17;
	patchG.textContent = '';
	patches = [];
	for (let j = 0; j < RINGS; j++) {
		const ph0 = Math.PI / 2 - (Math.PI * j) / RINGS;
		const ph1 = Math.PI / 2 - (Math.PI * (j + 1)) / RINGS;
		const phc = (ph0 + ph1) / 2;
		for (let i = 0; i < N; i++) {
			const th0 = (TAU * (i - 0.5)) / N;
			const th1 = (TAU * (i + 0.5)) / N;
			const geo = new Float64Array(15);
			geo.set(unit(TAU * i / N, phc), 0);
			geo.set(unit(th0, ph0), 3);
			geo.set(unit(th1, ph0), 6);
			geo.set(unit(th1, ph1), 9);
			geo.set(unit(th0, ph1), 12);
			const el = document.createElementNS(SVG_NS, 'polygon');
			el.dataset.i = String(patches.length);
			patchG.append(el);
			patches.push({ el, geo, i, j, lat: phc, on: true, hex: '#000000', L: 0, C: 0, h: 0 });
		}
	}
	pick = Math.floor(RINGS / 2) * N; // the base colour's own patch
	hover = -1;
	paint();
}

/* the colours: lightness by latitude, hue by longitude, chroma as the base's, fitted to sRGB */
function paint() {
	const base = BASES[baseIdx];
	const o = hexToOklch(base.hex);
	const target = clamp(o.C, 0.05, 0.3);
	const mid = Math.floor(RINGS / 2);
	for (const p of patches) {
		const s = Math.sin(p.lat);
		const L = s >= 0 ? o.L + (0.985 - o.L) * s : o.L + (o.L - 0.12) * s;
		const h = near ? o.h + 50 * Math.sin(TAU * p.i / N) : o.h + (360 * p.i) / N;
		const C = fitChroma(L, target * Math.cos(p.lat) ** 0.8, h);
		p.L = L;
		p.C = C;
		p.h = ((h % 360) + 360) % 360;
		p.hex = oklchToHex(L, C, h);
		if (p.j === mid && p.i === 0) { // the base colour itself, exactly
			p.L = o.L; p.C = o.C; p.h = o.h; p.hex = base.hex.toUpperCase();
		}
		p.el.setAttribute('fill', p.hex);
	}
	nameEl.textContent = base.name;
	showPick();
}

/* ---------- the readout and the copy ---------- */

let noteTimer = 0;
const hint = () => (compact.matches ? 'Tap to copy' : 'Click a patch, or this button, to copy its hex.');

function showPick() {
	const p = patches[pick];
	chip.style.setProperty('--c', p.hex);
	hexEl.textContent = p.hex;
	detailEl.textContent = `L ${Math.round(p.L * 100)}% · C ${p.C.toFixed(2)} · H ${Math.round(p.h)}°`;
	readout.setAttribute('aria-label', `Picked colour ${p.hex}. Lightness ${Math.round(p.L * 100)} percent, chroma ${p.C.toFixed(2)}, hue ${Math.round(p.h)} degrees. Press to copy it.`);
}

function say(text, ok) {
	noteEl.textContent = text === null ? hint() : text;
	noteEl.classList.toggle('is-ok', !!ok);
	clearTimeout(noteTimer);
	if (text !== null) noteTimer = setTimeout(() => say(null, false), 2600);
}

async function copyPicked() {
	const hex = patches[pick].hex;
	try {
		await navigator.clipboard.writeText(hex);
		say(`Copied ${hex}`, true);
	} catch (err) {
		say('Copy blocked', false);
	}
}

function setPick(k) {
	pick = k;
	showPick();
	draw();
}

/* ---------- state: orientation and motion ---------- */

const Q_START = qMul(qAxis(1, 0, 0, 20 * DEG), qAxis(0, 1, 0, -34 * DEG)); // a nicely turned sphere
let q = Q_START;
let omega = [0, 0, 0]; // inertia from a drag or a roll, about the screen's axes (rad/s)
let spin = 0; // the idle turn about the sphere's own axis (rad/s)
let anim = null; // an eased turn back to upright
const IDLE = 0.26;
let ctl = null;
const live = () => !!(ctl && ctl.running);

function step(dt) {
	if (anim) {
		anim.t = Math.min(1, anim.t + dt / 0.9);
		const e = 1 - (1 - anim.t) ** 3;
		q = qSlerp(anim.from, anim.to, e);
		if (anim.t >= 1) anim = null;
		return;
	}
	if (drag) return;
	const decay = Math.exp(-2.4 * dt);
	omega = omega.map((v) => v * decay);
	const sp = Math.hypot(omega[0], omega[1], omega[2]);
	if (sp > 0.002) q = qNorm(qMul(qAxis(omega[0], omega[1], omega[2], sp * dt), q));
	// the idle turn fades in as the inertia dies down
	const want = IDLE * clamp(1 - sp / 0.9, 0, 1);
	spin += (want - spin) * (1 - Math.exp(-1.6 * dt));
	q = qNorm(qMul(q, qAxis(0, 1, 0, spin * dt)));
}

/* ---------- drawing: only the patches facing you, redrawn from the quaternion ---------- */

function poly(geo) {
	let d = '';
	for (let c = 3; c < 15; c += 3) {
		const x = geo[c];
		const y = geo[c + 1];
		const z = geo[c + 2];
		const sx = CX + R * (M[0] * x + M[1] * y + M[2] * z);
		const sy = CY - R * (M[3] * x + M[4] * y + M[5] * z);
		d += `${Math.round(sx * 10) / 10},${Math.round(sy * 10) / 10} `;
	}
	return d;
}

function draw() {
	qToMatrix(q);
	let best = -2;
	for (let k = 0; k < patches.length; k++) {
		const p = patches[k];
		const g = p.geo;
		const zc = M[6] * g[0] + M[7] * g[1] + M[8] * g[2];
		const on = zc > -0.04;
		if (on !== p.on) {
			p.on = on;
			p.el.setAttribute('display', on ? 'inline' : 'none');
		}
		if (!on) continue;
		if (zc > best) { best = zc; front = k; }
		p.el.setAttribute('points', poly(g));
	}
	const pd = patches[pick].on ? poly(patches[pick].geo) : '';
	pickOut.setAttribute('points', pd);
	pickIn.setAttribute('points', pd);
	halo.setAttribute('points', hover >= 0 && hover !== pick && patches[hover].on ? poly(patches[hover].geo) : '');
}

/* ---------- pointer: drag with inertia, a click picks and copies ---------- */

let drag = null;
let omegaEst = [0, 0, 0];
let pointerAt = null;
const sphereRadiusPx = () => (svg.clientWidth * R) / 520;
const hitOf = (el) => (el && el.dataset && el.dataset.i !== undefined && svg.contains(el) ? Number(el.dataset.i) : -1);

function refresh() { if (!live()) draw(); }

svg.addEventListener('pointerdown', (ev) => {
	if (ev.pointerType === 'mouse' && ev.button !== 0) return;
	drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, t0: ev.timeStamp, tl: ev.timeStamp, moved: 0, hit: hitOf(ev.target) };
	omega = [0, 0, 0];
	omegaEst = [0, 0, 0];
	spin = 0;
	anim = null;
	svg.setPointerCapture(ev.pointerId);
	svg.classList.add('is-dragging');
});

svg.addEventListener('pointermove', (ev) => {
	if (drag && ev.pointerId === drag.id) {
		const dx = ev.clientX - drag.x;
		const dy = ev.clientY - drag.y;
		const len = Math.hypot(dx, dy);
		if (!len) return;
		drag.moved += len;
		drag.x = ev.clientX;
		drag.y = ev.clientY;
		const angle = len / sphereRadiusPx();
		// dragging right turns the sphere about the vertical axis, dragging down about the horizontal one
		q = qNorm(qMul(qAxis(dy, dx, 0, angle), q));
		const dt = Math.max(0.004, (ev.timeStamp - drag.tl) / 1000);
		drag.tl = ev.timeStamp;
		const rate = angle / dt;
		omegaEst = omegaEst.map((v, i) => v * 0.6 + [dy / len, dx / len, 0][i] * rate * 0.4);
		refresh();
		return;
	}
	if (ev.pointerType === 'touch') return;
	pointerAt = [ev.clientX, ev.clientY];
	const k = hitOf(ev.target);
	if (k !== hover) { hover = k; refresh(); }
});

function release(ev, cancelled) {
	if (!drag || ev.pointerId !== drag.id) return;
	const d = drag;
	drag = null;
	svg.classList.remove('is-dragging');
	if (svg.hasPointerCapture(ev.pointerId)) svg.releasePointerCapture(ev.pointerId);
	if (cancelled) return;
	if (d.moved < 6 && ev.timeStamp - d.t0 < 700) {
		if (d.hit >= 0) { setPick(d.hit); copyPicked(); }
		return;
	}
	if (still() || !live()) return;
	if (ev.timeStamp - d.tl < 90) {
		const sp = Math.hypot(...omegaEst);
		omega = sp > 9 ? omegaEst.map((v) => (v * 9) / sp) : omegaEst;
	}
}
svg.addEventListener('pointerup', (ev) => release(ev, false));
svg.addEventListener('pointercancel', (ev) => release(ev, true));
svg.addEventListener('pointerleave', (ev) => {
	if (ev.pointerType === 'touch' || drag) return;
	pointerAt = null;
	if (hover !== -1) { hover = -1; refresh(); }
});

/* ---------- keyboard: arrows turn it, Enter picks the patch at its centre and copies it ---------- */

const ARROWS = { ArrowLeft: [0, -1, 0], ArrowRight: [0, 1, 0], ArrowUp: [-1, 0, 0], ArrowDown: [1, 0, 0] };
svg.addEventListener('keydown', (ev) => {
	const dir = ARROWS[ev.key];
	if (dir) {
		ev.preventDefault();
		anim = null;
		if (still() || !live()) {
			q = qNorm(qMul(qAxis(dir[0], dir[1], dir[2], 0.2), q));
			draw();
		} else {
			omega = omega.map((v, i) => v + dir[i] * 1.9);
			const sp = Math.hypot(...omega);
			if (sp > 6) omega = omega.map((v) => (v * 6) / sp);
		}
	} else if (ev.key === 'Enter' || ev.key === ' ') {
		ev.preventDefault();
		setPick(front);
		copyPicked();
	}
});

/* ---------- the controls ---------- */

readout.addEventListener('click', copyPicked);

BASES.forEach((b, k) => {
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'swatch';
	btn.style.setProperty('--c', b.hex);
	btn.setAttribute('aria-label', `${b.name}, ${b.hex}`);
	btn.setAttribute('aria-pressed', String(k === baseIdx));
	btn.addEventListener('click', () => {
		baseIdx = k;
		[...swatchBox.children].forEach((s, n) => s.setAttribute('aria-pressed', String(n === k)));
		pick = Math.floor(RINGS / 2) * N;
		paint();
		say(null, false);
		draw();
	});
	swatchBox.append(btn);
});

nearBtn.addEventListener('click', () => {
	near = nearBtn.getAttribute('aria-pressed') !== 'true';
	nearBtn.setAttribute('aria-pressed', String(near));
	paint();
});

uprightBtn.addEventListener('click', () => {
	// level the poles and bring the picked patch round to the front
	const to = qMul(qAxis(1, 0, 0, 20 * DEG), qAxis(0, 1, 0, -TAU * patches[pick].i / N));
	omega = [0, 0, 0];
	spin = 0;
	if (still() || !live()) { q = to; anim = null; draw(); } else anim = { from: q, to, t: 0 };
});

rollBtn.addEventListener('click', () => {
	if (still()) return;
	if (pauseBtn.getAttribute('aria-pressed') === 'true') setPaused(false);
	const a = Math.random() * TAU;
	const speed = 5.5 + Math.random() * 2.5;
	anim = null;
	spin = 0;
	omega = [Math.cos(a) * speed, Math.sin(a) * speed, 0];
});

function setPaused(paused) {
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	if (!ctl) return;
	if (paused) ctl.stop(); else ctl.start();
}

/* ---------- start ---------- */

function start() {
	build();
	draw();
	noteEl.textContent = hint();
	if (prefersReducedMotion()) {
		// one still: nothing loops, nothing starts motion
		rollBtn.disabled = true;
		pauseBtn.disabled = true;
	} else {
		let frames = 0;
		ctl = loop(orb, (dt) => {
			step(dt);
			// a hovered patch follows the pointer, not the turning sphere
			if (pointerAt && !drag && ++frames % 6 === 0) {
				const k = hitOf(document.elementFromPoint(pointerAt[0], pointerAt[1]));
				if (k !== hover) hover = k;
			}
			draw();
		}, { name: 'brand-colour-sphere' });
		pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));
	}
	// phones get fewer patches; rebuild when the breakpoint is crossed
	compact.addEventListener('change', () => { build(); draw(); noteEl.textContent = hint(); });
}

boot();
start();
// a short phone has no room for the description over the tools: it starts folded away (the round button shows it)
if (matchMedia('(max-width: 720px) and (max-height: 699px)').matches) document.querySelector('.info-toggle')?.click();
