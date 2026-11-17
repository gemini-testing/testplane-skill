# Rollup

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this module for a direct Rollup build. For Vite, use [Vite](vite.md) instead.

## Detect and preserve

1. Find the config or JavaScript build script used by the existing app command.
   Record all outputs, input entries, plugins, external dependencies and the serving root.
2. Identify TS/JSX transforms and the CSS plugin or separate CSS build pipeline.
   Inspect plugin order, output formats, chunking, tree shaking and minification.
3. Preserve entries, plugins, module format, optimization policy and app startup.
   For compatible browser outputs, enable module preservation as described below.
   This deliberately changes chunk topology, not application source or behavior.
   Do not rewrite top-level initialization to improve coverage.
4. Use [package managers](../package-managers.md) for Yarn/npm/pnpm and lockfile handling.

## Enable maps and preserve browser modules

On each existing browser output configuration, enable a discoverable map:

```js
// outputOptions is each existing compatible browser output object.
outputOptions.sourcemap = true;
outputOptions.preserveModules = true;
```

For direct Rollup, enable `preserveModules: true` on the actual browser build used
by the tests to restore genuine ownership of flattened shared modules, not to replace
that ownership with a global source guard. Apply it to the relevant `output` object(s) in the config,
or the options passed to `bundle.write` / `bundle.generate`. Keep existing entries,
plugins, format and optimization settings. This does not disable tree shaking.
Do not apply this recipe mechanically to Vite or a framework-owned build.

Check compatibility first. Module preservation requires directory output and is
incompatible with `manualChunks` and `inlineDynamicImports`. An existing
`preserveEntrySignatures: false` also conflicts with module preservation. A single-file
or IIFE/UMD delivery contract may prevent it. Do not silently delete those
settings, switch formats, or break fixed asset URLs to force the flag. If changing
that delivery contract is not authorized, retain it and leave selective reads off,
explicitly reporting the limitation instead of claiming full selectivity.

Inspect the emitted paths and actual HTTP responses after building. Preserve
entry URLs, dynamic imports, public path/base and server/deployment behavior.
`preserveModulesRoot` may strip an unwanted source-root prefix; derive it from
the real output layout rather than adding it blindly. Plugins can emit virtual
modules and dependencies can produce additional files. Record the changed output
layout and assess the application's delivery constraints. A test-only profile does
not prove the old bundled production artifact is selective.

For `output.sourcemap`, `true` emits a linked external map. `'inline'` embeds one. `'hidden'` does not add
the normal annotation and needs separately verified map discovery.
Preserve input plugins and their real transform maps. A final map cannot reconstruct
original TS/JSX mappings discarded earlier. Do not silence sourcemap-chain warnings.
If using `bundle.generate`, the existing writer must publish code and its map together.

If relative names do not resolve correctly, either derive the right Testplane root
or adjust the existing output's source-name transform. Only for verified relative names:

```js
import path from 'node:path';

outputOptions.sourcemapPathTransform = (relativeSourcePath, sourcemapPath) =>
  path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
```

Do not overwrite a required existing transform or pass virtual/URL names through
this filesystem recipe blindly. No source content or mapping segments should change.
For native `../src/...` names emitted under `dist/`, `selectivity.sourceRoot: 'dist'`
can fit that layout. It is not the correct root for every output or monorepo package.

## CSS must have its own complete chain

Rollup's JS `output.sourcemap` does not configure every CSS plugin automatically.
Enable maps using the installed CSS plugin's documented API, preserving extraction,
CSS Modules, preprocessors and minifiers. Keep maps through all transforms.
If CSS already runs through a separate PostCSS build, retain its real input/output
filenames and composed maps. Emit/link the final map rather than mapping to a copied
intermediate file. No new CSS compiler is required when the existing chain works.

### Copy-only CSS with an already available producer

If the current build only copies plain CSS and **already declares a compatible
PostCSS** (the inspected route used 8.5.30), replace only that copy operation with
the following map-producing step. This is not an instruction to install PostCSS,
replace a CSS plugin, process Sass as plain CSS or rebuild an existing transform chain.
Reuse the actual source/destination filenames from the old copy loop:

