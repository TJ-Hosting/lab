# check-sample: epicycle-machine — PASS

2026-10-28T06:01:00.450Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/epicycle-machine/index.html, css/glass.css, css/lab.css, css/sample.css, samples/epicycle-machine/piece.css, js/early.js, samples/epicycle-machine/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(242, 247, 249) | 6.40 | 4.5
1440 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(246, 248, 251) | 8.37 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(242, 246, 250) | 6.37 | 4.5
375 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
