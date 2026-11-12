# check-sample: gpu-fluid — PASS

2026-10-28T11:49:11.112Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 8 local files: samples/gpu-fluid/index.html, css/glass.css, css/lab.css, css/sample.css, samples/gpu-fluid/piece.css, js/early.js, samples/gpu-fluid/piece.js, js/lab.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 246) | 7.85 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 236, 243) | 16.05 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 236, 243) | 7.52 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(232, 236, 243) | 5.84 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | light | rgb(170, 184, 210) | rgb(31, 57, 80) | 5.97 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(239, 242, 247) | 7.94 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 237, 243) | 16.16 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(232, 236, 244) | 7.52 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(209, 222, 243) | 5.09 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
375 | .controls .btn | 2 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
