# check-sample: shape-shifter — PASS

2026-10-28T11:48:58.807Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 20 local files: samples/shape-shifter/index.html, css/glass.css, css/lab.css, css/sample.css, samples/shape-shifter/piece.css, js/early.js, samples/shape-shifter/piece.js, js/lab.js, vendor/three@0.186.1/build/three.module.js, vendor/three@0.186.1/addons/postprocessing/EffectComposer.js, vendor/three@0.186.1/addons/postprocessing/RenderPass.js, vendor/three@0.186.1/addons/postprocessing/UnrealBloomPass.js, vendor/three@0.186.1/addons/postprocessing/ShaderPass.js, vendor/three@0.186.1/addons/postprocessing/OutputPass.js, vendor/three@0.186.1/build/three.core.js, vendor/three@0.186.1/addons/shaders/CopyShader.js, vendor/three@0.186.1/addons/postprocessing/MaskPass.js, vendor/three@0.186.1/addons/postprocessing/Pass.js, vendor/three@0.186.1/addons/shaders/LuminosityHighPassShader.js, vendor/three@0.186.1/addons/shaders/OutputShader.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(238, 242, 247) | 7.92 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(232, 237, 243) | 16.13 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 236, 243) | 7.52 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(232, 236, 243) | 5.84 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(43, 58, 79) | 5.76 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 243, 248) | 7.99 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 239, 245) | 16.42 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 237, 243) | 7.57 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(209, 222, 242) | 5.08 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
