/*
 * Sample 54 — "Pixel planet maker".
 * A chunky pixel planet on a night sky. world.js turns a 32-bit seed into a world (a two-word name, a kind, a ring,
 * up to two moons, a starfield) and paints it into a small pixel buffer: a sphere shaded from 3D noise and one light
 * direction, snapped to a few blues through a 4 x 4 Bayer matrix. This file sizes that buffer to the free part of the
 * window (a planet disc of up to about 124 pixels, scaled up in whole steps with image-rendering: pixelated), moves the light to
 * follow the pointer with easing, runs the slow spin through loop() from js/lab.js, rolls a new world on the button
 * (a dither dissolve between the old and the new one), rolls one by itself after about 12 seconds without input, and
 * saves a 1080 x 1350 PNG poster with the planet, its name and a starfield.
 * Nothing runs off-screen, in a hidden tab, on Pause or under reduced motion. Under reduced motion one finished
 * planet is drawn without spin or drift, and Roll, Download and the light still work, at once.
 * The PNG goes out through <a download> with an object URL: that is a navigation, so the CSP's img-src does not apply.
 *
 * Written from the idea only (a procedurally made pixel planet with noise shading and a pointer-driven light);
 * no source code, palette or name list was read or copied.
 */
import { boot, loop, prefersReducedMotion, finePointer } from '../../js/lab.js';
import { makeWorld, paintWorld, lightFrom, ghostLight, describeWorld, seedText, fitRadius, bay8 } from './world.js';

const REDUCED = prefersReducedMotion();
const BAR = 34; // the window bar's height
const FIRST_SEED = 0x13579bdf;

const screenEl = document.querySelector('.piece-screen');
const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const info = document.querySelector('.sample-info');
const plate = document.querySelector('.plate');
const nameEl = document.querySelector('[data-name]');
const factsEl = document.querySelector('[data-facts]');
const seedEl = document.querySelector('[data-seed]');
const rollBtn = document.querySelector('[data-action="roll"]');
const saveBtn = document.querySelector('[data-action="save"]');
const pauseBtn = document.querySelector('[data-action="pause"]');

/* ---------- the state ---------- */

const query = new URLSearchParams(location.search).get('seed');
let world = makeWorld(query && /^[0-9a-f]{1,8}$/i.test(query) ? parseInt(query, 16) : FIRST_SEED);
world.R = 40;
let prev = null; // the world that is dissolving away
let trans = null; // {t: 0..1}
let ctl = null; // the loop's controller (none under reduced motion)
const st = { time: 0 };

/* the light: pu, pv = where the pointer is, in planet radii from its centre; lu, lv = the eased light; gm = how far the idle drift has taken over */
const g0 = ghostLight(0);
let pu = g0[0];
let pv = g0[1];
let lu = pu;
let lv = pv;
let gm = 0;
let L = lightFrom(lu, lv);
let quiet = 0; // seconds without input (counted only while the loop runs)

let drawAcc = 0;
const running = () => !!ctl && ctl.running;

/* ---------- the layout: a pixel buffer for the free part of the window ---------- */

let S = 4; // screen pixels per buffer pixel
let boxW = 100; // the free box, in buffer pixels: the planet, its ring and moons are fitted into it
let boxH = 100;
let bw = 0;
let bh = 0;
let cx = 0;
let cy = 0;
let img = null;
let px = null;
let pxA = null;
let pxB = null;
let depth = null;

function layout() {
	const W = screenEl.clientWidth;
	const H = screenEl.clientHeight - BAR;
	if (W < 60 || H < 60) return false;
	const sr = screenEl.getBoundingClientRect();
	const ir = info.getBoundingClientRect();
	const pr = plate.getBoundingClientRect();
	const top = sr.top + BAR;
	// the free box, in canvas pixels: beside the panel on a wide window, between the plate and the panel on a narrow one
	let x0;
	let x1 = W - 8;
	let y0 = 8;
	let y1 = H - 8;
	if (W >= 860 && H >= 420) {
		x0 = Math.min(W * 0.5, ir.right - sr.left + 8);
	} else {
		x0 = 8;
		y0 = Math.max(8, pr.bottom - top + 6);
		y1 = Math.min(H - 8, ir.top - top - 6);
		if (y1 - y0 < 150) { y0 = 8; y1 = H - 8; }
	}
	const avail = Math.max(120, Math.min(x1 - x0, y1 - y0));
	S = Math.max(3, Math.min(5, Math.round(avail / 170)));
	boxW = Math.max(30, Math.floor((x1 - x0) / S));
	boxH = Math.max(30, Math.floor((y1 - y0) / S));
	bw = Math.floor(W / S);
	bh = Math.floor(H / S);
	const left = Math.floor((W - bw * S) / 2);
	const topPad = Math.floor((H - bh * S) / 2);
	cx = Math.round(((x0 + x1) / 2 - left) / S);
	cy = Math.round(((y0 + y1) / 2 - topPad) / S);
	canvas.width = bw;
	canvas.height = bh;
	canvas.style.left = `${left}px`;
	canvas.style.top = `${BAR + topPad}px`;
	canvas.style.width = `${bw * S}px`;
	canvas.style.height = `${bh * S}px`;
	fit(world);
	if (prev) fit(prev);
	img = ctx.createImageData(bw, bh);
	px = new Uint32Array(img.data.buffer);
	pxA = new Uint32Array(bw * bh);
	pxB = new Uint32Array(bw * bh);
	depth = new Float32Array(bw * bh);
	return true;
}

