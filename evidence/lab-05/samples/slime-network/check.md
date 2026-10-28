# check-sample: slime-network — PASS

2026-10-28T03:34:57.866Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/slime-network/index.html, css/glass.css, css/lab.css, css/sample.css, samples/slime-network/piece.css, js/early.js, samples/slime-network/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 231, 235) | 7.21 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 223, 229) | 14.19 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 221, 226) | 6.56 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 222, 226) | 5.11 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 249, 250) | 17.98 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(33, 52, 74) | 6.34 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(231, 232, 235) | 7.27 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(224, 226, 230) | 14.64 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 222, 226) | 6.60 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 225, 231) | 5.24 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
