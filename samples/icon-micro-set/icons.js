/*
 * Sample 34 — "Icon micro-interaction set": the data for the six toggles.
 * Every shape here is drawn for the lab, as plain SVG path data on a 48 × 48 grid (no icon set, no source assets).
 * piece.js reads this: each toggle has an OFF and an ON state, one or more paths that MorphSVG redraws between them,
 * optional parts that fade or turn (opacity and transform only), and its own easing.
 *
 * Written from scratch for the lab; the idea (a button that morphs an outline icon with MorphSVG) is from the
 * Osmo pen credited in piece.js. No code from the pen is used in this file.
 */

const f = (n) => Math.round(n * 100) / 100;

/* eight sun rays, as one path: short strokes around the centre (24, 24) */
function rays(inner, outer) {
	let d = '';
	for (let k = 0; k < 8; k++) {
		const a = (k * Math.PI) / 4;
		const c = Math.cos(a);
		const s = Math.sin(a);
		d += `M${f(24 + inner * c)} ${f(24 + inner * s)}L${f(24 + outer * c)} ${f(24 + outer * s)}`;
	}
	return d;
}

/* a four-point sparkle centred on (x, y) */
const spark = (x, y, r) => `M${x} ${f(y - r)}Q${x} ${y} ${f(x + r)} ${y}Q${x} ${y} ${x} ${f(y + r)}Q${x} ${y} ${f(x - r)} ${y}Q${x} ${y} ${x} ${f(y - r)}Z`;

