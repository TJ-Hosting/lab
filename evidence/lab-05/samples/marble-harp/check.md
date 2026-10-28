# check-sample: marble-harp — PASS

2026-10-28T04:41:55.874Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/marble-harp/index.html, css/glass.css, css/lab.css, css/sample.css, samples/marble-harp/piece.css, js/early.js, samples/marble-harp/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 229, 235) | 7.07 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 221, 228) | 13.99 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 220, 227) | 6.50 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 221, 227) | 5.08 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(19, 31, 59) | 8.16 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(228, 230, 235) | 7.13 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 221, 228) | 13.99 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 220, 227) | 6.50 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 221, 228) | 5.10 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
