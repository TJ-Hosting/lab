# check-sample: shape-shifter — PASS

2026-10-28T05:30:10.098Z · Chromium WebGL: ANGLE (AMD, AMD Radeon (TM) Graphics (0x000015E7) Direct3D11 vs_5_0 ps_5_0, D3D11) · Firefox: not run (browserType.launch: spawn UNKNOWN)

## Notes
- loads 20 local files: samples/shape-shifter/index.html, css/glass.css, css/lab.css, css/sample.css, samples/shape-shifter/piece.css, js/early.js, samples/shape-shifter/piece.js, js/lab.js, vendor/three@0.186.1/build/three.module.js, vendor/three@0.186.1/addons/postprocessing/EffectComposer.js, vendor/three@0.186.1/addons/postprocessing/RenderPass.js, vendor/three@0.186.1/addons/postprocessing/UnrealBloomPass.js, vendor/three@0.186.1/addons/postprocessing/ShaderPass.js, vendor/three@0.186.1/addons/postprocessing/OutputPass.js, vendor/three@0.186.1/build/three.core.js, vendor/three@0.186.1/addons/shaders/CopyShader.js, vendor/three@0.186.1/addons/postprocessing/MaskPass.js, vendor/three@0.186.1/addons/postprocessing/Pass.js, vendor/three@0.186.1/addons/shaders/LuminosityHighPassShader.js, vendor/three@0.186.1/addons/shaders/OutputShader.js
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
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(228, 231, 237) | 7.19 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(219, 223, 231) | 14.21 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(218, 223, 230) | 6.65 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(218, 224, 231) | 5.20 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 249) | 17.85 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(23, 37, 61) | 7.67 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(231, 235, 240) | 7.44 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(221, 226, 234) | 14.59 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(219, 224, 228) | 6.70 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(219, 223, 228) | 5.17 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 4.5

Screenshots: chromium-1440.jpg, chromium-375.jpg, reduced-1440.jpg (sheet.jpg: all of them, not committed).
