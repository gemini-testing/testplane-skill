# Acceptance: prove the setup, not just the config

**Execution boundary:** read [interactive consent](interaction.md) first. This checklist defines evidence, not automatic execution permission.

Run these build/browser phases only after explicit user consent for their scope. First complete the available static checks and propose the next necessary phase. If consent is absent, stop with a configured/unverified summary rather than executing this checklist. Use real project build and public Testplane CLI commands in new processes for approved phases. Never replace the collector, emit fake CDP events, or use the setup agent's expectations as the only oracle. Verify with installed code and observable app behavior.

## Plan before collecting

Record all expected test identities and original source files from app/test behavior, including entry/shared modules, private features, lazy modules, CSS and component files. Identify an unused source and which tests own each used source. Classify every global input from [safety](safety.md) and record the actual screenshot-reference paths.

Record resolved Testplane path/version/artifact, package-manager version and actual browser capabilities. Keep baseline source/config/lock hashes. Preserve user changes, use a new empty dependency-store directory for the experiment, and keep evidence outside watched source/static directories.

## Cold and warm

Example for a project whose config implements the controls in [configuration](configuration.md), with npm scripts named `build` and `test`:

```sh
npm run build
SELECTIVITY_MODE=write-only SELECTIVITY_DIR=/absolute/new/store \
  SELECTIVITY_REPORT=/absolute/evidence/cold.json npm run test
SELECTIVITY_MODE=enabled SELECTIVITY_DIR=/absolute/new/store \
  SELECTIVITY_REPORT=/absolute/evidence/warm.json npm run test
```

Use the user's manager and scripts, not these names blindly. No test-selection arguments. For development servers use their actual pipeline instead of pretending a production build was exercised.

1. Cold run must finish successfully and execute the **entire intended nonempty suite**.
2. Inspect per-test dependencies and verify original app files in the **browser** graph, not merely test imports or `sourcesContent`. If stored dumps merge scopes, temporarily use the public dependency mapper to record `scope`, `reason` and `relativePath` without changing its return value. Remove or disable diagnostic output after verification.
3. The new-process warm run must skip the expected unchanged tests. Check the public selective report's `totalProcessedCount`, `totalSkippedCount` and per-browser counts against real test identities. Exit 0, no tests found, a stale report, or tests disabled by CLI filters are not a successful warm run.
4. Apply the phase/evidence matrix below. Use a new, initially absent report path for every phase. Never reuse an older report as evidence for the current process.

| Phase | Selective report | Required execution/state evidence |
| --- | --- | --- |
| `Disabled` semantic control | No selective evaluation report is expected | Actual full test results and semantic observation; no dependency/state writing is expected |
| `WriteOnly` cold | May be absent: this path does not evaluate selective skips | Actual test events/results cover the entire intended suite; fresh per-test dependencies and finalized hashes exist, with no state-save warnings |
| `Enabled` cold or global-input control with browser-wide bypass | May be absent for the bypassed browser; a multi-browser report can contain only the other evaluated browsers | Actual full test identities/results, bypass reason (for example changed global pattern), and successful dependency/state saving in write-capable mode |
| `Enabled` cold without that bypass | Can contain evaluated counts even when every test runs | Actual full suite and fresh dependencies/hashes; distinguish evaluated from executed counts |
| Unchanged read-mode warm, including final default-enabled warm | **Fresh native report required**, with expected total/per-browser processed and skipped counters | Expected unchanged identities skip; no filters, unexpected bypass, stale report or state errors |

Browser-wide bypass is not a property of **every** `Enabled` cold. In the inspected
installed 9.3.7 runner it returns before accumulating selective statistics, and an
old report is not removed. Mixed-browser counts can therefore be partial. Reporter
`pending`/console totals are not selective-skip counters and cannot replace the warm
report. Conversely, do not fail a successful global full-run solely for absent skip
statistics. Exit 0 without successful state saving still does not create a baseline.

## Independent mutations

Freeze a copy of the successful cold store as **B0**. Before **each independent** mutation restore B0, ensure original app bytes, and start fresh processes. Do not let an earlier successful mutation rebuild the dependency graph for the next one. Rebuild after source changes and verify changed app bytes/UI. Restore the source immediately after each experiment. The bounded comment B1 and separate fixture baseline below have distinct purposes. Neither permits chaining unrelated mutations.

| Change | Required result |
| --- | --- |
| Each used client module, including entry/shared/lazy code | Every necessary owner runs, regardless of conservative extra owners |
| Private JS and CSS | Their owners run; compare actual selections, not just exit status |
| Shared JS and CSS | All necessary owners run |
| Unused JS/CSS | No owner runs, except the explicit stylesheet-only policy in the Vite production route; missing JS edges never justify a new global guard |
| Vue/Svelte component behavior/style | Actual semantic change is observed and its owners run; missing component edges block the integration rather than become manual global guards |
| Server/API/SSR code or server template | All tests run |
| Application HTML, font and image | All tests run, independently for each category |
| Dependency manifest, actual workspace lockfile, Testplane/build config | All tests run |
| Add/delete a global file, including last file in an optional directory | All tests run; a deleted-only pattern must not leave the store silently stale |
| Existing Testplane reference PNG | Its owning visual test runs, but global patterns do not match it |

Use existing assets where possible. In an authorized disposable copy, include a new HTML/font/image and server fixture when a category is absent, so that future additions and deletions are exercised. Do not invent passing claims for categories not tested.

