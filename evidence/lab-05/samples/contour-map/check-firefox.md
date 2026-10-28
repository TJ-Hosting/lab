# check-sample: contour-map — PASS

2026-10-28T11:47:43.100Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 9 local files: samples/contour-map/index.html, css/glass.css, css/lab.css, css/sample.css, samples/contour-map/piece.css, js/early.js, samples/contour-map/piece.js, js/lab.js, samples/contour-map/noise.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(238, 242, 248) | 7.93 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(232, 238, 246) | 16.26 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(233, 237, 245) | 7.59 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(232, 238, 245) | 5.92 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(202, 208, 223) | 5.77 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(240, 243, 248) | 8.01 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(234, 239, 245) | 16.42 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 237, 244) | 7.57 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(210, 223, 244) | 5.14 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
