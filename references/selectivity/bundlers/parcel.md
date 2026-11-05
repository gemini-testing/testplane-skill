# Parcel

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this module when the tested build is produced by Parcel.

## Detect and preserve

1. Inspect the existing Parcel version, scripts, HTML/JS entries, `.parcelrc`,
   package targets, browsers/engines and static or development server.
2. Identify the exact target selected by the script, including `--target` overrides.
   Keep its context, output format, output directory, entries and optimization. Inspect
   `isLibrary` and delivery constraints before changing scope hoisting as described below.
3. Preserve CSS Modules, custom transformers, minifiers, app startup and asset loading.
   Do not replace the package manifest with a fixture target or introduce click-to-start.
4. Route dependency installation and npm/pnpm/Yarn differences to
   [package managers](../package-managers.md).

## Preserve JS dependencies in the browser target

For the actual compatible browser application target, set `scopeHoist: false` together
with genuine source maps. This is the preferred integration, not just a diagnostic:
complete JS dependency tracking takes priority over scope-hoisting size optimizations.
Do not leave a known missing bootstrap/shared dependency behind a global source guard
merely to retain smaller bundles when this compatible producer change is available.

Parcel normally concatenates modules in production. In the checked Parcel 2.16.4 /
Testplane 9.3.7 browser build, that output lost a used loader from `browser.js`, and a
semantic loader change incorrectly skipped all tests. Disabling scope hoisting restored
its per-test edges and ran the tests that exposed the same real UI failure as Disabled
mode. This is evidence for that pipeline, not a guarantee for every Parcel target.

Before applying it:
- Verify the selected target is a browser **application**, not a library, server or worker
  target. `isLibrary: true` requires scope hoisting; do not override that constraint or
  silently turn a library into an application. Check implicit library targets too.
- Preserve the real target name, entries, context, `outputFormat`, `distDir`, `publicUrl`,
  engines, `optimize`, transformers and app startup. Do not also turn off minification.
- Merge into that target rather than replacing the manifest or applying a global CLI
  switch to unrelated targets. For an implicit target, identify its effective options
  and use the installed Parcel version's supported equivalent without inventing entries.
- If an explicit unchanged-output contract or incompatible target prevents this change,
  report it and leave selective reads disabled instead of introducing client-source guards.
  Do not claim full dependency coverage for an incompatible or untested target.

For a named compatible browser target, merge this fragment into that target in `package.json`:

```json
{
  "scopeHoist": false,
  "sourceMap": {
    "inlineSources": true
  }
}
```

This is a target fragment, not a complete manifest. Preserve other target fields and
existing `sourceMap` options. If maps were disabled, enable them for the tested lane.
Remove a conflicting `--no-source-maps` only from that lane's existing build command.
Use the same real target name with `--target`, not an invented `app` target.

To use embedded maps, the target supports `sourceMap: { inline: true, inlineSources: true }`.
`inlineSources` includes original content and is not the same as `inline` map transport.

Scope-hoisting changes generated JS structure and may increase bundle size. Disclose
that tradeoff in `SELECTIVITY.md`, but do not reject the compatible change solely for
size when dependency completeness is the goal. Keep the normal production optimization
and build command. If applied only to a test profile, explicitly state that its evidence
does not prove selectivity for a different deployed build.

### Prove the new output before removing source guards

1. Build and serve the actual changed target, then use a **fresh dependency store**.
   Verify emitted maps and original paths, plus the expected bootstrap/loader/shared
   originals in native `browser.js`. File presence in `sources[]` alone is insufficient.
2. Remove only the now-observed source paths from `disableSelectivityPatterns` for the
   independent checks. A source guard must not conceal missing browser tracking. Keep
   server/HTML/fonts/app-image/config guards and per-test reference handling intact.
3. Run the full CLI cold and unchanged warm. Make a meaningful change to the formerly
   missing source using the original startup flow. Its owners must run and observe the
   changed behavior, with a Disabled control where needed to detect a false skip.
4. Check private, shared and lazy sources, plus an unused module that should skip.
   Restore each input exactly and use the same frozen baseline independently. Test CSS
   comment addition/removal on a normal warm cache as described below, not only JS.
5. Finish with restored warm skips. If any real original still lacks coverage, fix its
   producer or leave selective reads disabled and report the unresolved ownership.
   Do not remove unrelated safety guards or label unverified coverage fully-selective.

## Native CSS and delivery

Parcel can generate native JS and CSS maps without adding PostCSS.
For custom transformers or preprocessors, verify the final map retains their originals.
Inspect emitted assets after the normal build, including content-hashed and lazy assets.
Do not clean shared caches or unrelated output directories to force a passing result.

- Fetch JS/CSS requested by the test and their actual `sourceMappingURL` targets.
  Maps must be JSON, not status-200 HTML fallbacks. Inspect inline payloads directly.
- Check real mappings, original contents and existing local paths, not only `sources[]`.
- Parcel target `sourceMap.sourceRoot` is emitted map metadata. Testplane
  `selectivity.sourceRoot` is a runtime override. Do not treat them as interchangeable.
- Derive the Testplane root from the selected target's map labels and working directory.
  Verify it with actual browser dependencies, not an assumed `dist` convention.

