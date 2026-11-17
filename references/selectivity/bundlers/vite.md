# Vite

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this module for Vite. Add [Vue](../frameworks/vue.md),
[Svelte](../frameworks/svelte.md) or [Storybook](../frameworks/storybook.md) only if present.

## Detect the tested lane

1. Resolve the existing Vite config, plugins, root, mode, build script and asset server.
   Distinguish a production build served statically from a Vite development server.
2. Record the installed Vite version. Use that version's Rollup or Rolldown options,
   not a mechanical rename of `rollupOptions` to `rolldownOptions`.
3. Preserve framework plugins, aliases, base path, SSR/hydration, CSS pipeline,
   minification, code splitting and application startup. Do not switch to dev as a fix.
4. Use [package managers](../package-managers.md) for dependency and workspace changes.

## Minimal settings, different purposes

Within the existing config factory, `command` is Vite's factory argument and `config`
is the config it would otherwise return. Merge these fields before returning it:

```js
config.build = { ...config.build, sourcemap: true };
config.css = { ...config.css, devSourcemap: command === 'serve' };
```

`build.sourcemap` requests build maps. `true` links separate maps, while `'inline'`
embeds them. `'hidden'` emits maps without the normal bundle annotation.
`css.devSourcemap` is a development option, not a production CSS-map switch.
Do not infer production CSS coverage from either flag being present.

## Required production CSS fallback

Per-test CSS selectivity is currently unsupported by this skill's default
production Vite recipe, including Storybook with the Vite builder. The inspected
Vite 8.3.4 / Testplane 9.3.7 setup lacks reliable final production CSS source maps.
This is a limitation of the bundler's CSS-map pipeline, not a reason to disable
JS selectivity. `build.sourcemap: true` does not repair that CSS pipeline.

This is an explicit stylesheet-only input-class policy, not permission to globalize
client JS or component files discovered missing from a dump. For a normal setup,
apply this fallback before enabling selective reads:

1. Add all original standalone stylesheet inputs to `disableSelectivityPatterns`,
   including currently unused styles, CSS Modules and the project's preprocessor
   inputs. Discover actual extensions such as `.css`, `.pcss`, `.postcss`, `.scss`,
   `.sass`, `.less`, `.styl` and `.stylus`. Include imported themes/tokens and
   workspace packages outside `src`; do not copy one root as a universal recipe.
2. Preserve existing server/static/config guards and reference exclusions. Do not
   guard generated CSS/maps, caches or all of `node_modules`, and do not hide CSS
   dependencies with a mapper returning `false`.
3. Use stable positive patterns with an existing sentinel as described in
   [safety](../safety.md). Check hidden, ignored and untracked style inputs
   and additions, deletions and removal of the last style. A glob that misses
   discovered inputs is not sufficient; neither is a dynamic list of current files.
4. Component-local style blocks are not standalone files. Follow the Vue/Svelte
   module: a proven `browser.js` dependency on the whole component file can protect
   an inline-style change without a CSS map. If that component edge is missing,
   repair its collection or keep selective reads disabled, not guard component roots.
   Never assume this also protects separately imported styles.

Always leave an explanatory comment next to the actual guard in the generated or
updated Testplane config. State the
bundler limitation, full-suite reruns on style changes, and preserved JS selectivity.
Also report this reduced precision in the handoff. If the config format cannot
contain comments, emit an explicit setup/console message and document the reason
beside that configuration. Do not silently leave the explanation only in this skill.

Example merge for a project whose standalone styles are all under `src/`:

```js
// Vite's final production CSS source maps are not reliable in this setup.
// Style changes rerun all tests to avoid unsafe skips; JS selectivity is preserved.
config.selectivity.disableSelectivityPatterns = [
  ...(config.selectivity.disableSelectivityPatterns || []),
  '{package.json,src/**/*.{css,pcss,postcss,scss,sass,less,styl,stylus}}',
];
```

Adapt roots/extensions and audit the installed glob's expansion as described in
[safety](../safety.md); this example alone does not cover hidden or external roots.
The sentinel `package.json` keeps the group nonempty after the last style is removed;
it must remain in the same pattern string, not a separate array entry.
When styles share `src` with JS, match only the audited stylesheet extensions, not
the whole source directory. Add explicit patterns for discovered hidden or external
style locations and keep each optional group nonempty with an existing sentinel.
Verify content/add/delete/last-file changes and that JS-only changes do not change
the stylesheet pattern hash.
A guarded style change must rerun the full suite, even for an unused stylesheet.
An unchanged warm run must still skip tests. Classify this as **safe but reduced
precision**, not fully-selective CSS support or permanently disabled selectivity.

