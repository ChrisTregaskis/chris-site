# chris-site — the charter

This file orients any Claude session that opens this repo. Read it first, then `CLAUDE.local.md` (gitignored, machine-local) for the scratch pad, HQ sync rule and the named anonymisation list.

## What this is

Chris Tregaskis's portfolio site, served at `chris-tregaskis.uk` (with `www.` redirecting). One long-scrolling React page in one dark look (no theme switch): a hero, three case studies (Wayfinder with its interactive isometric figure, live chat demo and How it was built lane, a physio SaaS, Badass Burpees), About and Contact, under a sticky top bar. Its main call to action, Get in touch, opens an enquiry drawer that posts to `VITE_CHRIS_API/enquiry` (**a route the API doesn't have yet**, see Known issues); Request my CV opens a CV drawer that posts to the same separate Lambda's `/resume`. It is the proof link every freelance cold email points to, so what ships here is public-facing.

It was built in a hurry from a starter template (credit in `README.md`). Phase 3a (foundations) gave it a deliberate folder architecture, written conventions (below) and a test suite; Phase 3b-2 added the design system (tokens, motion presets, atoms, molecules and a dev-only showcase); Phase 3c ported the locked b3 prototype into the page and retired the old terminal (see Roadmap).

## Stack

- Vite 5, React 18, TypeScript (strict), Tailwind 3, Framer Motion 11, `clsx` + `tailwind-merge`, Fontsource variable fonts (Bricolage Grotesque, Figtree), preloaded by a small build plugin in `vite.config.ts`.
- pnpm (lockfile is `pnpm-lock.yaml`; `pnpm-workspace.yaml` only carries `onlyBuiltDependencies`).
- Hosted on AWS via SST v3: one `sst.aws.StaticSite` (`ChrisSite`) plus an `sst.aws.Bucket`, region `eu-west-2`, defined in `sst.config.ts`. The `production` stage is protected and retained on removal.
- ESLint 8 with `eslint-config-kentcdodds` (+ `react-hooks/rules-of-hooks`); Prettier 3 with `prettier-plugin-tailwindcss`.
- Vitest 3 + Testing Library (jsdom); config lives in `vite.config.ts` so the `@/` alias is shared.

## Commands

| Command                | What it does                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies. Non-interactive shells need `CI=true` if pnpm wants to rebuild `node_modules`.                              |
| `pnpm dev`             | Vite dev server. The CV form needs `VITE_CHRIS_API` set to work locally. The design system showcase is at `/showcase.html`.       |
| `pnpm build`           | `tsc && vite build` → `dist/`. This is also the typecheck gate.                                                                   |
| `pnpm typecheck`       | Typecheck only (`tsc --noEmit`; covers `src/`). Runs in CI.                                                                       |
| `pnpm lint`            | ESLint over the repo, `--max-warnings 0`.                                                                                         |
| `pnpm format`          | Prettier, writes in place.                                                                                                        |
| `pnpm format:check`    | Prettier check only. Runs in CI.                                                                                                  |
| `pnpm test`            | Vitest, single run. Runs in CI.                                                                                                   |
| `pnpm test:watch`      | Vitest in watch mode.                                                                                                             |
| `pnpm preview`         | Serve the built `dist/`.                                                                                                          |
| `pnpm sst:dev`         | `sst dev` with `AWS_PROFILE=chris`. Needs Chris's AWS credentials.                                                                |
| `pnpm sst:deploy:prod` | `sst deploy --stage production` with `AWS_PROFILE=chris`. Chris's manual fallback only — not Claude's to run, and not used by CI. |

`pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` must all pass before anything is committed. CI (`.github/workflows/ci.yml`) runs the same five on every pull request and push to `master`. Node version is pinned in `.nvmrc`; pnpm in `packageManager`.

## Repo layout

