# Look: Drawing office

A draft look for chris-site on the `look/drawing-office` branch. It's one of four alternative looks built to compare on localhost, each one moving the site away from the indigo/lilac palette that reads as AI-generated. It's a light theme: the site becomes a set of engineering drawings. It isn't meant to merge as-is. The copy, the sections and their order, and the work chapters' mechanics are all unchanged. Only the colours, type, line work, spacing details and a few layout proportions are different.

Method: the unslop passes (spacing, colour, icons, type, layout, details, visuals, motion; copy left alone by brief), from **unslop by Damir Sokolovsky (@heydamir)**, CC BY 4.0.

Run it: `pnpm dev --host --port 5182 --strictPort` in this worktree, then open `http://localhost:5182/`.

## Revision 2: Editorial's type and hero, merged in

Chris picked Drawing office as the front-runner and asked for parts of the Editorial look (branch `look/editorial`) to be brought in. In his words: he likes the diagrams on all the work projects, finds the page quite bright (but maybe refreshingly so), and asked for the font to be more like Editorial's and for Editorial's hero set-up, leaving the project diagrams and illustrations as they are.

What this revision changes:

- **Type.** Editorial's pairing replaces IBM Plex Sans. Newsreader (with its optical-size axis) sets the headlines and the ordering numbers; Instrument Sans sets everything read or pressed. IBM Plex Mono stays only where it belongs to the drawings and the signature. See Type below.
- **Hero.** Editorial's composition, in this look's palette: the headline across the full measure, a rule, then the byline on the left and the standfirst with the two actions on the right. See Layout below.
- **Raster icons and link preview.** `favicon.ico`, `apple-touch-icon.png` and `og-image.png` are regenerated in this look, with the same words as before, so nothing lilac shows in a browser tab or a link preview.
- **Brightness.** The live palette is unchanged. A softer paper is worked out and documented as an option (see Option: a softer paper), not applied.

What this revision leaves alone:

