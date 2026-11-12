Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
humanity-type | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(247, 249, 250) | 8.44 | 4.5 | pass
humanity-type | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(243, 247, 250) | 17.62 | 3 | pass
humanity-type | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(238, 244, 250) | 8.04 | 4.5 | pass
humanity-type | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(244, 247, 250) | 6.43 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
particle-field | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(228, 229, 232) | 7.07 | 4.5 | pass
particle-field | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(219, 221, 226) | 13.97 | 3 | pass
particle-field | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(218, 221, 224) | 6.53 | 4.5 | pass
particle-field | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(218, 222, 227) | 5.12 | 4.5 | pass
particle-field | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(47, 43, 48) | 6.96 | 4.5 | pass
logo | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(247, 249, 251) | 8.44 | 4.5 | pass
logo | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(244, 247, 249) | 17.64 | 3 | pass
logo | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(236, 243, 250) | 7.96 | 4.5 | pass
logo | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(244, 247, 250) | 6.43 | 4.5 | pass
humanity-type | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(247, 249, 251) | 8.44 | 4.5 | pass
humanity-type | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3 | pass
humanity-type | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
humanity-type | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(241, 247, 249) | 6.39 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
particle-field | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(230, 231, 232) | 7.19 | 4.5 | pass
particle-field | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(221, 221, 225) | 14.02 | 3 | pass
particle-field | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(218, 220, 222) | 6.48 | 4.5 | pass
particle-field | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(218, 220, 222) | 5.03 | 4.5 | pass
logo | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(247, 249, 251) | 8.44 | 4.5 | pass
logo | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
logo | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
logo | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(241, 247, 249) | 6.39 | 4.5 | pass

29 measurements, 29 pass, 0 fail. Lowest ratio: 5.03. Selectors never measured: none.