<!-- snippet: rollup-copy-css -->
```js
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

async function copyCssWithMap(from, to) {
  const result = await postcss([]).process(await fs.readFile(from, 'utf8'), {
    from, to,
    map: { inline: false, annotation: true, sourcesContent: true },
  });
  if (!result.map) throw new Error(`No CSS map produced for ${from}`);
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.writeFile(to, result.css);
  await fs.writeFile(`${to}.map`, result.map.toString());
}
```

Retain rule order, filenames and link/import behavior. The producer generates real
mappings and a linked `sourceMappingURL`; do not write identity mappings by hand.
Check that the existing server publishes **both** files, the map resolves to the
original CSS and the owner graph plus semantic style mutation pass. If the producer
is absent/incompatible, investigate the project's supported pipeline rather than
adding a universal dependency or silently retaining unmapped CSS.

Fetch the JS and CSS loaded by the browser, then their actual external maps or inline
payloads. Reject HTML fallback responses and stale maps from previous hashed builds.
Check nonempty real mappings, local originals and matching original contents.
Expected app originals must be present in owner-specific `browser.js` / `browser.css`,
not merely in a build report, `sources[]`, or test-side imports.

## Why module preservation is the default here

A correctly mapped flattened bundle can still lose top-level dependencies.
The inspected published Testplane 9.3.7 collector drops full-span wrapper ranges with
more than two unique nonempty originals across the parsed map. Without another
executed function range, a shared constant or initialization side effect may disappear.
Other runtimes may use a different heuristic. Verify the installed artifact.

With module preservation, a top-level source can have its own executed output and
single-source map rather than relying on the discarded multi-source wrapper.
This is a verified workaround, not a universal guarantee for every plugin or source.
In a real Rollup 4.64.6 / Testplane 9.3.7 / Chrome 151 A/B, the ordinary bundle
lost the shared constant and skipped all five tests after a meaningful change.
Adding only `preserveModules: true` to the build, without that source's global guard,
recorded it for all five owners and made the same change fail their original UI
checks. Private and lazy changes selected two and one owners respectively, while
an unused module selected none. Both builds passed cold and unchanged warm checks.
The output changed from six JS files to eight; deployment performance was not measured.

Do not replace this with `treeshake: false`, a format change or inline maps. Keep
an already enabled preserve-modules profile and validate its actual served output.
For incompatible builds or remaining gaps, leave reading disabled and report the
producer/collection limitation. Do not add observed missing client sources to
`disableSelectivityPatterns`. Never rewrite source functions/constants to manufacture coverage.

## Acceptance

Run the complete [validation](../validation.md), including global inputs and actual
visual references. For the module-preservation change specifically:

1. Use a fresh dependency store after changing output topology or guard policy.
   Pass the original full suite, then confirm expected app originals, especially
   entry/shared/top-level modules, in owner-specific browser dependencies.
2. Remove only the now-observed source paths from their former global guard. Keep
   server/static/config/lockfile protections. Unresolved client edges block selective reads,
   rather than becoming additional source guards.
   Recollect a fresh baseline with this final guard policy, then require warm skips.
3. Freeze that successful baseline and restore it before each independent mutation.
   Change actual shared behavior and require every necessary owner to run and observe
   the changed UI. A guard must not conceal missing browser tracking for that source.
4. Check private and lazy owners separately, plus an unused module that should skip.
   Check real CSS ownership too; preserving JS modules does not create CSS maps.
5. Restore exact source bytes, rebuild and repeat cold/warm on the final configuration.
   Report the topology change, installed versions, owner results and any remaining
   unverified boundary. Do not call the whole project fully selective from one shared-file check.

Write-only is diagnostic, not completed setup. Global reruns are not per-test tracking.

## API sources

Checked 2026-11-05 against official docs and the inspected Rollup build script.
- [Output maps](https://rollupjs.org/configuration-options/#output-sourcemap)
- [Source-name transformation](https://rollupjs.org/configuration-options/#output-sourcemappathtransform)
- [Module preservation](https://rollupjs.org/configuration-options/#output-preservemodules)
- [Transform plugin maps](https://rollupjs.org/plugin-development/#transform)
- [PostCSS processing and map options](https://postcss.org/api/) (copy-only API checked 2026-11-06)
