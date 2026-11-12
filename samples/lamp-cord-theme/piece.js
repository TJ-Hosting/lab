/*
 * Sample 29 — "Pull-Cord Theme Lamp".
 * A glass pendant lamp hangs on a Verlet rope over a small mock web page. Drag the lamp to swing it, or take the
 * cord's bead and pull it down: past a threshold the cord clicks, and the page changes theme in a circle that
 * spreads from the lamp (a same-document View Transition; where it is missing, or with reduced motion, the theme
 * just switches). The "Pull the cord" button tugs the cord by itself (the keyboard route). A breeze sways the lamp
 * when nobody touches it.
 *
 * The rope physics (rope.js, driven by lamp.js) is adapted from html5-es6-physics-rope by guerrillacontra
 * (https://github.com/guerrillacontra/html5-es6-physics-rope), MIT licence: its Vector2, RopePoint and Rope code,
 * with the copyright line and the full permission notice kept in rope.js. This file is new: the lamp's drawing,
 * the light, the handles, the theme switch and the controls. The View Transition and the sun and moon icon are
 * written from the idea only (no source was read), and so is the ripple ring.
 * Everything runs inside loop() from js/lab.js: nothing moves off-screen, in a hidden tab or with reduced motion
 * (then the lamp is drawn once, hanging still, and the button switches the theme at once).
 */
import { boot, loop, prefersReducedMotion, finePointer } from '../../js/lab.js';
import { Lamp } from './lamp.js';

