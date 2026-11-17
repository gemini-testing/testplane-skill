# Rspack and Rsbuild

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this module for direct Rspack or an Rsbuild-owned browser build.
For Storybook also read [Storybook](../frameworks/storybook.md), not every bundler page.

## Detect and preserve

1. Follow scripts to `rspack.config.*`, `rsbuild.config.*` or a framework-owned config.
   Record installed versions, resolved mode/environment and the actual output server.
2. Identify native CSS versus loader-based CSS, CSS Modules, SWC/other transforms,
   framework plugins, HTML generation, aliases, public path and module classification.
3. Keep production minification, split chunks and startup behavior, applying only the
   selectivity-compatible concatenation override below when compatible.
   A fixture's `javascript/auto` rule or development mode is not a universal requirement.
4. Route installation, lockfiles and workspace resolution to
   [package managers](../package-managers.md).

## Direct Rspack

Set this on the resolved existing browser config, without replacing its other fields:

```js
config.devtool = 'source-map';
```

For the selectivity-compatible production lane, merge this into the **same** config:

<!-- snippet: rspack-concatenation -->
```js
config.optimization = { ...config.optimization, concatenateModules: false };
```

Rspack normally enables module concatenation in production. Preserve `mode`,
`optimization.minimize`, minimizers, plugins and unrelated optimization fields.
Do not switch the build to development. Inspect any explicitly added concatenation
plugin so it does not undo the setting, without removing unrelated plugins.
This override changes generated structure and may increase size or affect performance.
Disclose the tested profile/tradeoff. An explicit unchanged-build contract needs approval
or leaving selective reads off. Do not apply this option name to Rollup, Parcel or esbuild.

Keep the existing source-name template when it already resolves correctly.
For unresolved namespaces, inspect `output.devtoolModuleFilenameTemplate` and
`output.devtoolFallbackModuleFilenameTemplate`. The callback receives fields such as
`absoluteResourcePath` and `resourcePath`. Emit real original paths for app modules,
not guessed basenames. Preserve distinguishable fallback labels for virtual modules.

Rspack 2 native CSS uses an appropriate module rule. For example, this is the shape
of a native auto-detect rule, not a second rule to append over an existing CSS pipeline:

```js
const nativeCssRule = { test: /\.css$/i, type: 'css/auto' };
```

`css` is plain CSS, `css/module` forces CSS Modules, and `css/auto` detects them.
Preserve the project's existing choice. Do not add legacy `experiments.css` to a
Rspack 2 config. Older Rspack releases need their own version's CSS setup.
Native CSS does not require introducing `css-loader` or PostCSS. With an existing
loader/preprocessor pipeline, enable and compose maps through each transformation.
Check final CSS maps independently of JS maps.

## Rsbuild

Use Rsbuild's options instead of replacing its generated Rspack configuration.
Inside the existing config factory or integration hook, merge into its resolved config:

<!-- snippet: rsbuild-profile -->
```js
import { mergeRsbuildConfig } from '@rsbuild/core';

const mappedConfig = mergeRsbuildConfig(config, {
  output: { sourceMap: { js: 'source-map', css: true } },
  tools: {
    rspack(rspackConfig) {
      rspackConfig.optimization = { ...rspackConfig.optimization, concatenateModules: false };
      return rspackConfig;
    },
  },
});
// Return mappedConfig from the existing factory/hook.
```

For object-form user configs, merge the same source-map/`tools.rspack` additions and retain other fields.
If a low-level change is needed, compose the existing `tools.rspack` hooks using
`mergeRsbuildConfig`. Do not replace function/array hooks with a plain object.
In a `tools.rspack` callback, modify the supplied config, preserving injected plugins.
For Storybook Rsbuild, the corresponding hook is `rsbuildFinal`, not `webpackFinal`.

## Serve and resolve the originals

- Inspect JS and CSS requested by the tested page, not just build statistics.
  Follow external map annotations through the actual asset prefix, or decode inline maps.
- The server must return valid maps, not HTML fallback pages. Check lazy assets too.
- Check real mappings and local source contents for JS/TS/JSX and CSS/preprocessors.
  Source-map metadata or a successful browser render alone is insufficient.
- Absolute original filenames may work with `selectivity.sourceRoot: ''`.
  Relative `../src/...` names require a root derived from this build's output layout.
  A Storybook output root is not the application root by default.
- Verify originals appear in owner-specific `browser.js` / `browser.css` dumps.
  Keep actual missing app files visible as failures, not silently ignored runtime labels.

## Safety and acceptance

Optimization support is specific to the installed runtime and build topology.
Even the inspected patched collector drops full-span wrappers over more than two
unique nonempty originals, potentially losing top-level dependencies without another
executed range. A working webpack/Rspack fixture is not a universal support claim.
Check [Vue](../frameworks/vue.md) if maps point to `.vue` originals.

The flag is **not sufficient by itself**. Recollect a fresh store and require the full
original-owner graph in native `browser.js`, meaningful semantic entry/shared/private/lazy
mutations with no source guard concealing those edges, unused controls and final
**default-enabled cold/warm**. Keep CSS/global/reference checks. Production minification
stays in place. Development results are not production-profile evidence, and a test-only
profile does not prove the unchanged deployed artifact. Label that scope explicitly.

For gaps remaining after the compatible producer override, keep selective reads off
and report the unresolved producer/collector boundary. Do not put missing client sources
in `disableSelectivityPatterns`.
Do not rewrite initialization to run after a click merely to obtain coverage.
Run [validation](../validation.md), including initial load, lazy imports, shared JS,
CSS changes, unused controls and restoration under the final disclosed optimization profile.
Require actual unchanged warm skips and the expected source owners. Keep genuine
server/build/config guards. Write-only is diagnostic, not completed setup.

## API sources

Checked 2026-11-05. Version-specific API docs are not a Testplane support matrix.
- [Rspack devtool](https://rspack.rs/config/devtool)
- [Rspack source-name templates](https://rspack.rs/config/output)
- [Rspack 2 CSS migration](https://v2.rspack.rs/guide/migration/rspack_1.x)
- [Rsbuild source maps](https://rsbuild.rs/config/output/source-map)
- [Storybook Rsbuild configuration](https://storybook.rsbuild.rs/guide/configuration)
- [Rspack module concatenation](https://rspack.rs/config/optimization#optimizationconcatenatemodules) (checked 2026-11-06)
- [Rsbuild Rspack callback](https://rsbuild.rs/config/tools/rspack) (checked 2026-11-06)
