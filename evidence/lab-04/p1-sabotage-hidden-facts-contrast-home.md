Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
home | 1440 | top | .topnav a | 0 | 14 | light | rgb(232, 227, 250) | rgb(48, 14, 115) | 11.70 | 4.5 | pass
home | 1440 | top | .topnav a | 1 | 14 | light | rgb(232, 227, 250) | rgb(59, 14, 116) | 11.19 | 4.5 | pass
home | 1440 | top | .topnav a | 2 | 14 | light | rgb(232, 227, 250) | rgb(84, 14, 122) | 9.76 | 4.5 | pass
home | 1440 | top | .hero__panel .eyebrow | 0 | 12 | light | rgb(211, 203, 238) | rgb(48, 83, 130) | 5.04 | 4.5 | pass
home | 1440 | top | .hero__panel .lede | 0 | 19.44 | light | rgb(232, 227, 250) | rgb(36, 38, 121) | 10.32 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 1 | 15 | light | rgb(255, 255, 255) | rgb(17, 9, 59) | 18.65 | 4.5 | pass
home | 1440 | #samples | .topnav a | 0 | 14 | light | rgb(232, 227, 250) | rgb(48, 14, 115) | 11.70 | 4.5 | pass
home | 1440 | #samples | .topnav a | 1 | 14 | light | rgb(232, 227, 250) | rgb(59, 14, 116) | 11.19 | 4.5 | pass
home | 1440 | #samples | .topnav a | 2 | 14 | light | rgb(232, 227, 250) | rgb(84, 14, 122) | 9.76 | 4.5 | pass
home | 1440 | #samples | .section__head p:not(.eyebrow) | 0 | 17 | light | rgb(232, 227, 250) | rgb(84, 84, 95) | 5.98 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 0 | 12 | light | rgb(211, 203, 238) | rgb(11, 16, 87) | 11.05 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 1 | 12 | light | rgb(211, 203, 238) | rgb(47, 14, 105) | 9.76 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 2 | 12 | light | rgb(211, 203, 238) | rgb(64, 18, 85) | 9.44 | 4.5 | pass
home | 1440 | #samples | .card__title | 0 | 25 | light | rgb(246, 243, 255) | rgb(12, 14, 82) | 15.98 | 3 | pass
home | 1440 | #samples | .card__title | 1 | 25 | light | rgb(246, 243, 255) | rgb(49, 14, 102) | 13.85 | 3 | pass
home | 1440 | #samples | .card__title | 2 | 25 | light | rgb(246, 243, 255) | rgb(58, 17, 81) | 13.91 | 3 | pass
home | 1440 | #samples | .card__blurb | 0 | 16 | light | rgb(232, 227, 250) | rgb(17, 12, 73) | 14.33 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 1 | 16 | light | rgb(232, 227, 250) | rgb(47, 11, 92) | 12.70 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 2 | 16 | light | rgb(232, 227, 250) | rgb(51, 15, 75) | 12.82 | 4.5 | pass
home | 1440 | #samples | .tags li | 0 | 11.5 | light | rgb(232, 227, 250) | rgb(32, 25, 70) | 13.03 | 4.5 | pass
home | 1440 | #samples | .tags li | 1 | 11.5 | light | rgb(232, 227, 250) | rgb(32, 25, 71) | 13.01 | 4.5 | pass
home | 1440 | #samples | .tags li | 2 | 11.5 | light | rgb(232, 227, 250) | rgb(38, 28, 80) | 12.31 | 4.5 | pass
home | 1440 | #samples | .tags li | 3 | 11.5 | light | rgb(232, 227, 250) | rgb(41, 28, 84) | 12.10 | 4.5 | pass
home | 1440 | #about | .topnav a | 0 | 14 | light | rgb(232, 227, 250) | rgb(33, 14, 84) | 13.38 | 4.5 | pass
home | 1440 | #about | .topnav a | 1 | 14 | light | rgb(232, 227, 250) | rgb(40, 14, 84) | 13.11 | 4.5 | pass
home | 1440 | #about | .topnav a | 2 | 14 | light | rgb(232, 227, 250) | rgb(47, 14, 84) | 12.81 | 4.5 | pass
home | 1440 | #about | .tags li | 0 | 11.5 | light | rgb(232, 227, 250) | rgb(32, 31, 98) | 11.72 | 4.5 | pass
home | 1440 | #about | .tags li | 1 | 11.5 | light | rgb(232, 227, 250) | rgb(33, 31, 98) | 11.69 | 4.5 | pass
home | 1440 | #about | .tags li | 2 | 11.5 | light | rgb(232, 227, 250) | rgb(39, 25, 97) | 12.02 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(22, 92, 196) | 6.25 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 1 | 15 | light | rgb(255, 255, 255) | rgb(24, 7, 62) | 18.44 | 4.5 | pass
home | 1440 | #about | .about p | 0 | 12 | light | rgb(211, 203, 238) | rgb(75, 37, 119) | 7.40 | 4.5 | pass
home | 1440 | #about | .about p | 1 | 17 | light | rgb(232, 227, 250) | rgb(69, 17, 96) | 11.18 | 4.5 | pass
home | 1440 | bottom | .topnav a | 0 | 14 | light | rgb(232, 227, 250) | rgb(39, 19, 87) | 12.76 | 4.5 | pass
home | 1440 | bottom | .topnav a | 1 | 14 | light | rgb(232, 227, 250) | rgb(40, 14, 84) | 13.11 | 4.5 | pass
home | 1440 | bottom | .topnav a | 2 | 14 | light | rgb(232, 227, 250) | rgb(47, 14, 84) | 12.81 | 4.5 | pass
home | 1440 | bottom | .card__actions .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(25, 77, 180) | 7.60 | 4.5 | pass
home | 1440 | bottom | .card__actions .btn | 1 | 15 | light | rgb(255, 255, 255) | rgb(16, 7, 54) | 18.99 | 4.5 | pass
home | 1440 | bottom | .about p | 0 | 12 | light | rgb(211, 203, 238) | rgb(101, 58, 89) | 5.88 | 4.5 | pass
home | 1440 | bottom | .about p | 1 | 17 | light | rgb(232, 227, 250) | rgb(71, 23, 107) | 10.48 | 4.5 | pass
home | 1440 | bottom | .foot span | 0 | 14 | light | rgb(211, 203, 238) | rgb(21, 14, 60) | 11.68 | 4.5 | pass
home | 1440 | bottom | .foot a | 0 | 14 | light | rgb(232, 227, 250) | rgb(20, 13, 60) | 14.58 | 4.5 | pass
home | 1440 | bottom | .foot a | 1 | 14 | light | rgb(232, 227, 250) | rgb(38, 13, 73) | 13.59 | 4.5 | pass
home | 1440 | bottom | .foot a | 2 | 14 | light | rgb(232, 227, 250) | rgb(46, 16, 75) | 13.00 | 4.5 | pass
home | 1440 | bottom | .foot a | 3 | 14 | light | rgb(232, 227, 250) | rgb(53, 20, 66) | 12.63 | 4.5 | pass
home | 375 | top | .topnav a | 0 | 13 | light | rgb(232, 227, 250) | rgb(108, 51, 108) | 7.22 | 4.5 | pass
home | 375 | top | .hero__panel .eyebrow | 0 | 12 | light | rgb(211, 203, 238) | rgb(94, 66, 138) | 5.17 | 4.5 | pass
home | 375 | top | .hero__panel .lede | 0 | 17 | light | rgb(232, 227, 250) | rgb(73, 33, 109) | 9.76 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(20, 94, 194) | 6.16 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 1 | 15 | light | rgb(255, 255, 255) | rgb(41, 15, 66) | 16.92 | 4.5 | pass
home | 375 | #samples | .topnav a | 0 | 13 | light | rgb(232, 227, 250) | rgb(90, 46, 94) | 8.45 | 4.5 | pass
home | 375 | #samples | .section__head p:not(.eyebrow) | 0 | 17 | light | rgb(232, 227, 250) | rgb(60, 83, 101) | 6.42 | 4.5 | pass
home | 375 | #samples | .card__kicker | 0 | 12 | light | rgb(211, 203, 238) | rgb(17, 55, 107) | 7.60 | 4.5 | pass
home | 375 | #samples | .card__title | 0 | 21 | light | rgb(246, 243, 255) | rgb(24, 50, 107) | 11.24 | 4.5 | pass
home | 375 | #samples | .card__blurb | 0 | 16 | light | rgb(232, 227, 250) | rgb(29, 39, 105) | 10.86 | 4.5 | pass
home | 375 | #samples | .tags li | 0 | 11.5 | light | rgb(232, 227, 250) | rgb(48, 36, 89) | 11.04 | 4.5 | pass
home | 375 | #samples | .tags li | 1 | 11.5 | light | rgb(232, 227, 250) | rgb(55, 38, 92) | 10.54 | 4.5 | pass
home | 375 | #about | .topnav a | 0 | 13 | light | rgb(232, 227, 250) | rgb(53, 23, 74) | 12.24 | 4.5 | pass
home | 375 | #about | .card__actions .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(14, 26, 61) | 17.02 | 4.5 | pass
home | 375 | #about | .about p | 0 | 12 | light | rgb(211, 203, 238) | rgb(55, 29, 101) | 8.88 | 4.5 | pass
home | 375 | #about | .about p | 1 | 17 | light | rgb(232, 227, 250) | rgb(19, 54, 107) | 9.50 | 4.5 | pass
home | 375 | #about | .foot span | 0 | 14 | light | rgb(211, 203, 238) | rgb(36, 28, 77) | 10.05 | 4.5 | pass
home | 375 | #about | .foot a | 0 | 14 | light | rgb(232, 227, 250) | rgb(36, 28, 76) | 12.49 | 4.5 | pass
home | 375 | bottom | .topnav a | 0 | 13 | light | rgb(232, 227, 250) | rgb(54, 23, 73) | 12.21 | 4.5 | pass
home | 375 | bottom | .about p | 0 | 12 | light | rgb(211, 203, 238) | rgb(68, 31, 124) | 7.82 | 4.5 | pass
home | 375 | bottom | .about p | 1 | 17 | light | rgb(232, 227, 250) | rgb(18, 54, 107) | 9.51 | 4.5 | pass
home | 375 | bottom | .foot span | 0 | 14 | light | rgb(211, 203, 238) | rgb(53, 32, 88) | 9.04 | 4.5 | pass
home | 375 | bottom | .foot a | 0 | 14 | light | rgb(232, 227, 250) | rgb(53, 31, 88) | 11.29 | 4.5 | pass
home | 375 | bottom | .foot a | 1 | 14 | light | rgb(232, 227, 250) | rgb(27, 18, 74) | 13.64 | 4.5 | pass
home | 375 | bottom | .foot a | 2 | 14 | light | rgb(232, 227, 250) | rgb(40, 22, 79) | 12.75 | 4.5 | pass
home | 375 | bottom | .foot a | 3 | 14 | light | rgb(232, 227, 250) | rgb(39, 22, 79) | 12.79 | 4.5 | pass

72 measurements, 72 pass, 0 fail. Lowest ratio: 5.04. Selectors never measured: home .hero__facts li.
