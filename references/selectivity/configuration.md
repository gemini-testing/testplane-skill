# Shared configuration

**Execution boundary:** read [interactive consent](interaction.md) first. Config snippets do not authorize builds, installs or browser tests.

Read after discovering the project. Merge this into its existing Testplane config, preserving its module syntax, sets, browsers, plugins, hooks and dev server. Paths are relative to the actual runner working directory unless the installed API says otherwise.

## Modes and storage

Use `SelectivityMode` from the project's `testplane`. Supported values in the inspected API are `false`, `true`, `"write-only"`, and `"read-only"`. Do not copy the misleading spelling `"writeOnly"` from an old example.

| Mode | Run unchanged tests | Write dependencies |
| --- | --- | --- |
| `Disabled` | Yes | No |
| `WriteOnly` | Yes | Yes |
| `Enabled` | No | Yes |
| `ReadOnly` | No | No |

This example adds **project-defined** environment controls. These names are not automatic Testplane features:

```js
const { SelectivityMode } = require('testplane'); // use import in ESM/TS
const modes = {
  enabled: SelectivityMode.Enabled,
  'write-only': SelectivityMode.WriteOnly,
  'read-only': SelectivityMode.ReadOnly,
  disabled: SelectivityMode.Disabled,
};
const mode = process.env.SELECTIVITY_MODE || 'write-only';
if (!Object.hasOwn(modes, mode)) throw new Error(`Unknown SELECTIVITY_MODE: ${mode}`);

// Add to the project's exported config, not a second replacement config:
const selectivity = {
  enabled: modes[mode],
  sourceRoot: '',
  testDependenciesPath: process.env.SELECTIVITY_DIR || '.testplane/selectivity',
  compression: 'none',
  reportPath: process.env.SELECTIVITY_REPORT || '.testplane/selectivity-report.json',
  saveIncompleteDumpOnFail: false,
  // REQUIRED: fill this using safety.md before enabling reads.
  disableSelectivityPatterns: projectGlobalInputPatterns,
};
```

`projectGlobalInputPatterns` is a placeholder for the actual audited patterns, not an exported library variable. The example's write-only default is for an already supported collection lane, not authorization to run it. Use `Disabled` if collection safety is unknown. Validate only the approved phases, then change the default to `enabled` only when the acceptance checks pass. The store override should accept an absolute path for isolated verification/CI. Ignore generated stores/reports in version control, but keep actual screenshot references tracked.

If merging an existing `selectivity` object, retain its hooks and safety rules. Do not silently overwrite `mapDependencyRelativePath` or `mapSourceMapUrl`. Config/global-input changes invalidate the baseline, so repeat the final cold/warm check after changing the default.

## Collection is not the same as skipping

- Browser JS/CSS collection requires Chrome/CDP. Another browser reading Chrome's dependencies is not evidence that it collected its own dependencies. Preserve non-Chrome configurations and report unsupported collection instead of deleting those browsers.
- Source maps must be generated, actually served and correctly mapped to local **original** sources. `sourcesContent` alone is not coverage or a dependency.
- Browser source dependencies, Node-side test imports and `assertView` reference PNGs are separate evidence. Seeing an app file only as a test import does not prove browser tracking.
- Use a fresh Testplane process per acceptance phase. Hashes and selective decisions can be process-cached; repeated `run()` in one process is not a safe mutation check.
- Do not pass test paths, `--grep`, `--set`, `--tag` or last-failed filters in acceptance commands. They can bypass selective execution. A configured `sets` object is fine. Preserve the project's normal command but add an unfiltered command if needed.

## Source paths and maps

Prefer fixing the producer of a wrong map over broad filtering. Verify the real `sourceRoot`, URL base and source-map `sources` relative to the application's working directory, especially in a workspace. Never claim a generated bundle is the original dependency.

Only add a path mapper for an observed, explained mismatch. For example, a Vue transform query may be stripped if the resulting `.vue` file exists. Do not blanket-remove query strings from arbitrary URLs, double-decode `%` escapes, or discard all missing files.

Preserve references **before** any mapper or existence filter:

