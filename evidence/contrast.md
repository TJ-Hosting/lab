Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page (on the lab-05 samples, the info panel's buttons and the hint are measured when present). AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
404 | 1440 | top | .lost .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
404 | 1440 | top | .lost .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5 | pass
404 | 1440 | top | .lost__panel h1 | 0 | 32 | dark | rgb(7, 16, 34) | rgb(240, 246, 249) | 17.41 | 3 | pass
404 | 1440 | top | .lost__panel p | 0 | 140 | dark | rgb(6, 75, 219) | rgb(211, 221, 234) | 5.04 | 3 | pass
404 | 1440 | top | .lost__panel p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 245, 249) | 8.12 | 4.5 | pass
404 | 1440 | top | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
404 | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | top | .hero__copy .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 245, 251) | 8.08 | 4.5 | pass
home | 1440 | top | .hero__copy .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(226, 242, 251) | 7.77 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(248, 251, 252) | 18.26 | 4.5 | pass
home | 1440 | top | .hero__facts li | 0 | 14 | dark | rgb(7, 16, 34) | rgb(70, 208, 251) | 10.55 | 4.5 | pass
home | 1440 | top | .hero__facts li | 1 | 14 | dark | rgb(7, 16, 34) | rgb(247, 250, 252) | 18.11 | 4.5 | pass
home | 1440 | top | .hero__facts li | 2 | 14 | dark | rgb(7, 16, 34) | rgb(246, 250, 252) | 18.08 | 4.5 | pass
home | 1440 | top | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
home | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
home | 1440 | top | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | #samples-title | .filters .chip | 0 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
home | 1440 | #samples-title | .filters .chip | 1 | 13 | dark | rgb(7, 16, 34) | rgb(248, 251, 253) | 18.27 | 4.5 | pass
home | 1440 | #samples-title | .filters .chip | 2 | 13 | dark | rgb(7, 16, 34) | rgb(248, 251, 253) | 18.27 | 4.5 | pass
home | 1440 | #samples-title | .filters .chip | 3 | 13 | dark | rgb(7, 16, 34) | rgb(248, 251, 253) | 18.27 | 4.5 | pass
home | 1440 | #samples-title | .filters__count | 0 | 12 | dark | rgb(59, 74, 102) | rgb(216, 238, 251) | 7.44 | 4.5 | pass
home | 1440 | #samples-title | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | #samples-title | .hero__cta .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(250, 252, 253) | 18.45 | 4.5 | pass
home | 1440 | #samples-title | .hero__facts li | 0 | 14 | dark | rgb(7, 16, 34) | rgb(70, 208, 251) | 10.55 | 4.5 | pass
home | 1440 | #samples-title | .hero__facts li | 1 | 14 | dark | rgb(7, 16, 34) | rgb(252, 252, 253) | 18.51 | 4.5 | pass
home | 1440 | #samples-title | .hero__facts li | 2 | 14 | dark | rgb(7, 16, 34) | rgb(250, 252, 253) | 18.45 | 4.5 | pass
home | 1440 | #samples-title | .section__head p:not(.eyebrow) | 0 | 16 | dark | rgb(59, 74, 102) | rgb(225, 242, 251) | 7.76 | 4.5 | pass
home | 1440 | #samples-title | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
home | 1440 | #samples-title | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(252, 250, 247) | 8.55 | 4.5 | pass
home | 1440 | #samples-title | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 250, 248) | 8.52 | 4.5 | pass
home | 1440 | .card__new | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
home | 1440 | .card__new | .card__blurb | 1 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
home | 1440 | .card__new | .card__blurb | 2 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
home | 1440 | .card__new | .card__blurb | 3 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
home | 1440 | .card__new | .card__kicker | 0 | 12 | dark | rgb(59, 74, 102) | rgb(246, 248, 249) | 8.36 | 4.5 | pass
home | 1440 | .card__new | .card__kicker | 1 | 12 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
home | 1440 | .card__new | .card__kicker | 2 | 12 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
home | 1440 | .card__new | .card__kicker | 3 | 12 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
home | 1440 | .card__new | .card__new | 0 | 11 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | .card__new | .card__new | 1 | 11 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | .card__new | .card__new | 2 | 11 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | .card__new | .card__title | 0 | 22 | dark | rgb(7, 16, 34) | rgb(245, 248, 249) | 17.79 | 3 | pass
home | 1440 | .card__new | .card__title | 1 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
home | 1440 | .card__new | .card__title | 2 | 22 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 3 | pass
home | 1440 | .card__new | .card__title | 3 | 22 | dark | rgb(7, 16, 34) | rgb(241, 246, 250) | 17.45 | 3 | pass
home | 1440 | .card__new | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | .card__new | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | .card__new | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | .card__new | .tags li | 3 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | .card__new | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(243, 249, 255) | 8.40 | 4.5 | pass
home | 1440 | .card__new | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(245, 250, 255) | 8.48 | 4.5 | pass
home | 1440 | .card__new | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | #exhibits-title | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
home | 1440 | #exhibits-title | .card__kicker | 0 | 12 | dark | rgb(59, 74, 102) | rgb(245, 248, 250) | 8.35 | 4.5 | pass
home | 1440 | #exhibits-title | .card__title | 0 | 38 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 3 | pass
home | 1440 | #exhibits-title | .section__head p:not(.eyebrow) | 0 | 16 | dark | rgb(59, 74, 102) | rgb(225, 242, 251) | 7.76 | 4.5 | pass
home | 1440 | #exhibits-title | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #exhibits-title | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #exhibits-title | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #exhibits-title | .tags li | 3 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #exhibits-title | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | #exhibits-title | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 1440 | #exhibits-title | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 1440 | #about | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
home | 1440 | #about | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | #about | .card__actions .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(251, 253, 253) | 18.59 | 4.5 | pass
home | 1440 | #about | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #about | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #about | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(227, 241, 250) | 7.73 | 4.5 | pass
home | 1440 | #about | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 1440 | #about | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 1440 | #about | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 1440 | bottom | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
home | 1440 | bottom | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
home | 1440 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(11, 21, 43) | 16.45 | 4.5 | pass
home | 1440 | bottom | .foot a | 1 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
home | 1440 | bottom | .foot a | 2 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
home | 1440 | bottom | .foot a | 3 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
home | 1440 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 44) | 9.06 | 4.5 | pass
home | 1440 | bottom | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | bottom | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 1440 | bottom | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
humanity-type | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
humanity-type | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
humanity-type | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
humanity-type | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
humanity-type | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
particle-field | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 237, 244) | 5.90 | 4.5 | pass
particle-field | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(31, 44, 64) | 7.03 | 4.5 | pass
particle-field | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 247) | 7.89 | 4.5 | pass
particle-field | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5 | pass
particle-field | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
logo | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
logo | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
logo | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
logo | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
split-flap-board | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
split-flap-board | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
split-flap-board | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
split-flap-board | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
split-flap-board | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
split-flap-board | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
split-flap-board | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
split-flap-board | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
liquid-distort-headline | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
liquid-distort-headline | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-distort-headline | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-distort-headline | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 245, 249) | 8.07 | 4.5 | pass
liquid-distort-headline | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
liquid-distort-headline | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-distort-headline | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
star-trail-text | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 238, 245) | 5.93 | 4.5 | pass
star-trail-text | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
star-trail-text | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
star-trail-text | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(19, 35, 65) | 7.81 | 4.5 | pass
star-trail-text | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
star-trail-text | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
star-trail-text | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 245) | 16.21 | 3 | pass
glitch-headline | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
glitch-headline | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glitch-headline | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glitch-headline | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
glitch-headline | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
glitch-headline | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glitch-headline | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
scramble-titles | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
scramble-titles | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
scramble-titles | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
scramble-titles | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
scramble-titles | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
scramble-titles | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
scramble-titles | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
coral-ink | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 239, 248) | 5.99 | 4.5 | pass
coral-ink | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
coral-ink | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
coral-ink | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
coral-ink | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(200, 215, 245) | 6.15 | 4.5 | pass
coral-ink | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 243, 249) | 8.00 | 4.5 | pass
coral-ink | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 238, 247) | 7.65 | 4.5 | pass
coral-ink | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 239, 248) | 16.45 | 3 | pass
slime-network | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 237, 244) | 5.90 | 4.5 | pass
slime-network | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
slime-network | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
slime-network | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
slime-network | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(31, 53, 75) | 6.29 | 4.5 | pass
slime-network | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 247) | 7.89 | 4.5 | pass
slime-network | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(234, 237, 244) | 7.60 | 4.5 | pass
slime-network | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 238, 245) | 16.31 | 3 | pass
streamline-poster | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
streamline-poster | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
streamline-poster | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
streamline-poster | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
streamline-poster | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
streamline-poster | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
contour-map | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 241, 247) | 6.10 | 4.5 | pass
contour-map | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
contour-map | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
contour-map | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(232, 240, 249) | 7.75 | 4.5 | pass
contour-map | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 244, 250) | 8.09 | 4.5 | pass
contour-map | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 240, 247) | 7.81 | 4.5 | pass
contour-map | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 241, 248) | 16.76 | 3 | pass
dither-flow-ink | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
dither-flow-ink | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dither-flow-ink | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dither-flow-ink | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dither-flow-ink | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
dither-flow-ink | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
dither-flow-ink | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
dither-flow-ink | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
glass-orbs | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(236, 241, 247) | 6.09 | 4.5 | pass
glass-orbs | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-orbs | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-orbs | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
glass-orbs | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 244, 249) | 8.10 | 4.5 | pass
glass-orbs | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(236, 240, 247) | 7.79 | 4.5 | pass
glass-orbs | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 241, 248) | 16.76 | 3 | pass
shader-swatchbook | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
shader-swatchbook | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
shader-swatchbook | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
shader-swatchbook | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
shader-swatchbook | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
shader-swatchbook | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
liquid-metal-monogram | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-metal-monogram | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
shape-shifter | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 238, 244) | 5.93 | 4.5 | pass
shape-shifter | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
shape-shifter | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
shape-shifter | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(24, 39, 62) | 7.50 | 4.5 | pass
shape-shifter | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 242, 247) | 7.94 | 4.5 | pass
shape-shifter | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
shape-shifter | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 238, 245) | 16.31 | 3 | pass
gpu-fluid | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 238, 245) | 5.93 | 4.5 | pass
gpu-fluid | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
gpu-fluid | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
gpu-fluid | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
gpu-fluid | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(26, 58, 87) | 5.87 | 4.5 | pass
gpu-fluid | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
gpu-fluid | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
gpu-fluid | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 245) | 16.21 | 3 | pass
scroll-zoom-tunnel | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
scroll-zoom-tunnel | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
glass-card-flow | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
glass-card-flow | 1440 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-card-flow | 1440 | top | .controls .btn | 1 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-card-flow | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-card-flow | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
glass-card-flow | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-card-flow | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-card-flow | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
horizontal-journey | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
horizontal-journey | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
horizontal-journey | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
horizontal-journey | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
horizontal-journey | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
horizontal-journey | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
stacking-plan-cards | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
stacking-plan-cards | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
stacking-plan-cards | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
stacking-plan-cards | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
stacking-plan-cards | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
stacking-plan-cards | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
request-in-ms | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
request-in-ms | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
request-in-ms | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
request-in-ms | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
request-in-ms | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
request-in-ms | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
dawn-to-night | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(238, 241, 248) | 6.12 | 4.5 | pass
dawn-to-night | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dawn-to-night | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
dawn-to-night | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 243, 249) | 8.00 | 4.5 | pass
dawn-to-night | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 238, 246) | 7.65 | 4.5 | pass
dawn-to-night | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 239, 248) | 16.45 | 3 | pass
tear-the-curtain | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 240, 246) | 6.03 | 4.5 | pass
tear-the-curtain | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
tear-the-curtain | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 1440 | top | .controls .btn | 3 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(235, 243, 250) | 7.95 | 4.5 | pass
tear-the-curtain | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
tear-the-curtain | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
tear-the-curtain | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
dot-mesh-hero | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
dot-mesh-hero | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dot-mesh-hero | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dot-mesh-hero | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
dot-mesh-hero | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
dot-mesh-hero | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
dot-mesh-hero | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
glass-jellyfish | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 244) | 5.89 | 4.5 | pass
glass-jellyfish | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-jellyfish | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-jellyfish | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(20, 30, 54) | 8.27 | 4.5 | pass
glass-jellyfish | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 247) | 7.89 | 4.5 | pass
glass-jellyfish | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
glass-jellyfish | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
halftone-dissolve | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 239, 246) | 5.98 | 4.5 | pass
halftone-dissolve | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
halftone-dissolve | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
halftone-dissolve | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(200, 221, 239) | 6.38 | 4.5 | pass
halftone-dissolve | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 242, 246) | 7.93 | 4.5 | pass
halftone-dissolve | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(235, 240, 246) | 7.77 | 4.5 | pass
halftone-dissolve | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(235, 239, 245) | 16.45 | 3 | pass
lamp-cord-theme | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 239, 246) | 6.00 | 4.5 | pass
lamp-cord-theme | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
lamp-cord-theme | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
lamp-cord-theme | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lamp-cord-theme | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
lamp-cord-theme | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
lamp-cord-theme | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
lamp-cord-theme | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
glass-diorama-card | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
glass-diorama-card | 1440 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-diorama-card | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 245, 249) | 8.07 | 4.5 | pass
glass-diorama-card | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 244, 249) | 8.08 | 4.5 | pass
glass-diorama-card | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-diorama-card | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
skill-chips | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
skill-chips | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
skill-chips | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
skill-chips | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
skill-chips | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
skill-chips | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
brand-colour-sphere | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
brand-colour-sphere | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
brand-colour-sphere | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
brand-colour-sphere | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
brand-colour-sphere | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
brand-colour-sphere | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
brand-colour-sphere | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
wavy-lines-hero | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 238, 244) | 5.93 | 4.5 | pass
wavy-lines-hero | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
wavy-lines-hero | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
wavy-lines-hero | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(20, 30, 51) | 8.31 | 4.5 | pass
wavy-lines-hero | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 247) | 7.89 | 4.5 | pass
wavy-lines-hero | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5 | pass
wavy-lines-hero | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
icon-micro-set | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
icon-micro-set | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
icon-micro-set | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
icon-micro-set | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
icon-micro-set | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
icon-micro-set | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
icon-micro-set | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
weather-window | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
weather-window | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
weather-window | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
weather-window | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
weather-window | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
weather-window | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
liquid-glass-lens | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 244) | 5.89 | 4.5 | pass
liquid-glass-lens | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-glass-lens | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-glass-lens | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(200, 215, 243) | 6.14 | 4.5 | pass
liquid-glass-lens | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
liquid-glass-lens | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
liquid-glass-lens | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 245) | 16.21 | 3 | pass
pricing-rolling-digits | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(232, 241, 250) | 7.80 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
pricing-rolling-digits | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
glass-hero-kit | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
glass-hero-kit | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-hero-kit | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
glass-hero-kit | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 245, 249) | 8.07 | 4.5 | pass
glass-hero-kit | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-hero-kit | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-hero-kit | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
integration-beams | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
integration-beams | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
integration-beams | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
integration-beams | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
integration-beams | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
integration-beams | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
integration-beams | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
bento-grid | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
bento-grid | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
bento-grid | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
bento-grid | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
bento-grid | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
bento-grid | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
bento-grid | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
mega-menu | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
mega-menu | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
mega-menu | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
mega-menu | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
mega-menu | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
mega-menu | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
mega-menu | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
testimonial-wall | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
testimonial-wall | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
testimonial-wall | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
testimonial-wall | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 244, 250) | 8.03 | 4.5 | pass
testimonial-wall | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
testimonial-wall | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(236, 241, 247) | 7.84 | 4.5 | pass
testimonial-wall | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 241, 248) | 16.76 | 3 | pass
browser-frame-showcase | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
browser-frame-showcase | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
browser-frame-showcase | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
browser-frame-showcase | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
browser-frame-showcase | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
browser-frame-showcase | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
browser-frame-showcase | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
focus-trail-form | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
focus-trail-form | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
focus-trail-form | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
focus-trail-form | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(237, 245, 249) | 8.07 | 4.5 | pass
focus-trail-form | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
focus-trail-form | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
focus-trail-form | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
publish-button | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
publish-button | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
publish-button | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
publish-button | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
publish-button | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
publish-button | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
publish-button | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
edge-network-globe | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5 | pass
edge-network-globe | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
edge-network-globe | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
edge-network-globe | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
edge-network-globe | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(20, 27, 44) | 8.58 | 4.5 | pass
edge-network-globe | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
edge-network-globe | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
edge-network-globe | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
clock-wall | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
clock-wall | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
clock-wall | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
clock-wall | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
clock-wall | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
clock-wall | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
clock-wall | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
wind-snapshot | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5 | pass
wind-snapshot | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
wind-snapshot | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
wind-snapshot | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
wind-snapshot | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 242, 246) | 7.93 | 4.5 | pass
wind-snapshot | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5 | pass
wind-snapshot | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 238, 245) | 16.31 | 3 | pass
epicycle-machine | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
epicycle-machine | 1440 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
epicycle-machine | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
epicycle-machine | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
epicycle-machine | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
pendulum-wave | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
pendulum-wave | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
pendulum-wave | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
pendulum-wave | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
pendulum-wave | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
pendulum-wave | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
pendulum-wave | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
pendulum-wave | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
chart-story | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
chart-story | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
chart-story | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
chart-story | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
chart-story | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
chart-story | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
glass-sandbox | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 238, 244) | 5.94 | 4.5 | pass
glass-sandbox | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-sandbox | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-sandbox | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-sandbox | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 247) | 7.95 | 4.5 | pass
glass-sandbox | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(234, 237, 244) | 7.60 | 4.5 | pass
glass-sandbox | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(235, 238, 245) | 16.34 | 3 | pass
marble-harp | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5 | pass
marble-harp | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
marble-harp | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
marble-harp | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(19, 33, 60) | 8.01 | 4.5 | pass
marble-harp | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
marble-harp | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
marble-harp | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
planet-maker | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(231, 235, 242) | 5.78 | 4.5 | pass
planet-maker | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
planet-maker | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
planet-maker | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
planet-maker | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(20, 27, 44) | 8.58 | 4.5 | pass
planet-maker | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 242, 246) | 7.93 | 4.5 | pass
planet-maker | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
planet-maker | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
glass-mandala | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
glass-mandala | 1440 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-mandala | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-mandala | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-mandala | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
ascii-sculpture | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5 | pass
ascii-sculpture | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
ascii-sculpture | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
ascii-sculpture | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(20, 27, 44) | 8.58 | 4.5 | pass
ascii-sculpture | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
ascii-sculpture | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
ascii-sculpture | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
lantern-pond | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 237, 243) | 5.88 | 4.5 | pass
lantern-pond | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
lantern-pond | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lantern-pond | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(19, 32, 57) | 8.12 | 4.5 | pass
lantern-pond | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
lantern-pond | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
lantern-pond | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
transition-slider | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(233, 238, 244) | 5.93 | 4.5 | pass
transition-slider | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
transition-slider | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
transition-slider | 1440 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
transition-slider | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 246) | 7.88 | 4.5 | pass
transition-slider | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 245) | 7.59 | 4.5 | pass
transition-slider | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 238, 244) | 16.30 | 3 | pass
liquid-hover-gallery | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-hover-gallery | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
relief-light-board | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(234, 237, 244) | 5.90 | 4.5 | pass
relief-light-board | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
relief-light-board | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
relief-light-board | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(37, 43, 56) | 7.09 | 4.5 | pass
relief-light-board | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(239, 241, 247) | 7.89 | 4.5 | pass
relief-light-board | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5 | pass
relief-light-board | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(234, 237, 244) | 16.20 | 3 | pass
lenticular-print | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
lenticular-print | 1440 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lenticular-print | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
lenticular-print | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
lenticular-print | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
lenticular-print | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
frosted-window | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(236, 239, 246) | 6.01 | 4.5 | pass
frosted-window | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
frosted-window | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
frosted-window | 1440 | top | .hint | 0 | 12 | light | rgb(170, 184, 210) | rgb(53, 65, 83) | 5.16 | 4.5 | pass
frosted-window | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 248) | 7.96 | 4.5 | pass
frosted-window | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(234, 238, 245) | 7.66 | 4.5 | pass
frosted-window | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(235, 239, 245) | 16.45 | 3 | pass
page-turn-lookbook | 1440 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(237, 242, 247) | 6.14 | 4.5 | pass
page-turn-lookbook | 1440 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
page-turn-lookbook | 1440 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
page-turn-lookbook | 1440 | top | .hint | 0 | 12 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
page-turn-lookbook | 1440 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
page-turn-lookbook | 1440 | top | .sample-info .how | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
page-turn-lookbook | 1440 | top | .sample-info h1 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
exhibit | 1440 | top | .banner .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
exhibit | 1440 | top | .banner .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(252, 252, 252) | 18.50 | 4.5 | pass
exhibit | 1440 | top | .banner__badge | 0 | 11 | dark | rgb(31, 13, 0) | rgb(255, 142, 62) | 8.24 | 4.5 | pass
exhibit | 1440 | top | .banner__text | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5 | pass
exhibit | 1440 | top | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter h2 | 0 | 38 | dark | rgb(7, 16, 34) | rgb(241, 245, 248) | 17.32 | 3 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 0 | 18 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
exhibit | 1440 | #ch-1 | .chapter__text p | 1 | 18 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
exhibit | 1440 | #ch-1 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(238, 244, 247) | 17.10 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter h2 | 0 | 38 | dark | rgb(7, 16, 34) | rgb(243, 246, 249) | 17.50 | 3 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 0 | 18 | dark | rgb(59, 74, 102) | rgb(237, 246, 249) | 8.12 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 1 | 18 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
exhibit | 1440 | #ch-4 | .chapter__text p | 2 | 18 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
exhibit | 1440 | #ch-4 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(202, 205, 212) | 11.93 | 4.5 | pass
exhibit | 1440 | #ch-6 | .chapter h2 | 0 | 38 | light | rgb(238, 244, 255) | rgb(17, 37, 55) | 14.16 | 3 | pass
exhibit | 1440 | #ch-6 | .chapter__text p | 0 | 18 | light | rgb(170, 184, 210) | rgb(15, 30, 46) | 8.43 | 4.5 | pass
exhibit | 1440 | #ch-6 | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
exhibit | 1440 | .colophon | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 1440 | .colophon | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 1440 | bottom | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 0 | 14.5 | light | rgb(170, 184, 210) | rgb(13, 26, 53) | 8.63 | 4.5 | pass
exhibit | 1440 | bottom | .ex-foot__panel p | 1 | 11.5 | light | rgb(141, 157, 189) | rgb(10, 18, 37) | 6.83 | 4.5 | pass
exhibit | 1440 | bottom | .reveal-pill__label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(200, 202, 206) | 11.57 | 4.5 | pass
hub | 1440 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 236, 250) | 7.24 | 4.5 | pass
hub | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 251) | 8.12 | 4.5 | pass
hub | 1440 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | top | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(246, 248, 250) | 8.37 | 4.5 | pass
hub | 1440 | top | .tile h2 | 0 | 34 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
hub | 1440 | top | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(246, 248, 250) | 8.37 | 4.5 | pass
hub | 1440 | top | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
hub | 1440 | top | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
hub | 1440 | top | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
hub | 1440 | top | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
hub | 1440 | bottom | .foot a | 0 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
hub | 1440 | bottom | .foot a | 1 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
hub | 1440 | bottom | .foot a | 2 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
hub | 1440 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 44) | 9.06 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 229, 238) | 7.05 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 1 | 12 | dark | rgb(59, 74, 102) | rgb(224, 231, 240) | 7.15 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 2 | 12 | dark | rgb(59, 74, 102) | rgb(219, 229, 239) | 6.99 | 4.5 | pass
hub | 1440 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(242, 244, 248) | 17.24 | 3 | pass
hub | 1440 | bottom | .tile h2 | 1 | 22 | dark | rgb(7, 16, 34) | rgb(242, 245, 248) | 17.35 | 3 | pass
hub | 1440 | bottom | .tile h2 | 2 | 22 | dark | rgb(7, 16, 34) | rgb(239, 244, 248) | 17.14 | 3 | pass
hub | 1440 | bottom | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 229, 238) | 7.05 | 4.5 | pass
hub | 1440 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 247, 249) | 8.28 | 4.5 | pass
hub | 1440 | bottom | .tile p | 2 | 12 | dark | rgb(59, 74, 102) | rgb(224, 231, 240) | 7.15 | 4.5 | pass
hub | 1440 | bottom | .tile p | 3 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 247, 249) | 8.28 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 1440 | top | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(243, 246, 249) | 17.50 | 4.5 | pass
check | 1440 | top | .field label | 1 | 13.5 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 4.5 | pass
check | 1440 | top | .field label | 2 | 13.5 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 4.5 | pass
check | 1440 | top | .field label | 3 | 13.5 | dark | rgb(7, 16, 34) | rgb(242, 246, 249) | 17.47 | 4.5 | pass
check | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 251) | 8.12 | 4.5 | pass
check | 1440 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(231, 240, 250) | 7.74 | 4.5 | pass
check | 1440 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 0 | 14 | dark | rgb(143, 28, 34) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 1 | 14 | dark | rgb(7, 92, 55) | rgb(229, 244, 236) | 7.12 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 2 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 251) | 8.21 | 4.5 | pass
check | 1440 | [data-action="example"] | .chip | 3 | 14 | dark | rgb(122, 69, 0) | rgb(255, 243, 220) | 7.13 | 4.5 | pass
check | 1440 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(235, 241, 249) | 16.71 | 4.5 | pass
check | 1440 | [data-action="example"] | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | [data-action="example"] | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 244, 251) | 8.05 | 4.5 | pass
check | 1440 | [data-action="example"] | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(246, 249, 251) | 8.43 | 4.5 | pass
check | 1440 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 254) | 18.67 | 4.5 | pass
check | 1440 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 1440 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 1440 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(225, 238, 249) | 7.55 | 4.5 | pass
check | 1440 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(225, 238, 249) | 7.55 | 4.5 | pass
check | 1440 | #results | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(249, 250, 252) | 18.18 | 4.5 | pass
check | 1440 | #results | .seg label | 3 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(253, 253, 254) | 18.67 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 1440 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
check | 1440 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
check | 1440 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(224, 235, 248) | 7.38 | 4.5 | pass
check | 1440 | #share | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 1440 | #share | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 254) | 18.64 | 4.5 | pass
check | 1440 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 1440 | #share | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 252, 253) | 8.69 | 4.5 | pass
check | 1440 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(234, 242, 249) | 7.88 | 4.5 | pass
check | 1440 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(224, 235, 248) | 7.38 | 4.5 | pass
check | 1440 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 1440 | #share | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 1440 | #share | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 248) | 8.19 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | top | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
scoreboard | 1440 | top | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
scoreboard | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 251) | 8.12 | 4.5 | pass
scoreboard | 1440 | top | #board td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | top | #board td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | top | #board td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | top | #board td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | top | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 2 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board th | 3 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | top | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 250) | 8.27 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 248) | 8.19 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 246, 248) | 8.18 | 4.5 | pass
scoreboard | 1440 | #board | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 249) | 8.20 | 4.5 | pass
scoreboard | 1440 | #board | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
scoreboard | 1440 | #board | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(236, 246, 251) | 8.12 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | #board | #board td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(242, 247, 253) | 17.63 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 2 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board th | 3 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 1440 | #board | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 250) | 8.27 | 4.5 | pass
about | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(235, 245, 252) | 8.06 | 4.5 | pass
about | 1440 | top | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
about | 1440 | top | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
about | 1440 | top | .prose p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
about | 1440 | #method | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
about | 1440 | #method | .prose li | 1 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 250) | 8.19 | 4.5 | pass
about | 1440 | #method | .prose li | 2 | 16 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
about | 1440 | #method | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(241, 246, 249) | 8.18 | 4.5 | pass
about | 1440 | #method | .prose p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
about | 1440 | #method | #techniques td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 2 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 1440 | #method | #techniques td | 3 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
404 | 375 | top | .lost .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
404 | 375 | top | .lost .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5 | pass
404 | 375 | top | .lost__panel h1 | 0 | 24 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 3 | pass
404 | 375 | top | .lost__panel p | 0 | 76 | dark | rgb(6, 75, 219) | rgb(213, 222, 235) | 5.10 | 3 | pass
404 | 375 | top | .lost__panel p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
404 | 375 | top | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(248, 251, 253) | 8.57 | 4.5 | pass
404 | 375 | top | .topnav a | 1 | 13 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
home | 375 | top | .hero__copy .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 237, 251) | 7.29 | 4.5 | pass
home | 375 | top | .hero__copy .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(229, 243, 251) | 7.87 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(248, 250, 252) | 18.14 | 4.5 | pass
home | 375 | top | .hero__facts li | 0 | 14 | dark | rgb(7, 16, 34) | rgb(70, 208, 251) | 10.55 | 4.5 | pass
home | 375 | top | .hero__facts li | 1 | 14 | dark | rgb(7, 16, 34) | rgb(246, 250, 252) | 18.08 | 4.5 | pass
home | 375 | top | .hero__facts li | 2 | 14 | dark | rgb(7, 16, 34) | rgb(246, 250, 252) | 18.08 | 4.5 | pass
home | 375 | top | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
home | 375 | #samples-title | .filters .chip | 0 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
home | 375 | #samples-title | .filters .chip | 1 | 13 | dark | rgb(7, 16, 34) | rgb(247, 251, 253) | 18.23 | 4.5 | pass
home | 375 | #samples-title | .filters .chip | 2 | 13 | dark | rgb(7, 16, 34) | rgb(246, 251, 253) | 18.20 | 4.5 | pass
home | 375 | #samples-title | .filters .chip | 3 | 13 | dark | rgb(7, 16, 34) | rgb(247, 250, 253) | 18.12 | 4.5 | pass
home | 375 | #samples-title | .filters__count | 0 | 12 | dark | rgb(59, 74, 102) | rgb(211, 235, 252) | 7.24 | 4.5 | pass
home | 375 | #samples-title | .section__head p:not(.eyebrow) | 0 | 16 | dark | rgb(59, 74, 102) | rgb(219, 239, 251) | 7.53 | 4.5 | pass
home | 375 | #samples-title | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(247, 250, 253) | 8.50 | 4.5 | pass
home | 375 | .card__new | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
home | 375 | .card__new | .card__blurb | 1 | 16 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
home | 375 | .card__new | .card__kicker | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
home | 375 | .card__new | .card__kicker | 1 | 12 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
home | 375 | .card__new | .card__new | 0 | 11 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 375 | .card__new | .card__title | 0 | 22 | dark | rgb(7, 16, 34) | rgb(242, 245, 249) | 17.36 | 3 | pass
home | 375 | .card__new | .card__title | 1 | 22 | dark | rgb(7, 16, 34) | rgb(237, 245, 249) | 17.20 | 3 | pass
home | 375 | .card__new | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | .card__new | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | .card__new | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 375 | #exhibits-title | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
home | 375 | #exhibits-title | .section__head p:not(.eyebrow) | 0 | 16 | dark | rgb(59, 74, 102) | rgb(220, 239, 251) | 7.54 | 4.5 | pass
home | 375 | #exhibits-title | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #exhibits-title | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #exhibits-title | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #exhibits-title | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
home | 375 | #about | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(223, 232, 241) | 7.19 | 4.5 | pass
home | 375 | #about | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 245, 249) | 8.12 | 4.5 | pass
home | 375 | #about | .card__actions .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 375 | #about | .card__actions .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
home | 375 | #about | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
home | 375 | bottom | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 231, 241) | 7.16 | 4.5 | pass
home | 375 | bottom | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
home | 375 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(11, 21, 43) | 16.45 | 4.5 | pass
home | 375 | bottom | .foot a | 1 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
home | 375 | bottom | .foot a | 2 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
home | 375 | bottom | .foot a | 3 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
home | 375 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 44) | 9.06 | 4.5 | pass
home | 375 | bottom | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
humanity-type | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
humanity-type | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
humanity-type | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
humanity-type | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
humanity-type | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
particle-field | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(212, 224, 243) | 5.19 | 4.5 | pass
particle-field | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 243, 247) | 8.02 | 4.5 | pass
particle-field | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
particle-field | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 245) | 16.34 | 3 | pass
logo | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
logo | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
logo | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
logo | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
split-flap-board | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
split-flap-board | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
split-flap-board | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
split-flap-board | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
split-flap-board | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
split-flap-board | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
split-flap-board | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
liquid-distort-headline | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
liquid-distort-headline | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-distort-headline | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-distort-headline | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
liquid-distort-headline | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-distort-headline | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
star-trail-text | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 225, 244) | 5.22 | 4.5 | pass
star-trail-text | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
star-trail-text | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
star-trail-text | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 247) | 7.95 | 4.5 | pass
star-trail-text | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 244) | 7.54 | 4.5 | pass
star-trail-text | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3 | pass
glitch-headline | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
glitch-headline | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glitch-headline | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glitch-headline | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
glitch-headline | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glitch-headline | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
scramble-titles | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(215, 227, 246) | 5.34 | 4.5 | pass
scramble-titles | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
scramble-titles | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
scramble-titles | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
scramble-titles | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
scramble-titles | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
scramble-titles | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
coral-ink | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 226, 246) | 5.26 | 4.5 | pass
coral-ink | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
coral-ink | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
coral-ink | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
coral-ink | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 243, 249) | 8.01 | 4.5 | pass
coral-ink | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(234, 238, 247) | 7.67 | 4.5 | pass
coral-ink | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(236, 239, 248) | 16.51 | 3 | pass
slime-network | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 223, 243) | 5.14 | 4.5 | pass
slime-network | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
slime-network | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
slime-network | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
slime-network | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 247) | 7.95 | 4.5 | pass
slime-network | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 237, 243) | 7.58 | 4.5 | pass
slime-network | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 245) | 16.34 | 3 | pass
streamline-poster | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
streamline-poster | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
streamline-poster | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
streamline-poster | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
streamline-poster | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
streamline-poster | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
contour-map | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 226, 246) | 5.29 | 4.5 | pass
contour-map | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
contour-map | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
contour-map | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 250) | 8.17 | 4.5 | pass
contour-map | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 240, 247) | 7.81 | 4.5 | pass
contour-map | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 241, 248) | 16.82 | 3 | pass
dither-flow-ink | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
dither-flow-ink | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dither-flow-ink | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dither-flow-ink | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dither-flow-ink | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
dither-flow-ink | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
dither-flow-ink | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
glass-orbs | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(213, 227, 246) | 5.32 | 4.5 | pass
glass-orbs | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-orbs | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-orbs | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-orbs | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(236, 240, 247) | 7.79 | 4.5 | pass
glass-orbs | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 241, 248) | 16.82 | 3 | pass
shader-swatchbook | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
shader-swatchbook | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
shader-swatchbook | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
shader-swatchbook | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 244, 249) | 8.08 | 4.5 | pass
shader-swatchbook | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 240, 247) | 7.81 | 4.5 | pass
shader-swatchbook | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 241, 248) | 16.79 | 3 | pass
liquid-metal-monogram | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
liquid-metal-monogram | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-metal-monogram | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-metal-monogram | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
liquid-metal-monogram | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-metal-monogram | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
shape-shifter | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 225, 244) | 5.22 | 4.5 | pass
shape-shifter | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
shape-shifter | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
shape-shifter | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 244, 248) | 8.08 | 4.5 | pass
shape-shifter | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
shape-shifter | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 239, 247) | 16.47 | 3 | pass
gpu-fluid | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 225, 244) | 5.22 | 4.5 | pass
gpu-fluid | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
gpu-fluid | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
gpu-fluid | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
gpu-fluid | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 243, 247) | 8.00 | 4.5 | pass
gpu-fluid | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 237, 245) | 7.59 | 4.5 | pass
gpu-fluid | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 246) | 16.36 | 3 | pass
scroll-zoom-tunnel | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
scroll-zoom-tunnel | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
scroll-zoom-tunnel | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
scroll-zoom-tunnel | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
scroll-zoom-tunnel | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
scroll-zoom-tunnel | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
glass-card-flow | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 247) | 5.37 | 4.5 | pass
glass-card-flow | 375 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-card-flow | 375 | top | .controls .btn | 1 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-card-flow | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-card-flow | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
glass-card-flow | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-card-flow | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
horizontal-journey | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
horizontal-journey | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
horizontal-journey | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
horizontal-journey | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
horizontal-journey | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
horizontal-journey | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
stacking-plan-cards | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
stacking-plan-cards | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
stacking-plan-cards | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
stacking-plan-cards | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
stacking-plan-cards | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(238, 241, 247) | 7.87 | 4.5 | pass
stacking-plan-cards | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
request-in-ms | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
request-in-ms | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
request-in-ms | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
request-in-ms | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
request-in-ms | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
request-in-ms | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
dawn-to-night | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
dawn-to-night | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dawn-to-night | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
dawn-to-night | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
dawn-to-night | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
dawn-to-night | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
tear-the-curtain | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 239, 246) | 6.00 | 4.5 | pass
tear-the-curtain | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
tear-the-curtain | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 375 | top | .controls .btn | 3 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
tear-the-curtain | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
tear-the-curtain | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
tear-the-curtain | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(240, 243, 248) | 17.07 | 3 | pass
dot-mesh-hero | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
dot-mesh-hero | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
dot-mesh-hero | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
dot-mesh-hero | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
dot-mesh-hero | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
dot-mesh-hero | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
glass-jellyfish | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
glass-jellyfish | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-jellyfish | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-jellyfish | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 243, 248) | 8.02 | 4.5 | pass
glass-jellyfish | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
glass-jellyfish | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 246) | 16.36 | 3 | pass
halftone-dissolve | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 225, 245) | 5.22 | 4.5 | pass
halftone-dissolve | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
halftone-dissolve | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
halftone-dissolve | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 243, 248) | 8.01 | 4.5 | pass
halftone-dissolve | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(235, 239, 246) | 7.72 | 4.5 | pass
halftone-dissolve | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(236, 240, 247) | 16.61 | 3 | pass
lamp-cord-theme | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 239, 246) | 6.00 | 4.5 | pass
lamp-cord-theme | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
lamp-cord-theme | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
lamp-cord-theme | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lamp-cord-theme | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
lamp-cord-theme | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
lamp-cord-theme | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(240, 244, 249) | 17.19 | 3 | pass
glass-diorama-card | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 239, 246) | 6.00 | 4.5 | pass
glass-diorama-card | 375 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-diorama-card | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-diorama-card | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-diorama-card | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
skill-chips | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
skill-chips | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
skill-chips | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
skill-chips | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
skill-chips | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
skill-chips | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
brand-colour-sphere | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
brand-colour-sphere | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
brand-colour-sphere | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
brand-colour-sphere | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
brand-colour-sphere | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
brand-colour-sphere | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 243, 248) | 17.04 | 3 | pass
wavy-lines-hero | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
wavy-lines-hero | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
wavy-lines-hero | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
wavy-lines-hero | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 246) | 7.95 | 4.5 | pass
wavy-lines-hero | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
wavy-lines-hero | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3 | pass
icon-micro-set | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
icon-micro-set | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
icon-micro-set | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
icon-micro-set | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
icon-micro-set | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
icon-micro-set | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
weather-window | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
weather-window | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
weather-window | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
weather-window | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 244, 249) | 8.10 | 4.5 | pass
weather-window | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
weather-window | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 241, 248) | 16.79 | 3 | pass
liquid-glass-lens | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 246) | 5.19 | 4.5 | pass
liquid-glass-lens | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-glass-lens | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-glass-lens | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 243, 249) | 8.01 | 4.5 | pass
liquid-glass-lens | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 238, 246) | 7.65 | 4.5 | pass
liquid-glass-lens | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 240, 248) | 16.59 | 3 | pass
pricing-rolling-digits | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(215, 227, 246) | 5.34 | 4.5 | pass
pricing-rolling-digits | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
pricing-rolling-digits | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
pricing-rolling-digits | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 250) | 8.17 | 4.5 | pass
pricing-rolling-digits | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(238, 241, 247) | 7.87 | 4.5 | pass
pricing-rolling-digits | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 241, 248) | 16.79 | 3 | pass
glass-hero-kit | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(215, 227, 246) | 5.34 | 4.5 | pass
glass-hero-kit | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-hero-kit | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
glass-hero-kit | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
glass-hero-kit | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
glass-hero-kit | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
integration-beams | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
integration-beams | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
integration-beams | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
integration-beams | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
integration-beams | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
integration-beams | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
bento-grid | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 226, 246) | 5.29 | 4.5 | pass
bento-grid | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
bento-grid | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
bento-grid | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 244, 249) | 8.07 | 4.5 | pass
bento-grid | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
bento-grid | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 242, 247) | 16.89 | 3 | pass
mega-menu | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
mega-menu | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
mega-menu | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
mega-menu | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
mega-menu | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
mega-menu | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
testimonial-wall | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
testimonial-wall | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
testimonial-wall | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
testimonial-wall | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
testimonial-wall | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
testimonial-wall | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
browser-frame-showcase | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
browser-frame-showcase | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
browser-frame-showcase | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
browser-frame-showcase | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
browser-frame-showcase | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
browser-frame-showcase | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
focus-trail-form | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
focus-trail-form | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
focus-trail-form | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
focus-trail-form | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 244, 249) | 8.10 | 4.5 | pass
focus-trail-form | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(235, 240, 247) | 7.78 | 4.5 | pass
focus-trail-form | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(236, 241, 248) | 16.73 | 3 | pass
publish-button | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
publish-button | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
publish-button | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
publish-button | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 246, 250) | 8.22 | 4.5 | pass
publish-button | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
publish-button | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 242, 247) | 16.85 | 3 | pass
edge-network-globe | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
edge-network-globe | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
edge-network-globe | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(230, 243, 252) | 16.80 | 4.5 | pass
edge-network-globe | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
edge-network-globe | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 246) | 7.95 | 4.5 | pass
edge-network-globe | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 242) | 7.53 | 4.5 | pass
edge-network-globe | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3 | pass
clock-wall | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
clock-wall | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
clock-wall | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
clock-wall | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 246, 250) | 8.23 | 4.5 | pass
clock-wall | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
clock-wall | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 243, 248) | 17.04 | 3 | pass
wind-snapshot | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
wind-snapshot | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
wind-snapshot | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
wind-snapshot | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
wind-snapshot | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 246) | 7.95 | 4.5 | pass
wind-snapshot | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 242) | 7.53 | 4.5 | pass
wind-snapshot | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3 | pass
epicycle-machine | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 240, 246) | 6.03 | 4.5 | pass
epicycle-machine | 375 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
epicycle-machine | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
epicycle-machine | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
epicycle-machine | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
pendulum-wave | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
pendulum-wave | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
pendulum-wave | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
pendulum-wave | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
pendulum-wave | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
pendulum-wave | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
pendulum-wave | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
chart-story | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
chart-story | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
chart-story | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
chart-story | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
chart-story | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
chart-story | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(238, 242, 248) | 16.90 | 3 | pass
glass-sandbox | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(212, 224, 244) | 5.19 | 4.5 | pass
glass-sandbox | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
glass-sandbox | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-sandbox | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-sandbox | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 243, 247) | 8.00 | 4.5 | pass
glass-sandbox | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(234, 237, 244) | 7.60 | 4.5 | pass
glass-sandbox | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(236, 238, 245) | 16.38 | 3 | pass
marble-harp | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
marble-harp | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
marble-harp | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
marble-harp | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 247) | 7.95 | 4.5 | pass
marble-harp | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
marble-harp | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 237, 244) | 16.23 | 3 | pass
planet-maker | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(231, 234, 242) | 5.75 | 4.5 | pass
planet-maker | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
planet-maker | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
planet-maker | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
planet-maker | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 243, 247) | 8.02 | 4.5 | pass
planet-maker | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 242) | 7.53 | 4.5 | pass
planet-maker | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(236, 239, 244) | 16.47 | 3 | pass
glass-mandala | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 240, 246) | 6.03 | 4.5 | pass
glass-mandala | 375 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
glass-mandala | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
glass-mandala | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(235, 240, 247) | 7.78 | 4.5 | pass
glass-mandala | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
ascii-sculpture | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 223, 243) | 5.14 | 4.5 | pass
ascii-sculpture | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
ascii-sculpture | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
ascii-sculpture | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 243, 247) | 8.02 | 4.5 | pass
ascii-sculpture | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 243) | 7.53 | 4.5 | pass
ascii-sculpture | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 245) | 16.34 | 3 | pass
lantern-pond | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 244) | 5.18 | 4.5 | pass
lantern-pond | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
lantern-pond | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lantern-pond | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 242, 247) | 7.95 | 4.5 | pass
lantern-pond | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 237, 244) | 7.59 | 4.5 | pass
lantern-pond | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 239, 245) | 16.45 | 3 | pass
transition-slider | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
transition-slider | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
transition-slider | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 252) | 17.65 | 4.5 | pass
transition-slider | 375 | top | .controls .btn | 2 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
transition-slider | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 249) | 8.15 | 4.5 | pass
transition-slider | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
transition-slider | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
liquid-hover-gallery | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 228, 246) | 5.36 | 4.5 | pass
liquid-hover-gallery | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
liquid-hover-gallery | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
liquid-hover-gallery | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
liquid-hover-gallery | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
liquid-hover-gallery | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
relief-light-board | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(211, 224, 243) | 5.18 | 4.5 | pass
relief-light-board | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
relief-light-board | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
relief-light-board | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 243, 247) | 8.02 | 4.5 | pass
relief-light-board | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(233, 236, 242) | 7.53 | 4.5 | pass
relief-light-board | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(235, 238, 244) | 16.33 | 3 | pass
lenticular-print | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(235, 240, 246) | 6.03 | 4.5 | pass
lenticular-print | 375 | top | .controls .btn | 0 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
lenticular-print | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
lenticular-print | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
lenticular-print | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
frosted-window | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(212, 225, 245) | 5.23 | 4.5 | pass
frosted-window | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
frosted-window | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
frosted-window | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(242, 245, 250) | 8.15 | 4.5 | pass
frosted-window | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(235, 240, 247) | 7.78 | 4.5 | pass
frosted-window | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(237, 241, 248) | 16.76 | 3 | pass
page-turn-lookbook | 375 | top | .controls .back | 0 | 14 | dark | rgb(6, 75, 219) | rgb(214, 227, 246) | 5.33 | 4.5 | pass
page-turn-lookbook | 375 | top | .controls .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
page-turn-lookbook | 375 | top | .controls .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(243, 247, 253) | 17.66 | 4.5 | pass
page-turn-lookbook | 375 | top | .sample-info .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(243, 245, 249) | 8.16 | 4.5 | pass
page-turn-lookbook | 375 | top | .sample-info .how | 0 | 14 | dark | rgb(59, 74, 102) | rgb(237, 241, 247) | 7.86 | 4.5 | pass
page-turn-lookbook | 375 | top | .sample-info h1 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(239, 242, 248) | 16.93 | 3 | pass
exhibit | 375 | top | .banner .btn | 0 | 13 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
exhibit | 375 | top | .banner .btn | 1 | 13 | dark | rgb(7, 16, 34) | rgb(251, 252, 252) | 18.47 | 4.5 | pass
exhibit | 375 | top | .banner__badge | 0 | 11 | dark | rgb(31, 13, 0) | rgb(255, 143, 62) | 8.29 | 4.5 | pass
exhibit | 375 | top | .banner__text | 0 | 14.5 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5 | pass
exhibit | 375 | top | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(229, 241, 249) | 16.53 | 4.5 | pass
exhibit | 375 | #ch-1 | .chapter h2 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(241, 246, 249) | 17.44 | 3 | pass
exhibit | 375 | #ch-1 | .chapter__text p | 0 | 16.5 | dark | rgb(59, 74, 102) | rgb(239, 246, 249) | 8.15 | 4.5 | pass
exhibit | 375 | #ch-1 | .chapter__text p | 1 | 16.5 | dark | rgb(59, 74, 102) | rgb(237, 245, 250) | 8.08 | 4.5 | pass
exhibit | 375 | #ch-1 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(239, 246, 249) | 17.37 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter h2 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(241, 246, 249) | 17.44 | 3 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 0 | 16.5 | dark | rgb(59, 74, 102) | rgb(236, 243, 248) | 7.95 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 1 | 16.5 | dark | rgb(59, 74, 102) | rgb(240, 245, 249) | 8.12 | 4.5 | pass
exhibit | 375 | #ch-4 | .chapter__text p | 2 | 16.5 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
exhibit | 375 | #ch-4 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(236, 245, 249) | 17.17 | 4.5 | pass
exhibit | 375 | #ch-6 | .chapter h2 | 0 | 26 | light | rgb(238, 244, 255) | rgb(17, 36, 54) | 14.31 | 3 | pass
exhibit | 375 | #ch-6 | .chapter__text p | 0 | 16.5 | light | rgb(170, 184, 210) | rgb(14, 28, 43) | 8.61 | 4.5 | pass
exhibit | 375 | #ch-6 | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(234, 243, 249) | 16.89 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(248, 249, 251) | 8.46 | 4.5 | pass
exhibit | 375 | .colophon | .colophon p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
exhibit | 375 | .colophon | .colophon__code | 0 | 13.5 | light | rgb(217, 232, 255) | rgb(14, 21, 38) | 14.68 | 4.5 | pass
exhibit | 375 | .colophon | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(234, 242, 250) | 16.80 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 0 | 14.5 | light | rgb(170, 184, 210) | rgb(13, 26, 54) | 8.62 | 4.5 | pass
exhibit | 375 | bottom | .ex-foot__panel p | 1 | 11.5 | light | rgb(141, 157, 189) | rgb(7, 12, 25) | 7.15 | 4.5 | pass
exhibit | 375 | bottom | .reveal-pill__label | 0 | 12.5 | dark | rgb(7, 16, 34) | rgb(200, 202, 205) | 11.56 | 4.5 | pass
hub | 375 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 237, 251) | 7.29 | 4.5 | pass
hub | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(219, 234, 251) | 7.29 | 4.5 | pass
hub | 375 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 375 | top | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(248, 250, 252) | 8.51 | 4.5 | pass
hub | 375 | top | .tile h2 | 0 | 26 | dark | rgb(7, 16, 34) | rgb(247, 248, 250) | 17.86 | 3 | pass
hub | 375 | top | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(248, 250, 252) | 8.51 | 4.5 | pass
hub | 375 | top | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
hub | 375 | top | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(248, 251, 253) | 8.57 | 4.5 | pass
hub | 375 | top | .topnav a | 1 | 13 | dark | rgb(59, 74, 102) | rgb(249, 252, 253) | 8.64 | 4.5 | pass
hub | 375 | bottom | .foot a | 0 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
hub | 375 | bottom | .foot a | 1 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
hub | 375 | bottom | .foot a | 2 | 14 | light | rgb(170, 184, 210) | rgb(7, 12, 25) | 9.76 | 4.5 | pass
hub | 375 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(11, 21, 43) | 9.08 | 4.5 | pass
hub | 375 | bottom | .tile .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 230, 239) | 7.10 | 4.5 | pass
hub | 375 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(243, 245, 248) | 17.38 | 3 | pass
hub | 375 | bottom | .tile p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 230, 239) | 7.10 | 4.5 | pass
hub | 375 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5 | pass
hub | 375 | bottom | .topnav a | 0 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
hub | 375 | bottom | .topnav a | 1 | 13 | dark | rgb(59, 74, 102) | rgb(250, 252, 253) | 8.66 | 4.5 | pass
check | 375 | top | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 4.5 | pass
check | 375 | top | .field label | 1 | 13.5 | dark | rgb(7, 16, 34) | rgb(239, 246, 249) | 17.37 | 4.5 | pass
check | 375 | top | .field label | 2 | 13.5 | dark | rgb(7, 16, 34) | rgb(237, 245, 249) | 17.20 | 4.5 | pass
check | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(226, 236, 252) | 7.48 | 4.5 | pass
check | 375 | top | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(233, 242, 251) | 7.87 | 4.5 | pass
check | 375 | [data-action="example"] | .btn--ghost | 0 | 15 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 0 | 14 | dark | rgb(143, 28, 34) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 1 | 14 | dark | rgb(7, 92, 55) | rgb(229, 244, 236) | 7.12 | 4.5 | pass
check | 375 | [data-action="example"] | .chip | 2 | 14 | dark | rgb(59, 74, 102) | rgb(242, 246, 251) | 8.21 | 4.5 | pass
check | 375 | [data-action="example"] | .field label | 0 | 13.5 | dark | rgb(7, 16, 34) | rgb(235, 242, 251) | 16.84 | 4.5 | pass
check | 375 | [data-action="example"] | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(235, 242, 251) | 7.90 | 4.5 | pass
check | 375 | #results | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #results | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #results | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 375 | #results | .outcome__name | 3 | 16 | dark | rgb(7, 16, 34) | rgb(251, 252, 253) | 18.48 | 4.5 | pass
check | 375 | #results | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 254) | 8.68 | 4.5 | pass
check | 375 | #results | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #results | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #results | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 375 | #results | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #results | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #results | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
check | 375 | #results | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 0 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 1 | 16 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__name | 2 | 16 | dark | rgb(7, 16, 34) | rgb(253, 236, 238) | 16.64 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 1 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 2 | 13 | dark | rgb(59, 74, 102) | rgb(252, 253, 253) | 8.74 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .outcome__why | 3 | 13 | dark | rgb(59, 74, 102) | rgb(253, 236, 238) | 7.81 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 0 | 13 | light | rgb(255, 255, 255) | rgb(180, 35, 42) | 6.53 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 2 | 13 | dark | rgb(59, 74, 102) | rgb(229, 242, 251) | 7.82 | 4.5 | pass
check | 375 | #outcomes li:nth-child(8) | .seg label | 3 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .btn--ghost | 0 | 13 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
check | 375 | #share | .btn--ghost | 1 | 15 | dark | rgb(7, 16, 34) | rgb(250, 251, 252) | 18.32 | 4.5 | pass
check | 375 | #share | .note | 0 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
check | 375 | #share | .outcome__why | 0 | 13 | dark | rgb(59, 74, 102) | rgb(251, 252, 253) | 8.67 | 4.5 | pass
check | 375 | #share | .panel > p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(235, 241, 251) | 7.85 | 4.5 | pass
check | 375 | #share | .panel > p | 1 | 13.5 | dark | rgb(59, 74, 102) | rgb(238, 245, 249) | 8.09 | 4.5 | pass
check | 375 | #share | .seg label | 0 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .seg label | 1 | 13 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
check | 375 | #share | .seg label | 2 | 13 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | top | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
scoreboard | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(219, 234, 251) | 7.29 | 4.5 | pass
scoreboard | 375 | top | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | top | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | top | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 0 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 1 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 2 | 14 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
scoreboard | 375 | #board | .legend__t | 3 | 14 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
scoreboard | 375 | #board | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(219, 234, 251) | 7.29 | 4.5 | pass
scoreboard | 375 | #board | #board th | 0 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | #board | #board th | 1 | 12 | dark | rgb(59, 74, 102) | rgb(244, 249, 254) | 8.41 | 4.5 | pass
scoreboard | 375 | #board | #board-status | 0 | 16 | dark | rgb(59, 74, 102) | rgb(243, 246, 249) | 8.21 | 4.5 | pass
about | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(226, 236, 252) | 7.48 | 4.5 | pass
about | 375 | top | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(239, 245, 249) | 8.10 | 4.5 | pass
about | 375 | #method | .prose li | 0 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
about | 375 | #method | .prose li | 1 | 16 | dark | rgb(59, 74, 102) | rgb(236, 245, 249) | 8.06 | 4.5 | pass
about | 375 | #method | .prose p | 0 | 16 | dark | rgb(59, 74, 102) | rgb(239, 246, 248) | 8.15 | 4.5 | pass
about | 375 | #method | #techniques td | 0 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass
about | 375 | #method | #techniques td | 1 | 14 | dark | rgb(7, 16, 34) | rgb(255, 255, 255) | 18.98 | 4.5 | pass

1212 measurements on 70 pages, 1212 pass, 0 fail. Lowest ratio: 5.04. Selectors never measured: none.
