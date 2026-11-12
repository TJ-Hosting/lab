# Review 2: the Lab against DS v9 (after round-1 fixes)

Looked at all 29 Lab after-2 JPGs (21 at 1440, 8 at 375). I compared them with the after-1 set and with the tj-hosting.ca DS v9 shots and banner from round 1. I did not reopen those this round and reused the round-1 colour samples for comparison. I read only the "What was done with it" section of review-1.md. Colours were sampled from pixels with ffmpeg; the Lab shots are JPEG, so values for 1px lines are approximate.

## Verdict

This is now clearly the same design system. All three high findings from round 1 are down to medium or resolved:

- **Footer:** the night-band fade now runs through saturated blue (sampled #5673a6 → #42629e → #274d88 → #152851, against round 1's grey #526381 → #333f57).
- **Hero:** it has a real hub and glowing cyan traces.
- **Colour:** the warm palette is reduced to the bee, the honey and the exhibit's warning signal.

The script line, the two-tone headings, the camera-consistent renders, the clouds, the forms and the grid now follow tj. What still sets the Lab apart is in the details:

- the browser hovering over an empty plinth in the hero
- the particle field's purple, magenta and orange screen
- flat hive cells that blend into olive
- the HUMANITY word
- a footer whose stars sit in a visible grid

**Score: 8/10** (round 1: 7). Home, the honeypot pages and the 404 are about 9. The samples are the weakest at about 6.

## Round-1 findings, rechecked

1. **Warm palette: improved.** `exhibits_humanity-ch-5-1440` now shows a blue prism. The honey jar (`home-1440`) and the bee wings stay amber under the Lab's own rule. Still orange: the particle orbs (`samples_particle-field-1440`), and the RESEARCH EXHIBIT badge and reveal chip (`exhibits_humanity-1440`). See remaining findings 2 and 6.
2. **Hero diorama: improved.** `home-1440`: the hub is larger, the traces glow cyan, and the cloud is off the flask. But the browser now floats above an empty plinth, and the plinths are still mixed (remaining finding 1).
3. **Night band and footer: improved.** `home-bottom-1440`, `honeypot-bottom-1440`, `exhibits_humanity-bottom-1440`: the ramp is now saturated blue, and there are aurora washes. The stars sit in a mechanical grid, the footer is still one row (left because it would need new copy), and the base is lighter than tj's (remaining finding 3).
4. **HUMANITY: improved slightly.** `samples_humanity-type-1440`: the word is tighter and the reflection lighter. It is still wide, gradient-filled and reflected. Its caption now exists but is almost invisible (remaining finding 5).
5. **Flat shapes: improved.** `exhibits_humanity-1440`: the floating hexes are gone. `exhibits_humanity-ch-4-1440`: the hive cells are blue now but still flat, and two of them turn olive (remaining finding 4). The logo sample is unchanged by rule.
6. **Script line: fixed.** `home-1440`, `exhibits_humanity-1440`: the script is ink and tucked under the headline, with "light" as the blue sans word. "Many" is ink.
7. **Two-tone headings: fixed.** `home-samples-1440`, `home-exhibits-1440`, `home-about-1440`, `404.html-1440`.
8. **Off-camera renders: fixed.** The relay of plinths in `-ch-1-1440`, the ring on a square plinth in `home-about-1440` and the blue prism in `-ch-5-1440` are all at tj's camera, on plinths.
9. **Clouds: fixed.** They now appear only in the home hero. `404.html-1440`, all `samples_*` and `honeypot*` are clear.
10. **Numerals: improved.** `-ch-1-1440`, `-ch-4-1440`: they are filled now, with no tofu box, and "is: borrowed" now has its space. But a lone "I" reads as a blue bar, and the hex icon by "IV" is still there (remaining finding 8).
11. **Mobile: improved.** `exhibits_humanity-375`: the bee clears the eyebrow, and the full wordmark shows on phones. `home-375`: the hero art is still below the fold (remaining finding 7).
12. **Forms: fixed.** `honeypot_check-1440`: the input fill samples #e4f2fc, and the bullets are royal. The clipped placeholders remain (remaining finding 10).
13. **Grid: improved.** The cards are 3-up at 1200 (`honeypot-bottom-1440`), the stage panels sit on the 120px edge, the About card is shorter, and the numbers are plain mono. The inner art well and the circle-arrow buttons remain (remaining finding 10).
14. **Logo tile and navigation: not fixed, by rule.** The mark is unchanged (L3), and the navigation is out of scope. The full "TJ-HOSTING LAB" now shows on phones (`home-375`).
15. **Scoreboard: improved.** `honeypot_scoreboard-1440`: the example row and its tag are blue. Red and green are kept as status tokens. The rotated, clipped headers remain (remaining finding 9).

## New or remaining findings

1. **The browser floats over an empty plinth, and the plinths are mixed.** Severity: **medium**.
   *Where:* `home-1440`, `home-375`.
   *Problem:* the browser's lower edge sits about 30px above a separate plinth. That plinth's top face is empty except for a cyan trace, so the browser and the plinth read as two unrelated objects. In tj's hero, the browser stands on its plinth. The flask and the jar also still sit on round discs while the cube, bubbles and browser sit on square slabs. tj uses one plinth type per composition.
   *Fix:*
   - Seat the browser on the back half of the plinth's top face: move it down about 30px, overlap the plinth by about 10px and add a blue contact shadow. Or use tj's browser-and-plinth render as one piece.
   - Put the flask and the jar on the same square plinth as the other three, keeping their scale.

2. **The particle field is still the most off-system screen.** Severity: **medium**.
   *Where:* `samples_particle-field-1440`, `-375`.
   *Problem:* purple, magenta and orange glass orbs and stars fill a whole screen. Nothing else in DS v9 looks like this. The brief rule P2 (as quoted) keeps the sprite atlases; it isn't one of the fixed rules you gave me.
   *Fix:* keep the atlas files, but at draw time map each sprite into the royal–azure–cyan–white range, or draw only the blue, cyan and white frames. If the rule forbids that too, at least drop the large purple and orange orbs, which are about 20 of the biggest sprites and carry most of the off-palette weight.

3. **The footer has grid-patterned stars, a single row and a lighter base.** Severity: **medium**.
   *Where:* `home-bottom-1440`, `honeypot-bottom-1440`, `exhibits_humanity-bottom-1440`.
   *Problem:*
   - The new stars are 1–2px dots in two horizontal rows, exactly 210px apart (around y=717 and y=733), so they read as a tiled pattern or as compression specks. tj's stars are scattered at random sizes.
   - The aurora is a horizontal haze rather than tj's vertical curtains.
   - The base samples #0c1b3c, against tj's #070c19.
   - The footer is still one thin row.

   *Fix:*
   - Scatter 40–60 stars across the whole dark area at 1–3px and 30–90% opacity, with no rows.
   - Add faint vertical streaks to the aurora washes.
   - End the ramp at #070c19.
   - Within the no-new-copy rule, build columns from strings that already exist: the nav words as column heads ("Samples", "Honeypot") over existing page titles ("Humanity, in motion", "Particle field", "The mark, assembling"; "Checker", "Scoreboard", "About"), with the current line and links in a bottom row above a 1px divider.

4. **The hive cells are flat and turn olive.** Severity: **medium**.
   *Where:* `exhibits_humanity-ch-4-1440`.
   *Problem:* where the cyan wave crosses a gold cell, the two blend into sage or olive (sampled #98cdb9 and #b2cba3), which breaks "blue, never grey". The cells are also still flat gradient hexagons with no glass edge. Next to the 3D honeycomb in the hero they look like a CSS placeholder.
   *Fix:*
   - Leave the three gold cells out of the wave, or have the wave raise each cell's own lightness rather than tint it cyan.
   - Give every cell a 1px white top-edge highlight, a darker royal lower edge and a blue contact shadow, so they read as glass tiles.

5. **The HUMANITY word still reads as Web 2.0, and its caption is invisible.** Severity: **medium**.
   *Where:* `samples_humanity-type-1440`.
   *Problem:* the letters are still wide, filled with a vertical gradient and mirrored below. They don't read as glass (no edge, no transparency), and nothing else in DS v9 uses a reflection. The caption "EIGHT LETTERS" samples #c3d2e0 on #d6e8f6, about 1.2:1.
   *Fix:*
   - Remove the reflection and use a blue contact shadow under the word instead.
   - Narrow the letters further, to the hero H1's width.
   - If the letters are meant as glass, add a 1–2px white top-edge highlight and a slightly transparent fill. Otherwise use solid royal.
   - Set the caption as a normal mono eyebrow (around #4b5975), or remove it.

6. **The exhibit's warning orange falls outside the Lab's own amber allowance.** Severity: **low**.
   *Where:* `exhibits_humanity-1440`, `-375`, and the chip on every exhibit shot.
   *Problem:* the round-1 notes quote Addendum A as "amber only where the subject is the bee or the honey". The RESEARCH EXHIBIT badge (an orange-to-amber gradient) and the chip's orange dot are neither, and they add a second orange next to the honey.
   *Fix:* if the warning has to be warm, use the honey's single amber value as a flat fill for the badge and the dot, and set "Show" in royal. Otherwise use royal on #e6f0ff with a cyan dot.

7. **Mobile: the hero art is below the fold and the chip covers text.** Severity: **low**.
   *Where:* `home-375`, `exhibits_humanity-ch-5-375`.
   *Problem:* at 812px only the tops of the flask, cube and browser show. tj's 390 hero shows the whole diorama. The stacked buttons are different widths (220 and 182px). The 245px-wide floating chip covers about two lines of body copy.
   *Fix:*
   - At 375, put the buttons side by side, or make both full width.
   - Move the stat chips below a compact art block of about 280px, placed straight after the buttons.
   - Under 480px, shrink the chip to the dot plus "Show", about 90px wide, against the right edge.

8. **A lone "I" numeral reads as a bar.** Severity: **low**.
   *Where:* `exhibits_humanity-ch-1-1440`.
   *Problem:* a single filled "I" in Nunito Sans 900 is just a blue rectangle. "IV" still carries a small outline hex icon that nothing else uses.
   *Fix:* set the numerals as a small counter, e.g. "I / VI" in the mono eyebrow style above the heading (numerals only, no new words), and drop the hex icon.

9. **The scoreboard headers are rotated, clipped and tall.** Severity: **low**.
   *Where:* `honeypot_scoreboard-1440`, `-375`.
   *Problem:* the rotated headers are cut off with ellipses and leave a header about 175px tall that is mostly empty at 375. Column 16 is cut off and 17–18 are hidden at 1440.
   *Fix:* use number-only headers (1–18) at about 40px tall, and show the technique names in the existing hover or focus label and in the method table. Let the table fit 1200px at desktop.

10. **Small leftovers.** Severity: **low**.
    - `samples_particle-field-1440`: the hint pill "Move or touch to gather the light" runs about 47px past the screen's right edge. Pin it inside, at 24px from 1320.
    - `honeypot_check-1440`: the placeholders and the prompt select still clip ("Gem", "Summarise this p"). Fix the layout instead of the copy: Agent 2fr, Model 1.5fr, Surface 1fr, Prompt 2fr, Date 1.2fr. Restyle the native calendar icon in royal.
    - `home-samples-1440`: sample cards still have a bordered art well inside the card and circle-arrow buttons. tj puts the art directly on the glass and uses bold royal "Label →" links built from existing words such as the card title.
    - `samples_logo-1440`: the mark is fixed by rule, but its stage is a plain pale disc. A royal glass disc with a cyan rim and a blue contact shadow would make it read as a DS v9 object without touching the mark.

## What was done with it (lab-04 executor, 27 Oct; the last of the two review rounds)

Fixed after review 2 (checked in headless shots, not re-reviewed):
- **Browser over an empty plinth.** The browser now sits down on tj's square plinth; it bobs a few pixels above it, as the other objects do.
- **Particle field colours.** The atlas files are unchanged (brief P2). At draw time they take DS v8's night photo filter (tj-hosting.ca's `[data-night] --photo-filter`), so the sparks read royal, azure, cyan and white. A browser without canvas filters draws them as before.
- **Footer stars and base.** The stars come from three tiles of unrelated sizes, so no grid shows. Three tall, narrow aurora curtains sit in the dusk, and the base reaches #070c19 just under the fade.
- **Hive.** The cyan wave no longer passes over the three gold cells (they read olive).
- **Particle hint pill.** Now inside the screen's edge.

Left, and why:
- **Mixed plinths** (round under the flask and the honey jar). They are the pack renders' own pedestals; new renders would be needed. Candidate follow-up.
- **Footer columns** built from existing strings. It would restructure every footer for little gain; the night band itself now reads as DS v9's.
- **HUMANITY's gradient and reflection.** The sample is glass type, and the reflection is half what it was. The "EIGHT LETTERS" caption was caught mid-fade; it is one step of the animation, not a resting state.
- **The exhibit's amber badge and chip.** They are the honeypot's own colour (honey), used only on the exhibit's warning and reveal controls.
- **Mobile hero art below the fold; the floating reveal chip; the lone "I" numeral; the rotated scoreboard headers; placeholders; the card wells; the logo disc.** These are layout or information-architecture changes beyond a re-skin, copy changes, or the unchanged TJ mark. Candidate follow-ups.
