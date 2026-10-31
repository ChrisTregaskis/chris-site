# chris-site — the charter

This file orients any Claude session that opens this repo. Read it first, then `CLAUDE.local.md` (gitignored, machine-local) for the scratch pad, HQ sync rule and the named anonymisation list.

## What this is

Chris Tregaskis's portfolio site, served at `chris-tregaskis.uk` (with `www.` redirecting). A single-page React app: a typing-terminal hero, an About panel, a theme toggle (lightbulb) and a CV-request form that posts to a separate Lambda (`VITE_CHRIS_API`). It is the proof link every freelance cold email points to, so what ships here is public-facing.

It was built in a hurry from a starter template (credit in `README.md`) and has few deliberate patterns yet. A refresh is planned in phases (see Roadmap); until Phase 3 lands, keep changes small and in the style of what is there.

## Stack

- Vite 5, React 18, TypeScript (strict), Tailwind 3, Framer Motion 11, `clsx` + `tailwind-merge`, `react-toastify`.
- pnpm (lockfile is `pnpm-lock.yaml`; `pnpm-workspace.yaml` only carries `onlyBuiltDependencies`).
- Hosted on AWS via SST v3: one `sst.aws.StaticSite` (`ChrisSite`) plus an `sst.aws.Bucket`, region `eu-west-2`, defined in `sst.config.ts`. The `production` stage is protected and retained on removal.
- ESLint 8 with `eslint-config-kentcdodds`; Prettier with `prettier-plugin-tailwindcss`.

## Commands

| Command                | What it does                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies. Non-interactive shells need `CI=true` if pnpm wants to rebuild `node_modules`.                              |
| `pnpm dev`             | Vite dev server. The CV form needs `VITE_CHRIS_API` set to work locally.                                                          |
| `pnpm build`           | `tsc && vite build` → `dist/`. This is also the typecheck gate.                                                                   |
| `pnpm typecheck`       | Typecheck only (`tsc --noEmit`; covers `src/`). Runs in CI.                                                                       |
| `pnpm lint`            | ESLint over the repo, `--max-warnings 0`.                                                                                         |
| `pnpm format`          | Prettier, writes in place.                                                                                                        |
| `pnpm preview`         | Serve the built `dist/`.                                                                                                          |
| `pnpm sst:dev`         | `sst dev` with `AWS_PROFILE=chris`. Needs Chris's AWS credentials.                                                                |
| `pnpm sst:deploy:prod` | `sst deploy --stage production` with `AWS_PROFILE=chris`. Chris's manual fallback only — not Claude's to run, and not used by CI. |

`pnpm lint`, `pnpm typecheck` and `pnpm build` must all pass before anything is committed. CI (`.github/workflows/ci.yml`) runs the same three on every pull request and push to `master`. Node version is pinned in `.nvmrc`; pnpm in `packageManager`.

## Repo layout (as it stands today)

| Path                                           | Holds                                                                                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`, `src/main.tsx`                  | Entry and top-level layout.                                                                                                                                               |
| `src/components/`                              | Flat folder of components: `Terminal`, `TerminalLine`, `Typewriter`, `About`, `Button`, `Icon`, `ToolTip`, `KeyboardButton`, `CopyCode`, `Pin`, and `RequestResumeForm/`. |
| `src/context/`, `src/providers/`, `src/hooks/` | React context per concern (theme, active content, CV request), its provider, and the hook that reads it.                                                                  |
| `src/styles/globals.css`, `src/index.css`      | Global styles and the CSS custom properties the theme uses (`--bgColor`, `--textColorPrimary` and friends, mapped in `tailwind.config.ts`).                               |
| `src/utils/`                                   | Small helpers (e.g. `cn` over `clsx` + `tailwind-merge`).                                                                                                                 |
| `src/sst-env.d.ts`, `sst-env.d.ts`             | Generated by SST. Do not edit.                                                                                                                                            |
| `sst.config.ts`                                | The AWS infrastructure.                                                                                                                                                   |
| `public/`                                      | Static assets.                                                                                                                                                            |
| `.github/workflows/`                           | `ci.yml` (lint, typecheck, build) and `deploy.yml` (manual production deploy via GitHub OIDC).                                                                            |
| `.claude/settings.json`                        | Committed permissions allow-list.                                                                                                                                         |
| `.claude/local/`                               | Working files (plans, scratch pad). Gitignored here; a symlink into Chris's HQ.                                                                                           |

The `@/` import alias points at `src/`.

## Conventions to follow now

- **TypeScript, strict.** No JavaScript source files. Fix types rather than casting around them.
- **Tailwind for styling.** Use the theme colours from `tailwind.config.ts` (backed by CSS variables) rather than raw hex, so light/dark keeps working. Compose classes with the `cn` helper.
- **Framer Motion for animation.** Respect `prefers-reduced-motion` in anything new.
- **British English** in visible copy, comments and docs. No connector em-dashes in visible copy.
- **Keep what works working:** the CV-request form flow and theme switching must not regress.
- **Works at phone width.** Chris often checks on his phone; no horizontal scroll.
- Don't edit SST-generated files or anything under `.sst/`.

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
