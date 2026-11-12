# check-sample: frosted-window — PASS

2026-10-28T11:58:37.013Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 30 local files: samples/frosted-window/index.html, css/glass.css, css/lab.css, css/sample.css, samples/frosted-window/piece.css, js/early.js, samples/frosted-window/piece.js, vendor/ogl@1.0.11/src/core/Renderer.js, vendor/ogl@1.0.11/src/core/Program.js, vendor/ogl@1.0.11/src/core/Mesh.js, vendor/ogl@1.0.11/src/core/Texture.js, vendor/ogl@1.0.11/src/extras/Triangle.js, vendor/ogl@1.0.11/src/extras/Flowmap.js, js/lab.js, vendor/ogl@1.0.11/src/math/Vec3.js, vendor/ogl@1.0.11/src/core/Transform.js, vendor/ogl@1.0.11/src/math/Mat3.js, vendor/ogl@1.0.11/src/math/Mat4.js, vendor/ogl@1.0.11/src/core/Geometry.js, vendor/ogl@1.0.11/src/core/RenderTarget.js, vendor/ogl@1.0.11/src/math/Vec2.js, vendor/ogl@1.0.11/src/math/functions/Vec3Func.js, vendor/ogl@1.0.11/src/math/Quat.js, vendor/ogl@1.0.11/src/math/Euler.js, vendor/ogl@1.0.11/src/math/functions/Mat3Func.js, vendor/ogl@1.0.11/src/math/functions/Mat4Func.js, vendor/ogl@1.0.11/src/math/functions/Vec2Func.js, vendor/ogl@1.0.11/src/math/functions/QuatFunc.js, vendor/ogl@1.0.11/src/math/functions/EulerFunc.js, vendor/ogl@1.0.11/src/math/functions/Vec4Func.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 242, 247) | 7.94 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 238, 244) | 16.27 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(234, 239, 245) | 5.98 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(56, 66, 82) | 5.07 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 245, 249) | 8.13 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(236, 240, 248) | 16.62 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(234, 239, 246) | 7.71 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(210, 223, 244) | 5.14 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
