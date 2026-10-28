Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
check | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(235, 246, 252) | 8.11 | 4.5 | pass
check | 1440 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
check | 1440 | top | .field label | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 250) | 8.27 | 4.5 | pass
check | 1440 | top | .field label | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
check | 1440 | top | .field label | 2 | 13.5 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
check | 1440 | top | .field label | 3 | 13.5 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(248, 250, 252) | 8.51 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
check | 1440 | [data-action="example"] | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 0 | 14 | light | rgb(255, 214, 223) | rgb(251, 218, 226) | 1.02 | 4.5 | FAIL
check | 1440 | [data-action="example"] | .chip | 1 | 14 | light | rgb(201, 255, 235) | rgb(214, 246, 234) | 1.04 | 4.5 | FAIL
check | 1440 | [data-action="example"] | .chip | 2 | 14 | light | rgb(227, 222, 250) | rgb(239, 240, 249) | 1.15 | 4.5 | FAIL
check | 1440 | [data-action="example"] | .chip | 3 | 14 | light | rgb(255, 230, 191) | rgb(251, 242, 224) | 1.09 | 4.5 | FAIL
check | 1440 | [data-action="example"] | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(247, 250, 251) | 18.10 | 4.5 | pass
check | 1440 | #results | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(248, 250, 252) | 8.51 | 4.5 | pass
check | 1440 | #results | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(248, 249, 251) | 8.46 | 4.5 | pass
check | 1440 | #results | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(248, 249, 251) | 8.46 | 4.5 | pass
check | 1440 | #results | .chip | 0 | 14 | light | rgb(255, 214, 223) | rgb(253, 218, 226) | 1.02 | 4.5 | FAIL
check | 1440 | #results | .chip | 1 | 14 | light | rgb(201, 255, 235) | rgb(216, 246, 234) | 1.04 | 4.5 | FAIL
check | 1440 | #results | .chip | 2 | 14 | light | rgb(227, 222, 250) | rgb(241, 240, 249) | 1.15 | 4.5 | FAIL
check | 1440 | #results | .chip | 3 | 14 | light | rgb(255, 230, 191) | rgb(252, 242, 224) | 1.09 | 4.5 | FAIL
check | 1440 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(249, 251, 251) | 18.28 | 4.5 | pass
check | 1440 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(247, 250, 250) | 18.09 | 4.5 | pass
check | 1440 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(245, 248, 249) | 17.79 | 4.5 | pass
check | 1440 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(245, 248, 250) | 17.80 | 4.5 | pass
check | 1440 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(249, 250, 252) | 8.53 | 4.5 | pass
check | 1440 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(246, 248, 250) | 8.37 | 4.5 | pass
check | 1440 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(244, 247, 249) | 8.28 | 4.5 | pass
check | 1440 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(242, 248, 249) | 8.30 | 4.5 | pass
check | 1440 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(163, 164, 164) | 3.56 | 4.5 | FAIL
check | 1440 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(163, 164, 164) | 3.56 | 4.5 | FAIL
check | 1440 | #results | .seg label | 2 | 13 | dark | rgb(25, 18, 48) | rgb(214, 208, 240) | 12.08 | 4.5 | pass
check | 1440 | #results | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(161, 163, 164) | 3.52 | 4.5 | FAIL
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(248, 249, 250) | 18.01 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(247, 236, 239) | 16.45 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(246, 249, 249) | 17.93 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(245, 248, 249) | 17.79 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(242, 248, 249) | 8.30 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(245, 235, 239) | 7.64 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(158, 161, 163) | 3.43 | 4.5 | FAIL
check | 1440 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(158, 161, 162) | 3.42 | 4.5 | FAIL
check | 1440 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(25, 18, 48) | rgb(214, 208, 240) | 12.08 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | dark | rgb(42, 6, 16) | rgb(255, 122, 149) | 7.48 | 4.5 | pass
check | 1440 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
check | 1440 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(225, 235, 248) | 7.40 | 4.5 | pass
check | 1440 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(225, 235, 248) | 7.40 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #share | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(247, 249, 249) | 17.96 | 4.5 | pass
check | 1440 | #share | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(247, 249, 249) | 17.96 | 4.5 | pass
check | 1440 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(244, 247, 250) | 8.29 | 4.5 | pass
check | 1440 | #share | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
check | 1440 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(157, 161, 162) | 3.42 | 4.5 | FAIL
check | 1440 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(159, 161, 163) | 3.44 | 4.5 | FAIL
check | 1440 | #share | .seg label | 2 | 13 | dark | rgb(25, 18, 48) | rgb(214, 208, 240) | 12.08 | 4.5 | pass
check | 1440 | #share | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(159, 161, 163) | 3.44 | 4.5 | FAIL
check | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(227, 238, 252) | 7.59 | 4.5 | pass
check | 375 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(245, 248, 250) | 8.35 | 4.5 | pass
check | 375 | top | .field label | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
check | 375 | top | .field label | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
check | 375 | top | .field label | 2 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 245, 250) | 8.09 | 4.5 | pass
check | 375 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(248, 250, 251) | 8.51 | 4.5 | pass
check | 375 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(242, 247, 250) | 8.26 | 4.5 | pass
check | 375 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 0 | 14 | light | rgb(255, 214, 223) | rgb(251, 218, 227) | 1.02 | 4.5 | FAIL
check | 375 | [data-action="example"] | .chip | 1 | 14 | light | rgb(201, 255, 235) | rgb(212, 244, 234) | 1.06 | 4.5 | FAIL
check | 375 | [data-action="example"] | .chip | 2 | 14 | light | rgb(227, 222, 250) | rgb(238, 239, 249) | 1.14 | 4.5 | FAIL
check | 375 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(245, 248, 249) | 17.79 | 4.5 | pass
check | 375 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(246, 249, 249) | 17.93 | 4.5 | pass
check | 375 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(245, 235, 239) | 16.28 | 4.5 | pass
check | 375 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(243, 248, 249) | 17.72 | 4.5 | pass
check | 375 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
check | 375 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
check | 375 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(244, 235, 239) | 7.63 | 4.5 | pass
check | 375 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
check | 375 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(161, 162, 163) | 3.48 | 4.5 | FAIL
check | 375 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(160, 161, 163) | 3.45 | 4.5 | FAIL
check | 375 | #results | .seg label | 2 | 13 | dark | rgb(25, 18, 48) | rgb(214, 208, 240) | 12.08 | 4.5 | pass
check | 375 | #results | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(161, 162, 163) | 3.48 | 4.5 | FAIL
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(246, 249, 249) | 17.93 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(245, 248, 249) | 17.79 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(244, 235, 239) | 16.25 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(243, 235, 239) | 7.61 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(242, 234, 239) | 7.55 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | dark | rgb(42, 6, 16) | rgb(255, 122, 149) | 7.48 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(160, 152, 156) | 3.17 | 4.5 | FAIL
check | 375 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(59, 74, 102) | rgb(159, 152, 156) | 3.16 | 4.5 | FAIL
check | 375 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(161, 162, 163) | 3.48 | 4.5 | FAIL
check | 375 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
check | 375 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
check | 375 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
check | 375 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(245, 247, 250) | 8.30 | 4.5 | pass
check | 375 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(161, 162, 163) | 3.48 | 4.5 | FAIL
check | 375 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(160, 161, 163) | 3.45 | 4.5 | FAIL
check | 375 | #share | .seg label | 2 | 13 | dark | rgb(25, 18, 48) | rgb(214, 208, 240) | 12.08 | 4.5 | pass

103 measurements, 76 pass, 27 fail. Lowest ratio: 1.02. Selectors never measured: none.
