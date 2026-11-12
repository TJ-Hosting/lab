# check-sample: lenticular-print — PASS

2026-10-28T11:58:30.946Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 9 local files: samples/lenticular-print/index.html, css/glass.css, css/lab.css, css/sample.css, samples/lenticular-print/piece.css, js/early.js, samples/lenticular-print/piece.js, js/lab.js, vendor/vanilla-tilt@1.8.1/vanilla-tilt.es2015.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 245, 249) | 8.13 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 241, 247) | 16.75 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 241, 247) | 6.10 | 4.5
1440 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(238, 244, 249) | 8.04 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 250) | 8.20 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(233, 239, 246) | 5.97 | 4.5
375 | .controls .btn | 0 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
