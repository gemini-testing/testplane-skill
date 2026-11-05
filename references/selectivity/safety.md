# Global inputs and screenshot references

**Execution boundary:** read [interactive consent](interaction.md) first. Mutation/browser checks here are conditional on user approval, not automatic setup steps.

Read this for every integration. Browser coverage does not account for server-only code or arbitrary assets. A partial browser graph can still cause unsafe skips, even if most dependencies look correct.

## 1. Classify the actual project

Build an inventory from routes, imports, build scripts, the static server, workspace configuration and screenshot naming. Do not infer that a directory is unused because it is absent from a previous dump.

| Input | Protection |
| --- | --- |
| Original browser JS/TS, CSS and component sources | Per-test browser dependencies, proven by mutations |
| Backend, SSR, API handlers, middleware, templates, server-used shared modules, any language | Global inputs, including files outside the app package when relevant |
| HTML, fonts, application images, icons and other untracked static assets | Global inputs, including assets outside `public` and HTML entry points |
| Dependency manifests/lockfiles, install/workspace settings, build and Testplane configs, plugins/helpers that affect the run | Global inputs |
| Genuine `assertView` reference PNGs | Per-test reference dependencies, **not** global inputs |
| Dependencies, build output, generated maps, stores, reports, actual/diff screenshots, caches and logs | Normally not global inputs: protect their stable source/config inputs instead |

A file may have both server and browser roles. Proven server use still requires global invalidation. SSR frameworks often mix roles in route/component trees: classify the actual server inputs carefully instead of guarding a client tree because its ownership is unclear. Do not claim that every file in an unknown framework is covered automatically.

### Missing client dependencies are a defect, not a classification rule

Do not add a client JS/TS module, component, or unexpectedly absent stylesheet to `disableSelectivityPatterns` because it is missing from a dependency dump or a mutation was skipped. Do not ask the user to maintain such a list or broaden a source-directory guard to conceal the gap. Fix the producer, source mapping or collection compatibility using the matching route. If it remains unresolved, report the exact limitation and keep selective reads disabled, rather than calling global reruns successful tracking.

Build scripts, server code, configuration, lockfiles, templates and static assets remain legitimate global inputs when their role is independently established. This does not depend on whether they happened to appear in a browser dump. The documented Vite **stylesheet-only** production policy is also an explicit input-class limitation, not a rule for patching missing client JS or component edges. Do not extend that policy to a component/source tree merely because one of its dependencies is absent.

Inventory all static roots and file types actually served. HTML/font/image extensions are a minimum, not an exhaustive definition of static content. Include root HTML and hidden, ignored and untracked inputs. Do not use `git ls-files` as the complete inventory. Do not exclude a directory just because its name contains `refs`, `test` or `fixtures`.

File patterns cannot detect changed environment flags, remote API data, databases or externally deployed backends. Preserve the project's explicit invalidation policy or isolate/rebuild dependency stores by the relevant environment and deployment identity. Do not read or expose secrets to construct a key. If an uncontrolled external input can change an assertion, selective reads are not proven safe for those tests.

### Audit configuration paths explicitly

Do not stop at root-level bundler and Testplane config filenames. Inspect the actual loader/transpiler configuration used by the test command and build, including nested test configuration such as `testplane-tests/tsconfig.json`, inherited configuration and relevant parent workspace files. Record the actual paths, their role and how each is protected. A missing Node/browser dependency edge is not evidence that the file is irrelevant.

Use the discovered paths in stable positive `disableSelectivityPatterns` groups. Do not invent a nested config that the project does not have. Do not globalize all tests or recursively hash every `tsconfig` under `node_modules`, caches and generated output. Test sources and reference PNGs retain their own dependency/ownership rules even when a configuration file lives beside them. If a file is excluded as genuinely unused, record the evidence and the boundary of that decision rather than silently dropping it by directory name.

For each declared configuration input, run an independent reversible, valid mutation from the same frozen baseline. A global input must rerun the required suite and update the corresponding native pattern hash. Restore its exact bytes and the frozen state before the next control. A whitespace-only JSON mutation tests the conservative byte-invalidation policy; it is not proof of a semantic behavior change or a broken UI assertion. Keep that observation separate from a deliberate semantic mutation and its Disabled control. See [validation](validation.md) for baseline and evidence requirements.

## 2. Configure stable positive patterns

### Disjoint global-input directories

Prefer stable positive patterns when server/static inputs and screenshot references have separate roots. The inspected Testplane implementation expands **each pattern independently**, then recursively reads matched directories, including their hidden contents. Matching a directory such as `public` is different from `public/**/*`.

