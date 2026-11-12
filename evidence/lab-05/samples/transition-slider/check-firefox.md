# check-sample: transition-slider — PASS

2026-10-28T11:57:50.778Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 27 local files: samples/transition-slider/index.html, css/glass.css, css/lab.css, css/sample.css, samples/transition-slider/piece.css, js/early.js, samples/transition-slider/piece.js, vendor/ogl@1.0.11/src/core/Renderer.js, vendor/ogl@1.0.11/src/core/Program.js, vendor/ogl@1.0.11/src/core/Mesh.js, vendor/ogl@1.0.11/src/core/Texture.js, vendor/ogl@1.0.11/src/extras/Triangle.js, js/lab.js, samples/transition-slider/transitions.js, vendor/ogl@1.0.11/src/math/Vec3.js, vendor/ogl@1.0.11/src/core/Transform.js, vendor/ogl@1.0.11/src/math/Mat3.js, vendor/ogl@1.0.11/src/math/Mat4.js, vendor/ogl@1.0.11/src/core/Geometry.js, vendor/ogl@1.0.11/src/math/functions/Vec3Func.js, vendor/ogl@1.0.11/src/math/Quat.js, vendor/ogl@1.0.11/src/math/Euler.js, vendor/ogl@1.0.11/src/math/functions/Mat3Func.js, vendor/ogl@1.0.11/src/math/functions/Mat4Func.js, vendor/ogl@1.0.11/src/math/functions/QuatFunc.js, vendor/ogl@1.0.11/src/math/functions/EulerFunc.js, vendor/ogl@1.0.11/src/math/functions/Vec4Func.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 246) | 7.85 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 236, 242) | 16.04 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 236, 242) | 7.51 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(232, 236, 243) | 5.84 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(236, 241, 247) | 7.84 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(213, 226, 245) | 5.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
