# Vue and single-file components

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this for `.vue` originals or Vue-specific map issues. Plain JavaScript render
functions normally use the detected bundler module without a separate Vue workaround.

## Detect and preserve

1. Inspect the Vue/compiler versions, `.vue` usage, scoped styles, preprocessors,
   aliases, SSR/hydration and framework-owned config.
2. Keep the existing integration: for example `@vitejs/plugin-vue`, webpack's
   `vue-loader` plus `VueLoaderPlugin`, or the project's Rspack-compatible loader/plugin.
   Do not replace a working integration or add duplicate plugins.
3. Preserve SFCs, setup syntax, render behavior, production optimization and startup.
   Do not rewrite components into JS render functions to bypass a collector limitation.
4. Read only the relevant [Vite](../bundlers/vite.md), [webpack](../bundlers/webpack.md)
   or [Rspack/Rsbuild](../bundlers/rspack.md) module. Handle dependency changes through
   [package managers](../package-managers.md).

## Verify the installed Testplane artifact first

The inspected pristine published Testplane 9.3.2 JS collector accepts JS/TS-family
extensions but filters out `.vue` before `mapDependencyRelativePath` is called.
A mapper cannot recover an original already removed by that filter.
The inspected local patched collector includes `.vue` and `.svelte`. A matching package
version string does not establish that those changes are installed or published.
Inspect the resolved artifact's extension filter and confirm browser evidence.
There is no demonstrated public config option that adds arbitrary source extensions.

Do not rename map entries to fictitious `.vue.js` files or change component filenames.
Eligibility only allows an original to proceed through collection, not a guarantee
that every compiled function, top-level dependency or style input will be observed.

## Minimal changes and real maps

Keep the current Vue compiler and enable maps through its existing bundler pipeline.
For webpack, retain both the existing `.vue` loader rule and its companion plugin.
For Rspack, use the loader/plugin matching the installed stack, not a webpack import
copied blindly. For Vite, preserve the existing Vue plugin and its options.

Fetch JS/CSS loaded by the tested route and their linked or inline maps. Check genuine
mappings back to local `.vue` sources and original contents, not generated render modules.
Reject status-200 HTML in place of a map. Strip query metadata only when its precise
meaning and mapping to a real source have been verified. Derive `sourceRoot` from
the emitted names and working directory, not from another project's config.

Dev and built Vite responses have different roots and transforms. Do not transfer
production path handling to basename-style dev maps or optimized-dependency maps.
Use the Vite module's separate dev audit when tests genuinely use that server.

## When SFC edges are absent

Repair supported producer mappings or identify a compatible published collector.
Any dependency upgrade or new heavy check requires its own approved scope. If the
installed collector cannot track the real component, report that limitation and
keep selective reads disabled. Do not append component paths to
`disableSelectivityPatterns` to compensate for absent edges.
Preserve genuine global build/config/lockfile and server inputs separately.

## Styles and acceptance

Scoped styles and preprocessed styles need genuine composed final CSS maps.
A `.vue` JS dependency can conservatively protect changes inside that same file,
but does not prove `browser.css` coverage or protect separate imported style files.
Check external CSS, Sass/Less inputs and theme files independently.

After consent, run [validation](../validation.md): require `.vue` in `browser.js`,
not a full rerun caused by newly globalized component paths.
Change real script/template output, rebuild and confirm owners run with the changed DOM.
Separately change component-local style and external CSS and check computed styles.
Include shared/lazy components, unused controls, restoration and actual unchanged warm
skips. Write-only is diagnostic, not a completed setup.
Full-span bundles over more than two unique originals can still lose top-level
dependencies even with the inspected extension-filter patch. Maps alone do not prove safety.

## API sources

Checked 2026-11-05, with published and local Testplane collector behavior distinguished.
- [Vue tooling](https://vuejs.org/guide/scaling-up/tooling.html)
- [Vue SFC specification](https://vuejs.org/api/sfc-spec.html)
- [Vite Vue plugin](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- [Vue loader and companion plugin](https://vue-loader.vuejs.org/guide/)
