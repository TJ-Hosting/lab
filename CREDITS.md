# Credits

## Images

- **Pre-generated pack** (`assets/pack/`, 28 images): made on 2026-10-15 for TJ through the laptop's image-gen skill with Grok Imagine (28) and Gemini (0). One line per image, with the full prompt, in `assets/pack/LEDGER.jsonl`; notes and known flaws in `assets/pack/README.md`. AI-generated with the account holders' own subscriptions; no third-party assets. Check provider terms before commercial use.
- **Laptop additions** (`assets/pack/*-hd.jpg`, `*-black.jpg`, `*-v2.jpg`, 15 images): made on 2026-10-17 for Aco through the same skill, answering `assets/REQUESTS.md`. Codex (GPT Image) made 14 and Grok Imagine made 1. They were added in lab-02 (2026-10-18) at native size, with one ledger line each in `assets/pack/LEDGER.jsonl`. Same licence note.
- **The Lab image pack, 27 Oct 2026** (`assets/pack/lab-*.png`: 20 of its 22 images copied in, 17 shipped; the hands, torus and amber prism were replaced after review 1, and their originals stay): made for Aco through `agent-honeypot\imagepack\gen.ps1` with Codex (GPT Image) only, in tj-hosting.ca's DS v9 style lock with tj's golden reference sheet, for the lab-04 re-skin onto Design System v9 "Day sky". Each `LEDGER.jsonl` line names its pack id (LP01–LM19) and sha256 under `provenance`. Same licence note.
- **From tj-hosting.ca's approved pack** (`assets/pack/tj-*.png`, 4 images: the cloud sheet, the browser window, the square plinth, the unplugged 404 server): made for tj-build-06 with Codex in the same style lock; each ledger line names its tj pack id (H07, H03, H05a, E01) and sha256.
- **Web sizes** (`img/iso`, `img/sky`, `img/sprites`): AVIF/WebP conversions by `tools/build_images.py`, never upscaled. lab-04's cut-outs keep the pack's own alpha (snapped to opaque from 250, trimmed, resized premultiplied); the particle field's two sprite atlases are black-clamped and luma-keyed as before. lab-04 retired the dark backdrops, objects, card art and textures of 15–17 Oct from `img/`; their pack originals stay in `assets/pack/`.
- **Share images** (`img/og/*.jpg`): rendered by `tools/render-og.mjs`, a light glass card with code-set type on the pack's share-card bases or the CSS day sky with a sample's cut-out.
- **Generated in lab-04** (`assets/pack/lab-relay.png`, `lab-ring.png`, `lab-keepsake.png`): 3 of the 40 allowed through `gen.ps1` (ledger `lab`), all by Codex on the first try, after the first design review. They re-render three pack subjects at tj's camera, on a plinth, in the blue palette. Their ledger lines name the lab ledger ids L01–L03 and sha256.
- **Also from tj's pack:** the square plinth under the home hero's browser (`assets/pack/tj-hero-plinth-square.png`, tj id H05a).
- **Vision-trap images** (`exhibits/humanity/placard.png`, `haze.png`): drawn in code by `tools/render-vision-traps.mjs`; no image model.
- **Generated in this build: none.** No image API key was available, so the run made 0 of the 40 allowed calls and spent US$0 of the US$10 cap. Requested upgrades are listed in `assets/REQUESTS.md`; `tools/gen-images.mjs` is the capped way to make them. The laptop check (lab-02) also made none: 0 of its 40.
- `img/IMAGES.jsonl` traces every shipped image to its source.

## Brand

- The TJ-Hosting mark is TJ-Hosting's own. The TJ letterform path comes from https://tj-hosting.ca/img/favicon.svg; the globe in the logo sample is redrawn in SVG after https://tj-hosting.ca/img/tj-logo-96.png. Brand colours follow tj-hosting.ca.

## Fonts (SIL Open Font License 1.1, self-hosted, Latin subsets)

- **Nunito Sans** (variable, weight and width) — Copyright 2016 The Nunito Sans Project Authors. `fonts/NunitoSans-OFL.txt`. Copied from tj-hosting.ca (DS v9), which takes it from the @fontsource package.
- **Great Vibes** — Copyright 2010 The Great Vibes Pro Project Authors. `fonts/GreatVibes-OFL.txt`. Same source; one short script phrase per page.
- **JetBrains Mono** — Copyright 2020 The JetBrains Mono Project Authors. `fonts/OFL-jetbrainsmono.txt`
- **Unbounded** and **Onest** (`fonts/OFL-unbounded.txt`, `fonts/OFL-onest.txt`) left the pages in lab-04 but stay in `fonts/`: `tools/render-vision-traps.mjs` embeds them, and the exhibit's two vision images must not change.

