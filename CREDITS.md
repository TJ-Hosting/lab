# Credits

## Images

- **Pre-generated pack** (`assets/pack/`, 28 images): made on 2026-10-15 for TJ through the laptop's image-gen skill with Grok Imagine (28) and Gemini (0). One line per image, with the full prompt, in `assets/pack/LEDGER.jsonl`; notes and known flaws in `assets/pack/README.md`. AI-generated with the account holders' own subscriptions; no third-party assets. Check provider terms before commercial use.
- **Laptop additions** (`assets/pack/*-hd.jpg`, `*-black.jpg`, `*-v2.jpg`, 15 images): made on 2026-10-17 for Aco through the same skill, answering `assets/REQUESTS.md`. Codex (GPT Image) made 14 and Grok Imagine made 1. They were added in lab-02 (2026-10-18) at native size, with one ledger line each in `assets/pack/LEDGER.jsonl`. Same licence note.
- **Web sizes** (`img/bg`, `img/art`, `img/obj`, `img/tex`, `img/sprites`): AVIF/WebP conversions of the pack by `tools/build_images.py` (resize without upscaling; objects and sprites black-clamped and luma-keyed to real alpha).
- **Share images** (`img/og/*.jpg`): pack backgrounds with type set in code by `tools/render-og.mjs`.
- **Vision-trap images** (`exhibits/humanity/placard.png`, `haze.png`): drawn in code by `tools/render-vision-traps.mjs`; no image model.
- **Generated in this build: none.** No image API key was available, so the run made 0 of the 40 allowed calls and spent US$0 of the US$10 cap. Requested upgrades are listed in `assets/REQUESTS.md`; `tools/gen-images.mjs` is the capped way to make them. The laptop check (lab-02) also made none: 0 of its 40.
- `img/IMAGES.jsonl` traces every shipped image to its source.

## Brand

- The TJ-Hosting mark is TJ-Hosting's own. The TJ letterform path comes from https://tj-hosting.ca/img/favicon.svg; the globe in the logo sample is redrawn in SVG after https://tj-hosting.ca/img/tj-logo-96.png. Brand colours follow tj-hosting.ca.

## Fonts (SIL Open Font License 1.1, self-hosted, Latin subsets from Google Fonts)

- **Unbounded** — Copyright 2022 The Unbounded Project Authors. `fonts/OFL-unbounded.txt`
- **Onest** — Copyright 2021 The Onest Project Authors. `fonts/OFL-onest.txt`
- **JetBrains Mono** — Copyright 2020 The JetBrains Mono Project Authors. `fonts/OFL-jetbrainsmono.txt`

## Code and libraries

- The site uses **no runtime libraries**: vanilla HTML, CSS and JavaScript, no build step.
- Development only (not shipped): [Playwright](https://playwright.dev/) 1.56.1 (Apache-2.0) for tests, screenshots and the render scripts; [Pillow](https://python-pillow.org/) (MIT-CMU) for image conversion.
