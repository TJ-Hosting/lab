# check-sample: edge-network-globe — PASS

2026-10-28T10:31:42.154Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/edge-network-globe/index.html, css/glass.css, css/lab.css, css/sample.css, samples/edge-network-globe/piece.css, js/early.js, samples/edge-network-globe/piece.js, js/lab.js, vendor/cobe@2.0.1/index.esm.js
- Chromium 141.0.7390.37, WebGL renderer: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11)
- Firefox: not run (browserType.launch: spawn UNKNOWN)

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured (--no-perf)

## Shell contrast (Chromium)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(20, 27, 44) | 8.58 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(240, 242, 246) | 7.95 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 236, 242) | 7.53 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