## Samples added in lab-05 (2026-10-28)

Each line: the sample, the project it comes from, and its licence. "Written from the idea" means no source code was read or copied. Vendored libraries keep their licence files under `vendor/`.

- **The split-flap board** (`samples/split-flap-board/`): adapted from [Craft of UI: WAAPI split-flap board](https://codepen.io/jh3y/pen/dPyBXOG) by Jhey (jh3y), MIT (a public CodePen; code read from its Debug view). Rebuilt as a navy departures board with a message box; the brightness filter became an overlay's opacity; no Tweakpane.
- **Star-trail text** (`samples/star-trail-text/`): adapted from [Animated Intro (6): SVG textPath with star particles](https://gist.github.com/EE2dev/d05b9df2833c9975e68a3828198edd74) by EE2dev, MIT (the gist's `.block` file). The d3 transitions became one requestAnimationFrame loop; the star particles, mask reveal, curves, night sky and type are new (the gist's stars.js, from a third-party pen, was not used).
- **Coral Ink Reactor** (`samples/coral-ink/`): written from the idea of [Reaction Diffusion Lab (Ink + Presets)](https://codepen.io/VlasovDevCore/pen/azmeJGr) by Vlasov.Dev Core; no source code was read or copied (CodePen refused the download). New Gray-Scott code, with ink on the day sky, a drifting cycle of six patterns and a ghost brush.
- **Slime Network** (`samples/slime-network/`): written from the idea of [Physarum Transport Network](https://apps.amandaghassaei.com/) by Amanda Ghassaei (no licence stated; none of its code was read), using the published Physarum agent model of Jeff Jones (2010). New CPU code in Canvas 2D.
- **Ink Tide GPU Fluid** (`samples/gpu-fluid/`): adapted from [WebGL Fluid Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) by Pavel Dobryakov, MIT (commit a2d2929). Simulation and shaders kept; dat.gui, promo, analytics, sun rays and the dither image dropped; a blue dye palette on navy, a ghost-finger autopilot, resolutions by device and a reduced-motion still added.
- **The scroll tunnel** (`samples/scroll-zoom-tunnel/`): written from the idea of [3D spacial scroll zoom with CSS Scroll Animation](https://codepen.io/argyleink/pen/ZEdrzJZ) by Adam Argyle; no source code was read or copied (CodePen refused the download). New code: hosting-word glass tiles on a scroll timeline, a Your site landing tile, a still grid where scroll timelines are missing.
- **Tear the glass curtain** (`samples/tear-the-curtain/`): written from the idea of [Tearable Cloth](https://codepen.io/Kudriavaya/pen/ALMBPg) by Kudriavaya (after Suffick), a Verlet cloth pinned along its top row that tears when stretched; no source code was read or copied (CodePen refused the download). The cloth, drawing, controls and look are new.
- **Magnetic dot mesh** (`samples/dot-mesh-hero/`): written from the idea of [Magnetic dot mesh](https://codepen.io/jpbelley/pen/jEMwLXv) by JP (jpbelley); no source code was read or copied (CodePen refused the download). New code: a triangle lattice of springs, shockwaves, a ghost pointer, a glass card the mesh bends around.
- **The brand colour sphere** (`samples/brand-colour-sphere/`): written from the idea of [RYBitten SVG Color Sphere](https://codepen.io/meodai/pen/PwZpjMW) by meodai; no source code was read or copied (CodePen refused the download). New SVG, quaternion and OKLCH code; the OKLab matrices are Björn Ottosson's ([oklab](https://bottosson.github.io/posts/oklab/), public domain or MIT).

## Code and libraries

- The site uses **no runtime libraries**: vanilla HTML, CSS and JavaScript, no build step.
- Development only (not shipped): [Playwright](https://playwright.dev/) 1.56.1 (Apache-2.0) for tests, screenshots and the render scripts; [Pillow](https://python-pillow.org/) (MIT-CMU) for image conversion.
