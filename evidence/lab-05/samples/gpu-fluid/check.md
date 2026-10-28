# check-sample: gpu-fluid — PASS

2026-10-28T06:02:56.881Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/gpu-fluid/index.html, css/glass.css, css/lab.css, css/sample.css, samples/gpu-fluid/piece.css, js/early.js, samples/gpu-fluid/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 229, 237) | 7.08 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 222, 232) | 14.12 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 222, 231) | 6.61 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 227, 238) | 5.34 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(28, 61, 86) | 5.67 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 234, 241) | 7.38 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(220, 227, 238) | 14.70 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 225, 235) | 6.77 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(217, 224, 238) | 5.22 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 249, 251) | 17.99 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 249, 251) | 17.99 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
