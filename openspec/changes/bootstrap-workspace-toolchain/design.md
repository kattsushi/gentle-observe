# Design: Bootstrap Workspace Toolchain

## Decision

The root `gentle-observe` package is the only initial Nx project. It owns the
quality targets and invokes Nx directly from package scripts. Nx `run-many`
owns aggregate scheduling, cache behavior, exit status, and failure attribution.
No custom quality runner, report format, mapper, or synthetic workspace project
exists.

## Compatibility matrix

| Component                  |         Exact pin |
| -------------------------- | ----------------: |
| Bun / `bun-types`          |            1.3.14 |
| Nx                         |            23.1.1 |
| TypeScript                 |             7.0.2 |
| Effect                     |      4.0.0-rc.108 |
| `@effect/tsgo`             |            0.36.4 |
| Oxfmt                      |            0.63.0 |
| Oxlint / `oxlint-tsgolint` | 1.78.0 / 7.0.2001 |

`oxlint-tsgolint@7.0.2001` is an npm-published package. The root catalog and
`bun.lock` are authoritative for exact resolution.

## Root targets

| Target         | Command                                         | Responsibility                 |
| -------------- | ----------------------------------------------- | ------------------------------ |
| `format`       | `oxfmt --check . --ignore-path .oxfmtignore`    | Check-only formatting          |
| `format-write` | `oxfmt . --ignore-path .oxfmtignore`            | Intentional formatting rewrite |
| `lint`         | `oxlint --type-aware --config .oxlintrc.json .` | Syntax and type-aware linting  |

`.oxfmtignore` contains only `.atl/`: the versioned registry state is outside
Oxfmt, and every other Oxfmt-compatible tracked file remains in scope. `check`
uses `nx run-many -p gentle-observe -t format,lint`. Nx may execute independent
targets in parallel, so the system does not promise an external deterministic
target order. On failure, Nx's own result and target attribution are
authoritative.

The root does not define `typecheck` or `diagnostics`. `tsconfig.quality.json`
had `files: []`, and the base TypeScript and Effect diagnostics commands had no
durable input; their passing exits would be vacuous. TypeScript 7, Effect, and
`@effect/tsgo` remain exact pinned catalog entries for future project-owned
targets, not current runtime validation.

## Test policy

The root has no durable project inputs and defines no `typecheck`,
`diagnostics`, or `test` target. When a future project contains real behavior,
it owns these targets; only then may `check`, `affected:check`, and CI selection
include them. Strict TDD stays disabled until that project demonstrates
non-vacuous runner evidence.

## Future boundaries

### Unit 3: Narrow host bootstrap

`scripts/bootstrap`, when introduced, is limited to validating the exact Bun
host, running frozen or offline installation, performing justified preparation,
and invoking root Nx checks. It is not a package, target owner, custom runner,
or reporting layer.

### Unit 4: Official Nx CI selection

A future CI workflow uses `nrwl/nx-set-shas` to establish base/head and then
`nx affected -t format,lint` to select the current targets. Nx Cloud is optional
and not configured. Add project-owned typecheck, diagnostics, or test selection
only when target discovery finds durable targets.

## Files and rollback

The current boundary is `package.json`, `bun.lock`, `nx.json`,
`.oxlintrc.json`, `.oxfmtignore`, `.gitignore`,
`docs/development/workspace-graph.md`, and this change's SDD artifacts. Revert
these together to remove the quality baseline without removing unrelated work.

## Scope constraints

Do not add CI YAML, Nx Cloud configuration, product code, `.repos` changes, or
branch/remote mutations. No application, adapter, persistence, or distribution
behavior belongs in this change.
