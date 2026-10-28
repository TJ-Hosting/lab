# check-sample: glass-card-flow — PASS

2026-10-28T10:25:22.571Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/glass-card-flow/index.html, css/glass.css, css/lab.css, css/sample.css, samples/glass-card-flow/piece.css, js/early.js, samples/glass-card-flow/piece.js, js/lab.js
- Chromium 141.0.7390.37, WebGL renderer: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11)
- Firefox: not run (browserType.launch: spawn UNKNOWN)

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured (--no-perf)

## Shell contrast (Chromium)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5
1440 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .controls .btn | 1 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(214, 228, 247) | 5.37 | 4.5
375 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
375 | .controls .btn | 1 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
