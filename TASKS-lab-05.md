# TASKS — lab-05: 60 new samples (run file)

## Override A (Aco, 28 Oct; keep it on every resume)

It replaces the brief's branch lines, Step 0.4, §7's PR line and §15. PR #2 was merged into PR #1's branch `feat/lab-mvp-2026-10-15` (`276e880`) on 28 Oct 01:11Z, and merging PR #1 into `main` now deploys lab.tj-hosting.ca. So:
- Work in `C:\localhost\tj-lab-day` on **`feat/lab-05-samples-2026-10-28`**, created from `origin/feat/lab-mvp-2026-10-15` (`276e880`). Commit only on that branch. Never commit to `feat/lab-mvp-2026-10-15`, `feat/lab-day-sky-2026-10-27` or `main`.
- After the first push, open ONE draft PR: `feat/lab-05-samples-2026-10-28` into `feat/lab-mvp-2026-10-15` (base `main` if PR #1 has merged by then). Never mark it ready, never merge it. Leave PRs #1, #2 and #3 untouched.
- Logged as a `[scope]` note in the RUNLOG (02:41:07Z). RUNLOG estimates are time only: no `-EstTok`.
- The branch has no upstream (unset on purpose), so a bare `git push` can't reach PR #1's branch: push with `git push -u origin feat/lab-05-samples-2026-10-28` the first time.

## Brief and run

- Brief: `C:\localhost\projects\agent-honeypot\dispatches\BRIEF-v2-lab-05-sixty-samples-2026-10-27.md` (store `3e27cf0c`, pulled to `18fcd69a`).
- RUNLOG run `aco-pc-20261028T024107Z` in `C:\localhost\projects\agent-honeypot\RUNLOG.md`; questions there.
- Builder brief: `C:\localhost\projects\agent-honeypot\dispatches\ref\lab-05\BUILDER-BRIEF-lab-05.md`.
- Resume line (after a usage-limit reset): `Resume lab-05: read TASKS-lab-05.md and continue the brief from where it stopped.` Then §5 "Every start": append a WAIT line below, `git status`, the image job folders, local vs origin, `ANSWERS.md` and `answers\*.md`.

## Status

| Part | State | Started (Z) | Ended (Z) | Est | Notes |
|---|---|---|---|---|---|
| P0 Setup | done | 02:28 | 02:50 | 30m | see below |
| P1 Shared infrastructure | done | 02:50 | 03:12 | 1h15m | see below |
| P2 Images and assets | in progress | 03:04 | | 1h15m | card queue running in the background |
| P3 Build the 60 | in progress | 02:58 | | 5h00m | wave 1 building (S01, S06, S16, S22); 0/60 gated |
| P4 Quality pass 1 | todo | | | 1h00m | |
| P5 Quality pass 2 + review | todo | | | 1h00m | |
| P6 Quality pass 3 | todo | | | outside | starts no later than 24 h − (0.75 h + 2 × suite) |
| P7 Integrate and report | todo | | | 45m | |

Re-plan check at 9 h active: fewer than 40 gated → drop P6, cut P5 to assets only.

## P0 — confirmed (28 Oct, ACO-PC)

- Store: `git pull --ff-only origin main` in `C:\localhost\projects`: `47c3c607..18fcd69a`, fast-forward. Last 14 days of `agent-honeypot/` commits read (lab-02 to lab-05 brief).
- Preconditions: the only `.runlog-current` under `C:\localhost\projects` is dog-hq's (run `aco-pc-20261024T183937Z`), an idle open run waiting on Aco's answers (Aco). Codex processes running are the desktop app's idle `app-server` and `exec-server` (since 25–26 Oct), not a job; Aco: nothing else runs on this PC. Disk C: 103.9 GB free.
- Worktree clean; `git fetch origin`; branch created per Override A at `276e880` (its tree equals `5317086`: `git diff --stat 5317086 276e880` is empty).
- Tools: Node v26.12.1; `npm ci` (Playwright 1.56.1, 0 vulnerabilities); Chromium 141.0.7390.37 headless launches; with `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist` WebGL runs on the GPU (ANGLE AMD Radeon D3D11), without them on SwiftShader. Pillow 13.0.0 in `C:\localhost\tools\lab-venv`. codex-cli 0.164.0, logged in with ChatGPT.
- **Firefox: downloaded, not runnable here.** Playwright's installer hung unzipping (0 CPU after the download, as lab-04 saw), so `firefox-1495` was unpacked with Windows `tar` (59 entries, files identical to the zip). Claude Code's sandbox won't execute it: side-by-side error "dependent assembly mozglue could not be found" (its manifests are correct), and Git Bash says "Permission denied". Running it outside the sandbox was refused by the auto-mode classifier. RUNLOG QUESTION 1 `[env]`; default: gates in Chromium only, Firefox listed as not tested.
- `-ExecutionPolicy Bypass` on a child `powershell` is refused by the classifier; the Process scope is already Bypass, so store scripts run with `& <script>`.
- Models: lead `claude-opus-5-5` (this session); a trivial sub-agent call with `model: sonnet` reported `claude-sonnet-5-5`. No custom agent types under `%USERPROFILE%\.claude\agents`, so builders are the built-in general-purpose agent on Sonnet.
- `gen-lab05.ps1` (copy of lab-04's `gen.ps1`): ledger `lab05`, cap 200, Codex only; the cap counts every attempt (every ledger row, and a dead process's LOCK as an `unknown` row); `-DryRun [-Simulate n]`. `-Check` exit 0 (0/200). Dry runs: `-Simulate 200` → `REFUSED: cap reached (200 / 200 attempts)`, exit 3; `-Simulate 199` → would run attempt 200/200; `-Order grok` → refused.
- Baseline `npm test`: **23/23 in 512 s**, contrast 381/381 AA, lowest 5.03:1 (`evidence/lab-05/baseline-test-output.txt`). The re-rendered tracked evidence was restored to HEAD; the final suite regenerates it.
- Library versions on npm (registry, 28 Oct): all pinned versions exist except `blotter@0.1.0` (npm's `blotter` is another package; the pick is cdnjs's Blotter 0.1.0, checked when vendoring S02). Licences as npm declares them: animejs MIT, three MIT, @paper-design/shaders Apache-2.0, gsap "Standard no charge", atropos MIT, matter-js MIT, liquid-glass-js MIT, number-flow MIT, canvas-confetti ISC, cobe MIT, vizzu Apache-2.0, ogl Unlicense, vanilla-tilt MIT, page-flip MIT, @meteocons/svg MIT (0.1.0).
- DS v9 source: `TJ-Hosting/tj` PR #10 is merged at `bfccfbb` (`C:\localhost\tj-iso` is at `bfccfbb`), so no newer head.

## P1 — done (28 Oct 02:50–03:12Z)

- **Template in the new design:** `tools/sample-template/` (index.html with four stages: A night screen, B day screen, C open sky, D scrolling page; piece.js on `loop()` with a reduced-motion still; piece.css; README). Shared CSS: `.piece-screen`, `.stage--screen`, `.scroll-page` in `css/sample.css` (particle-field's fixed window, made shared); `.screen--day` in `css/lab.css` (the night screen's frame in DS v9 light glass: the cards' sky well, the nav capsule's glass bar, the lifted-glass shadow).
- **Builder brief:** store `agent-honeypot\dispatches\ref\lab-05\BUILDER-BRIEF-lab-05.md`.
- **Home:** `samples.json` entries carry `category` (the three existing: Type, Generative, SVG). Filter chips (All first, one per category with its count; DS v9 `.btn--sm .btn--ghost` with the pressed state; one sideways-scrolling row at ≤ 560 px; the choice kept in `?kind=`), a live count line, a "New" badge (tj's road badge as a pill) on the newest batch by `added`, lazy cards (lazy images plus `content-visibility` on the art wells only, so the cards' blue shadows aren't clipped). Card stagger runs along a row of three.
- **Tests:** `tests/run.mjs` discovers samples from `samples.json` (pages, trap-free, indexing, run/pause, contrast); `--only <slug,…>` (also `npm test --only …` via `npm_config_only`) narrows the per-sample checks and skips the exhibit/checker/scoreboard browser tests; `CSP_EXTRA` map with exact-policy check; new test "published paths" (`_`/`.` segments under `vendor/` and `samples/`, vendored folders named `<lib>@<version>` with a LICENSE); raster images in sample folders must be traced; third-party requests fail any page; a requestAnimationFrame counter makes the reduced-motion and hidden-tab checks see library loops; per-sample browser checks run 4 at a time (`LAB_PARALLEL`); Chromium on the GPU (ANGLE D3D11); per-test times in the output. Contrast measuring moved to `tests/contrast.mjs`, the server to `tests/serve.mjs` (shared with the checker).
- **`tools/check-sample.mjs <slug> [--no-perf] [--no-firefox]`:** static CSP/third-party/trap/storage/path/raster/licence-header checks; Chromium (and Firefox when it can start) at 1440 and 375: errors, failed or third-party requests, overflow, screenshots (JPEG ≤ 300 KB, overwritten); reduced-motion still; hidden-tab pause and resume; the shell's text contrast by polarity; median frame time over 5 s with the WebGL renderer (software GL → headed retry → "not measured"); `check.md` + a contact sheet. On the three existing samples: PASS, 16.7 ms median, about 38 s a run.
- **Done-evidence:** `npm test -- --only humanity-type,particle-field,logo` 20 passed, 4 skipped, 0 failed in 74 s (`evidence/lab-05/p1-only-3.txt`). Full `npm test` 24/24 in 167 s (`p1-full.txt`; baseline was 23 tests in 512 s). Projection at 63 samples: serial per-sample cost measured at about 37 s (`p1-only-3-serial.txt`: load 2.8 + run 12.5 + pause 8.4 + contrast 13.3); 60 × 37 s ÷ 4 parallel × 1.5 contention ≈ 14 min, plus 167 s ≈ **17 min ≤ 20 min**. `gen-lab05.ps1` refuses attempt 201 in a dry run (P0). Home chips: the home test clicks a category chip, checks the filtered count and the address, and checks no overflow, at 1440 and 375.
- `tools/build_images.py --only <names>` builds just the named images (new images never re-encode the shipped ones); marked lab-05 blocks in `PHOTOS` and `CUTOUTS`.

## Decisions (mine, reversible; reported in the result)

- D1 The cap counts attempts, not finished images (brief §1 "every attempt counts", CMHS decision note). Quota refusals are attempts too.
- D2 SVG drawing surfaces: an inline `<svg>` whose geometry is redrawn by script each frame counts as a drawing surface like a canvas (S29, S30, S31 need it); HTML and CSS properties stay transform/opacity only.
- D3 Gates run in Chromium with the GPU flags above (perf and screenshots); Firefox per QUESTION 1.
- D4 `new` badge: computed on the home from `added` (the newest batch date), so no extra field in `samples.json`.
- D5 Sample numbers: the three existing samples are 01–03, so S01–S60 are Sample 04–63, in shortlist order.
- D6 Card objects use widths 400/800 (the card well is 400 px wide on desktop, 92vw on phones) and pack names `lab05-<slug>.png`; in-piece art ships as `img/art/<slug>-<name>-<w>.webp/avif`.
- D7 Vendored folders are `vendor/<lib>@<version>/` at the repo root; `@paper-design/shaders` is `vendor/paper-design-shaders@0.0.82/`. GSAP's package ships no LICENSE file: `LICENSE.md` holds its Standard "No Charge" licence text fetched from gsap.com on 28 Oct. OGL's repo ships none either: `LICENSE.txt` holds the Unlicense text from unlicense.org, with the package.json declaration at commit `b9e653c`.
- D8 The full suite and the checker launch Chromium with `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`.

## Samples (S## · Sample NN · slug · category · reuse · library · in-piece images · state · notes)

| S | NN | slug | category | reuse | library | img | state | notes |
|---|---|---|---|---|---|---|---|---|
| S01 | 04 | split-flap-board | Type | adapt-code (MIT, CodePen Debug view) | none | 0 | **committed 03:23Z** | open sky, navy board object; 16.7 ms; card C01 |
| S02 | 05 | liquid-distort-headline | Type | adapt-code | blotter@0.1.0 | 0 | todo | |
| S03 | 06 | star-trail-text | Type | adapt-code (MIT, gist .block) | none | 0 | **committed 03:30Z** | night screen; stars.js (third-party pen) not used; 16.7 ms; card C03 |
| S04 | 07 | glitch-headline | Type | adapt-code (Apache-2.0, gui-challenges 82317d0) | none | 0 | **committed 04:07Z** | open sky; animated clip-path replaced by still band clips + transform; 16.7 ms; card C04 |
| S05 | 08 | scramble-titles | Type | adapt-code | animejs@4.4.0 | 0 | todo | |
| S06 | 09 | coral-ink | Generative | rebuild-from-idea (CodePen 403) | none | 0 | **committed 03:17Z** | day screen; 16.7 ms GPU; card C06; Firefox not run (Q1) |
| S07 | 10 | slime-network | Generative | rebuild-from-idea | none | 0 | **committed 03:36Z** | night screen; about 14,400 agents, sheds agents if over 12 ms; 16.7 ms; card C07 |
| S08 | 11 | streamline-poster | Generative | adapt-code | none | 0 | todo | |
| S09 | 12 | contour-map | Generative | rebuild-from-idea (CodePen blocked) | none | 0 | **committed 04:07Z** | day screen, map key labelled illustrative; 16.7 ms; card C09 |
| S10 | 13 | dither-flow-ink | WebGL | adapt-code (MIT, b154ad8) | none | 0 | committed (see git) | day screen, navy/royal dots; Canvas 2D still without WebGL2; 16.7 ms; card C10 |
| S11 | 14 | glass-orbs | WebGL | adapt-code | three@0.186.1 | 0 | todo | |
| S12 | 15 | shader-swatchbook | WebGL | adapt-code | @paper-design/shaders@0.0.82 | 0 | todo | |
| S13 | 16 | liquid-metal-monogram | WebGL | adapt-code | @paper-design/shaders@0.0.82 | 1 | todo | uses img/brand/tj-mark.svg, no monogram image |
| S14 | 17 | shape-shifter | WebGL | adapt-code | three@0.186.1 (not 0.162.0: brief §2) | 0 | todo | |
| S15 | 18 | gpu-fluid | WebGL | adapt-code (MIT, commit a2d2929) | none | 0 | **committed 03:43Z** | night screen; CSS poster if no float targets; 16.7 ms; card C15 |
| S16 | 19 | scroll-zoom-tunnel | Scroll | rebuild-from-idea (CodePen 403) | none | 0 | **committed 03:31Z** | scroll page; still grid without scroll timelines (Firefox fallback); 16.7 ms; card C16 |
| S17 | 20 | glass-card-flow | Scroll | adapt-code (Apache-2.0 per the site's footer and About; no public repo) | none | 0 | **committed 04:04Z** | open sky; flat row without scroll timelines (Firefox fallback); 16.7 ms; card C17 |
| S18 | 21 | horizontal-journey | Scroll | adapt-code | none | 0 | todo | |
| S19 | 22 | stacking-plan-cards | Scroll | adapt-code | none | 0 | todo | |
| S20 | 23 | request-in-ms | Scroll | adapt-code | none | 0 | todo | |
| S21 | 24 | dawn-to-night | Scroll | adapt-code | none | 0 | todo | |
| S22 | 25 | tear-the-curtain | Pointer | rebuild-from-idea (CodePen 403) | none | 0 | **committed 03:38Z** | day screen; 16.7 ms; card C22; its builder tried a spoofed user agent on CodePen once and the harness blocked it (brief §8a now forbids it) |
| S23 | 26 | dot-mesh-hero | Pointer | rebuild-from-idea (CodePen and its Debug view 403) | none | 0 | **committed 03:38Z** | day screen, glass card; 16.7 ms; card C23 |
| S24 | 27 | glass-jellyfish | Pointer | rebuild-from-idea (CodePen blocked) | none | 0 | **committed 04:20Z** | night screen; hero + 4 small jellyfish; 16.7 ms; card C24 |
| S25 | 28 | halftone-dissolve | Pointer | adapt-code | gsap@3.13.0 | 2 | todo | |
| S26 | 29 | lamp-cord-theme | Pointer | adapt-code | none | 0 | todo | |
| S27 | 30 | glass-diorama-card | Pointer | adapt-code | atropos@2.0.2 | 5 | todo | |
| S28 | 31 | skill-chips | Pointer | rebuild-from-idea | matter-js@0.20.0 | 0 | todo | |
| S29 | 32 | brand-colour-sphere | SVG | rebuild-from-idea (CodePen 403) | none | 0 | **committed 03:49Z** | open sky; SVG polygons redrawn per frame (D2); full hue wheel includes violet/pink as artwork; 16.7 ms; card C29 |
| S30 | 33 | wavy-lines-hero | SVG | adapt-code | none | 0 | todo | |
| S31 | 34 | icon-micro-set | SVG | adapt-code | gsap@3.13.0 | 0 | todo | |
| S32 | 35 | weather-window | SVG | adapt-code | none (Meteocons SVGs as its one library, if licence confirmed) | 0 | todo | |
| S33 | 36 | liquid-glass-lens | UI | adapt-code | liquid-glass-js@0.1.0 | 1 | todo | |
| S34 | 37 | pricing-rolling-digits | UI | adapt-code | number-flow@0.6.2 | 0 | todo | |
| S35 | 38 | glass-hero-kit | UI | adapt-code | none | 0 | todo | |
| S36 | 39 | integration-beams | UI | adapt-code (MIT, magicui efe76fc) | none | 0 | **committed 03:55Z** | open sky; "Sample content · no real connections"; 16.7 ms; card C36 |
| S37 | 40 | bento-grid | UI | adapt-code (MIT, magicui efe76fc) | none | 0 | **committed 04:18Z** | open sky; CSS loops in [data-motion]; tile uses overflow: clip (focus scroll bug); 16.7 ms; card C37 |
| S38 | 41 | mega-menu | UI | rebuild-from-idea | none | 0 | todo | |
| S39 | 42 | testimonial-wall | UI | adapt-code | none | 0 | todo | |
| S40 | 43 | browser-frame-showcase | UI | adapt-code | none | 4 | todo | wordless layout art |
| S41 | 44 | focus-trail-form | UI | adapt-code | none | 0 | todo | |
| S42 | 45 | publish-button | UI | adapt-code | canvas-confetti@1.9.4 | 0 | todo | |
| S43 | 46 | edge-network-globe | Data | adapt-code | cobe@2.0.1 | 0 | todo | arcs labelled illustrative |
| S44 | 47 | clock-wall | Data | rebuild-from-idea | none | 0 | **committed 04:04Z** | open sky; 102 WAAPI clock faces, local 24 h time; 16.7 ms; card C44 |
| S45 | 48 | wind-snapshot | Data | adapt-code | wind-gl (repo dist at a commit SHA) | 0 | todo | data frames only if licence confirmed |
| S46 | 49 | epicycle-machine | Data | adapt-code (MIT, 7bb6c56; maths only) | none | 0 | committed (see git) | open sky; TJ letterform from tj-hosting.ca's favicon path; 16.7 ms; card C46 |
| S47 | 50 | pendulum-wave | Data | adapt-code (MIT, a0ea040; maths only) | none | 0 | **committed 04:22Z** | open sky, 3D frame; sound off until pressed; 16.7 ms; card C47 |
| S48 | 51 | chart-story | Data | adapt-code | vizzu@0.18.0 | 0 | todo | CSP 'wasm-unsafe-eval' |
| S49 | 52 | glass-sandbox | Toys | rebuild-from-idea | none | 0 | todo | |
| S50 | 53 | marble-harp | Toys | rebuild-from-idea | none | 0 | todo | |
| S51 | 54 | planet-maker | Toys | rebuild-from-idea | none | 0 | todo | |
| S52 | 55 | glass-mandala | Toys | adapt-code | none | 0 | todo | |
| S53 | 56 | ascii-sculpture | Toys | adapt-code | three@0.186.1 | 0 | todo | |
| S54 | 57 | lantern-pond | Image | adapt-code | none | 1 | todo | |
| S55 | 58 | transition-slider | Image | adapt-code | ogl@1.0.11 | 3 | todo | |
| S56 | 59 | liquid-hover-gallery | Image | adapt-code | three@0.186.1 | 2 | todo | |
| S57 | 60 | relief-light-board | Image | adapt-code | ogl@1.0.11 | 3 | todo | |
| S58 | 61 | lenticular-print | Image | adapt-code | vanilla-tilt@1.8.1 | 2 | todo | |
| S59 | 62 | frosted-window | Image | adapt-code | ogl@1.0.11 | 1 | todo | |
| S60 | 63 | page-turn-lookbook | Image | adapt-code | page-flip@2.0.7 | 3 | todo | wordless layout art |

## Swaps

None yet.

## Images (gen-lab05.ps1, cap 200 attempts)

0 / 200 attempts. Queue and results: below as P2 starts.

## Defects (P4) and improvements (P5, P6)

- [P4] "How it's made" notes too long (about seven lines at 375): S16, S06, S01, S03, S22, S07. Trim to two sentences. The builder brief now says so (§8a).
- [P4] Titles: builders wrote Title Case ("Coral Ink Reactor"); the Lab uses sentence case ("Particle field"). Normalise every new sample's h1, `<title>`, og:title and samples.json title in one sweep.
- [P5] S15: the dye reads murky steel-blue on navy; raise saturation and brightness toward cyan, azure and white so it reads as "liquid light".
- [P4] S44: "How it's made" says "a pose table I drew"; page copy speaks for the Lab, not a builder ("a pose table drawn for each digit").
- [P5] S44: idle clocks show cyan hands at an angle that compete with the digits; dim or park the hands of clocks that are not part of a digit so the time reads at a glance.
- [P5] C28 (skill chips card) looked like capsule pills; queued C28b (rounded glass tags).
- [P5] S47: the tick fires on every centre crossing (about 40 a second) at an untuned level; thin it (e.g. one voice per crossing of the middle bob group, or a rate cap) and set a gentle level.
- [P5] S10: the word sits in a mostly empty screen; add faint ambient dithered currents across the field so the whole window lives.
- [P5] S46: the drawn trail is thin and faint on the sky; bolder royal trail with a brighter pen tip.
- [P5] S36: at rest the beams are often between runs; keep at least two in flight so the idle hub always shows light moving.
- [P5] S22: the curtain is subtle in a still; stronger folds or a corner already torn so the twist reads at a glance.
- [P5] C04 (glitch card) reads as a stacked block; regenerate with clearer offset strips if the budget allows.
- [P5] C07 (slime tray) and C06 (petri dish) have similar silhouettes on the home; regenerate C07 as a different object if the budget allows.

## Not tested (so far)

Firefox (QUESTION 1), Safari and iOS, real phones, other GPUs.

## Time log (UTC)

- Times are UTC, from the RUNLOG and from git commit times (EDT + 4 h). 02:28 session start (P0). 02:41 RUNLOG start. 02:50 P0 end, P1 start. 02:58 wave 1 builders launched. 03:04 P2 pilot (C01, C24: both kept). 03:09 card queue (58) started. 03:12 P1 committed (`b643e63`); PR #4 opened (draft, base feat/lab-mvp-2026-10-15). Samples committed: S06 03:17, S01 03:23, S03 03:30, S16 03:31 (pushed), S07 03:36, S22 and S23 03:38 (pushed), wave check 03:39-03:41 (`npm test -- --only` the 7 new samples: 20 passed, 0 failed, 4 skipped in 115 s, `evidence/lab-05/wave-1-2.txt`; about 11 s per sample in parallel, so the full suite at 63 projects to about 14 min), S15 03:43, S29 03:49, S36 03:55 (pushed), S17 and S44 04:04 (pushed), S04 and S09 04:07 (pushed), S37 04:18, S24 04:20 (pushed), S47 04:22. Card queue: 58 of 58 attempts done by 04:22.
