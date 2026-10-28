/*
 * Sample 31 — "Throwable Skill Chips".
 * Glass service tags (real page elements, one <button> each) drop into a glass tray, pile up on a frosted floor and can be dragged
 * and thrown with a mouse, a pen or a finger. Matter.js (window.Matter, loaded by the page) works out the bodies; this file steps
 * the engine itself from the Lab's loop(), so it stops off-screen, in a hidden tab and on Pause, and it lets the engine sleep
 * (and stops drawing) when the heap rests. The chips are moved with `transform` only.
 * Keyboard: a focused chip is nudged with the arrow keys and thrown up with Space or Enter.
 * Phones: "Enable tilt" (only where a sensor is likely, asked for by a tap) makes gravity follow the tilt, clamped and smoothed.
 * Reduced motion: no loop at all. The chips are already settled in a heap (simulated off-screen before the first paint);
 * a chip can still be dragged (it moves with the pointer, no throw) and settles at once when let go; Drop again re-heaps them.
 *
 * Written from the idea only; no source code was read or copied. The idea: pills that drop into a section and are dragged with
 * the cursor inside static walls and a floor (a dev.to article by createxp). Matter.js 0.20.0 is MIT, Copyright (c) Liam Brummitt
 * and contributors (vendor/matter-js@0.20.0/LICENSE).
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const Matter = window.Matter;
const reduced = prefersReducedMotion();

const stage = document.querySelector('.stage');
const info = document.querySelector('.sample-info');
const tray = document.getElementById('tray');
const floorEl = tray.querySelector('.tray__floor');
const noteEl = document.getElementById('tray-note');
const dropBtn = document.querySelector('[data-action="drop"]');
const pauseBtn = document.querySelector('[data-action="pause"]');
const tiltBtn = document.querySelector('[data-action="tilt"]');

boot();

/* the panel's height decides how tall the tray may be when it stands above it (phones, tablets) */
if (info && stage) {
	const dock = () => stage.style.setProperty('--dock', `${Math.ceil(info.offsetHeight + 18 + 14)}px`);
	new ResizeObserver(dock).observe(info);
	dock();
}

if (Matter) start(); else {
	// the page still works as a plain heap of tags; only the physics is missing
	pauseBtn.disabled = true;
	dropBtn.disabled = true;
	tray.classList.add('is-static');
}

