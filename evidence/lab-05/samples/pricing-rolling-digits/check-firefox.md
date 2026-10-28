# check-sample: pricing-rolling-digits — PASS

2026-10-28T11:53:25.505Z · Firefox only (the Chromium record is check.md)

## Notes
- loads 16 local files: samples/pricing-rolling-digits/index.html, css/glass.css, css/lab.css, css/sample.css, samples/pricing-rolling-digits/piece.css, js/early.js, samples/pricing-rolling-digits/piece.js, vendor/number-flow@0.6.2/index.mjs, js/lab.js, vendor/number-flow@0.6.2/lite.mjs, vendor/number-flow@0.6.2/ssr-DvIINv8w.mjs, vendor/number-flow@0.6.2/csp.mjs, vendor/number-flow@0.6.2/plugins.mjs, vendor/number-flow@0.6.2/esm-env@1.2.2/index.js, vendor/number-flow@0.6.2/esm-env@1.2.2/true.js, vendor/number-flow@0.6.2/esm-env@1.2.2/false.js
- Firefox 142.0.1

## Motion
- reduced motion: {"anims":[],"loops":[],"rafPerSecond":0}
- hidden tab: {"movingBefore":true,"hiddenRafIn1500ms":0,"hiddenAnims":[],"hiddenLoops":[],"resumed":true}
- frame time: not measured in Firefox

## Shell contrast (Firefox)
width | selector | # | polarity | text | worst behind | ratio | need
---|---|---|---|---|---|---|---
1440 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5
1440 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(237, 241, 247) | 16.75 | 3
1440 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5
1440 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(237, 241, 247) | 6.10 | 4.5
1440 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
1440 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5
1440 | .hint | 0 | dark | rgb(59, 74, 102) | rgb(233, 240, 246) | 7.75 | 4.5
375 | .sample-info .eyebrow | 0 | dark | rgb(59, 74, 102) | rgb(241, 245, 250) | 8.14 | 4.5
375 | .sample-info h1 | 0 | dark | rgb(7, 16, 34) | rgb(233, 238, 247) | 16.31 | 3
375 | .sample-info .how | 0 | dark | rgb(59, 74, 102) | rgb(235, 239, 246) | 7.72 | 4.5
375 | .controls .back | 0 | dark | rgb(6, 75, 219) | rgb(213, 226, 245) | 5.28 | 4.5
375 | .controls .btn | 0 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5
375 | .controls .btn | 1 | dark | rgb(7, 16, 34) | rgb(244, 248, 253) | 17.80 | 4.5

Screenshots: firefox-1440.jpg, firefox-375.jpg, firefox-reduced-1440.jpg.
