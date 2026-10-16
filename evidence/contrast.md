Contrast of text on glass, WCAG 2.x, measured in headless Chromium at 1440×900.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (the backdrop drifts), and compare with the brightest pixel inside the element's content box (where the glyphs sit) across the 3 frames. Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | scrolled to | selector | # | px | text colour | brightest behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---
home | top | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(48, 37, 94) | 10.82 | 4.5 | pass
home | top | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(59, 42, 111) | 9.62 | 4.5 | pass
home | top | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(66, 47, 116) | 8.89 | 4.5 | pass
home | top | .hero__panel .eyebrow | 0 | 12 | rgb(211, 203, 238) | rgb(25, 91, 132) | 4.72 | 4.5 | pass
home | top | .hero__panel .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(70, 48, 63) | 9.57 | 4.5 | pass
home | top | .hero__facts li | 0 | 14 | rgb(211, 203, 238) | rgb(17, 12, 50) | 12.07 | 4.5 | pass
home | top | .hero__facts li | 1 | 14 | rgb(211, 203, 238) | rgb(17, 12, 50) | 12.07 | 4.5 | pass
home | top | .hero__facts li | 2 | 14 | rgb(211, 203, 238) | rgb(22, 11, 53) | 11.95 | 4.5 | pass
home | top | .hero__cta .btn | 0 | 15 | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
home | top | .hero__cta .btn | 1 | 15 | rgb(255, 255, 255) | rgb(19, 10, 45) | 18.94 | 4.5 | pass
home | #samples | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(46, 35, 93) | 11.09 | 4.5 | pass
home | #samples | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(59, 42, 111) | 9.62 | 4.5 | pass
home | #samples | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(66, 47, 116) | 8.89 | 4.5 | pass
home | #samples | .section__head p:not(.eyebrow) | 0 | 17 | rgb(232, 227, 250) | rgb(59, 54, 66) | 9.37 | 4.5 | pass
home | #samples | .card__kicker | 0 | 12 | rgb(211, 203, 238) | rgb(25, 12, 55) | 11.79 | 4.5 | pass
home | #samples | .card__kicker | 1 | 12 | rgb(211, 203, 238) | rgb(43, 28, 90) | 9.56 | 4.5 | pass
home | #samples | .card__kicker | 2 | 12 | rgb(211, 203, 238) | rgb(45, 30, 93) | 9.31 | 4.5 | pass
home | #samples | .card__title | 0 | 25 | rgb(246, 243, 255) | rgb(21, 12, 52) | 16.92 | 3 | pass
home | #samples | .card__title | 1 | 25 | rgb(246, 243, 255) | rgb(42, 28, 89) | 13.62 | 3 | pass
home | #samples | .card__title | 2 | 25 | rgb(246, 243, 255) | rgb(39, 25, 101) | 13.57 | 3 | pass
home | #samples | .card__blurb | 0 | 16 | rgb(232, 227, 250) | rgb(22, 12, 52) | 14.78 | 4.5 | pass
home | #samples | .card__blurb | 1 | 16 | rgb(232, 227, 250) | rgb(38, 26, 81) | 12.45 | 4.5 | pass
home | #samples | .card__blurb | 2 | 16 | rgb(232, 227, 250) | rgb(37, 24, 91) | 12.35 | 4.5 | pass
home | #samples | .tags li | 0 | 11.5 | rgb(232, 227, 250) | rgb(35, 30, 66) | 12.58 | 4.5 | pass
home | #samples | .tags li | 1 | 11.5 | rgb(232, 227, 250) | rgb(33, 33, 70) | 12.26 | 4.5 | pass
home | #samples | .tags li | 2 | 11.5 | rgb(232, 227, 250) | rgb(40, 34, 75) | 11.83 | 4.5 | pass
home | #samples | .tags li | 3 | 11.5 | rgb(232, 227, 250) | rgb(41, 34, 76) | 11.77 | 4.5 | pass
home | #about | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(29, 22, 75) | 13.24 | 4.5 | pass
home | #about | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(35, 23, 78) | 12.88 | 4.5 | pass
home | #about | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(38, 24, 77) | 12.72 | 4.5 | pass
home | #about | .tags li | 0 | 11.5 | rgb(232, 227, 250) | rgb(44, 35, 80) | 11.48 | 4.5 | pass
home | #about | .tags li | 1 | 11.5 | rgb(232, 227, 250) | rgb(51, 39, 88) | 10.69 | 4.5 | pass
home | #about | .tags li | 2 | 11.5 | rgb(232, 227, 250) | rgb(49, 38, 86) | 10.89 | 4.5 | pass
home | #about | .card__actions .btn | 0 | 15 | rgb(255, 255, 255) | rgb(22, 92, 196) | 6.25 | 4.5 | pass
home | #about | .card__actions .btn | 1 | 15 | rgb(255, 255, 255) | rgb(25, 16, 57) | 17.88 | 4.5 | pass
home | #about | .about p | 0 | 12 | rgb(211, 203, 238) | rgb(87, 34, 92) | 7.57 | 4.5 | pass
home | #about | .about p | 1 | 17 | rgb(232, 227, 250) | rgb(48, 31, 99) | 11.19 | 4.5 | pass
humanity-type | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(28, 22, 51) | 15.83 | 3 | pass
humanity-type | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(22, 15, 46) | 14.71 | 4.5 | pass
humanity-type | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(14, 8, 39) | 15.52 | 4.5 | pass
humanity-type | top | .controls .btn | 0 | 14 | rgb(255, 255, 255) | rgb(34, 82, 202) | 6.71 | 4.5 | pass
humanity-type | top | .controls .btn | 1 | 14 | rgb(255, 255, 255) | rgb(13, 7, 37) | 19.55 | 4.5 | pass
particle-field | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(42, 36, 62) | 13.51 | 3 | pass
particle-field | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(34, 40, 68) | 11.55 | 4.5 | pass
particle-field | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(50, 51, 76) | 9.80 | 4.5 | pass
particle-field | top | .hint | 0 | 12 | rgb(232, 227, 250) | rgb(34, 31, 53) | 12.77 | 4.5 | pass
logo | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(29, 27, 56) | 15.15 | 3 | pass
logo | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(23, 21, 51) | 14.10 | 4.5 | pass
logo | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(14, 9, 39) | 15.45 | 4.5 | pass
exhibit | top | .banner__text | 0 | 14.5 | rgb(251, 238, 221) | rgb(55, 35, 34) | 12.89 | 4.5 | pass
exhibit | top | .banner__badge | 0 | 11 | rgb(31, 13, 0) | rgb(255, 177, 70) | 10.42 | 4.5 | pass
exhibit | top | .banner .btn | 0 | 14 | rgb(255, 255, 255) | rgb(19, 94, 194) | 6.16 | 4.5 | pass
exhibit | top | .banner .btn | 1 | 14 | rgb(255, 255, 255) | rgb(27, 16, 31) | 18.41 | 4.5 | pass
exhibit | top | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 49) | 17.59 | 4.5 | pass
exhibit | #ch-1 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(46, 35, 63) | 14.70 | 3 | pass
exhibit | #ch-1 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(39, 27, 55) | 13.35 | 4.5 | pass
exhibit | #ch-1 | .chapter__text p | 1 | 18 | rgb(239, 230, 247) | rgb(34, 22, 43) | 14.23 | 4.5 | pass
exhibit | #ch-1 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
exhibit | #ch-4 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(42, 30, 49) | 15.81 | 3 | pass
exhibit | #ch-4 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(30, 28, 61) | 13.45 | 4.5 | pass
exhibit | #ch-4 | .chapter__text p | 1 | 18 | rgb(239, 230, 247) | rgb(31, 21, 46) | 14.38 | 4.5 | pass
exhibit | #ch-4 | .chapter__text p | 2 | 18 | rgb(239, 230, 247) | rgb(29, 19, 43) | 14.68 | 4.5 | pass
exhibit | #ch-4 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(27, 20, 50) | 17.61 | 4.5 | pass
exhibit | #ch-6 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(40, 31, 54) | 15.68 | 3 | pass
exhibit | #ch-6 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(34, 25, 49) | 13.85 | 4.5 | pass
exhibit | #ch-6 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(27, 20, 50) | 17.61 | 4.5 | pass
exhibit | .colophon | .colophon p | 0 | 12 | rgb(232, 227, 250) | rgb(53, 42, 69) | 10.71 | 4.5 | pass
exhibit | .colophon | .colophon p | 1 | 17 | rgb(232, 227, 250) | rgb(45, 35, 64) | 11.78 | 4.5 | pass
exhibit | .colophon | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(13, 10, 24) | 15.77 | 4.5 | pass
exhibit | .colophon | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(39, 29, 62) | 15.77 | 4.5 | pass
exhibit | bottom | .colophon p | 0 | 12 | rgb(232, 227, 250) | rgb(59, 46, 67) | 10.13 | 4.5 | pass
exhibit | bottom | .colophon p | 1 | 17 | rgb(232, 227, 250) | rgb(51, 41, 67) | 10.92 | 4.5 | pass
exhibit | bottom | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(14, 10, 28) | 15.70 | 4.5 | pass
exhibit | bottom | .ex-foot__panel p | 0 | 14.5 | rgb(232, 227, 250) | rgb(33, 24, 50) | 13.53 | 4.5 | pass
exhibit | bottom | .ex-foot__panel p | 1 | 11.5 | rgb(189, 179, 214) | rgb(24, 16, 43) | 9.22 | 4.5 | pass
exhibit | bottom | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(27, 20, 49) | 17.63 | 4.5 | pass
check | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(80, 80, 100) | 6.29 | 4.5 | pass
check | top | .panel > p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 33, 61) | 11.37 | 4.5 | pass
check | top | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(27, 21, 55) | 13.89 | 4.5 | pass
check | top | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(31, 22, 64) | 13.47 | 4.5 | pass
check | top | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(58, 29, 58) | 11.86 | 4.5 | pass
check | top | .field label | 3 | 13.5 | rgb(232, 227, 250) | rgb(56, 28, 58) | 12.04 | 4.5 | pass
check | #s2 | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(84, 82, 102) | 6.05 | 4.5 | pass
check | #s2 | .panel > p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 33, 61) | 11.37 | 4.5 | pass
check | #s2 | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(26, 21, 56) | 13.90 | 4.5 | pass
check | #s2 | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(31, 22, 64) | 13.47 | 4.5 | pass
check | #s2 | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(58, 29, 58) | 11.86 | 4.5 | pass
check | #s2 | .field label | 3 | 13.5 | rgb(232, 227, 250) | rgb(56, 28, 58) | 12.04 | 4.5 | pass
scoreboard | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(81, 81, 101) | 6.19 | 4.5 | pass
scoreboard | top | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(64, 35, 64) | 10.96 | 4.5 | pass
scoreboard | top | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(30, 24, 58) | 13.47 | 4.5 | pass
scoreboard | top | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(35, 27, 67) | 12.83 | 4.5 | pass
scoreboard | top | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(34, 25, 59) | 13.23 | 4.5 | pass
scoreboard | top | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(60, 33, 62) | 11.36 | 4.5 | pass
scoreboard | top | #board td | 0 | 14 | rgb(246, 243, 255) | rgb(29, 19, 42) | 16.27 | 4.5 | pass
scoreboard | top | #board td | 1 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | top | #board td | 2 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | top | #board td | 3 | 14 | rgb(246, 243, 255) | rgb(27, 17, 38) | 16.61 | 4.5 | pass
scoreboard | top | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | top | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 37) | 12.42 | 4.5 | pass
scoreboard | top | #board th | 2 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | top | #board th | 3 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | top | .note | 0 | 13.5 | rgb(232, 227, 250) | rgb(30, 22, 52) | 13.77 | 4.5 | pass
scoreboard | #board | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(83, 80, 102) | 6.21 | 4.5 | pass
scoreboard | #board | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(64, 35, 64) | 10.96 | 4.5 | pass
scoreboard | #board | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(30, 24, 58) | 13.47 | 4.5 | pass
scoreboard | #board | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(35, 27, 67) | 12.83 | 4.5 | pass
scoreboard | #board | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(34, 25, 59) | 13.23 | 4.5 | pass
scoreboard | #board | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(60, 33, 62) | 11.36 | 4.5 | pass
scoreboard | #board | #board td | 0 | 14 | rgb(246, 243, 255) | rgb(29, 19, 42) | 16.27 | 4.5 | pass
scoreboard | #board | #board td | 1 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | #board | #board td | 2 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | #board | #board td | 3 | 14 | rgb(246, 243, 255) | rgb(27, 17, 38) | 16.61 | 4.5 | pass
scoreboard | #board | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | #board | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 37) | 12.42 | 4.5 | pass
scoreboard | #board | #board th | 2 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | #board | #board th | 3 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | #board | .note | 0 | 13.5 | rgb(232, 227, 250) | rgb(30, 22, 52) | 13.77 | 4.5 | pass
about | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(80, 76, 89) | 6.67 | 4.5 | pass
about | top | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 36, 67) | 11.01 | 4.5 | pass
about | #method | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(62, 33, 63) | 11.24 | 4.5 | pass
about | #method | .prose p | 1 | 17 | rgb(232, 227, 250) | rgb(29, 20, 63) | 13.72 | 4.5 | pass
about | #method | .prose li | 0 | 17 | rgb(232, 227, 250) | rgb(46, 25, 61) | 12.70 | 4.5 | pass
about | #method | .prose li | 1 | 17 | rgb(232, 227, 250) | rgb(31, 22, 65) | 13.45 | 4.5 | pass
about | #method | .prose li | 2 | 17 | rgb(232, 227, 250) | rgb(31, 22, 65) | 13.45 | 4.5 | pass
about | #method | #techniques td | 0 | 14 | rgb(246, 243, 255) | rgb(37, 20, 34) | 15.96 | 4.5 | pass
about | #method | #techniques td | 1 | 14 | rgb(246, 243, 255) | rgb(37, 17, 39) | 16.15 | 4.5 | pass
about | #method | #techniques td | 2 | 14 | rgb(246, 243, 255) | rgb(37, 20, 34) | 15.96 | 4.5 | pass
about | #method | #techniques td | 3 | 14 | rgb(246, 243, 255) | rgb(38, 18, 37) | 16.04 | 4.5 | pass

129 measurements, 129 pass, 0 fail. Lowest ratio: 4.72.
