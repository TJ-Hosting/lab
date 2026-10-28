# check-sample: particle-field — PASS

2026-10-28T02:52:10.249Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Warnings
- no licence or provenance line in the header of samples/particle-field/field.js

## Notes
- loads 8 local files: samples/particle-field/index.html, css/glass.css, css/lab.css, css/sample.css, samples/particle-field/field.css, js/early.js, samples/particle-field/field.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(228, 230, 233) | 7.12 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 221, 226) | 13.97 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 221, 225) | 6.54 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 222, 227) | 5.13 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 248) | 17.84 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(31, 44, 64) | 7.03 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(231, 231, 233) | 7.21 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 222, 225) | 14.11 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 220, 223) | 6.50 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(220, 220, 224) | 5.06 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 248) | 17.84 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
