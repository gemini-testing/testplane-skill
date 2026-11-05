# esbuild

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Use this module for an esbuild-owned app build, not merely a transitive esbuild dependency.
Read [React](../frameworks/react.md) only when JSX/runtime handling needs attention.

## Detect and preserve

1. Follow the build script to the existing `build`, `context` or CLI options.
   Record the installed version, working directory, entries, output directory and server.
2. Identify JS/TS/JSX loaders, plugins, CSS inputs, package module type, browser targets,
   `define`, externals, output format and splitting. Inspect the actual HTML script tags.
3. Preserve IIFE/ESM/CommonJS format, bundling, production definitions, minification
   and startup semantics. Do not change `process.env.NODE_ENV` to development for coverage.
4. Follow [package managers](../package-managers.md) for installation and native binaries.

## Minimal map change

At the existing build call, retain its options and change only map generation:

```js
import { build } from 'esbuild';

// options is the app's existing complete BuildOptions object.
await build({ ...options, sourcemap: 'linked', sourcesContent: true });
```

For `context(options)`, set the same options when creating that context, without
replacing its existing serve/watch lifecycle. For a CLI build, use `--sourcemap=linked`.
`'inline'` and `'both'` are alternatives with an embedded map. `'external'` alone
creates a separate file without the linking comment, so do not assume discovery.
With `write: false`, the app's output writer/server must actually publish the returned assets.

## CSS and map delivery

esbuild supports native CSS maps with the same sourcemap modes. Apply map settings
to every existing CSS build call as well as JS. PostCSS is not mandatory.
For imported CSS, retain the emitted CSS bundle's real HTML/link integration.
For CSS preprocessors or custom plugins, ensure their upstream maps reach the final CSS.

- Fetch each JS/CSS asset used by the test, including lazy chunks, and follow its
  actual `sourceMappingURL`. External maps must be JSON, not an app-shell fallback.
- Inspect genuine mappings, original names and matching contents. `sourcesContent`
  is not a substitute for existing local files or browser-observed dependencies.
- If a map emitted in `dist/` contains `../src/alpha.js`, a Testplane `sourceRoot`
  corresponding to that `dist/` can resolve it. Derive this from the actual output
  layout and working directory, rather than hard-coding `dist` for every project.
- Verify independent CSS originals, and originals behind TS/JSX transforms, in each
  owner's `browser.js` / `browser.css`. Test-side imports do not prove browser coverage.

## Bundled top-level code: inspect the installed artifact

In published Testplane `9.3.7`, the full-span wrapper heuristic ignores a range
covering the whole parsed map when it contains more than two unique nonempty originals.
The count is across the map before source-extension filtering, not merely the number
of application files or coalesced segments. Another executed function range can still
record an original, but a top-level constant may have no such range. A passing render
and a correct source map alone do not prove that dependency is protected.

In the tested esbuild `0.28.2` React production build, the missing top-level original
shared a chunk with two React originals. The compatible producer remedy below separated
its chunk, and real Testplane `9.3.7` browser dumps then contained the original.
This is a specific observed remedy, not a universal promise for every bundle.

## Separate an observed top-level module with entryPoints

For an **existing bundled ESM browser build with `splitting: true` and `outdir`**, prefer
adding the independently identified missing original as a dependency-entry to restore
real browser ownership, not substituting a source-global guard. Keep the real application entries, imports, HTML,
production definitions, target, plugins, optimization and CSS build unchanged.
There is no `preserveModules` or `scopeHoist` option in the tested esbuild version.

At the existing build call, for the string-array form of `entryPoints`:

```js
// options is the existing complete build configuration with genuine linked maps.
// auditedMissingOriginals contains actual local sources missing from browser dumps,
// not an assumed universal filename such as shared.jsx.
await build({
  ...options,
  entryPoints: [...new Set([...options.entryPoints, ...auditedMissingOriginals])],
});
```

- Preserve aliases when the project uses object-form entries or named entry records;
  do not apply the string-array fragment to those forms. Check output collisions and
  delivery constraints before adding an entry. Preserve existing output names where
  their public contract requires it.
- With splitting enabled, an extra entry can change shared-chunk boundaries. The
  required proof is that the **actual browser** fetches the new dependency chunk through
  its unchanged app imports and records the original in each owning test's graph.
  An emitted but unfetched entry facade is not proof. `splitting: false` plus an extra
  standalone output did not provide the same remedy in the tested app.
- Do not add every source as an entry or change application constants into functions.
  Choose observed missing modules, disclose extra outputs/requests and repeat the
  source inventory when the application or vendor chunk composition changes.
- In the measured A/B, both sides had the same source-global guard removed. The old
  build skipped all five tests after a semantic shared-source change; its `Disabled`
  control exposed three original assertion failures. The dependency-entry build
  collected the shared original in all five browser graphs and ran those same three
  failing assertions. The app/runtime/tests were not patched.

Remove only the now-observed source paths from `disableSelectivityPatterns`, after
fresh dependency store collection, unchanged warm skips, semantic selective/`Disabled`
controls, private/lazy/unused JS and CSS ownership, and actual PNG reference checks.
Keep unrelated server/static/configuration guards. A function present in a map or a
successful build alone must never justify removing an existing safety rule. If the compatible
entry change does not fix the observed graph, keep selective reads disabled and report
the unresolved original. Do not add missing client files to global patterns.

## Larger topology changes need explicit approval

Unbundled ESM is a different delivery contract, not a transparent source-map fix.
Do not silently change IIFE to ESM, set `bundle: false`, introduce click-to-start,
rewrite constants into functions or change a package's `type` field.
If the user chooses a separate diagnostic profile, it must preserve real import
resolution, lazy chunks, CSS loading, HTML module tags, extensions and MIME types.
Native browsers also need an intentional resolution strategy for bare package imports.
Do not copy a workspace-specific vendor bridge or synthesize maps by hand.
Keep such a profile's results separate from the production build: a test-only profile does not prove
that the unchanged production output has complete dependencies.

## Acceptance

Complete [validation](../validation.md) on the retained build profile: cold collection,
unchanged warm run, actual entry/shared/lazy/top-level JS and CSS mutations, unused
controls and restored inputs. Confirm DOM/style behavior with selectivity disabled too.
Missing client ownership blocks selective acceptance. Genuine server/build/config
inputs stay global, but they must not conceal missing source edges.
Write-only is diagnostic, not completed selectivity setup. Build/map success is not proof.

## API sources

Checked 2026-11-05 against official docs and actual esbuild build scripts.
- [Source-map modes and CSS support](https://esbuild.github.io/api/#sourcemap)
- [Original source contents](https://esbuild.github.io/api/#sources-content)
- [Build API](https://esbuild.github.io/api/#build)
- [Output formats](https://esbuild.github.io/api/#format)
- [Entry points](https://esbuild.github.io/api/#entry-points)
- [Code splitting](https://esbuild.github.io/api/#splitting)
