# Interactive execution boundary

Read this before following any command or acceptance recipe. It applies to all Selectivity routes. A recipe describes how to validate, not permission to launch work.

## 1. Make progress without heavy execution

Start with the requested configuration edits and bounded, non-browser checks:

- Read existing config, scripts, lockfiles and installed declarations/runtime as files. Resolve actual paths and identify the producer, inputs and working directory. Do not import or evaluate application config merely to inspect it: imports, plugins and hooks may start processes or write state.
- Use syntax checks and known lightweight offline checks whose command and hooks you have inspected. Do not let a test script name hide integration tests, a build, install, server or browser launch.
- Inspect existing JS/CSS artifacts and source maps on disk: linked/inline annotations, valid JSON and mappings, original paths, source content and transform chain. Record their provenance and whether they predate the configuration edits. Old artifacts cannot validate a new build configuration. If there are no suitable artifacts, record the gap rather than build automatically.
- Audit global input/reference classification, patterns and mapper logic without manufacturing browser dependencies. A map can establish plausible mapping, not actual coverage, owners, skips or UI behavior.

Do not start project builds, dependency installation/downloads, dev/static servers, browser tests, browser exploration, repeated mutation matrices or other heavy operations without explicit user consent. This includes background jobs, CI, remote execution and delegated workers. An implicit install from a package-manager run is still an install. Inspect lifecycle hooks and launcher policy first; an uncertain side effect belongs in the proposal, not in a trial command.

## 2. Stop at the confidence boundary and propose the next check

When further meaningful confidence needs heavy work, explain what is already checked, what remains unknown and why the next check is needed. Do not run a small browser smoke test first merely to justify asking for a larger one.

Propose a bounded plan with:

- the actual command(s), working directory, manager and environment/profile;
- scope: build-only, cold/warm browser tests, or a specified mutation set;
- expected time/resource use (say when unknown), any server/browser/download activity;
- temporary files, input mutations and backup/restore/cleanup responsibilities;
- the result the check can establish and any requirements it will leave unverified.

For example, adapt this to the actual project rather than copying invented commands:

> Configuration and available JS/CSS maps pass the offline checks. Actual dependency ownership and warm skips remain unverified. The plan above lists the exact commands, time estimate, separate store and cleanup. May I run that build and the full browser suite twice, once cold and once warm? Source-mutation experiments are not included unless we also agree on their scope.

Wait for explicit user consent covering the proposed operations. A generic request to configure/fix Selectivity, a tool permission, an old grant for a different attempt, or this skill's acceptance checklist is not consent. An explicit user request to run the same clearly scoped commands can provide consent, so do not ask the same question again. Resolve ambiguity before running.

A build-only approval does not authorize browser tests. Cold/warm approval does not authorize a large mutation campaign, installation, CI or production-profile experiments. If prerequisites, commands, side effects or scope materially change, propose the change and wait again. If a command failed, preserve its evidence and diagnose without heavy work; retry only within an explicitly approved retry budget or after new consent.

## 3. After consent, run only the agreed scope

Follow [validation](validation.md) and the matching variants for the approved phases. Preserve original tests, real maps and independent mutation baselines. Do not weaken acceptance to fit a partial run. Restore only your changes and clean up only your owned processes. Stop on an unexpected installation, mutation or unknown cleanup state rather than widening the task automatically.

The full validation checklist remains the evidence required for a fully verified claim. It is not a demand that the user authorize it all. Record which phases were approved, executed, passed, failed or not run. Successful static checks, a build, cold/warm alone and an incomplete mutation matrix are distinct levels of evidence.

## 4. If the user declines or does not answer

If the user declines, or does not answer the proposal, do not run the pending commands. Give a useful summary of edits, completed non-browser checks, confidence limits and exact optional next steps. Do not repeatedly ask, schedule an automatic retry or delegate the blocked work.

Label the result **configured, not browser-verified**, not a verified selective setup. Keep selective reads off: `Disabled` when collection safety has not been established, or `WriteOnly` when collection is already known to succeed. Neither mode is permission to launch tests. Do not automatically enable reads based on maps alone. Preserve an existing user's mode unless changing it is within the task's scope; if an existing enabled setup is unsafe or unverified, explicitly report that and propose the safe mode rather than silently certifying it.

## Missing client edges are not global inputs

Follow [global input classification](safety.md). Repair the producer/mapping/collection path or report the integration blocked. Do not use an empirically missing client file as a new global guard. Genuine server/build/config inputs and the explicitly documented stylesheet-only production Vite policy are separate, identified input classes, not an escape hatch for an incomplete client JS graph.
