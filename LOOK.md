# Look: Drawing office

A draft look for chris-site on the `look/drawing-office` branch. It's one of four alternative looks built to compare on localhost, each one moving the site away from the indigo/lilac palette that reads as AI-generated. It's a light theme: the site becomes a set of engineering drawings. It isn't meant to merge as-is. The copy, the sections and their order, and the work chapters' mechanics are all unchanged. Only the colours, type, line work, spacing details and a few layout proportions are different.

Method: the unslop passes (spacing, colour, icons, type, layout, details, visuals, motion; copy left alone by brief), from **unslop by Damir Sokolovsky (@heydamir)**, CC BY 4.0.

Run it: `pnpm dev --host --port 5182 --strictPort` in this worktree, then open `http://localhost:5182/`.

## Round 4: the surface, as Chris chose it

Chris reviewed the background experiments (below) and chose a direction. This branch, `look/drawing-office-surface`, is now the main line for the Drawing office look: round 3's five fixes are under it. Run it with `pnpm dev --host --port 5185 --strictPort`.

What he asked for, and what changed:

1. **Keep the dev panel.** It's now a general dev-only tool that any experiment can add switches to (see The dev panel, below). It's still compiled out of the production build.
2. **The mesh at the two ends of the page, in pencil, following the pointer.** In his words: "keep it on the header and then the About/Contacts bit at the bottom … As you scroll down, away from the header, it sort of fades out … At the bottom as you get to the About, it sort of fades back in … I like the pencilled version. Pencil lines along with the pointer."
3. **The Burpees count back in ink.** It keeps Newsreader light (round 3), now in ink instead of the red pen.
4. **The drawers' sheet as a dev-panel option**, default off: plain, or a very faint, still pencil mesh.

### The mesh at the ends of the page

**Where it lies.** The fade is spatial, not animated: it's where the mesh is on the page, not when it appears. It's measured from the sections' real positions (`reach.ts`, re-measured whenever the page's layout changes), so it holds at every width. The hero's own height, about a screen, is the unit:

- **Hero:** full strength from the top of the page to three fifths of the way down the hero (the headline).
- **Fading out:** it then falls off on a smoothstep, under the rule, the standfirst and the actions, and is gone a sixth of a hero into Wayfinder, before the chapter's numeral. At Wayfinder's top hairline it's already under a quarter strength.
- **The case studies:** absent all the way through Wayfinder, physio and Burpees. The canvas is cleared once and does no work at all there: no drawing, no measuring.
- **Fading in:** it starts at About's top edge, so the Burpees chapter never carries any. It rises to full three fifths of a hero further down, or by Contact if About is shorter.
- **About to the end:** full strength through Contact and the footer.

