# chris-site — the charter

This file orients any Claude session that opens this repo. Read it first, then `CLAUDE.local.md` (gitignored, machine-local) for the scratch pad, HQ sync rule and the named anonymisation list.

## What this is

Chris Tregaskis's portfolio site, served at `chris-tregaskis.uk` (with `www.` redirecting). A single-page React app: a typing-terminal hero, an About panel, a theme toggle (lightbulb) and a CV-request form that posts to a separate Lambda (`VITE_CHRIS_API`). It is the proof link every freelance cold email points to, so what ships here is public-facing.

It was built in a hurry from a starter template (credit in `README.md`). Phase 3a (foundations) gave it a deliberate folder architecture, written conventions (below) and a test suite; Phases 3b and 3c build on them (see Roadmap).

## Stack

- Vite 5, React 18, TypeScript (strict), Tailwind 3, Framer Motion 11, `clsx` + `tailwind-merge`, `react-toastify`.
- pnpm (lockfile is `pnpm-lock.yaml`; `pnpm-workspace.yaml` only carries `onlyBuiltDependencies`).
- Hosted on AWS via SST v3: one `sst.aws.StaticSite` (`ChrisSite`) plus an `sst.aws.Bucket`, region `eu-west-2`, defined in `sst.config.ts`. The `production` stage is protected and retained on removal.
- ESLint 8 with `eslint-config-kentcdodds` (+ `react-hooks/rules-of-hooks`); Prettier 3 with `prettier-plugin-tailwindcss`.
- Vitest 3 + Testing Library (jsdom); config lives in `vite.config.ts` so the `@/` alias is shared.

## Commands

| Command                | What it does                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies. Non-interactive shells need `CI=true` if pnpm wants to rebuild `node_modules`.                              |
| `pnpm dev`             | Vite dev server. The CV form needs `VITE_CHRIS_API` set to work locally.                                                          |
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

| Path                               | Holds                                                                                                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                     | Entry (`index.html` points here). Imports `styles/index.css`, wraps `App` in `AppProviders`.                                                                                                                            |
| `src/app/`                         | The page shell: `App.tsx` (header keys and the active-view switch), `AppProviders.tsx` (Theme → ActiveContent → CVRequest), `ActiveContentContext.ts` + `ActiveContentProvider.tsx` (which panel shows; retired in 3c). |
| `src/features/<name>/`             | Vertical slices, each with an `index.ts` public API: `theme/`, `cv-request/` (context, provider, form, `cvLink.ts`), `terminal/` (terminal, lines, typewriter, copy button, command words, `useTerminal`), `about/`.    |
| `src/ui/`                          | Shared presentational components, flat for now: `Button`, `KeyboardButton`, `ToolTip`.                                                                                                                                  |
| `src/hooks/`                       | Shared cross-feature hooks: `useToast`.                                                                                                                                                                                 |
| `src/lib/`                         | Framework-free helpers: `cn` (over `clsx` + `tailwind-merge`), `breakpoints`, `api` (`ApiStatus`).                                                                                                                      |
| `src/styles/index.css`             | Global styles and the CSS custom properties the theme uses (`--bgColor`, `--textColorPrimary` and friends, mapped in `tailwind.config.ts`).                                                                             |
| `src/test/`                        | Test setup (`setup.ts`), `renderWithProviders`, repo-level tests (`indexHtml.test.ts`).                                                                                                                                 |
| `src/sst-env.d.ts`, `sst-env.d.ts` | Generated by SST. Do not edit.                                                                                                                                                                                          |
| `sst.config.ts`                    | The AWS infrastructure.                                                                                                                                                                                                 |
| `public/`                          | Static assets.                                                                                                                                                                                                          |
| `.github/workflows/`               | `ci.yml` (format, lint, typecheck, test, build) and `deploy.yml` (manual production deploy via GitHub OIDC).                                                                                                            |
| `.claude/settings.json`            | Committed permissions allow-list.                                                                                                                                                                                       |
| `.claude/local/`                   | Working files (plans, scratch pad). Gitignored here; a symlink into Chris's HQ.                                                                                                                                         |

