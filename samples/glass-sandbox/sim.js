/*
 * Sample 52 — "Glass Sandbox": the rules. (The ids keep their first names; on the page OIL is ink, FIRE is spark,
 * PLANT is coral and LAVA is plasma.)
 * A falling-sand world on a small grid. Every cell holds one of a dozen element ids in a Uint8Array and follows
 * a few local rules each step: powders and liquids fall by density, water levels out, fire climbs and burns,
 * lava is slow and hot, and where lava meets sand the sand fuses to glass. Cells sit inside a one-cell border
 * of wall, so no rule needs a bounds check.
 *
 * Written from the idea only; no source code was read or copied.
 */

export const E = 0;
export const SAND = 1;
export const WATER = 2;
export const OIL = 3;
export const FIRE = 4;
export const PLANT = 5;
export const ICE = 6;
export const LAVA = 7;
export const GLASS = 8;
export const WALL = 9; // bedrock: the terrain, never drawn by the visitor
export const STEAM = 10; // water that met lava; it rises and falls again as rain
export const STONE = 11; // lava that met water or ice

/* how heavy each element is when it falls (255 = solid: nothing can swap into it) */
const DENS = new Uint8Array(16).fill(255);
DENS[E] = 0;
DENS[STEAM] = 1;
DENS[OIL] = 5;
DENS[WATER] = 10;
DENS[LAVA] = 20;
DENS[SAND] = 30;

/* the elements that have a rule of their own each step */
const DYN = new Uint8Array(16);
[SAND, WATER, OIL, FIRE, PLANT, LAVA, GLASS, STEAM].forEach((k) => { DYN[k] = 1; });

/* how thickly a brush fills the empty cells it covers (index = element id) */
const DENSITY = [0, 0.55, 0.6, 0.6, 0.5, 0.8, 1, 0.65, 1];

