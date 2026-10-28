/*
 * A tiny static server for the tests and tools: the repo root, with a GitHub-Pages-style 404.html fallback.
 * Shared by tests/run.mjs and tools/check-sample.mjs (lab-05).
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

export const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.wasm': 'application/wasm', '.glsl': 'text/plain', '.bin': 'application/octet-stream' };

export async function serve(root) {
	const server = createServer((req, res) => {
		let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		if (p.endsWith('/')) p += 'index.html';
		const file = join(root, normalize(p));
		if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
			res.writeHead(404, { 'Content-Type': MIME['.html'] });
			return res.end(readFileSync(join(root, '404.html')));
		}
		res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
		res.end(readFileSync(file));
	});
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	return { server, base: `http://127.0.0.1:${server.address().port}/` };
}