/* the radius this world gets in the free box (the planet, its ring and moons all fit) */
function fit(w) {
	w.R = fitRadius(w, boxW, boxH);
}

/* ---------- drawing ---------- */

function draw() {
	if (!px) return;
	if (trans && prev) {
		paintWorld(pxA, depth, bw, bh, cx, cy, prev.R, prev, L, st.time, false);
		paintWorld(pxB, depth, bw, bh, cx, cy, world.R, world, L, st.time, false);
		const e = trans.t * trans.t * (3 - 2 * trans.t);
		const reach = world.R * 2.2;
		for (let j = 0; j < bh; j++) {
			for (let i = 0; i < bw; i++) {
				const k = j * bw + i;
				const rad = Math.min(1, Math.hypot(i - cx, j - cy) / reach);
				px[k] = 0.5 * bay8(i, j) + 0.5 * rad < e ? pxB[k] : pxA[k];
			}
		}
	} else {
		paintWorld(px, depth, bw, bh, cx, cy, world.R, world, L, st.time, false);
	}
	ctx.putImageData(img, 0, 0);
}

function showPlate() {
	const facts = describeWorld(world);
	nameEl.textContent = world.name;
	factsEl.textContent = facts;
	seedEl.textContent = seedText(world.seed);
	canvas.setAttribute('aria-label', `A pixel planet called ${world.name}: ${facts.toLowerCase()}. Move the pointer, or use the arrow keys, to move the light that falls on it.`);
}

function newSeed() {
	if (window.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0];
	return (Math.random() * 4294967296) >>> 0;
}

/* a new world; while the loop runs the old one dissolves into it, otherwise the swap is at once */
function setWorld(seed) {
	const next = makeWorld(seed);
	fit(next);
	if (!REDUCED && running()) {
		prev = world;
		trans = { t: 0 };
	} else {
		prev = null;
		trans = null;
	}
	world = next;
	showPlate();
	if (!running()) draw();
}

/* ---------- the light ---------- */

function aim(u, v, snap) {
	const lim = 3.2;
	pu = Math.max(-lim, Math.min(lim, u));
	pv = Math.max(-lim, Math.min(lim, v));
	quiet = 0;
	// with no loop (reduced motion, Pause) the light jumps straight to where it was pointed
	if (snap && !running()) {
		lu = pu;
		lv = pv;
		L = lightFrom(lu, lv);
		draw();
	}
}

function onPointer(ev) {
	const r = canvas.getBoundingClientRect();
	const R = world.R * S;
	aim((ev.clientX - (r.left + cx * S)) / R, (ev.clientY - (r.top + cy * S)) / R, true);
}
addEventListener('pointermove', onPointer, { passive: true });
addEventListener('pointerdown', onPointer, { passive: true });
addEventListener('keydown', () => { quiet = 0; });

canvas.addEventListener('keydown', (ev) => {
	const step = 0.45;
	let du = 0;
	let dv = 0;
	if (ev.key === 'ArrowLeft') du = -step;
	else if (ev.key === 'ArrowRight') du = step;
	else if (ev.key === 'ArrowUp') dv = -step;
	else if (ev.key === 'ArrowDown') dv = step;
	else return;
	ev.preventDefault();
	aim(lu + du, lv + dv, true);
});

/* ---------- the loop ---------- */

function tick(dt) {
	st.time += dt;
	world.ang += dt * world.spin;
	world.cang += dt * world.cspin;
	if (prev) {
		prev.ang += dt * prev.spin;
		prev.cang += dt * prev.cspin;
	}
	if (trans) {
		trans.t += dt / 0.8;
		if (trans.t >= 1) {
			trans = null;
			prev = null;
		}
	}
	// no input for a while: the light drifts by itself, and after about 12 s a new world rolls
	quiet += dt;
	if ((finePointer.matches && info.matches(':hover')) || info.querySelector(':focus-visible')) quiet = 0;
	gm += ((quiet > 3.5 ? 1 : 0) - gm) * (1 - Math.exp(-dt * 0.9));
	const [gu, gv] = ghostLight(st.time);
	const k = 1 - Math.exp(-dt * 5);
	lu += (pu + (gu - pu) * gm - lu) * k;
	lv += (pv + (gv - pv) * gm - lv) * k;
	L = lightFrom(lu, lv);
	if (quiet > 12) {
		quiet = 0;
		setWorld(newSeed());
	}
	// the spin is slow: painting at 30 frames a second is plenty for a pixel picture
	drawAcc += dt;
	if (drawAcc >= 0.03) {
		drawAcc = 0;
		draw();
	}
}

/* ---------- the poster ---------- */