| Width    | Full in the hero to | Gone by                       | Starts again at       | Full from |
| -------- | ------------------- | ----------------------------- | --------------------- | --------- |
| 1440×900 | 567px               | 1033px (Wayfinder starts 900) | 18065px (About's top) | 18564px   |
| 390×844  | 534px               | 968px (Wayfinder starts 844)  | 17892px               | 18358px   |

The fade runs pixel by pixel, not facet by facet: the reach is a vertical gradient in every fill and every stroke (`paintMesh.ts`). Tests pin that it never steps by more than a smoothstep's steepest slope per pixel, that each fade runs over at least two fifths of a screen, and that it's absent from Wayfinder's numeral to About's top, at 1440, 390, 320 and 2560 wide (`reach.test.ts`).

**Pencil lines and the pointer.** These are the defaults now:

- **Lines.** A pencil line runs along every facet edge.
- **The dent.** The facets press in under the mouse, as before.
- **Fallbacks.** On touch screens and under reduced motion, the mesh holds still.
- **Phones.** Phones get 0.85 of the strength (it was 0.6), so the net is just visible there.
- **The dev panel's options.** Off, Static, no lines and Whole page are still there for comparing.

**Line strength and contrast.** Lines are allowed to cross the hero and About and Contact text, but every text role must still read at 4.5:1 where a line passes under it. The result: **pencil alpha 0.024**, ink over the paper, about 5 sRGB levels darker than the paper on its own.

- **Lines never darken each other.** Every edge of the net is drawn once, and all the lines at one strength are stroked as a single path. So where lines meet at a vertex, or two facets share an edge, they don't stack up. Before this change they did: a vertex could be six times as dark as a line.
- **The worst case is a line over the darkest facet.** A facet darkens the paper by at most 1.5 levels (the round 1 ceiling). Add a line, and the canvas's 8-bit alpha and gradient dithering (measured at up to a level and a half of alpha more than asked for), and the darkest the paper gets under the mesh is about 7.6 levels below the plain paper.
- **The tightest pair is the red pen, on About's paper.** About's paper is the deepest the mesh reaches at full strength, and the red pen as text on it was already 4.85:1 before any mesh.

Measured in Chrome from the canvas's own pixels, composited over each zone's paper, at device pixel ratio 2, worst pixel in view:

| Where                        | Red pen (accent) | dim-muted | muted | ink   |
| ---------------------------- | ---------------- | --------- | ----- | ----- |
| Hero, 1440 (static and dent) | 4.63             | 5.04      | 6.66  | 13.94 |
| About, 1440, dent pressed    | 4.53             | 4.94      | 6.53  | 13.65 |
| Hero, 390                    | 4.67             | 5.08      | 6.72  | 14.06 |
| About, 390                   | 4.57             | 4.98      | 6.58  | 13.77 |

What the tests pin:

- **The model, all the way down.** `tones.test.ts` sweeps the real page every 4px at four widths. At each point it takes the tone plate's colour, the reach, the strength, the darkest facet and a line with the quantisation margin, and requires ink, muted, dim-muted, the red pen and danger to stay at 4.5:1 or above.
- **The pencil is as strong as AA allows.** It also checks the tightest point is under 4.6:1. Stronger lines push the red pen on About's paper below 4.5 (0.028 measured 4.49 in Chrome), so this is the most faithful strength that keeps AA. No glyph-box thinning was needed.
- **Little or no red text in these zones anyway.** The hero and Contact's red buttons are opaque, and the mesh doesn't show through them.
- **One graphic that drops.** The text links' underlines (line-hover, 3.0:1) lose a little where a line crosses them: they're a link's decoration, not its text.

By eye, at 1440 and 390, the net reads as a faint pencil survey over the hero and the close. It's clearly there but never in the way, and the fade into Wayfinder and back at About shows no edge (`final2/desktop-1-hero.png`, `desktop-2-fade-into-wayfinder.png`, `desktop-3-fade-back-in-at-about.png`, `desktop-4-contact.png` and the `phone-*` equivalents).

**Over the tones.** The hero and the close sit on the plain paper; About sits on its own paper, a touch bluer and deeper. The mesh is the same ink on both, so it reads as the same drawing. Its fills use one paper level (between the plain paper and Burpees's, as before), so a facet's step is within a fraction of a level on either.

### The Burpees count in ink

`countType.ts`: `text-accent` becomes `text-ink`. Same face, size, figures and strain, so nothing moves.

- **Contrast:** ink on the Burpees paper is 13.76:1, against 4.57:1 for the red pen.
- **The red pen stays with the call being made** ("Halfway"), which now stands alone in red.
- **Layout:** stable, as before (only the colour changed).

### The drawers' sheet (dev panel only, default plain)

The panel's "Drawer sheet" option, or `?drawer=mesh`, sets both the Get in touch and the Request my CV drawers on paper instead of white, with a very faint, still pencil mesh behind the form:

- **Still.** No pointer: people are typing there.
- **Strength.** Three quarters of the page's: lines at about 0.018 alpha, about 4 levels.
- **Gathered at the foot.** Nothing over the drawer's top third, rising to full at its bottom, where the sheet is empty below the form on a laptop.
- **Quiet round the form.** Nothing under or within 6px of a field, the submit button, the close button, the error messages or the failure alert, coming back over 40px. Fields, errors and the alert sit on bare paper.

Contrast and checks:

- **Field edges:** `line-field` on the paper is 3.51:1 (3.9 on the white sheet), above 3:1. The mesh never runs under a field.
- **The error state:** error text (danger-ink) is 6.72:1 on the paper. Errors and the alert are kept clear of the mesh, and the screenshot with all three field errors showing reads cleanly.
- **How it's drawn:** in the drawer's own stacking context, at `z-index: -1` behind the form, as tall as the drawer's content even when it scrolls (checked at 320×640). It redraws only when the drawer's content changes size: it opens, errors appear, the window resizes.
- **Wiring:** a new `surface` slot on the `Drawer` organism. `App.tsx` passes `<DrawerSurface />` to both drawers, and it renders nothing when the sheet is plain.

### The dev panel

The panel is now its own feature, `src/features/dev-panel/`, and it's general. "Dev panel" sits at the bottom right under `pnpm dev`, with a group per experiment. Today that's Surface: Chapter tones, Mesh, Pencil lines, Mesh reach, Drawer sheet.

**URL parameters.** Every control is a URL parameter, written back on each change: `?tones=1&mesh=pointer&lines=1&reach=ends&drawer=plain`.

- `reach` takes `ends` or `page`.
- `drawer` takes `plain` or `mesh`.
- Flags take `1`/`0` (or `on`/`off`).
- Anything missing or unreadable falls back to the default.

**Adding a toggle for a future experiment.** Define its settings once, next to the experiment:

```ts
import { defineDevSettings, useDevSettings } from "@/features/dev-panel";

type Trial = { shade: boolean; size: "small" | "large" };

export const trialSettings = defineDevSettings<Trial>(
  { shade: false, size: "small" }, // what production uses
  import.meta.env.DEV
    ? {
        title: "Trial",
        controls: [
          { kind: "flag", key: "shade", label: "Shade" },
          {
            kind: "choice",
            key: "size",
            label: "Size",
            options: [
              { value: "small", label: "Small" },
              { value: "large", label: "Large" },
            ],
          },
        ],
      }
    : null,
);

// In a component: const { shade, size } = useDevSettings(trialSettings);
```

How it fits together:

- **Types.** A boolean gets a checkbox; a string union gets radio buttons. The control list is type-checked against the settings' keys.
- **Optional extras.** `inactive(key, values)` greys a control out. `useNote(values)` adds a live line under the group, which is how Surface says "Pointer holds still here".
- **Keys.** The parameter names are the keys, so keep them unique across experiments.
- **Keeping labels out of production.** Pass the group inside an `import.meta.env.DEV` branch, as above, so the labels never reach the build.
- **Production.** The panel itself is mounted by `<DevPanelSlot />` in `App.tsx`, which is null outside dev, and a production build reads no URL parameters, so it only ever uses the defaults.

### Production defaults now

| Setting  | Default     | What the visitor gets                                                                |
| -------- | ----------- | ------------------------------------------------------------------------------------ |
| `tones`  | `true`      | Each chapter on its own paper.                                                       |
| `mesh`   | `"pointer"` | Faceted pencil mesh that presses in under a mouse; still on touch or reduced motion. |
| `lines`  | `true`      | The pencil net.                                                                      |
| `reach`  | `"ends"`    | The hero, and About through Contact; nothing over the case studies.                  |
| `drawer` | `"plain"`   | The drawers as they were.                                                            |

**Loading.** The mesh's code is a lazy chunk, fetched 400ms after the page's load event once the browser is idle, the way the Burpees set is (that's what holds Lighthouse mobile at 100). The canvas then eases in over 550ms the first time, so it never pops; under reduced motion it just appears.

**Bundle,** against round 3 (`0aeef39`):

- Main JS: +2.0 kB (+0.83 kB gzipped).
- CSS: +1.4 kB (+0.32 kB gzipped).
- After load: `MeshCanvas` (2.1 kB gzipped) plus the shared `paintMesh` chunk (2.8 kB gzipped).
- `DrawerMesh` (1.0 kB gzipped) only with the drawer option on.

**Performance.** Headless Chrome, 1440×900, software raster, so a worst case. No mode had a frame over 20ms.

| Check                                                                    | Main-thread tasks per frame | Frames over 20ms |
| ------------------------------------------------------------------------ | --------------------------- | ---------------- |
| Pointer circling the hero for 6s, mesh off                               | 0.79ms                      | 0 of 360         |
| Pointer circling the hero for 6s, defaults (pencil and dent)             | 1.94ms (+1.15)              | 0 of 360         |
| Pointer circling the hero for 6s, static pencil (nothing redraws)        | 0.67ms                      | 0 of 359         |
| Whole page scrolled (764 frames), mesh off / defaults / whole-page reach | 2.11 / 2.05 / 2.56ms        | 0 / 0 / 0        |

At its ends, the mesh costs nothing measurable while you scroll the page. The middle of the page draws nothing.

### My verdict now

In round 1 I said the mesh didn't earn its place. Chris's version answers most of that:

- **Text and diagrams.** Confined to the hero and the close, it never sits under a diagram or competes with the case studies' interactions.
- **Room to read.** It's held at the strength AA allows, so it can be clearly visible rather than a sheen.
- **Meaning.** In pencil it reads as a survey net: the drawing office's own mark, framing the work at either end.

It's still texture with no meaning of its own, and the dent is a delight rather than information. But it's now quiet where the work is and present where the page is just words, which is the right way round. I'd ship it as configured.

### Verified (round 4)

- **Gates.** `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (85 files, 462 tests) and `pnpm build` all exit 0.
- **Dev panel absent from `dist/`.** `grep -rlF` finds 0 files for each of `Dev panel`, `data-dev-panel`, `DevPanel`, `Chapter tones`, `Pencil lines`, `Mesh reach`, `Drawer sheet`, `Hero and About to Contact`, `holds still here`, `replaceState`, `tones=` and `drawer=mesh`.
- **No sideways overflow.** At 320 and 390, with the defaults, mesh off, whole-page reach and the drawer mesh, `scrollWidth − clientWidth` is 0 down the whole page, and the page is no taller with the mesh. The drawer mesh at 320×640 is as tall as the drawer's scrolling content, with no sideways scroll.
- **Screenshots** at 1440×900 and 390×844 are in the session scratchpad's `looks/drawing-office-surface/final2/`: the hero, the fade into Wayfinder, the fade back in at About, Contact, the Burpees count in ink, the drawer plain and with the mesh (desktop also with its three field errors), and the dev panel.

## Background experiments

Branch `look/drawing-office-surface`, from `look/drawing-office` at `2f836d2`. Run it with `pnpm dev --host --port 5185 --strictPort`, then open `http://localhost:5185/`.

Chris asked for two things, verbatim where it matters:

- **Chapter tones.** "At the moment the background doesn't change between each section, right? I wonder if it's possible to find a shade that can move between the sections."
- **A triangulated mesh in the background.** "Rather large ones, not massive, or maybe medium", subtle texture "as we read and scroll down", optionally following the mouse so it "indents the triangle or polygonal mesh slightly … a sense of surface area or depth". It must not be heavy, and it should be "very muted around where the diagrams are, not have a hard border around them".

Both are built as switchable experiments with a dev-only panel. Nothing else on the page changed: no copy, no layout, no diagram code.

> **Superseded in places by Round 4 (above).** The panel is now the general "Dev panel" (`src/features/dev-panel/`), the defaults are Chris's (pencil mesh with the pointer at the page's ends), the pencil alpha is 0.024 with each edge drawn once, phones get 0.85 strength, and `surfaceStore.ts`, `useSurfaceSettings.ts` and `SurfacePanel.tsx` have gone (`surfaceSettings.ts` replaces them). The round 1 record below is kept as it was written.

### How to try it

- **The panel.** "Surface (dev)" sits at the bottom right under `pnpm dev`. It has Chapter tones (on or off), Mesh (Off, Static or Pointer) and Pencil lines (an extra I added, see below). The "–" collapses it. When Pointer can't run (no mouse, or reduced motion is on), the panel says so, and the mesh holds still.
- **URL parameters.** For example `?tones=1&mesh=pointer&lines=0`. Every change in the panel is written back to the URL with `replaceState`, so a state can be reloaded, bookmarked or sent. `tones` and `lines` take `1`/`0` (or `on`/`off`); `mesh` takes `off`, `static` or `pointer`. Unreadable values fall back to the defaults.
- **Production.** The panel and the URL parameters exist only under `pnpm dev`. They're gated on `import.meta.env.DEV`, so a build uses `SURFACE_DEFAULTS` and nothing else (proof under Verified, below).

### Where it lives

Everything is in `src/features/surface/`, a self-contained slice that's easy to delete. Two shared files changed, both additively, so the branch should rebase cleanly onto the five fixes being made on `look/drawing-office`:

- `src/app/App.tsx`: one import, and `<Surface />` after the footer.
- `src/ui/tokens/tokens.css`: a new `:root` block appended at the end, holding the four `--color-paper-*` tones and `--color-paper-line-hover`. No existing token changed.

What's in the folder:

| File                                       | What it is                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `settings.ts`                              | The modes, `SURFACE_DEFAULTS`, URL parsing and writing, and `effectiveMesh` (pointer falls back to static).                            |
| `surfaceStore.ts`, `useSurfaceSettings.ts` | A tiny external store (`useSyncExternalStore`). It reads and writes the URL only in dev.                                               |
| `Surface.tsx`                              | Sets `data-tones` on the root (in a layout effect, so before the first paint). Lazy-loads the mesh. In dev only, lazy-loads the panel. |
| `surface.css`                              | The tone mapping and plate fade, the firmer `line-hover` on the tones, and the mesh's stacking.                                        |
| `MeshCanvas.tsx`, `useMeshCanvas.ts`       | The mesh's layer and its drawing loop, which runs on events only.                                                                      |
| `mesh.ts`                                  | The triangulation: a seeded, jittered lattice. Pure and unbounded.                                                                     |
| `shading.ts`                               | The light, facet normals, Lambert shade, the dent profile, the fill maths and easing.                                                  |
| `falloff.ts`                               | The quiet round the drawings.                                                                                                          |
| `meshFacets.ts`, `meshLook.ts`             | The facets for a patch of page, and every parameter, set per width.                                                                    |
| `canvasWindow.ts`                          | The canvas's band of the page and its pixel ratio.                                                                                     |
| `SurfacePanel.tsx`                         | The dev panel.                                                                                                                         |
| `*.test.ts(x)`                             | 49 tests: 42 over the pure parts, 7 over the component.                                                                                |

### A. Chapter tones

**How.** The machinery was already there: the `--color-tone-*` tokens, the `.chapter-tone` plate behind each chapter, and `useNavTone`, which keeps the solid top bar in the colour of the page under it. With `data-tones` on the root:

- Each chapter's tone token points at its `--color-paper-*` token.
- The plate fades in from the chapter before, as the dark look's did. The fade runs 360px, 70vh into Burpees, and Contact fades back to the paper over its whole height.

The top bar, and every pinned stage's `bg-surface` backing, follow the tone automatically. The hairline that starts each chapter stays.

**The tones.** They are one paper family that steps a little deeper into the work and comes back out:

- The hero is the plain paper.
- Wayfinder is a touch bluer, the cyanotype's cast.
- Physio is a step deeper, leaning towards the practice's teal.
- Burpees is the deepest, a graphite grey.
- About comes back towards the paper.
- Contact fades back to the hero's paper, so the page ends where it began.

Every tone sits within OKLCH lightness 93.8–96.6%, chroma at most 0.007 and hue 209–236°. The plain paper is hue 197° at chroma 0.002, so all of them read as the same cool grey. Neighbouring steps are ΔE 0.7–2.0 (OKLab × 100). That's enough to feel the room change as you cross into a chapter, without ever seeing a colour.

| Chapter       | Token                     | Value     | OKLCH             | ink   | muted | dim-muted | red pen (accent) | accent-strong | danger | line-field | line-strong | line-hover (firmed) | teal |
| ------------- | ------------------------- | --------- | ----------------- | ----- | ----- | --------- | ---------------- | ------------- | ------ | ---------- | ----------- | ------------------- | ---- |
| Hero, Contact | surface (unchanged)       | `#F2F4F4` | 96.6% 0.002 197°  | 14.92 | 7.13  | 5.40      | 4.95             | 6.81          | 5.92   | 3.51       | 5.50        | 3.03 (not firmed)   | 4.56 |
| Wayfinder     | `--color-paper-wayfinder` | `#EBF0F3` | 95.2% 0.0067 234° | 14.35 | 6.86  | 5.19      | 4.76             | 6.54          | 5.69   | 3.37       | 5.29        | 3.15                | 4.38 |
| Physio        | `--color-paper-physio`    | `#E8EEEF` | 94.5% 0.0066 209° | 14.05 | 6.72  | 5.08      | 4.66             | 6.41          | 5.57   | 3.30       | 5.18        | 3.09                | 4.29 |
| Burpees       | `--color-paper-burpees`   | `#E8EBED` | 93.8% 0.0042 236° | 13.76 | 6.58  | 4.98      | 4.57             | 6.27          | 5.46   | 3.23       | 5.07        | 3.02                | 4.20 |
| About         | `--color-paper-about`     | `#EEF2F3` | 95.8% 0.0045 214° | 14.61 | 6.99  | 5.29      | 4.85             | 6.67          | 5.80   | 3.43       | 5.39        | 3.21                | 4.47 |

All values are WCAG ratios. dim-ink equals muted, so it isn't listed separately.

- **The red pen sets the floor.** As text it needs a paper luminance of at least 0.815 for 4.5:1. Burpees sits at 0.827 (4.57:1), so there's no room to go any deeper.
- **The fainter pencil, firmed.** On the deeper tones, `line-hover` (the figures' stepped-back edges, and a text link's underline) would have dropped below 3:1, to 2.79 on Burpees. Inside a toned chapter it becomes `--color-paper-line-hover` (`#7F888C`), which keeps 3:1 on every paper. The hero keeps the original.
- **Tests.** `tones.test.ts` pins every text role at 4.5:1 and `line-field` at 3:1 on each paper, the drawings' line-strong, firmed line-hover and teal at 3:1, and the family itself (within 12 levels of the paper on every channel, cool, a spread of no more than 10).

**Cost.** CSS only: one attribute and about 1.0 kB of stylesheet (0.26 kB gzipped), shared with the mesh rules. There's no script work per frame beyond what `useNavTone` already did.

### B. The mesh

**What it is.** A surveyor's triangulation in the paper's own surface. Picture a sheet of drafting film that isn't quite flat, lit from the upper left the way a drafting table is lit (from the left, so a right hand never shadows the line it's drawing).

- **The net.** Near-equilateral triangles on a lattice, each vertex nudged off it by a seeded jitter, so it reads as measured rather than ruled.
- **Its relief.** Each vertex sits a little above or below the sheet: mostly a slow swell across three or four cells, plus a little of each vertex's own.
- **Its shading.** Each facet is lighter or darker than flat paper by how much more or less it faces the light (Lambert's cosine, less the flat sheet's). Flat paper is exactly the paper colour, so the mesh breaks the page into facets without shifting its overall tone. The quiet zones round the diagrams therefore have the same average tone as open paper, and show no halo.

**Parameters** (`meshLook.ts`, at 1440 wide):

| Parameter                | Value                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cell (a triangle's side) | width ÷ 8, between 128 and 196px. 180px at 1440, 128px at 390.                                                                                                                                                  |
| Jitter                   | 0.2 of a cell on each axis. A test pins that no triangle folds below 0.25.                                                                                                                                      |
| Relief                   | ±0.11 of a cell. A swell 3.5 cells long, roughness 0.35.                                                                                                                                                        |
| Light                    | From 225° (upper left), 38° above the sheet.                                                                                                                                                                    |
| Gain                     | 24 sRGB levels per unit of shade.                                                                                                                                                                               |
| What that gives          | Facets within −1.4 to +1.6 levels of the paper. 80% within ±0.95. Neighbouring facets differ by 0.5 levels on average.                                                                                          |
| Shadow ceiling           | No facet darkens the paper by more than 1.5 levels. That keeps the red pen at 4.50:1 on the deepest paper, Burpees (`tones.test.ts` pins it). The lit side has no ceiling, since lightening only adds contrast. |
| Dent (pointer)           | Radius 1.6 cells. Depth 0.28 of a cell, on a (1 − t²)² profile with no crease at the centre or rim. Under it, facets range from −1.5 (capped) to +2.5 levels.                                                   |
| Dent timing              | Follows the pointer with a 90ms time constant. Presses in over 160ms. Lets go over 420ms when the pointer leaves the window or the window loses focus.                                                          |
| Quiet round the diagrams | The mesh holds 6% of its strength on and within 12px of a diagram, then smoothsteps back to full over 18% of the width (140–280px; 259px at 1440).                                                              |
| Phones (below 621px)     | 0.6 of the strength. Facets stay within ±0.8 levels: in practice, next to invisible.                                                                                                                            |
| Pencil lines (extra)     | Ink at 1.4% along each facet edge, about 2.8% where two facets share one.                                                                                                                                       |
| Canvas                   | 1.6 screens tall (0.3 of a screen of overscan each side). Pixel ratio is the device's capped at 1.5, and lower if the canvas would pass 4 megapixels.                                                           |

**Fixed or scrolling: it scrolls with the page.** It's the paper's surface, so it should travel with what's written on it. A fixed texture would slide under the text as a second plane, which is a parallax, the move unslop flags. Chris also described texture you pass "as we read and scroll down". How it works:

- **No lag.** The canvas is anchored to the page, not the window: a band a little taller than the screen, moved along in steps of half the overscan. The compositor scrolls it with the content, frame for frame. A window-fixed canvas redrawn on scroll would lag the content by a frame under threaded scrolling.
- **When it redraws.** Only when its band moves on, when a pinned diagram moves against the page, on a resize or a change in page height, or (in Pointer mode) when the mouse moves. The dent's easing runs frames only until it settles. Nothing redraws while the tab is hidden, and the canvas redraws from scratch when the tab comes back.

**Behind the content, in front of the tones.** Each chapter's tone plate sits at `z-index: -1` inside the chapter, which isolates it. With the mesh on, `.chapter-tone` switches to `isolation: auto`, so the plates join the page's own stacking context. The mesh's layer is `z-index: -1` too, but later in the page, so it paints over the plates and under every line of content. Checked by screenshot:

- The highlighter (`mix-blend-mode: multiply`) still blends.
- A physio journey and the Wayfinder demo run as before.
- The chat widget, the menus and the drawers sit over the mesh.

The layer is `aria-hidden`, has `pointer-events: none`, and is floored to the page's height so it can never lengthen it.

**Quiet round the diagrams, from their real positions.** These elements are measured every frame the mesh draws:

- the Wayfinder figure's SVG (`#work [data-bar-flush] svg[role="img"]`)
- the physio rings' room (`[data-testid="rings-room"]`, which has its exact size before the drawing loads)
- the Burpees count (`[data-testid="burpees-count"]`)

Their `getBoundingClientRect()` plus the scroll position gives their page position. So a pinned or sticky diagram is followed as it moves against the page, and the Wayfinder figure's apart zoom is included, since the rect reflects transforms. Each one is also watched:

- by a `ResizeObserver`, for a lazy drawing landing or a font arriving
- by a `MutationObserver` on `style` and `transform`, for the figure growing as it comes apart with no scroll

So the quiet keeps up even when nothing scrolls. Strength is set per facet (at its centroid), so the fade is in whole facets, and no facet steps by more than a fraction of a level.

**Pointer mode (B2).**

- **The dent.** Vertices near the mouse press in, and every facet's shade is recomputed from the light. The side nearer the light falls into soft shadow and the far side catches the light, which is how a dent in a sheet lit from the upper left looks.
- **Mouse and pen only.** No touch.
- **Fallbacks.** Without a fine, hovering pointer (`(hover: hover) and (pointer: fine)`), or with `prefers-reduced-motion: reduce`, it falls back to the static mesh.
- **Near a diagram** the dent is quiet too, so pointing at the Wayfinder figure barely stirs the paper.

**Pencil lines (my addition, off by default).** The facets alone read as a surface. A faint pencil line along every edge makes them read as a drawn survey net instead, the most literal drawing-office reading of the idea. I put it in the panel so Chris can compare (`final/desktop-4-pencil-lines-*.png`), but I wouldn't ship it, for three reasons:

- It's exactly the "faint grid on the paper" this look left out, because it competes with the hairlines that carry the structure.
- It crosses body text.
- Its 1px lines darken the paper by about 6 levels, beyond the shadow ceiling the facets keep.

**Performance.** The method: headless Chrome at 1440×900, scrolling the whole page (19,000px) at 24px a frame for 764 frames, after one pass to load the lazy chunks. Measured with CDP `Performance.getMetrics` and `requestAnimationFrame` deltas. Headless rasterises canvas in software, so treat these as a relative worst case.

| Mode                               | Frames over 20ms  | p99 frame | Main-thread script | All main-thread tasks | Extra per frame vs tones only  |
| ---------------------------------- | ----------------- | --------- | ------------------ | --------------------- | ------------------------------ |
| Tones off, mesh off                | 0                 | 16.8ms    | 555ms              | 1,878ms               | baseline                       |
| Tones on, mesh off                 | 1 (33ms, one-off) | 16.8ms    | 528ms              | 1,849ms               | (tones cost nothing per frame) |
| Static                             | 0                 | 16.8ms    | 781ms              | 2,112ms               | +0.3ms script, +0.3ms tasks    |
| Static with pencil lines           | 0                 | 16.8ms    | 902ms              | 2,217ms               | +0.5ms                         |
| Mesh off, mouse moving (control)   | 0                 | 16.8ms    | 684ms              | 2,195ms               | baseline for the next row      |
| Pointer, mouse moving throughout   | 0                 | 16.8ms    | 1,250ms            | 3,005ms               | +0.7ms script, +1.1ms tasks    |
| Phone 390×844: tones only / static | 1 (one-off) / 0   | 16.8ms    | 515 / 619ms        | 1,628 / 1,550ms       | +0.1ms script                  |

No mode dropped a frame that the control didn't, and the existing scroll-driven work (the rail, the build lane, the Burpees count, the figure, the rings) ran at 60fps throughout. Layout time didn't rise in any mode, so the per-frame `getBoundingClientRect` reads aren't forcing extra layouts.

Memory and bundle:

- **Canvas memory.** About 1440 × 1440 × 1.5² ≈ 4.7 MP ≈ 18 MB on a retina laptop, held at 4 MP, about 16 MB, on bigger screens. On a phone it's about 1.2 MP.
- **Bundle.** The mesh is its own lazy chunk (`MeshCanvas-*.js`, 8.3 kB, 3.9 kB gzipped). It isn't preloaded and isn't fetched while the mesh is off. The main bundle grew by 0.9 kB (0.35 kB gzipped), for the store, settings and `Surface`.

### Honest verdict

**Tones: yes.** They answer Chris's question directly: the background now moves between sections. They do it with machinery the site already had, at no cost per frame, and with every contrast pair still at AA. In the screenshots you feel the change of room as each chapter starts without being able to name a colour. That's the right level for this look. If they ship, bake the values into the `--color-tone-*` tokens and drop the attribute.

**The mesh: it doesn't earn its place, and I'd ship it off.** I've tried to make it belong (a survey net in a lit drafting sheet, quiet round every drawing, held to the paper's tone), and I think it's the most defensible version of the idea, but:

- **There's no meaning in it.** Every other mark on this page means something: the dimension lines measure, the red pen picks out, the highlighter traces. The mesh is texture. unslop's test is whether decoration replaces decoration, and this look's own record left out a drafting grid for exactly that reason. A triangulation is a grid with better manners.
- **Subtle enough means nearly invisible.** At a level that leaves text and diagrams undisturbed (±1.5 sRGB levels), it's a faint sheen on a good screen, invisible on many, and gone on phones. Strong enough to read clearly, it starts to look like the low-poly backgrounds of about 2015: swapping one trend for another, which is what unslop warns about.
- **It competes with the work.** The Pointer mode is the nicest moment of the two, a soft press that follows the mouse. But the page's interactive moments are its three case studies, and a background that reacts to the mouse competes with them for "this is the bit you play with". That's why it's quiet near the diagrams, and it's also why it doesn't need to be there at all.
- **It costs.** About 16–18 MB of canvas, 0.3–1.1ms of main thread per scrolled frame, and a stacking change on every chapter, for a texture.

**If Chris loves it anyway:** ship Static only, desktop only, without pencil lines.

- **Static only.** The mesh scrolls with the page and holds still.
- **Desktop only.** Add a `min-width` gate at `wide` and draw nothing on phones, where it's invisible anyway.
- **No pencil lines.**
- **Treat Pointer as a delight only, not a default.** I'd still leave it out.

### Recommended shipping defaults

`SURFACE_DEFAULTS` in `settings.ts` is what a production build uses, and it's set to the recommendation:

| Setting | Default | Why                                                                      |
| ------- | ------- | ------------------------------------------------------------------------ |
| `tones` | `true`  | Quiet, structural, free per frame, AA everywhere.                        |
| `mesh`  | `"off"` | See the verdict. With it off, none of the mesh's code is fetched.        |
| `lines` | `false` | Competes with the hairlines, crosses text and passes the shadow ceiling. |

To ship as recommended, move the four paper values into the `--color-tone-*` tokens. Then delete `src/features/surface/` and its two lines in `App.tsx`, which drops the panel, the store and the attribute.

### Verified

- **Gates.** `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all exit 0 on the final tree: 80 test files and 415 tests, up from 72 and 366. The 49 new tests cover the pure parts (42) and the component (7): the mesh's determinism, no folded triangles, full coverage with no gaps, the smooth swell, the light's direction, a facet's shade sign and symmetry, the dent profile, the fill maths, easing, the falloff's floor, its continuity and its minimum over two diagrams, a moving diagram, the dent's shadow and light sides and its release, the shadow ceiling, phones being fainter, the canvas band's coverage, stepping and ends, the pixel-ratio cap, URL parsing and writing, the pointer fallbacks, the tones' contrast and family, and the component's attributes and panel.
- **The panel is absent from production.** After `pnpm build`, `grep -rlF` over `dist/` finds 0 files for each of `Surface (dev)`, `data-surface-panel`, `Chapter tones`, `Pencil lines`, `SurfacePanel`, `holds still here`, `replaceState`, `tones=` and `mesh=pointer`. The panel's dynamic import is dead code once `import.meta.env.DEV` is `false`, so no panel chunk is emitted, and the URL parsing is dropped with it. The mesh chunk is emitted (it's reachable if the default changes) but `dist/index.html` doesn't preload it.
- **No sideways overflow.** At 320 and 390, in tones-only, static and pointer-with-lines, `scrollWidth − clientWidth` stays at 0 while scrolling the whole page. The page height is the same with the mesh on as off.
- **Screenshots** at 1440×900 and 390×844 of every mode over the hero, Wayfinder and physio (baseline, tones, static, pointer, pencil lines, and the panel), plus chapter boundaries, Burpees mid-count, About, a physio journey and the Wayfinder demo with the mesh on, and the reduced-motion fallback. They're in the session scratchpad (`looks/drawing-office-surface/final/`), not the repo.

### Unsure, or left undone

- **Not seen on a real screen.** The mesh is tuned at ±1.5 levels in headless screenshots, and how it reads depends heavily on the display. On a wide-gamut laptop at full brightness it should show as a faint sheen; on a dim or low-contrast screen, nothing. Chris should judge it on his own screens, phone included.
- **A gutter stripe in headless only.** With classic scrollbars, `scrollbar-gutter: stable` reserves 15px that the chapter plates don't reach, and headless screenshots show it as a pale stripe at the right with tones on. The dark look's plates had the same stripe. A real browser paints its scrollbar there, and macOS's overlay scrollbars reserve nothing.
- **The quiet is per facet, not per pixel.** It fades in whole facets, which can't step by more than a fraction of a level, but a facet that straddles a diagram's edge takes the strength at its centre. WebGL could fade per pixel. I judged Canvas 2D enough at this strength.
- **Which diagrams are quiet** is a list of selectors in `useMeshCanvas.ts` (`QUIET_SELECTORS`), not attributes on the diagrams. That's deliberate, to stay out of files being changed on `look/drawing-office`, but it's fragile if those elements change. The chat widget and the build lane aren't in the list: the widget is an opaque white sheet that hides the mesh, and the lane is a line, not a drawing.
- **A pre-existing dot.** On a phone, in the physio chapter, there's a small dot at the left edge just above the picker (about x 16, y 463 at 390×844). It's in the baseline with both experiments off, so it isn't from this branch. It may be the physio fade bug being fixed on the other branch.
- **The charter and the showcase** don't mention the surface experiments. It's a draft branch.

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

## Round 3: Chris's five changes

1. **"How it was built" is Editorial's lane, in the red pen.** It replaces the dimension-line lane. Each stage is a hollow 21px circle on a 3px hairline. As the red line reaches a stage, the circle fades to a ringed bullet (red edge, a ring of paper, red core). A spark (a red dot in a ring of paper) rides the line's head while the lane is pinned. Two differences from Editorial:
   - Editorial's spark trail is left out: a red trail on the red line wouldn't show.
   - Chris described each circle as growing briefly when reached. Editorial's code doesn't animate that (what reads as a grow is its spark passing over the circle), so I made it explicit: a one-off scale to 1.3 and back over 550ms as a stage lights. It's off under reduced motion, where the lane is lit from the start.
   - **The chapter rail follows it.** It's now a hollow circle over a 2px hairline that the red pen fills, and the circle becomes a ringed bullet once the chapter is read. With the lane gone, the rail's oblique ticks were the only dimension line left, and the two "how far" cues showed side by side at 1280px and wider in different vocabularies. **The dimension-line signature is retired.** The drawings' own conventions (balloons, centre lines, the highlighter) carry the look now.
2. **Wayfinder balloons are opaque.** Balloons for parts out of focus were faded to 60% opacity, so the line work showed through and the numbers were hard to tell apart. They now stay solid paper with a firmer 1.5px edge (1.9px in red for the part in focus). An out-of-focus balloon steps back by colour only: its number is muted text (7.1:1), not see-through.
3. **The demo's highlight clears.**
   - Once the reply lands, the highlighted route stays for 1.6s, then fades out over the lit lines' existing 450ms opacity transition.
   - Under reduced motion it stays as long as a flashed part does (4s), then goes at once.
   - A new message cancels the last one's pending clear, so sending twice in a row never wipes the second route mid-run.
   - Tests cover all three. One existing test asserted the route stayed lit afterwards; it now checks the route is lit as the reply lands.
4. **Physio step 1, "the edge", now reverses.**
   - **Cause:** the shared step-selection hook (`useStepSync`) never went back to "no step". Scrolling back above the first step left the edge selected, so it stayed drawn and its words stayed shown.
   - **Master and live:** master (`~/developer/chris-site` at `1b19dde`) has the same code, so the bug is on master. I reproduced it on the live site, chris-tregaskis.uk, with the same script.
   - **Fix:** `useStepSync` takes an opt-in `noneAbove` option, which the rings explorer turns on. When the first step leaves the focus band downwards, the selection goes back to none (0). The pure rule is `selectionAfterLeaving` in `lib/stepSync.ts`. The rings' draw goals moved into `draw.ts` as `drawGoals`. Wayfinder's behaviour is unchanged (it doesn't opt in).
   - **Tests:** the pure rule (`stepSync.test.ts`), the hook (`useStepSync.test.tsx`, with the option and without), and the reverse case in `draw.test.ts` (with nothing selected, every step's goal is undrawn, the edge included, and walked back to zero the edge leaves no line or icon).
   - **Checked in the browser** at 1440 and 390: scrolled back above the edge, its lines and icons undraw and its words fade, and it draws on again on the way down.
5. **The Burpees count is in Newsreader light, in the red pen**, like the other numerals, with lining and tabular figures. (Round 4 puts it back in ink, same face.)
   - **Contrast:** 4.95:1 on the paper, well over the 3:1 large-text minimum.
   - **No layout shift:** measured across every value as the set counts up, every one-, two- and three-digit value is exactly the same width (197 / 394 / 591px at 1440; 112 / 224 / 336px at 390), and the calls' left edge never moves.
   - The count is measured at runtime (`CountRuler`), so the figure still stands on the new face's baseline.

Screenshots of each fix at 1440 and 390 are in the comparison folder as `r3-*.png`.

## Direction

- **Product.** A senior full-stack TypeScript developer's portfolio that shows he builds whole products end to end, through three working case studies a visitor can take apart and run.
- **Character.** Precise, technical, quietly confident.
- **World.** A drawing office: cool drafting paper, graphite pencil and black ink line work, the checker's red pen for what matters, and a highlighter for what has been traced through.
- **Moments.** (1) The Wayfinder figure, redrawn as an ink isometric line drawing where only the part in focus takes the red pen, and a message's route is highlighted as it travels. (2) The physio rings as a plan drawing in pencil and ink: each step inks its ring over the pencil of earlier steps, and a journey is highlighted behind a red-pen pulse. (3) The Burpees count in huge ink mono numerals, with the app's call in red pen.
- **Signature.** (Retired in round 3; see above.) The dimension line. Every "how far" on the page is drawn as one. The chapter rail (from 1280px) and the How it was built lane are thin pencil lines between oblique architectural ticks. The red pen draws over them as you read, with an arrowhead nib at the head of the lane, and ticks each stage off in red. Nothing else on the page uses it.

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