- **The diagrams and illustrations.** The Wayfinder figure, the physio rings, the Burpees set and the build lane's dimension line have no source changes in this revision: `WayfinderFigure.tsx`, `RingsFigure.tsx`, the Burpees count's type and `index.css`'s rail and lane rules are as they were. Their line work, colours, geometry and behaviour are identical. The one visible difference is a font family: the few labels inside the drawings that were set in the page's sans (the physio node labels such as "Visitor" and "Video storage", "Postgres", and the plate's "CDN", "secrets", "containers") follow the page's sans token, so they move from Plex Sans to Instrument Sans at the same size and weight. Everything in the drawings set in the mono (part balloons, piece tags, ring names) is unchanged. I tried moving those sans labels into the mono, which the brief allowed; at the phone's 17.5-unit label size the mono is about a fifth wider and "Video storage" ran into the ring's endpoint, so I put them back on the sans.
- **The words around the drawings** change face with the page, like all text: the build lane's "How it was built" heading and Eval bench heading (Newsreader), its stage names (Instrument Sans), and the Burpees calls (Newsreader, still in the red pen). The Burpees count itself stays in Plex Mono, in ink.
- The palette, the red pen, the signature and the chapter headings' structure.
- The chat mock's lilac vehicle sketch: changing it is a copy question for Chris.

## Direction

- **Product.** A senior full-stack TypeScript developer's portfolio that shows he builds whole products end to end, through three working case studies a visitor can take apart and run.
- **Character.** Precise, technical, quietly confident.
- **World.** A drawing office: cool drafting paper, graphite pencil and black ink line work, the checker's red pen for what matters, and a highlighter for what has been traced through.
- **Moments.** (1) The Wayfinder figure, redrawn as an ink isometric line drawing where only the part in focus takes the red pen, and a message's route is highlighted as it travels. (2) The physio rings as a plan drawing in pencil and ink: each step inks its ring over the pencil of earlier steps, and a journey is highlighted behind a red-pen pulse. (3) The Burpees count in huge ink mono numerals, with the app's call in red pen.
- **Signature.** The dimension line. Every "how far" on the page is drawn as one. The chapter rail (from 1280px) and the How it was built lane are thin pencil lines between oblique architectural ticks. The red pen draws over them as you read, with an arrowhead nib at the head of the lane, and ticks each stage off in red. Nothing else on the page uses it.

Why the dimension line, and not the other candidates:

- **Title block.** A title block per chapter would need new words (scale, drawn by, sheet), and the copy has to stay exactly as it is. It's also a box, and this look is meant to have fewer boxes.
- **Sheet numbering.** Each chapter already shows its number twice (the large numeral and the rail's "1/3"). Sheet numbering would only repeat them.
- **Callout style.** Callouts belong to the Wayfinder figure. The brief already asks for its numbered callouts to look like drawing balloons, so they can't also be a page-wide signature.

The dimension line only restyles two elements that already meant "how far" (in the dark look, "violet says how far"). It adds no new element and no new decoration.

**Drafting grid: left out.** A faint grid on the paper would be texture with no meaning. On a light page it also competes with the hairlines that now carry the structure, and unslop names decorative grids as a tell. The figures' own line work is the drawing.

## What changed, pass by pass

### 1. Spacing

- Arbitrary values I came across in the components I touched moved onto the 4px grid. Examples: hero gaps of 12–24 / 16–32 / 20–32, button padding 20×12, step card kicker and heading gaps of 8 and 12, contact gaps of 20 and 28, About grid gap 32 and photo top margin 32, chat frame top margin 16, build-lane title gaps of 4 and 8.
- The section spacing clamps now top out at 96px (were 90 and 100).
- **Not done:** a full spacing audit of components the look didn't otherwise touch. Many b3 values such as `py-[22px]` and `gap-[14px]` are still in place.

### 2. Colour

**Paper ramp** (cool, barely tinted, so it never reads as a colour on its own):

| Token   | Value     | Role                                                      |
| ------- | --------- | --------------------------------------------------------- |
| surface | `#F2F4F4` | the paper                                                 |
| panel   | `#E9EDED` | one step down                                             |
| raised  | `#DEE3E3` | two steps down                                            |
| sheet   | `#FFFFFF` | new: anything that floats over the paper (menus, drawers) |

**Line work and text** (three text roles in graphite):

| Token       | Value     | Role                               |
| ----------- | --------- | ---------------------------------- |
| line        | `#D5DBDB` | hairlines and rules                |
| line-strong | `#5A6468` | pencil: drawn edges                |
| line-hover  | `#858E92` | fainter pencil: edges stepped back |
| ink         | `#1A2023` | primary text                       |
| muted       | `#4A5357` | secondary text                     |
| dim-muted   | `#5C656A` | third role, for dimmed step cards  |

**Accent and status colours:**

- **accent:** the red pen, vermilion `#BF3A1E`. accent-strong is `#9E2A14`.
- **signal:** the same red pen. "What's happening now" no longer gets a second hue.
- **marker:** new, `#FFDE5E`, the checker's highlighter. It's used only over line work (multiplied, so the ink shows through) or behind ink text, never as a text colour.
- **danger:** `#B3261E`, the red pen on a form.

**Grounds and depth:**

- **Chapter tones:** all five are now the same paper. A chapter starts where a full-width hairline crosses the content (`.chapter-tone::after`), not on a new tint. The tone plumbing (the bar's tone, pinned stages' backing) is untouched and still works.
- **Shadows:** neutral and small, and only on things that float (menus, drawer, chat widget).
- **Drawer backdrop:** the scrim is ink at 40% with no blur (was 66% plus a 3px blur).
- **Nav menu:** the Work menu lost its glass treatment (`bg-surface/95` with `backdrop-blur-md`). It's now a white sheet with a hairline and a small shadow.

**Where the red pen appears** (the chrome stays graphite):

- the primary button
- "Get in touch" and Menu in the bar (an underline or text)
- the focus ring
- the step in focus (its numeral, its part in the figure, its pressed piece)
- the selected option in the part picker
- the Burpees call being made
- form errors
- the arrowhead and measured line of the dimension lines

**Re-checked dark-tuned values:**

- piece-tag halos (now paper)
- the bar fade and pinned-stage gradients (paper, within one neutral)
- the orbit band (line at 70%, was 45%)
- the private network wash (teal at 6%, was 8%)
- the Burpees ground shadow (ink at 28%, was 85%)
- the pulse's 25% halo (now a 1.5px ring)

`theme-color` (index.html and showcase.html) is `#F2F4F4`, and its test is updated. The mark (the CT ligature) is now paper on the red pen in every format: `favicon.svg`, and (revision 2) `favicon.ico` (16 and 32px PNGs in one ICO) and `apple-touch-icon.png` (180px, a full-bleed opaque tile, since iOS rounds the corners itself), both rendered from the same SVG in headless Chrome.

### 3. Icons

- There were no emoji to replace, and the existing icon sets are kept.
- Icons take a text role: the eval bench flask is ink (was amber) and the take-apart glyph is muted (was lilac).

### 4. Copy

- No words changed.
- `uppercase` was dropped from two labels (the drawer eyebrow and the phone menu's "Work"), so they show as written, in sentence case. The words are the same.

### 5. Type

Revision 2 replaced the first version's IBM Plex Sans with Editorial's pairing, read from its branch (tokens, `fonts.ts`, `fontPreload.ts`, Tailwind config, the components it touched, its LOOK.md) and brought over the same way.

**Families:**

- **Newsreader** (variable, with optical size and weight) for display type: the hero headline, chapter titles, step headings, the About and Contact headings, "How it was built" and Eval bench, drawer titles, the Burpees calls, and the ordering numbers. Headlines at 400, the big numerals at 300, with lining figures and kerning.
- **Instrument Sans** (variable, weight) for everything read or pressed: body, ledes, the byline, labels, kickers, chips and stacks, buttons, the wordmark (600), the nav, the picker's names, the build lane's stage names, the drawer eyebrow.
- **IBM Plex Mono** (400 and 500) only where it belongs to the drawings and the signature:
  - the Wayfinder figure's part balloons and piece tags
  - the physio rings' ring names
  - the Inside-list numbers ("2.1"), which are the readable twin of the figure's piece tags, so list and drawing show the same label in the same face
  - the demo and journey traces
  - the chapter rail's count (the dimension line)
  - the Burpees count, which is part of that chapter's illustration and stays as it was

**Numerals: Newsreader.** The chapter numerals, the step numerals (still in the red pen), the picker's and Work menu's numbers are set in Newsreader light, as Editorial sets them. Why not the mono:

- They are ordering numbers in the reading column, sitting directly over Newsreader headings. In the same face they read as part of the heading, the way a feature's chapter number does, which is the editorial feel Chris asked for.
- The mono is kept for numbers that annotate the drawings. The red step numeral over the step and the red balloon in the figure still match by colour, while each stays in its own register: heading against drawing.

**Sizes:** Editorial's display scale (hero up to 100px, chapter titles up to 62px, step headings 30px, ledes up to 21px, drawer titles up to 44px). The chapter numeral is 80–144px light, above the title.

**Weights:** headlines 400, numerals 300, body 400, labels 500, wordmark and stage names 600. Kerning is on and `text-rendering: optimizeLegibility` is set on the body, as Editorial does.

**Sentence case** everywhere. The eyebrow and caption tokens take Editorial's 0.01em.

### 6. Layout

- **Hero (revision 2, from Editorial):** the headline runs across the full measure (up to 100px, four lines at 1440 wide), which fills the empty right-hand band with type. A rule follows, then a 12-column row: the byline ("Chris Tregaskis, senior full-stack TypeScript developer") on the left over four columns, the standfirst and the two actions on the right over eight. The byline is still first in the source, so it is read first; the grid only places it under the rule. On a phone the same arrangement shrinks: headline, rule, byline, standfirst, actions. The palette is this look's: ink headline, a rule of ink at 20%, the red-pen primary button. The first version had widened the stacked headline to 20ch instead.
- **Chapter headings:** kept this look's structure (numeral above the title, overview and tags under it), not Editorial's hanging numeral. The column is wider (820px, was 660px) so the larger Newsreader titles keep to two lines.
- **About:** the photo is a plain rectangle (2px corners), cropped to the same framing as before.
- Nothing else moved. Grid proportions, stage pinning and step layouts are unchanged.

### 7. Details

**Radii:** 2–4px. Controls are 3px, cards and menus 4px. No pill buttons; pills remain only where they belong to someone else's design (the brand chat widget's suggestions) or are dots.

**Buttons:**

- **Primary:** red pen fill with white text. Hover goes to accent-strong.
- **Pressed** (Try it while the demo or a journey runs): inked in, graphite with white text.
- **Secondary (ghost):** ink text on a pencil underline that the red pen takes over on hover.

**Fewer boxes:**

- The form failure banner is a red-pen rule down its side (was a bordered, filled box).
- The part picker's list and the Work menu are white sheets with a hairline.
- **Chat widget:** it's already white, so on paper it gets a 15% ink hairline plus the float shadow, which reads as a window lying on the sheet. Its own internal radii stay at 12/16px because they're the brand widget's, not the site's.

**Drawer:** a white sheet. The eyebrow is plain sans in muted text, and the Close button is no longer round.

**Dimension lines** (the signature, see Direction):

- Each stage of the lane is an oblique tick on a 1px pencil line, which turns red once reached.
- The red line is 2px.
- The glowing spark and its gradient trail are replaced by a red arrowhead nib.

### 8. Visuals

**Wayfinder figure:**

- **Default:** ink edges in pencil graphite over whisper-light faces (white tops, two cool greys), so it reads as a line drawing while still hiding what's behind.
- **Plate:** near-white top.
- **Part in focus:** red-pen edges over the palest red wash. Its piece tags and balloon turn red.
- **Other parts:** step back towards the paper.
- **Prototype pieces** (drawn without edges when apart): drawn in tone a step deeper, so they still read.
- **Part numbers:** drawing balloons (circled mono numbers on a solid thin leader).
- **Seats:** dashed hidden lines.
- **Seating axes:** chain (centre) lines.
- **Pipes:** stay double-line conduits.
- **During the demo:** a message highlights its pipes and the tops of the parts it passes through, and its pulse is a red-pen dot in a thin ring.
- **AI platform cartridge:** the live one is inked solid black, as before.

**Physio rings:**

- A plan drawing: earlier steps in pencil, the step in view inked over in black.
- **Routes by line type:** requests in a heavy ink line, video in the practice's teal (now a teal ink, `#2E7A78`), secondary routes in pencil, the schedule's in dashes, the engineer's in chain lines, and the "way out that isn't there" in red-pen dots.
- **Picked out:** a detail picked from a step's list fills its nodes with the highlighter. The detail's own words get a highlighter band behind them, so list and drawing visibly match.
- **Journeys:** a highlighter band runs along the route behind a red-pen pulse. A wall that holds is marked in the red pen. The queue's tokens are highlighter (claimed), ink (done) and outline (queued).

**Burpees:** the count is in Plex Mono, in ink. The strain still thickens the strokes.

### 9. Motion

- **About:** the photo's morphing splash mask and its scroll drift are gone. Both were decorative scroll motion, the parallax unslop flags.
- **Build lane:** the spark's glow and trail are gone. The head keeps moving, as a nib.
- **Kept:**
  - the figure taking itself apart and back together
  - step selection
  - the rings drawing on
  - journeys
  - the Burpees count, strain and beat
  - the rail's scroll-driven fill
  - the chat's typing dots (they loop, but only while the scripted reply is "typing", which is live state)
- **Reduced motion:** still respected, and checked by screenshot at 1440: everything static, all rings drawn, the lane fully measured.

## Fonts

| Package                                                                    | Version | Files                                | Status                                    |
| -------------------------------------------------------------------------- | ------- | ------------------------------------ | ----------------------------------------- |
| `@fontsource-variable/newsreader`                                          | 5.3.0   | `opsz.css` (optical size and weight) | added in revision 2                       |
| `@fontsource-variable/instrument-sans`                                     | 5.3.0   | `wght.css`                           | added in revision 2                       |
| `@fontsource/ibm-plex-mono`                                                | 5.3.0   | latin 400, 500                       | kept (300 dropped)                        |
| `@fontsource-variable/ibm-plex-sans`                                       |         |                                      | removed in revision 2                     |
| `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/figtree` |         |                                      | removed: the OG card no longer loads them |

`fonts.ts`, `fontPreload.ts` and its test now name `newsreader-latin-opsz-normal` and `instrument-sans-latin-wght-normal`.

**Payload** (Latin files, as built):

|                                                                                       | Preloaded                   | Loaded with the drawings  | Total        |
| ------------------------------------------------------------------------------------- | --------------------------- | ------------------------- | ------------ |
| Original dark look (Bricolage + Figtree)                                              | 97.1 kB                     |                           | 97.1 kB      |
| Drawing office, first version (Plex Sans + Plex Mono 300/400/500)                     | 60.4 kB                     | 29.6 kB                   | 90.0 kB      |
| **Drawing office, revision 2** (Newsreader opsz + Instrument Sans; Plex Mono 400/500) | **162.1 kB** (132.0 + 30.1) | **29.6 kB** (14.7 + 14.9) | **191.7 kB** |

So the preloaded fonts are about 65 kB heavier than the original look (the same cost as Editorial's) and about 102 kB heavier than this look's first version. The mono isn't preloaded: it loads when the first drawing, trace or rail renders.

**Lighter option, not taken:** Newsreader's `wght.css` (58.1 kB, no optical sizes) would bring the preload to 88.2 kB, lighter than the original. Editorial compared the two and kept the optical sizes because the headlines read looser and greyer without them; I followed that. Worth a Lighthouse run (the charter records mobile at 100) before choosing.

## Contrast (WCAG, measured)

| Pair                                                 | Ratio                      |
| ---------------------------------------------------- | -------------------------- |
| ink on paper / panel / white                         | 14.9 / 14.0 / 16.5         |
| muted on paper / panel / white                       | 7.1 / 6.7 / 7.9            |
| dim-ink on raised                                    | 6.1                        |
| dim-muted on paper / panel / raised                  | 5.4 / 5.1 / 4.6            |
| accent (red pen) on paper / panel / white            | 4.95 / 4.6 / 5.5           |
| white on accent (primary button)                     | 5.5                        |
| accent-strong on paper                               | 6.8                        |
| danger / danger-ink on paper                         | 5.9 / 6.7                  |
| ink on the marker (highlighted detail text)          | 12.4, more on the 60% band |
| line-field (form underline) on paper / panel / white | 3.5 / 3.3 / 3.9            |
| line-strong (drawn edges) on paper                   | 5.5                        |
| line-hover (stepped-back edges) on paper             | 3.0                        |
| tenant teal on paper                                 | 4.6                        |

`tokens.test.ts` passes unchanged: text at AA on every tone, line-field at 3:1, the dimmed cards.

## Option: a softer paper (documented, not applied)

Chris is undecided whether the paper is too bright. The live palette is unchanged. This is one alternative step, a touch darker and less glary, for him to try. The paper drops from a luminance of 0.90 to 0.84 (about 7% less light off the page), and the floating sheets (menus, drawers) drop from pure white to 0.94. Hue stays the same cool, barely tinted grey.

| Token                                               | Live      | Softer option |
| --------------------------------------------------- | --------- | ------------- |
| surface, and every `tone-*`                         | `#F2F4F4` | `#EAEDEC`     |
| panel                                               | `#E9EDED` | `#E1E5E4`     |
| raised                                              | `#DEE3E3` | `#D6DBDA`     |
| sheet                                               | `#FFFFFF` | `#F7F8F7`     |
| line                                                | `#D5DBDB` | `#CED4D3`     |
| line-field                                          | `#7A8387` | `#747D81`     |
| line-hover                                          | `#858E92` | `#7E878B`     |
| dim-muted                                           | `#5C656A` | `#566065`     |
| `theme-color` (index.html, showcase.html, its test) | `#F2F4F4` | `#EAEDEC`     |

Everything else stays: ink, muted, dim-ink, the red pen, marker, danger, teal, and every figure token, so the diagrams are drawn exactly as now. Their white tops and near-white plate then sit a step brighter than the paper, which reads as a drawing on a slightly darker sheet.

Contrast re-checked under the option:

| Pair                                | Ratio           |
| ----------------------------------- | --------------- |
| ink on paper / panel                | 14.0 / 13.0     |
| muted on paper / panel              | 6.7 / 6.2       |
| dim-ink on raised                   | 5.6             |
| dim-muted on paper / panel / raised | 5.5 / 5.1 / 4.6 |
| accent (red pen) on paper / sheet   | 4.64 / 5.1      |
| white on accent                     | 5.5 (unchanged) |
| accent-strong on paper              | 6.4             |
| danger on paper                     | 5.6             |
| line-field on paper / panel / sheet | 3.6 / 3.3 / 4.0 |
| line-strong on paper                | 5.2             |
| line-hover on paper                 | 3.1             |
| tenant teal on paper (a graphic)    | 4.3             |

All of `tokens.test.ts`'s floors hold: text at 4.5:1 on every tone, dimmed text at 4.5:1 on panel, surface and raised, field edges at 3:1. One thing gets tighter: the red pen as text on panel is 4.3:1, but nothing sets red text on panel any more (the picker list and menus are on the sheet).

Previews, made by injecting these values as CSS over the running page (nothing in the repo changed): `7-softer-paper-option-hero.png` and `8-softer-paper-option-wayfinder.png` in the comparison screenshots folder. To apply it, change the eight token values in `src/ui/tokens/tokens.css` (and their contrast comments) and the theme colour in `index.html`, `showcase.html` and `src/test/indexHtml.test.ts`.

## Verified

- **Gates (revision 2, on the final tree):** `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (72 files, 366 tests) and `pnpm build` all exit 0. The build preloads `newsreader-latin-opsz-normal` and `instrument-sans-latin-wght-normal`.
- **Revision 2 screenshots (1440×900 and 390×844):** the hero, a lit Wayfinder part, a physio journey running, plus the chapter openers, the demo, the build lane mid-draw, the Burpees count, About, Contact, the Work menu, the phone menu and the CV drawer. The physio labels were checked at 320 and 390 for collisions after the font change.
- **Desktop and phone (1440×900, 390×844):** checked in headless Chrome. Covered:
  - hero
  - every chapter mid-scroll
  - a Wayfinder part apart, with a piece pressed
  - the picker open
  - the demo running
  - a physio journey running
  - the build lane mid-draw
  - Burpees mid-count
  - About and Contact
  - the Work menu and the phone menu
  - both drawers, including error states
- **Narrow widths:** no sideways scroll at 320 or 390.

## Unsure, or left undone

- **Postgres flash:** during a physio journey, Postgres flashes as a solid highlighter disc. It's the largest block of colour on the page for that beat, and may be too loud. Translucent wasn't an option, because the disc must hide what's under it.
- **Faint pencil:** stepped-back edges (another Wayfinder part in focus, earlier physio steps) sit at exactly 3.0:1. That's deliberate, since they recede, but it's the floor.
- **Font payload:** the preloaded fonts are 162 kB, about 65 kB more than the original look (see Fonts). Lighthouse not run.
- **Font metrics:** two layout estimates still assume older fonts.
  - The physio label boxes in `geometry.ts` assume Figtree's average advance (0.58em). The labels are now Instrument Sans, which is narrower than Plex Sans was; they were clear of every node and label at 320, 390 and 1440, but the test is still measuring Figtree's estimate.
  - The figure's tag spacing assumes 0.6em per digit, which happens to be exactly Plex Mono's advance.
- **Burpees count beside Newsreader:** the count stays in Plex Mono (it's the chapter's illustration, left as it was), now beside the calls in Newsreader. It holds up in the screenshots, but it's the one place a mono and the serif meet at display size.
- **Link-preview cache:** the regenerated card keeps the file name `og-image.png`. The OG README notes that the host and the link-preview services cache images for a long time, so if this look ships, give the card a new file name and update the `og:image` and `twitter:image` URLs (and the test that pins them).
- **Chat vehicle sketch:** the image is lilac (and its alt text says so). It's the brand widget's product image, so I left it.
- **Showcase:** compiles and builds on the new tokens but isn't restyled. One showcase sentence still says "routes lit in amber".
- **Charter:** `CLAUDE.md` still describes the Night chapters look (lilac, violet, amber). I didn't touch it on a draft branch.
- **Comments:** some code comments outside the files I touched may still name old colours. I fixed the ones I found by grepping for lilac, violet and amber.
- **Unused About mask:** `src/sections/about/blob.ts` and its test are left in place but unused in this look.
- **Lighthouse:** not run.

## Suggestions not built

- **Burpees count:** draw it as outlined, stroked numerals (like stencil lettering), with the strain thickening the outline. More drawing-office, lighter, but it touches the measured layout, and Chris asked for the illustrations to stay as they are.
- **Softer paper:** the option above, if the page is too bright.
- **Lighter Newsreader:** `wght.css` instead of `opsz.css` if the font weight matters more than the display cut (see Fonts).
- **Iso grid:** a faint isometric grid only under the Wayfinder figure while it's taken apart, as the drawing's construction ground. Left out as decoration, but it's the one place a grid would mean something.
- **Phone:** no separate phone layout was needed. The design shrinks as-is.
