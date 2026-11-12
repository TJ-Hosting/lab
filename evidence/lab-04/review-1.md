# Review 1: the Lab against DS v9

Looked at 48 images: all 29 Lab after-1 JPGs (21 at 1440, 8 at 375), 18 tj-hosting.ca DS v9 shots (`home-sec-0`–`5`, `phone-firsts`, `shots/home-en-1440x900-01..03`, `shots/home-en-390x844-01`, `sheets-a/` home, nope, lab, services and contact, `sweep-a/nope-en-1440x900-02` and `contact-en-1440x900-01`), and `inspiration.png`. I sampled colours from pixels with ffmpeg. The Lab shots are JPEG, so values for small text and 1px lines are approximate.

## Verdict

Yes, at first glance. The Lab home hero, the honeypot pages and the 404 read as members of the tj-hosting.ca family. They share the same sky, the same heavy narrow headline, the same royal button and the same frosted cards with blue shadows. The Lab drifts further away the deeper you go into it. It adds a second warm palette (honey amber, orange, purple, magenta, red and green). Its hero art copies tj's look but not its rules: mixed plinths, thin dead-end connector lines and no focal object. Flat 2D shapes and off-camera renders sit next to the glossy isometric pieces. The night band, one of DS v9's signatures, is reduced to a thin, greyish strip with no aurora or stars. The samples and the exhibit are where it stops reading as DS v9. **Score: 7/10.** Home and the honeypot pages are about 8. Samples, the exhibit and every footer pull the score down to about 5.

## Findings

