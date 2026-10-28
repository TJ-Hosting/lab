# check-sample: star-trail-text — PASS

2026-10-28T03:27:15.614Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 8 local files: samples/star-trail-text/index.html, css/glass.css, css/lab.css, css/sample.css, samples/star-trail-text/trail.css, js/early.js, samples/star-trail-text/trail.js, js/lab.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(228, 230, 236) | 7.14 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 222, 229) | 14.09 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 221, 230) | 6.56 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 223, 234) | 5.19 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(19, 35, 65) | 7.81 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 232, 237) | 7.27 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 223, 230) | 14.26 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 221, 228) | 6.55 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 223, 233) | 5.18 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
