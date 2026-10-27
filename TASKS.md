# TASKS — lab-04 · the Lab on Design System v9 "Day sky"

- Brief: `C:\localhost\projects\agent-honeypot\dispatches\BRIEF-v1-lab-04-day-sky-2026-10-27.md` (v1 + Addendum A).
- Executor: Claude Code on ACO-PC, Opus 5.5 Extra High, agent=claude-code. RUNLOG run `aco-pc-20261027T194427Z`.
- Branch `feat/lab-day-sky-2026-10-27` from `origin/feat/lab-mvp-2026-10-15` @ `e0177ff` (PR #1 is an open draft, so this PR stacks on it).
- Box 12 h from 19:44Z 27 Oct: checkpoint 04:44Z, hard stop 07:44Z 28 Oct.
- Design source: `TJ-Hosting/tj` `feat/iso-day-2026-10-26` @ `bfccfbb` (worktree `C:\localhost\tj-iso`), DS v9 tokens, glass, base, chrome, components.
- Times are wall-clock UTC.

| Step | Status | Start | End | Notes |
|---|---|---|---|---|
| P0 Setup and baseline | done | 19:44 | 20:14 | Store pull ff to e3e01d73; precondition met (tj-build-06 RUN END 09:54Z, P10 RUN END 19:22Z); brief committed to the store (f9240419); worktree made; `gen.ps1 -Check` exit 0 (lab 0/40); Pillow 13 venv `C:\localhost\tools\lab-venv`; Playwright's installer hung unzipping Chromium 1194 under Node 26, so its downloaded zips were unpacked with Windows `tar` (headless OK). Baseline `npm test` 23/23, contrast lowest 4.66:1 (`evidence/lab-04/baseline-test-output.txt`) |
| P1 DS v9 in the Lab | done | 20:14 | 20:35 | Tests first, each seen failing (`evidence/lab-04/tests-seen-failing.md`): contrast by polarity, every selector measured, hub + 404 in; fallback expects `rgba(255, 255, 255, 0.9)`. DS v9 tokens, light glass, Nunito Sans + Great Vibes, nav capsule, night-band footers, CSS day sky on all 10 pages. Gate: fallback ok; contrast home/hub/404 147 measurements, lowest 6.11:1; pages load 10×2 clean; CSP unchanged. Exhibit, samples and tool pages still carry their old page CSS (P4, P5) |
| P2 Art | done | 20:35 | 20:52 | Dark backdrops, objects, card art and textures retired (82 files, `IMAGES.jsonl` rows dropped; pack originals stay). 23 pack images copied into `assets/pack/` at native size with LEDGER provenance (20 Lab pack LP/LM ids, 3 tj pack: clouds H07, browser H03, 404 server E01). New RGBA cut-out kind in `tools/build_images.py`: 24 cut-outs, 96 files, 3.0 MiB. OG cards re-rendered light in Nunito Sans. Clouds scroll in a first-screen layer (their azure shading is too dark to sit fixed under text). New images generated: 0/40 (the Addendum pack covered every need). Home and 404 got their new markup with the art (finished in P3) |
| P3 Home, shell and 404 | done | 20:52 | 20:59 | Hero in tj's layout: live-text lockup (Nunito 900, Great Vibes on "& glass."), lede and both buttons as before, facts as glass pills; the isometric cluster (flask, browser, cube, orbs, honeypot) placed in CSS on a 30-degree trace network, bobbing through `loop()` (still under reduced motion), pointer parallax kept. Sample cards are islands. 404: tj's unplugged server on a light glass panel; it now loads `lab.js`, so its drift pauses in a hidden tab. Evidence `evidence/lab-04/p3/` (1440 + 375, normal + reduced, side by side with tj-hosting.ca). Contrast home + 404 87 measurements, lowest 5.04:1 |
| P4 The three samples | done | 20:58 | 21:03 | humanity-type: glossy blue glass letters (DS v9's isometric blues) on a light glass slab; logo: the mark (SVG and colours unchanged) in a light glass lens, the wordmark set like tj-hosting.ca's; particle-field: its additive sparks only read on dark, so the canvas runs in a framed night screen (L3), `field.js` sizing and pointer now relative to the canvas. `.sample-info` light glass; its eyebrow and title clear the fold toggle (the eyebrows were never measured before). Gate: samples run, reduced-motion still, pause when hidden all ok; contrast 29 measurements, lowest 5.03:1; shots `evidence/lab-04/p4/` |
| P5 The honeypot | pending | | | |
| P6 Visual review | pending | | | |
| P7 Full verification | pending | | | |
| P8 Docs, PR, records | pending | | | |