| Path                               | Holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/main.tsx`                     | Entry (`index.html` points here). Imports `styles/index.css` and the fonts, wraps `App` in `AppProviders`.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/app/`                         | The page shell: `App.tsx` (skip link, sticky `TopNav` with the Get in touch button, the sections in order, footer, `EnquiryDrawer`, `CVDrawer`), `AppProviders.tsx` (CVRequest and Enquiry).                                                                                                                                                                                                                                                                                                                                                     |
| `src/sections/<name>/`             | One folder per long-scroll section, composing `ui/` and `features/`: `hero`, `wayfinder` (chapter + `BuildStory`), `physio`, `burpees`, `about`, `contact`.                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/features/<name>/`             | Vertical slices, each with an `index.ts` public API: `cv-request/` (context with status and drawer state, `CVDrawer`, `CVRequestForm`, `useCVRequestForm`, validation, `CVRequestButton`, `cvLink.ts`), `enquiry/` (the same shape: context, `EnquiryDrawer`, `EnquiryForm`, `useEnquiryForm`, `enquiryFields` with the help options, `sendEnquiry` client, `EnquiryButton`, `links.ts`), `wayfinder/` (parts, iso geometry, figure, step cards, chat mock, demo script and runner).                                                             |
| `src/assets/`                      | Images imported by sections and features (hashed by Vite): `burpees/` (the app's figure, 512px webp), `about/` (the About photo, 720px jpeg, metadata stripped), `wayfinder/vehicle-sketch-{400,800}.webp` (the chat's vehicle card sketch, 2:1 at 1x and 2x; the source PNG stays in `.claude/local/prototypes/3c/assets/`, sizes in `features/wayfinder/VehicleImage.tsx`).                                                                                                                                                                    |
| `src/ui/tokens/`                   | Design tokens: `tokens.css` (CSS variables, the only home of raw values), `motion.ts` (durations, eases, staggers for Framer), `breakpoints.ts` (+ `BELOW_WIDE`), `fonts.ts` (self-hosted fonts), `fontPreload.ts` (the build's preload tags).                                                                                                                                                                                                                                                                                                   |
| `src/ui/motion/`                   | Reduced-motion-aware motion presets: `resolvePreset`, `staggerChildren`, `useMotionPreset`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/ui/atoms/`                    | Single-element components with no app knowledge: `Button`, `ButtonLink`, `Spinner`, `TextLink`, `Icon`, `VisuallyHidden`, `Chip`, `Card`, `Container`, `Label`, `Input`, `Textarea`, `Select`, `FieldError`.                                                                                                                                                                                                                                                                                                                                     |
| `src/ui/molecules/`                | Compositions of atoms: `ChipList`, `Section`, `ChapterHeading`, `TopNav` (with an `action` slot), `TextField` (input, textarea, or select with `options`), `RevealList` / `RevealItem`, and the drawer-form pieces `DrawerHeader`, `DrawerIntro`, `DrawerDone`, `FormAlert`, `FormSubmitRow`.                                                                                                                                                                                                                                                    |
| `src/ui/organisms/`                | Pieces with behaviour: `Drawer` (native `<dialog>`, side drawer / bottom sheet), `NumberedDropdown` (+ `useNumberedDropdown`, `listboxKeys`), `Odometer` (+ `useOdometer`, `odometerTicks`).                                                                                                                                                                                                                                                                                                                                                     |
| `src/hooks/`                       | Shared cross-feature hooks: `useStepSync` (scroll/click step selection), `useScrollFrame` (one callback per frame on scroll/resize, skipped while a watched section is off screen), `useMediaQuery`, `useValidatedForm` and `useDrawerFormState` (the behaviour and app-wide state shared by every drawer form).                                                                                                                                                                                                                                 |
| `src/lib/`                         | Framework-free helpers: `cn` (over `clsx` + `tailwind-merge`, taught the token keys), `api` (`ApiStatus`), `stepSync`, `scrollProgress`, `polyline`, `formValidation`, `frameThrottle`.                                                                                                                                                                                                                                                                                                                                                          |
| `src/styles/index.css`             | Global styles: imports the tokens, then base styles (body surface/ink/Figtree, the signal focus ring, scroll padding for the sticky bar).                                                                                                                                                                                                                                                                                                                                                                                                        |
| `src/showcase/`, `showcase.html`   | Dev-only design system showcase (a second Vite entry). Served by `pnpm dev` at `/showcase.html`; never built into `dist/`.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/test/`                        | Test setup (`setup.ts`: jest-dom, cleanup, and inert stand-ins for what jsdom lacks: dialog `showModal`/`close`, `matchMedia`, `IntersectionObserver`, `scrollIntoView`, `scrollTo`), `renderWithProviders`, repo-level tests (`indexHtml.test.ts`).                                                                                                                                                                                                                                                                                             |
| `src/sst-env.d.ts`, `sst-env.d.ts` | Generated by SST. Do not edit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `sst.config.ts`                    | The AWS infrastructure.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `public/`                          | Static files served from the site root: favicons, `robots.txt` (with the Sitemap line), `sitemap.xml`, `llms.txt` (the llms.txt convention: what the site is, linking each section's anchor; keep it in step with the page copy) and `.well-known/ard.json` (an empty Agentic Resource Discovery manifest: the site offers no agent tools, and without it the host's fallback serves HTML there, which Lighthouse reads as a broken manifest). `index.html` carries a schema.org `Person` in JSON-LD. `src/test/agentFiles.test.ts` checks them. |
| `.github/workflows/`               | `ci.yml` (format, lint, typecheck, test, build) and `deploy.yml` (manual production deploy via GitHub OIDC).                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `.claude/settings.json`            | Committed permissions allow-list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `.claude/local/`                   | Working files (plans, scratch pad). Gitignored here; a symlink into Chris's HQ.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Code conventions

**General.** TypeScript, strict; no JavaScript source files; fix types rather than casting around them. Framer Motion for animation, respecting `prefers-reduced-motion` in anything new: every scroll story has a static fallback (finished state, no pinning). British English in visible copy, comments and docs; no connector em-dashes in visible copy. Works at phone width with no horizontal scroll (checked at 320, 390, 1440 and 2560). Keep what works working: the enquiry and CV-request flows and the single dark look must not regress. A new drawer form reuses `useValidatedForm`, `useDrawerFormState` and the drawer-form molecules rather than copying the CV form. Don't edit SST-generated files or anything under `.sst/`.

**Where things live.**

- `app/` is app-wide wiring, not a feature; it may import anything.
- `sections/<kebab-name>/` holds one page section: its layout, copy and any section-only hooks. Sections import `ui/`, `hooks/`, `lib/` and features (via `index.ts`), never `app/`.
- `features/<kebab-name>/` holds one concern end to end. Inside a feature use relative imports; from outside, import only via the feature's `index.ts`.
- `ui/`, `hooks/` and `lib/` never import from `app/`, `sections/` or `features/`.
- No import cycles.
- On a case-insensitive disk, never give two files in one folder names that differ only in case (`odometer.ts` beside `Odometer.tsx` breaks the import).

**Naming.** Components `PascalCase.tsx`, one component per file, named exports (no default exports). Hooks `useThing.ts` (`.tsx` only when they contain JSX). Helpers `camelCase.ts`. Constants `UPPER_SNAKE`. Feature folders kebab-case. Tests colocated as `Thing.test.tsx`. Prefer string-literal unions and `as const` objects to enums.

**Imports and aliases.** `@/` points at `src/`; use it across folders, and relative imports inside a feature.

**Components and hooks.** Props as an `interface ThingProps`. Logic lives in hooks; components render; the maths behind scroll and animation lives in pure `lib/` (or section) helpers with their own tests. No `window` reads during render in new code. Per-frame scroll visuals write to the DOM through refs (or set coarse state that bails out when unchanged), via `useScrollFrame`, passing the section as its `watch` element so an off-screen section costs nothing; skip writes that wouldn't change anything, and measure what only a resize can change (its `resized` flag) rather than every frame. `react-hooks/exhaustive-deps` is on.

**Context and providers.** One context per concern, inside its feature: `ThingContext.ts` (the context, its value type, and a `useThing` hook that throws outside its provider) and `ThingProvider.tsx`. Memoise the provider value. Providers are composed only in `app/AppProviders.tsx`. Use context for app-wide state only; pass props otherwise.

**Styling.** Tailwind with the design tokens; see Design system below. Use `cn` for conditional classes in new code. Don't retrofit `cn` onto existing class strings: `tailwind-merge` drops conflicting classes and can change rendering. Tailwind scans everything under `src/` (tests included), so class-like words in comments can generate CSS.

**Design system.** Built in Phase 3b-2 from the locked b3 look; the whole page uses it since 3c.

- **Tokens** are CSS variables in `src/ui/tokens/tokens.css`, mapped into Tailwind in `tailwind.config.ts` (`bg-surface`, `text-muted`, `border-line`, `text-body-sm`, `rounded-card`, `shadow-focus-glow`, `duration-base`, `ease-enter`, `sheet:` / `wide:` and friends). Colours are RGB channels, so opacity modifiers work (`bg-danger/10`).
- **Never raw hex in components.** Raw values live only in `tokens.css`. Product mocks have their own named token groups there: `figure-*` (the Wayfinder iso faces), `chat-*` (the white brand widget), `bb-*` (the Badass Burpees screen and phone), `tenant-teal`. Arbitrary values may reference tokens (`rgb(var(--color-bb-ink))`).
- **New token keys must not shadow Tailwind defaults** (`rounded-md`, `shadow-lg`, `font-mono`… are used by live markup); `src/ui/tokens/tailwindConfig.test.ts` enforces it. When you add a font size, shadow or radius key, add it to `TOKEN_MERGE_KEYS` in `src/lib/cn.ts` too (the same test checks), or `tailwind-merge` will drop it.
- **Motion** comes from `useMotionPreset` (`src/ui/motion/`) or `@/ui/tokens/motion` (`DURATION`, `EASE`, `STAGGER`), never hard-coded durations. Every preset drops transforms and duration under `prefers-reduced-motion`; CSS transitions add `motion-reduce:transition-none`.
- **Layers:** atoms are single elements with no app knowledge; molecules compose atoms; organisms (3c) may hold behaviour. None import from `app/` or `features/`.
- **Fonts** are self-hosted Fontsource variable fonts, imported from `@/ui/tokens/fonts` by `main.tsx` and the showcase. The build injects `<link rel="preload">` for the two Latin files the first screen needs (`fontPreload.ts`, which fails the build if one goes missing).
- **Dimming:** never fade text with `opacity` (it drops below AA). An inactive step card takes `tone-dim` (in `styles/index.css`), which remaps `ink` and `muted` inside it to the `dim-*` tokens (both at least 4.5:1, pinned by `tokens.test.ts`); only the frame fades. Form field borders use `line-field` (3:1).
- **Line height:** b3 set many sizes with the CSS `font` shorthand, which resets line height to `normal`; where a component must match it, use `leading-[normal]` (labels, buttons, build-lane titles).
- **Showcase:** run `pnpm dev` and open `/showcase.html` to see every token and component. Add each new component there (a section in `src/showcase/sections/`). It is a second Vite entry, never built into `dist/`, and production CSS skips its utilities (`tailwind.config.ts` drops `src/showcase/**` from `content` when `NODE_ENV` is `production`).

**Tests.** Vitest + Testing Library. Test behaviour, not snapshots. Render through `renderWithProviders` (from `@/test/renderWithProviders`). Mock `fetch` with `vi.stubGlobal`, env with `vi.stubEnv`; `src/test/setup.ts` restores both after each test. To test under reduced motion, stub `matchMedia` to match `reduced-motion` before the first render (Framer reads it once per test file). Drive an `IntersectionObserver` by stubbing your own (see `useStepSync.test.tsx`). Test fixtures use neutral data (`Ada`, `ada@example.com`).

## Known issues

- **Copy is the b3 prototype's, pending Chris's language pass.**
- **The enquiry has no backend yet.** `sendEnquiry` posts to `VITE_CHRIS_API/enquiry`, but the API (a separate private repo, `chris-api`) only has `/resume`, so every enquiry currently fails into the form's error state (didn't send, LinkedIn offered, Try again). Don't ship Get in touch to production until Chris has approved and deployed the `/enquiry` route (proposal in `.claude/local/phase-3c-handover.md`).
- The API's `/resume` requires `lastName`, which the CV form marks optional, so a CV request without a last name answers 400: the CV still unlocks but Chris gets no note (the "didn't reach me" text).
- The CV-form spinner bug (3a) is fixed: a failed request shows a banner and Try again (pinned by `hands control back when the request fails` in `CVRequestForm.test.tsx`).

## Anonymisation rule — portfolio content

This site is public and will describe work Chris did through his employer. **Never name the employer's clients or vendors** in copy, alt text, image content, file names, commit messages or code comments. Describe work by what it does ("an AI guide for a global automotive brand"), never who it was for. The public product name for that work is **Wayfinder**. No real screenshots of client work. Chris's own products (e.g. Badass Burpees) and employers already on his public CV are fine.

The named deny-list lives in `CLAUDE.local.md` and in the refresh design doc in HQ — deliberately not here, because this repo is public and the list itself would disclose the relationships it protects. Check new copy against it before committing.

## Git

This project is in HQ's **`personal`** bucket, so a session **may** run `git add`, `commit`, `push` and `pull` here directly. Default branch is `master`.

- **No AI attribution** in commits or PRs: no `Co-Authored-By: Claude`, no "Generated with Claude Code", no `Claude-Session:` lines. End the message with its body.
- Use a plain `git commit` with a clear message. Never force-push `master`.
- Creating repos and remotes stays Chris's step.

## Deploys

Production deploys run in GitHub Actions (`.github/workflows/deploy.yml`, `workflow_dispatch` only) under an AWS IAM role assumed via GitHub OIDC (`vars.AWS_DEPLOY_ROLE_ARN`). The workflow refuses to run off `master`, refuses if the role variable is unset, and refuses unless `ci.yml` concluded success for the exact commit; it then runs `pnpm exec sst deploy --stage production` and smoke-checks `https://chris-tregaskis.uk/` (200 + the expected `<title>`). One deploy at a time; a running deploy is never cancelled.

- **Standing permission:** Claude may trigger the production deploy for this repo **only when CI on that commit is green**. Granted by Chris on 30 Oct 2026; it covers **this repo only** and does not generalise.
- **The sequence Claude follows** (after pushing to `master` and resyncing HQ):
  1. `gh run list --workflow ci.yml --commit "$(git rev-parse HEAD)" --limit 1` — find CI for the commit.
  2. `gh run watch <ci-run-id> --exit-status` — confirm it concluded success. If not green, stop: fix, don't deploy.
  3. `gh workflow run deploy.yml --ref master` — trigger. (Deliberately not on the allow-list, so each deploy is a visible, prompted action.)
  4. `gh run list --workflow deploy.yml --limit 1` then `gh run watch <deploy-run-id> --exit-status` — watch it through.
  5. `curl -sS https://chris-tregaskis.uk/ | grep '<title>'` — confirm live, and eyeball the change.
  6. On failure: `gh run view <run-id> --log-failed` and report it with the output. Never retry by running `sst deploy` locally.
- Claude never touches AWS credentials, profiles or IAM, and never runs `sst deploy` locally. An `AccessDenied` in the deploy log is reported to Chris with the action it names; he changes the role policy.
- Chris's manual fallback is unchanged: `pnpm sst:deploy:prod` with his AWS profile.

## Roadmap

The epic and designs live in Chris's HQ (personal bucket), not in this repo:

- `~/HQ/personal/notes/chris-site-epic.md` — the phased epic: Phase 1 Claude infrastructure, Phase 2 CI with Claude-triggered deploys, Phase 3 revamp (foundations, atomic design system, content refresh).
- `~/HQ/personal/notes/chris-site-refresh-design.md` — the content refresh design (Phase 3 step 3). Nothing in it starts until foundations and the design system have landed.
- `.claude/local/phase-2-ci-plan.md` — the Phase 2 CI and deploy plan.
- `.claude/local/phase-3c-plan.md` and `phase-3c-handover.md` — the Phase 3c content refresh (b3 ported, deliberate deviations, parity screenshots in `.claude/local/prototypes/3c/`).