export const TOGGLES = [
	{
		key: 'play',
		ease: 'power4.inOut',
		easeName: 'power4.inOut',
		dur: 0.5,
		off: { label: 'Paused', name: 'Playback: paused' },
		on: { label: 'Playing', name: 'Playback: playing' },
		// the triangle (shown while paused) and the two bars (shown while playing)
		svg: '<path class="ln tn" data-m="0"/>',
		morphs: [{
			off: 'M16 11L37 24L16 37Z',
			on: 'M13 11H20V37H13ZM28 11H35V37H28Z',
		}],
	},
	{
		key: 'menu',
		ease: 'back.inOut(2.2)',
		easeName: 'back.inOut',
		dur: 0.6,
		off: { label: 'Menu closed', name: 'Menu closed' },
		on: { label: 'Menu open', name: 'Menu open' },
		// three lines; the top and bottom ones cross into an X and the middle one folds into the crossing
		svg: '<path class="ln rq" data-m="1" stroke-width="3.5"/><path class="ln" data-m="0" stroke-width="3.5"/>',
		morphs: [
			{ off: 'M11 14H37M11 34H37', on: 'M14 14L34 34M34 14L14 34' },
			{ off: 'M11 24H37', on: 'M24 24L24.01 24' },
		],
	},
	{
		key: 'sky',
		ease: 'expo.inOut',
		easeName: 'expo.inOut',
		dur: 0.8,
		off: { label: 'Day', name: 'Sky: day' },
		on: { label: 'Night', name: 'Sky: night' },
		// a sun that becomes a crescent: the rays turn in and fade, two sparkles arrive
		svg: `<g class="rays"><path class="ln rq" d="${rays(13.5, 18.5)}"/></g>`
			+ '<path class="ln tn" data-m="0"/>'
			+ `<path class="st st1" d="${spark(36, 12, 4.2)}"/>`
			+ `<path class="st st2" d="${spark(40, 23, 2.8)}"/>`,
		morphs: [{
			off: 'M24 15.5A8.5 8.5 0 1 1 24 32.5A8.5 8.5 0 1 1 24 15.5Z',
			on: 'M22.02 12.04A13.5 13.5 0 1 0 36.24 28.15A11.2 11.2 0 0 1 22.02 12.04Z',
		}],
		props: [
			{ sel: '.rays', off: { opacity: 1, scale: 1, rotation: 0 }, on: { opacity: 0, scale: 0.3, rotation: 110 }, origin: '24 24' },
			{ sel: '.st1', off: { opacity: 0, scale: 0, rotation: -60 }, on: { opacity: 1, scale: 1, rotation: 0 } },
			{ sel: '.st2', off: { opacity: 0, scale: 0, rotation: 60 }, on: { opacity: 1, scale: 1, rotation: 0 } },
		],
	},
	{
		key: 'sound',
		ease: 'elastic.out(1, 0.5)',
		easeName: 'elastic.out',
		dur: 0.95,
		off: { label: 'Sound on', name: 'Sound on' },
		on: { label: 'Muted', name: 'Sound: muted' },
		// a speaker whose two sound waves turn into a cross
		svg: '<path class="ln tn" d="M8 19H14L23 11V37L14 29H8Z"/><path class="ln rq" data-m="0" fill="none"/>',
		morphs: [{
			off: 'M30 19Q34.5 24 30 29M34.5 13.5Q42 24 34.5 34.5',
			on: 'M31 18L41 30M41 18L31 30',
		}],
	},
	{
		key: 'heart',
		ease: 'back.out(3)',
		easeName: 'back.out',
		dur: 0.6,
		off: { label: 'Not saved', name: 'Heart: not saved' },
		on: { label: 'Saved', name: 'Heart: saved' },
		// an outline heart that swells and fills (the fill is its own path, faded in)
		svg: '<path class="hf" data-m="1"/><path class="ln tn" data-m="0"/>',
		morphs: [
			{
				off: 'M24 39C12 30.5 6.5 23.5 6.5 16.5C6.5 11.5 10.3 8 15 8C19 8 22.2 10.2 24 13.8C25.8 10.2 29 8 33 8C37.7 8 41.5 11.5 41.5 16.5C41.5 23.5 36 30.5 24 39Z',
				on: 'M24 41.5C11 32.5 5 24.5 5 17C5 11 9.5 6.5 15.2 6.5C19.4 6.5 22.6 8.8 24 12C25.4 8.8 28.6 6.5 32.8 6.5C38.5 6.5 43 11 43 17C43 24.5 37 32.5 24 41.5Z',
			},
			{
				off: 'M24 39C12 30.5 6.5 23.5 6.5 16.5C6.5 11.5 10.3 8 15 8C19 8 22.2 10.2 24 13.8C25.8 10.2 29 8 33 8C37.7 8 41.5 11.5 41.5 16.5C41.5 23.5 36 30.5 24 39Z',
				on: 'M24 41.5C11 32.5 5 24.5 5 17C5 11 9.5 6.5 15.2 6.5C19.4 6.5 22.6 8.8 24 12C25.4 8.8 28.6 6.5 32.8 6.5C38.5 6.5 43 11 43 17C43 24.5 37 32.5 24 41.5Z',
			},
		],
		props: [
			{ sel: '.hf', off: { opacity: 0 }, on: { opacity: 1 } },
		],
	},
	{
		key: 'lock',
		ease: 'bounce.out',
		easeName: 'bounce.out',
		dur: 0.75,
		off: { label: 'Unlocked', name: 'Lock: unlocked' },
		on: { label: 'Locked', name: 'Lock: locked' },
		// the shackle drops onto the body and clicks shut; the keyhole is a cyan dot
		svg: '<path class="ln" data-m="0" fill="none"/>'
			+ '<path class="ln tn" d="M15 22H33A5 5 0 0 1 38 27V35A5 5 0 0 1 33 40H15A5 5 0 0 1 10 35V27A5 5 0 0 1 15 22Z"/>'
			+ '<circle class="cy" cx="24" cy="29.5" r="2.7"/><path class="ln" d="M24 32.5V35.5" stroke-width="2.4"/>',
		morphs: [{
			off: 'M17 22V11.5A7 7 0 0 1 31 11.5V15.5',
			on: 'M17 22V15.5A7 7 0 0 1 31 15.5V22',
		}],
	},
];
