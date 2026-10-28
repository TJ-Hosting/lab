# check-sample: glitch-headline — PASS

2026-10-28T11:46:35.671Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 8 local files: samples/glitch-headline/index.html, css/glass.css, css/lab.css, css/sample.css, samples/glitch-headline/piece.css, js/early.js, samples/glitch-headline/piece.js, js/lab.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 241, 247) | 6.10 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(238, 244, 249) | 8.04 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(238, 243, 247) | 16.99 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(213, 226, 245) | 5.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
