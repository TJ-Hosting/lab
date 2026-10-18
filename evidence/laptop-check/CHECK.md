# Laptop check (lab-02), BANE-VICTUS-TOP, 18 Oct 2026 UTC

Run by agent=claude-code (opus-5.5 xhigh) for Aco, on branch `feat/lab-mvp-2026-10-15` from `ae57e46`. Windows 11, Node 24.21.0, Playwright 1.56.1.

## npm test

| Run | Result | Record |
|---|---|---|
| Cloud, 16 Oct (headless Chromium, Linux) | 23/23 | `evidence/test-output.txt` @ `ae57e46` |
| Laptop baseline, 18 Oct 00:19Z (headless Chromium 141, Playwright's build 1194) | **22/23**: test 10 (images manifest) failed | `baseline-test-output.txt` |
| Test 10 alone after the fix | pass (126 shipped images, 78 referenced paths) | — |

Test 10 failed only on Windows: its folder walk built paths with `path.join`, which gives `img\bg\...` there, while the manifest uses `img/bg/...`. Fixed in `tests/run.mjs` (the walk now joins with `/`). Contrast in the baseline: 129/129 AA, lowest 4.72:1, as in the cloud run (`before/contrast-before.md`). The trap texts came out byte-identical apart from line endings. The baseline's headless shots are kept in `before/` as the "before" set for the image work.

## Headed Chrome and Edge, 1440 and 375 px

Script: `laptop-check.mjs` (`node evidence/laptop-check/laptop-check.mjs p1`). It drives the **installed** browsers in headed mode, Chrome 155.0.8059.82 and Edge 155.0.4283.45, through the same static server as the tests (with the 404 fallback). The 375 px runs use mobile emulation (touch, mobile viewport). On every page it records page errors, console errors and warnings, failed requests, HTTP errors, `securitypolicyviolation` events (CSP) and horizontal overflow. Results: `p1/results.json`. Shots: `p1/<browser>/`.

| Check | Chrome 1440 | Chrome 375 | Edge 1440 | Edge 375 | Shots (`p1/<browser>/<name>-<width>.jpg`) |
|---|---|---|---|---|---|
| home (glass on: `backdrop-filter: blur(22px) saturate(1.65)`) | pass | pass | pass | pass | home, home-samples |
| home (glass fallback: solid `rgba(22, 15, 52, 0.9)`, no backdrop-filter) | pass | pass | pass | pass | home-glass-fallback |
| sample humanity-type | pass | pass | pass | pass | sample-humanity-type |
| sample humanity-type (reduced motion: 0 animations, 0 loops running) | pass | pass | pass | pass | sample-humanity-type-reduced |
| sample particle-field | pass | pass | pass | pass | sample-particle-field |
| sample particle-field (reduced motion) | pass | pass | pass | pass | sample-particle-field-reduced |
| sample logo | pass | pass | pass | pass | sample-logo |
| sample logo (reduced motion) | pass | pass | pass | pass | sample-logo-reduced |
| exhibit: banner is the first element, the first Tab lands in it, top 14 px; reveal mode 18/18 items, 18 pins | pass | pass | pass | pass | exhibit-banner, exhibit-reveal |
| checker: sample answer gives LUMEN-R5 and ORCHID-B7 obeyed, GRANITE-S6 flagged; the share link in a fresh page restores all outcomes and the details | pass | pass | pass | pass | checker-result, checker-restored |
| scoreboard (1/1 rows) | pass | pass | pass | pass | scoreboard |
| honeypot hub | pass | pass | pass | pass | hub |
| about page | pass | pass | pass | pass | about |
| `404.html` served at `/no/such/page/` (nested, as GitHub Pages does) | pass† | pass† | pass† | pass† | 404 |

Console under the CSP: **clean** on every page in both browsers. There were no CSP violations, page errors, failed requests, broken assets or horizontal scroll.

† The script first marked the 404 page as failed, because the browser logs the document's own 404 status. That status is the 404 page doing its job. No asset failed: its absolute `/css`, `/js` and `/img` paths all loaded from the nested path. The script now ignores that one line, and the P3 re-run checks the change.

Looked at by eye (Claude): home at 1440 (Chrome) and 375 (Edge), exhibit banner at 375, 404 at 1440, particle-field at 1440. The glass, type and layout render as in the cloud shots. The "–" right of the particle-field top bar is a moving particle, not a stray element.

## Defects

- Fixed: test 10 on Windows (above).
- None found in the site itself.

## P2: images in

**Kept: 15 of the 18 answers.** They went into `assets/pack/` at native size, each with a ledger line; the table and reasons are in `assets/pack/README.md` ("Laptop additions"). **Kept the pack version: 3.**

- **Bokeh:** the new one's glass bubbles read as extra particles behind the particle field; see the first try in `before-after/particle-field-*`, as shot before the revert.
- **Hands:** the new one is the same 1280 px and less clean.
- **Glass city:** two towers carry glyph-like engravings that read as signage.

**New images: 0/40.** Codex was running on the laptop throughout P2 (two `codex.exe` app-server processes since 00:15Z), so under the brief's rule new jobs would have gone to Grok. Grok's 1280 px adds nothing over the pack for these three.

**Build.** `python -I tools/build_images.py photos objects sprites` (Pillow 13.0.0 in `C:\localhost\lab-check-venv`). Outputs from unchanged sources came out byte-identical. The new top widths are bg/aurora 1600, aurora-portrait 1080, prism 1600, honeycomb 1920 and hex-portrait 941; each is the source's own width, and they are added to the pages' `srcset`. `img/IMAGES.jsonl` traces all 136 shipped images; test 10 passes.

**Changes to `tools/build_images.py`:**

- The tables point at the new sources.
- A wrap-safe resize for the foil tile.
- A per-object edge fade, wider for the bee.
- UTF-8 and LF file I/O, because on Windows it read cp1252 and wrote CRLF.
- Compact JSON in the manifest, as committed.

**Output checks** (`image_checks.py`; sheets in `images/`):

| Check | Result |
|---|---|
| Objects on black: outer 8 px alpha | 0 for all six (bee 1/255 after its wider fade) |
| Objects: dark fringe (alpha ≥ 64 and luma < 24, sampled every 2 px of 640) | 0–36 px per object: none visible over white, grey or the aurora (`images/objects-keyed.jpg`) |
| Objects: grey haze | none visible over grey or the aurora. The low-alpha pixels are each object's own glow, plus the cube's caustic pool, kept as light under it |
| Sprite sheets | orbs and sparkles 16/16 cells with content, cell-edge alpha 0 (nothing clipped), no grid lines (`images/sprites-on-grey.jpg`) |
| Holo-foil tile 2×2 | no visible seam (`images/holo-foil-2x2.jpg`). Mean step across the wrap is 13.7/15.6, against 10.2 between two inner columns: the same order as the crinkle |

**Pages changed and fixed:**

- The new bee fills its frame, so its wing was cut at the 375 px viewport edge, where `.bee` hung 30 px off-screen. Fixed in `exhibits/humanity/exhibit.css` (mobile `right: 12px`).
- The exhibit edits touch only that line and four `srcset`s. The payload test (test 20, with 4 and 19) passed after each edit, and `evidence/trap-texts.txt` is unchanged.

**Before/after:** `before-after/<page>[-<anchor>]-<width>.jpg`, with the branch at `a504b50` on the left and this change on the right. They cover home (top, samples, about), exhibit (top, rooms 3–5), hub, 404, logo and particle-field, at 1440 and 375, in headless Chrome 155 (`before-after.mjs`, `image_pairs.py`).
