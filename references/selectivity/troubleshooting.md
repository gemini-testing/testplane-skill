# Selectivity troubleshooting

**Execution boundary:** read [interactive consent](interaction.md) first. Diagnose retained files/logs before proposing any new heavy reproduction.

Read only when a shared or stack-specific acceptance check fails. Diagnose the exact installed package, not a similarly versioned local archive.

| Symptom | Check and safe next action |
| --- | --- |
| No skips on unchanged rerun | Confirm nonempty suite, no CLI selection filters, enabled read mode, persistent same store, successful baseline and valid reports. Check every global pattern resolves files and whether generated outputs are accidentally watched. |
| Every test always reruns | Check unmatched optional patterns, changing server/build outputs, timestamps/reports inside static roots, lockfile churn, unstable Node module paths, and whether the previous run failed. Do not remove global safety coverage just to increase skips. |
| App source mutation is skipped | Inspect original source in its owner's browser graph, map body/URL/base, transformations and real executed range. Fix the producer/mapping/collection path. Propose a Disabled semantic control if needed. Keep reads off while unresolved; do not add the missing client input to global patterns. |
| CSS file appears in maps but not in dependencies | Verify stylesheet actually loaded and rule exercised, complete upstream maps, real CSS `sourceMappingURL`, final map serving, and original path resolution. Vite built CSS and Svelte extracted CSS have special limitations; read their variants. |
| Missing/404 map or empty map | Fix generation/serving, including MIME, `SourceMap` header/comment and authentication. Do not synthesize identity maps for transformed code or disable fetch errors. |
| Absolute, URI, percent-encoded or query-bearing source paths | Prefer correct producer `sourceRoot`/paths. Map only an observed reversible mismatch to an existing original. Avoid double percent-decoding and blanket URI/missing-file filtering. |
| Vue/Svelte original absent | Confirm installed collector supports that extension and transformed virtual modules map back to the real component. A private fix at the same package version is not proof. Report unsupported collection with reads off, not a component-global workaround. |
| Bundled top-level/IIFE code missing | Some collectors discard whole-bundle wrapper coverage. Multiple originals in a map are not automatically retained. Inspect the installed implementation and retained graph, then use a compatible producer remedy. Do not rewrite app execution or switch output format silently. If unresolved, report blocked precision with reads off. |
| Dependency present only after forced replay click/navigation | Reject the artificial proof. Test the real user flow and its actual lazy/navigation boundaries. Late metadata and navigation fixes are artifact-specific. |
| Screenshot update reruns everything | Check global patterns accidentally include references. Mapper exclusions cannot undo global invalidation. Discover actual `screenshotPath`, exclude just those references from globals, and keep per-test PNG dependencies. |
| pnpm warm run is unstable | Read the package-manager recipe. Exclude only the actual unstable virtual store, preserve workspace source packages and references, and globally monitor manifests/lock/settings. |
| Storybook generated/phantom paths break hashes | Read the Storybook recipe. Exclude only identified generated/phantom entries, retain real stories/components/preview config and pair exclusions with justified global inputs. |
| Browser session shares CSS/storage between tests | Inspect supported per-browser isolation or project session-reuse policy. Verify before/after, do not assume isolation defaults or apply Chromium options to unsupported browsers. |

## Safe completion when precision is impossible

Do not change required expectations to match an incomplete graph. List the unresolved client edges and the evidence needed to repair them, but do not turn that list into global patterns. Leave `Enabled`/`ReadOnly` off until the integration is proven. `WriteOnly` is useful only while collection itself succeeds, otherwise use `Disabled`. Keep independently justified server/build/config/static protections and the documented Vite stylesheet-only policy. None permits disguising a missing client JS/component edge as reduced precision.

Do not weaken UI assertions, remove tests, ignore errors, approve changed screenshot references, or mutate Testplane runtime in the user's project. If a framework-level bug requires a package upgrade or patch, show the concrete reproducer and exact artifact requirement. Use an approved release/tarball through the original manager, then rebuild a fresh store and repeat acceptance.
