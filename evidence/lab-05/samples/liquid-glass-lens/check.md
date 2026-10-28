# check-sample: liquid-glass-lens — PASS

2026-10-28T10:32:13.165Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 9 local files: samples/liquid-glass-lens/index.html, css/glass.css, css/lab.css, css/sample.css, samples/liquid-glass-lens/piece.css, js/early.js, samples/liquid-glass-lens/piece.js, js/lab.js, vendor/liquid-glass-js@0.1.0/liquid-glass.esm.js
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
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 237, 245) | 16.21 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(233, 237, 244) | 5.89 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(200, 215, 243) | 6.14 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(240, 243, 249) | 8.01 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(235, 240, 248) | 16.59 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 238, 246) | 7.65 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(211, 224, 246) | 5.19 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
