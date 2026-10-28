/*
 * lamp.js: the pendant lamp as one Verlet chain, for sample 29, "Pull-Cord Theme Lamp". No DOM in here.
 *
 * The chain runs ceiling -> rope -> hook -> (the shade, a stiff link) -> bottom of the shade -> pull-cord -> bead.
 * The rope step itself is rope.js, adapted from html5-es6-physics-rope by guerrillacontra (MIT licence;
 * the notice is in rope.js). Everything here is new: the lamp's weights, the cord that slides out of the
 * shade while it is pulled and winds back when let go, holding the lamp or the bead by hand with the
 * speed it was thrown at, the click when the cord is pulled far enough, and the idle breeze.
 */
import { Rope } from './rope.js';

export const STEP = 1 / 120; // a fixed physics step, in seconds
const GRAVITY = { x: 0, y: 2400 }; // px per second squared, in the units of the canvas

const smooth = (rate, dt) => 1 - Math.exp(-rate * dt);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const easeOut = (u) => 1 - (1 - u) * (1 - u) * (1 - u);

export class Lamp {
	/*
	 * x, y: where the cable leaves the ceiling; ropeLen: the cable; scale: 1 on a desktop, less on a phone.
	 * onClick(): called once each time the cord is pulled past its threshold.
	 */
	constructor({ x, y, ropeLen, scale = 1, onClick = () => {} }) {
		this.s = scale;
		this.x0 = x;
		this.y0 = y;
		this.ropeLen = ropeLen;
		this.shadeH = 56 * scale; // the shade, hook to rim
		this.shadeR = 41 * scale; // half the width of the rim
		this.cordBase = 46 * scale; // the cord's length at rest
		this.cordMax = 84 * scale; // how much more it slides out
		this.threshold = 54 * scale; // the click
		this.beadR = 7.5 * scale;
		this.onClick = onClick;
		this.time = 0;
		this.acc = 0;
		this.windOn = true;
		this.held = null; // { point, ox, oy, tx, ty, kind }
		this.script = null; // the scripted tug: { t }
		this.armed = true;
		this.cordTotal = this.cordBase;
		this.build();
	}

	build() {
		const N = this.s < 0.9 ? 7 : 9;
		const M = 4;
		const rope = Array.from({ length: N }, (_, i) => ({ len: this.ropeLen / N, invMass: 1, damping: 0.9992, tag: i === N - 1 ? 'hook' : 'rope', wind: 0.35 }));
		const shade = [{ len: this.shadeH, invMass: 0.22, damping: 0.9995, tag: 'bottom', wind: 1 }];
		const cord = Array.from({ length: M }, (_, i) => ({ len: this.cordBase / M, invMass: i === M - 1 ? 0.55 : 1, damping: 0.994, tag: i === M - 1 ? 'bead' : 'cord', wind: 1 }));
		this.rope = Rope.hanging({ x: this.x0, y: this.y0 }, [...rope, ...shade, ...cord], 22);
		this.hook = this.rope.byTag('hook');
		this.bottom = this.rope.byTag('bottom');
		this.bead = this.rope.byTag('bead');
		this.cordPoints = this.rope.points.slice(this.rope.points.indexOf(this.bottom));
		this.ropePoints = this.rope.points.slice(0, this.rope.points.indexOf(this.hook) + 1);
		this.cordTotal = this.cordBase;
		this.held = null;
		this.script = null;
		this.armed = true;
	}

	/* a gentle start: the lamp hangs a little off the vertical, so it is already swaying */
	nudge(vx = 60) {
		for (const p of this.rope.points) {
			if (p.isFixed) continue;
			const k = (p.pos.y - this.y0) / (this.ropeLen + this.shadeH);
			p.oldPos.x = p.pos.x - (vx * STEP * clamp(k, 0, 1));
		}
	}

	/* hang still: run the physics with no breeze until it settles (the reduced-motion frame) */
	settle(seconds = 3) {
		const wind = this.windOn;
		this.windOn = false;
		for (let i = 0; i < seconds / STEP; i++) this.sub(STEP);
		this.windOn = wind;
	}

	get ext() {
		return this.cordTotal - this.cordBase;
	}

	/* where the lit part of the lamp is (the middle of the bulb) */
	bulb() {
		const a = this.axis();
		return { x: this.bottom.pos.x + a.x * 2 * this.s, y: this.bottom.pos.y + a.y * 2 * this.s };
	}

	/* the unit vector from the hook to the rim: which way the lamp points */
	axis() {
		const dx = this.bottom.pos.x - this.hook.pos.x;
		const dy = this.bottom.pos.y - this.hook.pos.y;
		const l = Math.hypot(dx, dy) || 1;
		return { x: dx / l, y: dy / l };
	}

	speed() {
		const p = this.bottom;
		return Math.hypot(p.pos.x - p.oldPos.x, p.pos.y - p.oldPos.y) / STEP;
	}

	get isHeld() {
		return !!this.held || !!this.script;
	}

	/* ---------- the hand ---------- */

