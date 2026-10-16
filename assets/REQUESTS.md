# Image requests (laptop follow-up)

No `OPENAI_API_KEY` or `GEMINI_API_KEY` was set in the cloud run of `agent-honeypot-01` (2026-10-16), so the run generated **no** images (0 / 40 calls, US$0 / US$10). The site ships with the pre-generated pack only (`assets/pack/`). These requests are upgrades and fixes for the pack’s known flaws; none blocks the launch.

**How to run them.** Either through the laptop’s image-gen skill, or with the capped script, which enforces 40 calls and US$10 in code and ledgers every call to `assets/LEDGER.jsonl`:

```sh
node tools/gen-images.mjs --provider openai --name lab-bg-aurora-2560 --aspect 16:9 --prompt "…"
```

Then rebuild the web sizes: add the new file to `tools/build_images.py` (widths up to the new source width) and run `python3 -I tools/build_images.py photos objects sprites`. Rules: no real or identifiable people, no third-party logos or characters, no text in images; a moderation block ends that image (don’t reword around it).

Every prompt ends with the pack’s shared style sentence:

> Visual style: premium glassmorphism art direction for a futuristic digital design lab: frosted translucent glass, iridescent edges, soft volumetric glow, a deep midnight-violet base lit with electric cyan, magenta and warm amber light, subtle film grain, ultra-clean high-end 3D render, cinematic depth of field. Original artwork. No text, letters, numbers, logos or watermarks anywhere in the image.

| # | Name | Aspect | Where it is used / why | Prompt (before the style sentence) |
|---|---|---|---|---|
| 1 | `lab-bg-aurora-2560` | 16:9 | Home and lab-wide backdrop (`img/bg/aurora-*`), sharper on retina | A full-bleed abstract aurora gradient-mesh background: broad flowing ribbons of light in electric cyan, magenta and violet drifting across a deep midnight base, smooth and soft so frosted glass panels placed over it will glow, generous calm areas, no hard objects, no panels or frames. |
| 2 | `lab-bg-aurora-portrait-1440` | 9:16 | Phone backdrop for the home (`img/bg/aurora-portrait-*`) | A tall portrait-format abstract aurora gradient-mesh background for a phone screen: flowing ribbons of cyan, magenta and violet light over a deep midnight base, smooth and soft, generous calm areas, no hard objects. |
| 3 | `lab-bg-honeycomb-2560` | 16:9 | Exhibit backdrop (`img/bg/honeycomb-*`) | A wide field of frosted glass honeycomb cells receding in soft focus, a few cells lit warm amber from inside like honey light, deep violet shadows between them, calm areas for text on the left. |
| 4 | `lab-hp-hex-portrait-1440` | 9:16 | Exhibit phone backdrop (`img/bg/hex-portrait-*`) | A tall portrait column of frosted glass honeycomb cells in soft focus, warm amber light glowing through a few cells, deep violet base, calm areas top and bottom. |
| 5 | `lab-bg-prism-2560` | 16:9 | Logo sample backdrop (`img/bg/prism-*`) | Beams of prismatic light crossing a dark glass floor, split into cyan, violet and amber, a calm empty centre where a logo will sit. |
| 6 | `lab-bg-bokeh-2560` | 16:9 | Particle-field sample backdrop (`img/bg/bokeh-*`) | A calm field of soft out-of-focus bokeh lights in cyan, violet, magenta and amber floating in deep midnight space, large circles and tiny specks, lots of dark space. |
| 7 | `lab-hum-hands-2560` | 16:9 | Kinetic-type sample backdrop and exhibit room I (`img/art/hands-*`) | Two hands made of clear glass reaching toward each other, fingertips almost touching, a small warm spark of light between them, soft violet and cyan rim light, dark background, centred composition with space above and below. |
| 8 | `lab-hum-glass-city-1920` | 16:9 | Exhibit room II art (`img/art/glass-city-*`) | A small city of frosted glass towers at dawn, warm amber sunrise light flowing between them, soft mist at street level, no people, no signage, no text. |
| 9 | `lab-hum-constellation-1920` | 16:9 | Exhibit room III art (`img/art/constellation-*`) | Thousands of tiny points of light connected by fine luminous threads, floating above a thin slab of clear glass like a constellation of people holding hands, cyan, violet and amber light on deep midnight. |
| 10 | `lab-obj-glass-cube-black` | 1:1 | Home hero prop (`img/obj/glass-cube-*`); pure black lets the luma key stay clean | A single frosted iridescent glass cube floating, caustic reflections below it, centred, on a pure solid black #000000 background with nothing else in frame. |
| 11 | `lab-obj-torus-black` | 1:1 | Home hero prop (`img/obj/torus-*`) | A single clear iridescent glass torus ring floating at a slight angle, rainbow refraction on its edges, centred, on a pure solid black #000000 background with nothing else in frame. |
| 12 | `lab-obj-spheres-black` | 1:1 | Home hero prop (`img/obj/spheres-*`) | A small cluster of clear glass spheres of different sizes floating together, soft cyan and amber glints, centred, on a pure solid black #000000 background with nothing else in frame. |
| 13 | `lab-hp-glass-bee-black` | 1:1 | Exhibit hero and honeypot hub (`img/obj/glass-bee-*`) | A bee made of clear crystal glass in flight, wings catching warm amber light, delicate facets, centred, on a pure solid black #000000 background with nothing else in frame. |
| 14 | `lab-obj-hex-prism-black` | 1:1 | Exhibit room V (`img/obj/hex-prism-*`) | A tall hexagonal glass prism glowing warm amber from inside, sparks of honey light at its base, centred, on a pure solid black #000000 background with nothing else in frame. |
| 15 | `lab-obj-flask-black` | 1:1 | Home “about the lab” emblem (`img/obj/flask-*`) | A round laboratory flask of clear glass with swirling cyan and magenta light inside, centred, on a pure solid black #000000 background with nothing else in frame. |
| 16 | `lab-tex-holo-foil-tile` | 1:1 | Holographic accent fill; the pack version is not seamless | A seamless tileable texture of holographic foil: soft diagonal rainbow bands of cyan, violet, pink and amber on pale silver, fine crinkles, even lighting, edges that wrap perfectly when tiled. |
| 17 | `lab-spr-orbs-black` | 1:1 | Particle-field sprite sheet (`img/sprites/orbs.webp`); the pack sheet has near-black cells and faint cell edges | A sprite sheet: a strict 4 by 4 grid of 16 glowing glass orbs, one per cell, each centred with generous space around it, in cyan, violet, magenta and amber, on a pure solid black #000000 background, no grid lines, no borders. |
| 18 | `lab-spr-sparkles-black` | 1:1 | Particle-field sprite sheet (`img/sprites/sparkles.webp`) | A sprite sheet: a strict 4 by 4 grid of 16 four- and six-pointed glass sparkles, one per cell, each centred with generous space around it, white, cyan, pink and amber, on a pure solid black #000000 background, no grid lines, no borders. |

18 requests (cap 40).