Reserved, not yet created: `src/ui/tokens/` and `src/ui/{atoms,molecules,organisms}/` (Phase 3b design system); `src/sections/` (Phase 3c long-scroll sections, each composing `ui/` + `features/`).

## Code conventions

**General.** TypeScript, strict; no JavaScript source files; fix types rather than casting around them. Framer Motion for animation, respecting `prefers-reduced-motion` in anything new. British English in visible copy, comments and docs; no connector em-dashes in visible copy. Works at phone width with no horizontal scroll. Keep what works working: the CV-request form flow and the theme must not regress. Don't edit SST-generated files or anything under `.sst/`.

**Where things live.**

- `app/` is app-wide wiring, not a feature; it may import anything.
- `features/<kebab-name>/` holds one concern end to end. Inside a feature use relative imports; from outside, import only via the feature's `index.ts` (today: terminal → cv-request, theme; cv-request → theme).
- `ui/`, `hooks/` and `lib/` never import from `app/` or `features/`. Documented exceptions until 3b moves the theme into design tokens: `hooks/useToast` and `ui/KeyboardButton` read `features/theme`.
- A feature may read `app/ActiveContentContext` (the CV form's "Back To Terminal") until 3c retires it.
- No import cycles.

**Naming.** Components `PascalCase.tsx`, one component per file, named exports (no default exports). Hooks `useThing.ts` (`.tsx` only when they contain JSX). Helpers `camelCase.ts`. Constants `UPPER_SNAKE`. Feature folders kebab-case. Tests colocated as `Thing.test.tsx`. Prefer string-literal unions to enums in new code (`ThemeMode` and `ScreenSizeBreakPoint` stay until 3b).

**Imports and aliases.** `@/` points at `src/`; use it across folders, and relative imports inside a feature.

**Components and hooks.** Props as an `interface ThingProps`. Logic lives in hooks; components render. No `window` reads during render in new code.

**Context and providers.** One context per concern, inside its feature: `ThingContext.ts` (the context, its value type, and a `useThing` hook that throws outside its provider) and `ThingProvider.tsx`. Memoise the provider value. Providers are composed only in `app/AppProviders.tsx`. Use context for app-wide state only; pass props otherwise.

**Styling.** Tailwind with the theme colours from `tailwind.config.ts` (backed by CSS variables) rather than raw hex, so light and dark keep working. Use `cn` for conditional classes in new code. Don't retrofit `cn` onto existing class strings: `tailwind-merge` drops conflicting classes and can change rendering. Tailwind scans everything under `src/` (tests included), so class-like words in comments can generate CSS.

**Tests.** Vitest + Testing Library. Test behaviour, not snapshots. Render through `renderWithProviders` (from `@/test/renderWithProviders`). Mock `fetch` with `vi.stubGlobal`, env with `vi.stubEnv`; `src/test/setup.ts` restores both after each test. Test fixtures use neutral data (`Ada`, `ada@example.com`).

## Known issues

- **CV form spins forever on a network failure.** When the fetch to `VITE_CHRIS_API` rejects, the form shows the error toast but leaves the CV-request status at `"loading"`, so the Submit button stays a spinner and can't be retried without a reload. Pinned (user-visible parts only) by `stays on the form when the request fails` in `src/features/cv-request/CVRequestForm.test.tsx`; to be fixed in a later phase.
- **Dark only.** The lightbulb theme toggle is deliberately commented out in `src/app/App.tsx`; light mode is reachable only through `setThemeMode`.

## Anonymisation rule — portfolio content

This site is public and will describe work Chris did through his employer. **Never name the employer's clients or vendors** in copy, alt text, image content, file names, commit messages or code comments. Describe work by what it does ("an AI concierge for a global automotive brand"), never who it was for. No real screenshots of client work. Chris's own products (e.g. Badass Burpees) and employers already on his public CV are fine.

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
