# check-sample: halftone-dissolve — PASS

2026-10-28T11:51:33.048Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 11 local files: samples/halftone-dissolve/index.html, css/glass.css, css/lab.css, css/sample.css, samples/halftone-dissolve/piece.css, js/early.js, samples/halftone-dissolve/piece.js, js/lab.js, vendor/gsap@3.13.0/index.js, vendor/gsap@3.13.0/gsap-core.js, vendor/gsap@3.13.0/CSSPlugin.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(238, 241, 246) | 7.87 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(232, 237, 242) | 16.11 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(233, 238, 246) | 5.94 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(199, 216, 228) | 6.10 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 244, 248) | 8.05 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 238, 246) | 16.32 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 238, 245) | 7.63 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(210, 223, 244) | 5.14 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
