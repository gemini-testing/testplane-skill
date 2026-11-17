# Live injected CSS: discover the genuine map

**Execution boundary:** follow [interactive consent](interaction.md). Decode retained map evidence offline first; capturing new live CSS through a server/browser requires explicit approval.

Read for an existing webpack/Rspack injection stack, including Storybook preview.
Injected `<style>` content can have a genuine inline map without a standalone CSS
HTTP asset. Absence from an HTTP asset list alone does not prove missing coverage.
Keep the loader map chain and injection pipeline, not a replacement extraction build.

## Observe, do not alter resolution

Temporarily wrap the public `mapSourceMapUrl` of the resolved Testplane config. The
inspected installed 9.3.7 callback receives `{ type, sourceUrl, sourceMapUrl }` and
returns a URL, `true` (unchanged) or falsy (discard). Recheck the installed declaration.
Capture only naturally observed CSS entries during the original tests:

<!-- snippet: injected-css-observer -->
```js
const observedCssMaps = []; // local to this config/worker, not shared master state
const previousMap = config.selectivity.mapSourceMapUrl;
config.selectivity.mapSourceMapUrl = function (asset) {
  const mapped = previousMap ? previousMap.call(this, asset) : true;
  if (asset.type === 'css') observedCssMaps.push({ ...asset, mapped });
  return mapped; // preserve false/undefined/true/URL exactly, including earlier policy
};
```

Save diagnostic records per process/run outside watched inputs, without secrets.
Inspect the observed URL and the effective earlier mapper result separately. If an
earlier mapper discarded it, keep that fact visible rather than changing the return
value for this observation. Do not add browser reads, clicks, `execute`, fake maps or
CDP events to populate the list. An empty list is a diagnostic lead, not a full
ownership verdict: also inspect the actual collector/map chain and dependency dump.

## Decode the captured payload offline

For the observed JSON data-URL forms only (base64 or percent-encoded):

<!-- snippet: decode-inline-css-map -->
```js
function decodeInlineCssMap(url) {
  const match = /^data:application\/json(?:;charset=[^;,]+)?(;base64)?,([\s\S]*)$/i.exec(url);
  if (!match) throw new Error('Inspect this map transport separately');
  const text = match[1]
    ? Buffer.from(match[2], 'base64').toString('utf8')
    : decodeURIComponent(match[2]);
  return JSON.parse(text);
}
```

For a real external URL, audit that URL through the existing server instead.
Require genuine nonempty mappings and resolve `sourceRoot`/`sources` to the actual
local originals. Embedded content/hashes can corroborate baseline provenance, but
are not native ownership or a universal current-content gate. Verify each necessary
original in the owner's **`browser.css`**, then independently mutate meaningful CSS
and observe its original semantic assertion/response. A map URL alone is not proof.
Follow [acceptance](validation.md), including restored default cold/warm after removing
diagnostics. Offline decoding is not new runtime acceptance or a performance result.
