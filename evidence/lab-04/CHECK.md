# lab-04 P7: full verification

ACO-PC, 27 Oct 2026, after the last review fix (commit `2730de9`). Local servers on 127.0.0.1: the suite's own (with the Pages-style 404 fallback) and `python -m http.server 8090` for development shots.

| Check | Result | Where |
|---|---|---|
| `npm test`, once, in full (22:14Z) | **23/23** | `evidence/test-output.txt` and the suite's screenshots in `evidence/` |
| Contrast, 10 pages at 1440×900 and 375×812, every text run against the worst pixel for its polarity | **381/381 AA** (219 at 1440, 162 at 375; 334 dark text, 47 light), every selector measured. **Lowest 5.03:1**: the 404's large "404" in accent blue (needs 3:1), and particle-field's back link at 375 over its frosted panel (needs 4.5:1) | `evidence/contrast.md`, `evidence/contrast.json` |
| Headed installed Chrome 156.0.8078.48 and Edge 156.0.4314.42, 1440 and 375, every page | **64/64** checks pass: <br>• glass on and fallback (`rgba(255, 255, 255, 0.9)`, no blur); <br>• home and exhibit with reduced motion (0 animations, 0 loops) and Nunito Sans and Great Vibes loaded; <br>• the three samples animating and still under reduced motion; <br>• the exhibit (banner first element, first Tab in the banner, reveal 18/18 items and pins); <br>• the checker (two obeyed, one flagged, the share link restores them); <br>• the scoreboard, hub, about and 404 (at `/no/such/page/`). <br>Every check also requires no console error or warning, no CSP violation, no failed request and no horizontal scroll. | `evidence/laptop-check/lab-04/results.json`, shots in `chrome/` and `msedge/` |
| Reduced motion | The suite (samples: nothing running) and the headed check (home and exhibit: 0 animations, 0 loops). The home hero's bob runs through `loop()`, which never starts under reduced motion. | as above; `evidence/lab-04/p3/*-rm.jpg` |
| Pause when hidden | The suite (particle-field loop frames stop, CSS paused, WAAPI samples pause); the home hero loops and the 404's drift checked in P3 | `evidence/test-output.txt` |
| No failed requests, no horizontal scroll | The suite: 10 pages × 2 widths clean; the headed check: same, in both browsers | as above |
| The honeypot | Codes exactly once, vision PNGs match the lock, banner first, noindex, robots, sitemap, payload review (each trap asks only for the poem), trap-free pages: all pass. `evidence/trap-texts.txt` is identical to the base (the 18 traps, read live from the page, say the same) | `evidence/test-output.txt` |
| Before and after | 37 pairs: every page at 1440 and 375, at the scroll positions where it changed (before: `e0177ff`, after: this branch; headless installed Chrome) | `evidence/lab-04/before-after/`, script `evidence/lab-04/before-after.mjs` |
| Beside tj-hosting.ca's DS v9 | Home at 1440 and 375 next to tj's own shots | `evidence/lab-04/p3/side-by-side-home-*.jpg` |
| Images | 111 shipped files, every one traced (`img/IMAGES.jsonl` → `assets/pack/LEDGER.jsonl`). New: 3/40 through `gen.ps1` (Codex 3, Grok 0) | `assets/pack/LEDGER.jsonl` |

Not tested: Firefox, Safari, real phones (375 is Chrome's emulation), GitHub Pages and the live domain, and real AI agents against the exhibit (`TESTING.md`).
