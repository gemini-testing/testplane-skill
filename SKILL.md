---
name: testplane-skill
description: Use when the user wants to configure Testplane Selectivity or селективность Testplane, write, debug, or inspect Testplane end-to-end/component tests, work with a Testplane HTML report, inspect Time Travel snapshots or captured network traffic, use Testplane CLI/MCP browser tools, or interact with a web app through Testplane.
---

# Testplane Skill

Testplane is a browser automation and test runner based on Mocha and WebdriverIO. Use this skill to inspect real browser state, debug failing reports, and write or fix Testplane tests using project conventions.

## Configure Selectivity

For requests such as "Set up Testplane Selectivity" or "Настрой Testplane селективность", start with [the selectivity workflow](references/selectivity/README.md) and its [interactive execution boundary](references/selectivity/interaction.md). Make configuration/static-check progress first, then propose browser/heavy validation and wait for consent. Acceptance is required for a verified claim, not permission to run. This task uses the project's Testplane installation and does not require the CLI initialization below unless browser exploration is also needed.

## Execution consent

Do not launch browser tests, browser exploration, builds, installs/downloads, servers or other heavy work without explicit user consent for that scope. First inspect available source/config/report/map files and perform known lightweight syntax/offline checks. When further confidence needs heavy execution, propose the actual commands, cost, side effects and cleanup, then wait. A request to configure or fix tests is not itself permission to run them. An explicit request for the same scoped run is consent, not a reason to ask twice.

This boundary applies to every command example below, including initialization and auto-launching CLI tools. Inspect scripts and lifecycle hooks before running anything. Use installed tools without implicit downloads. If the user declines or gives no consent, summarize completed work and unverified behavior without running, scheduling or delegating the pending commands. Follow the [detailed consent workflow](references/selectivity/interaction.md) for scope changes and retries.

## Initialization

Before running commands from this skill, resolve the directory that contains this `SKILL.md` and use it as `$SKILL_DIR`.

One-time setup, only if needed and installation is explicitly approved:

```bash
cd $SKILL_DIR && npm run setup
```

Quick check:

```bash
node $SKILL_DIR/scripts/index.js
```

Run `@testplane/cli` from `$SKILL_DIR` when possible to reuse the installed package:

```bash
cd $SKILL_DIR && npx @testplane/cli --help
```

## Core Rules

- Prefer the project's existing scripts, configs, helpers, page objects, fixtures, and custom commands.
- Prefer real selectors discovered from the app or report over guessed selectors.
- Prefer stable selectors: test ids/data attributes, semantic selectors, stable ids/names, then fallback CSS.
- Prefer `@testplane/cli snapshot` over screenshots. Use screenshots only for visual evidence.
- Do not use `browser.pause()` for test fixes. Wait for concrete page state, text, URL, element visibility/existence, or app-specific outcomes.
- Never read secrets, credentials, `.env` files, raw cookies, tokens, or private auth material unless the user explicitly provides them. Use existing auth helpers or browser state files.
- If the user provides a Testplane HTML report path or URL, inspect the report before changing tests.
- If command syntax is unclear, run `npx @testplane/cli --help` or `npx @testplane/cli <command> --help`.

## Browser Exploration With `@testplane/cli`

Use this when you need to see what the app renders, discover selectors, verify auth state, or understand behavior before writing/fixing tests.

```bash
cd $SKILL_DIR
npx @testplane/cli navigate http://localhost:3000
npx @testplane/cli click --role button --name "Save"
npx @testplane/cli snapshot
```

Useful commands:

- `navigate <url> --timeout 60000`: open a page, auto-launching a browser if needed.
- `snapshot`: capture a compact DOM snapshot; large snapshots are saved to a temp file.
- `click`, `hover`, `type`, `select`, `wait`: interact with real elements.
- `console`: read unseen browser console messages in Chromium-based sessions.
- `run-code`: execute Testplane/WebdriverIO code when no built-in command fits.
- `list-tabs`, `new-tab`, `switch-tab`, `close-tab`: work with tabs.
- `attach --session <json>`: attach to the browser JSON printed after a `--keep-browser` Testplane run.
- `--session-name <name>`: keep separate browser sessions for separate flows.

Exploration loop:

1. Navigate or attach to the relevant browser state.
2. Perform one focused action.
3. Capture a snapshot after meaningful state changes.
4. Use discovered selectors and visible behavior in the test.

Avoid `launch` unless custom browser config is needed. Normal commands like `navigate` auto-launch a browser.

## Debug From A Testplane Report

Use this workflow first when the user provides a local or remote Testplane HTML report. Remote report URLs are downloaded and cached automatically by the CLI.

```bash
cd $SKILL_DIR
npx @testplane/cli test-results <report> --status failed --fields name,status,browser,attempt,duration,file,error
npx @testplane/cli inspect-result <report> --name "full test name" --browser chrome --attempt 0
```

Report workflow:

1. List failures with `test-results`; add `--grep`, `--browser`, `--duration`, `--grep-error`, `--meta key=value`, or `--file` when needed.
2. Inspect the concrete result with `inspect-result` using exact `name`, `browser`, and optionally `attempt`.
3. Read status, error, steps, metadata, images, and attachments before editing code.
4. If the result has a Time Travel snapshot attachment, inspect it with `time-travel-snapshot`.
5. Only then decide whether the issue is test code, app behavior, auth/environment, timing, or visual baseline data.

For large result sets, save structured JSON:

```bash
npx @testplane/cli test-results <report> --status failed --save-json
```

## Inspect Time Travel Snapshots

Use `time-travel-snapshot` when a report includes Testplane Time Travel data or the user provides a snapshot zip. It replays the rrweb recording and returns a DOM snapshot at a selected time.

