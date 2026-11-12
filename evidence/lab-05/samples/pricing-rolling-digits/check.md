# check-sample: pricing-rolling-digits — PASS

2026-10-28T10:36:42.651Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 16 local files: samples/pricing-rolling-digits/index.html, css/glass.css, css/lab.css, css/sample.css, samples/pricing-rolling-digits/piece.css, js/early.js, samples/pricing-rolling-digits/piece.js, vendor/number-flow@0.6.2/index.mjs, js/lab.js, vendor/number-flow@0.6.2/lite.mjs, vendor/number-flow@0.6.2/ssr-DvIINv8w.mjs, vendor/number-flow@0.6.2/csp.mjs, vendor/number-flow@0.6.2/plugins.mjs, vendor/number-flow@0.6.2/esm-env@1.2.2/index.js, vendor/number-flow@0.6.2/esm-env@1.2.2/true.js, vendor/number-flow@0.6.2/esm-env@1.2.2/false.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(232, 241, 250) | 7.80 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(243, 245, 250) | 8.17 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(238, 241, 248) | 16.79 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(238, 241, 247) | 7.87 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(215, 227, 246) | 5.34 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