function start() {
	const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter;

	/* ---------- constants ---------- */
	const STEP = 1000 / 60; // a fixed physics step, in ms
	const GRAVITY = 1.6; // Matter's gravity.y; with scale 0.001 a chip falls a tray's height in about a second
	const PAD = 8; // the tray's inner wall, in px
	const WALL = 600; // wall thickness: nothing tunnels through
	const MAX_SPEED = 30; // px per step
	const DROP_GAP = 0.1; // seconds between chips on the way in
	const HOP_AFTER = 6; // seconds of quiet before an idle hop
	const RIGHTING = 0.0011; // a faint pull toward text-upright, in rad per step squared at 90 degrees: tags settle mostly flat, not on their ends
	const SPAWN_FRACS = [0.18, 0.66, 0.38, 0.9, 0.1, 0.52, 0.78, 0.28, 0.6, 0.04, 0.44, 0.84, 0.22, 0.7];

	/* ---------- state ---------- */
	const chips = [...tray.querySelectorAll('.chip')].map((el) => ({
		el, w: 0, h: 0, body: null, added: false, held: false, lx: NaN, ly: NaN, la: NaN, lheld: false,
	}));
	const byEl = new Map(chips.map((c) => [c.el, c]));
	let shown = []; // the chips that fit this tray
	let order = []; // the order they drop in
	let engine = null;
	let W = 0;
	let H = 0;
	let floorTop = 0;
	let ceiling = 260;
	let spawned = 0;
	let dropT = 0;
	let clearT = 0; // seconds left of the fade-out before a new drop
	let idleT = 0;
	let hopT = 0;
	let acc = 0;
	let zTop = 1;
	let paused = false;
	const drags = new Map(); // pointerId -> {c, con, dx, dy, moved, t0}
	const tilt = { on: false, seen: false, tx: 0, ty: 1, x: 0, y: 1, wx: 0, wy: 1 };

	const mulberry32 = (a) => () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
	const say = (text) => { noteEl.textContent = text; };
	const defaultNote = () => (matchMedia('(pointer: coarse)').matches ? 'Drag a chip to throw it' : 'Drag to throw · arrows + Space');

	/* ---------- the world ---------- */

	function makeBody(c) {
		const body = Bodies.rectangle(0, 0, c.w, c.h, {
			chamfer: { radius: Math.min(c.h * 0.3, c.w * 0.2), quality: 3 },
			restitution: 0.22,
			friction: 0.32,
			frictionStatic: 0.6,
			frictionAir: 0.014,
			density: 0.0018,
			slop: 0.04,
			sleepThreshold: 45,
		});
		// a stiffer spin, so a falling tag lands mostly flat instead of tumbling onto its end
		Body.setInertia(body, body.inertia * 2.2);
		return body;
	}

	function applyGravity() {
		if (!engine) return;
		engine.gravity.scale = 0.001;
		engine.gravity.x = tilt.on ? tilt.x * GRAVITY : 0;
		engine.gravity.y = tilt.on ? tilt.y * GRAVITY : GRAVITY;
	}

	/* measure the chips, choose how many fit, build the walls and the bodies. Called once the fonts are ready and on every resize. */
	function layout(first) {
		W = tray.clientWidth;
		H = tray.clientHeight;
		if (W < 60 || H < 60) return;
		releaseAll();
		tray.classList.remove('is-clearing');
		tray.classList.add('is-physics');
		chips.forEach((c) => {
			c.el.hidden = false;
			c.w = c.el.offsetWidth;
			c.h = c.el.offsetHeight;
		});
		floorTop = H - PAD - floorEl.offsetHeight;
		// as many chips as fill about half the room, never fewer than six
		const room = (W - 2 * PAD) * (floorTop - PAD);
		let used = 0;
		shown = [];
		chips.forEach((c) => {
			const a = c.w * c.h;
			const fits = shown.length < 6 || used + a <= room * 0.5;
			c.el.hidden = !fits;
			if (fits) { shown.push(c); used += a; }
			c.added = false;
			c.lx = NaN;
			c.held = false;
		});
		const tallest = shown.reduce((m, c) => Math.max(m, c.h), 0);
		ceiling = Math.ceil(tallest * 4.6 + 40);

		engine = Engine.create({ enableSleeping: true, positionIterations: 8, velocityIterations: 5 });
		applyGravity();
		const top = -ceiling - WALL;
		const bottom = floorTop + WALL;
		const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.5, restitution: 0.2 });
		Composite.add(engine.world, [
			wall(W / 2, floorTop + WALL / 2, W * 3, WALL), // the floor
			wall(PAD - WALL / 2, (top + bottom) / 2, WALL, bottom - top), // the left wall
			wall(W - PAD + WALL / 2, (top + bottom) / 2, WALL, bottom - top), // the right wall
			wall(W / 2, -ceiling - WALL / 2, W * 3, WALL), // a ceiling, well above the tray, so a hard throw comes back
		]);
		shown.forEach((c) => { c.body = makeBody(c); });
		spawned = 0;
		dropT = 0;
		acc = 0;
		idleT = 0;
		hopT = 0;

		if (first && !reduced) startDrop();
		else heapNow(first ? 7 : (Math.random() * 1e9) | 0);
	}

	/* where a chip starts: along the top, out of sight, in one of three bands so neighbours never overlap */
	function spawnPose(c, k, rnd) {
		const free = W - 2 * PAD - c.w;
		const f = clamp(SPAWN_FRACS[k % SPAWN_FRACS.length] + (rnd() - 0.5) * 0.08, 0, 1);
		return {
			x: PAD + c.w / 2 + f * free,
			y: -c.h * (1.1 + (k % 3) * 1.2),
			a: (rnd() - 0.5) * 0.9,
		};
	}

	function putBack(c, pose, speed) {
		Body.setPosition(c.body, { x: pose.x, y: pose.y });
		Body.setAngle(c.body, pose.a);
		Body.setVelocity(c.body, { x: 0, y: speed });
		Body.setAngularVelocity(c.body, 0);
		Sleeping.set(c.body, false);
	}

	function takeOut() {
		chips.forEach((c) => {
			if (c.added) Composite.remove(engine.world, c.body);
			c.added = false;
		});
	}

	function shuffled(list, rnd) {
		const a = list.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(rnd() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	/* the live drop: chips are put out of sight above the tray and released one by one by frame() */
	function startDrop() {
		releaseAll();
		takeOut();
		tray.classList.remove('is-clearing');
		const rnd = Math.random;
		order = shuffled(shown, rnd);
		order.forEach((c, k) => {
			c.pose = spawnPose(c, k, rnd);
			c.lx = NaN;
			c.el.style.transform = `translate3d(${(c.pose.x - c.w / 2).toFixed(1)}px, ${-(ceiling + 120)}px, 0)`;
		});
		spawned = 0;
		dropT = 0;
		idleT = 0;
		hopT = 0;
	}

	function spawnOne(c) {
		putBack(c, c.pose, 3);
		Body.setAngularVelocity(c.body, (Math.random() - 0.5) * 0.06);
		Composite.add(engine.world, c.body);
		c.added = true;
	}

	/* one fixed physics step, with the faint righting torque on every free chip */
	function step() {
		for (const c of shown) {
			const b = c.body;
			if (!c.added || c.held || b.isSleeping) continue;
			const a = Math.atan2(Math.sin(b.angle), Math.cos(b.angle));
			b.torque -= (RIGHTING * b.inertia * Math.sin(a)) / (STEP * STEP);
		}
		Engine.update(engine, STEP);
	}

	/* the settled heap, simulated at once (reduced motion, resize, and the still frame): chips fall one after another, then the engine runs until all are asleep */
	function heapNow(seed) {
		releaseAll();
		takeOut();
		const rnd = mulberry32(seed);
		order = shuffled(shown, rnd);
		order.forEach((c, k) => {
			putBack(c, spawnPose(c, k, rnd), 3);
			Composite.add(engine.world, c.body);
			c.added = true;
			for (let s = 0; s < 26; s++) step();
		});
		settle(520);
		spawned = order.length;
		drawAll(true);
	}

	/* run the engine until every chip sleeps (or a step limit), with no frames in between */
	function settle(limit) {
		for (let s = 0; s < limit; s++) {
			step();
			if (shown.every((c) => !c.added || c.body.isSleeping) && s > 20) break;
		}
		clampSpeeds();
	}

	function clampSpeeds() {
		for (const c of shown) {
			if (!c.added) continue;
			if (Body.getSpeed(c.body) > MAX_SPEED) Body.setSpeed(c.body, MAX_SPEED);
			if (Math.abs(c.body.angularVelocity) > 0.28) Body.setAngularVelocity(c.body, Math.sign(c.body.angularVelocity) * 0.28);
		}
	}

	/* ---------- drawing: transform only, and only what moved ---------- */

	function drawOne(c, force) {
		const p = c.body.position;
		const a = c.body.angle;
		if (!force && c.held === c.lheld && Math.abs(p.x - c.lx) < 0.05 && Math.abs(p.y - c.ly) < 0.05 && Math.abs(a - c.la) < 0.0005) return;
		c.lx = p.x;
		c.ly = p.y;
		c.la = a;
		c.lheld = c.held;
		c.el.style.transform = `translate3d(${(p.x - c.w / 2).toFixed(2)}px, ${(p.y - c.h / 2).toFixed(2)}px, 0) rotate(${a.toFixed(4)}rad)${c.held ? ' scale(1.06)' : ''}`;
	}
	function drawAll(force) {
		for (const c of shown) if (c.added) drawOne(c, force);
	}

	const isAwake = () => drags.size > 0 || spawned < order.length || shown.some((c) => c.added && !c.body.isSleeping);
	const wakeAll = () => shown.forEach((c) => { if (c.added) Sleeping.set(c.body, false); });
	const poke = () => { idleT = 0; hopT = 0; };

	/* ---------- the frame (called by loop(): only while on screen, visible and not paused) ---------- */

	function frame(dt) {
		if (!engine) return;
		if (clearT > 0) {
			clearT -= dt;
			if (clearT <= 0) startDrop();
			return;
		}
		updateTilt(dt);
		if (spawned < order.length) {
			dropT += dt;
			while (spawned < order.length && dropT >= spawned * DROP_GAP) spawnOne(order[spawned++]);
		} else {
			idleHop(dt);
		}
		if (!isAwake()) { acc = 0; return; } // everything rests: no physics, no drawing
		for (const d of drags.values()) Sleeping.set(d.c.body, false);
		acc += dt * 1000;
		let n = 0;
		while (acc >= STEP && n < 3) {
			step();
			acc -= STEP;
			n++;
		}
		if (n === 3) acc = 0;
		clampSpeeds();
		drawAll(false);
	}

	/* idle life: after a quiet spell one chip near the top of the heap hops, every few seconds */
	function idleHop(dt) {
		idleT += dt;
		if (idleT < HOP_AFTER) return;
		hopT -= dt;
		if (hopT > 0) return;
		hopT = 3.4 + Math.random() * 2;
		const pool = shown.filter((c) => c.added && !c.held).sort((a, b) => a.body.position.y - b.body.position.y).slice(0, 4);
		if (!pool.length) return;
		const c = pool[Math.floor(Math.random() * pool.length)];
		Sleeping.set(c.body, false);
		Body.setVelocity(c.body, { x: (Math.random() - 0.5) * 3.5, y: -(7 + Math.random() * 2.5) });
		Body.setAngularVelocity(c.body, (Math.random() - 0.5) * 0.14);
	}

	/* ---------- pointer: drag with a spring, release to throw ---------- */

	const chipsEl = tray.querySelector('.chips');
	const toWorld = (e) => {
		const r = tray.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};

	function releaseAll() {
		for (const [id, d] of drags) {
			if (d.con && engine) Composite.remove(engine.world, d.con);
			d.c.held = false;
			d.c.el.classList.remove('is-held');
			drags.delete(id);
		}
	}

	function endDrag(e) {
		const d = drags.get(e.pointerId);
		if (!d) return;
		drags.delete(e.pointerId);
		const c = d.c;
		c.held = false;
		c.el.classList.remove('is-held');
		if (c.el.hasPointerCapture?.(e.pointerId)) c.el.releasePointerCapture(e.pointerId);
		if (reduced) {
			// no throw: let go and the chip falls to rest at once
			Sleeping.set(c.body, false);
			settle(520);
			drawAll(true);
			return;
		}
		Composite.remove(engine.world, d.con);
		Sleeping.set(c.body, false);
		// a tap (barely moved, quick) makes the chip hop
		if (e.type === 'pointerup' && d.moved < 8 && performance.now() - d.t0 < 320) {
			Body.setVelocity(c.body, { x: (Math.random() - 0.5) * 3, y: -8 });
			Body.setAngularVelocity(c.body, (Math.random() - 0.5) * 0.12);
		}
		poke();
	}

	chipsEl.addEventListener('pointerdown', (e) => {
		if (!engine || paused || clearT > 0 || (e.pointerType === 'mouse' && e.button !== 0)) return;
		const el = e.target.closest('.chip');
		const c = el && byEl.get(el);
		if (!c || !c.added || c.held) return;
		el.setPointerCapture(e.pointerId);
		const p = toWorld(e);
		const pos = c.body.position;
		const d = { c, con: null, dx: p.x - pos.x, dy: p.y - pos.y, moved: 0, t0: performance.now(), px: e.clientX, py: e.clientY };
		c.held = true;
		el.classList.add('is-held');
		el.style.zIndex = String(++zTop);
		Sleeping.set(c.body, false);
		if (!reduced) {
			d.con = Constraint.create({
				pointA: { x: p.x, y: p.y },
				bodyB: c.body,
				pointB: { x: d.dx, y: d.dy },
				length: 0,
				stiffness: 0.16,
				damping: 0.12,
			});
			Composite.add(engine.world, d.con);
		}
		drags.set(e.pointerId, d);
		poke();
		drawOne(c, true);
	});

	chipsEl.addEventListener('pointermove', (e) => {
		const d = drags.get(e.pointerId);
		if (!d) return;
		const p = toWorld(e);
		d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.px, e.clientY - d.py));
		if (reduced) {
			// the chip follows the pointer directly; one redraw per move event, no loop
			const c = d.c;
			Body.setPosition(c.body, {
				x: clamp(p.x - d.dx, PAD + c.w / 2, W - PAD - c.w / 2),
				y: clamp(p.y - d.dy, PAD + c.h / 2, floorTop - c.h / 2),
			});
			Body.setVelocity(c.body, { x: 0, y: 0 });
			drawOne(c, true);
			return;
		}
		d.con.pointA.x = clamp(p.x, PAD, W - PAD);
		d.con.pointA.y = clamp(p.y, PAD, floorTop);
		poke();
	});
	chipsEl.addEventListener('pointerup', endDrag);
	chipsEl.addEventListener('pointercancel', endDrag);
	chipsEl.addEventListener('lostpointercapture', endDrag);
	chipsEl.addEventListener('contextmenu', (e) => e.preventDefault());

	/* ---------- keyboard: arrows nudge the focused chip, Space or Enter throws it up ---------- */

	const KEYS = {
		ArrowLeft: { x: -7, y: 0, dx: -40, dy: 0 },
		ArrowRight: { x: 7, y: 0, dx: 40, dy: 0 },
		ArrowUp: { x: 0, y: -10, dx: 0, dy: -70 },
		ArrowDown: { x: 0, y: 4, dx: 0, dy: 0 },
		' ': { x: 0, y: -17, dx: 0, dy: -150 },
		Enter: { x: 0, y: -17, dx: 0, dy: -150 },
	};
	chipsEl.addEventListener('keydown', (e) => {
		const k = KEYS[e.key];
		const el = e.target.closest?.('.chip');
		const c = el && byEl.get(el);
		if (!k || !c || !c.added || paused || clearT > 0 || e.altKey || e.ctrlKey || e.metaKey) return;
		e.preventDefault();
		poke();
		const b = c.body;
		Sleeping.set(b, false);
		if (reduced) {
			// no flight: move the chip, then let it fall to rest at once
			Body.setPosition(b, {
				x: clamp(b.position.x + k.dx, PAD + c.w / 2, W - PAD - c.w / 2),
				y: clamp(b.position.y + k.dy, PAD + c.h / 2, floorTop - c.h / 2),
			});
			settle(520);
			drawAll(true);
			return;
		}
		const spin = e.key === ' ' || e.key === 'Enter' ? (Math.random() - 0.5) * 0.2 : k.x * 0.004;
		Body.setVelocity(b, { x: b.velocity.x + k.x, y: b.velocity.y + k.y });
		Body.setAngularVelocity(b, b.angularVelocity + spin);
	});
	chipsEl.addEventListener('keyup', (e) => { if (KEYS[e.key]) e.preventDefault(); });

	/* ---------- phone tilt ---------- */

	const canTilt = !reduced && 'DeviceOrientationEvent' in window && (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);

	/* the gravity vector from the sensor's beta and gamma: screen-right and screen-down components, turned for the screen's rotation */
	function onTilt(e) {
		if (e.beta == null || e.gamma == null) return;
		tilt.seen = true;
		const b = (e.beta * Math.PI) / 180;
		const g = (e.gamma * Math.PI) / 180;
		const sx = Math.sin(g) * Math.cos(b);
		const sy = Math.sin(b);
		const raw = screen.orientation?.angle ?? window.orientation ?? 0;
		const angle = ((raw % 360) + 360) % 360;
		let gx = sx;
		let gy = sy;
		if (angle === 90) { gx = sy; gy = -sx; }
		else if (angle === 270) { gx = -sy; gy = sx; }
		else if (angle === 180) { gx = -sx; gy = -sy; }
		tilt.tx = clamp(gx * 3, -1.5, 1.5);
		tilt.ty = clamp(0.3 + gy * 0.7, -0.6, 1.3);
		idleT = 0;
	}

	function updateTilt(dt) {
		if (!tilt.on) return;
		const k = 1 - Math.exp(-dt * 7);
		tilt.x += (tilt.tx - tilt.x) * k;
		tilt.y += (tilt.ty - tilt.y) * k;
		applyGravity();
		// sleeping chips ignore gravity: wake them when the direction has moved enough
		if (Math.hypot(tilt.x - tilt.wx, tilt.y - tilt.wy) > 0.06) {
			tilt.wx = tilt.x;
			tilt.wy = tilt.y;
			wakeAll();
		}
	}

	function setTilt(on) {
		tilt.on = on;
		tilt.x = tilt.wx = 0;
		tilt.y = tilt.wy = 1;
		tilt.tx = 0;
		tilt.ty = 1;
		tiltBtn.setAttribute('aria-pressed', String(on));
		tiltBtn.textContent = on ? 'Tilt on' : 'Enable tilt';
		if (!on) window.removeEventListener('deviceorientation', onTilt);
		applyGravity();
		wakeAll();
		say(on ? 'Tilt is on · tip your phone' : defaultNote());
	}

	async function toggleTilt() {
		if (tilt.on) { setTilt(false); return; }
		const D = window.DeviceOrientationEvent;
		if (typeof D.requestPermission === 'function') {
			// iOS: the permission prompt may only come from a tap, never on load
			try {
				if ((await D.requestPermission()) !== 'granted') { say('Tilt was not allowed'); return; }
			} catch (err) { say('Tilt is not available'); return; }
		}
		tilt.seen = false;
		window.addEventListener('deviceorientation', onTilt);
		setTilt(true);
		// a laptop fires one empty reading: no real sensor, so switch the button back off
		setTimeout(() => {
			if (tilt.on && !tilt.seen) { setTilt(false); say('No tilt sensor found'); }
		}, 1800);
	}

	if (canTilt) {
		tiltBtn.hidden = false;
		tiltBtn.addEventListener('click', toggleTilt);
	}

	/* ---------- buttons, the loop and resize ---------- */

	const setPaused = (v) => {
		paused = v;
		pauseBtn.setAttribute('aria-pressed', String(v));
		pauseBtn.textContent = v ? 'Play' : 'Pause';
		tray.classList.toggle('is-paused', v);
		if (v) { releaseAll(); ctl?.stop(); } else ctl?.start();
	};

	let ctl = null;
	if (reduced) {
		pauseBtn.disabled = true;
		dropBtn.addEventListener('click', () => { if (engine) heapNow((Math.random() * 1e9) | 0); });
	} else {
		ctl = loop(tray, (dt) => frame(dt), { name: 'skill-chips' });
		pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));
		dropBtn.addEventListener('click', () => {
			if (!engine) return;
			if (paused) setPaused(false);
			releaseAll();
			// the chips fade out, then fall in again from the top
			tray.classList.add('is-clearing');
			clearT = 0.24;
		});
	}
	say(defaultNote());
	noteEl.setAttribute('aria-live', 'polite'); // only changes made after this are announced

	/* first layout once the fonts are in (the chips' sizes depend on them), then on every size change */
	let laidOut = false;
	let timer = 0;
	const ro = new ResizeObserver(() => {
		if (!laidOut) { laidOut = true; layout(true); return; }
		clearTimeout(timer);
		timer = setTimeout(() => layout(false), 140);
	});
	const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
	Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => ro.observe(tray));
	document.fonts?.addEventListener?.('loadingdone', () => { if (laidOut) layout(false); });
}
