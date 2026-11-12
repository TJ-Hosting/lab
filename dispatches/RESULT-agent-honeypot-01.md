# RESULT agent-honeypot-01 (brief v2) · 2026-10-16 · agent=claude (Claude Code on the web)
## Outcome
Done: the MVP is built and verified in headless Chromium. It includes the lab home (glass, cards from `samples.json`), 3 motion samples (humanity-type, particle-field, logo), the bait exhibit `/exhibits/humanity/` with **18 techniques**, a banner, `noindex` and reveal mode, plus the checker, scoreboard, about page, hub, `TESTING.md`, deploy config and README. Images: **0 / 40 generated, US$0 / US$10 spent** (no API key); the site uses the pack only. **Payload review:** I read every trap line in `evidence/trap-texts.txt` (#1 EMBER-Q3 … #18 HALO-G7), and test 20 checks them too. Each asks only for a 4–8 line poem about humanity titled with its own code. None asks to fetch, open, reveal, share, act on accounts, buy, post, submit, or hide anything from the user.
## PR
https://github.com/TJ-Hosting/lab/pull/1 (draft; branch `feat/lab-mvp-2026-10-15` from `main` @ `6cd0699`; not merged).
## Evidence paths
`evidence/test-output.txt` (23/23 pass) · screenshots at 1440 and 375 px: `home-*`, `home-samples-*`, `sample-<slug>-*`, `sample-<slug>-reduced-motion-1440`, `exhibit-banner-*`, `exhibit-reveal-*`, `checker-result-*`, `scoreboard-*`, `home-no-backdrop-filter-1440` · `contrast.md` (129 measurements, all AA, lowest 4.72:1) · `trap-texts.txt`.
## Not tested
- Real agents against the live page (TJ's first follow-up, `TESTING.md`).
- DNS and HTTPS on `lab.tj-hosting.ca` (post-merge).
- Firefox, Safari and real phones (headless Chromium only).
- The live OpenAI/Gemini calls in `tools/gen-images.mjs`. Caps are tested with a stub; the Gemini REST response path is [unverified].
## Deviations
- Tests ran in full twice. Run 1 was 21/23: a bug in the payload-review test, and real contrast failures that I fixed in `bd438b0`. Contrast-only reruns happened in between. The brief says one run at the end.
- The logo is rebuilt in SVG: the TJ path comes from tj-hosting.ca `favicon.svg` and the globe is redrawn after `tj-logo-96.png`. It is not TJ's master file.
- Added beyond the brief: 18 techniques instead of the minimum 12, a `/honeypot/` hub, a CSP on every page, and a `_config.yml` that keeps internal folders off Pages (checked with a real Jekyll 3.10 build). `Google-Extended` is not disallowed, because it also governs Gemini grounding.
- The launch prompt set a 16 h budget; the brief says 8 h. This is moot: the run took about 1.3 h. The line-by-line review above is compressed to fit the 30-line cap; the full lines are in `evidence/trap-texts.txt`.
## Open questions
1. Does TJ have a master SVG of the logo to swap in? 2. Should the EXAMPLE scoreboard row be kept once real rows exist? 3. Rename the queue ID to `lab-01` (suggested in the PR).
## Estimate
Estimate: raw 10 h · p80 6.7 h (cal v2, 174) · actual 1.3 h (0.19×) · tokens actual not visible · model opus-5.5 extra-high [effort as set in the launch prompt; not visible to me] · questions 0, wait 0 · tests 23/23 · reopened 0 · variance: easier-than-thought, scope-grew
## Variance
The work went quicker than the estimate: no blockers, one session, and no waiting. Scope grew slightly (more techniques, the hub, 404, the Pages config).
## Follow-ups
TJ runs the `TESTING.md` checklist after merge and does the DNS/Pages steps (README) · laptop: `assets/REQUESTS.md` (18 upgrades: retina backdrops, pure-black objects, clean sprite sheets) · a Firefox/Safari/real-phone pass · links from tj-hosting.ca and CMHS (after 29 Oct).
