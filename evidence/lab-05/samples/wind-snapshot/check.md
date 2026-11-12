# check-sample: wind-snapshot — PASS

2026-10-28T09:50:17.511Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/wind-snapshot/index.html, css/glass.css, css/lab.css, css/sample.css, samples/wind-snapshot/piece.css, js/early.js, vendor/wind-gl@b1f6468/wind-gl.js, samples/wind-snapshot/piece.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(228, 232, 237) | 7.24 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(220, 224, 231) | 14.34 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 221, 225) | 6.54 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 221, 226) | 5.09 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(6, 75, 219) | rgb(230, 243, 252) | 6.12 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 231, 232) | 7.19 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(220, 221, 224) | 13.98 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 219, 222) | 6.43 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(217, 219, 223) | 4.99 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
