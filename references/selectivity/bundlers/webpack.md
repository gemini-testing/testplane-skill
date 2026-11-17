# webpack

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this module only when the application's tested browser build uses webpack.
Add a framework module only for an actual framework-specific issue.

## Detect and preserve

1. Follow the existing build/test script to its webpack config, mode, environment
   and config factory. Check framework wrappers and multi-compiler exports before editing.
2. Identify JS/TS/JSX loaders, CSS extraction or injection, preprocessors, minimizers,
   aliases, HTML generation, public path and the server used by Testplane.
3. Keep those choices, entry points, chunking, module format and unrelated production optimizations.
   Do not replace the config with a small standalone example or change app startup.
4. Use [package managers](../package-managers.md) for dependencies and installation.

## Minimal map changes

In the resolved browser config, before its existing return/export:

```js
config.devtool = 'source-map';
```

Use full original-source mappings, including columns. `eval` and cheap maps are not
equivalent. Hidden maps require a separately verified discovery mechanism.
If the project already uses `SourceMapDevToolPlugin`, adjust that plugin instead of
enabling a second source-map generator through `devtool`.

Only if emitted source names do not resolve to local originals, update the existing
filename template. Here `config` is that same resolved webpack object:

```js
config.output = {
  ...config.output,
  devtoolModuleFilenameTemplate: info =>
    info.absoluteResourcePath || info.resourcePath,
};
```

Inspect fallback names, loader queries and virtual modules after rebuilding.
Keep names distinguishable when transforms share one resource. Do not rename
`.vue`/`.svelte` originals to `.js`, or treat every missing file as runtime glue.
For Vue components, additionally read [Vue](../frameworks/vue.md).

## CSS is a separate requirement

Keep the current extraction/injection mechanism. For an existing object-form
`css-loader` entry, merge into its options rather than replacing CSS Modules settings:

```js
// cssLoader is the actual entry found in the existing rule's use array.
cssLoader.options = { ...cssLoader.options, sourceMap: true };
```

For a string-form entry, convert it to `{ loader: 'css-loader', options: { sourceMap: true } }`.
Enable map propagation in each existing PostCSS/Sass/Less/JS transform as applicable.
An extracted-CSS stack can retain `MiniCssExtractPlugin.loader` and its existing plugin.
Do not install PostCSS or replace `style-loader` solely because a fixture used extraction.
If changing extraction is necessary, obtain approval and verify style order, lazy CSS
and initial HTML links. Native webpack CSS needs its own version-appropriate settings.

With live CSS injection there may be no standalone stylesheet HTTP URL. Follow
[injected-map discovery](../injected-css.md) before diagnosing missing maps/coverage.
Keep genuine loader maps and the existing injection mechanism.

## Selectivity-compatible production profile

Module concatenation (scope hoisting) is normally enabled in production. For the
compatible tested lane, explicitly disable **only** concatenation on the resolved
existing browser config, alongside genuine maps:

<!-- snippet: webpack-concatenation -->
```js
config.optimization = { ...config.optimization, concatenateModules: false };
```

Preserve `mode`, `optimization.minimize`, `minimizer`, split chunks, plugins and all
other settings. Do not switch the whole build to development or disable minification.
For Storybook apply it in the actual [webpackFinal hook](../frameworks/storybook.md),
not just the app config. Inspect explicit `ModuleConcatenationPlugin` wiring if present
so it does not re-enable the behavior; do not delete unrelated plugins.

This changes generated module structure and can increase size or affect loading/runtime
performance. Disclose the profile and tradeoff in `SELECTIVITY.md`. If an unchanged-build
contract prevents it, request approval for the profile change or leave selective reads off. A test-only
profile does not prove the deployed concatenated artifact. The flag is a producer remedy,
**not sufficient by itself**: use a fresh store, require all original-owner edges in native
`browser.js`, semantic entry/shared/private/lazy mutations without a source guard hiding
gaps, unused controls, and final **default-enabled cold/warm**. Keep CSS/global/reference
checks. Use a separately labeled production-profile validation, not development evidence.

## Inspect what the server actually serves

- Fetch the JS and CSS loaded by the tested route, including lazy chunks, then their
  actual `sourceMappingURL` targets. A disk `.map` alone proves nothing.
- External maps must return source-map JSON, not an HTML fallback with status 200.
  Unknown map URLs must fail. Decode inline maps instead of trying to fetch a filename.
- Check real `mappings`, original names and matching local contents. Loader output
  standing in for the original TS/JSX file is insufficient.
- Derive `selectivity.sourceRoot` from emitted names and the Testplane working directory.
  Empty root can suit absolute originals, but does not universally erase a map's root.
- Require the expected app files in each owner's `browser.js` and `browser.css`, not
  only in test-side imports or the union of all dependency scopes.

## Limits and acceptance

Neither disabling minification nor disabling concatenation guarantees coverage.
The inspected patched collector can omit a full-span wrapper when the whole parsed
map has more than two unique nonempty originals. Top-level constants and side effects
can then be missing unless another executed range covers them. Published artifacts
can have different, stricter wrapper behavior. Verify the installed runtime.

If an original remains untracked after the compatible producer override, report the
producer/collector limitation and keep selective reads disabled. Do not add that client
path to `disableSelectivityPatterns` to hide the missing edge.
Never suppress an application map to make collection pass.
Complete [validation](../validation.md) for the actual production combination:
baseline, unchanged warm run, executed/lazy/shared JS and CSS mutations, unused
controls, restoration and a final warm run. Maps are necessary, not acceptance.
Keep independently classified server/build/config inputs global. Write-only is diagnostic,
not completed selectivity setup; use Disabled if collection itself is not established.

## API sources

Checked 2026-11-05, with existing project configs and installed runtime checked separately.
- [webpack devtool](https://webpack.js.org/configuration/devtool/)
- [Source names](https://webpack.js.org/configuration/output/#outputdevtoolmodulefilenametemplate)
- [CSS loader maps](https://webpack.js.org/loaders/css-loader/#sourcemap)
- [CSS extraction](https://webpack.js.org/plugins/mini-css-extract-plugin/)
- [Sass loader map chain](https://webpack.js.org/loaders/sass-loader/#sourcemap)
- [Module concatenation](https://webpack.js.org/configuration/optimization/#optimizationconcatenatemodules) (checked 2026-11-06, also Context7 `/websites/webpack_js`)