const screen = document.querySelector('.piece-screen');
const site = document.getElementById('site');
const stateEl = document.getElementById('state');
const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const grabLamp = document.querySelector('.grab--lamp');
const grabBead = document.querySelector('.grab--bead');
const pullBtn = document.querySelector('[data-action="pull"]');
const blurBtn = document.querySelector('[data-action="blur"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const reduced = prefersReducedMotion();

let W = 0;
let H = 0;
let DPR = 1;
let scale = 1;
let lamp = null;
let night = false; // the page theme: night is the lamp lit
let glow = 0; // 0 → 1: how lit the lamp is (eases after the switch)
let paused = false;
let blurOn = false;
let hoverBead = false;
let drag = null;
let ctl = null;
const ripples = [];
const trail = []; // the last few poses of the shade and bead, for the motion blur

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const mixRgb = (a, b, t) => `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * t)).join(',')})`;

/* ---------- size and layout ---------- */

function resize() {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* the lamp hangs from the right of the page on a desktop; on a phone it hangs above the headline, clear of the panel */
function build() {
	const phone = W < 560;
	scale = phone ? 0.8 : H < 520 ? 0.75 : W >= 900 && H >= 640 ? 1.2 : 1;
	const ax = W * (phone ? 0.78 : W < 900 ? 0.74 : 0.72);
	const ropeLen = phone ? 78 : clamp(H * 0.3, 70, 250);
	lamp = new Lamp({ x: ax, y: 3, ropeLen, scale, onClick: () => switchTheme(lamp.bulb()) });
	grabLamp.style.width = `${Math.round(lamp.shadeR * 2 + 14)}px`;
	grabLamp.style.height = `${Math.round(lamp.shadeH + 22)}px`;
	trail.length = 0;
	if (reduced) lamp.settle(4);
	else lamp.nudge(70);
}

/* ---------- the theme ---------- */

function applyTheme(next) {
	night = next;
	site.toggleAttribute('data-night', next);
	stateEl.textContent = next ? 'Night theme' : 'Day theme';
	pullBtn.dataset.theme = next ? 'night' : 'day';
}

/* The switch: the new theme spreads from `o` (the lamp, in canvas pixels) as a circle. The circle is a clip-path on
   the View Transition's own picture of the page, a pseudo-element, so no HTML property is animated. */
function switchTheme(o) {
	const next = !night;
	if (reduced) {
		applyTheme(next);
		glow = next ? 1 : 0;
		draw();
		return;
	}
	ripples.push({ x: o.x, y: o.y, t: 0, night: next });
	const done = () => applyTheme(next);
	if (typeof document.startViewTransition !== 'function' || document.hidden) {
		done();
		return;
	}
	let vt;
	try {
		vt = document.startViewTransition(done);
	} catch {
		done();
		return;
	}
	const r = Math.hypot(Math.max(o.x, W - o.x), Math.max(o.y, H - o.y)) + 4;
	vt.ready
		.then(() => {
			document.documentElement.animate(
				{ clipPath: [`circle(0px at ${o.x}px ${o.y}px)`, `circle(${r}px at ${o.x}px ${o.y}px)`] },
				{ duration: 880, easing: 'cubic-bezier(0.3, 0.72, 0.26, 1)', pseudoElement: '::view-transition-new(site)' },
			);
		})
		.catch(() => {}); // a transition that was skipped: the page is already in its new theme
	vt.finished.catch(() => {});
}

/* ---------- drawing ---------- */

const ROPE_DAY = [22, 66, 140];
const ROPE_NIGHT = [150, 188, 238];
const CORD_DAY = [94, 128, 174];
const CORD_NIGHT = [170, 190, 224];

/* the dome of the shade, in a frame that starts at the hook and points along the lamp's axis */
function shadePath(R, Hs) {
	ctx.beginPath();
	ctx.moveTo(-8, 5);
	ctx.bezierCurveTo(-9, 17, -R * 0.52, 22, -R * 0.78, Hs * 0.66);
	ctx.bezierCurveTo(-R * 0.94, Hs * 0.84, -R, Hs * 0.94, -R, Hs);
	ctx.lineTo(R, Hs);
	ctx.bezierCurveTo(R, Hs * 0.94, R * 0.94, Hs * 0.84, R * 0.78, Hs * 0.66);
	ctx.bezierCurveTo(R * 0.52, 22, 9, 17, 8, 5);
	ctx.closePath();
}

/* a rounded rectangle with square top corners when asked (the canopy); roundRect is missing in older browsers */
function rrect(x, y, w, h, r, squareTop = false) {
	if (ctx.roundRect) ctx.roundRect(x, y, w, h, squareTop ? [0, 0, r, r] : r);
	else ctx.rect(x, y, w, h);
}

const angleOf = (a) => Math.atan2(-a.x, a.y);

function drawLight(b, a, g) {
	const s = scale;
	const R = 320 * s;
	const halo = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R);
	halo.addColorStop(0, `rgba(255, 240, 205, ${0.7 * g})`);
	halo.addColorStop(0.1, `rgba(255, 214, 140, ${0.36 * g})`);
	halo.addColorStop(0.42, `rgba(255, 181, 71, ${0.1 * g})`);
	halo.addColorStop(1, 'rgba(255, 181, 71, 0)');
	ctx.fillStyle = halo;
	ctx.fillRect(b.x - R, b.y - R, R * 2, R * 2);

	// the cone of light the shade throws along its axis
	const bt = lamp.bottom.pos;
	const len = 400 * s;
	const half = 190 * s;
	const r0 = lamp.shadeR * 0.9;
	const nx = -a.y;
	const ny = a.x;
	const cone = ctx.createLinearGradient(bt.x, bt.y, bt.x + a.x * len, bt.y + a.y * len);
	cone.addColorStop(0, `rgba(255, 228, 165, ${0.2 * g})`);
	cone.addColorStop(1, 'rgba(255, 228, 165, 0)');
	ctx.fillStyle = cone;
	ctx.beginPath();
	ctx.moveTo(bt.x + nx * r0, bt.y + ny * r0);
	ctx.lineTo(bt.x + a.x * len + nx * half, bt.y + a.y * len + ny * half);
	ctx.lineTo(bt.x + a.x * len - nx * half, bt.y + a.y * len - ny * half);
	ctx.lineTo(bt.x - nx * r0, bt.y - ny * r0);
	ctx.closePath();
	ctx.fill();
}

function drawCanopy() {
	const s = scale;
	const x = lamp.x0;
	const w = 46 * s;
	ctx.save();
	ctx.fillStyle = 'rgba(22, 66, 140, 0.14)';
	ctx.fillRect(x - w / 2 - 2, 8 * s, w + 4, 3 * s);
	const g = ctx.createLinearGradient(0, 0, 0, 10 * s);
	g.addColorStop(0, mixRgb([255, 255, 255], [168, 192, 232], glow));
	g.addColorStop(1, mixRgb([196, 220, 246], [86, 116, 168], glow));
	ctx.fillStyle = g;
	ctx.beginPath();
	rrect(x - w / 2, 0, w, 9 * s, 5 * s, true);
	ctx.fill();
	ctx.strokeStyle = mixRgb([94, 128, 174], [140, 170, 216], glow);
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
}

/* a smooth line through the chain's points: quadratic curves between midpoints */
function chainPath(points) {
	ctx.beginPath();
	ctx.moveTo(points[0].pos.x, points[0].pos.y);
	for (let i = 1; i < points.length - 1; i++) {
		const p = points[i].pos;
		const q = points[i + 1].pos;
		ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
	}
	const e = points[points.length - 1].pos;
	ctx.lineTo(e.x, e.y);
}

function drawRope() {
	const s = scale;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	chainPath(lamp.ropePoints);
	ctx.lineWidth = 3.4 * s;
	ctx.strokeStyle = mixRgb(ROPE_DAY, ROPE_NIGHT, glow);
	ctx.stroke();
	// the twist: a pale dashed line along it
	chainPath(lamp.ropePoints);
	ctx.lineWidth = 1.2 * s;
	ctx.setLineDash([2.5 * s, 4.5 * s]);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
	ctx.stroke();
	ctx.setLineDash([]);
}

function drawShade(g) {
	const s = scale;
	const R = lamp.shadeR;
	const Hs = lamp.shadeH;
	const hk = lamp.hook.pos;
	ctx.save();
	ctx.translate(hk.x, hk.y);
	ctx.rotate(angleOf(lamp.axis()));

	// the dome: pale glass by day, lit from inside by night. A blue shadow falls below it by day.
	shadePath(R, Hs);
	if (g < 0.98) {
		ctx.save();
		ctx.shadowColor = `rgba(22, 66, 140, ${0.3 * (1 - g)})`;
		ctx.shadowBlur = 16 * s;
		ctx.shadowOffsetY = 9 * s;
		const dg = ctx.createLinearGradient(0, 0, 0, Hs);
		dg.addColorStop(0, '#ffffff');
		dg.addColorStop(0.55, '#dcecfc');
		dg.addColorStop(1, '#a9cdf6');
		ctx.fillStyle = dg;
		ctx.fill();
		ctx.restore();
		const sheen = ctx.createLinearGradient(-R, 0, R * 0.4, 0);
		sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
		sheen.addColorStop(0.35, `rgba(255, 255, 255, ${0.75 * (1 - g)})`);
		sheen.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
		ctx.fillStyle = sheen;
		ctx.fill();
	}
	if (g > 0.02) {
		ctx.globalAlpha = g;
		const lg = ctx.createLinearGradient(0, 0, 0, Hs);
		lg.addColorStop(0, '#ffe6b0');
		lg.addColorStop(0.5, '#ffd18a');
		lg.addColorStop(1, '#fff3d6');
		ctx.fillStyle = lg;
		shadePath(R, Hs);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	shadePath(R, Hs);
	ctx.lineWidth = 1.3;
	ctx.strokeStyle = mixRgb([94, 128, 174], [255, 214, 150], g);
	ctx.stroke();

	// the hook cap and the rim's opening
	ctx.fillStyle = mixRgb([12, 107, 237], [140, 190, 255], g);
	ctx.beginPath();
	rrect(-7, -4, 14, 11, 3);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(0, Hs, R, R * 0.17, 0, 0, Math.PI * 2);
	ctx.fillStyle = mixRgb([205, 226, 248], [255, 246, 222], g);
	ctx.fill();
	ctx.lineWidth = 1.2;
	ctx.strokeStyle = mixRgb([94, 128, 174], [255, 214, 150], g);
	ctx.stroke();
	ctx.restore();
}

function drawCord() {
	const s = scale;
	chainPath(lamp.cordPoints);
	ctx.lineCap = 'round';
	ctx.lineWidth = 2 * s;
	ctx.strokeStyle = mixRgb(CORD_DAY, CORD_NIGHT, glow);
	ctx.stroke();
}

function drawBulb(g) {
	const s = scale;
	const c = lamp.bulb();
	const r = lamp.shadeR * 0.3;
	const grd = ctx.createRadialGradient(c.x - r * 0.3, c.y - r * 0.35, 0, c.x, c.y, r);
	grd.addColorStop(0, mixRgb([255, 255, 255], [255, 255, 245], g));
	grd.addColorStop(0.7, mixRgb([235, 245, 255], [255, 224, 160], g));
	grd.addColorStop(1, mixRgb([196, 220, 246], [255, 181, 71], g));
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.lineWidth = 1.1 * s;
	ctx.strokeStyle = mixRgb([94, 128, 174], [255, 214, 150], g);
	ctx.stroke();
}

function drawBead(g, hover) {
	const s = scale;
	const p = lamp.bead.pos;
	const r = lamp.beadR;
	// a faint ring says "take hold here"; it brightens when the pointer is over it
	ctx.beginPath();
	ctx.arc(p.x, p.y, r + 7 * s, 0, Math.PI * 2);
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = hover ? 'rgba(70, 208, 251, 0.95)' : 'rgba(70, 208, 251, 0.4)';
	ctx.stroke();
	const grd = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.4, 0, p.x, p.y, r);
	grd.addColorStop(0, '#ffffff');
	grd.addColorStop(0.55, mixRgb([123, 182, 246], [214, 232, 255], g));
	grd.addColorStop(1, mixRgb([12, 107, 237], [77, 159, 243], g));
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = mixRgb([22, 66, 140], [210, 228, 255], g);
	ctx.stroke();
}

/* the motion blur: the last few poses of the shade and the bead, faint, and only while the lamp is moving fast */
function drawTrail(g) {
	const fast = clamp((lamp.speed() - 90) / 520, 0, 1);
	if (!blurOn || fast < 0.02 || trail.length < 2) return;
	const R = lamp.shadeR;
	const Hs = lamp.shadeH;
	for (let i = 0; i < trail.length - 1; i++) {
		const t = trail[i];
		const a = fast * 0.3 * ((i + 1) / trail.length) ** 1.4;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.translate(t.hx, t.hy);
		ctx.rotate(t.ang);
		shadePath(R, Hs);
		ctx.fillStyle = mixRgb([196, 220, 246], [255, 209, 138], g);
		ctx.fill();
		ctx.restore();
		ctx.globalAlpha = a;
		ctx.fillStyle = mixRgb([77, 159, 243], [170, 205, 255], g);
		ctx.beginPath();
		ctx.arc(t.bx, t.by, lamp.beadR, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
}

/* the ripple rings at the lamp when the cord clicks */
function drawRipples() {
	for (const r of ripples) {
		const u = r.t / 0.9;
		for (let k = 0; k < 2; k++) {
			const v = clamp(u - k * 0.14, 0, 1);
			if (v <= 0) continue;
			const e = 1 - (1 - v) * (1 - v) * (1 - v);
			ctx.beginPath();
			ctx.arc(r.x, r.y, (24 + 170 * e) * scale, 0, Math.PI * 2);
			ctx.lineWidth = (3.2 - 2 * v) * scale;
			ctx.strokeStyle = r.night ? `rgba(255, 205, 130, ${0.8 * (1 - v)})` : `rgba(70, 208, 251, ${0.9 * (1 - v)})`;
			ctx.stroke();
		}
	}
}

function moveHandles() {
	const hk = lamp.hook.pos;
	const bt = lamp.bottom.pos;
	const w = parseFloat(grabLamp.style.width);
	const h = parseFloat(grabLamp.style.height);
	const cx = (hk.x + bt.x) / 2;
	const cy = (hk.y + bt.y) / 2 + 4;
	grabLamp.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px, 0) rotate(${angleOf(lamp.axis()).toFixed(3)}rad)`;
	const b = lamp.bead.pos;
	grabBead.style.transform = `translate3d(${(b.x - 24).toFixed(1)}px, ${(b.y - 24).toFixed(1)}px, 0)`;
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	const g = glow;
	const a = lamp.axis();
	if (g > 0.01) drawLight(lamp.bulb(), a, g);
	drawTrail(g);
	drawCanopy();
	drawRope();
	drawCord();
	drawShade(g);
	drawBulb(g);
	drawBead(g, hoverBead || (drag && drag.kind === 'bead'));
	drawRipples();
	moveHandles();
}

/* ---------- the pointer ---------- */

function local(ev) {
	const r = canvas.getBoundingClientRect();
	return [ev.clientX - r.left, ev.clientY - r.top];
}

function endDrag(tap) {
	if (!drag) return;
	const d = drag;
	drag = null;
	if (d.el.hasPointerCapture?.(d.id)) d.el.releasePointerCapture(d.id);
	d.el.classList.remove('is-drag');
	lamp.release();
	// a tap with no drag: on the bead it pulls the cord, on the lamp it gives it a push
	if (tap && !d.moved && performance.now() - d.t0 < 450) {
		if (d.kind === 'bead') lamp.tug();
		else lamp.kick(d.side * 260 * scale);
	}
}

function bindHandle(el, kind) {
	el.addEventListener('pointerdown', (ev) => {
		if (reduced || paused || drag || !ev.isPrimary || ev.button > 0) return;
		ev.preventDefault();
		const [px, py] = local(ev);
		if (!lamp.grab(kind, px, py)) return;
		try { el.setPointerCapture(ev.pointerId); } catch { /* a pointer that is already gone */ }
		drag = { id: ev.pointerId, el, kind, x0: px, y0: py, moved: false, t0: performance.now(), side: px < lamp.bottom.pos.x ? 1 : -1 };
		touched();
		el.classList.add('is-drag');
	});
	el.addEventListener('pointermove', (ev) => {
		if (!drag || ev.pointerId !== drag.id) return;
		const [px, py] = local(ev);
		if (Math.hypot(px - drag.x0, py - drag.y0) > 6) drag.moved = true;
		lamp.drag(px, py);
	});
	el.addEventListener('pointerup', (ev) => { if (drag && ev.pointerId === drag.id) endDrag(true); });
	el.addEventListener('pointercancel', (ev) => { if (drag && ev.pointerId === drag.id) endDrag(false); });
	el.addEventListener('lostpointercapture', (ev) => { if (drag && ev.pointerId === drag.id) endDrag(false); });
	el.addEventListener('contextmenu', (ev) => ev.preventDefault());
}

/* ---------- start ---------- */

// idle life: left alone, the lamp pulls its own cord now and then (first after 9 s, then every 20 s), so the other
// theme shows without a visitor's tug; any grab or pull starts the 20 s again. Only counts while the loop runs.
let idle = 0;
let idleNext = 9;
const touched = () => { idle = 0; idleNext = 20; };

function frame(dt) {
	if (!drag) {
		idle += dt;
		if (idle > idleNext) { touched(); lamp.tug(); }
	}
	lamp.step(dt);
	glow += ((night ? 1 : 0) - glow) * (1 - Math.exp(-6 * dt));
	if (Math.abs((night ? 1 : 0) - glow) < 0.004) glow = night ? 1 : 0;
	for (let i = ripples.length - 1; i >= 0; i--) {
		ripples[i].t += dt;
		if (ripples[i].t > 1.1) ripples.splice(i, 1);
	}
	const a = lamp.axis();
	trail.push({ hx: lamp.hook.pos.x, hy: lamp.hook.pos.y, ang: angleOf(a), bx: lamp.bead.pos.x, by: lamp.bead.pos.y });
	if (trail.length > 5) trail.shift();
	draw();
}

function start() {
	resize();
	build();
	boot();
	document.fonts?.ready.then(() => { if (reduced) draw(); });

	if (reduced) {
		// one still frame: the lamp hangs straight, the day theme; nothing runs, and nothing can start motion
		draw();
		grabLamp.hidden = true;
		grabBead.hidden = true;
		blurBtn.disabled = true;
		pauseBtn.disabled = true;
		pullBtn.addEventListener('click', () => switchTheme(lamp.bulb()));
		let timer = 0;
		addEventListener('resize', () => {
			clearTimeout(timer);
			timer = setTimeout(() => { resize(); build(); glow = night ? 1 : 0; draw(); }, 150);
		});
		return;
	}

	// motion blur costs little here (a few faint copies), but it is off by default on a phone
	blurOn = finePointer.matches && W >= 560;
	blurBtn.setAttribute('aria-pressed', String(blurOn));
	bindHandle(grabLamp, 'lamp');
	bindHandle(grabBead, 'bead');
	grabBead.addEventListener('pointerenter', () => { hoverBead = true; if (paused) draw(); });
	grabBead.addEventListener('pointerleave', () => { hoverBead = false; if (paused) draw(); });

	draw();
	ctl = loop(canvas, frame, { name: 'lamp-cord-theme' });

	pullBtn.addEventListener('click', () => { touched(); lamp.tug(); });
	blurBtn.addEventListener('click', () => {
		blurOn = blurBtn.getAttribute('aria-pressed') !== 'true';
		blurBtn.setAttribute('aria-pressed', String(blurOn));
		trail.length = 0;
	});
	pauseBtn.addEventListener('click', () => {
		paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		pullBtn.disabled = paused;
		if (paused) {
			endDrag(false);
			ctl.stop();
		} else ctl.start();
	});

	// a new size is a new lamp: its rope is made for the window it hangs in
	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (canvas.clientWidth === W && canvas.clientHeight === H) return;
			endDrag(false);
			resize();
			build();
			if (paused) draw();
		}, 150);
	});
}

start();
