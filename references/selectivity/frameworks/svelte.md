# Svelte: component and style dependencies

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this for `.svelte` originals. For a Vite build also read [Vite](../bundlers/vite.md).
Do not interpret a plain Vite fixture as proof for Svelte or SvelteKit.

## Detect and preserve

1. Identify Svelte/compiler/plugin versions, preprocessors, `svelte.config.*`,
   Vite/framework config, SSR/hydration, routes and the tested production/dev lane.
2. Preserve the existing Svelte or SvelteKit plugin, compiler options and CSS emission.
   Do not add a second `svelte()` plugin to a framework-managed pipeline.
3. Keep component files, scoped selectors, mounting, hydration, lazy loading and
   optimization. Do not move inline styles into invented source files for coverage.
4. Follow [package managers](../package-managers.md) for dependency and workspace setup.

## Check extension eligibility, then coverage

The inspected pristine published Testplane 9.3.2 JS collector filters out `.svelte`
before the dependency-path mapper. The inspected local patched collector permits it.
Do not infer patch availability from a package version string or a different app's report.
Inspect the actual installed artifact and retain the exact runtime identity in evidence.
There is no verified public extension-allowlist setting to turn this on by configuration.

Enable full build maps through the existing bundler. Preserve compiler/preprocessor
map composition and filenames. Do not invent obsolete compiler options: in Svelte 5,
`enableSourcemap` was removed and compiler maps are generated for tooling to consume.
Compiler map generation is not the same as final asset map emission.

Fetch the JS/CSS that the browser actually loads. Follow linked maps through the real
server, or decode inline maps. Require genuine mappings and original local `.svelte`
contents. Reject HTML responses masquerading as maps. Resolve actual map names against
the correct root and Testplane working directory, not a universal `src` or `dist` root.
Require expected components in each owner's `browser.js`, not only in `sources[]`.

## Three different CSS situations

| Situation | Required protection |
| --- | --- |
| Final CSS map genuinely resolves to the component/style inputs | Verify those originals in `browser.css` and mutate them. |
| Style block is inside a `.svelte` file already tracked in `browser.js` | The whole component file hash can protect an inline-style edit. Prove owner reruns and changed computed style. |
| External CSS/preprocessor input has no final tracked map | Repair the map pipeline, or use the explicit stylesheet-only policy when this is the documented production Vite lane. Otherwise keep selective reads disabled. |

The second row is JS-file protection, not fabricated CSS coverage. Do not require or
claim a nonexistent `browser.css` edge for it. Imported external CSS is a separate input.
The compiler's intermediate `css.map` does not prove that the final emitted stylesheet
has a map, an annotation, a reachable URL or correct post-transform positions.

Do not apply a plain-CSS identity-map/externalizer recipe to scoped Svelte CSS.
Selector rewriting, concatenation and minification require real composed maps.
Keep CSS injection/extraction behavior unchanged unless the user approves a change.

## Unresolved component coverage

Missing component JS edges block selective reads. Diagnose the supported producer,
map chain and installed collector instead of adding component roots to
`disableSelectivityPatterns`. Do not treat script/template code
as a stylesheet merely because the component also contains a style block.

The explicit production Vite stylesheet-only policy covers standalone style inputs,
including its declared preprocessor inputs. It does not cover missing `.svelte` JS
edges. Preserve genuine server/build/config inputs and report any unresolved source.

## Acceptance

Use [validation](../validation.md) with real component script/template changes,
component-local style changes and separate external CSS changes. Rebuild where needed
and confirm owner execution, changed DOM and computed styles with selectivity disabled too.
Include entry/shared/lazy JS, unused controls, restored inputs and unchanged warm runs.
Require actual warm skips, expected component owners and, for the documented Vite
stylesheet-only policy, full reruns on standalone style changes. Write-only is diagnostic,
not completed setup or proof of safe skips.
Even an eligible `.svelte` original can disappear when its only executed range is a
full-span wrapper over more than two unique originals in the inspected patched collector.
Do not infer safe selective reads from a map, compiler output or passing baseline alone.
SvelteKit server-only inputs require separate protection, not a client-coverage claim.

## API sources

Checked 2026-11-05 against actual Svelte/Vite config and compiler documentation.
- [Svelte compiler results and preprocess maps](https://svelte.dev/docs/svelte/svelte-compiler)
- [Svelte 5 compiler-option changes](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Vite Svelte plugin configuration](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md)
