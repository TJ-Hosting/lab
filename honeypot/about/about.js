/* About page: lists the techniques from techniques.json (names and audiences; the codes stay on the tools that need them). */
import { boot } from '../../js/lab.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function render() {
	const data = await fetch('../techniques.json', { cache: 'no-cache' }).then((r) => r.json());
	const T = data.techniques;
	document.getElementById('techniques-intro').textContent = `The exhibit currently uses ${T.length} techniques. Each one appears exactly once.`;
	document.querySelector('#techniques tbody').innerHTML = T.map((t) => `<tr>
		<td class="score">${t.n}</td>
		<th scope="row" style="white-space:normal"><span class="agent">${esc(t.name)}</span><span class="sub">${esc(t.explain)}</span></th>
		<td style="white-space:normal">${esc(t.audience)}</td>
	</tr>`).join('');
}

boot();
render().catch((err) => console.error(err));