	/* kind: 'bead' pulls the cord out; 'lamp' swings the whole lamp. (px, py): the pointer, in canvas pixels. */
	grab(kind, px, py) {
		if (this.held || this.script) return false;
		const point = kind === 'bead' ? this.bead : this.bottom;
		this.held = { kind, point, ox: point.pos.x - px, oy: point.pos.y - py, tx: point.pos.x, ty: point.pos.y };
		point.held = true;
		return true;
	}

	drag(px, py) {
		if (!this.held || this.script) return;
		this.held.tx = px + this.held.ox;
		this.held.ty = py + this.held.oy;
	}

	release() {
		if (!this.held) return;
		this.held.point.held = false;
		this.held = null;
	}

	/* the keyboard route: pull the cord down by itself, click, let go */
	tug() {
		if (this.held || this.script) return false;
		this.script = { t: 0, point: this.bead };
		this.bead.held = true;
		return true;
	}

	/* ---------- the physics ---------- */

	/* Advance by dt seconds of real time, in fixed steps. */
	step(dt) {
		this.acc += dt;
		let n = 0;
		while (this.acc >= STEP && n < 5) {
			this.sub(STEP);
			this.acc -= STEP;
			n++;
		}
		if (n === 5) this.acc = 0;
	}

	sub(dt) {
		this.time += dt;
		const { s } = this;

		// the scripted tug: the bead is led straight down from the rim, a little past the click, then let go
		if (this.script) {
			const sc = this.script;
			sc.t += dt;
			const u = clamp(sc.t / 0.3, 0, 1);
			const pull = this.cordBase + (this.threshold + 12 * s) * easeOut(u);
			this.held = { kind: 'script', point: this.bead, ox: 0, oy: 0, tx: this.bottom.pos.x + 3 * s, ty: this.bottom.pos.y + pull };
			if (sc.t > 0.42) {
				this.bead.held = false;
				this.held = null;
				this.script = null;
			}
		}

		// the held point follows the hand with a little lag, and keeps the speed it was moved at
		const h = this.held;
		if (h) {
			const p = h.point;
			const a = { x: this.x0, y: this.y0 };
			// never further from the ceiling than the chain reaches, never above the hook for the lamp
			const reach = (h.kind === 'lamp' ? this.ropeLen + this.shadeH : this.ropeLen + this.shadeH + this.cordBase + this.cordMax) * 0.985;
			let tx = h.tx;
			let ty = h.ty;
			if (h.kind === 'lamp') ty = Math.max(ty, this.y0 + this.shadeH * 1.3);
			else if (h.kind === 'bead') ty = Math.max(ty, this.bottom.pos.y + this.cordBase * 0.5); // the cord is pulled down, never up through the lamp
			const d = Math.hypot(tx - a.x, ty - a.y);
			if (d > reach) {
				tx = a.x + ((tx - a.x) * reach) / d;
				ty = a.y + ((ty - a.y) * reach) / d;
			}
			const k = smooth(h.kind === 'script' ? 60 : 32, dt);
			let nx = p.pos.x + (tx - p.pos.x) * k;
			let ny = p.pos.y + (ty - p.pos.y) * k;
			// a flick cannot be faster than the solver can follow
			const vmax = 16 * s;
			const vx = nx - p.pos.x;
			const vy = ny - p.pos.y;
			const v = Math.hypot(vx, vy);
			if (v > vmax) {
				nx = p.pos.x + (vx * vmax) / v;
				ny = p.pos.y + (vy * vmax) / v;
			}
			p.oldPos.x = p.pos.x;
			p.oldPos.y = p.pos.y;
			p.pos.x = nx;
			p.pos.y = ny;
		}

		// the cord: while the bead is held it slides out to wherever the bead is (up to its limit);
		// let go, it winds back
		const links = this.cordPoints.length - 1;
		if (this.bead.held) {
			const d = Math.hypot(this.bead.pos.x - this.bottom.pos.x, this.bead.pos.y - this.bottom.pos.y);
			const want = clamp(d, this.cordBase, this.cordBase + this.cordMax);
			this.cordTotal += (want - this.cordTotal) * smooth(40, dt);
		} else {
			this.cordTotal += (this.cordBase - this.cordTotal) * smooth(9, dt);
		}
		for (let i = 0; i < links; i++) this.cordPoints[i].distanceToNextPoint = this.cordTotal / links;

		// the click
		if (this.bead.held && this.armed && this.ext >= this.threshold) {
			this.armed = false;
			this.onClick();
		} else if (!this.armed && this.ext < this.threshold * 0.45) {
			this.armed = true;
		}

		// a breeze that never quite repeats
		const wind = this.windOn ? 90 * s * (Math.sin(this.time * 0.63) + 0.55 * Math.sin(this.time * 0.37 + 1.3)) : 0;
		this.rope.update(GRAVITY, dt, wind);
	}

	/* a push from the side (a tap on the lamp): vx in px per second */
	kick(vx) {
		for (const p of [this.hook, this.bottom]) p.oldPos.x = p.pos.x - vx * STEP;
	}
}
