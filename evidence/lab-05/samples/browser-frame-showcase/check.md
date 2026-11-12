# check-sample: browser-frame-showcase — PASS

2026-10-28T07:22:11.248Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/browser-frame-showcase/index.html, css/glass.css, css/lab.css, css/sample.css, samples/browser-frame-showcase/piece.css, js/early.js, samples/browser-frame-showcase/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(247, 249, 250) | 8.44 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(242, 247, 249) | 6.40 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(247, 249, 251) | 8.44 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 246, 249) | 17.50 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(241, 247, 249) | 6.39 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
