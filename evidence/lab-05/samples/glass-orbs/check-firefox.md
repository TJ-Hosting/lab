# check-sample: glass-orbs — PASS

2026-10-28T11:48:17.931Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 11 local files: samples/glass-orbs/index.html, css/glass.css, css/lab.css, css/sample.css, samples/glass-orbs/piece.css, js/early.js, samples/glass-orbs/piece.js, js/lab.js, vendor/three@0.186.1/build/three.module.js, vendor/three@0.186.1/addons/environments/RoomEnvironment.js, vendor/three@0.186.1/build/three.core.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 244, 250) | 8.09 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(236, 240, 247) | 16.61 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(236, 240, 247) | 7.79 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(236, 241, 247) | 6.09 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(229, 238, 248) | 7.60 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 241, 248) | 16.76 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(235, 240, 247) | 7.78 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(212, 225, 246) | 5.24 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
