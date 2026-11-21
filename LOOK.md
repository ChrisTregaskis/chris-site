# Look: Drawing office

A draft look for chris-site on the `look/drawing-office` branch. It's one of four alternative looks built to compare on localhost, each one moving the site away from the indigo/lilac palette that reads as AI-generated. It's a light theme: the site becomes a set of engineering drawings. It isn't meant to merge as-is. The copy, the sections and their order, and the work chapters' mechanics are all unchanged. Only the colours, type, line work, spacing details and a few layout proportions are different.

Method: the unslop passes (spacing, colour, icons, type, layout, details, visuals, motion; copy left alone by brief), from **unslop by Damir Sokolovsky (@heydamir)**, CC BY 4.0.

Run it: `pnpm dev --port 5182 --strictPort` in this worktree, then open `http://localhost:5182/`.

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

`theme-color` (index.html and showcase.html) is `#F2F4F4`, and its test is updated. `favicon.svg` is now paper on the red pen.

### 3. Icons

- There were no emoji to replace, and the existing icon sets are kept.
- Icons take a text role: the eval bench flask is ink (was amber) and the take-apart glyph is muted (was lilac).

### 4. Copy

- No words changed.
- `uppercase` was dropped from two labels (the drawer eyebrow and the phone menu's "Work"), so they show as written, in sentence case. The words are the same.

### 5. Type

**Families:**

- **IBM Plex Sans** (variable, weight axis) for everything that's read.
- **IBM Plex Mono** at 300/400/500 for numbers, labels and anything that counts. That covers:
  - the line above the hero headline
  - chapter numerals (light)
  - step numerals (light)
  - step kickers
  - chips and stacks
  - Inside-list numbers
  - piece tags and part balloons
  - picker numbers
  - nav menu numerals
  - the rail's count
  - traces
  - the Burpees count
  - the physio ring names

**Weights:** headings at 500 (were 600/700). The wordmark stays at 600. Body is 400. No 700–800 except the 11px field-error glyph.

**Sentence case** everywhere, and the eyebrow token's 0.06em tracking is now 0.

**Hero headline:** Plex Sans 500, capped at 80px (was Bricolage 600 at 84px).

### 6. Layout

- **Hero:** the headline's measure went from 15ch to 20ch. It now spans about three quarters of the first screen at 1440px, which closes most of the empty right-hand band the audit found. It's still left-aligned and still the same stacked structure.
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

**Drawer:** a white sheet. The eyebrow is in the mono, and the Close button is no longer round.

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

## Fonts added

| Package                              | Version | Files               |
| ------------------------------------ | ------- | ------------------- |
| `@fontsource-variable/ibm-plex-sans` | 5.3.0   | latin wght          |
| `@fontsource/ibm-plex-mono`          | 5.3.0   | latin 300, 400, 500 |

- **Preloads:** Plex Sans latin wght (45.7 kB) and Plex Mono 400 (14.7 kB), 60 kB in all. The old Bricolage and Figtree preloads were 97 kB. The preload test is updated for the new file stems.
- **Old packages:** Bricolage Grotesque and Figtree stay installed, because `scripts/og/og-card.html` loads them straight from `node_modules`.

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

## Verified

- **Gates:** `pnpm typecheck`, `pnpm lint`, `pnpm test` (72 files, 366 tests), `pnpm format:check` and `pnpm build` all exit 0.
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
- **Hero:** still all type, with no visual. Composed as a whole, but quiet. If it feels too plain, see suggestions.
- **Font metrics:** two layout estimates still assume the old fonts.
  - The physio label boxes in `geometry.ts` assume Figtree's average advance (0.58em). Plex Sans at 500 looked clear of every node and label at 1440 and 390, but the test is still measuring Figtree's estimate.
  - The figure's tag spacing assumes 0.6em per digit, which happens to be exactly Plex Mono's advance.
- **Raster icons and OG image:** not regenerated. `favicon.ico`, `apple-touch-icon.png` and `og-image.png` are still lilac, and so is the OG card template. Only `favicon.svg` changed, which modern browsers use.
- **Chat vehicle sketch:** the image is lilac (and its alt text says so). It's the brand widget's product image, so I left it.
- **Showcase:** compiles and builds on the new tokens but isn't restyled. One showcase sentence still says "routes lit in amber".
- **Charter:** `CLAUDE.md` still describes the Night chapters look (lilac, violet, amber). I didn't touch it on a draft branch.
- **Comments:** some code comments outside the files I touched may still name old colours. I fixed the ones I found by grepping for lilac, violet and amber.
- **Unused About mask:** `src/sections/about/blob.ts` and its test are left in place but unused in this look.
- **Lighthouse:** not run.

## Suggestions not built

- **Burpees count:** draw it as outlined, stroked numerals (like stencil lettering), with the strain thickening the outline. More drawing-office, lighter, but it touches the measured layout.
- **Hero weight:** try 450 instead of 500 (Plex Sans is variable). A touch more refined at 80px.
- **Iso grid:** a faint isometric grid only under the Wayfinder figure while it's taken apart, as the drawing's construction ground. Left out as decoration, but it's the one place a grid would mean something.
- **Icons:** regenerate the raster favicon, apple-touch icon and OG image in the red pen and paper.
- **Phone:** no separate phone layout was needed. The design shrinks as-is.
