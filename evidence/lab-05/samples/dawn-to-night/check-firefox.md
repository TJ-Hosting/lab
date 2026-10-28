# check-sample: dawn-to-night — PASS

2026-10-28T11:50:31.203Z · Firefox only (the Chromium record is check.md)

## Warnings
- firefox: nothing moves at rest without input (no idle life)

## Notes
- loads 8 local files: samples/dawn-to-night/index.html, css/glass.css, css/lab.css, css/sample.css, samples/dawn-to-night/piece.css, js/early.js, samples/dawn-to-night/piece.js, js/lab.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":false,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":false}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(237, 242, 249) | 7.92 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 237, 246) | 16.19 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 237, 246) | 7.58 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(236, 241, 247) | 6.09 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 246, 250) | 8.20 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(213, 226, 245) | 5.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
