Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
exhibit | 1440 | top | .banner__text | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
exhibit | 1440 | top | .banner__badge | 0 | 11 | dark | rgb(31, 13, 0) | rgb(255, 143, 62) | 8.29 | 4.5 | pass
exhibit | 1440 | top | .banner .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
exhibit | 1440 | top | .banner .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
exhibit | 1440 | top | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(227, 240, 250) | 16.37 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter h2 | 0 | 38 | dark | rgb(7, 16, 34) | rgb(241, 246, 248) | 17.43 | 3 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 0 | 18 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 1 | 18 | dark | rgb(59, 74, 102) | rgb(239, 247, 249) | 8.21 | 4.5 | pass
exhibit | 1440 | #ch-1 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter h2 | 0 | 38 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 3 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 0 | 18 | dark | rgb(59, 74, 102) | rgb(237, 246, 249) | 8.12 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 1 | 18 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 2 | 18 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
exhibit | 1440 | #ch-4 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | #ch-6 | .chapter h2 | 0 | 38 | light | rgb(238, 244, 255) | rgb(17, 37, 55) | 14.16 | 3 | pass
exhibit | 1440 | #ch-6 | .chapter__text p | 0 | 18 | light | rgb(170, 184, 210) | rgb(15, 30, 46) | 8.43 | 4.5 | pass
exhibit | 1440 | #ch-6 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(247, 249, 251) | 8.44 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 1440 | .colophon | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(238, 244, 248) | 17.11 | 4.5 | pass
exhibit | 1440 | bottom | .colophon p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(237, 246, 249) | 8.12 | 4.5 | pass
exhibit | 1440 | bottom | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 0 | 14.5 | light | rgb(170, 184, 210) | rgb(7, 11, 22) | 9.82 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 1 | 11.5 | light | rgb(141, 157, 189) | rgb(7, 11, 22) | 7.20 | 4.5 | pass
exhibit | 1440 | bottom | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(199, 202, 205) | 11.53 | 4.5 | pass
hub | 1440 | top | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(250, 253, 254) | 8.72 | 4.5 | pass
hub | 1440 | top | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
hub | 1440 | top | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
hub | 1440 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(213, 226, 243) | 6.79 | 4.5 | pass
hub | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 252) | 8.13 | 4.5 | pass
hub | 1440 | top | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
hub | 1440 | top | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
hub | 1440 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(246, 251, 255) | 8.55 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(245, 250, 255) | 8.48 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(222, 229, 238) | 7.02 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 1 | 12 | dark | rgb(59, 74, 102) | rgb(225, 232, 241) | 7.22 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 2 | 12 | dark | rgb(59, 74, 102) | rgb(221, 229, 238) | 7.01 | 4.5 | pass
hub | 1440 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(242, 245, 248) | 17.35 | 3 | pass
hub | 1440 | bottom | .tile h2 | 1 | 22 | dark | rgb(7, 16, 34) | rgb(241, 246, 249) | 17.44 | 3 | pass
hub | 1440 | bottom | .tile h2 | 2 | 22 | dark | rgb(7, 16, 34) | rgb(240, 245, 248) | 17.28 | 3 | pass
hub | 1440 | bottom | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(222, 229, 238) | 7.02 | 4.5 | pass
hub | 1440 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 247, 250) | 8.29 | 4.5 | pass
hub | 1440 | bottom | .tile p | 2 | 12 | dark | rgb(59, 74, 102) | rgb(225, 232, 241) | 7.22 | 4.5 | pass
hub | 1440 | bottom | .tile p | 3 | 15.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 250) | 8.27 | 4.5 | pass
hub | 1440 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(8, 13, 25) | 9.70 | 4.5 | pass
hub | 1440 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(7, 13, 25) | 17.60 | 4.5 | pass
hub | 1440 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 12, 23) | 17.69 | 4.5 | pass
hub | 1440 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(7, 12, 23) | 17.71 | 4.5 | pass
check | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 252) | 8.13 | 4.5 | pass
check | 1440 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(231, 240, 248) | 7.73 | 4.5 | pass
check | 1440 | top | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(243, 248, 249) | 17.72 | 4.5 | pass
check | 1440 | top | .field label | 1 | 13.5 | dark | rgb(7, 16, 34) | rgb(243, 247, 249) | 17.61 | 4.5 | pass
check | 1440 | top | .field label | 2 | 13.5 | dark | rgb(7, 16, 34) | rgb(242, 247, 249) | 17.58 | 4.5 | pass
check | 1440 | top | .field label | 3 | 13.5 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 244, 251) | 8.05 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(235, 242, 249) | 16.81 | 4.5 | pass
check | 1440 | [data-action="example"] | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 0 | 14 | dark | rgb(143, 28, 34) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 1 | 14 | dark | rgb(7, 92, 55) | rgb(229, 244, 236) | 7.12 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 2 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 251) | 8.21 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 3 | 14 | dark | rgb(122, 69, 0) | rgb(255, 243, 220) | 7.13 | 4.5 | pass
check | 1440 | [data-action="example"] | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 254) | 18.67 | 4.5 | pass
check | 1440 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 1440 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 1440 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 1440 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 253, 253) | 8.73 | 4.5 | pass
check | 1440 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(223, 237, 248) | 7.47 | 4.5 | pass
check | 1440 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(223, 237, 248) | 7.47 | 4.5 | pass
check | 1440 | #results | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(248, 249, 251) | 18.02 | 4.5 | pass
check | 1440 | #results | .seg label | 3 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 254) | 18.67 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 253, 253) | 8.73 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 1440 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(233, 241, 249) | 7.81 | 4.5 | pass
check | 1440 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(225, 235, 248) | 7.40 | 4.5 | pass
check | 1440 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(225, 235, 248) | 7.40 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #share | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 1440 | #share | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 1440 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 253, 253) | 8.73 | 4.5 | pass
check | 1440 | #share | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #share | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 1440 | #share | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
scoreboard | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 252) | 8.13 | 4.5 | pass
scoreboard | 1440 | top | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(244, 248, 250) | 8.34 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 247, 248) | 8.24 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 248) | 8.19 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
scoreboard | 1440 | top | #board td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | top | #board td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | top | #board td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | top | #board td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | top | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 2 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 3 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(237, 245, 250) | 8.08 | 4.5 | pass
scoreboard | 1440 | #board | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 252) | 8.13 | 4.5 | pass
scoreboard | 1440 | #board | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(244, 248, 250) | 8.34 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 247, 248) | 8.24 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 248) | 8.19 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(255, 250, 240) | 18.25 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 2 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 3 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(237, 245, 250) | 8.08 | 4.5 | pass
about | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(235, 245, 252) | 8.06 | 4.5 | pass
about | 1440 | top | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
about | 1440 | top | .prose p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 246, 250) | 8.17 | 4.5 | pass
about | 1440 | top | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
about | 1440 | #method | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
about | 1440 | #method | .prose p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
about | 1440 | #method | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
about | 1440 | #method | .prose li | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
about | 1440 | #method | .prose li | 2 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
about | 1440 | #method | #techniques td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
exhibit | 375 | top | .banner__text | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
exhibit | 375 | top | .banner__badge | 0 | 11 | dark | rgb(31, 13, 0) | rgb(255, 143, 62) | 8.29 | 4.5 | pass
exhibit | 375 | top | .banner .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
exhibit | 375 | top | .banner .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
exhibit | 375 | top | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(216, 230, 246) | 14.98 | 4.5 | pass
exhibit | 375 | #ch-1 | .chapter h2 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 3 | pass
exhibit | 375 | #ch-1 | .chapter__text p | 0 | 16.5 | dark | rgb(59, 74, 102) | rgb(240, 246, 250) | 8.17 | 4.5 | pass
exhibit | 375 | #ch-1 | .chapter__text p | 1 | 16.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
exhibit | 375 | #ch-1 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(239, 246, 250) | 17.39 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter h2 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 3 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 0 | 16.5 | dark | rgb(59, 74, 102) | rgb(237, 244, 248) | 8.02 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 1 | 16.5 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 2 | 16.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
exhibit | 375 | #ch-4 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 375 | #ch-6 | .chapter h2 | 0 | 26 | light | rgb(238, 244, 255) | rgb(17, 37, 53) | 14.20 | 3 | pass
exhibit | 375 | #ch-6 | .chapter__text p | 0 | 16.5 | light | rgb(170, 184, 210) | rgb(13, 29, 44) | 8.54 | 4.5 | pass
exhibit | 375 | #ch-6 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(234, 243, 249) | 16.89 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(248, 250, 251) | 8.51 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
exhibit | 375 | .colophon | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 375 | .colophon | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(234, 243, 249) | 16.89 | 4.5 | pass
exhibit | 375 | bottom | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 0 | 14.5 | light | rgb(170, 184, 210) | rgb(9, 19, 37) | 9.28 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 1 | 11.5 | light | rgb(141, 157, 189) | rgb(8, 13, 24) | 7.11 | 4.5 | pass
exhibit | 375 | bottom | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(199, 202, 205) | 11.53 | 4.5 | pass
hub | 375 | top | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(250, 253, 254) | 8.72 | 4.5 | pass
hub | 375 | top | .topnav a | 1 | 14 | dark | rgb(59, 74, 102) | rgb(243, 250, 255) | 8.45 | 4.5 | pass
hub | 375 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 237, 251) | 7.29 | 4.5 | pass
hub | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(220, 234, 251) | 7.30 | 4.5 | pass
hub | 375 | top | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(248, 250, 250) | 18.12 | 3 | pass
hub | 375 | top | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(245, 247, 249) | 8.30 | 4.5 | pass
hub | 375 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 375 | bottom | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
hub | 375 | bottom | .topnav a | 1 | 14 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
hub | 375 | bottom | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(222, 229, 238) | 7.02 | 4.5 | pass
hub | 375 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(241, 245, 248) | 17.32 | 3 | pass
hub | 375 | bottom | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(222, 229, 238) | 7.02 | 4.5 | pass
hub | 375 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
hub | 375 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(7, 11, 22) | 9.82 | 4.5 | pass
hub | 375 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 25) | 17.58 | 4.5 | pass
hub | 375 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 27) | 17.47 | 4.5 | pass
hub | 375 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 27) | 17.47 | 4.5 | pass
check | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(226, 236, 252) | 7.48 | 4.5 | pass
check | 375 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(234, 242, 251) | 7.89 | 4.5 | pass
check | 375 | top | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 4.5 | pass
check | 375 | top | .field label | 1 | 13.5 | dark | rgb(7, 16, 34) | rgb(239, 246, 249) | 17.37 | 4.5 | pass
check | 375 | top | .field label | 2 | 13.5 | dark | rgb(7, 16, 34) | rgb(237, 246, 249) | 17.31 | 4.5 | pass
check | 375 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(236, 243, 251) | 7.97 | 4.5 | pass
check | 375 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(237, 242, 251) | 16.90 | 4.5 | pass
check | 375 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 0 | 14 | dark | rgb(143, 28, 34) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 1 | 14 | dark | rgb(7, 92, 55) | rgb(229, 244, 236) | 7.12 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 2 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 251) | 8.21 | 4.5 | pass
check | 375 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 375 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 375 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(251, 253, 253) | 8.73 | 4.5 | pass
check | 375 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #results | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 375 | #results | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(235, 242, 251) | 7.90 | 4.5 | pass
check | 375 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
check | 375 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
check | 375 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
scoreboard | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(220, 234, 251) | 7.30 | 4.5 | pass
scoreboard | 375 | top | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | top | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | #board | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(220, 234, 251) | 7.30 | 4.5 | pass
scoreboard | 375 | #board | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | #board | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
about | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(226, 236, 252) | 7.48 | 4.5 | pass
about | 375 | top | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(239, 245, 249) | 8.10 | 4.5 | pass
about | 375 | #method | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 248) | 8.15 | 4.5 | pass
about | 375 | #method | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
about | 375 | #method | .prose li | 1 | 16 | dark | rgb(59, 74, 102) | rgb(237, 245, 250) | 8.08 | 4.5 | pass
about | 375 | #method | #techniques td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 375 | #method | #techniques td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass

257 measurements, 257 pass, 0 fail. Lowest ratio: 6.11. Selectors never measured: none.
