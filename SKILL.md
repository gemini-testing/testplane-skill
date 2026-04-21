---
name: testplane-skill
description: Use when the user wants to write or debug tests on web apps and has testplane installed in project, when needs help with a Testplane project or to interact with a browser. Open URLs, interact with pages, see what's happening in the browser by taking efficient DOM snapshots or taking screenshots, do anything you can do in the browser.
---

# Testplane Skill

Testplane is a browser automation and end-to-end/component tests runner. It uses mocha interface and WebdriverIO to interact with browsers.

## Mandatory Initialization

CRITICAL - Path Resolution: This skill can be installed in different locations. Before running any commands from this skill, determine the actual directory that contains this `SKILL.md` file and use that path as `$SKILL_DIR`.

Common installation locations:

- `~/.claude/plugins/marketplaces/testplane-skill/`
- `~/.claude/skills/testplane-skill`
- `<project>/.claude/skills/testplane-skill`
- `~/.codex/skills/.system/testplane-skill`

One-time setup:

```bash
cd $SKILL_DIR && npm run setup
```

Quick installation check:

```bash
node $SKILL_DIR/scripts/index.js
```

## Mandatory Rules

- If you need web exploration ALWAYS prefer using @testplane/cli's `navigate`+`snapshot`, NOT built-in browser automation commands and NOT fetching page via curl. @testplane/cli's snapshots are more compact and provide more context.
- Always try to run @testplane/cli commands from the skill directory, not from the project root, e.g. `cd $SKILL_DIR && npx @testplane/cli navigate http://localhost:3000`. This is to avoid downloading the package over and over again.
- When using @testplane/cli for web app exploration, prefer DOM `snapshot` command over `screenshot`. Use screenshots only when the user explicitly asks for one or when visual evidence is necessary and a DOM snapshot is not enough.
- Avoid `browser.pause()` when writing and fixing tests. Use explicit waits for concrete page states, elements, text, URL changes, or network-independent outcomes.
- Since Testplane is based on WebdriverIO, most WebdriverIO browser and element commands work in Testplane too. Reuse that knowledge, but follow the project's existing patterns first.
- Prefer real selectors discovered from the running app over guessed selectors.
- Prefer stable selectors: dedicated test ids or stable data attributes first, semantic selectors second, ids or names next. Avoid brittle CSS chains and positional selectors unless there is no better option.
- Reuse existing project helpers, page objects, custom commands, and fixtures instead of bypassing them.
- Never read secrets, credentials, `.env` files, cookies, tokens, or private auth material directly unless the user explicitly provides them for the task. Default to existing auth helpers, saved state, or a user-provided safe path.
- Before writing a new test, explore the app first whenever possible. If the user did not provide a URL or a reproducible route, ask for it.

## Workflow: Explore A Web App With `@testplane/cli`

Use this workflow when you need to inspect what is happening in the browser before or during test work. This is especially useful for debugging selectors, understanding page structure, checking auth state, and observing what the app renders after actions.

Principles:

- Prefer exploration before writing a test from scratch.
- Avoid `launch` unless the user explicitly wants a custom browser configuration. Browsers are usually launched automatically by normal CLI commands like `navigate`.

Basic examples:

```bash
npx @testplane/cli navigate http://localhost:3000
npx @testplane/cli click '[data-testid="settings"]'
npx @testplane/cli snapshot
```

Useful exploration loop:

1. Navigate to the relevant URL or attach to an existing session.
2. Perform one action at a time: click, hover, type, or wait.
3. Capture a snapshot after meaningful state changes.
4. Use the discovered structure and selectors to guide debugging or test authoring.

If command syntax or options are unclear, inspect the current CLI:

```bash
npx @testplane/cli --help
npx @testplane/cli click --help
```

## Workflow: Run And Debug Existing Tests

Use this workflow when the user asks to fix a failing test or understand why a test is unstable.

To run a concrete test, use: `npx testplane --grep "Check search field presence"`.

If user has scripts in package.json, use them instead, for example: `npm run test:e2e -- --grep "Check search field presence"`.

To run the whole file, use: `npx testplane tests/login.testplane.ts`.

Checklist:

1. Find the narrowest project command that runs the relevant test or suite.
2. Read the test file and any nearby helpers, page objects, fixtures, or commands it depends on.
3. Reproduce the failure with the smallest possible scope.
4. Determine whether the issue is caused by the test, the app, auth state, environment setup, or timing assumptions.
5. If browser behavior is unclear, inspect the live page through `@testplane/cli`.
6. Replace sleeps and guesswork with explicit waits and concrete assertions.

Debugging guidance:

- Always prefer running one file, one suite, or one test over the entire project unless broader context is required.
- If the app only reaches the interesting page after test code runs, use `--keep-browser` and then attach with `@testplane/cli` to inspect the exact browser state left by the test.
- When a failure is timing-related, wait for something real: element existence, visibility, text, URL, request-independent UI state, or a stable assertion target.
- Separate environmental problems from product bugs. A broken local app, missing browser dependency, or expired auth state is different from a bad selector or a bad assertion.

## Workflow: Write New Tests

Use this workflow when the user asks to add coverage or implement a new test case.

Always try to open the app first with `@testplane/cli` and explore the page before writing a test, to gather enough context.

Checklist:

1. Explore the real app first with `@testplane/cli` whenever possible.
2. If the user did not provide a URL or route, ask for it.
3. Reuse the project's existing helpers and conventions.
4. Use real selectors discovered from the app.
5. Prefer assertions on observable user outcomes over implementation details.
6. Use explicit waits where needed, not `browser.pause()`.

Writing guidance:

- Codestyle MUST match nearby tests in the same area of the codebase.
- Reuse login, navigation, state, and cleanup helpers if the project already has them.
- If project uses page objects, use them instead of writing raw selectors.
- Keep tests deterministic: avoid assertions that depend on arbitrary timing or unstable page structure.
- Since Testplane is based on WebdriverIO, most WebdriverIO commands will work in Testplane too. Use that when it matches the project's existing style.
- When in doubt, prefer arrange-act-assert pattern, clearly separating test structure and keeping tests simple and readable.

## Recipes

### Understanding Project Setup

- Detect the package manager and inspect `package.json` scripts, looking for `testplane`, `hermione`, `e2e`, `test` scripts.
- Find Testplane config files, by default it's `testplane.config.*`, `.testplane.conf.*` or `.hermione.conf.*` or what is referenced from package.json.
- Check whether Testplane is installed in the project.
- Determine how the application under test is started locally.
- Identify browser configuration, `gridUrl`, local versus remote browser usage, and any required dependencies.
- Look for legacy references to Hermione because older projects may still use that name in scripts, folders, or helper code.
- Prefer the project's own scripts over hand-written one-off shell commands.

### Handle Auth Without Reading Secrets

- Look for existing login helpers, fixtures, `saveState`, and `restoreState`.
- Reuse the project's established auth flow before inventing a new one.
- Do not open secret files just to obtain credentials.
- If auth cannot be reproduced safely from project helpers, ask the user for a safe route or a non-sensitive reproduction method.

### Inspect A Post-Login State Before Finishing A Test

Use this when the project already performs login in `beforeEach`, helper code, or fixtures, and you need to inspect the authenticated page before completing the test.

Recommended approach:

1. Run the specific test with Testplane using `--keep-browser`.
2. Let the test drive the browser through login and into the relevant page state.
3. Attach to that browser session with `@testplane/cli attach`.
4. Explore the page with `snapshot`, `click`, `type`, `wait`, and other focused actions.
5. Use what you learned to finish or fix the test.

Example prompt pattern:

```text
Run the test "should be able to change settings" with Testplane using --keep-browser, then attach to the browser with @testplane/cli and inspect the page before completing the test.
```

### Choose Selectors Deliberately

Prefer selectors in this order:

1. dedicated test ids or stable data attributes
2. stable semantic selectors or stable visible text when appropriate
3. stable ids or names
4. fallback CSS selectors only when better options are unavailable

Avoid brittle descendant chains, positional selectors, and selectors tied to incidental styling.

### Use Visual Tests Intentionally

- Use `assertView` when the task is really about visual regressions or rendering differences.
- Do not default to visual checks when a DOM assertion is enough.
- If the page contains animations, skeletons, or delayed rendering, stabilize the page first before capturing the visual assertion.
