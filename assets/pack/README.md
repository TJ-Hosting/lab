# lab: pre-generated image pack (2026-10-15)

Made by agent=claude (Cowork, cloud session linked to BANE-VICTUS-TOP) for TJ, before the build dispatch `agent-honeypot-01` (brief v2, `dispatches/BRIEF-v2-agent-honeypot-01-2026-10-15.md`).

- **What it is:** 28 images, generated through the laptop's image-gen skill with no per-image spend: Grok Imagine 28, Gemini 0.
- **Why no Codex:** it was left out because another run on the laptop was using Codex image generation (the skill's rule: never two Codex jobs at once).
- **Ledger:** every file has a line in `LEDGER.jsonl` (provider, full prompt, dimensions, date). `CONTACT.jpg` is an overview.
- **Shared style:** one style sentence in every prompt: premium glassmorphism, frosted iridescent glass, a midnight-violet base with cyan, magenta and amber light, no text.

**Resolution.** 1280×720 (16:9), 720×1280 (9:16) and 1024×1024 (1:1). That is fine behind frosted glass, where blur hides softness, and in cards, but soft as a sharp full-bleed retina image. Convert to AVIF/WebP at responsive sizes and never upscale silently.

| File | Suggested use | Known flaws |
|---|---|---|
| `lab-bg-aurora.jpg` | main backdrop behind glass panels | includes faint glass-panel shapes (works with the theme) |
| `lab-bg-aurora-dusk.jpg` | warm alternate backdrop | same |
| `lab-bg-aurora-portrait.jpg` | mobile backdrop (9:16) | none seen |
| `lab-bg-liquid-chrome.jpg` | section backdrop | busy; needs strong blur or a scrim under text |
| `lab-bg-bokeh.jpg` | calm backdrop | none seen |
| `lab-bg-prism.jpg` | hero accent / footer | none seen |
| `lab-obj-glass-cube.jpg` | floating hero prop / card art | dark background, not transparent: use `mix-blend-mode: screen` or mask |
| `lab-obj-torus.jpg` | card art | same |
| `lab-obj-spheres.jpg` | card art | same |
| `lab-obj-shard-ribbon.jpg` | divider / hero accent | same |
| `lab-obj-hex-prism.jpg` | honeypot section card | same |
| `lab-obj-flask.jpg` | "lab" emblem art | same |
| `lab-tex-holo-foil.jpg` | holographic accent fill (borders, badges) | probably not seamless; check a 2×2 tile |
| `lab-tex-frosted.jpg` | frosted surface sample | came out as a framed square with a rounded border; crop the centre; not seamless |
| `lab-tex-grain.jpg` | not usable as grain | came out as a frosted glass square, not film grain; make grain in code (SVG `feTurbulence`) |
| `lab-spr-orbs.jpg` | particle sprites (4×4) for the particle field | cell backgrounds are near-black, not pure #000; clamp levels before additive blending, or draw particles in code |
| `lab-spr-sparkles.jpg` | sparkle sprites (4×4) | faint cell edges visible; same note |
| `lab-spr-streaks.jpg` | flare / streak sprites (3×3) | same note |
| `lab-hum-constellation.jpg` | "humanity" sample backdrop | reads as a field of light points on a glass slab more than a crowd |
| `lab-hum-hands.jpg` | "humanity" sample hero (two glass hands almost touching) | none seen |
| `lab-hum-glass-city-dawn.jpg` | "humanity" sample / lab home alt hero | none seen |
| `lab-hp-honeycomb.jpg` | honeypot exhibit backdrop | none seen |
| `lab-hp-honey-flow.jpg` | honeypot exhibit section art | none seen |
| `lab-hp-glass-bee.jpg` | honeypot emblem / about page | dark background, not transparent |
| `lab-hp-hex-portrait.jpg` | honeypot exhibit mobile backdrop | none seen |
| `lab-og-home.jpg` | 1200×630 share background, lab home | glass shapes on the right loosely resemble letters; fine as abstract |
| `lab-og-particles.jpg` | share background, particle sample | none seen |
| `lab-og-honeypot.jpg` | share background, honeypot | the left side is not dark; add a gradient scrim under the title |

The build may generate up to 40 more images (TJ, 15 Oct), within brief v2 §2; redos of the flaws above count toward that. Vision-trap images are rendered by script, not by a model (brief v2 §2).

## Laptop additions (lab-02, 18 Oct 2026)

Cowork made these 15 on 17 Oct for Aco through the laptop image-gen skill: Codex 14, Grok 1. They answer `assets/REQUESTS.md`. They are kept at native size; the PNG originals became JPEG q90 4:4:4 with no resize. The raw originals, their job logs and Cowork's per-image notes stay outside git in `C:\localhost\image-inbox\lab\laptop-2026-10-17\`. Each one has a ledger line here with its request, the raw file's SHA-256 and the conversion. `tools/build_images.py` now builds from them in place of the files they replace.

| File | Size | Replaces in the build | Notes |
|---|---|---|---|
| `lab-bg-aurora-hd.jpg` | 1600×900 | `lab-bg-aurora.jpg` | no glass-panel shapes; brighter, so the contrast was re-measured |
| `lab-bg-aurora-portrait-hd.jpg` | 1080×1920 | `lab-bg-aurora-portrait.jpg` | |
| `lab-bg-honeycomb-hd.jpg` | 1920×1080 | `lab-hp-honeycomb.jpg` | dark left side for text |
| `lab-hp-hex-portrait-hd.jpg` | 941×1672 | `lab-hp-hex-portrait.jpg` | |
| `lab-bg-prism-hd.jpg` | 1600×900 | `lab-bg-prism.jpg` | calm centre behind the logo |
| `lab-hum-constellation-v2.jpg` | 1280×720 | `lab-hum-constellation.jpg` | fixes "reads as points, not a crowd": small glass figures holding hands under the constellation |
| `lab-obj-*-black.jpg` (cube, torus, spheres, hex-prism, flask), `lab-hp-glass-bee-black.jpg` | 1254×1254 | the dark-background objects | pure black, so the luma key leaves no box; the cube keeps its caustic pool as light under it; the bee gets a wider edge fade, because its wings reach the corners |
| `lab-tex-holo-foil-tile-v2.jpg` | 1254×1254 | `lab-tex-holo-foil.jpg` | seamless (2×2 checked); built with a wrap-safe resize |
| `lab-spr-orbs-black.jpg`, `lab-spr-sparkles-black.jpg` | 1254×1254 | the 4×4 sheets | pure black, strict grid, no cell edges |

Not taken from the 17 Oct set, so the pack file stays in the build:

- **hands:** the new Grok image is the same 1280 px and less clean than `lab-hum-hands.jpg`.
- **glass city:** the new Grok image has glyph-like engravings on two towers, which read as signage.
- **bokeh:** the new Codex image adds sharp glass bubbles that read as extra particles in the particle field; `lab-bg-bokeh.jpg` is calmer.
- **holo-foil (Grok, first try):** rejected by Cowork; not seamless.
