# check-sample: halftone-dissolve — PASS

2026-10-28T06:43:13.138Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 11 local files: samples/halftone-dissolve/index.html, css/glass.css, css/lab.css, css/sample.css, samples/halftone-dissolve/piece.css, js/early.js, samples/halftone-dissolve/piece.js, js/lab.js, vendor/gsap@3.13.0/index.js, vendor/gsap@3.13.0/gsap-core.js, vendor/gsap@3.13.0/CSSPlugin.js
- Chromium 141.0.7390.37, WebGL renderer: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11)
- frame time: median 16.7 ms, p95 16.8 ms at 1440
- Firefox: not run (browserType.launch: spawn UNKNOWN)

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: {"median":16.7,"p95":16.8,"frames":301} (gpu GL)

## Shell contrast (Chromium)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 232, 235) | 7.22 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(225, 229, 233) | 14.99 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 235, 239) | 7.46 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(222, 233, 244) | 5.62 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(249, 250, 251) | 18.17 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(200, 221, 239) | 6.38 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(232, 239, 247) | 7.69 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(225, 235, 245) | 15.73 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(224, 235, 244) | 7.36 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 231, 241) | 5.49 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(248, 250, 252) | 18.14 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