## Optimized CSS can contain intermediate names

The inspected optimized build included both a real `src/*.css` original and a
hashed intermediate CSS filename whose physical file lived in the output directory.
A missing path is not a reason to drop the whole stylesheet or its source map.

One observed Parcel **2.16.4** optimized artifact had this identity summary (not a
source map to inject, and not a universal Parcel schema or `sources` ordering):

<!-- snippet: parcel-css-identity -->
```json
{
  "assetPath": "dist/alpha.4cfb5b7f.css",
  "sourceMappingURL": "alpha.4cfb5b7f.css.map",
  "physicalMapPath": "dist/alpha.4cfb5b7f.css.map",
  "mapFileField": "alpha.4cfb5b7f.css.map",
  "mapSources": ["alpha.4cfb5b7f.css", "src/alpha.css"],
  "intermediateDependency": "alpha.4cfb5b7f.css",
  "existingIntermediatePath": "dist/alpha.4cfb5b7f.css",
  "originalDependency": "src/alpha.css"
}
```

Here the physical map is identified by the **asset's annotation**, not by assuming
that `map.file` names the CSS asset: this artifact's `file` names the map itself.
The intermediate basename exists under `dist`, not runner cwd, while the original
exists under `src`. Audit the actual map's genuine mappings (omitted from this
summary), target/output root, asset annotation and original identity before deriving
any relocation pair. Discover pairs anew from each build, including hashed/lazy
assets. Never copy these filenames into a project config.

If this occurs in the current project:
1. Inspect that exact map, the intermediate asset and its own map.
2. Verify original paths, mappings and `sourcesContent` against the baseline inputs.
   Establish which emitted asset and real originals the intermediate represents.
3. Only then add a narrowly scoped `mapDependencyRelativePath` rule for
   `scope: 'browser'`, `reason: 'browser-css-import'` and the proven intermediate path.
   Derive allowed intermediates from the actual target output and map metadata, not
   from a blanket CSS-basename rule. Confirm the physical output and original files
   exist, and that the asset/map relationship identifies the expected intermediate.
4. Return the real existing relative path, preserving the earlier mapper, PNG handling
   and [package-manager rules](../package-managers.md). Leave unrelated paths unchanged.

Do not map every CSS basename into the output directory or use `return false` for
unknown app sources. A retained intermediate is not a substitute for original CSS edges.
Recheck this evidence after output-directory, target or optimization changes.

### Rebuilds and embedded-content freshness

Do not require `sourcesContent` byte equality with the current original as a runtime
path-remapping gate. In an observed Parcel 2.16.4 optimized build, a comment-only CSS
edit reused the same emitted CSS and map bytes from a warm cache. The real original
file changed, but the map retained its earlier embedded content. A mapper that required
exact equality stopped relocating the still-valid intermediate and returned a nonexistent
basename. Native dependency collection then failed, even though selection chose the
correct tests. A clean-cache build alone did not expose this integration error.

Separate **asset/path identity** from **embedded-content freshness**. Preserve real
original paths so Testplane hashes their current on-disk bytes independently of the
generated CSS and embedded copies. A narrow, validated relocation of an existing
intermediate must not disappear solely because an original's comment changed.
This is not permission to trust arbitrary stale maps: if changed imports or semantic
changes leave source ownership unproven, repair the producer and leave skipping off until
its behavior is verified. Do not patch that gap with global client-source patterns.

For each stylesheet class, test a comment-only addition and removal with the normal
warm cache, a semantic style change, and exact restoration. Keep the ordinary production
optimization and build command. Compare emitted asset/map identities, actual original
browser edges, successful collection, selected owners and final unchanged warm skips.
Use the [B0 → add → B1 warm → remove chain](../validation.md#comment-add-warm-remove-directional-baseline)
for the reverse transition. All other mutations remain isolated from B0.
Do not clear caches on every run, disable optimization, or discard generated dependencies
to make these checks pass. Unknown or missing assets must remain visible failures.

## Runtime limits and acceptance

Maps and passing UI tests do not establish selective-read safety. Initial automatic
bootstrap must be tested as-is, not replaced with a user-action loader for better coverage.
The inspected patched collector can still drop full-span wrappers over more than two
unique nonempty originals, losing top-level dependencies without another executed range.

If JS or CSS originals remain unresolved after the compatible producer changes above,
leave selective reads off and report the exact limitation. Do not use global client-source
patterns instead of repairing the producer and proving its graph. Run [validation](../validation.md) on the exact target and
startup mode. Require expected
originals in `browser.js` / `browser.css`, real source mutation reruns and visible changes,
unused controls, restored inputs and a final unchanged warm run.
Do not transfer a result from a nonoptimized target to an optimized one.
Keep genuine server/build/config/static guards separately. Write-only is diagnostic,
not a completed selectivity setup.

## API sources

Checked 2026-11-05 against official target docs and actual Parcel target/build configs.
- [Target source maps](https://parceljs.org/features/targets/#sourcemap)
- [Optimization options](https://parceljs.org/features/targets/#optimize)
- [Scope hoisting](https://parceljs.org/features/targets/#scopehoist)
- [Parcel CLI](https://parceljs.org/features/cli/)