## Built application: inspect final CSS

The inspected Vite 8.3.4 build emitted JS maps but did not automatically provide
usable final CSS maps. Treat other versions and plugin chains as unverified until inspected.

1. Inspect the CSS loaded by the page and its final `sourceMappingURL`.
2. If CSS already has genuine composed maps, keep that pipeline. Check imports,
   preprocessors, CSS Modules, component styles, minification and concatenation.
3. A PostCSS map option alone may not cause Vite to execute PostCSS for plain CSS.
   A compiler/preprocessor's intermediate map does not prove final asset emission.
4. Extending the CSS-map pipeline is a separate, explicitly approved task, not a
   prerequisite for normal setup. Carry real maps through every transform, emit the
   final map and annotation, and verify the server returns that exact map.
5. Do not copy a byte-preserving, single-original fixture externalizer into an
   arbitrary pipeline. It cannot compose transformed or concatenated CSS mappings.
   Never manufacture identity mappings or label generated CSS as its original.

Do not remove this guard merely because a plugin emits `.map` files or lists the
expected sources. Any later removal requires correct mappings through concatenation
and minification, served-map checks, actual per-test browser edges and independent
style/unused-input mutation proof on the project's real pipeline. Do not silently
disable CSS minification, change asset naming or change component style handling.

## Development server: audit separately

- Examine actual transformed responses and inline maps for application JS and CSS.
  Check that JS maps lead to original source, not already rewritten import statements.
- App maps may use basenames, CSS may use absolute names, and optimized dependencies
  may be relative to Vite's dependency-cache directory. One copied root need not fit all.
- `/@fs/`, query-bearing component modules and virtual clients need precise,
  version-checked handling. Do not broadly exclude application `/src/` or dependency maps.
- Fix a missing JS transformation/map at the existing compiler stage. A targeted
  Oxc transform was needed in one inspected Vite 8 dev setup, not every Vite project.
- Keep dev evidence separate from production evidence. HMR or a passing dev render
  cannot establish production selective-read safety.

## Paths and real browser dependencies

Fetch loaded JS/CSS and external maps through the same server/base path as tests.
JSON maps must have genuine mappings and correct local originals. A 200 HTML fallback
is an error, and unknown map URLs should not return the app shell.
For inline maps, decode the actual served annotation.

Derive `selectivity.sourceRoot` from map labels and the Testplane working directory.
For build outputs, the installed bundler's `output.sourcemapPathTransform` can adjust
source names when supported. Resolve relative names against the map file's directory,
not an assumed repository root. Do not rewrite already absolute URLs by guessing.
JS path fixes do not fix independent CSS-map paths. Inspect both.
Require expected originals in each test's `browser.js` / `browser.css` scopes.

## Acceptance and conservative fallback

Full-span bundles with more than two unique nonempty originals can lose top-level
dependencies even in the inspected patched Testplane collector. `preserveModules`,
inline maps or switching module format is not a general repair. Do not rewrite
constants or startup side effects into functions just to manufacture coverage.

If expected client dependencies remain missing, retain the app, diagnose the actual
producer/collection boundary and leave selective reads disabled. Do not add unresolved
client paths to `disableSelectivityPatterns`; the stylesheet-only policy above is not
an escape hatch for missing JS/component edges.
For component-local styles, follow the framework module instead of inventing CSS edges.
Preserve observable app behavior, not a broken baseline. Explain bounded repairs and
verify the original tests without silently switching the tested dev/production lane.
Complete [validation](../validation.md) against the chosen lane with real source
mutations, rebuilt assets where needed, DOM/style checks, unused controls and restoration.
The documented stylesheet-only policy must produce actual unchanged warm skips and
full reruns for style changes. Write-only is diagnostic, not a completed selectivity setup.

## API sources

Checked 2026-11-05, alongside actual Vite configs and served-map evidence.
- [Vite build options](https://vite.dev/config/build-options.html)
- [Vite CSS and transform options](https://vite.dev/config/shared-options.html)
- [Rollup source-name transformation](https://rollupjs.org/configuration-options/#output-sourcemappathtransform)
- [Rolldown output options](https://rolldown.rs/reference/Interface.OutputOptions#sourcemappathtransform)