export function createWorld(gw, gh) {
	const sw = gw + 2;
	const size = sw * (gh + 2);
	const t = new Uint8Array(size); // element
	const a = new Uint8Array(size); // spare byte: sand band, fire life, steam life, glass heat
	const mk = new Uint8Array(size); // the step in which this cell last moved (so nothing moves twice)
	const nz = new Uint8Array(size); // fixed per-cell noise, for the colours
	const nb = [-sw, sw, -1, 1];
	let tick8 = 0;
	let flip = false;
	let steps = 0;

	/* xorshift32: fast, and the same on every visit when seeded */
	let rs = 2463534242;
	const rnd = () => {
		rs ^= rs << 13;
		rs ^= rs >>> 17;
		rs ^= rs << 5;
		return (rs >>> 0) / 4294967296;
	};
	const seed = (s) => { rs = s >>> 0 || 1; };

	/* the border is wall; the noise is a hash of the cell's place */
	for (let y = 0; y <= gh + 1; y++) {
		for (let x = 0; x <= gw + 1; x++) {
			const i = y * sw + x;
			if (x === 0 || y === 0 || x === gw + 1 || y === gh + 1) t[i] = WALL;
			let h = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
			h = Math.imul(h ^ (h >>> 13), 1274126177);
			nz[i] = (h ^ (h >>> 16)) & 255;
		}
	}
	let top = new Int16Array(sw).fill(gh + 1); // per column: the first row of terrain (gh + 1 = none)

	/* ---------- moves ---------- */

	function swap(i, j) {
		const ti = t[i];
		const ai = a[i];
		t[i] = t[j];
		a[i] = a[j];
		t[j] = ti;
		a[j] = ai;
		mk[i] = tick8;
		mk[j] = tick8;
	}

	/* i falls into j if j is lighter (empty always, a lighter liquid with chance p) */
	function fall(i, j, dm, p) {
		const tj = t[j];
		if (DENS[tj] >= dm) return false;
		if (tj !== E && rnd() > p) return false;
		swap(i, j);
		return true;
	}

	/* a liquid spreads sideways over empty cells, up to `reach` cells */
	function slide(i, dir, reach) {
		let best = 0;
		for (let n = 1; n <= reach; n++) {
			const k = i + dir * n;
			if (t[k] !== E) break;
			best = k;
		}
		if (!best) return false;
		swap(i, best);
		return true;
	}

	function set(j, type, life) {
		t[j] = type;
		a[j] = life;
		mk[j] = tick8;
	}

	/* ---------- rules ---------- */

	function sand(i) {
		if (fall(i, i + sw, 30, 0.6)) {
			// a falling grain picks up speed: now and then it drops two cells
			if (t[i + 2 * sw] === E && rnd() < 0.5) swap(i + sw, i + 2 * sw);
			return;
		}
		const l = i + sw - 1;
		const r = i + sw + 1;
		if (rnd() < 0.5) {
			if (!fall(i, l, 30, 0.5)) fall(i, r, 30, 0.5);
		} else if (!fall(i, r, 30, 0.5)) fall(i, l, 30, 0.5);
	}

	function liquid(i, dm, reach) {
		if (fall(i, i + sw, dm, 0.5)) {
			if (t[i + 2 * sw] === E && rnd() < 0.5) swap(i + sw, i + 2 * sw);
			return;
		}
		const l = i + sw - 1;
		const r = i + sw + 1;
		if (rnd() < 0.5) {
			if (fall(i, l, dm, 0.4) || fall(i, r, dm, 0.4)) return;
		} else if (fall(i, r, dm, 0.4) || fall(i, l, dm, 0.4)) return;
		const dir = rnd() < 0.5 ? -1 : 1;
		if (!slide(i, dir, reach)) slide(i, -dir, reach);
	}

	function lava(i) {
		const j = i + nb[(rnd() * 4) | 0];
		switch (t[j]) {
			case WATER:
				if (rnd() < 0.35) {
					set(j, STEAM, 90 + ((rnd() * 110) | 0));
					set(i, STONE, 0);
					return;
				}
				break;
			case ICE:
				if (rnd() < 0.3) set(j, WATER, 0);
				if (rnd() < 0.06) { set(i, STONE, 0); return; }
				break;
			case SAND:
				if (rnd() < 0.2) {
					set(j, GLASS, 255);
					// the lava that did it is spent, more often than not
					if (rnd() < 0.35) { set(i, GLASS, 255); return; }
				}
				break;
			case OIL:
				if (rnd() < 0.35) set(j, FIRE, 50 + ((rnd() * 40) | 0));
				break;
			case PLANT:
				if (rnd() < 0.3) set(j, FIRE, 90 + ((rnd() * 60) | 0));
				break;
			default:
		}
		// in the open air a pool slowly crusts over
		if (t[i - sw] === E && rnd() < 0.002) { set(i, STONE, 0); return; }
		// thick: it falls well enough, but creeps sideways only some of the time
		if (rnd() < 0.8 && fall(i, i + sw, 20, 0.4)) return;
		if (rnd() < 0.4) {
			const l = i + sw - 1;
			const r = i + sw + 1;
			if (rnd() < 0.5) {
				if (fall(i, l, 20, 0.3) || fall(i, r, 20, 0.3)) return;
			} else if (fall(i, r, 20, 0.3) || fall(i, l, 20, 0.3)) return;
			if (rnd() < 0.3) slide(i, rnd() < 0.5 ? -1 : 1, 1);
		}
	}

	function fire(i, y) {
		let life = a[i];
		if (life <= 1 || y === 1) { t[i] = E; a[i] = 0; return; }
		for (let q = 0; q < 2; q++) {
			const j = i + nb[(rnd() * 4) | 0];
			const tj = t[j];
			if (tj === PLANT) {
				if (rnd() < 0.1) set(j, FIRE, 70 + ((rnd() * 70) | 0));
			} else if (tj === OIL) {
				if (rnd() < 0.3) set(j, FIRE, 40 + ((rnd() * 40) | 0));
			} else if (tj === ICE) {
				if (rnd() < 0.08) { set(j, WATER, 0); life -= 6; }
			} else if (tj === WATER) {
				// water puts a loose flame out; a fuelled one hardly notices
				if (rnd() < (life > 26 ? 0.03 : 0.25)) {
					t[i] = E;
					a[i] = 0;
					if (rnd() < 0.4) set(j, STEAM, 90 + ((rnd() * 110) | 0));
					return;
				}
			}
		}
		life -= 1;
		a[i] = life;
		if (life > 26) return; // still has fuel: it stays where it is
		// the last of a flame lifts away
		const up = i - sw;
		if (t[up] === E && rnd() < 0.8) swap(i, up);
		else {
			const d = up + (rnd() < 0.5 ? -1 : 1);
			if (t[d] === E && rnd() < 0.6) swap(i, d);
			else if (rnd() < 0.25) { t[i] = E; a[i] = 0; }
		}
	}

	function steam(i, y) {
		const life = a[i];
		if (y === 1) { t[i] = E; a[i] = 0; return; }
		if (life <= 1) {
			// it cools: most of it comes back as a drop of water
			if (rnd() < 0.6) set(i, WATER, 0);
			else { t[i] = E; a[i] = 0; }
			return;
		}
		a[i] = life - 1;
		const up = i - sw;
		if (t[up] === E && rnd() < 0.7) swap(i, up);
		else {
			const d = i + (rnd() < 0.5 ? -1 : 1) - (rnd() < 0.5 ? sw : 0);
			if (t[d] === E) swap(i, d);
		}
	}

	/* a plant that touches water sprouts a new cell, mostly upward, and drinks some of the water */
	function plant(i) {
		if (rnd() > 0.04) return;
		let w = 0;
		for (let q = 0; q < 4; q++) {
			if (t[i + nb[q]] === WATER) { w = i + nb[q]; break; }
		}
		if (!w || rnd() > 0.3) return;
		const j = i + [-sw, -sw, -sw - 1, -sw + 1, -1, 1][(rnd() * 6) | 0];
		if (t[j] !== E) return;
		set(j, PLANT, 0);
		if (rnd() < 0.5) { t[w] = E; a[w] = 0; }
	}

	/* hot glass cools; while it is hot it fuses a touching sand grain to glass too, a little cooler */
	function glass(i) {
		const h = a[i];
		if (!h) return;
		a[i] = h - 1;
		if (h > 110 && rnd() < 0.15) {
			const j = i + nb[(rnd() * 4) | 0];
			if (t[j] === SAND) set(j, GLASS, h - 40);
		}
	}

	function act(ty, i, y) {
		switch (ty) {
			case SAND: sand(i); break;
			case WATER: liquid(i, 10, 5); break;
			case OIL: liquid(i, 5, 3); break;
			case LAVA: lava(i); break;
			case FIRE: fire(i, y); break;
			case STEAM: steam(i, y); break;
			case PLANT: plant(i); break;
			case GLASS: glass(i); break;
			default:
		}
	}

	/* one step of the whole world: bottom row first, the scan direction alternating */
	function step() {
		tick8 = tick8 === 255 ? 1 : tick8 + 1;
		flip = !flip;
		steps++;
		for (let y = gh; y >= 1; y--) {
			const row = y * sw;
			if (flip) {
				for (let x = 1; x <= gw; x++) {
					const i = row + x;
					const ty = t[i];
					if (DYN[ty] && mk[i] !== tick8) act(ty, i, y);
				}
			} else {
				for (let x = gw; x >= 1; x--) {
					const i = row + x;
					const ty = t[i];
					if (DYN[ty] && mk[i] !== tick8) act(ty, i, y);
				}
			}
		}
	}

	/* ---------- drawing into the world ---------- */

	/* a round brush at (cx, cy) in cell units; E erases (never the terrain), anything else sprinkles into empty cells */
	function paint(cx, cy, r, tp, band = 0) {
		const x0 = Math.max(1, Math.floor(cx - r));
		const x1 = Math.min(gw, Math.ceil(cx + r));
		const y0 = Math.max(1, Math.floor(cy - r));
		const y1 = Math.min(gh, Math.ceil(cy + r));
		const r2 = r * r;
		const dens = DENSITY[tp];
		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const dx = x - 0.5 - cx;
				const dy = y - 0.5 - cy;
				if (dx * dx + dy * dy > r2) continue;
				const i = y * sw + x;
				const cur = t[i];
				if (tp === E) {
					if (cur !== WALL) { t[i] = E; a[i] = 0; }
					continue;
				}
				if (cur !== E || rnd() > dens) continue;
				t[i] = tp;
				mk[i] = tick8;
				a[i] = tp === FIRE ? 50 + ((rnd() * 50) | 0) : tp === SAND ? band & 3 : 0;
			}
		}
	}

	function clear() {
		for (let y = 1; y <= gh; y++) {
			for (let x = 1; x <= gw; x++) {
				const i = y * sw + x;
				if (t[i] !== WALL) { t[i] = E; a[i] = 0; }
			}
		}
	}

	/* the terrain: heightAt(x) = rows of bedrock standing on the floor at column x */
	function setTerrain(heightAt) {
		for (let y = 1; y <= gh; y++) {
			for (let x = 1; x <= gw; x++) {
				const i = y * sw + x;
				if (t[i] === WALL) { t[i] = E; a[i] = 0; }
			}
		}
		top = new Int16Array(sw).fill(gh + 1);
		for (let x = 1; x <= gw; x++) {
			const h = Math.max(0, Math.min(gh - 3, Math.round(heightAt(x))));
			if (h) top[x] = gh - h + 1;
			for (let y = gh - h + 1; y <= gh; y++) {
				const i = y * sw + x;
				t[i] = WALL;
				a[i] = 0;
			}
		}
		return top;
	}

	/* keep what the visitor made when the grid is rebuilt: bottom-left aligned, terrain left out */
	function copyFrom(o) {
		const rows = Math.min(gh, o.gh);
		const cols = Math.min(gw, o.gw);
		for (let k = 0; k < rows; k++) {
			const yn = gh - k;
			const yo = o.gh - k;
			for (let x = 1; x <= cols; x++) {
				const io = yo * o.sw + x;
				if (o.t[io] === WALL) continue;
				const inn = yn * sw + x;
				t[inn] = o.t[io];
				a[inn] = o.a[io];
			}
		}
	}

	/* how much of the open world is filled (0 to 1) */
	function fill() {
		let free = 0;
		let used = 0;
		for (let y = 1; y <= gh; y++) {
			for (let x = 1; x <= gw; x++) {
				const ty = t[y * sw + x];
				if (ty === WALL) continue;
				free++;
				if (ty !== E) used++;
			}
		}
		return free ? used / free : 0;
	}

	/* a soft wipe: the cells of columns x0..x1 vanish, each with chance p */
	function wipe(x0, x1, p) {
		const lo = Math.max(1, Math.floor(x0));
		const hi = Math.min(gw, Math.floor(x1));
		for (let x = lo; x <= hi; x++) {
			for (let y = 1; y <= gh; y++) {
				const i = y * sw + x;
				if (t[i] !== E && t[i] !== WALL && rnd() < p) { t[i] = E; a[i] = 0; }
			}
		}
	}

	return {
		gw, gh, sw, t, a, nz,
		get top() { return top; },
		get steps() { return steps; },
		rnd, seed, step, paint, clear, setTerrain, copyFrom, fill, wipe,
	};
}