A project-specific example, only when every file under `public`, `server` and `api` is a global input and **no reference lives there**:

```js
const projectGlobalInputPatterns = [
  '{package.json,package-lock.json,npm-shrinkwrap.json,pnpm-lock.yaml,yarn.lock,pnpm-workspace.yaml,.npmrc,.yarnrc,.yarnrc.yml}',
  '{package.json,index.html,*.html,server,api,public}',
  '{package.json,testplane.config.*,webpack.config.*,vite.config.*,build.mjs,scripts}',
];
```

Adapt this to the discovered inputs, real working directory, actual config filenames and parent workspace files. It is not a complete default. `scripts` must not contain generated outputs or reference images. Include all real server roots, not only these names. Literal directory roots cover new/deleted files and dotfiles. A stable existing sentinel (`package.json` here) keeps an optional group nonempty when a root is absent or its last file is removed. Put it in the **same pattern string** as the optional inputs, not a separate array entry: each pattern is evaluated independently. Testplane hashes both matched paths and their contents, so stable groups detect content changes, additions, deletions and renames.

Check expansion using the **installed Testplane glob implementation**, not minimatch or a shell. Do not assume escaping and glob semantics match another library. Verify paths containing glob metacharacters explicitly; if they cannot be represented reliably, report the limitation and keep selective reads disabled.

### References nested inside static/server roots

For a precisely known, reference-only immediate directory such as `public/refs`, a positive extglob can sometimes avoid it: `{package.json,public/!(refs)}`. This is **not a general recipe**: it does not exclude deeper reference directories and needs separate handling/proof for dot-prefixed entries. Do not append `/**/*.png` and assume it covers root images.

For mixed layouts, select only audited global-input subtrees and file naming patterns while leaving actual references out. A matched directory is recursively expanded, so it must not contain reference PNGs at any depth. Keep optional groups nonempty with an existing sentinel and verify hidden files, future additions and deletions. If complete coverage and reference exclusion cannot both be expressed reliably, report the layout limitation and keep selective reads disabled rather than broaden the patterns or move references.

### Invalid approaches

- `['public/**/*', '!public/refs/**']` is **not** an include/exclude list. The negative entry is evaluated independently and may match nothing. Functions, regular expressions and objects are not the supported `string[]` API.
- `**/!(refs)/**` does not mean “exclude every directory named refs”.
- A dynamic array of individual filenames can miss deletions because removed keys are never compared. Use stable directory patterns or fixed brace groups with an existing sentinel.
- Hashing just filenames, mtimes or a Git index misses content or untracked changes.
- Hashing all of `node_modules`, build output, source maps or the dependency store causes slow or permanently invalidated runs and does not prove source coverage.
- A broad `**/*`, or all application sources as global inputs, is not a successful fine-grained integration.

## 3. Preserve reference ownership

Inspect `screenshotsDir` and `getScreenshotPath` customizations, the existing PNG tree and actual `assertView` calls. A directory name is not evidence of ownership. Do not move references or change their names just to simplify patterns.

Exclude only verified reference files or exclusively reference-owned subtrees. Application PNGs remain global even if located beside references. Keep other unobservable file types global if they share a reference directory. Preserve `reason === 'testplane-assert-view-reference'` **before** any mapper normalization or filtering, as shown in [configuration](configuration.md).

If reference and application PNGs share the same directory, derive their exact ownership from the project's naming contract/tests and verify that the positive patterns match application images but not references. Do not exclude all PNGs or replace stable patterns with a generated list of current files. A stale dependency dump alone is not a complete reference inventory. Unknown files are global until classified. Update the patterns and rebuild the baseline when the layout or naming policy changes.

## 4. Prove safety before enabling reads

Use [acceptance](validation.md): stable warm skips, then independent content/add/delete mutations for globals, including removal of the last optional file, a hidden file, and an ignored/untracked input. Test HTML, a font, an application image and server code separately. Restore the same frozen baseline for each mutation.

Run genuine visual tests: changing one existing reference should execute its owner, not every unrelated visual test. A new unrelated reference must not invalidate the entire suite when the reference policy explicitly covers it. Changing a neighboring application image must invalidate globally.

**Exit code zero is insufficient.** Inspect logs for missing-pattern/hash/map errors and `Couldn't update selectivity state`, confirm that expected dump files were actually written, and verify the next warm run. In the inspected runtime a state-save error can be reported as a warning without a failing exit status. No positive claim is allowed with an incomplete or stale dump.

If classification is unresolved, keep skips disabled for the affected integration and report the uncertainty. Do not silently omit uncertain inputs or invent a client-source guard. Reduced precision is reserved for the explicit, independently justified input-class policies above.
