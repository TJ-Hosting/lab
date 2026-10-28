# check-sample: shader-swatchbook — PASS

2026-10-28T05:09:26.435Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 22 local files: samples/shader-swatchbook/index.html, css/glass.css, css/lab.css, css/sample.css, samples/shader-swatchbook/piece.css, js/early.js, samples/shader-swatchbook/piece.js, js/lab.js, vendor/paper-design-shaders@0.0.82/shader-mount.js, vendor/paper-design-shaders@0.0.82/shader-sizing.js, vendor/paper-design-shaders@0.0.82/get-shader-color-from-string.js, vendor/paper-design-shaders@0.0.82/get-shader-noise-texture.js, vendor/paper-design-shaders@0.0.82/shaders/mesh-gradient.js, vendor/paper-design-shaders@0.0.82/shaders/warp.js, vendor/paper-design-shaders@0.0.82/shaders/swirl.js, vendor/paper-design-shaders@0.0.82/shaders/neuro-noise.js, vendor/paper-design-shaders@0.0.82/shaders/god-rays.js, vendor/paper-design-shaders@0.0.82/shaders/smoke-ring.js, vendor/paper-design-shaders@0.0.82/shaders/voronoi.js, vendor/paper-design-shaders@0.0.82/shaders/waves.js, vendor/paper-design-shaders@0.0.82/vertex-shader.js, vendor/paper-design-shaders@0.0.82/shader-utils.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(242, 247, 249) | 6.40 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(236, 244, 251) | 8.02 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(232, 241, 250) | 16.63 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 242, 249) | 7.85 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(231, 239, 250) | 5.97 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(249, 251, 253) | 18.30 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
