/* Lab home: renders the sample and exhibit cards from samples.json.
   lab-05: category filter chips (All first), a "new" badge on the newest batch, and lazy cards
   (images load lazily; off-screen cards skip rendering through content-visibility in home.css). */
import { boot, parallax, loop } from './lab.js';

// the order of the filter chips; a category with no sample gets no chip
const CATEGORIES = ['Type', 'Generative', 'WebGL', 'Scroll', 'Pointer', 'SVG', 'UI', 'Data', 'Toys', 'Image'];

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function picture(image, sizes) {
	const set = (ext) => image.widths.map((w) => `${esc(image.base)}-${w}.${ext} ${w}w`).join(', ');
	return `<picture>
		<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
		<img src="${esc(image.base)}-${image.widths[0]}.webp" srcset="${set('webp')}" sizes="${sizes}" alt="" loading="lazy" decoding="async" width="${image.widths[0]}" height="${Math.round(image.widths[0] * (image.ratio || 9 / 16))}">
	</picture>`;
}

function sampleCard(s, i, isNew) {
	const n = String(i + 1).padStart(2, '0');
	// the stagger runs along a row of three, not down the whole list (63 cards would wait 5 s)
	return `<li class="rise" style="--delay:${(i % 3) * 0.09}s" data-category="${esc(s.category || '')}">
		<a class="card glass glass--interactive" data-shine href="${esc(s.href)}">
			<div class="card__art">${picture(s.image, '(min-width: 1100px) 400px, (min-width: 760px) 45vw, 92vw')}<span class="card__num">${n}</span>${isNew ? '<span class="card__new">New</span>' : ''}</div>
			<div class="card__body">
				<span class="card__kicker">${esc(s.kicker)}</span>
				<h3 class="card__title">${esc(s.title)}</h3>
				<p class="card__blurb">${esc(s.blurb)}</p>
				<div class="card__foot">
					<ul class="tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
					<span class="card__go" aria-hidden="true">${arrow}</span>
				</div>
			</div>
		</a>
	</li>`;
}

function exhibitCard(x) {
	const links = (x.links || [{ label: 'Open', href: x.href, primary: true }])
		.map((l) => `<a class="btn ${l.primary ? 'btn--primary' : 'btn--ghost'}" href="${esc(l.href)}">${esc(l.label)}${l.primary ? arrow : ''}</a>`)
		.join('');
	return `<li class="rise">
		<article class="card card--feature glass glass--strong" data-shine>
			<div class="card__art">${picture(x.image, '(min-width: 820px) 55vw, 92vw')}</div>
			<div class="card__body">
				<span class="card__kicker">${esc(x.kicker)}</span>
				<h3 class="card__title">${esc(x.title)}</h3>
				<p class="card__blurb">${esc(x.blurb)}</p>
				<ul class="tags">${x.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
				<div class="card__actions">${links}</div>
			</div>
		</article>
	</li>`;
}

/* the filter chips: All, then each category that has samples, with its count. The choice is kept in the
   address (?kind=WebGL), so a filtered view can be linked; the card numbers stay the lab's own. */
function filters(list, data) {
	const bar = document.querySelector('[data-filters]');
	const status = document.querySelector('[data-filter-count]');
	if (!bar) return;
	const counts = {};
	data.samples.forEach((s) => { if (s.category) counts[s.category] = (counts[s.category] || 0) + 1; });
	const cats = [...CATEGORIES.filter((c) => counts[c]), ...Object.keys(counts).filter((c) => !CATEGORIES.includes(c))];
	if (cats.length < 2) return;
	const chip = (c, n) => `<button class="btn btn--sm btn--ghost chip" type="button" data-kind="${esc(c)}" aria-pressed="false">${esc(c)} <span class="chip__n">${n}</span></button>`;
	bar.innerHTML = chip('All', data.samples.length) + cats.map((c) => chip(c, counts[c])).join('');
	bar.hidden = false;
	const apply = (kind, push) => {
		const all = kind === 'All' || !counts[kind];
		const k = all ? 'All' : kind;
		bar.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === k)));
		let shown = 0;
		list.querySelectorAll(':scope > li').forEach((li) => {
			const on = all || li.dataset.category === k;
			li.hidden = !on;
			if (on) shown++;
		});
		status.textContent = all ? `${data.samples.length} samples` : `${shown} of ${data.samples.length} samples · ${k}`;
		if (push) {
			const url = new URL(location.href);
			if (all) url.searchParams.delete('kind'); else url.searchParams.set('kind', k);
			history.replaceState(null, '', url);
		}
	};
	bar.addEventListener('click', (ev) => {
		const b = ev.target.closest('.chip');
		if (b) apply(b.dataset.kind, true);
	});
	apply(new URLSearchParams(location.search).get('kind') || 'All', false);
}

async function render() {
	const data = await fetch('samples.json', { cache: 'no-cache' }).then((r) => r.json());
	const samples = document.querySelector('[data-cards="samples"]');
	const exhibits = document.querySelector('[data-cards="exhibits"]');
	// "new": the newest batch by date, once there is more than one batch
	const dates = data.samples.map((s) => s.added).filter(Boolean).sort();
	const newest = dates[dates.length - 1];
	const isNew = (s) => dates[0] !== newest && s.added === newest;
	samples.innerHTML = data.samples.map((s, i) => sampleCard(s, i, isNew(s))).join('');
	filters(samples, data);
	exhibits.innerHTML = data.exhibits.map(exhibitCard).join('');
	samples.setAttribute('aria-busy', 'false');
	exhibits.setAttribute('aria-busy', 'false');
	document.querySelectorAll('[data-count="samples"]').forEach((el) => { el.textContent = data.samples.length; });
	document.querySelectorAll('[data-count="exhibits"]').forEach((el) => { el.textContent = data.exhibits.length; });
	boot();
}

/* the hero's isometric cluster floats: each object bobs 5 px, staggered, about 7 s a cycle
   (transform only, through loop(): off-screen, hidden tabs and reduced motion leave it still) */
function bob(scene) {
	if (!scene) return;
	const items = [...scene.querySelectorAll('[data-bob]')];
	loop(scene, (dt, t) => {
		items.forEach((el, i) => { el.style.transform = `translate3d(0, ${(Math.sin(t * 0.9 + i * 1.7) * 5).toFixed(2)}px, 0)`; });
	}, { name: 'hero-bob' });
}

boot();
parallax(document.querySelector('[data-parallax]'));
bob(document.querySelector('.hero__scene'));
render().catch((err) => {
	document.querySelectorAll('[data-cards]').forEach((el) => {
		el.innerHTML = '<li class="card-error">The sample list could not load. Try reloading the page.</li>';
	});
	console.error(err);
});
