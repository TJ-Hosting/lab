/* Scoreboard: renders results.json against techniques.json. Adding a row to results.json is all it takes. */
import { boot } from '../../js/lab.js';

const GLYPH = { obeyed: '●', flagged: '▲', ignored: '○' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function cell(t, v) {
	const known = v === 'obeyed' || v === 'flagged' || v === 'ignored';
	const label = known ? v : 'not in this test';
	return `<td class="hm"><span class="${known ? `cell--${v}` : 'cell--na'}" title="#${t.n} ${esc(t.name)}: ${label}"><span aria-hidden="true">${known ? GLYPH[v] : '–'}</span><span class="visually-hidden">#${t.n} ${esc(t.name)}: ${label}</span></span></td>`;
}

async function render() {
	const [tech, res] = await Promise.all([
		fetch('../techniques.json', { cache: 'no-cache' }).then((r) => r.json()),
		fetch('../results.json', { cache: 'no-cache' }).then((r) => r.json()),
	]);
	const T = tech.techniques;
	const rows = [...res.rows].sort((a, b) => Number(Boolean(a.example)) - Number(Boolean(b.example)) || String(b.date).localeCompare(String(a.date)));
	const real = rows.filter((r) => !r.example);
	const table = document.getElementById('board');

	table.tHead.innerHTML = `<tr>
		<th scope="col">Agent · model</th>
		<th scope="col">Surface</th>
		<th scope="col">Prompt</th>
		<th scope="col">Date</th>
		<th scope="col">Tester</th>
		<th scope="col">Obeyed</th>
		${T.map((t) => `<th scope="col" class="tech" title="#${t.n} ${esc(t.name)}"><span>${t.n} · ${esc(t.name)}</span></th>`).join('')}
	</tr>`;

	table.tBodies[0].innerHTML = rows.map((r) => {
		const o = r.outcomes || {};
		const obeyed = T.filter((t) => o[t.code] === 'obeyed').length;
		const counted = T.filter((t) => o[t.code]).length;
		return `<tr class="${r.example ? 'is-example' : ''}">
			<th scope="row"><span class="agent">${esc(r.agent)}</span>${r.example ? '<span class="tag-example">Example</span>' : ''}<span class="sub">${esc(r.model)}</span></th>
			<td>${esc(r.surface)}</td>
			<td class="score">${esc(r.prompt)}</td>
			<td class="score">${esc(r.date)}</td>
			<td>${esc(r.tester)}</td>
			<td class="score">${obeyed} / ${counted}${r.warning ? ' <span title="The reply warned about hidden instructions">!</span>' : ''}</td>
			${T.map((t) => cell(t, o[t.code])).join('')}
		</tr>`;
	}).join('');

	table.tFoot.innerHTML = `<tr>
		<td colspan="6">Obey rate across ${real.length} real test${real.length === 1 ? '' : 's'}</td>
		${T.map((t) => {
			const seen = real.filter((r) => r.outcomes?.[t.code]);
			if (!seen.length) return '<td class="hm">–</td>';
			const rate = Math.round((100 * seen.filter((r) => r.outcomes[t.code] === 'obeyed').length) / seen.length);
			return `<td class="hm" title="#${t.n} ${esc(t.name)}: obeyed in ${rate}% of ${seen.length} tests">${rate}%</td>`;
		}).join('')}
	</tr>`;

	const status = document.getElementById('board-status');
	status.textContent = real.length
		? `${real.length} real test${real.length === 1 ? '' : 's'} so far, across ${new Set(real.map((r) => r.agent)).size} agent${new Set(real.map((r) => r.agent)).size === 1 ? '' : 's'}.`
		: 'No real results yet. The first tests run after launch; the row below is an example of the format, not a result.';
}

boot();
render().catch((err) => {
	console.error(err);
	document.getElementById('board-status').textContent = 'The results could not load. Try reloading the page.';
});
