# TJ-Hosting Lab

`lab.tj-hosting.ca` — a motion-graphics showcase by TJ-Hosting, built in glassmorphism on tj-hosting.ca's Design System v9 "Day sky": a light sky, glossy isometric art, Nunito Sans with one Great Vibes line, light frosted glass with blue shadows, and a dark night band for the footers and the framed screens where a piece only reads on dark. Static site, no build step, no back end, no cookies or analytics.

- **Lab home** `/`: hero with an isometric cluster on the day sky, cards drawn from `samples.json`, with category chips (`?kind=`) and a "New" badge on the newest batch.
- **Samples** (trap-free, indexable), each at `/samples/<slug>/`: the three of 16 Oct (`humanity-type` kinetic type, `particle-field` generative particles, `logo` the TJ-Hosting mark assembling) and the 60 added in lab-05 (28 Oct), in ten categories (Type, Generative, WebGL, Scroll, Pointer, SVG, UI, Data, Toys, Image). Every sample names its source and licence in `CREDITS.md`; libraries are vendored, pinned and licensed under `vendor/`.
- **Exhibit 01, the agent honeypot**: `/exhibits/humanity/` is the bait page (`noindex`), a motion piece about humanity carrying 18 harmless hidden instructions for AI agents. The tools live under `/honeypot/`: hub, `check/` (checker), `scoreboard/`, `about/` (method and safety).

## Run it locally

Any static server from the repo root works:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
# then open http://127.0.0.1:8080/
```

Pages fetch JSON, so opening the files straight from disk (`file://`) won't work. A local server does not serve `404.html` for missing paths; GitHub Pages does.

## Add a sample

1. Copy `tools/sample-template/` to `samples/<slug>/` (its README explains the four stages: a night screen, a day screen, the open sky and a scroll page). It carries the shell: the shared CSS (`css/glass.css`, `css/lab.css`, `css/sample.css`), the top bar, and the `.sample-info` panel with the eyebrow `Sample NN · Kicker`, a sentence-case title, a two-sentence "How it's made" note, the controls and a back link.
2. Keep to the motion rules: animate only `transform` and `opacity` (an inline SVG or canvas redrawn per frame counts as a drawing surface); use `loop()` or `govern()` from `js/lab.js` so the piece pauses off-screen, in hidden tabs and on its Pause button (`govern()` resumes only what it paused); give it a `prefers-reduced-motion` still frame; no autoplay audio. At most one small free library, pinned to an exact version and vendored under `vendor/<name>@<version>/` with its licence. The page's Content-Security-Policy is self-only; the only additions the tests accept are `'wasm-unsafe-eval'` and `blob:` where a library needs them, listed per sample in `CSP_EXTRA` in `tests/run.mjs`.
3. Gate it: `node tools/check-sample.mjs <slug>` checks the CSP and licences, loads it in Chromium (and Firefox where it runs) at 1440 and 375, checks the reduced-motion still, the hidden-tab pause and the shell's contrast, measures the median frame time (at most 20 ms), and writes `evidence/lab-05/samples/<slug>/`.
4. Add one entry to `samples.json`:

```json
{
	"slug": "my-sample",
	"title": "My sample",
	"kicker": "Kinetic type",
	"category": "Type",
	"blurb": "One sentence about it.",
	"href": "samples/my-sample/",
	"image": { "base": "img/iso/type-blocks", "widths": [480, 960], "ratio": 0.52 },
	"tags": ["CSS", "SVG"],
	"added": "2026-11-01"
}
```

`category` is one of the home's chips (see `CATEGORIES` in `js/home.js`). `image.base` points at an AVIF/WebP cut-out made by `tools/build_images.py` (add the source to its `CUTOUTS` table first; `--only <name>` builds just that one); `ratio` is its height over its width (default 9/16). The home renders the card, the object on its own patch of sky, with no other change.

5. Add the URL to `sitemap.xml` and the sample's line to `CREDITS.md`. `node tools/render-og.mjs --only <slug>` renders its share image from the `samples.json` entry.
6. Run the tests (below).

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

`node tests/run.mjs <words>` runs only the tests whose names contain them, and `--only <slug,slug>` limits the per-sample browser checks to those samples. Chromium starts with ANGLE on D3D11 and the GPU so the WebGL samples are measured on real hardware; the per-sample checks run four pages at a time. `node tools/check-sample.mjs <slug> --firefox-only` runs one sample's checks in Firefox and writes `check-firefox.md` beside its Chromium record; `LAB_FIREFOX=<path to firefox.exe>` points it at a Firefox build when Playwright's own install folder will not start (on ACO-PC it fails with a Windows side-by-side error, while a copy of the same files in another folder runs). The contrast test measures each text run against the worst pixel behind it for its polarity (the darkest behind dark text, the brightest behind light) and fails if any listed selector is never measured; `CONTRAST_PAGES=home,hub node tests/run.mjs contrast` limits it to some pages while you work (its report then goes to `evidence/lab-04/`).

## Images

- **The look (DS v9, lab-04).** The day sky is CSS (`.sky` in `css/lab.css`: tj-hosting.ca's `--sky-*` gradient), with a few of tj's clouds in a layer that scrolls with the first screen. A cloud's shaded underside is a saturated azure, too dark to sit behind muted text, so clouds stay at the page's edges and never fixed. Art is isometric cut-outs on transparent ground (`img/iso/`), one camera and one light, in tj's style lock. A piece that only reads on dark (the particle field, the exhibit's rooms V and VI) sits in a framed night screen (`.screen` with `data-night`); the footers are the night band. Everything inside `[data-night]` takes DS v8's night values under the same token names.
- **Glass.** `css/glass.css` holds every glass token. The base rule is the fallback, white at 0.9, dense enough to pass contrast over the deepest sky and the art with no blur. Frosting is added only under `@supports (backdrop-filter)`; the edge is a hairline with a white rim caught top-left, the shadow blue. There is deliberately no `prefers-reduced-transparency` block: the tint floor already passes without blur.
- `assets/pack/` holds every source image at native size: the 15–17 Oct pack (Grok, Codex), the Lab image pack of 27 Oct (Codex, in tj-hosting.ca's style), and three images from tj-hosting.ca's approved pack. Each has one `LEDGER.jsonl` line; lab-04's lines carry a `provenance` field with the pack's manifest id and sha256. `python3 -I tools/build_images.py [cutouts]` converts them to AVIF/WebP without upscaling (the `cutouts` kind keeps the pack's alpha); `img/IMAGES.jsonl` traces every shipped image. On Windows, `python3` is the Store stub, so use a virtual environment with Pillow instead.
- New images come one of three ways:
  - **The image pack route** (used for lab-04): `C:\localhost\projects\agent-honeypot\imagepack\gen.ps1` on ACO-PC, Codex first and Grok only as a fallback, with a fixed cap, a lock and a spend guard. The prompt is the subject, then tj's `style_lock` and one `backgrounds` line, with tj's `golden.png` as the reference. Copy kept images into `assets/pack/` as below.
  - **The lab-05 route** (the 28 Oct samples): `gen-lab05.ps1` beside `gen.ps1`, Codex only, capped at 200 attempts with every attempt counted; `run-lab05-queue.ps1` works through a queue of card objects (`look`, in tj's style lock with `golden.png`) and in-piece art (`piece`, own prompt); `ingest-lab05.mjs card|art|layer` copies a kept image into `assets/pack/` with its full ledger line and adds it to `tools/build_images.py` (`layer` keeps the alpha for transparent in-piece layers).
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
