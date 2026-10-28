# Sample template (lab-05)

The starting point for a new sample in the DS v9 "Day sky" Lab. `tools/` is not published, so this folder never becomes a page.

1. Copy the folder to `samples/<slug>/` and replace every `{{…}}` in `index.html`, `piece.css` and `piece.js`.
2. Keep the shell as it is: the sky, the top bar, the `.sample-info` panel (eyebrow `Sample NN · Kicker`, title, a two-line "How it's made", the controls ending in "← Back to the lab").
3. Keep one of the four stages in `index.html` and delete the rest:
   - **A, night screen** `.piece-screen.screen[data-night]`: a framed window, dark inside, only for a piece that reads on dark;
   - **B, day screen** `.piece-screen.screen.screen--day`: the same window in light glass;
   - **C, open sky** `.stage` with the piece centred on the sky;
   - **D, scrolling page** `.scroll-page` for scroll-driven pieces.
4. Drive every continuous animation through `loop()` or `govern()` from `js/lab.js`, give the piece a reduced-motion still, and keep DOM animation to `transform` and `opacity` (README, "Add a sample").
5. Check it: `node tools/check-sample.mjs <slug>` (Chromium and Firefox at 1440 and 375 px; screenshots and `check.md` in `evidence/lab-05/samples/<slug>/`). Then add the `samples.json` entry with its `category`, the sitemap URL and the `CREDITS.md` line, and run `npm test`.

The full rules the lab-05 builders followed are in the store: `agent-honeypot\dispatches\ref\lab-05\BUILDER-BRIEF-lab-05.md`.
