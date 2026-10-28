# check-sample: liquid-glass-lens — PASS

2026-10-28T07:10:23.809Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/liquid-glass-lens/index.html, css/glass.css, css/lab.css, css/sample.css, samples/liquid-glass-lens/piece.css, js/early.js, samples/liquid-glass-lens/piece.js, js/lab.js, vendor/liquid-glass-js@0.1.0/liquid-glass.esm.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 228, 236) | 7.03 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 221, 232) | 14.03 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 221, 233) | 6.59 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 221, 232) | 5.10 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 253) | 17.90 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(200, 215, 243) | 6.14 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 239, 251) | 7.68 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 233, 250) | 15.47 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 225, 240) | 6.80 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 225, 244) | 5.30 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 251) | 17.88 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