At least one JS/component mutation must change the asserted UI, and a CSS mutation must change a checked computed style or screenshot. Comments can test content-hash invalidation, but are not enough to prove a semantic source-to-test relationship. A deliberate assertion failure after a mutation is correct if the necessary test ran. Record that separately from a tool/infrastructure failure.

### Absent-category deletion: separate fixture baseline

In an authorized disposable copy, a missing category may need a temporary fixture
before its deletion can be tested. Start from B0 with exact original app/test bytes
unchanged and add only that fixture. This is separate from comment B1, not a new
baseline for unrelated learned mutations.

1. Use a separate empty store and a fresh `WriteOnly` process for **B_fixture**.
   Require successful full-suite execution and state saving. Compare its
   original-owner graph with B0; fixture/global hashes may differ. Freeze the cold
   store and exact fixture bytes. Prove an unchanged new-process warm on a restored
   copy with fresh native processed/skipped counters.
2. Before **each independent deletion control**, restore the exact fixture bytes
   and frozen B_fixture, keeping original sources/tests unchanged. Delete only the
   intended fixture file or directory, rebuild normally and verify the required
   owners/full fallback, state saving and original-owner graph against B0.
   Never use a learned deletion store for another control.
3. After controls, remove only your fixture, restore exact original inputs and B0,
   verify hashes and require fresh restored warm skips before other mutations.

Deleting the last style in a fixture directory is a live directory control, not
proof of deleting the last selected style across all roots. Do not delete imported
sources to manufacture that case. Label isolated pattern all-selected-roots checks
**synthetic-only**, not application build/browser acceptance.

### Comment add, warm, remove: directional baseline

For each stylesheet class, keep the producer's normal warm cache:

1. Restore B0 and original bytes H0. Add only a comment, producing H1, rebuild and
   run unfiltered in a new write-capable process. Verify required owners execute,
   collection succeeds and the original-owner graph equals B0 (hashes may differ).
2. Freeze that successful comment-added store as **B1**, with H1 and the same
   owner graph. An unchanged new-process warm against B1 must skip with fresh counters.
3. Remove the comment back to exact H0, rebuild normally and run from B1. Verify
   required owners execute again, collection succeeds and the graph still equals B0.
   Restoring B0 **before removal** would compare H0 with H0 and would not test removal.
4. Restore exact original bytes and B0 before any other independent mutation.
   Check restored warm skips and the final configuration's cold/warm as usual.

Keep B1 only for this reverse transition. Record source/store hashes, asset/map
identities and owner graph comparisons in both directions. See [Parcel](bundlers/parcel.md)
for why unchanged generated bytes do not imply unchanged original CSS.

### Observe the original semantic response

If an existing assertion merely checks that a CSS value exists, preserve it and
observe the **original command response**, not another browser read. At the project's
existing command-response seam, a small wrapper can record a correlated invocation:

<!-- snippet: passive-style-response -->
```js
async function observeStyleResponse(original, context, record) {
  // context is project-owned invocation metadata, captured before awaiting.
  const { runId, testId, sessionId, elementId, property } = context;
  const response = await original(); // the existing getCSSProperty call, exactly once
  record({ runId, testId, sessionId, elementId,
    command: 'getCSSProperty', property, response });
  return response; // preserve the original result and assertion
}
```

This is a project-side adapter, not a Testplane hook/API. Wire `original` to the
already-intercepted invocation, not a second call. Record the exact property/element,
test, attempt/run and session before dispatch and compare its real value between
baseline and semantic mutation. Use per-invocation correlation, not a single global
"current test" across parallel sessions. Keep recorder errors visible and evidence
outside watched inputs. Check observer-on/off behavior and lifecycle, then remove
diagnostics and repeat final default cold/warm.

An extra `browser.execute` in `SESSION_END` is **additional active diagnostics**, not
passive response observation. If no original style/screenshot read can supply the
semantic evidence, separately authorize diagnostics, disclose timing/interference
and compare with the uninstrumented run, or report semantic proof unmet. Never add
browser actions solely to manufacture coverage. Served-map HTTP audits are separate
from both semantic observation and native browser dependency ownership.

For references, use a real `assertView` test and its configured reference location where available. Preserve the `testplane-assert-view-reference` mapping. Mutate a backed-up valid reference in a disposable copy without approving a new baseline, verify its owner runs, then restore exact bytes. If no visual tests exist, verify mapper/pattern exclusions structurally and say the visual runtime case was not exercised.

## Restore and close the loop

Restore all modified inputs exactly, confirm their hashes, rebuild, then repeat cold/warm against the **final** configuration. Ensure no test assertion, package manager, bundler or reference baseline was silently changed to obtain a pass. Remove only your own temporary state/processes. Never delete the user's existing caches or reference images.

Keep the commands, exit codes, counts/identities, inspected dependencies, semantic observations and restoration hashes in a local report. Do not commit bulky dumps, browser profiles or credentials. The final summary must distinguish:

- **Verified selective setup:** mapped input ownership and global safety controls passed.
- **Safe but reduced precision:** a documented architectural input-class policy, such as Vite's standalone styles, is globally invalidated with a real full-rerun control. Warm unchanged runs still skip. This is not a list of empirically missing client files.
- **Configured, not browser-verified:** user consent was not given or covered only part of the workflow. Report completed static checks and unexecuted phases, not a failed user decision or a verified runtime result.
- **Blocked/unverified:** missing maps/dependencies, unavailable browser, failing baseline, unresolved artifact or no real mutation proof. Leave reading off rather than claim completion.

Neither a synthetic glob unit test nor a successful map audit replaces this browser acceptance. Both are useful additional checks. Do not claim an unknown framework or package-manager mode is supported just because a related project passed.
