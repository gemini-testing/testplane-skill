# Keep the project's package manager

**Execution boundary:** follow [interactive consent](interaction.md). The install/build/test instructions below are not permission to execute them. Inspect existing metadata first; do not invoke a launcher that may download a manager or implicitly install packages without consent for that side effect.

Inspect `packageManager`, the lockfile, scripts and parent workspace configuration. Use the version declared by the project. Multiple lockfiles may belong to different workspace boundaries: do not choose whichever manager is already on PATH.

Verify the executable and version **inside the same working directory, environment and
launcher used for install/build/test**, including background jobs. A foreground
`pnpm --version` does not prove which pnpm a detached task used. Record Node's
`process.execPath` and version, the resolved package-manager executable and its actual
version before installing. Preserve the project's intended `PATH` and `CI` mode across
those commands. If they disagree, fix the launcher, not the workspace policy or lockfile.
For pnpm, installation metadata in `node_modules/.modules.yaml` can corroborate which
manager created that installation; do not treat the manifest's `packageManager` string
alone as proof of installed toolchain provenance.

## npm

For an existing, consistent lockfile use `npm ci --no-audit --no-fund`. Run scripts with `npm run <script>`, forwarding test arguments after `--`. If dependencies must change, use the project's normal install/update workflow and commit its resulting lockfile. Do not use a global Testplane executable.

## pnpm

Use the real workspace root and `pnpm install --frozen-lockfile`, then `pnpm run <script>`. Do not create a child `pnpm-workspace.yaml` to evade a root lockfile error. Preserve the installed version's lifecycle-build approval settings; do not enable scripts for every package to fix one native dependency.

The virtual store is an installation detail, not a stable per-test graph. For the normal `node_modules/.pnpm` layout, compose this with existing mapping:

```js
function mapDependencyRelativePath({ reason, relativePath }) {
  if (reason === 'testplane-assert-view-reference') return relativePath;
  const normalized = relativePath.replaceAll('\\', '/');
  if (/(^|\/)node_modules\/\.pnpm(\/|$)/.test(normalized)) return false;
  return normalized;
}
```

Pair it with global invalidation for every relevant package manifest, the **actual** workspace lockfile and installation settings. Do not add `.pnpm/**` to global patterns, create fake package aliases, or promise per-package reruns. Changes made manually inside installed modules without manifest/lock changes are outside this policy.

For `virtualStoreDir`, `nodeLinker: hoisted` or PnP, inspect the actual installed layout. Adapt only the real unstable-store paths and verify them. The matcher above deliberately does not match `.pnpm-other`. Do not switch the user's linker merely to match this recipe.

## Yarn

Yarn Classic: `yarn install --frozen-lockfile --non-interactive`, then `yarn run <script>`. Yarn Berry: use the project's pinned release and its immutable-install workflow, ordinarily `yarn install --immutable`. Do not pass Classic-specific options blindly to a newer Yarn.

For PnP, use Yarn's launcher/resolution hooks and inspect the Testplane/framework integration with that layout. Do not create a `node_modules` workaround or claim PnP was verified based on a Classic run. Protect `.yarnrc.yml`, the relevant lockfile/manifests and loader configuration as global inputs, not the entire package cache.

## Workspaces, package changes, and artifacts

- A root lockfile may live above the application. Include its actual path relative to the runner's working directory (for example `../../pnpm-lock.yaml`) and confirm it resolves. Include package manifests that can affect the app, not only its leaf manifest.
- Local workspace packages that contain application/server code are sources, not disposable external-cache files. Map their original client sources or protect them globally according to role.
- npm/Yarn nested package paths also need scrutiny. Do not silently drop all `node_modules` paths to make warm runs pass. Prefer immutable installation plus explicit dependency-input invalidation if package identity is unstable, and document the precision tradeoff.
- Preserve registry/tarball/workspace provenance. A package reporting `9.3.2` may be a patched local artifact. An approved local tarball must be installed with the existing manager and recorded in its lockfile, not substituted through an undisclosed symlink.
- A failed frozen install is a real blocker to investigate. Never delete lockfiles, force all lifecycle scripts, or install an unrelated latest Testplane to conceal it.

For example, with a workspace root `repo/`, lockfile `repo/pnpm-lock.yaml` and runner
cwd `repo/packages/web/`, the actual lock pattern is `../../pnpm-lock.yaml`, **not**
`./pnpm-lock.yaml`. If the runner instead starts at `repo/`, use `pnpm-lock.yaml`.
Check this in that launcher's actual cwd, then include the resulting pattern with
the relevant workspace/package manifests and settings:

<!-- snippet: pnpm-parent-lock -->
```js
const fs = require('node:fs');
const path = require('node:path');
const lockPattern = '../../pnpm-lock.yaml'; // only for the packages/web cwd above
if (!fs.statSync(path.resolve(process.cwd(), lockPattern)).isFile()) {
  throw new Error('Expected workspace lockfile is missing');
}
```

Verify its expansion with the installed Testplane glob and mutate that **parent**
lockfile's bytes in the isolated acceptance copy: the entire suite must run, then
restore exact bytes and verify warm skips. Changing a nonexistent leaf lock or
testing only a standalone root-lock fixture proves neither this topology nor the
real cwd. `selectivity.sourceRoot` does not change global-pattern resolution.

After an intentional install/config change, rebuild and make a new successful baseline. Mutation checks of global lockfiles/manifests must cause all tests to run. For an actual dependency upgrade, reinstall before asserting application behavior; a whitespace-only lockfile change can separately test just the invalidation mechanism.
