# check-sample: transition-slider — PASS

2026-10-28T05:19:51.958Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 73 local files: samples/transition-slider/index.html, css/glass.css, css/lab.css, css/sample.css, samples/transition-slider/piece.css, js/early.js, samples/transition-slider/piece.js, vendor/ogl@1.0.11/src/index.js, js/lab.js, samples/transition-slider/transitions.js, vendor/ogl@1.0.11/src/core/Geometry.js, vendor/ogl@1.0.11/src/core/Program.js, vendor/ogl@1.0.11/src/core/Renderer.js, vendor/ogl@1.0.11/src/core/Camera.js, vendor/ogl@1.0.11/src/core/Transform.js, vendor/ogl@1.0.11/src/core/Mesh.js, vendor/ogl@1.0.11/src/core/Texture.js, vendor/ogl@1.0.11/src/core/RenderTarget.js, vendor/ogl@1.0.11/src/math/Color.js, vendor/ogl@1.0.11/src/math/Euler.js, vendor/ogl@1.0.11/src/math/Mat3.js, vendor/ogl@1.0.11/src/math/Mat4.js, vendor/ogl@1.0.11/src/math/Quat.js, vendor/ogl@1.0.11/src/math/Vec2.js, vendor/ogl@1.0.11/src/math/Vec3.js, vendor/ogl@1.0.11/src/math/Vec4.js, vendor/ogl@1.0.11/src/extras/Plane.js, vendor/ogl@1.0.11/src/extras/Box.js, vendor/ogl@1.0.11/src/extras/Sphere.js, vendor/ogl@1.0.11/src/extras/Cylinder.js, vendor/ogl@1.0.11/src/extras/Triangle.js, vendor/ogl@1.0.11/src/extras/Torus.js, vendor/ogl@1.0.11/src/extras/Orbit.js, vendor/ogl@1.0.11/src/extras/Raycast.js, vendor/ogl@1.0.11/src/extras/Curve.js, vendor/ogl@1.0.11/src/extras/path/Path.js, vendor/ogl@1.0.11/src/extras/Tube.js, vendor/ogl@1.0.11/src/extras/Post.js, vendor/ogl@1.0.11/src/extras/Skin.js, vendor/ogl@1.0.11/src/extras/Animation.js, vendor/ogl@1.0.11/src/extras/Text.js, vendor/ogl@1.0.11/src/extras/NormalProgram.js, vendor/ogl@1.0.11/src/extras/Flowmap.js, vendor/ogl@1.0.11/src/extras/GPGPU.js, vendor/ogl@1.0.11/src/extras/Polyline.js, vendor/ogl@1.0.11/src/extras/Shadow.js, vendor/ogl@1.0.11/src/extras/KTXTexture.js, vendor/ogl@1.0.11/src/extras/TextureLoader.js, vendor/ogl@1.0.11/src/extras/GLTFLoader.js, vendor/ogl@1.0.11/src/extras/GLTFSkin.js, vendor/ogl@1.0.11/src/extras/GLTFAnimation.js, vendor/ogl@1.0.11/src/extras/DracoManager.js, vendor/ogl@1.0.11/src/extras/BasisManager.js, vendor/ogl@1.0.11/src/extras/WireMesh.js, vendor/ogl@1.0.11/src/extras/helpers/AxesHelper.js, vendor/ogl@1.0.11/src/extras/helpers/GridHelper.js, vendor/ogl@1.0.11/src/extras/helpers/VertexNormalsHelper.js, vendor/ogl@1.0.11/src/extras/helpers/FaceNormalsHelper.js, vendor/ogl@1.0.11/src/extras/InstancedMesh.js, vendor/ogl@1.0.11/src/extras/Texture3D.js, vendor/ogl@1.0.11/src/math/functions/ColorFunc.js, vendor/ogl@1.0.11/src/math/functions/EulerFunc.js, vendor/ogl@1.0.11/src/math/functions/Mat3Func.js, vendor/ogl@1.0.11/src/math/functions/Mat4Func.js, vendor/ogl@1.0.11/src/math/functions/QuatFunc.js, vendor/ogl@1.0.11/src/math/functions/Vec2Func.js, vendor/ogl@1.0.11/src/math/functions/Vec3Func.js, vendor/ogl@1.0.11/src/math/functions/Vec4Func.js, vendor/ogl@1.0.11/src/extras/path/CubicBezierSegment.js, vendor/ogl@1.0.11/src/extras/path/QuadraticBezierSegment.js, vendor/ogl@1.0.11/src/extras/path/LineSegment.js, vendor/ogl@1.0.11/src/extras/path/utils.js, vendor/ogl@1.0.11/src/extras/path/BaseSegment.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(227, 230, 235) | 7.12 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 223, 228) | 14.18 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 222, 226) | 6.59 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(221, 226, 232) | 5.31 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(248, 248, 250) | 17.90 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(247, 249, 250) | 17.98 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(245, 248, 251) | 8.36 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(243, 246, 250) | 17.51 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(241, 246, 250) | 6.36 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
