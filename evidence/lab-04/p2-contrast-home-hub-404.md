Contrast of text, WCAG 2.x, measured in headless Chromium at 1440×900 and 375×812.
Method: record each element's text colour, hide all text, take 3 screenshots 1.5 s apart (anything that drifts is caught at its worst), and compare with the worst pixel inside the element's content box (where the glyphs sit) across the 3 frames: the darkest pixel behind dark text, the brightest behind light text (dark = text luminance under 0.179). Only elements fully on screen, below the sticky top bar and not covered by a fixed panel are measured; several scroll positions per page; every selector must be measured at least once on its page. AA: 4.5:1, or 3:1 for large text (≥24 px, or ≥18.66 px bold).

page | width | scrolled to | selector | # | px | polarity | text colour | worst behind | ratio | need | result
---|---|---|---|---|---|---|---|---|---|---|---
404 | 1440 | top | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
404 | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
404 | 1440 | top | .lost__panel h1 | 0 | 32 | dark | rgb(7, 16, 34) | rgb(240, 247, 249) | 17.52 | 3 | pass
404 | 1440 | top | .lost__panel p | 0 | 140 | dark | rgb(59, 74, 102) | rgb(212, 221, 233) | 6.50 | 3 | pass
404 | 1440 | top | .lost__panel p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
404 | 1440 | top | .lost .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
404 | 1440 | top | .lost .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(252, 253, 253) | 18.63 | 4.5 | pass
home | 1440 | top | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(250, 253, 254) | 8.72 | 4.5 | pass
home | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
home | 1440 | top | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
home | 1440 | top | .hero__copy .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(233, 244, 251) | 7.97 | 4.5 | pass
home | 1440 | top | .hero__copy .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(225, 242, 252) | 7.77 | 4.5 | pass
home | 1440 | top | .hero__facts li | 0 | 14 | dark | rgb(7, 16, 34) | rgb(70, 208, 251) | 10.55 | 4.5 | pass
home | 1440 | top | .hero__facts li | 1 | 14 | dark | rgb(7, 16, 34) | rgb(248, 251, 254) | 18.28 | 4.5 | pass
home | 1440 | top | .hero__facts li | 2 | 14 | dark | rgb(7, 16, 34) | rgb(247, 251, 254) | 18.25 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 1440 | top | .hero__cta .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(249, 252, 254) | 18.43 | 4.5 | pass
home | 1440 | #samples | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
home | 1440 | #samples | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 1440 | #samples | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(250, 253, 255) | 8.72 | 4.5 | pass
home | 1440 | #samples | .section__head p:not(.eyebrow) | 0 | 16 | dark | rgb(59, 74, 102) | rgb(236, 246, 252) | 8.13 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 1 | 12 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
home | 1440 | #samples | .card__kicker | 2 | 12 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
home | 1440 | #samples | .card__title | 0 | 22 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 3 | pass
home | 1440 | #samples | .card__title | 1 | 22 | dark | rgb(7, 16, 34) | rgb(240, 247, 249) | 17.52 | 3 | pass
home | 1440 | #samples | .card__title | 2 | 22 | dark | rgb(7, 16, 34) | rgb(239, 246, 249) | 17.37 | 3 | pass
home | 1440 | #samples | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 1 | 16 | dark | rgb(59, 74, 102) | rgb(239, 247, 249) | 8.21 | 4.5 | pass
home | 1440 | #samples | .card__blurb | 2 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
home | 1440 | #samples | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #samples | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #samples | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #samples | .tags li | 3 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 1440 | #about | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 1440 | #about | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
home | 1440 | #about | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 1440 | #about | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
home | 1440 | #about | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(241, 247, 249) | 8.23 | 4.5 | pass
home | 1440 | bottom | .topnav a | 0 | 15 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 1440 | bottom | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
home | 1440 | bottom | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
home | 1440 | bottom | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
home | 1440 | bottom | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(243, 247, 249) | 8.26 | 4.5 | pass
home | 1440 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(8, 13, 25) | 9.70 | 4.5 | pass
home | 1440 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 25) | 17.58 | 4.5 | pass
home | 1440 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 25) | 17.58 | 4.5 | pass
home | 1440 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(8, 12, 24) | 17.67 | 4.5 | pass
home | 1440 | bottom | .foot a | 3 | 14 | light | rgb(238, 244, 255) | rgb(8, 12, 23) | 17.69 | 4.5 | pass
hub | 1440 | top | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | top | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(250, 253, 254) | 8.72 | 4.5 | pass
hub | 1440 | top | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
hub | 1440 | top | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(252, 254, 254) | 8.80 | 4.5 | pass
hub | 1440 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(212, 231, 249) | 7.04 | 4.5 | pass
hub | 1440 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(235, 246, 252) | 8.11 | 4.5 | pass
hub | 1440 | top | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
hub | 1440 | top | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
hub | 1440 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 1 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 2 | 15 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
hub | 1440 | bottom | .topnav a | 3 | 15 | dark | rgb(59, 74, 102) | rgb(249, 253, 255) | 8.71 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
hub | 1440 | bottom | .tile .eyebrow | 2 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
hub | 1440 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
hub | 1440 | bottom | .tile h2 | 1 | 22 | dark | rgb(7, 16, 34) | rgb(244, 248, 249) | 17.76 | 3 | pass
hub | 1440 | bottom | .tile h2 | 2 | 22 | dark | rgb(7, 16, 34) | rgb(243, 248, 249) | 17.72 | 3 | pass
hub | 1440 | bottom | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
hub | 1440 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 247, 250) | 8.29 | 4.5 | pass
hub | 1440 | bottom | .tile p | 2 | 15.5 | dark | rgb(59, 74, 102) | rgb(245, 248, 249) | 8.35 | 4.5 | pass
hub | 1440 | bottom | .tile p | 3 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 249) | 8.33 | 4.5 | pass
hub | 1440 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(8, 13, 25) | 9.70 | 4.5 | pass
hub | 1440 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 24) | 17.59 | 4.5 | pass
hub | 1440 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 12, 23) | 17.69 | 4.5 | pass
hub | 1440 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(7, 12, 23) | 17.71 | 4.5 | pass
404 | 375 | top | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(249, 253, 255) | 8.71 | 4.5 | pass
404 | 375 | top | .topnav a | 1 | 14 | dark | rgb(59, 74, 102) | rgb(243, 250, 255) | 8.45 | 4.5 | pass
404 | 375 | top | .lost__panel h1 | 0 | 24 | dark | rgb(7, 16, 34) | rgb(241, 247, 249) | 17.55 | 3 | pass
404 | 375 | top | .lost__panel p | 0 | 76 | dark | rgb(59, 74, 102) | rgb(212, 221, 233) | 6.50 | 3 | pass
404 | 375 | top | .lost__panel p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
404 | 375 | top | .lost .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
404 | 375 | top | .lost .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(251, 253, 253) | 18.59 | 4.5 | pass
home | 375 | top | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(243, 250, 255) | 8.45 | 4.5 | pass
home | 375 | top | .hero__copy .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 237, 251) | 7.29 | 4.5 | pass
home | 375 | top | .hero__copy .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(228, 243, 252) | 7.86 | 4.5 | pass
home | 375 | top | .hero__facts li | 0 | 14 | dark | rgb(7, 16, 34) | rgb(70, 208, 251) | 10.55 | 4.5 | pass
home | 375 | top | .hero__facts li | 1 | 14 | dark | rgb(7, 16, 34) | rgb(247, 251, 254) | 18.25 | 4.5 | pass
home | 375 | top | .hero__facts li | 2 | 14 | dark | rgb(7, 16, 34) | rgb(247, 251, 254) | 18.25 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
home | 375 | top | .hero__cta .btn | 1 | 15 | dark | rgb(7, 16, 34) | rgb(249, 252, 254) | 18.43 | 4.5 | pass
home | 375 | #samples | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(251, 253, 254) | 8.73 | 4.5 | pass
home | 375 | #samples | .card__kicker | 0 | 12 | dark | rgb(59, 74, 102) | rgb(238, 247, 249) | 8.19 | 4.5 | pass
home | 375 | #samples | .card__kicker | 1 | 12 | dark | rgb(59, 74, 102) | rgb(240, 247, 249) | 8.22 | 4.5 | pass
home | 375 | #samples | .card__title | 0 | 22 | dark | rgb(7, 16, 34) | rgb(240, 246, 249) | 17.41 | 3 | pass
home | 375 | #samples | .card__title | 1 | 22 | dark | rgb(7, 16, 34) | rgb(240, 246, 250) | 17.42 | 3 | pass
home | 375 | #samples | .card__blurb | 0 | 16 | dark | rgb(59, 74, 102) | rgb(240, 246, 249) | 8.17 | 4.5 | pass
home | 375 | #samples | .card__blurb | 1 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
home | 375 | #samples | .tags li | 0 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #samples | .tags li | 1 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #samples | .tags li | 2 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #samples | .tags li | 3 | 12.5 | dark | rgb(59, 74, 102) | rgb(230, 243, 252) | 7.89 | 4.5 | pass
home | 375 | #about | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 375 | #about | .card__actions .btn | 0 | 15 | dark | rgb(7, 16, 34) | rgb(253, 253, 253) | 18.66 | 4.5 | pass
home | 375 | #about | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(218, 227, 238) | 6.87 | 4.5 | pass
home | 375 | #about | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(238, 246, 249) | 8.14 | 4.5 | pass
home | 375 | bottom | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(252, 253, 254) | 8.75 | 4.5 | pass
home | 375 | bottom | .about p | 0 | 12 | dark | rgb(59, 74, 102) | rgb(224, 230, 240) | 7.10 | 4.5 | pass
home | 375 | bottom | .about p | 1 | 16 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
home | 375 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(7, 11, 22) | 9.82 | 4.5 | pass
home | 375 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(7, 11, 22) | 17.80 | 4.5 | pass
home | 375 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 26) | 17.57 | 4.5 | pass
home | 375 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 27) | 17.47 | 4.5 | pass
home | 375 | bottom | .foot a | 3 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 26) | 17.48 | 4.5 | pass
hub | 375 | top | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(250, 253, 254) | 8.72 | 4.5 | pass
hub | 375 | top | .topnav a | 1 | 14 | dark | rgb(59, 74, 102) | rgb(243, 250, 255) | 8.45 | 4.5 | pass
hub | 375 | top | .page-head .eyebrow | 0 | 12 | dark | rgb(59, 74, 102) | rgb(208, 236, 251) | 7.24 | 4.5 | pass
hub | 375 | top | .page-head .lede | 0 | 18 | dark | rgb(59, 74, 102) | rgb(219, 235, 251) | 7.33 | 4.5 | pass
hub | 375 | top | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(247, 249, 250) | 17.98 | 3 | pass
hub | 375 | top | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(243, 247, 248) | 8.26 | 4.5 | pass
hub | 375 | top | .tile .btn | 0 | 15 | light | rgb(255, 255, 255) | rgb(5, 88, 220) | 6.11 | 4.5 | pass
hub | 375 | bottom | .topnav a | 0 | 14 | dark | rgb(59, 74, 102) | rgb(244, 251, 255) | 8.52 | 4.5 | pass
hub | 375 | bottom | .topnav a | 1 | 14 | dark | rgb(59, 74, 102) | rgb(246, 252, 255) | 8.61 | 4.5 | pass
hub | 375 | bottom | .tile .eyebrow | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 250) | 8.34 | 4.5 | pass
hub | 375 | bottom | .tile h2 | 0 | 22 | dark | rgb(7, 16, 34) | rgb(243, 248, 249) | 17.72 | 3 | pass
hub | 375 | bottom | .tile p | 0 | 15.5 | dark | rgb(59, 74, 102) | rgb(244, 248, 250) | 8.34 | 4.5 | pass
hub | 375 | bottom | .tile p | 1 | 15.5 | dark | rgb(59, 74, 102) | rgb(242, 247, 249) | 8.25 | 4.5 | pass
hub | 375 | bottom | .foot span | 0 | 14 | light | rgb(170, 184, 210) | rgb(7, 11, 22) | 9.82 | 4.5 | pass
hub | 375 | bottom | .foot a | 0 | 14 | light | rgb(238, 244, 255) | rgb(8, 13, 25) | 17.58 | 4.5 | pass
hub | 375 | bottom | .foot a | 1 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 27) | 17.47 | 4.5 | pass
hub | 375 | bottom | .foot a | 2 | 14 | light | rgb(238, 244, 255) | rgb(8, 14, 27) | 17.47 | 4.5 | pass

131 measurements, 131 pass, 0 fail. Lowest ratio: 6.11. Selectors never measured: none.
