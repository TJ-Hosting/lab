# check-sample: gpu-fluid — PASS

2026-10-28T03:42:29.027Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/gpu-fluid/index.html, css/glass.css, css/lab.css, css/sample.css, samples/gpu-fluid/piece.css, js/early.js, samples/gpu-fluid/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 229, 235) | 7.07 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 222, 229) | 14.09 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 221, 230) | 6.56 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 226, 234) | 5.29 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(27, 49, 77) | 6.59 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 233, 239) | 7.32 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 226, 235) | 14.60 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 225, 232) | 6.76 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(220, 226, 234) | 5.30 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 249, 252) | 18.00 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 249, 251) | 17.99 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
