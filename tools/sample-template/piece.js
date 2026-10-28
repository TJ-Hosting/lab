/*
 * Sample {{NN}} — "{{Title}}".
 * {{Two or three lines: what it does and how.}}
 *
 * Adapted from {{source title}} by {{author}} ({{URL}}), {{licence}}.
 * {{For MIT/ISC/BSD: the copyright line and the full permission notice, verbatim from the source.
 *   For Apache-2.0: the copyright line, "Licensed under the Apache License, Version 2.0", and what changed.
 *   For a rebuild from the idea: "Written from the idea only; no source code was read or copied."}}
 */
import { boot, loop, prefersReducedMotion } from '../../js/lab.js';

const canvas = document.querySelector('.piece');
const ctx = canvas.getContext('2d');
const pauseBtn = document.querySelector('[data-action="pause"]');

let W = 0;
let H = 0;
let DPR = 1;

function resize() {
	// cap the pixel ratio: phones at 3x cost 9x the pixels
	DPR = Math.min(2, window.devicePixelRatio || 1);
	W = canvas.clientWidth;
	H = canvas.clientHeight;
	canvas.width = Math.round(W * DPR);
	canvas.height = Math.round(H * DPR);
	ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function step(dt, t) {
	// advance the simulation by dt seconds (dt is capped at 0.05 by loop())
}

function draw() {
	ctx.clearRect(0, 0, W, H);
}

/* the reduced-motion still: a finished, characteristic frame, drawn once, nothing looping */
function stillFrame() {
	for (let i = 0; i < 180; i++) step(1 / 30, i / 30);
	draw();
}

function start() {
	resize();
	if (prefersReducedMotion()) {
		stillFrame();
		pauseBtn.disabled = true;
		addEventListener('resize', () => { resize(); stillFrame(); });
		return;
	}
	// loop() runs only while the canvas is on screen, the tab is visible and motion is allowed
	const ctl = loop(canvas, (dt, t) => {
		step(dt, t);
		draw();
	}, { name: '{{slug}}' });

	let timer = 0;
	addEventListener('resize', () => {
		clearTimeout(timer);
		timer = setTimeout(resize, 150);
	});

	pauseBtn.addEventListener('click', () => {
		const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Play' : 'Pause';
		if (paused) ctl.stop(); else ctl.start();
	});
}

boot();
start();
