/*
 * Sample 02 — "Particle field".
 * Canvas 2D. Each spark follows a smooth, slowly changing flow field; the pointer adds a pull and a swirl;
 * a tap scatters them. Sprites come from the pack's sprite sheets (img/sprites/*.webp, black-clamped),
 * drawn with additive blending. Trails fade with destination-out so the CSS backdrop shows through.
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const canvas = document.querySelector('.field');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');
const scatterBtn = document.querySelector('[data-action="scatter"]');

const SHEETS = {
	orbs: { src: '../../img/sprites/orbs.webp', cols: 4, rows: 4 },
	sparkles: { src: '../../img/sprites/sparkles.webp', cols: 4, rows: 4 },
};
const CELL = 128;

let W = 0;
let H = 0;
let DPR = 1;
let parts = [];
let time = 0;
const pointer = { x: 0, y: 0, active: false, strength: 0 };

function load(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(tint(img));
		img.onerror = reject;
		img.src = src;
	});
}

/* the atlases keep their files; at draw time they take DS v8's night photo filter (tj-hosting.ca's
   [data-night] --photo-filter), so the sparks read royal, azure, cyan and white in the night screen
   (lab-04 review 2). A browser without canvas filters draws them as they are. */
const NIGHT_FILTER = 'sepia(1) saturate(2.4) hue-rotate(172deg) brightness(1.05)';
function tint(img) {
	const c = document.createElement('canvas');
	c.width = img.naturalWidth;
	c.height = img.naturalHeight;
	const g = c.getContext('2d');
	if (!('filter' in g)) return img;
	g.filter = NIGHT_FILTER;
	g.drawImage(img, 0, 0);
	return c;
}

/* small deterministic PRNG so the still frame is the same every visit */
let seed = 7;
const rnd = () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

function makeParticle(sheets) {
	const r = rnd();
	let sheet;
	let size;
	let alpha;
	if (r < 0.66) {
		sheet = sheets.orbs; size = 3 + rnd() * 9; alpha = 0.55 + rnd() * 0.45;
	} else if (r < 0.94) {
		sheet = sheets.sparkles; size = 8 + rnd() * 16; alpha = 0.6 + rnd() * 0.4;
	} else {
		sheet = sheets.orbs; size = 26 + rnd() * 34; alpha = 0.12 + rnd() * 0.16;
	}
	const cell = Math.floor(rnd() * sheet.cols * sheet.rows);
	return {
		x: rnd() * W,
		y: rnd() * H,
		vx: 0,
		vy: 0,
		size,
		alpha,
		depth: 0.4 + (size / 60) * 0.6 + rnd() * 0.3,
		img: sheet.img,
		sx: (cell % sheet.cols) * CELL,
		sy: Math.floor(cell / sheet.cols) * CELL,
		twinkle: rnd() * Math.PI * 2,
		spin: (rnd() - 0.5) * 0.6,
	};
}

function resize(sheets) {
	DPR = Math.min(2, window.devicePixelRatio || 1);
	// the canvas fills its night screen (lab-04), not the window
	W = canvas.clientWidth || innerWidth;
	H = canvas.clientHeight || innerHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	const target = Math.round(Math.min(1400, Math.max(360, (W * H) / 1300)));
	seed = 7;
	parts = Array.from({ length: target }, () => makeParticle(sheets));
}

/* flow direction: a sum of slow sines, smooth everywhere and cheap */
function flowAngle(x, y, t) {
	const a = Math.sin(x * 0.0023 + t * 0.11) * Math.cos(y * 0.0019 - t * 0.09);
	const b = Math.sin((x + y) * 0.0011 + t * 0.05) * 0.7;
	const c = Math.cos((x - y * 0.6) * 0.0031 - t * 0.07) * 0.4;
	return (a + b + c) * Math.PI;
}

