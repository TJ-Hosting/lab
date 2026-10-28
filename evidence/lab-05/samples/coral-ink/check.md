# check-sample: coral-ink — PASS

2026-10-28T03:10:41.455Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/coral-ink/index.html, css/glass.css, css/lab.css, css/sample.css, samples/coral-ink/piece.css, js/early.js, samples/coral-ink/piece.js, js/lab.js, samples/coral-ink/gs.js
- Chromium 141.0.7390.37, WebGL renderer: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11)
- frame time: median 16.7 ms, p95 16.7 ms at 1440
- Firefox: not run (browserType.launch: spawn UNKNOWN)

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: {"median":16.7,"p95":16.7,"frames":301} (gpu GL)

## Shell contrast (Chromium)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 238, 251) | 7.63 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(223, 234, 250) | 15.63 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(221, 232, 249) | 7.21 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(221, 233, 249) | 5.63 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(248, 249, 253) | 18.04 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(248, 250, 252) | 18.14 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(200, 216, 247) | 6.20 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(234, 241, 251) | 7.84 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(225, 235, 250) | 15.79 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(222, 233, 250) | 7.27 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(221, 233, 249) | 5.63 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(248, 250, 253) | 18.15 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(248, 250, 252) | 18.14 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
