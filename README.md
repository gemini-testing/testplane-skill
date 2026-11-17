<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="images/logo-dark.svg" width="300">
        <source media="(prefers-color-scheme: light)" srcset="images/logo-light.svg" width="300">
        <img alt="html-reporter logo" src="images/logo-light.svg" width="300">
    </picture>
</p>

<p align="center">⚡ Supercharging AI Agents with Testplane CLI</p>

<p align="center">
    <a href="https://testplane.io/blog/cli-and-skill/">Read the blog post to learn more</a>
</p>

### Installation

```bash
npx skills add gemini-testing/testplane-skill
```

### Capabilities

- configure Testplane Selectivity with project-specific source maps, server/static invalidation, and real run/skip verification
- explore web apps through `@testplane/cli` DOM snapshots
- write and fix Testplane tests using existing project patterns
- inspect local or remote Testplane HTML reports
- debug Time Travel snapshots from reports
- attach to Testplane REPL sessions and use project helpers
- handle auth through `save-state` and `restore-state`

It is designed to keep agents grounded in real browser state and real report data instead of guessing from source code alone.

### Selectivity

Ask the agent: **"Set up Testplane Selectivity in this project"** or **"Настрой Testplane селективность в этом проекте"**.
The skill loads [a short routing guide](references/selectivity/README.md), then only the relevant setup, safety, package-manager, bundler and framework instructions. Existing application behavior and package-manager conventions are preserved. Server/build/config inputs and static assets are protected by their role, while Testplane screenshot references retain per-test tracking. Missing client dependencies are repaired or reported as blockers, not manually added to global exclusions.

Configuration and lightweight offline checks come first, including inspection of existing JS/CSS maps. At the confidence boundary, the agent explicitly proposes browser tests or other heavy work and waits for your consent. Build-only or cold/warm permission does not authorize an open-ended mutation campaign. If you decline, you receive the changes, completed checks and remaining uncertainties without a run. See [interactive consent](references/selectivity/interaction.md). A successful build or a warm skip alone is still not proof of full selective correctness.