function step(dt) {
	time += dt;
	const R = Math.min(260, Math.max(150, Math.min(W, H) * 0.3));
	pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.06;
	for (const p of parts) {
		const ang = flowAngle(p.x, p.y, time);
		const speed = 22 * p.depth;
		let ax = (Math.cos(ang) * speed - p.vx) * 1.6;
		let ay = (Math.sin(ang) * speed - p.vy) * 1.6;
		if (pointer.strength > 0.01) {
			const dx = pointer.x - p.x;
			const dy = pointer.y - p.y;
			const d = Math.hypot(dx, dy) + 0.001;
			if (d < R * 2.2) {
				const fall = Math.max(0, 1 - d / (R * 2.2));
				const pull = 900 * fall * fall * pointer.strength;
				const swirl = 1300 * fall * pointer.strength;
				const ring = d < R * 0.35 ? -1.4 : 1; // keep a little hollow at the centre
				ax += (dx / d) * pull * ring - (dy / d) * swirl;
				ay += (dy / d) * pull * ring + (dx / d) * swirl;
			}
		}
		p.vx += ax * dt;
		p.vy += ay * dt;
		p.vx *= 0.985;
		p.vy *= 0.985;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		const m = p.size;
		if (p.x < -m) p.x += W + 2 * m; else if (p.x > W + m) p.x -= W + 2 * m;
		if (p.y < -m) p.y += H + 2 * m; else if (p.y > H + m) p.y -= H + 2 * m;
		p.twinkle += dt * (1.5 + p.spin * 3);
	}
}

function draw(fade) {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
	ctx.fillRect(0, 0, W, H);
	ctx.globalCompositeOperation = 'lighter';
	for (const p of parts) {
		const tw = 0.75 + Math.sin(p.twinkle) * 0.25;
		ctx.globalAlpha = p.alpha * tw;
		const s = p.size * (0.9 + tw * 0.2);
		ctx.drawImage(p.img, p.sx, p.sy, CELL, CELL, p.x - s / 2, p.y - s / 2, s, s);
	}
	if (pointer.strength > 0.02) {
		const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 140);
		g.addColorStop(0, `rgba(120, 200, 255, ${0.16 * pointer.strength})`);
		g.addColorStop(1, 'rgba(120, 200, 255, 0)');
		ctx.globalAlpha = 1;
		ctx.fillStyle = g;
		ctx.fillRect(pointer.x - 140, pointer.y - 140, 280, 280);
	}
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
}

function scatter(x, y, power = 1) {
	for (const p of parts) {
		const dx = p.x - x;
		const dy = p.y - y;
		const d = Math.hypot(dx, dy) + 0.001;
		const k = Math.max(0, 1 - d / 420) * 520 * power;
		p.vx += (dx / d) * k;
		p.vy += (dy / d) * k;
	}
}

function stillFrame() {
	for (let i = 0; i < 240; i++) step(1 / 30);
	ctx.clearRect(0, 0, W, H);
	draw(1);
}

async function start() {
	const [orbs, sparkles] = await Promise.all([load(SHEETS.orbs.src), load(SHEETS.sparkles.src)]);
	const sheets = { orbs: { ...SHEETS.orbs, img: orbs }, sparkles: { ...SHEETS.sparkles, img: sparkles } };
	resize(sheets);

	if (prefersReducedMotion()) {
		stillFrame();
		pauseBtn.disabled = true;
		scatterBtn.disabled = true;
		addEventListener('resize', () => { resize(sheets); stillFrame(); });
		return;
	}

	const ctl = loop(canvas, (dt) => {
		step(dt);
		draw(0.16);
	}, { name: 'particle-field' });

	let resizeTimer = 0;
	addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => resize(sheets), 150);
	});

	// pointer positions in the canvas's own space: it sits inside a framed screen now (lab-04)
	const move = (e) => {
		const r = canvas.getBoundingClientRect();
		pointer.x = e.clientX - r.left;
		pointer.y = e.clientY - r.top;
		pointer.active = true;
	};
	canvas.addEventListener('pointermove', move);
	canvas.addEventListener('pointerdown', (e) => {
		move(e);
		scatter(pointer.x, pointer.y, 0.8);
	});
	canvas.addEventListener('pointerleave', () => { pointer.active = false; });
	canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') pointer.active = false; });
	canvas.addEventListener('pointercancel', () => { pointer.active = false; });

	scatterBtn.addEventListener('click', () => scatter(W / 2, H / 2, 1.4));
	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start().catch((err) => console.error(err));
