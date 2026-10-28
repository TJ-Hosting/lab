# check-sample: frosted-window — PASS

2026-10-28T10:10:30.820Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 30 local files: samples/frosted-window/index.html, css/glass.css, css/lab.css, css/sample.css, samples/frosted-window/piece.css, js/early.js, samples/frosted-window/piece.js, vendor/ogl@1.0.11/src/core/Renderer.js, vendor/ogl@1.0.11/src/core/Program.js, vendor/ogl@1.0.11/src/core/Mesh.js, vendor/ogl@1.0.11/src/core/Texture.js, vendor/ogl@1.0.11/src/extras/Triangle.js, vendor/ogl@1.0.11/src/extras/Flowmap.js, js/lab.js, vendor/ogl@1.0.11/src/math/Vec3.js, vendor/ogl@1.0.11/src/core/Transform.js, vendor/ogl@1.0.11/src/math/Mat3.js, vendor/ogl@1.0.11/src/math/Mat4.js, vendor/ogl@1.0.11/src/core/Geometry.js, vendor/ogl@1.0.11/src/core/RenderTarget.js, vendor/ogl@1.0.11/src/math/Vec2.js, vendor/ogl@1.0.11/src/math/functions/Vec3Func.js, vendor/ogl@1.0.11/src/math/Quat.js, vendor/ogl@1.0.11/src/math/Euler.js, vendor/ogl@1.0.11/src/math/functions/Mat3Func.js, vendor/ogl@1.0.11/src/math/functions/Mat4Func.js, vendor/ogl@1.0.11/src/math/functions/Vec2Func.js, vendor/ogl@1.0.11/src/math/functions/QuatFunc.js, vendor/ogl@1.0.11/src/math/functions/EulerFunc.js, vendor/ogl@1.0.11/src/math/functions/Vec4Func.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(233, 235, 239) | 7.46 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(225, 229, 235) | 15.01 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(224, 228, 235) | 6.99 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(231, 234, 238) | 5.73 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(250, 250, 250) | 18.19 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(53, 65, 83) | 5.16 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(237, 242, 250) | 7.93 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(231, 239, 250) | 16.38 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(226, 232, 241) | 7.23 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(227, 233, 240) | 5.66 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(249, 250, 251) | 18.17 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
