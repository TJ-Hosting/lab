/*
 * rope.js: the Verlet rope under sample 29, "Pull-Cord Theme Lamp".
 *
 * Adapted from html5-es6-physics-rope by guerrillacontra (James Wrightson),
 * https://github.com/guerrillacontra/html5-es6-physics-rope (commit cebf1f17dec190b192ace0d5ff6b22dfff8555f5), MIT licence.
 * The parts taken are its Vector2 helpers, RopePoint (the time-corrected Stormer-Verlet step and the
 * neighbour constraints) and Rope (a doubly linked chain of points, the integrate-then-relax update).
 * What changed: points carry an inverse mass (so a heavy lamp and a light cord can share one chain),
 * every link has its own rest length (which the pull-cord changes while it is pulled), a point can be
 * held by hand and released with the speed it was dragged at, one end is the only fixed point, wind is an
 * extra sideways acceleration, and the rendering, the pointer, the loop and the canvas were dropped
 * (the lamp draws the chain itself).
 *
 * The licence notice of the source, verbatim:
 *
 * MIT License
 *
 * Copyright (c) 2018 James Wrightson
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
 */

//used for the few vector operations the step needs
export class Vector2 {
	static zero() {
		return { x: 0, y: 0 };
	}

	static sub(a, b) {
		return { x: a.x - b.x, y: a.y - b.y };
	}

	static add(a, b) {
		return { x: a.x + b.x, y: a.y + b.y };
	}

	static mag(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y);
	}
}

//each rope part is one of these; a high precision variant of Stormer-Verlet integration keeps it from exploding
export class RopePoint {
	//integrates motion without taking the neighbours into account
	static integrate(point, gravity, dt, previousFrameDt, windX) {
		// a fixed point (the ceiling) does not move; a held point (under the hand) was already placed
		if (point.isFixed) {
			point.velocity = Vector2.zero();
			point.oldPos = { ...point.pos };
			return;
		}
		if (point.held) return;

		point.velocity = Vector2.sub(point.pos, point.oldPos);
		point.oldPos = { ...point.pos };

		//drastically improves stability: the step that just ran may have had another length than this one
		const timeCorrection = previousFrameDt !== 0 ? dt / previousFrameDt : 0;

		const accel = Vector2.add(gravity, { x: windX * point.wind, y: 0 });

		const velCoef = timeCorrection * point.damping;
		const accelCoef = dt * dt;

		point.pos.x += point.velocity.x * velCoef + accel.x * accelCoef;
		point.pos.y += point.velocity.y * velCoef + accel.y * accelCoef;
	}

	//keeps one link at its rest length, moving each end by its share of the error (a heavy end moves less)
	static relax(a, b, rest) {
		const dx = b.pos.x - a.pos.x;
		const dy = b.pos.y - a.pos.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len < 1e-9) return;
		const wa = a.isFixed || a.held ? 0 : a.invMass;
		const wb = b.isFixed || b.held ? 0 : b.invMass;
		const wsum = wa + wb;
		if (wsum === 0) return;
		const k = ((len - rest) * 0.5) / (len * wsum);
		a.pos.x += dx * k * wa;
		a.pos.y += dy * k * wa;
		b.pos.x -= dx * k * wb;
		b.pos.y -= dy * k * wb;
	}

	//apply constraints related to the points next to it (keeps each node within distance)
	static constrain(point) {
		if (point.next) RopePoint.relax(point, point.next, point.distanceToNextPoint);
		if (point.prev) RopePoint.relax(point, point.prev, point.prev.distanceToNextPoint);
	}

	constructor(initialPos, distanceToNextPoint, invMass = 1, damping = 1, tag = '') {
		this.pos = initialPos;
		this.distanceToNextPoint = distanceToNextPoint;
		this.isFixed = false;
		this.held = false;
		this.oldPos = { ...initialPos };
		this.velocity = Vector2.zero();
		this.invMass = invMass; // 1 = light, 0.2 = five times heavier
		this.damping = damping; // the share of the speed kept each step
		this.wind = 1; // how much of the wind reaches this point
		this.tag = tag;
		this.prev = null;
		this.next = null;
	}
}

//manages a collection of rope points and executes the integration
export class Rope {
	/*
	 * A chain hanging straight down from `anchor`: one point per spec, `len` below the one before it.
	 * specs: [{ len, invMass, damping, tag, wind }]
	 */
	static hanging(anchor, specs, solverIterations) {
		const points = [new RopePoint({ x: anchor.x, y: anchor.y }, specs[0].len, 0, 1, 'anchor')];
		points[0].isFixed = true;
		let y = anchor.y;
		specs.forEach((s, i) => {
			y += s.len;
			const p = new RopePoint({ x: anchor.x, y }, specs[i + 1] ? specs[i + 1].len : 0, s.invMass ?? 1, s.damping ?? 1, s.tag || '');
			p.wind = s.wind ?? 1;
			points.push(p);
		});
		//Link nodes into a doubly linked list
		points.forEach((p, i) => {
			p.prev = i ? points[i - 1] : null;
			p.next = i < points.length - 1 ? points[i + 1] : null;
		});
		return new Rope(points, solverIterations);
	}

	constructor(points, solverIterations) {
		this._points = points;
		this._prevDelta = 0;
		this._solverIterations = solverIterations;
		this.getPoint = this.getPoint.bind(this);
		this.update = this.update.bind(this);
	}

	get points() {
		return this._points;
	}

	getPoint(index) {
		return this._points[index];
	}

	byTag(tag) {
		return this._points.find((p) => p.tag === tag);
	}

	update(gravity, dt, windX = 0) {
		for (let i = 0; i < this._points.length; i++) {
			RopePoint.integrate(this._points[i], gravity, dt, this._prevDelta, windX);
		}

		for (let iteration = 0; iteration < this._solverIterations; iteration++) {
			for (let i = 0; i < this._points.length; i++) RopePoint.constrain(this._points[i]);
		}

		this._prevDelta = dt;
	}
}