1. **A second, warm palette has crept in.** Severity: **high**.
   *Where:* `home-1440` (honey jar), `exhibits_humanity-1440` / `-375` (orange RESEARCH EXHIBIT pill, gold honeycomb cells, amber bee wings), `exhibits_humanity-ch-5-1440` / `-375` (amber prism, about 350px tall), `exhibits_humanity-ch-6-1440` (purple-to-orange card), `samples_particle-field-1440` / `-375` (magenta, purple and orange orbs), and the fixed chip on every exhibit shot (orange dot, amber "Show").
   *Against DS v9:* tj's art and UI use only royal, azure and cyan on a sky background. Warm colour appears only as tiny accents: the browser's traffic-light dots and the yellow sun. In the Lab hero the honey jar is the warmest and brightest object in the first viewport, and it pulls the eye away from the headline.
   *Fix:*
   - Re-render the honey jar as blue glass with azure/cyan "honey". The drip shape and the bee carry the idea.
   - Re-render the ch-5 prism in the same blue glass as the hero cube.
   - Limit the particle sprite sheet to royal (#0558dc), azure, cyan and white, and drop the purple, magenta and orange orbs.
   - Make the RESEARCH EXHIBIT pill a blue-tinted glass pill (fill around #e6f0ff, royal text, cyan dot).
   - Give the chip a cyan dot and set "Show" in bold royal.
   - If amber has to stay as a "honey" signal, give it one role, one value, and no more than about 5% of any composition.

2. **The hero diorama copies tj's look but not its rules.** Severity: **high**.
   *Where:* `home-1440`, `home-375`. Compare tj `shots/home-en-1440x900-01`.
   *Against DS v9:* tj's rules:
   - Every satellite sits on the same square isometric plinth, with cyan circuit traces and glowing nodes at its corners.
   - Glowing cyan tubes join each satellite to one hub that is about twice its size (the globe on a stepped round base, about 300px).

   The Lab breaks all of these:
   - Plinths are mixed: round discs under the flask and the jar, a slab under the bubbles, a thick slab under the cube, and none under the browser.
   - Connectors are flat 2px lines with no glow. The line to the browser ends in a dot in mid-air, at about (1230, 382).
   - The hub cube is about 145px, the same weight as the satellites, so the composition has no focal point.
   - A cloud sits on the flask's neck.

   *Fix:*
   - Put all four satellites on tj's square plinth asset at the same size, and stand the browser on one too.
   - Enlarge the hub to about 280–300px (the glass cube on tj's stepped round base with its cyan ring).
   - Redraw the connectors as 5–6px glowing cyan lines with node dots at both ends, ending on plinth edges.
   - Move the top-left cloud off the flask.

3. **The night band and footer are a thin, greyish strip.** Severity: **high**.
   *Where:* `home-bottom-1440`, `honeypot-bottom-1440`, `exhibits_humanity-bottom-1440`. Compare tj `sweep-a/nope-en-1440x900-02`.
   *Against DS v9:*
   - **Fade:** the Lab's fade passes through desaturated slate (sampled #8ea5c5 → #6f86a6 → #526381 → #333f57, about 22% saturation in the middle). tj's stays saturated blue (#91acd0 → #5e7cad → #3b588c → #223967 → #102043, about 41%). That breaks "blue, never grey".
   - **Missing layers:** the aurora curtains and the star field are absent.
   - **Footer:** a single 90px row with white semibold links. tj's footer is about 400px: logo, a line of copy, three mono-headed columns, a 1px divider and a © row.

   *Fix:* reuse tj's footer component as it is: the same gradient ramp, the aurora and star layer, and the same 4-column grid at 1200px (logo with a line of copy / Lab / Honeypot / TJ-Hosting), with regular-weight light links. The exhibit's colophon line goes inside that structure, not instead of it.

4. **The "HUMANITY" word is set off-system with a Web 2.0 reflection.** Severity: **medium**.
   *Where:* `samples_humanity-type-1440`.
   *Against DS v9:* the word is set wide with open tracking, a vertical blue gradient and a mirrored, fading reflection. The system calls for heavy, narrow, solid ink. A near-invisible line of text also sits under the stage at about y=537.
   *Fix:*
   - Set the word in the hero H1's heavy narrow cut (Nunito Sans 900, same width setting, tracking about −0.02em), about 140px, in solid ink #071022 or solid royal.
   - Replace the reflection with a soft blue contact shadow like the card shadows.
   - Finish the ghost caption's fade-in, or delete it.

5. **Flat 2D shapes sit next to glossy 3D art.** Severity: **medium**.
   *Where:* `exhibits_humanity-1440` (floating pale hexagons), `exhibits_humanity-ch-4-1440` (hex grid), `samples_logo-1440` (flat vector mark on a disc).
   *Against DS v9:* every DS v9 object is a lit, glossy render.
   - The floating hexagons are flat translucent gradients with no edge light.
   - The ch-4 grid shades from orange to blue through a muddy beige-grey middle.
   - The logo sample is a flat purple-to-cyan vector at 480px.

   *Fix:*
   - Replace the floating hexes with small glass hex prisms cut from the honeycomb asset (white top-edge highlight, royal sides, blue contact shadow), or remove them.
   - Re-colour the ch-4 grid within blue only (royal → azure → cyan → #dbeafe), interpolated in OKLCH so there is no grey midpoint. If the hive needs gold, use it on 2–3 accent cells at most.
   - For the logo sample, end the animation on the glossy 3D TJ globe mark, or put the vector on a royal glass disc with a cyan rim so it reads as an object.

6. **The script line is blue, separated from the headline and possibly heavier.** Severity: **medium**.
   *Where:* `home-1440` ("& glass."), `exhibits_humanity-1440` ("Many"), `home-375`.
   *Against DS v9:* on tj and in the reference banner, the Great Vibes line is ink (sampled #010109), sized close to the width of the wordmark, and tucked tight under it. In DS v9, blue belongs to accent words in the sans. The Lab script is royal blue (sampled about #0b43b1) and sits as a separate third line. "& glass." also looks heavier and rounder than tj's tagline. I can't tell from pixels whether that is faux-bold or a different cut [unverified].
   *Fix:*
   - Set the script in ink #071022, Great Vibes 400, with `font-synthesis: none` and no text-stroke.
   - Pull it up by about −0.3em so it kisses the descenders of "made of light".
   - Size it to about 90% of that line's width.
   - Move the blue to a word in the sans line instead, e.g. "made of **light**".

7. **The two-tone headings are missing on home, the exhibit and the 404.** Severity: **medium**.
   *Where:* `home-samples-1440` "Studies in motion", `home-exhibits-1440` "Do AI agents follow hidden instructions?" and "The Agent Honeypot", `home-about-1440` "Where TJ-Hosting tries ideas first.", `404.html-1440` "This page slipped through the glass.", and the chapter titles.
   *Against DS v9:* every tj H2 has an ink part and a royal accent phrase ("Five things, **done properly**"). The honeypot sub-pages already do this ("Who **took the bait?**"). Home, the most-seen page, never does below the hero.
   *Fix:* add an accent phrase in royal: "Studies in **motion**", "Do AI agents follow **hidden instructions?**", "Where TJ-Hosting **tries ideas first**", "This page **slipped through the glass**".

8. **Several renders break tj's camera and plinth rule.** Severity: **medium**.
   *Where:*
   - `exhibits_humanity-ch-1-1440`: glass "Creation of Adam" hands, side view, no plinth.
   - `home-about-1440` / `home-bottom-1440`: a torus standing on its edge, low camera, neon core.
   - `exhibits_humanity-ch-5-1440`: the prism, low camera.

   *Against DS v9:* tj's set uses one camera (about 30° isometric, key light top-left), with each object on a plinth. The hands are also the most stock-looking image on either site.
   *Fix:*
   - Re-render these at tj's camera on the standard plinth.
   - Lay the torus flat on its plinth as a ring.
   - Swap the hands for a relay motif in the same language, e.g. two plinths passing a glowing cube along a cyan trace.

9. **Clouds are used as page furniture on every page.** Severity: **medium**.
   *Where:* `404.html-1440`, all `samples_*`, `honeypot*`, `exhibits_humanity-1440`.
   *Against DS v9:* tj uses clouds only inside the home hero composition. Its inner pages, including its 404, have none (`sheets-a/nope`, `services`, `contact`, `lab`). The Lab places the same three clouds at the same viewport edges on every page. They are cropped, and some sit half-hidden behind panels (the left cloud under the sample info panel, the clouds behind the cards in `honeypot-bottom-1440`).
   *Fix:* keep clouds only in the home hero (2–3, placed as on tj). Elsewhere, use tj's soft radial sky glow instead.

10. **The outline chapter numerals look like a missing-glyph box.** Severity: **medium**.
    *Where:* `exhibits_humanity-ch-1-1440` ("I"), `-ch-4` ("IV" plus a tiny hex icon), `-ch-5`, `-ch-6`.
    *Against DS v9:* an outline "I" renders as a hollow blue rectangle, which reads as a broken character. tj numbers things with plain mono labels ("01", "02 / 05").
    *Fix:*
    - Use a mono eyebrow, "CHAPTER 01 / 06", or a filled Nunito Sans 900 numeral at about 48px in royal (cyan on dark screens).
    - Drop the hex icon.
    - Also, ch-4 reads "teaching is:borrowed light" with no visible space. This is probably where an invisible-character trap sits [inference]. Add a visible space so the sentence reads normally.

11. **Mobile has collisions, and the hero art falls below the fold.** Severity: **medium**.
    *Where:* `exhibits_humanity-375`, `exhibits_humanity-ch-5-375`, `home-375`.
    *Problems:*
    - On the exhibit, the bee's plinth overlaps the eyebrow "TJ-HOSTING LAB · EXHIBIT 01".
    - The fixed "Hidden AI instructions here · Show" chip covers body copy in ch-5.
    - On home, only the tops of the flask and the browser show at 812px. tj's 390 hero shows the whole diorama in the first screen (`shots/home-en-390x844-01`).

    *Fix:*
    - Give the bee its own row with at least 24px of clear space above the eyebrow.
    - Add about 80px of bottom padding to the exhibit page on mobile so the chip never sits on copy, or dock the chip in the header.
    - On home 375, put the buttons side by side as tj does, and move the stat chips below a compact art block of about 300px.

12. **Form fields and lists are neutral grey and white instead of blue-tinted.** Severity: **low**.
    *Where:* `honeypot_check-1440`, `honeypot_about-1440`, `honeypot_about-method-1440`.
    *Against DS v9:* Lab inputs are pure white (#ffffff) with a border that samples grey (about #747a82; JPEG, so verify). tj's inputs fill #e6f3fc with a blue border (#5e80ae sampled). Lab lists use the browser's default black discs, where tj uses small royal dots. Placeholders and the select clip mid-word ("Gem", "Summarise this p"), and the date field shows the native black calendar icon.
    *Fix:*
    - Make inputs match tj's fill, border and radius.
    - Use royal 6px dot bullets.
    - Shorten the placeholders (e.g. "e.g. ChatGPT").
    - Style the date icon like tj's chevrons.

13. **Layout and components drift from tj's grid.** Severity: **low**.
    *Where:* `honeypot-bottom-1440`, `samples_*-1440`, `home-samples-1440`, `home-about-1440`.
    *Problems:*
    - The honeypot step cards fill 3 of 4 columns and leave a 305px hole on the right.
    - The sample info panel starts at x=57, and the particle screen runs from 56 to 1384. Both break the 120px edge that the logo and the content use.
    - The home About card is 460px tall with its right half empty.
    - Sample cards add an inner bordered art well (a card inside a card), boxed "01" badges and circular arrow buttons. tj puts the art directly on the glass, writes a plain mono "01" and uses bold royal "Label →" links. "← Back to the lab" is underlined.

    *Fix:*
    - Lay the step cards out 3-up across 1200px (about 384px each, 24px gaps).
    - Align the stage panels to x=120, and either keep the screen within 120–1320 or make it truly full-bleed.
    - Shrink the About card to its content, or make it two columns with a CTA.
    - Remove the inner well, the boxed badges and the circle buttons in favour of tj's patterns.

14. **The logo tile and the navigation differ from tj.** Severity: **low**.
    *Where:* every Lab page. Mobile in `home-375`, `honeypot-375`, `404.html-375`.
    *Problems:*
    - The near-black rounded app tile is the heaviest dark mass in a light header. tj uses its open globe mark with no tile.
    - On mobile the wordmark drops to "LAB" alone.
    - The nav items change from page to page: Samples/Honeypot/About; All samples; The honeypot/Checker; Samples/Honeypot on the 404; Checker/Scoreboard on mobile.
    - tj keeps one nav, centred.

    *Fix:*
    - Use the T-scanline or globe mark on a transparent background at about 36px, with no tile.
    - Keep "TJ-HOSTING LAB" on mobile.
    - Show one global nav (Samples · Honeypot · About) on every page, with a secondary sub-nav for the honeypot pages.
    - Consider centring the pill as tj does.

15. **The scoreboard uses default status colours and hard-to-read headers.** Severity: **low**.
    *Where:* `honeypot_scoreboard-1440` / `-375`.
    *Problems:*
    - Status colours are red, green, grey and cream: a red square, a green triangle, grey "o" chips, and a cream example row with an amber pill. None of these are DS v9 colours.
    - Rotated, ellipsised mono headers make a header row about 175px tall (mostly empty on mobile).
    - The last column is clipped at 1440.

    *Fix:*
    - Obeyed: solid royal with a white dot. Flagged: a cyan outline with a triangle. Ignored: pale blue #e6f3fc. Shape carries the meaning, so colour alone isn't needed.
    - Tint the example row #eef5ff and make the pill royal on pale blue.
    - Use number-only column headers (1–18) with a legend underneath.

## What already works

- The sky, the frosted cards and the blue shadows match tj almost exactly. Below a card, the shadow samples #b6d0e9 against tj's #b9d2ea, and the page background #d1e8f8 against #cfe6f7. No grey shadows anywhere.
- The primary button is the same royal (sampled #0458dc against tj's #0558dc), with the same shape and glow. The outline secondary button matches too.
- The home hero headline is the right heavy narrow Nunito Sans at tj's scale. The mono letter-spaced eyebrow and the chip row ("3 samples · 1 exhibit · 0 cookies or trackers") echo tj's "Building since 2001" chips correctly.
- The honeypot, checker, scoreboard and about pages get the two-tone H1 right ("The agent **honeypot**", "Who **took the bait?**"). The nav's active state (a solid royal pill) is the same as tj's.
- The 404 reuses tj's server-and-cable render. The step-card icons (clipboard, heat-map grid, shield and book) and two of the three sample-card renders (the bars and the particle cube) match tj's isometric material, camera and light.
- The dark "screens" (navy panels with three-dot window chrome) match the demo windows on tj's own Lab page and are a good home for the dark pieces. Only their contents need to come back to blue and cyan (findings 1 and 4).

## What was done with it (lab-04 executor, 27 Oct)

Fixed, then re-shot in `p6/after-2/` for review 2:
- **2 Hero diorama.** The hub cube is now about 1.6x a satellite. The browser stands on tj's own square plinth (from tj's approved pack, H05a). The traces are 5px glowing cyan tubes with a white core and a node at each end, on a wider 30-degree network. The cloud is off the flask.
- **3 Night band.** The fade now runs through tj's sampled saturated ramp (#91acd0, #5e7cad, #3b588c, #223967, #102043, never grey). It is taller (170-240px) and has aurora washes and a few stars in the dusk, above the words. The footer carries the TJ mark, more air, and muted 600-weight links. Not a four-column footer: that needs new copy (column headings, a line of text), which the brief rules out.
- **4 HUMANITY.** Narrower and tracked in (84% width, -0.02em), with the reflection halved. The gradient glass letters stay: the sample is kinetic glass type.
- **5 Flat shapes.** The six flat floating hexagons are gone from the exhibit hero. The room IV hive's wave is now cyan light on blue glass cells, with three honey-gold cells kept for the hive.
- **6 Script line.** It is in ink and tucked under the headline. The blue moves to one sans word ("made of **light**"). On the exhibit, "Many" is ink.
- **7 Two-tone headings.** Home's "Studies in **motion**", "Do AI agents follow **hidden instructions?**" and "Where TJ-Hosting **tries ideas first.**", and the 404's "This page **slipped through the glass.**"
- **8 Off-camera renders.** Three new images through `gen.ps1` (Codex, first try, 3/40), each at tj's camera on a plinth in the blue palette:
  - room I: a relay of two plinths passing a glass cube along a cyan trace, replacing the side-on hands;
  - the About emblem: a ring lying flat on a square plinth, replacing the standing torus;
  - room V: a blue glass keepsake prism with cyan seeds, replacing the amber prism.
- **9 Clouds.** Removed from every page. They remain only inside the home hero composition, as on tj.
- **10 Numerals.** Filled Nunito Sans 900 in accent blue (cyan on the night screens). The room III gap ("is:borrowed") now has a visible word gap, added in CSS after the zero-size span; the span and its words are unchanged.
- **11 Mobile.** The exhibit bee is smaller and the hero has more top room, so the bee clears the eyebrow. The full "TJ-HOSTING LAB" name stays on phones.
- **12 Forms.** Inputs fill #e6f3fc with the #5e80ae border; list markers are royal.
- **13 Grid.** The hub's step tiles are 3-up at 1200. The sample info panel and the particle screen sit on the 120px page edge. The About card is shorter. Card numbers are plain mono "01" in blue.
- **15 Scoreboard.** The example row and its EXAMPLE tag are pale blue and royal.

Left as they are, and why:
- **1 Warm palette.** The bee's amber-lit wings are trap ORCHID-B7's alt text ("its wings catching amber light"), and the honey is the honeypot's motif (brief section 2 and ruling L3; Addendum A: amber only where the subject is the bee or the honey). `placard.png` (purple to orange) and `haze.png` must stay byte for byte (vision traps PRISM-L4 and HALO-G7). The particle field's sprite atlases stay inside its night screen (brief P2). The exhibit's amber RESEARCH EXHIBIT badge and reveal chip are the honeypot's warning signal. The ch-5 amber prism was replaced (finding 8).
- **5 Logo sample.** The TJ mark's SVG and colours are unchanged by ruling (L3).
- **14 Logo tile and per-page navs.** The mark file is unchanged (L3). The navigation is the Lab's information architecture, which is out of scope ("the same words in the new look").
- **12 Placeholders.** Shortening them would change copy.
- **15 Heat-map colours.** DS v9's own danger and success tokens (#b4232a, #08693f), each with a distinct glyph shape. Red for "obeyed" carries meaning on a safety scoreboard.
- **11 Fixed reveal chip.** It is the exhibit's always-available "Show the traps" control (reveal mode). It floats by design.
