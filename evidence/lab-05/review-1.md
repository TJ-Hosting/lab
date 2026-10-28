# Review 1: the lab-05 samples against DS v9

I looked only at images. Reference (tj-hosting.ca DS v9): `C:\localhost\projects\tj\ref\tj-build-06\inspiration.png` and, in `C:\localhost\projects\tj\evidence\tj-build-06\p6\`, home-sec-0.png to home-sec-5.png, phone-firsts.png, shots\home-en-1440x900-01.png, -02.png, -03.png, shots\home-en-390x844-01.png, sheets-a\home-, nope-, lab-, services- and contact-en-1440x900.png, sweep-a\nope-en-1440x900-02.png and sweep-a\contact-en-1440x900-01.png. Lab-04: all 29 .jpg files in `C:\localhost\tj-lab-day\evidence\lab-04\p6\after-2\` (home-1440, home-samples-1440, home-exhibits-1440, home-about-1440, home-bottom-1440, samples_humanity-type-1440, samples_particle-field-1440, samples_logo-1440, exhibits_humanity-1440, exhibits_humanity-ch-1/4/5/6-1440, exhibits_humanity-bottom-1440, honeypot-1440, honeypot-bottom-1440, honeypot_check-1440, honeypot_scoreboard-1440, honeypot_about-1440, honeypot_about-method-1440, 404.html-1440, home-375, home-samples-375, samples_particle-field-375, exhibits_humanity-375, exhibits_humanity-ch-5-375, honeypot-375, honeypot_scoreboard-375, 404.html-375). New: all twelve files in `C:\localhost\tj-lab-day\evidence\lab-05\review-input\` (new-01-375 to new-12-375 / -1440 as named). I also cropped and enlarged parts of new-01, 02, 04, 05, 06, 08, 09, 10, 11, 12 and lab-04 samples_particle-field-375, and sampled colours with Pillow. Colour values below are 3x3-pixel averages; the new and lab-04 frames are JPEG, so values are approximate (roughly ±8 per channel), and "darkest-ink" values for thin script strokes are less reliable still. Each new frame is one moment of an animation, so some details may differ a second later.

## Verdict: mostly

The shared shell on all twelve new pages is the lab-04 sample shell unchanged. That covers the logo and TJ-HOSTING LAB wordmark, the white "All samples" pill and the bottom-left glass panel (mono SAMPLE NN · CATEGORY eyebrow, heavy rounded-sans title, bold "How it's made:" lead, royal primary button, outlined secondary, underlined "← Back to the lab", round chevron). It also covers the day-sky page gradient and the navy window frame. Sampled colours match DS v9. Page sky runs from #fefefe at top-left to #cbe7fc at bottom-right (tj: #fafcfd to #c9e7fc). Primary buttons sample #0455ea to #045ad5 (tj #0558dc, lab-04 #0456e0). Panels and cards sample #f3f7fc (tj card #f3f9fd), and dark windows sample #060a16 to #071230 (tj story/footer #060c18 to #080f22). Eight of the twelve art pieces stay inside DS v9's blue-glass world: new-01, 02, 03, 04, 05, 06, 10 and 11. Most of the drift is in the art of four pieces: new-12, new-07, new-09 and new-08. new-12 is pixel-art sand in an earth-and-lava palette. new-07 is a photograph with green lily pads and warm lanterns. new-09 has a script-only headline in navy, and new-08 uses flat line-art drawings. A few smaller inconsistencies come on top of that. **Score: 7.5 / 10.** new-03 alone would be about 9. With findings 1 to 4 fixed I would expect about 8.5.

## Findings

### 1. Falling-sand piece uses an earth, lava and pixel-game palette
- **Severity:** high
- **Where:** new-12-375.jpg, the whole art window (y ≈ 106 to 515) and the swatch tray at the top of it (y ≈ 112 to 192).
- **Against DS v9:** Every DS v9 surface is royal/azure/cyan blue, white and navy glass. The only warm note in the reference is the small orange sun on the browser-window render (inspiration.png, home hero). This frame brings in lava orange (≈ #f7983b / #ee7e2b), a brown dirt band (≈ #653f19), a beige sand floor (≈ #efddb5) and green plants (≈ #297e66). The tray has nine swatches, including brown, orange and green. Hard 1-cell pixel edges make it read like a retro game, not the glass-and-light look of lab-04's particle field. The tray fill is flat grey (≈ #dedfe2), not DS v9's white-blue glass (≈ #f3f9fd). It also runs almost to the window edges, where other in-frame chips are inset.
- **Fix:**
  - Recolour the materials into DS v9:
    - sand: pale ice to sky (#e6f3fe to #9fd0fb)
    - lava/fire: cyan glowing to white (#38bdf8 to #e0f7ff); if a warm note is wanted, keep one small one only
    - water: keep azure (≈ #3da1fc is already fine)
    - glass: keep the pale-blue outline it already has
  - Drop the brown dirt layer and the green plants, or draw them in royal/navy.
  - Make the tray white-blue glass: about #f3f8fd, 1px light-blue border, 14–16px radius, inset about 12px from the window sides. Show the swatches as small glossy spheres in the new material colours.
  - Soften the grain: give cells a 1px glow, or draw at twice the cell density, so the pour reads as glass sparks rather than pixels.

### 2. Lantern pond is a stock-style photograph with green and warm colour
- **Severity:** medium
- **Where:** new-07-1440.jpg, the whole window (x 120 to 1320, y 106 to 884).
- **Against DS v9:** DS v9 art is glossy isometric 3D renders in royal/azure (home-sec-0 to -4, services, contact) or abstract navy light, meaning stars and aurora (shots -02 and -03, footer). Photographs appear only as documentary photos of people in the story section. Lab-04's samples follow the same art language. This frame is a photoreal nature scene with dark green-teal lily pads (≈ #295357 to #326a87) and two large warm lanterns (≈ #fbc888) as the focal points. The blue water (≈ #001e44) fits, but the subject and the green and warm accents make it look like a different site.
- **Fix:** Grade the photo to a DS v9 night duotone: shadows #060c18, mids around #0b3a8a, highlights #9fd0fb. That turns the lily pads into deep navy/teal shapes. Then either make the lanterns cyan-glowing glass cubes, like the glass cube on lab-04 home-1440, or keep one smaller warm lantern as the single warm accent. The cyan glints on the wave crests can stay.

### 3. Script typeface used as a standalone headline, in navy
- **Severity:** medium
- **Where:** new-09-375.jpg, "Six small switches" at the top (y ≈ 110 to 145).
- **Against DS v9:** The script is only ever a flourish paired with a heavy rounded-sans line: "tj-hosting.ca / Bring Your Ideas To Life" (home, inspiration), lab-04 "Motion, made of light / & glass." and "Made of / Many". It is always ink black (darkest strokes ≈ #010109 on tj, ≈ #000007 on lab-04). Here the script stands alone as the section heading, and its darkest strokes sample ≈ #082046, a navy-blue, not ink.
- **Fix:** Use the standard DS v9 heading instead: mono eyebrow (e.g. MORPHING ICONS) plus a heavy rounded-sans ink headline with one royal-blue word, e.g. "Six small **switches**". Or keep the script only as a second line under a heavy sans line, set in ink like the reference.

### 4. Flat line-art drawings instead of the glossy 3D render language
- **Severity:** medium
- **Where:**
  - new-08-1440.jpg: all six bento tiles (gauge, envelope, domain tag, padlock, bezier pen, calendar with heartbeat).
  - new-03-1440.jpg: the small flat server-stack glyphs beside "Starter", "Business", "Pro" (y ≈ 217).
- **Against DS v9:** Feature and plan cards on tj-hosting.ca carry glossy 3D renders on plinths, with blue gradients, specular highlights and cyan glow ("Five things", "Four ways to work with us", "Four steps"). Lab-04's sample cards and honeypot cards do the same. The new-08 drawings are on-palette but flat (2px outlines, flat fills), so the grid reads like a generic SaaS illustration kit. The padlock is the one tile with some gloss, so the six tiles are not even consistent with each other.
- **Fix:**
  - new-08: keep the SVG motion, but give each drawing the render cues:
    - royal-to-azure gradient fills instead of plain outlines
    - a white specular highlight at the top-left
    - a soft cyan glow under the moving part (needle, check, pen tip, heartbeat)
    - a small ellipse shadow or plinth under each drawing
    - all six tiles at the same depth as the padlock
  - new-03: swap the flat server glyphs for small versions of tj's own 3D server render.

### 5. Four different treatments for the "sample/illustrative" label chip
- **Severity:** low
- **Where:**
  - Rounded-sans text with a cyan dot on a white chip (the DS v9 style): new-03 "Sample prices in CAD · not real offers", new-04 "Layout: digits", new-09 "Demo toggles · …".
  - Mono caps on a white chip, no dot: new-08 "SAMPLE CONTENT · ILLUSTRATIVE".
  - Mono on a dark pill: new-11 "Illustrative · not a real network", new-06 "GFS 10 m wind · …".
  - Rounded-sans with no dot: new-01 "Sample UI · Lens: strong".
  - Mono label plus a bold sans value: new-02 "PATTERN Coral".
- **Against DS v9:** DS v9 has one chip: rounded sans with a cyan dot on a white chip ("Building since 2001", lab-04 "3 samples"). Mono caps are kept for eyebrows and small hints.
- **Fix:** Use the cyan-dot sans chip for every disclaimer or state label. On dark windows, use the same chip in navy glass with white text. Keep mono only for eyebrows and the bottom-right gesture hints.

### 6. Controls drawn inside the art drift from DS v9 control shapes
- **Severity:** low
- **Where:**
  - new-01-375.jpg: the "Studio / Gallery / Notes" capsule tab bar and round lens button (y ≈ 120 to 170).
  - new-06-1440.jpg: the "Dense" button in the panel (x ≈ 210 to 277, y ≈ 845).
  - new-11-375.jpg: the "Labels" button in the panel (x ≈ 100 to 170, y ≈ 727).
- **Against DS v9:**
  - DS v9's tab bar is a white rounded-rectangle bar (about 8–10px radius) whose active item is a solid royal fill with white text (top nav "Contact", "Lab", "Services"; lab-04 honeypot nav). new-01's fully round capsule with a white selected pill looks like another platform's UI kit.
  - The "Dense" and "Labels" on-states use royal text and a royal border, so two blue buttons sit side by side and the primary loses its weight. DS v9's selected-but-secondary state is ink text with a royal ring (tj Lab page segmented control).
- **Fix:**
  - new-01: draw the demo tab bar in the DS v9 nav shape, with a royal active fill and white text, and keep the lens effect over it.
  - new-06 and new-11: show the toggle-on state as ink text on white with a 2px royal ring, and optionally a small cyan dot, so only the primary is blue-filled.

### 7. The window frame bar comes in two colours
- **Severity:** low
- **Where:**
  - new-01-375.jpg and new-02-375.jpg: white bar (≈ #fefefe) above the art.
  - new-05, 06, 07, 11, 12: navy bar (≈ #141e37).
- **Against DS v9:** Lab-04 used one frame, a navy bar (≈ #151f3a) with three blue dots (samples_particle-field, humanity ch-5/6). Both colours are inside DS v9's palette, but a visitor moving between samples sees the frame change. new-01's art is mostly mid and dark blue, so tone does not explain its white bar.
- **Fix:** Use one rule and keep to it: navy bar on every windowed sample, or white only where the art is light (new-02). Move new-01 to the navy bar.

### 8. On phones, "← Back to the lab" jumps between inline and its own line
- **Severity:** low
- **Where:**
  - On its own right-aligned line, with a taller panel: new-01, new-02, new-11, new-12 (bottom of panel, y ≈ 766).
  - Inline with the buttons: new-04, new-05, new-09 (y ≈ 761), as in lab-04 samples_particle-field-375.
- **Against DS v9:** DS v9 and lab-04 keep a component's layout the same across pages. The wrapped link also adds about one line to the panel, so it covers more of the art. new-01 and new-05 both have five lines of body text, but new-01's panel top is at y ≈ 516 and new-05's at y ≈ 550.
- **Fix:** Pick one phone layout. Either shorten button labels so everything fits on one row ("Move lens", "Save PNG"), or always place the link on its own line in the same position on every sample.

### 9. The panel turns grey over dark windows
- **Severity:** low (inherited from lab-04)
- **Where:**
  - Over dark art the panel samples ≈ #dee3ee to #eaebf0: new-05, 06, 07, 11, 12.
  - Over light art it samples ≈ #f3f7fc: new-03, 08, 10.
  - Lab-04 particle-field showed the same grey (≈ #dddee2 / #e3e2e8).
- **Against DS v9:** tj's glass cards always read white-blue (≈ #f3f9fd), never grey.
- **Fix:** When the panel sits over a dark window, make its fill nearly opaque white-blue, with a target of about #eef4fc behind the text. Keep the blur for the edge only.

### 10. Coral pattern edges look soft, as if upscaled
- **Severity:** low
- **Where:** new-02-375.jpg, the whole art window, most visible at 2.5x zoom.
- **Against DS v9:** DS v9 surfaces are crisp and glossy. Here the blue ink has edges about 5–6px wide, so the art looks out of focus next to the sharp panel text.
- **Fix:** Draw the simulation at the device pixel ratio, or map concentration through a tighter ramp so the edge is 1–2px. Optionally add a faint white specular along the ink so it reads as glass ink.

### 11. Burst dots read as navy specks, some outside the card
- **Severity:** low
- **Where:** new-09-375.jpg:
  - in the gaps between the top-row tiles (x ≈ 245 to 260, y ≈ 277)
  - on the card's right edge (x ≈ 352 to 364, y ≈ 286 to 293)
  - one dot below the card on the page sky (x ≈ 325, y ≈ 537)
- **Against DS v9:** DS v9 particles are cyan/white light (story stars, the lab globe). On the light sky, navy dots outside the card read as dirt in a still frame.
- **Fix:** Clip the bursts to the card, or colour them cyan/white and fade them out before they pass the card edge.

### 12. Amber used as a second accent colour
- **Severity:** low
- **Where:** new-10-1440.jpg: the sun on the centre card's banner, the four price pills under the product tiles, the list ticks and the sun on the right-hand card (amber ≈ #feb446).
- **Against DS v9:** Warm colour appears once, as a small sun dot on the browser render. Here amber repeats about a dozen times, so it starts to read as a brand colour.
- **Fix:** Keep one small amber sun. Set the price pills and list ticks to azure/cyan.

## What reads well
- The shell is the lab-04 shell exactly, and it matches DS v9's sampled colours: top bar, "All samples" pill, bottom-left glass panel, mono eyebrow, heavy rounded-sans titles, royal primary and outlined secondary buttons, underlined back link, chevron.
- new-03 (glass pricing) could pass as a tj-hosting.ca page: white-blue glass cards, featured card with a blue ring and pill, royal check icons, the segmented Monthly/Yearly switch and big ink prices.
- new-11 (dotted globe) echoes the dotted WebGL globe on tj's Lab page and the navy story palette closely.
- new-04 (clock wall), new-10 (card flow) and new-08's layout use glass on sky with DS v9 rhythm and spacing, and the cyan-dot chip appears where it should (new-03, 04, 09).
- The dark pieces (new-05 star-trail type, new-06 wind map, new-11) sit in the same navy (#060a16 to #071230) as tj's story section and footer, so the night mode feels shared, not invented.
- Type is consistent throughout: rounded heavy sans for titles, mono for eyebrows and data labels, no stray typefaces apart from the script in finding 3.

## Key (added by the lead after the review)

The reviewer saw only the anonymous file names. The twelve were drawn at random (seed 20261028) from the 112 gated shots (56 samples × 1440 and 375) committed at the time, and re-shot fresh at 3 s after load: new-01 liquid-glass-lens (375), new-02 coral-ink (375), new-03 pricing-rolling-digits (1440), new-04 clock-wall (375), new-05 star-trail-text (375), new-06 wind-snapshot (1440), new-07 lantern-pond (1440), new-08 bento-grid (1440), new-09 icon-micro-set (375), new-10 glass-card-flow (1440), new-11 edge-network-globe (375), new-12 glass-sandbox (375). What was done with each finding is recorded in `TASKS-lab-05.md` (P5 review section).
