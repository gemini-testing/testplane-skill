# Storybook

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Use the real `@testplane/storybook` lifecycle when the project tests stories through it.
Do not replace generated tests with a hand-written iframe smoke test and call that acceptance.

## Detect and preserve

1. Inspect `.storybook/main.*`, framework/builder versions, addons, preview/decorators,
   story globs, build scripts, server commands and the installed Testplane plugin.
2. Distinguish a static production Storybook from its dev server. Preserve the tested
   lane, framework, stories, controls, play functions, visual tests and production behavior.
3. Use [package managers](../package-managers.md) for installation and local CLI execution.
   Read only the matching bundler module below.

## Configure the preview builder, not just the app

| Detected builder | Existing hook and minimal map setting |
| --- | --- |
| webpack | `webpackFinal`: retain the returned config and set `devtool: 'source-map'`. Follow [webpack](../bundlers/webpack.md) for the existing CSS rules. |
| Vite | `viteFinal`: merge `build.sourcemap: true` into the returned config. Follow [Vite](../bundlers/vite.md) for built versus dev CSS maps. |
| Rsbuild/Rspack | `rsbuildFinal` with `mergeRsbuildConfig`, using [Rspack/Rsbuild](../bundlers/rspack.md). Do not substitute `webpackFinal`. |

Do not assume the app's build options are inherited by Storybook. Preserve existing
async hook logic, addons, virtual entries, aliases and plugins. For webpack, merge the
selectivity-compatible production override after the previous `webpackFinal` resolves:
If an existing `SourceMapDevToolPlugin` owns maps, adjust that generator as described
in the webpack route instead of enabling a duplicate through `devtool`.

<!-- snippet: storybook-webpack-final -->
```js
const previousWebpackFinal = storybookConfig.webpackFinal;
storybookConfig.webpackFinal = async function (config, context) {
  const current = previousWebpackFinal
    ? await previousWebpackFinal.call(this, config, context) : config;
  current.devtool = 'source-map';
  current.optimization = { ...current.optimization, concatenateModules: false };
  return current;
};
```

For an existing Rsbuild Storybook config object, compose its real `rsbuildFinal`:

<!-- snippet: storybook-rsbuild-final -->
```js
import { mergeRsbuildConfig } from '@rsbuild/core';

const previousFinal = storybookConfig.rsbuildFinal;
storybookConfig.rsbuildFinal = async function (config, context) {
  const current = previousFinal
    ? await previousFinal.call(this, config, context) : config;
  return mergeRsbuildConfig(current, {
    output: { sourceMap: { js: 'source-map', css: true } },
    tools: {
      rspack(rspackConfig) {
        rspackConfig.optimization = { ...rspackConfig.optimization, concatenateModules: false };
        return rspackConfig;
      },
    },
  });
};
```

Here `storybookConfig` is the existing object exported by `.storybook/main.*`.
Do not overwrite `tools.rspack` function/array hooks with object spread. Preserve mode,
minification, plugins and CSS injection/extraction. Only the compatible concatenation
override above changes optimization. Follow the matching bundler's tradeoff/approval
and native graph, semantic mutation, unused-control and final default-warm checks.
These are builder API recipes, not proof of a production profile or of every story.

## Plugin and CLI contract

The API below was verified against `@testplane/storybook` 1.7.7 source and installed build.
Recheck the resolved version's implementation/types before adapting other versions.
For a static build, first use the project's existing build and static-server commands.
`storybookUrl` below is that server's actual Storybook URL, not a new fixture server:

```js
testplaneConfig.plugins ??= {};
testplaneConfig.plugins['@testplane/storybook'] = {
  ...testplaneConfig.plugins['@testplane/storybook'],
  remoteStorybookUrl: storybookUrl,
};
```

Retain existing `browserIds`, screenshots and other plugin settings. A configured
`remoteStorybookUrl` avoids the plugin starting its own local development server.
Invoke the installed Testplane command through the existing package manager:

```sh
testplane --storybook
```

`--storybook` is the plugin's activation flag, not a test-selection filter. Without
it, this plugin does not generate its tests. Do not add `--grep`, `--set` or explicit
test paths to selective-read acceptance. Test the generated preview at `iframe.html`,
not merely the manager UI. Preserve the existing server's base path and story index.