async function makePoster() {
	const PW = 1080;
	const PH = 1350;
	const PS = 6; // poster pixels per buffer pixel
	const pw = PW / PS;
	const ph = PH / PS;
	try {
		await Promise.all([
			document.fonts.load('900 64px "Nunito Sans"'),
			document.fonts.load('600 32px "Nunito Sans"'),
			document.fonts.load('600 24px "JetBrains Mono"'),
		]);
	} catch (e) { /* the fallback fonts will do */ }
	const out = new Uint32Array(pw * ph);
	const pr = fitRadius(world, 176, 140);
	paintWorld(out, new Float32Array(pw * ph), pw, ph, pw / 2, 88, pr, world, L, st.time, true);
	const small = document.createElement('canvas');
	small.width = pw;
	small.height = ph;
	small.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(out.buffer), pw, ph), 0, 0);
	const c = document.createElement('canvas');
	c.width = PW;
	c.height = PH;
	const g = c.getContext('2d');
	g.imageSmoothingEnabled = false;
	g.drawImage(small, 0, 0, PW, PH);

	// a soft night shade behind the words, so no star lands on a letter
	for (const [y0, y1, a0, a1] of [[0, 130, 0.88, 0.88], [130, 200, 0.88, 0], [1010, 1100, 0, 0.86], [1100, PH, 0.86, 0.86]]) {
		const grad = g.createLinearGradient(0, y0, 0, y1);
		grad.addColorStop(0, `rgba(4, 9, 25, ${a0})`);
		grad.addColorStop(1, `rgba(4, 9, 25, ${a1})`);
		g.fillStyle = grad;
		g.fillRect(0, y0, PW, y1 - y0);
	}
	g.strokeStyle = 'rgba(150, 195, 255, 0.3)';
	g.lineWidth = 2;
	g.beginPath();
	if (g.roundRect) g.roundRect(36, 36, PW - 72, PH - 72, 28); else g.rect(36, 36, PW - 72, PH - 72);
	g.stroke();

	g.textAlign = 'center';
	g.textBaseline = 'alphabetic';
	if ('letterSpacing' in g) g.letterSpacing = '5px';
	g.fillStyle = '#aab8d2';
	g.font = '600 24px "JetBrains Mono", ui-monospace, monospace';
	g.fillText('PIXEL PLANET MAKER', PW / 2 + 2, 104);
	if ('letterSpacing' in g) g.letterSpacing = '0px';

	let size = 100;
	g.font = `900 ${size}px "Nunito Sans", system-ui, sans-serif`;
	while (g.measureText(world.name).width > PW - 160 && size > 48) {
		size -= 4;
		g.font = `900 ${size}px "Nunito Sans", system-ui, sans-serif`;
	}
	g.fillStyle = '#eef4ff';
	g.fillText(world.name, PW / 2, 1128);
	g.fillStyle = '#aab8d2';
	g.font = '600 36px "Nunito Sans", system-ui, sans-serif';
	g.fillText(describeWorld(world), PW / 2, 1190);
	if ('letterSpacing' in g) g.letterSpacing = '3px';
	g.fillStyle = '#4cc3ff';
	g.font = '600 28px "JetBrains Mono", ui-monospace, monospace';
	g.fillText(`SEED ${seedText(world.seed)}`, PW / 2 + 1, 1246);
	g.fillStyle = '#8d9dbd';
	g.font = '600 22px "JetBrains Mono", ui-monospace, monospace';
	g.fillText('TJ-HOSTING LAB', PW / 2 + 1, 1296);
	if ('letterSpacing' in g) g.letterSpacing = '0px';
	return c;
}

async function savePoster() {
	saveBtn.disabled = true;
	try {
		const c = await makePoster();
		const slug = world.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		const give = (href, revoke) => {
			const a = document.createElement('a');
			a.href = href;
			a.download = `planet-${slug}.png`;
			document.body.append(a);
			a.click();
			a.remove();
			if (revoke) setTimeout(() => URL.revokeObjectURL(href), 4000);
		};
		if (c.toBlob) {
			c.toBlob((blob) => {
				if (blob) give(URL.createObjectURL(blob), true);
				else give(c.toDataURL('image/png'), false);
			}, 'image/png');
		} else {
			give(c.toDataURL('image/png'), false);
		}
	} finally {
		saveBtn.disabled = false;
	}
}

/* ---------- start ---------- */

let resizeTimer = 0;
function relayout() {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		if (layout()) draw();
	}, 120);
}

function start() {
	boot();
	showPlate();
	if (layout()) draw();
	new ResizeObserver(relayout).observe(screenEl);
	new ResizeObserver(relayout).observe(info);
	new ResizeObserver(relayout).observe(plate);

	rollBtn.addEventListener('click', () => {
		quiet = 0;
		setWorld(newSeed());
	});
	saveBtn.addEventListener('click', savePoster);

	if (REDUCED) {
		// one finished planet: no spin, no drift, no loop
		pauseBtn.disabled = true;
		return;
	}
	ctl = loop(canvas, tick, { name: 'planet-maker' });
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) {
			ctl.stop();
			if (trans) { trans = null; prev = null; draw(); } // a dissolve in progress is finished, not left half way
		} else ctl.start();
	});
}

start();
