# check-sample: glass-orbs — PASS

2026-10-28T05:11:21.480Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 11 local files: samples/glass-orbs/index.html, css/glass.css, css/lab.css, css/sample.css, samples/glass-orbs/piece.css, js/early.js, samples/glass-orbs/piece.js, js/lab.js, vendor/three@0.186.1/build/three.module.js, vendor/three@0.186.1/addons/environments/RoomEnvironment.js, vendor/three@0.186.1/build/three.core.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 247, 251) | 8.26 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(238, 245, 249) | 17.23 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 243, 249) | 7.97 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(236, 244, 249) | 6.21 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(244, 247, 251) | 8.29 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(239, 245, 250) | 17.28 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(236, 244, 249) | 8.01 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(238, 245, 249) | 6.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
