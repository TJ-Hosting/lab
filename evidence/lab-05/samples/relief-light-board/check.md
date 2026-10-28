# check-sample: relief-light-board — PASS

2026-10-28T05:41:23.225Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 26 local files: samples/relief-light-board/index.html, css/glass.css, css/lab.css, css/sample.css, samples/relief-light-board/piece.css, js/early.js, samples/relief-light-board/piece.js, vendor/ogl@1.0.11/src/core/Renderer.js, vendor/ogl@1.0.11/src/core/Program.js, vendor/ogl@1.0.11/src/core/Mesh.js, vendor/ogl@1.0.11/src/core/Texture.js, vendor/ogl@1.0.11/src/extras/Triangle.js, js/lab.js, vendor/ogl@1.0.11/src/math/Vec3.js, vendor/ogl@1.0.11/src/core/Transform.js, vendor/ogl@1.0.11/src/math/Mat3.js, vendor/ogl@1.0.11/src/math/Mat4.js, vendor/ogl@1.0.11/src/core/Geometry.js, vendor/ogl@1.0.11/src/math/functions/Vec3Func.js, vendor/ogl@1.0.11/src/math/Quat.js, vendor/ogl@1.0.11/src/math/Euler.js, vendor/ogl@1.0.11/src/math/functions/Mat3Func.js, vendor/ogl@1.0.11/src/math/functions/Mat4Func.js, vendor/ogl@1.0.11/src/math/functions/QuatFunc.js, vendor/ogl@1.0.11/src/math/functions/EulerFunc.js, vendor/ogl@1.0.11/src/math/functions/Vec4Func.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(229, 230, 232) | 7.13 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 222, 225) | 14.11 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(220, 221, 224) | 6.56 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(220, 222, 225) | 5.13 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 248) | 17.84 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(38, 43, 56) | 7.07 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(230, 231, 232) | 7.19 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(220, 221, 224) | 13.98 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 219, 222) | 6.43 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 220, 222) | 5.03 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 247, 248) | 17.73 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
