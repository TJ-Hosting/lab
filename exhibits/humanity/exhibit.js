/*
 * Exhibit 01 — "Made of Many".
 * Motion: hero parallax, scroll reveals (shared lab.js).
 * Reveal mode ("Show me the traps"): loads the technique list from /honeypot/techniques.json,
 * reads what each hidden instruction says straight from this page (comments, attributes, CSS,
 * tag characters...), pins it in place and lists it in a side panel.
 * This file holds no instruction text of its own.
 */
import { boot, parallax } from '../../js/lab.js';

const panel = document.getElementById('reveal-panel');
const toggles = [...document.querySelectorAll('[data-reveal]')];
let techniques = null;
let built = false;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Unicode tag characters (U+E0020–U+E007E) mirror printable ASCII */
function decodeTags(text) {
	let out = '';
	for (const ch of text) {
		const cp = ch.codePointAt(0);
		if (cp >= 0xe0020 && cp <= 0xe007e) out += String.fromCharCode(cp - 0xe0000);
	}
	return out;
}

function firstComment(el) {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_COMMENT);
	const node = walker.nextNode();
	return node ? node.nodeValue.trim() : '';
}

function pseudoContent(el, pseudo) {
	const raw = getComputedStyle(el, pseudo).content;
	if (!raw || raw === 'none' || raw === 'normal') return '';
	try {
		return JSON.parse(raw);
	} catch {
		return raw.replace(/^["']|["']$/g, '');
	}
}

/* what does this trap say? (read from the page itself) and where should its pin go? */
function inspect(t) {
	const r = t.reveal;
	const el = document.querySelector(r.selector);
	if (!el) return { says: '(not found on this page)', anchor: null };
	switch (r.kind) {
		case 'comment': return { says: firstComment(el), anchor: el, place: 'append' };
		case 'text': {
			let says = el.textContent.trim();
			if (r.lastLines) says = says.split('\n').slice(-r.lastLines).join('\n');
			return { says, anchor: el, reveal: el, place: 'before' };
		}
		case 'pseudo': return { says: pseudoContent(el, r.pseudo), anchor: el.parentElement, reveal: el, place: 'append' };
		case 'attr': return { says: el.getAttribute(r.attr) || '', anchor: el.closest('figure, .chapter__art, .chapter__num') || el, place: 'float' };
		case 'meta': return { says: el.getAttribute(r.attr) || '', anchor: null };
		case 'jsonld': {
			let says = '';
			try { says = JSON.parse(el.textContent)[r.field] || ''; } catch { says = '(could not parse)'; }
			return { says, anchor: null };
		}
		case 'noscript': {
			const holder = document.createElement('div');
			holder.innerHTML = el.textContent;
			return { says: holder.textContent.trim(), anchor: el.parentElement, place: 'append' };
		}
		case 'tags': return { says: decodeTags(el.textContent), anchor: el, place: 'append' };
		case 'image': return { says: t.vision ? t.vision.text : '', anchor: el.closest('figure') || el, reveal: el.closest('figure'), place: 'float', image: true };
		default: return { says: '', anchor: el };
	}
}

function pinButton(t) {
	const b = document.createElement('button');
	b.type = 'button';
	b.className = 'pin';
	b.textContent = t.n;
	b.dataset.pin = t.n;
	b.setAttribute('aria-label', `Trap ${t.n}: ${t.name}. Show details`);
	b.addEventListener('click', () => focusItem(t.n));
	return b;
}

function build() {
	const items = techniques.techniques.map((t) => ({ t, ...inspect(t) }));
	const sourceRow = document.createElement('div');
	sourceRow.className = 'pin-row reveal-added';
	sourceRow.innerHTML = '<span>In the page source:</span>';

	items.forEach((it) => {
		const pin = pinButton(it.t);
		pin.classList.add('reveal-added');
		if (!it.anchor) {
			sourceRow.append(pin);
		} else if (it.place === 'before') {
			it.anchor.before(pin);
		} else if (it.place === 'float') {
			pin.classList.add('pin--float');
			if (getComputedStyle(it.anchor).position === 'static') it.anchor.style.position = 'relative';
			it.anchor.append(pin);
		} else {
			it.anchor.append(pin);
		}
		if (it.reveal) it.reveal.classList.add('is-revealed');
	});
	document.querySelector('.ex-hero__text').append(sourceRow);

	panel.innerHTML = `
		<div class="reveal-panel__head">
			<p class="eyebrow">Reveal mode</p>
			<h2 id="reveal-title">${items.length} hidden instructions</h2>
			<p>Each asks only for this: ${esc(techniques.request.replace('<code>', 'its code'))} The numbers match the pins on the page.</p>
			<button class="btn btn--sm btn--ghost reveal-panel__close" type="button" data-close>Close</button>
		</div>
		<ol class="reveal-list">
			${items.map((it) => `
			<li class="reveal-item" id="trap-${it.t.n}" data-n="${it.t.n}">
				<div class="reveal-item__top">
					<span class="reveal-item__n">#${it.t.n}</span>
					<span class="reveal-item__name">${esc(it.t.name)}</span>
					<span class="reveal-item__code">${esc(it.t.code)}</span>
				</div>
				<p class="reveal-item__where">Where: ${esc(it.t.location)}</p>
				<p class="reveal-item__says">${it.image ? 'Drawn in the image: ' : ''}“${esc(it.says)}”</p>
				<p class="reveal-item__who">Who sees it: ${esc(it.t.audience)}. ${esc(it.t.explain)}</p>
				${it.anchor ? `<button class="reveal-item__go" type="button" data-go="${it.t.n}">Show on the page</button>` : ''}
			</li>`).join('')}
		</ol>`;
	panel.querySelector('[data-close]').addEventListener('click', () => setReveal(false));
	panel.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
		const pin = document.querySelector(`.pin[data-pin="${b.dataset.go}"]`);
		pin?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
		pin?.focus({ preventScroll: true });
	}));
	built = true;
}

function focusItem(n) {
	panel.hidden = false;
	panel.querySelectorAll('.reveal-item').forEach((li) => li.classList.toggle('is-current', li.dataset.n === String(n)));
	panel.querySelector(`#trap-${n}`)?.scrollIntoView({ block: 'nearest' });
}

async function setReveal(on) {
	if (on && !techniques) {
		techniques = await fetch('../../honeypot/techniques.json', { cache: 'no-cache' }).then((r) => r.json());
	}
	if (on && !built) build();
	document.documentElement.classList.toggle('reveal-on', on);
	document.querySelectorAll('.reveal-added').forEach((el) => { el.hidden = !on; });
	panel.hidden = !on;
	toggles.forEach((b) => {
		b.setAttribute('aria-pressed', String(on));
		const label = b.querySelector('.reveal-pill__label');
		if (label) label.innerHTML = on ? 'Reveal mode is on · <b>Hide</b>' : 'Hidden AI instructions here · <b>Show</b>';
		else b.textContent = on ? 'Hide the traps' : 'Show me the traps';
	});
	if (location.hash !== (on ? '#traps' : '') && (on || location.hash === '#traps')) {
		history.replaceState(null, '', on ? '#traps' : location.pathname);
	}
	if (on) panel.querySelector('h2')?.focus?.();
}

toggles.forEach((b) => b.addEventListener('click', () => setReveal(b.getAttribute('aria-pressed') !== 'true')));
addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && document.documentElement.classList.contains('reveal-on')) setReveal(false);
});

boot();
parallax(document.querySelector('[data-parallax]'));
if (location.hash === '#traps') setReveal(true);