## Custom tests use story.testplane

Add only if a semantic assertion is needed. `Primary` is an existing exported story,
and the selector/assertion must describe that component's real behavior:

```js
Primary.testplane = {
  ...Primary.testplane,
  'renders its label': async ({ browser }) => {
    const button = await browser.$('[data-testid="button"]');
    await button.waitForDisplayed();
    if (await button.getText() !== 'Save') throw new Error('Unexpected label');
  },
};
```

`story.testplane` contains custom functions. `testplaneConfig` contains per-story/meta
options. Do not invent `customTests`. `autoScreenshots: false` still allows custom
functions, but do not disable existing screenshots to make this integration pass.
Custom-test success alone is not acceptance of PNG comparison and reference updates.

## Maps, temporary files and narrow exclusions

- Fetch preview JS/CSS and actual map URLs from the tested server, including lazy
  chunks. Reject HTML fallback maps. Verify genuine mappings to local stories,
  components and shared sources in `browser.js` / `browser.css` for their owners.
- Derive `selectivity.sourceRoot` from emitted names and the Testplane working directory.
  `storybook-static` can fit `../src/...` maps from that output, not every builder.
- Compose any dependency mapper with existing package-manager handling. Preserve
  `reason === 'testplane-assert-view-reference'` before exclusions, including PNGs
  beneath `testplane-storybook-autogenerated`.
- Exclude unstable generated test sources only under that confirmed generated directory.
  Exclude `storybook-stories.js` / `storybook-config-entry.js` only for those exact
  root-relative browser names when the local file is absent. Keep real similarly named files.
- Protect real Storybook build/preview configuration and independently identified global
  inputs with matching `disableSelectivityPatterns`. A client decorator or story does
  not become global merely because its edge is missing. Never broadly **discard** stories, app sources or CSS
  with a mapper: returning `false`/`undefined` removes a dependency, it does not guard it.
- For production **Vite**, the [required stylesheet fallback](../bundlers/vite.md#required-production-css-fallback)
  is global invalidation via `disableSelectivityPatterns`, not a mapper exclusion.
  Include all original standalone styles with hidden/add/delete safety and retain JS
  selectivity. Report safe reduced precision, not fully-selective CSS.
- For webpack/Rspack injection without a standalone CSS asset URL, follow
  [live injected CSS maps](../injected-css.md). HTTP CSS absence alone is not missing
  coverage. Preserve the injection stack and any existing mapper result.
- For independent parallel projects, create a different process-local temporary root
  and set `TMPDIR` before starting Node. The plugin empties its generated-test directory
  under `os.tmpdir()`. Separate ports and dependency stores alone do not isolate it.

## Acceptance and fallback

Run [validation](../validation.md) through `--storybook`: real plugin-generated tests,
actual unchanged warm skips, story/component/shared/lazy JS and CSS mutations, unused
controls and restoration. Global guards must cause full reruns. Verify visual references.
Source maps alone are not proof. The inspected patched collector can still lose
top-level dependencies in full-span wrappers over more than two unique originals.
For unresolved client sources, preserve the app and keep selective reads disabled.
Repair the producer/collection boundary rather than adding those sources to global
patterns. Diagnostic write-only is not completed setup.
Never hide builder/story lifecycle changes.

## API sources

Checked 2026-11-05, including CLI gate, config schema, custom-test types and temp cleanup.
- [Plugin CLI and lifecycle](https://github.com/gemini-testing/testplane-storybook/blob/master/src/index.ts)
- [Plugin options](https://github.com/gemini-testing/testplane-storybook/blob/master/src/config.ts)
- [Story types](https://github.com/gemini-testing/testplane-storybook/blob/master/src/types.ts)
- [Generated test directory](https://github.com/gemini-testing/testplane-storybook/blob/master/src/storybook/story-to-test/index.ts)
- [Storybook builder hooks](https://storybook.js.org/docs/builders)
- [Rsbuild hook merging](https://storybook.rsbuild.rs/guide/configuration)
- [webpackFinal](https://storybook.js.org/docs/api/main-config/main-config-webpack-final) (hook/override API checked 2026-11-06)
