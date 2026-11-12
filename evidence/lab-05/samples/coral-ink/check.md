# check-sample: coral-ink — PASS

2026-10-28T10:27:52.207Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/coral-ink/index.html, css/glass.css, css/lab.css, css/sample.css, samples/coral-ink/piece.css, js/early.js, samples/coral-ink/piece.js, js/lab.js, samples/coral-ink/gs.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 243, 249) | 8.00 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 239, 248) | 16.45 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 238, 247) | 7.65 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(234, 239, 248) | 5.99 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(200, 215, 245) | 6.15 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(240, 243, 249) | 8.01 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(236, 239, 248) | 16.51 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(234, 238, 247) | 7.67 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(211, 226, 246) | 5.26 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
