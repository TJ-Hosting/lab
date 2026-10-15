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
