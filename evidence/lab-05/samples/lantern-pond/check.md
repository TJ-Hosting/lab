# check-sample: lantern-pond — PASS

2026-10-28T05:21:23.044Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/lantern-pond/index.html, css/glass.css, css/lab.css, css/sample.css, samples/lantern-pond/piece.css, js/early.js, samples/lantern-pond/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 229, 233) | 7.06 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 221, 227) | 13.98 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 219, 224) | 6.44 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 220, 223) | 5.03 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(19, 32, 57) | 8.12 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(232, 232, 235) | 7.29 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(220, 224, 232) | 14.35 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 222, 230) | 6.61 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(220, 226, 234) | 5.30 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(248, 249, 250) | 18.01 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
