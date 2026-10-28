# check-sample: contour-map — PASS

2026-10-28T04:06:30.746Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/contour-map/index.html, css/glass.css, css/lab.css, css/sample.css, samples/contour-map/piece.css, js/early.js, samples/contour-map/piece.js, js/lab.js, samples/contour-map/noise.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 245, 251) | 8.14 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 243, 250) | 17.00 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(238, 244, 249) | 8.04 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(240, 244, 250) | 6.26 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(232, 240, 250) | 7.75 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(243, 246, 251) | 8.22 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(239, 243, 249) | 17.05 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(236, 241, 249) | 7.85 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(235, 242, 249) | 6.12 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