```bash
npx @testplane/cli time-travel-snapshot <report> \
  --name "full test name" \
  --browser chrome \
  --attempt 0 \
  --time 1400
```

Tips:

- The output lists test steps with offsets; use those offsets as `--time` values.
- Use `--diff-from <time>` to compare two points and focus on changed DOM nodes.
- Use `--include-attrs data-qa href class` or `--max-text-length 200` when the default snapshot omits useful detail.
- Use `--snapshot-file /path/to/snapshot.zip --time 100` when inspecting a snapshot directly.

This is especially useful when the browser reached a broken state during a test and the live session is gone.


## Debug Network Requests

Use `network-list` to find the request, `network-inspect` to see its full URL, headers, status, failure details and available timings, and `network-body` when you need the captured payload. The CLI and MCP use the same tool names. Check that the installed CLI lists `network-list` in its help. With a built `testplane-ai` checkout, use `node /path/to/testplane-ai/packages/cli/build/cli.js` in place of `testplane-cli` below.

**Live browser.** Launch or attach to a Chromium session with CDP available, then reproduce the action. Capture starts when the CLI or MCP opens or attaches to the session. Use the request ID from the list in that same session.

```bash
testplane-cli network-list --type fetch,xhr --errors
testplane-cli network-inspect 7
testplane-cli network-body 7
```

`--errors` includes HTTP 4xx/5xx responses and network failures. For an unexpected success response, narrow the list with a URL substring such as `--url /api/orders` or a method such as `--method POST`. List and inspect accept `--json`. Body returns the response by default. Use `--request` for the submitted payload and `--output <path>` for binary data. URLs and bodies can contain secrets even when sensitive headers are masked.

**Saved report.** Select the exact test name, browser and attempt from `test-results`. Repeat the same source options for list, inspect and body. Without `--attempt`, the CLI selects the latest attempt, which may be a passing retry.

```bash
testplane-cli network-list --report ./html-report --name "Checkout submits order" --browser chrome --attempt 0 --errors
testplane-cli network-inspect 7 --report ./html-report --name "Checkout submits order" --browser chrome --attempt 0
```

For a snapshot ZIP, use `--snapshot-file ./snapshot.zip` in place of the report options.

To capture network data in a Chromium test report, use Testplane 9.6.0+ with the `html-reporter` plugin 11.18.0+ enabled. Set `timeTravel: { mode: "on", network: true }` in the Testplane config, or add `network: true` to your existing active Time Travel mode.

## Debug With Testplane REPL

REPL mode is useful when a running test has already driven the browser into the interesting state. It keeps you inside the project runtime, so agents can use existing page objects, custom commands, fixtures, and helpers instead of rebuilding behavior from raw selectors.

Attach to an existing Testplane REPL session:

```bash
cd $SKILL_DIR
npx @testplane/cli attach-repl --port 4444
```

Only two CLI actions are currently supported in REPL sessions:

```bash
npx @testplane/cli snapshot
npx @testplane/cli run-code "await browser.getUrl()"
```

Use `run-code` for project-aware snippets, for example calling helpers already loaded by the test process. Other interaction commands such as `click`, `type`, and `wait` are not supported in REPL mode yet.

## Handle Auth Safely

Prefer existing login helpers or fixtures. When a reusable browser state is needed, use `save-state` and `restore-state` instead of reading secrets.

```bash
cd $SKILL_DIR
npx @testplane/cli save-state ./tmp/auth-state.json
npx @testplane/cli restore-state ./tmp/auth-state.json
```

Notes:

- State can include cookies, localStorage, and sessionStorage.
- The command output reports counts, not cookie values.
- The saved file can contain real auth material; do not print it, commit it, or inspect it unless the user explicitly asks.
- Use options such as `--cookies false`, `--local-storage false`, or `--session-storage false` to save only what is needed.
- `restore-state` refreshes the page by default so app code observes restored state.

## Run And Fix Existing Tests

First inspect the test, helpers and any existing report. Propose the narrowest reproducible command and run it only within the user's approved scope. The examples below are not launch permission.

```bash
npx testplane --grep "Check search field presence"
npx testplane tests/login.testplane.ts
```

If `package.json` has scripts, prefer them:

```bash
npm run test:e2e -- --grep "Check search field presence"
```

Checklist:

1. Find the smallest command that reproduces the issue.
2. Read the test and nearby helpers/page objects/fixtures.
3. If a report is available, inspect it first.
4. If browser behavior is unclear, use CLI snapshots or REPL.
5. Replace sleeps and guessed selectors with explicit waits and discovered selectors.
6. Separate test bugs, app bugs, visual baseline issues, auth state, and environment failures.

If the app only reaches the interesting page during the test, run with `--keep-browser` when available, then attach to the printed browser session JSON:

```bash
npx @testplane/cli attach --session '{"sessionId":"...","capabilities":{...}}'
npx @testplane/cli snapshot
```

## Write New Tests

Before writing from scratch, inspect existing sources/reports. Propose real-app exploration when it is needed, and use the browser steps below only with consent.

1. Identify project scripts, config, browser setup, and local app startup.
2. Open the target route with `@testplane/cli`.
3. Capture snapshots and choose selectors deliberately.
4. Reuse existing helpers, page objects, auth, cleanup, and assertion patterns.
5. Assert observable user outcomes rather than implementation details.
6. Keep the test deterministic with explicit waits.

Visual tests:

- Use `assertView` only when the behavior is visual.
- Stabilize animations, loading states, and dynamic content before capture.
- Prefer DOM assertions when visual coverage is not required.
