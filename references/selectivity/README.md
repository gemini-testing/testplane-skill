# Configure Testplane Selectivity

**Execution boundary:** read [interactive consent](interaction.md) first. Browser/heavy steps below require explicit user approval; start with configuration and lightweight offline checks.

Use this workflow to implement selectivity, not merely describe it. Work in the user's application. All links below are relative to this skill, not to the application directory. Do not read every variant.

## 1. Discover before editing

- Inspect the working tree and preserve unrelated changes. Identify the real application/workspace root, the command's working directory, existing Testplane config, tests, browser setup, server/build scripts, and screenshot reference locations.
- Identify the package manager and its pinned version from `packageManager`, lockfiles and parent workspace configuration. Preserve both the manager and lockfile ownership.
- Identify the actual bundler and framework from dependencies, imported configs and scripts. A dev server, a production build and a Storybook build may have different pipelines.
- Resolve the **installed** Testplane entry, package version and public declarations using the application's module resolution. A manifest version, lockfile URL or symlink name alone does not identify the running code. Do not silently replace it with the skill's CLI dependencies or a private local build.
- Inventory client JS/TS, CSS/preprocessor/component sources, backend/SSR/API/server-only modules, templates, static files, build configuration, dependency manifests, lockfiles and visual references. Follow imports and server routes, not just familiar folder names.

## 2. Read shared rules, then only matching variants

Always read [configuration](configuration.md), [global safety inputs](safety.md), and [acceptance](validation.md). Read the relevant part of [package managers](package-managers.md). Add only the applicable rows:

| Detected pipeline | Read |
| --- | --- |
| webpack | [webpack](bundlers/webpack.md) |
| Rspack or Rsbuild | [Rspack/Rsbuild](bundlers/rspack.md) |
| Vite, including its development server | [Vite](bundlers/vite.md) |
| esbuild | [esbuild](bundlers/esbuild.md) |
| Rollup | [Rollup](bundlers/rollup.md) |
| Parcel | [Parcel](bundlers/parcel.md) |
| Vue, particularly single-file components | [Vue](frameworks/vue.md) |
| Svelte | [Svelte](frameworks/svelte.md) |
| Storybook | [Storybook](frameworks/storybook.md) plus its underlying bundler |

Plain JS and ordinary React applications use the bundler recipe without an extra framework layer. Read [React](frameworks/react.md) additionally only for JSX/TSX mapping, runtime resolution or hydration issues. For an unlisted framework/bundler, inspect its installed version's documented source-map pipeline and apply the same acceptance criteria. Do not assume Next.js/Nuxt SSR files are tracked because some of their code also runs in the browser. Missing support requires an explicit blocked/unverified result with selective reads off, not invented API options or manual client-source guards.

## 3. Implement, check offline, then propose validation

1. Merge into existing config. Keep tests, server behavior, module format and package manager intact. Preserve production architecture except for the compatible direct-Rollup module-preservation, Parcel browser-app scope-hoisting, esbuild dependency-entry and webpack/Rspack module-concatenation overrides in their routes; disclose and validate those output changes. Repair the producer rather than globally guarding missing JS dependencies. Do not silently override an explicit unchanged-build requirement or incompatible delivery contract.
2. Configure genuine JS/CSS maps and deterministic paths to original sources. Keep map exposure limited to the test environment when deployment policy requires it.
3. Protect genuine global inputs using project-specific `disableSelectivityPatterns`, including backend code, build/config inputs, HTML, fonts and application images. Derive them from their role, not from empirically missing client edges. Exclude actual Testplane references from global invalidation, not from per-test dependencies.
4. Check syntax, installed API/path compatibility, audited patterns and available built JS/CSS maps without starting a build/server/browser. Record stale or absent artifacts and remaining uncertainty. If a map or dependency is missing, use [troubleshooting](troubleshooting.md), not an ad hoc global source guard.
5. Propose the next bounded heavy check and wait for explicit consent using [interactive consent](interaction.md). Only after that consent, use the agreed build/browser phases and a fresh dependency store to verify graph, warm skips, mutations, globals and references through [acceptance](validation.md). Do not launch the whole matrix on permission for cold/warm alone.
6. If tests are declined or not approved, deliver the configured changes and offline findings with the remaining runtime checks explicitly unverified. Do not weaken tests or declare missing client sources globally changed to claim completion.

## 4. Deliver

Leave a concise `SELECTIVITY.md` or update the project's existing documentation with:

- commands using its own package manager, mode/store overrides actually implemented in config, and the required build/server pipeline;
- the resolved Testplane artifact and browser used, plus exact files/configuration changed;
- an input classification table: per-test browser dependency, per-test reference, global input, or explicitly unresolved;
- completed static checks and the provenance of inspected maps;
- approved/executed cold/warm/mutation results, not-run phases, documented input-class policies and untested environments.

Distinguish **verified selective setup**, **safe but reduced precision**, and **configured, not browser-verified** or **blocked/unverified**. Reduced precision requires an explicit architectural policy, such as the documented Vite stylesheet-only policy, not a list of missing client files. If correctness is unproven, leave reading/skipping disabled (`WriteOnly` only if collection succeeds, otherwise `Disabled`); these modes do not authorize a run. Never describe a permanently full-run configuration as successful selective execution. Do not publish packages, send PRs, upload maps or alter unrelated project state without authorization.
