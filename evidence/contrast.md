Contrast of text on glass, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (the backdrop drifts), and compare with the brightest pixel inside the element's content box (where the glyphs sit) across the 3 frames. Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | text colour | brightest behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---
home | 1440 | top | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(48, 14, 115) | 11.70 | 4.5 | pass
home | 1440 | top | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(60, 14, 116) | 11.15 | 4.5 | pass
home | 1440 | top | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(81, 15, 122) | 9.89 | 4.5 | pass
home | 1440 | top | .hero__panel .eyebrow | 0 | 12 | rgb(211, 203, 238) | rgb(25, 91, 138) | 4.66 | 4.5 | pass
home | 1440 | top | .hero__panel .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(85, 20, 95) | 10.17 | 4.5 | pass
home | 1440 | top | .hero__facts li | 0 | 14 | rgb(211, 203, 238) | rgb(14, 10, 66) | 11.88 | 4.5 | pass
home | 1440 | top | .hero__facts li | 1 | 14 | rgb(211, 203, 238) | rgb(12, 12, 73) | 11.63 | 4.5 | pass
home | 1440 | top | .hero__facts li | 2 | 14 | rgb(211, 203, 238) | rgb(14, 13, 75) | 11.50 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 0 | 15 | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 1 | 15 | rgb(255, 255, 255) | rgb(21, 8, 67) | 18.30 | 4.5 | pass
home | 1440 | #samples | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(48, 14, 115) | 11.70 | 4.5 | pass
home | 1440 | #samples | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(59, 14, 116) | 11.19 | 4.5 | pass
home | 1440 | #samples | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(83, 14, 124) | 9.76 | 4.5 | pass
home | 1440 | #samples | .section__head p:not(.eyebrow) | 0 | 17 | rgb(232, 227, 250) | rgb(83, 84, 96) | 5.99 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 0 | 12 | rgb(211, 203, 238) | rgb(11, 17, 88) | 10.97 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 1 | 12 | rgb(211, 203, 238) | rgb(50, 12, 114) | 9.47 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 2 | 12 | rgb(211, 203, 238) | rgb(63, 19, 86) | 9.41 | 4.5 | pass
home | 1440 | #samples | .card__title | 0 | 25 | rgb(246, 243, 255) | rgb(13, 14, 80) | 16.04 | 3 | pass
home | 1440 | #samples | .card__title | 1 | 25 | rgb(246, 243, 255) | rgb(49, 14, 102) | 13.85 | 3 | pass
home | 1440 | #samples | .card__title | 2 | 25 | rgb(246, 243, 255) | rgb(59, 17, 82) | 13.82 | 3 | pass
home | 1440 | #samples | .card__blurb | 0 | 16 | rgb(232, 227, 250) | rgb(19, 12, 73) | 14.28 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 1 | 16 | rgb(232, 227, 250) | rgb(47, 12, 91) | 12.68 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 2 | 16 | rgb(232, 227, 250) | rgb(51, 15, 75) | 12.82 | 4.5 | pass
home | 1440 | #samples | .tags li | 0 | 11.5 | rgb(232, 227, 250) | rgb(32, 25, 70) | 13.03 | 4.5 | pass
home | 1440 | #samples | .tags li | 1 | 11.5 | rgb(232, 227, 250) | rgb(32, 26, 71) | 12.92 | 4.5 | pass
home | 1440 | #samples | .tags li | 2 | 11.5 | rgb(232, 227, 250) | rgb(38, 28, 80) | 12.31 | 4.5 | pass
home | 1440 | #samples | .tags li | 3 | 11.5 | rgb(232, 227, 250) | rgb(41, 28, 84) | 12.10 | 4.5 | pass
home | 1440 | #about | .topnav a | 0 | 14 | rgb(232, 227, 250) | rgb(33, 14, 84) | 13.38 | 4.5 | pass
home | 1440 | #about | .topnav a | 1 | 14 | rgb(232, 227, 250) | rgb(40, 14, 83) | 13.15 | 4.5 | pass
home | 1440 | #about | .topnav a | 2 | 14 | rgb(232, 227, 250) | rgb(47, 14, 84) | 12.81 | 4.5 | pass
home | 1440 | #about | .tags li | 0 | 11.5 | rgb(232, 227, 250) | rgb(32, 31, 98) | 11.72 | 4.5 | pass
home | 1440 | #about | .tags li | 1 | 11.5 | rgb(232, 227, 250) | rgb(33, 31, 98) | 11.69 | 4.5 | pass
home | 1440 | #about | .tags li | 2 | 11.5 | rgb(232, 227, 250) | rgb(39, 25, 97) | 12.02 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 0 | 15 | rgb(255, 255, 255) | rgb(22, 92, 196) | 6.25 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 1 | 15 | rgb(255, 255, 255) | rgb(24, 7, 62) | 18.44 | 4.5 | pass
home | 1440 | #about | .about p | 0 | 12 | rgb(211, 203, 238) | rgb(75, 37, 119) | 7.40 | 4.5 | pass
home | 1440 | #about | .about p | 1 | 17 | rgb(232, 227, 250) | rgb(68, 17, 98) | 11.18 | 4.5 | pass
humanity-type | 1440 | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(28, 22, 51) | 15.83 | 3 | pass
humanity-type | 1440 | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(22, 15, 46) | 14.71 | 4.5 | pass
humanity-type | 1440 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(14, 8, 39) | 15.52 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 0 | 14 | rgb(255, 255, 255) | rgb(34, 82, 202) | 6.71 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 1 | 14 | rgb(255, 255, 255) | rgb(13, 7, 37) | 19.55 | 4.5 | pass
particle-field | 1440 | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(37, 29, 58) | 14.58 | 3 | pass
particle-field | 1440 | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(44, 32, 53) | 12.31 | 4.5 | pass
particle-field | 1440 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(29, 36, 68) | 12.10 | 4.5 | pass
particle-field | 1440 | top | .hint | 0 | 12 | rgb(232, 227, 250) | rgb(32, 26, 49) | 13.40 | 4.5 | pass
logo | 1440 | top | .sample-info h1 | 0 | 26 | rgb(246, 243, 255) | rgb(27, 25, 57) | 15.41 | 3 | pass
logo | 1440 | top | .sample-info .how | 0 | 14.5 | rgb(232, 227, 250) | rgb(23, 26, 57) | 13.51 | 4.5 | pass
logo | 1440 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(11, 15, 45) | 14.99 | 4.5 | pass
exhibit | 1440 | top | .banner__text | 0 | 14.5 | rgb(251, 238, 221) | rgb(56, 33, 34) | 13.04 | 4.5 | pass
exhibit | 1440 | top | .banner__badge | 0 | 11 | rgb(31, 13, 0) | rgb(255, 177, 70) | 10.42 | 4.5 | pass
exhibit | 1440 | top | .banner .btn | 0 | 14 | rgb(255, 255, 255) | rgb(19, 94, 194) | 6.16 | 4.5 | pass
exhibit | 1440 | top | .banner .btn | 1 | 14 | rgb(255, 255, 255) | rgb(28, 16, 32) | 18.35 | 4.5 | pass
exhibit | 1440 | top | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(46, 29, 66) | 15.32 | 3 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(43, 24, 54) | 13.47 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 1 | 18 | rgb(239, 230, 247) | rgb(34, 19, 47) | 14.42 | 4.5 | pass
exhibit | 1440 | #ch-1 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(33, 22, 57) | 16.96 | 3 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(39, 20, 64) | 13.75 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 1 | 18 | rgb(239, 230, 247) | rgb(25, 14, 47) | 15.13 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 2 | 18 | rgb(239, 230, 247) | rgb(23, 13, 46) | 15.29 | 4.5 | pass
exhibit | 1440 | #ch-4 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
exhibit | 1440 | #ch-6 | .chapter h2 | 0 | 40 | rgb(255, 255, 255) | rgb(41, 26, 51) | 16.28 | 3 | pass
exhibit | 1440 | #ch-6 | .chapter__text p | 0 | 18 | rgb(239, 230, 247) | rgb(33, 22, 55) | 14.04 | 4.5 | pass
exhibit | 1440 | #ch-6 | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 0 | 12 | rgb(232, 227, 250) | rgb(44, 37, 80) | 11.29 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 1 | 17 | rgb(232, 227, 250) | rgb(45, 30, 68) | 12.17 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(13, 8, 27) | 15.86 | 4.5 | pass
exhibit | 1440 | .colophon | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(35, 25, 57) | 16.54 | 4.5 | pass
exhibit | 1440 | bottom | .colophon p | 0 | 12 | rgb(232, 227, 250) | rgb(58, 40, 60) | 10.85 | 4.5 | pass
exhibit | 1440 | bottom | .colophon p | 1 | 17 | rgb(232, 227, 250) | rgb(53, 32, 55) | 11.89 | 4.5 | pass
exhibit | 1440 | bottom | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(36, 32, 48) | 12.79 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 0 | 14.5 | rgb(232, 227, 250) | rgb(36, 25, 52) | 13.29 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 1 | 11.5 | rgb(189, 179, 214) | rgb(25, 16, 43) | 9.20 | 4.5 | pass
exhibit | 1440 | bottom | .reveal-pill__label | 0 | 13.5 | rgb(255, 255, 255) | rgb(28, 20, 50) | 17.57 | 4.5 | pass
check | 1440 | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(84, 79, 102) | 6.25 | 4.5 | pass
check | 1440 | top | .panel > p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 33, 61) | 11.37 | 4.5 | pass
check | 1440 | top | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(27, 21, 55) | 13.89 | 4.5 | pass
check | 1440 | top | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(31, 22, 64) | 13.47 | 4.5 | pass
check | 1440 | top | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(58, 29, 58) | 11.86 | 4.5 | pass
check | 1440 | top | .field label | 3 | 13.5 | rgb(232, 227, 250) | rgb(57, 29, 57) | 11.92 | 4.5 | pass
check | 1440 | #s2 | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(81, 79, 100) | 6.33 | 4.5 | pass
check | 1440 | #s2 | .panel > p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 33, 61) | 11.37 | 4.5 | pass
check | 1440 | #s2 | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(27, 21, 55) | 13.89 | 4.5 | pass
check | 1440 | #s2 | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(31, 22, 64) | 13.47 | 4.5 | pass
check | 1440 | #s2 | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(58, 29, 58) | 11.86 | 4.5 | pass
check | 1440 | #s2 | .field label | 3 | 13.5 | rgb(232, 227, 250) | rgb(57, 29, 57) | 11.92 | 4.5 | pass
scoreboard | 1440 | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(86, 83, 104) | 5.93 | 4.5 | pass
scoreboard | 1440 | top | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(64, 35, 64) | 10.96 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(29, 25, 59) | 13.39 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(36, 27, 67) | 12.80 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(34, 25, 60) | 13.20 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(60, 33, 62) | 11.36 | 4.5 | pass
scoreboard | 1440 | top | #board td | 0 | 14 | rgb(246, 243, 255) | rgb(29, 19, 42) | 16.27 | 4.5 | pass
scoreboard | 1440 | top | #board td | 1 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | 1440 | top | #board td | 2 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | 1440 | top | #board td | 3 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | 1440 | top | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | top | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 37) | 12.42 | 4.5 | pass
scoreboard | 1440 | top | #board th | 2 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | top | #board th | 3 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | top | .note | 0 | 13.5 | rgb(232, 227, 250) | rgb(26, 23, 52) | 13.81 | 4.5 | pass
scoreboard | 1440 | #board | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(80, 80, 100) | 6.29 | 4.5 | pass
scoreboard | 1440 | #board | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(64, 35, 64) | 10.96 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(30, 24, 58) | 13.47 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(36, 27, 67) | 12.80 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(34, 25, 59) | 13.23 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(60, 33, 63) | 11.34 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 0 | 14 | rgb(246, 243, 255) | rgb(29, 19, 42) | 16.27 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 1 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 2 | 14 | rgb(246, 243, 255) | rgb(27, 17, 39) | 16.59 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 3 | 14 | rgb(246, 243, 255) | rgb(27, 17, 38) | 16.61 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 37) | 12.42 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 2 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 3 | 12 | rgb(211, 203, 238) | rgb(15, 10, 36) | 12.44 | 4.5 | pass
scoreboard | 1440 | #board | .note | 0 | 13.5 | rgb(232, 227, 250) | rgb(29, 22, 52) | 13.81 | 4.5 | pass
about | 1440 | top | .page-head .lede | 0 | 19.44 | rgb(232, 227, 250) | rgb(85, 80, 92) | 6.25 | 4.5 | pass
about | 1440 | top | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(60, 36, 67) | 11.01 | 4.5 | pass
about | 1440 | #method | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(61, 33, 64) | 11.27 | 4.5 | pass
about | 1440 | #method | .prose p | 1 | 17 | rgb(232, 227, 250) | rgb(29, 20, 63) | 13.72 | 4.5 | pass
about | 1440 | #method | .prose li | 0 | 17 | rgb(232, 227, 250) | rgb(46, 25, 61) | 12.70 | 4.5 | pass
about | 1440 | #method | .prose li | 1 | 17 | rgb(232, 227, 250) | rgb(31, 22, 65) | 13.45 | 4.5 | pass
about | 1440 | #method | .prose li | 2 | 17 | rgb(232, 227, 250) | rgb(31, 22, 65) | 13.45 | 4.5 | pass
about | 1440 | #method | #techniques td | 0 | 14 | rgb(246, 243, 255) | rgb(37, 20, 34) | 15.96 | 4.5 | pass
about | 1440 | #method | #techniques td | 1 | 14 | rgb(246, 243, 255) | rgb(37, 17, 39) | 16.15 | 4.5 | pass
about | 1440 | #method | #techniques td | 2 | 14 | rgb(246, 243, 255) | rgb(37, 20, 34) | 15.96 | 4.5 | pass
about | 1440 | #method | #techniques td | 3 | 14 | rgb(246, 243, 255) | rgb(38, 18, 37) | 16.04 | 4.5 | pass
home | 375 | top | .topnav a | 0 | 13 | rgb(232, 227, 250) | rgb(107, 51, 109) | 7.24 | 4.5 | pass
home | 375 | top | .hero__panel .eyebrow | 0 | 12 | rgb(211, 203, 238) | rgb(95, 67, 139) | 5.09 | 4.5 | pass
home | 375 | top | .hero__panel .lede | 0 | 17 | rgb(232, 227, 250) | rgb(75, 36, 111) | 9.43 | 4.5 | pass
home | 375 | top | .hero__facts li | 0 | 14 | rgb(211, 203, 238) | rgb(44, 15, 80) | 10.49 | 4.5 | pass
home | 375 | top | .hero__facts li | 1 | 14 | rgb(211, 203, 238) | rgb(45, 21, 83) | 10.08 | 4.5 | pass
home | 375 | top | .hero__facts li | 2 | 14 | rgb(211, 203, 238) | rgb(42, 22, 80) | 10.19 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 0 | 15 | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 1 | 15 | rgb(255, 255, 255) | rgb(41, 15, 66) | 16.92 | 4.5 | pass
home | 375 | #samples | .topnav a | 0 | 13 | rgb(232, 227, 250) | rgb(43, 35, 68) | 11.78 | 4.5 | pass
home | 375 | #samples | .card__kicker | 0 | 12 | rgb(211, 203, 238) | rgb(10, 79, 130) | 5.52 | 4.5 | pass
home | 375 | #samples | .card__kicker | 1 | 12 | rgb(211, 203, 238) | rgb(22, 52, 106) | 7.81 | 4.5 | pass
home | 375 | #samples | .card__title | 0 | 21 | rgb(246, 243, 255) | rgb(25, 64, 132) | 9.10 | 4.5 | pass
home | 375 | #samples | .card__title | 1 | 21 | rgb(246, 243, 255) | rgb(29, 43, 105) | 11.98 | 4.5 | pass
home | 375 | #samples | .card__blurb | 0 | 16 | rgb(232, 227, 250) | rgb(67, 50, 131) | 8.31 | 4.5 | pass
home | 375 | #samples | .card__blurb | 1 | 16 | rgb(232, 227, 250) | rgb(26, 27, 102) | 12.06 | 4.5 | pass
home | 375 | #samples | .tags li | 0 | 11.5 | rgb(232, 227, 250) | rgb(43, 91, 124) | 5.81 | 4.5 | pass
home | 375 | #samples | .tags li | 1 | 11.5 | rgb(232, 227, 250) | rgb(29, 52, 141) | 8.71 | 4.5 | pass
home | 375 | #samples | .tags li | 2 | 11.5 | rgb(232, 227, 250) | rgb(33, 28, 75) | 12.61 | 4.5 | pass
home | 375 | #samples | .tags li | 3 | 11.5 | rgb(232, 227, 250) | rgb(47, 36, 87) | 11.12 | 4.5 | pass
home | 375 | #about | .topnav a | 0 | 13 | rgb(232, 227, 250) | rgb(53, 23, 74) | 12.24 | 4.5 | pass
home | 375 | #about | .card__actions .btn | 0 | 15 | rgb(255, 255, 255) | rgb(14, 26, 61) | 17.02 | 4.5 | pass
home | 375 | #about | .about p | 0 | 12 | rgb(211, 203, 238) | rgb(56, 29, 99) | 8.89 | 4.5 | pass
home | 375 | #about | .about p | 1 | 17 | rgb(232, 227, 250) | rgb(19, 54, 107) | 9.50 | 4.5 | pass
home | 375 | #about | .foot span | 0 | 14 | rgb(211, 203, 238) | rgb(36, 28, 77) | 10.05 | 4.5 | pass
home | 375 | #about | .foot a | 0 | 14 | rgb(232, 227, 250) | rgb(36, 28, 76) | 12.49 | 4.5 | pass
humanity-type | 375 | top | .sample-info h1 | 0 | 20 | rgb(246, 243, 255) | rgb(86, 77, 98) | 7.28 | 4.5 | pass
humanity-type | 375 | top | .sample-info .how | 0 | 14 | rgb(232, 227, 250) | rgb(31, 21, 48) | 13.90 | 4.5 | pass
humanity-type | 375 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(17, 10, 39) | 15.32 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 0 | 14 | rgb(255, 255, 255) | rgb(34, 82, 202) | 6.71 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 1 | 14 | rgb(255, 255, 255) | rgb(14, 8, 37) | 19.44 | 4.5 | pass
particle-field | 375 | top | .sample-info h1 | 0 | 20 | rgb(246, 243, 255) | rgb(82, 75, 100) | 7.52 | 4.5 | pass
particle-field | 375 | top | .sample-info .how | 0 | 14 | rgb(232, 227, 250) | rgb(46, 34, 46) | 12.13 | 4.5 | pass
particle-field | 375 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(48, 42, 65) | 10.96 | 4.5 | pass
logo | 375 | top | .sample-info h1 | 0 | 20 | rgb(246, 243, 255) | rgb(79, 74, 100) | 7.69 | 4.5 | pass
logo | 375 | top | .sample-info .how | 0 | 14 | rgb(232, 227, 250) | rgb(21, 18, 49) | 14.45 | 4.5 | pass
logo | 375 | top | .controls .back | 0 | 14 | rgb(232, 227, 250) | rgb(13, 8, 37) | 15.58 | 4.5 | pass
exhibit | 375 | top | .banner__text | 0 | 14.5 | rgb(251, 238, 221) | rgb(47, 30, 39) | 13.76 | 4.5 | pass
exhibit | 375 | top | .banner__badge | 0 | 11 | rgb(31, 13, 0) | rgb(255, 177, 70) | 10.42 | 4.5 | pass
exhibit | 375 | top | .banner .btn | 0 | 14 | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
exhibit | 375 | top | .banner .btn | 1 | 14 | rgb(255, 255, 255) | rgb(27, 13, 33) | 18.65 | 4.5 | pass
exhibit | 375 | top | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(29, 21, 52) | 17.37 | 4.5 | pass
exhibit | 375 | #ch-1 | .chapter h2 | 0 | 26 | rgb(255, 255, 255) | rgb(42, 28, 58) | 15.84 | 3 | pass
exhibit | 375 | #ch-1 | .chapter__text p | 0 | 16.5 | rgb(239, 230, 247) | rgb(36, 23, 56) | 13.81 | 4.5 | pass
exhibit | 375 | #ch-1 | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(29, 19, 59) | 17.38 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter h2 | 0 | 26 | rgb(255, 255, 255) | rgb(45, 31, 57) | 15.37 | 3 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 0 | 16.5 | rgb(239, 230, 247) | rgb(32, 19, 52) | 14.39 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 1 | 16.5 | rgb(239, 230, 247) | rgb(23, 16, 48) | 15.03 | 4.5 | pass
exhibit | 375 | #ch-4 | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(26, 19, 50) | 17.75 | 4.5 | pass
exhibit | 375 | #ch-6 | .chapter h2 | 0 | 26 | rgb(255, 255, 255) | rgb(38, 26, 56) | 16.31 | 3 | pass
exhibit | 375 | #ch-6 | .chapter__text p | 0 | 16.5 | rgb(239, 230, 247) | rgb(48, 24, 63) | 13.05 | 4.5 | pass
exhibit | 375 | #ch-6 | .chapter__text p | 1 | 16.5 | rgb(239, 230, 247) | rgb(31, 21, 60) | 14.08 | 4.5 | pass
exhibit | 375 | #ch-6 | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(28, 21, 51) | 17.44 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 0 | 12 | rgb(232, 227, 250) | rgb(49, 39, 78) | 10.97 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 1 | 17 | rgb(232, 227, 250) | rgb(51, 34, 62) | 11.67 | 4.5 | pass
exhibit | 375 | .colophon | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(13, 6, 25) | 16.02 | 4.5 | pass
exhibit | 375 | .colophon | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(36, 25, 52) | 16.62 | 4.5 | pass
exhibit | 375 | bottom | .colophon__code | 0 | 13.5 | rgb(217, 232, 255) | rgb(17, 9, 27) | 15.70 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 0 | 14.5 | rgb(232, 227, 250) | rgb(42, 30, 60) | 12.45 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 1 | 11.5 | rgb(189, 179, 214) | rgb(23, 16, 48) | 9.18 | 4.5 | pass
exhibit | 375 | bottom | .reveal-pill__label | 0 | 12.5 | rgb(255, 255, 255) | rgb(28, 21, 51) | 17.44 | 4.5 | pass
check | 375 | top | .page-head .lede | 0 | 17 | rgb(232, 227, 250) | rgb(101, 65, 60) | 7.07 | 4.5 | pass
check | 375 | top | .panel > p | 0 | 17 | rgb(232, 227, 250) | rgb(65, 37, 66) | 10.71 | 4.5 | pass
check | 375 | top | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(58, 33, 66) | 11.38 | 4.5 | pass
check | 375 | top | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(44, 26, 59) | 12.75 | 4.5 | pass
check | 375 | top | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(20, 20, 54) | 14.20 | 4.5 | pass
check | 375 | #s2 | .field label | 0 | 13.5 | rgb(232, 227, 250) | rgb(58, 29, 61) | 11.81 | 4.5 | pass
check | 375 | #s2 | .field label | 1 | 13.5 | rgb(232, 227, 250) | rgb(64, 31, 52) | 11.48 | 4.5 | pass
check | 375 | #s2 | .field label | 2 | 13.5 | rgb(232, 227, 250) | rgb(51, 27, 49) | 12.52 | 4.5 | pass
check | 375 | #s2 | .field label | 3 | 13.5 | rgb(232, 227, 250) | rgb(62, 35, 65) | 11.04 | 4.5 | pass
scoreboard | 375 | top | .page-head .lede | 0 | 17 | rgb(232, 227, 250) | rgb(100, 65, 59) | 7.11 | 4.5 | pass
scoreboard | 375 | top | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(62, 37, 63) | 10.90 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(50, 29, 62) | 12.17 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(55, 30, 62) | 11.85 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(30, 21, 58) | 13.73 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(51, 28, 62) | 12.20 | 4.5 | pass
scoreboard | 375 | top | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 35) | 12.45 | 4.5 | pass
scoreboard | 375 | top | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 35) | 12.45 | 4.5 | pass
scoreboard | 375 | #board | .page-head .lede | 0 | 17 | rgb(232, 227, 250) | rgb(100, 64, 64) | 7.15 | 4.5 | pass
scoreboard | 375 | #board | #board-status | 0 | 17 | rgb(232, 227, 250) | rgb(62, 37, 63) | 10.90 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 0 | 14 | rgb(232, 227, 250) | rgb(50, 29, 62) | 12.17 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 1 | 14 | rgb(232, 227, 250) | rgb(55, 30, 62) | 11.85 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 2 | 14 | rgb(232, 227, 250) | rgb(30, 21, 58) | 13.73 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 3 | 14 | rgb(232, 227, 250) | rgb(51, 28, 62) | 12.20 | 4.5 | pass
scoreboard | 375 | #board | #board th | 0 | 12 | rgb(211, 203, 238) | rgb(15, 10, 35) | 12.45 | 4.5 | pass
scoreboard | 375 | #board | #board th | 1 | 12 | rgb(211, 203, 238) | rgb(15, 10, 35) | 12.45 | 4.5 | pass
about | 375 | top | .page-head .lede | 0 | 17 | rgb(232, 227, 250) | rgb(99, 65, 61) | 7.14 | 4.5 | pass
about | 375 | top | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(66, 38, 67) | 10.57 | 4.5 | pass
about | 375 | #method | .prose p | 0 | 17 | rgb(232, 227, 250) | rgb(62, 36, 67) | 10.92 | 4.5 | pass
about | 375 | #method | .prose li | 0 | 17 | rgb(232, 227, 250) | rgb(27, 19, 59) | 13.97 | 4.5 | pass
about | 375 | #method | .prose li | 1 | 17 | rgb(232, 227, 250) | rgb(18, 19, 55) | 14.31 | 4.5 | pass
about | 375 | #method | #techniques td | 0 | 14 | rgb(246, 243, 255) | rgb(38, 18, 36) | 16.06 | 4.5 | pass
about | 375 | #method | #techniques td | 1 | 14 | rgb(246, 243, 255) | rgb(33, 15, 39) | 16.50 | 4.5 | pass

221 measurements, 221 pass, 0 fail. Lowest ratio: 4.66.
