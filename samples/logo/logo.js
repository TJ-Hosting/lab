/*
 * Sample 03 — "The mark, assembling".
 * Intro: ring scales and turns in → meridians open → parallels draw out from the centre →
 * seven scanlines slide in from alternating sides → orbit node pops → glint → wordmark rises.
 * Idle: the two meridians turn (scaleX through zero), so the globe keeps spinning.
 * Transform and opacity only. The CSS default is the finished mark, which is the reduced-motion frame.
 */
import { boot, govern, prefersReducedMotion } from '../../js/lab.js';

const stage = document.querySelector('.logo-stage');
const q = (s) => [...stage.querySelectorAll(s)];
const ring = stage.querySelector('.ring');
const mers = q('.mer');
const pars = q('.par');
const stripes = q('.stripe');
const node = stage.querySelector('.node');
const glint = stage.querySelector('.glint');
const lens = stage.querySelector('.lens');
const letters = q('.wordmark span');
const pauseBtn = document.querySelector('[data-action="pause"]');
const replayBtn = document.querySelector('[data-action="replay"]');

const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const gov = govern(stage);
let anims = [];

function play() {
	anims.forEach((a) => a.cancel());
	anims = [];
	if (prefersReducedMotion()) return;
	const add = (el, frames, opts) => anims.push(el.animate(frames, { fill: 'backwards', easing: OUT, ...opts }));

	add(lens, [{ transform: 'scale(0.82)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1400 });
	add(ring, [{ transform: 'scale(0.35) rotate(-120deg)', opacity: 0 }, { opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 1300, delay: 150 });
	mers.forEach((m, i) => add(m, [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1100, delay: 520 + i * 140 }));
	pars.forEach((p, i) => add(p, [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 700 + Math.abs(i - 1) * 120 }));
	stripes.forEach((s, i) => {
		const from = (i % 2 ? 1 : -1) * 130;
		add(s, [{ transform: `translateX(${from}px)`, opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 1050, delay: 1150 + i * 85 });
	});
	add(node, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 1950, easing: SPRING });
	anims.push(glint.animate([
		{ transform: 'translateX(0) skewX(-18deg)', opacity: 0 },
		{ opacity: 0.85, offset: 0.2 },
		{ opacity: 0.85, offset: 0.8 },
		{ transform: 'translateX(150px) skewX(-18deg)', opacity: 0 },
	], { duration: 1100, delay: 2300, easing: 'ease-in-out', fill: 'both' }));
	letters.forEach((l, i) => add(l, [{ transform: 'translate3d(0, 0.6em, 0) rotate(6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: 2350 + i * 55 }));

	// idle: the globe keeps turning
	// (each meridian starts its turn from rest, 0.18 of a turn after the previous one)
	const turn = [1, 0, -1, 0, 1].map((x) => ({ transform: `scaleX(${x})` }));
	mers.forEach((m, i) => anims.push(m.animate(turn, { duration: 9000, delay: 1900 + i * 1620, iterations: Infinity, easing: 'ease-in-out' })));

	gov.apply();
}

pauseBtn.addEventListener('click', () => {
	const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
	pauseBtn.setAttribute('aria-pressed', String(paused));
	pauseBtn.textContent = paused ? 'Play' : 'Pause';
	gov.setUserPaused(paused);
});
replayBtn.addEventListener('click', () => {
	pauseBtn.setAttribute('aria-pressed', 'false');
	pauseBtn.textContent = 'Pause';
	gov.userPaused = false;
	play();
});

boot();
document.fonts.ready.then(play);
