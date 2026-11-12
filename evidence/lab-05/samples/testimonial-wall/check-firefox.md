# check-sample: testimonial-wall — PASS

2026-10-28T11:54:13.576Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 8 local files: samples/testimonial-wall/index.html, css/glass.css, css/lab.css, css/sample.css, samples/testimonial-wall/piece.css, js/early.js, samples/testimonial-wall/piece.js, js/lab.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 243, 249) | 8.00 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 240, 247) | 16.52 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(234, 239, 246) | 7.71 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 241, 247) | 6.10 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(237, 242, 248) | 7.91 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 245, 249) | 8.13 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 241, 247) | 16.75 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(235, 240, 247) | 7.78 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(213, 226, 245) | 5.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
