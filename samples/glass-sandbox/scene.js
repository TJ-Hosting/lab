/*
 * Sample 52 — "Glass Sandbox": the opening scene.
 * A layered picture built straight into the grid: banded sand with a dune, a pool of water with a film of ink
 * held back by a glass pane (and a glass shelf), a few coral stalks, an ice block, and a blob of plasma dropped on the
 * dune so that glass forms where it lands. (The ids keep their first names: OIL is ink, PLANT is coral, LAVA is plasma.) It is the first thing you see, and the reduced-motion still.
 *
 * Written from the idea only; no source code was read or copied.
 */
import { SAND, WATER, OIL, PLANT, ICE, LAVA, GLASS, E } from './sim.js';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* where things go, from the shape of the world (all in cell columns): the open arena, the dune, the plants, the ice, the pool */
export function sceneSpots(basin, ax0, ax1, xr, emitY) {
	const aw = ax1 - ax0;
	return {
		basin,
		ax0,
		ax1,
		emitY,
		dune: ax0 + aw * (basin ? 0.34 : 0.5),
		plants: basin ? [xr * 0.18, xr * 0.34, xr * 0.5].map(Math.round) : [0.05, 0.13, 0.21].map((f) => Math.round(ax0 + aw * f)),
		ice: basin ? Math.round(xr * 0.76) : Math.round(ax0 + aw * 0.3),
		pool: ax0 + aw * (basin ? 0.66 : 0.76),
	};
}

export function buildScene(w, g) {
	const { gw, gh, sw, t, a, top } = w;
	w.clear();
	w.seed(0x9e3779b9);
	const floor = (x) => top[Math.round(x)] - 1; // the lowest free row of column x
	const put = (x, y, tp, life = 0) => {
		x = Math.round(x);
		if (x < 1 || x > gw || y < 1 || y > gh) return;
		const i = y * sw + x;
		if (t[i] === E) { t[i] = tp; a[i] = life; }
	};
	const aw = g.ax1 - g.ax0;

	// 1. a base of banded sand across the whole arena
	const base = Math.round(clamp(aw * 0.045, 3, 6));
	for (let x = g.ax0; x <= g.ax1; x++) {
		const f = floor(x);
		for (let k = 0; k < base; k++) put(x, f - k, SAND, (k >> 1) & 3);
	}

	// 2. a dune on top of it, in horizontal bands like sand art in a bottle
	const room = Math.max(24, floor(g.dune) - g.emitY - 12);
	const duneW = aw * 0.11;
	const duneH = Math.round(clamp(Math.min(duneW * 1.5, room * 0.45), 9, 30));
	for (let x = Math.floor(g.dune - 2.5 * duneW); x <= Math.ceil(g.dune + 2.5 * duneW); x++) {
		if (x < g.ax0 || x > g.ax1) continue;
		const e = (x - g.dune) / duneW;
		const h = Math.round(duneH * Math.exp(-e * e));
		const f = floor(x);
		for (let k = base; k < base + h; k++) put(x, f - k, SAND, (k >> 1) & 3);
	}

	// 3. a pool on the right, held back by a glass pane that carries a shelf, with a thin film of ink on the water
	const level = base + Math.round(clamp(aw * 0.09, 8, 14));
	const px0 = Math.round(g.pool);
	for (let x = px0; x <= g.ax1; x++) {
		const f = floor(x);
		for (let k = base; k < level; k++) put(x, f - k, WATER);
		for (let k = level; k < level + 3; k++) put(x, f - k, OIL);
	}
	const paneH = level + 9;
	for (let x = px0 - 2; x < px0; x++) {
		const f = floor(x);
		for (let k = 0; k < paneH; k++) put(x, f - k, GLASS);
	}
	const shelf = Math.round(Math.min(22, (g.ax1 - px0) * 0.4));
	for (let x = px0; x < px0 + shelf; x++) {
		const f = floor(x);
		put(x, f - paneH + 1, GLASS);
		put(x, f - paneH, GLASS);
	}

	// 4. coral standing on the floor: a stalk, branches in pairs and a small crown
	g.plants.forEach((px, n) => {
		const f = floor(px);
		const hgt = 11 + ((n * 5) % 9);
		for (let k = 0; k <= hgt; k++) put(px, f - k, PLANT);
		for (let k = 3; k < hgt - 1; k += 3) {
			const s = (k / 3 + n) % 2 ? 1 : -1;
			put(px + s, f - k, PLANT);
			put(px + 2 * s, f - k - 1, PLANT);
			put(px - s, f - k - 1, PLANT);
		}
		put(px - 1, f - hgt, PLANT);
		put(px + 1, f - hgt, PLANT);
		put(px, f - hgt - 1, PLANT);
	});

	// 5. a block of ice
	for (let x = 0; x < 10; x++) {
		const f = floor(g.ice + x);
		for (let k = 0; k < 5; k++) put(g.ice + x, f - k, ICE);
	}

	// 6. plasma, dropped just above the top of the dune
	const rx = clamp(aw * 0.05, 3, 7);
	const ry = rx * 0.75;
	const cy = floor(g.dune) - base - duneH - 4;
	for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
		for (let x = Math.floor(g.dune - rx); x <= Math.ceil(g.dune + rx); x++) {
			const dx = (x - g.dune) / rx;
			const dy = (y - cy) / ry;
			if (dx * dx + dy * dy <= 1) put(x, y, LAVA);
		}
	}
}
