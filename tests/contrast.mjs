/*
 * Text contrast against the worst pixel behind it, by polarity (lab-04's method, shared by tests/run.mjs and
 * tools/check-sample.mjs since lab-05). Dark text is measured against the DARKEST pixel behind it, light text
 * against the BRIGHTEST (dark = text luminance under 0.179, where contrast with black and with white is equal).
 * The page is changed (all text hidden), so measure on a page you close afterwards.
 */
import { decodePng, contrast, luminance } from './png.mjs';

/* what the elements matching `selectors` are: colour, size and the content box where their glyphs sit
   (fully on screen, not covered by the sticky top bar or a fixed panel), at most 4 per selector */
export function targets(page, selectors) {
	return page.evaluate((sels) => {
		const list = [];
		for (const sel of sels) {
			const box = (el) => {
				const s = getComputedStyle(el);
				const b = el.getBoundingClientRect();
				const px = (v) => parseFloat(v) || 0;
				return {
					left: b.left + px(s.borderLeftWidth) + px(s.paddingLeft),
					top: b.top + px(s.borderTopWidth) + px(s.paddingTop),
					width: b.width - px(s.borderLeftWidth) - px(s.paddingLeft) - px(s.borderRightWidth) - px(s.paddingRight),
					height: b.height - px(s.borderTopWidth) - px(s.paddingTop) - px(s.borderBottomWidth) - px(s.paddingBottom),
				};
			};
			const visible = (el) => {
				const r = box(el);
				if (!(r.width > 4 && r.height > 4 && r.top >= 0 && r.top + r.height <= innerHeight && r.left >= 0 && r.left + r.width <= innerWidth)) return false;
				if (getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden]')) return false;
				const pts = [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1]].map(([fx, fy]) => [r.left + 2 + fx * (r.width - 4), r.top + 2 + fy * (r.height - 4)]);
				return pts.every(([x, y]) => {
					const hit = document.elementFromPoint(x, y);
					return hit && (hit === el || el.contains(hit) || hit.contains(el));
				});
			};
			[...document.querySelectorAll(sel)].filter(visible).slice(0, 4).forEach((el, i) => {
				const s = getComputedStyle(el);
				const r = box(el);
				const color = s.webkitTextFillColor && s.webkitTextFillColor !== s.color && !/rgba\(0, 0, 0, 0\)/.test(s.webkitTextFillColor) ? s.webkitTextFillColor : s.color;
				let gradient = null;
				if (/rgba\(0, 0, 0, 0\)/.test(color) && /gradient/.test(s.backgroundImage)) gradient = s.backgroundImage.match(/rgba?\([^)]+\)/g);
				const size = parseFloat(s.fontSize);
				const bold = parseInt(s.fontWeight, 10) >= 700;
				list.push({ sel, i, color, gradient, large: size >= 24 || (bold && size >= 18.66), size, rect: { x: r.left + 1, y: r.top + 1, w: r.width - 2, h: r.height - 2 } });
			});
		}
		return list;
	}, selectors);
}

/* hide all text, take `frames` screenshots `gap` ms apart (anything that drifts is caught at its worst),
   and score every target against the worst pixel behind it for its polarity */
export async function measure(page, list, { frames: count = 3, gap = 1500 } = {}) {
	await page.addStyleTag({ content: '*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; } input::placeholder, textarea::placeholder { color: transparent !important; }' });
	await page.evaluate(() => document.querySelectorAll('*').forEach((el) => { const s = getComputedStyle(el); if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') el.style.setProperty('background-image', 'none', 'important'); }));
	const frames = [];
	for (let n = 0; n < count; n++) {
		frames.push(decodePng(await page.screenshot({ type: 'png' })));
		if (n < count - 1) await page.waitForTimeout(gap);
	}
	const rows = [];
	for (const t of list) {
		const parse = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
		const fgs = t.gradient ? t.gradient.map(parse) : [parse(t.color)];
		// polarity: dark text (a gradient: its stops on average) is worst over the darkest pixel, light over the brightest
		const dark = fgs.reduce((s, c) => s + luminance(c), 0) / fgs.length < 0.179;
		let worst = null;
		let worstL = dark ? Infinity : -1;
		for (const f of frames) {
			for (let y = Math.round(t.rect.y); y < Math.round(t.rect.y + t.rect.h); y++) {
				for (let x = Math.round(t.rect.x); x < Math.round(t.rect.x + t.rect.w); x++) {
					const o = (y * f.width + x) * 4;
					const px = [f.data[o], f.data[o + 1], f.data[o + 2]];
					const l = 0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2];
					if (dark ? l < worstL : l > worstL) { worstL = l; worst = px; }
				}
			}
		}
		const fg = fgs.sort((a, b) => contrast(a, worst) - contrast(b, worst))[0];
		const ratio = contrast(fg, worst);
		const need = t.large ? 3 : 4.5;
		rows.push({ selector: t.sel, index: t.i, size: t.size, polarity: dark ? 'dark' : 'light', text: `rgb(${fg.join(', ')})${t.gradient ? ' (worst gradient stop)' : ''}`, worstBehind: `rgb(${worst.join(', ')})`, ratio: Math.round(ratio * 100) / 100, need, pass: ratio >= need });
	}
	return rows;
}

/* the shell's text on every sample page (lab-05): the info panel and its controls. Optional selectors are
   measured when present; required ones must be measured at least once. */
export const SHELL_REQUIRED = ['.sample-info .eyebrow', '.sample-info h1', '.sample-info .how', '.controls .back'];
export const SHELL_OPTIONAL = ['.controls .btn', '.hint'];
