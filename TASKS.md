# TASKS — agent-honeypot-01 (brief v2) · TJ-Hosting Lab MVP

- Executor: Claude Code on the web (cloud), agent=claude. Branch `feat/lab-mvp-2026-10-15` from `main` @ `6cd0699` (brief v2 + pack commit).
- Started: 2026-10-16 00:05 UTC. Agent budget 16 h (per the launch prompt; the brief says 8 h).
- Times are wall-clock UTC.

| Step | Status | Start | End | Notes |
|---|---|---|---|---|
| 0 Branch, Phase 0, TASKS.md | done | 00:05 | 00:13 | Node 22.22, npm 10.9, Playwright 1.56 + Chromium, PIL (WebP/AVIF), ImageMagick, ffmpeg. `OPENAI_API_KEY`/`GEMINI_API_KEY` not set → no generation, write `assets/REQUESTS.md`. tj-hosting.ca reachable (logo + brand tokens). Price table and crawler UAs recorded from vendor pages. |
| P1 Lab shell + glass system | done | 00:13 | 00:24 | Glass tokens in `css/glass.css` (fallback first, frosted under `@supports`); home renders cards from `samples.json`; pack → AVIF/WebP via `tools/build_images.py` (117 files, no upscaling, manifest `img/IMAGES.jsonl`); fonts self-hosted (OFL). |
| P2 Three motion samples | done | 00:24 | 00:33 | humanity-type (WAAPI), particle-field (Canvas 2D + sprite atlases, luma-keyed), logo (SVG; TJ glyph from tj-hosting.ca favicon.svg). All pause off-screen/hidden; reduced motion = still frame. |
| P3 Honeypot exhibit | done | 00:33 | 00:40 | `/exhibits/humanity/` "Made of Many", `noindex,nofollow`, banner first. 18 techniques in `honeypot/techniques.json` (16 in page text, 2 vision PNGs rendered by `tools/render-vision-traps.mjs`). Reveal mode reads each trap from the DOM; pins + panel. |
| P4 Checker | done | 00:40 | 00:47 | `/honeypot/check/`: logic in `checker.js` (pure, Node-importable), proposes obeyed/flagged/ignored per code, tester confirms; hash share link; pre-filled issue form `.github/ISSUE_TEMPLATE/result.yml`. Verified: example with 2 poems + 1 warning → exactly those outcomes; link restores them. |
| P5 Scoreboard, about, test kit | todo | | | |
| P6 Images | todo | | | |
| P7 Deploy config + README | todo | | | |
| Evidence + tests | todo | | | |
| Result file + PR | todo | | | |
