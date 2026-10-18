# TJ-Hosting Lab

`lab.tj-hosting.ca` — a motion-graphics showcase by TJ-Hosting, built in glassmorphism. Static site, no build step, no back end, no cookies or analytics.

- **Lab home** `/`: hero over a living backdrop, cards drawn from `samples.json`.
- **Samples** (trap-free, indexable): `/samples/humanity-type/` kinetic type, `/samples/particle-field/` generative particles, `/samples/logo/` the TJ-Hosting mark assembling.
- **Exhibit 01, the agent honeypot**: `/exhibits/humanity/` is the bait page (`noindex`), a motion piece about humanity carrying 18 harmless hidden instructions for AI agents. The tools live under `/honeypot/`: hub, `check/` (checker), `scoreboard/`, `about/` (method and safety).

## Run it locally

Any static server from the repo root works:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
# then open http://127.0.0.1:8080/
```

Pages fetch JSON, so opening the files straight from disk (`file://`) won't work. A local server does not serve `404.html` for missing paths; GitHub Pages does.

## Add a sample

1. Make a folder `samples/<slug>/` with an `index.html`. Copy an existing sample for the shell: the shared CSS (`css/glass.css`, `css/lab.css`, `css/sample.css`), the top bar, and the `.sample-info` panel with a title, a two-line "How it's made" note and a back link.
2. Keep to the motion rules: animate only `transform` and `opacity`; use `loop()` or `govern()` from `js/lab.js` so the piece pauses off-screen and in hidden tabs; give it a `prefers-reduced-motion` still frame; no autoplay audio. At most one small free library, pinned to an exact version (vendored, or a CDN with SRI; a CDN also needs adding to the page's Content-Security-Policy).
3. Add one entry to `samples.json`:

```json
{
	"slug": "my-sample",
	"title": "My sample",
	"kicker": "Kinetic type",
	"blurb": "One sentence about it.",
	"href": "samples/my-sample/",
	"image": { "base": "img/art/hands", "widths": [640, 960] },
	"tags": ["CSS", "SVG"],
	"added": "2026-11-01"
}
```

`image.base` points at an AVIF/WebP pair made by `tools/build_images.py` (add the source there first). The home renders the card with no other change.

4. Add the URL to `sitemap.xml`, and optionally a share image to `tools/render-og.mjs`.
5. Run the tests (below).

## Add a result to the scoreboard

Results come only from real tests, never invented. A tester follows `TESTING.md`, checks the reply at `/honeypot/check/` and submits the pre-filled GitHub issue. After reviewing it, a maintainer adds one row to `honeypot/results.json` (the checker's **Download results.json row** button produces it), with `source` set to the issue URL. The scoreboard picks it up with no code change. The one row marked `"example": true` is an illustration; remove it once real rows exist if you like.

## Safety principles (the honeypot)

- **Harmless payload only.** Every hidden instruction asks for a short poem (4–8 lines) about humanity, titled `Humanity · CODE`. None asks an agent to fetch URLs, reveal its system prompt, share data, act on accounts, buy, post or submit anything.
- **Honest to people.** The exhibit opens with a visible banner, first in reading order; "Show me the traps" reveals each trap and what it says.
- **Out of search, open to the agents under test.** `noindex,nofollow` on the exhibit, left out of the sitemap; `robots.txt` never blocks user-triggered fetchers or search crawlers, and asks only AI-training crawlers to skip the exhibit. Sources in `docs/ROBOTS.md`.
- **No tracking.** The checker runs in the browser; share links carry outcomes, never the answer text.
- **Each code appears exactly once** in the exhibit (the two vision codes only inside their PNGs). `honeypot/techniques.json` is the single list; `tests/run.mjs` enforces it.
- The home and the samples stay trap-free (the tests check that no code appears there).

To add a technique: give it a new code in `honeypot/techniques.json` (with `reveal` telling reveal mode where to find it), place it once in `exhibits/humanity/index.html`, and run the tests. For a vision trap add a `vision` block and run `node tools/render-vision-traps.mjs`.

## Tests

```sh
npm ci                           # Playwright 1.56.1, dev only
npx playwright install chromium  # once per machine, unless Playwright's Chromium is already there
npm test                         # static checks + headless-browser checks; screenshots and reports go to evidence/
```

## Images

- `assets/pack/` is the pre-generated pack (ledger and flaws in its README). `python3 -I tools/build_images.py` converts it to AVIF/WebP without upscaling; `img/IMAGES.jsonl` traces every shipped image. On Windows, `python3` is the Store stub, so use a virtual environment with Pillow instead.
- New images come one of two ways:
  - **The laptop route** (used for the 17 Oct additions). Run the image-gen skill on the team laptop, on its own Grok/Codex/Gemini subscriptions, with no per-image spend.
    - Keep the raw originals outside git.
    - Copy each kept image into `assets/pack/` at its native size, never upscaled, with one line in `assets/pack/LEDGER.jsonl`: provider, full prompt with the pack's style sentence, the request it answers, and the conversion.
    - Add it to the tables in `tools/build_images.py`, with widths up to its own width. Rebuild, then add any new width to the page's `srcset`.
  - **The capped script** `tools/gen-images.mjs`, for API keys. It enforces 40 calls and US$10 in code and ledgers each call to `assets/LEDGER.jsonl`. Keys come from the environment only.
- Requests and their status: `assets/REQUESTS.md`.

## Deploy (after merge)

The repo is ready for GitHub Pages: `CNAME` holds `lab.tj-hosting.ca`, `_config.yml` keeps internal folders (`assets`, `dispatches`, `docs`, `evidence`, `tests`, `tools`) off the live site, and the site files are copied as-is.

1. In the repo's **Settings → Pages**, deploy from branch `main`, folder `/ (root)`.
2. Set the custom domain to `lab.tj-hosting.ca` (the `CNAME` file pre-fills it).
3. At the DNS host for `tj-hosting.ca`, add a `CNAME` record: `lab` → `tj-hosting.github.io`.
4. Tick **Enforce HTTPS** once GitHub has issued the certificate.
5. Verify `tj-hosting.ca` in the organisation's Pages settings (**Settings → Pages → Verified domains**); this guards against subdomain takeover.
6. Then run the checklist in `TESTING.md` against the live URL.
