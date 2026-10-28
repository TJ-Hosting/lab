# lab-04: each new or changed test, seen failing first

Headless Chromium 141 (Playwright 1.56.1), local server from `tests/run.mjs`, ACO-PC, 27 Oct 2026.
`CONTRAST_PAGES=<pages>` limits the contrast test to some pages (added in P1 for quick runs; the full suite runs them all).

## P1 (tests fixed before the port)

| Test | Change | Seen failing | Then |
|---|---|---|---|
| glass fallback (`tests/run.mjs`, `evidence/laptop-check/laptop-check.mjs`) | expects DS v9's light fallback `rgba(255, 255, 255, 0.9)` on the glass | on the old site, before the port: `expected "rgba(255, 255, 255, 0.9)"`, `actual "rgba(22, 15, 52, 0.9)"` | passes after the port of `css/glass.css` |
| contrast: hub and 404 added | the page list `CONTRAST` had neither | on the old site: `below AA: hub@1440 .page-head .eyebrow#0 3.13` (`p1-old-site-contrast-hub-404.md`): a real failure the old list never measured | home, hub and 404 pass after the port: 147 measurements, lowest 6.11:1 (`p1-contrast-home-hub-404.md`) |
| contrast: every selector measured | a selector that matched nothing fully on screen was skipped silently | sabotage `.hero__facts { display: none; }` in `css/home.css`: `never measured (matched nothing fully on screen): home .hero__facts li` (`p1-sabotage-hidden-facts-contrast-home.md`) | sabotage removed; the full run then also named five pre-existing silent gaps (the three samples' `.sample-info .eyebrow`, the checker's `.note` and `.btn--ghost`), fixed in P4 and P5 |
| contrast: polarity | text was measured against the brightest pixel behind it, a light-text assumption | on the light site, sabotage `.about p:last-child { background: linear-gradient(90deg, rgba(0,0,0,0) 60%, #000 60%) }`: `below AA: home@1440 .about p#1 2.36` (dark text over black; the old method would have read the white glass and passed) (`p1-sabotage-dark-band-contrast-home.md`) | sabotage removed |

A run over the whole list during P1 also showed the fade behind the stuck top bar, which then ran 28 px past the bar, washing a button just under it to 3.96:1 (`home@1440 .card__actions .btn#0`). The fade now ends at the bar's edge.