```js
function mapDependencyRelativePath(dependency) {
  if (dependency.reason === 'testplane-assert-view-reference') {
    return dependency.relativePath;
  }
  const relativePath = dependency.relativePath.replaceAll('\\', '/');
  // Add only the selected, justified manager/framework mapping here.
  return relativePath;
}
```

Returning `false`/`undefined` filters a dependency out, it does not mark it global. `mapSourceMapUrl` returning a falsy value drops the asset's mapping. Use neither to hide missing application sources. Independently classify legitimate global inputs using [safety](safety.md); a missing client edge is not a reason to add its file to global patterns.

## Isolation and lifecycle

Keep user actions needed to test behavior, not replay clicks inserted solely to manufacture coverage. Keep meaningful assertions. Do not add synthetic CDP events, private collector patches, unconditional navigation to `about:blank`, or fake maps to make a check green.

If dependencies from one test leak into another, check supported browser isolation or an existing `testsPerSession: 1` policy and measure the effect. Do not assume unspecified isolation is enabled for a Chrome session whose requested version is absent. Do not enable Chromium-only options for every browser without checking compatibility.

Verify actual navigation, lazy imports and final coverage boundaries used by the app. A local package with a navigation or late-map fix is not automatically equivalent to a registry package with the same manifest version.

## Installed-artifact authority

Inspect `require.resolve('testplane')` (or the project's ESM equivalent), resolved `package.json`, and its public config declarations before relying on an option. Read the **installed runtime** when docs disagree. Use the existing manager to make any approved dependency change and record the lockfile/source of the artifact. Private investigation hashes are not release guarantees.

`testplane/package.json` may not be an exported subpath. That is not a broken
installation. Resolve the public entry with the application's launcher/resolution
hooks, then read manifest candidates through the filesystem. This bounded CommonJS
discovery example handles the inspected package shape without importing its runtime:

<!-- snippet: artifact-discovery -->
```js
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const appRequire = createRequire(path.join(process.cwd(), 'package.json'));
const entry = fs.realpathSync(appRequire.resolve('testplane'));
const candidates = [];
for (let dir = path.dirname(entry); ; dir = path.dirname(dir)) {
  const filename = path.join(dir, 'package.json');
  if (fs.existsSync(filename)) {
    const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (pkg.name === 'testplane' && typeof pkg.version === 'string' && pkg.version) {
      try {
        const local = createRequire(filename);
        const mainMatches = !pkg.main ||
          fs.realpathSync(local.resolve(path.resolve(dir, pkg.main))) === entry;
        const exportsMatch = !pkg.exports ||
          fs.realpathSync(local.resolve('testplane')) === entry;
        if (mainMatches && exportsMatch && (pkg.main || pkg.exports)) {
          candidates.push({ root: dir, filename, version: pkg.version, entry });
        }
      } catch (error) {
        if (!['MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED', 'ENOENT'].includes(error.code)) throw error;
      }
    }
  }
  if (path.dirname(dir) === dir) break;
}
if (candidates.length !== 1) throw new Error('Artifact root needs explicit inspection');
const artifact = candidates[0];
console.log(artifact);
```

Do not stop at the first matching name/version: the inspected artifact also has
`build/package.json` with those same values but a `main`/`exports` target that would
resolve to a nonexistent nested build. No fixed parent count is reliable. The code
requires both advertised entries to agree for this CJS shape. For a dual-package
main/exports difference, ESM-only entry or non-filesystem linker, inspect the actual
resolution conditions with that project's launcher instead of weakening the guard.

Before accepting `artifact`, bind its real installation root/version to the actual
manager's lock entry and resolution metadata: registry URL/integrity, approved local
tarball or workspace link. Record the lock path and artifact hashes and inspect the
declarations shipped with that root. A matching manifest is not an integrity check,
and registry metadata or a replacement install cannot identify the already running
artifact. No reinstall is needed just to discover it.

Reference: official Testplane selectivity guide and configuration reference. The installed declarations/runtime take precedence over version-ambiguous examples.

Discovery API checked 2026-11-06 against [Node package entry points/exports](https://nodejs.org/api/packages.html#package-entry-points).
