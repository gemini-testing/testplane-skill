# React: JSX and runtime boundaries

**Execution boundary:** follow [interactive consent](../interaction.md). Inspect existing artifacts first; build/server/browser phases require user approval.

Read this only when JSX/TSX mapping, React runtime resolution or hydration affects
the integration. Ordinary React builds need the detected bundler module, not a React flag.

## Detect and preserve

1. Identify the app framework, bundler, React version and JSX transform. Follow the
   existing Babel/SWC/Oxc/esbuild or framework config, not a guessed new loader.
2. Keep classic versus automatic JSX runtime, import source, plugins, aliases,
   production definitions, React singleton resolution and existing application entry.
3. Preserve client rendering versus hydration. Do not replace `hydrateRoot` with
   `createRoot`, disable SSR, remove Strict Mode or add extra renders for coverage.
4. For dependencies and workspace links, use [package managers](../package-managers.md).
   For Storybook use [Storybook](storybook.md) as the entry point.

## Minimal change belongs to the bundler

Enable full, composed maps in the existing transform and output pipeline. Choose only
the actual [webpack](../bundlers/webpack.md), [Rspack/Rsbuild](../bundlers/rspack.md),
[Vite](../bundlers/vite.md), [esbuild](../bundlers/esbuild.md),
[Rollup](../bundlers/rollup.md) or [Parcel](../bundlers/parcel.md) module.
Do not add a second React plugin or an imaginary React selectivity compiler option.

Check that served maps resolve to the real `.jsx`, `.tsx`, `.js` or `.ts` inputs,
not an intermediate JSX transform. These extensions are accepted by the inspected
published JS collector, but extension eligibility is not evidence of runtime coverage.
Derive paths from actual map names, source roots and the Testplane working directory.
Fetch external maps through the tested server, rejecting HTML fallback responses,
or decode inline maps. Require the original components in each owner's `browser.js`.

## Bundles and bare imports

The full map can include React, JSX runtime and app sources. The published Testplane
`9.3.7` collector drops a full-span wrapper with more than two unique nonempty originals
across that map, even if the application excerpt shows only two files.
Shared constants, module initialization and top-level JSX may lack another executed
range. Neither good maps nor a passing render proves those files are protected.
For an existing esbuild split ESM build, evaluate the targeted dependency-entry remedy
in the [esbuild route](../bundlers/esbuild.md) to repair real ownership. Do not add a
source-global guard for missing client edges. This is a build boundary remedy, not
a React flag; if it does not resolve ownership, keep selective reads disabled.

Keep bundled IIFE/ESM production behavior. Do not silently switch to unbundled ESM,
change HTML script types or create a vendor bridge. If the app already serves native
modules, verify its existing resolution for `react`, `react-dom/client` and the JSX
runtime specifiers actually emitted by its transform. Preserve one compatible React
instance. Do not copy import maps or helper exports from an unrelated example.

## CSS and unresolved ownership

CSS Modules, extracted styles and CSS-in-JS have different dependency paths.
Verify served CSS maps and `browser.css` separately. A CSS-in-JS source may be protected
by a verified JS file dependency, but that is not an invented CSS source-map edge.
Include external theme/token inputs in validation rather than assuming they are covered.

If client coverage remains unresolved, preserve the app and leave selective reads off.
Do not patch an incomplete graph with `disableSelectivityPatterns`.
Use collection-only mode only if collection is already known to succeed, otherwise
use Disabled. The separate production Vite stylesheet-only policy remains explicit.
For a known successful collection lane:

```js
config.selectivity = {
  ...config.selectivity,
  enabled: 'write-only',
  saveIncompleteDumpOnFail: false,
};
```

Do not enable selective reads until [validation](../validation.md) proves original
component/shared/lazy/top-level mutations rerun their owners and change the UI correctly.
Check styles, unused controls, restoration and an unchanged warm run as well.
Require actual unchanged warm skips and owner reruns, with full style reruns only for
the documented stylesheet policy. Write-only is diagnostic, not a completed setup.
Browser-driven app tests are not evidence that Testplane's separate browser-environment
component runner collects the same selectivity dependencies.

## API sources

Checked 2026-11-05. React APIs explain rendering semantics, not Testplane support.
- [React existing-project integration](https://react.dev/learn/add-react-to-an-existing-project)
- [Client roots](https://react.dev/reference/react-dom/client/createRoot)
- [Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
