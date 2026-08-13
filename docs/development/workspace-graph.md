# Workspace Graph

The root `gentle-observe` package is the only current Nx project. It owns the
quality targets until a product package has a durable responsibility.

## Quick path

```sh
bun install --frozen-lockfile
bun nx show project gentle-observe
bun run format       # Oxfmt check-only
bun run check        # Nx run-many across all quality targets
```

`format` uses `oxfmt --check` and never writes source. Use `bun run
format:write` for an intentional rewrite. `.oxfmtignore` excludes only the
versioned `.atl/` registry state; every other Oxfmt-compatible tracked file is
in formatter scope. `lint` uses type-aware Oxlint with `oxlint-tsgolint`.

The root has no product source, TypeScript project, Effect diagnostic input, or
durable test-bearing project. It deliberately defines no `typecheck`,
`diagnostics`, or `test` target: a passing zero-input command is not quality
evidence. Future projects own real typecheck, diagnostics, and test targets
once they have durable source, configuration, or tests.

## Target ownership and CI boundary

Root scripts invoke Nx directly. `check` uses `nx run-many` so Nx owns target
selection, output, exit status, failure attribution, and cache reuse. Nx may
schedule targets in parallel; the workspace makes no independent ordering
promise. `bun run affected:check` uses `nx affected` and is the future CI
command after `nrwl/nx-set-shas` establishes base/head. It selects only the
currently discovered `format` and `lint` targets. Add `typecheck`,
`diagnostics`, or `test` to affected selection only when a project owns the
corresponding durable target. Nx Cloud is not configured or required.

`scripts/bootstrap`, when introduced in Work Unit 3, is host setup only:
validate exact Bun, perform frozen/offline install, make justified preparation,
then invoke these root Nx commands. It is not an Nx package, quality runner, or
CI adapter.

## Catalogs and rollback

The root owns exact Bun catalogs. Future workspace consumers use `catalog:` or
`catalog:<name>`; the root tooling owner stays directly pinned. Review and
regenerate `bun.lock` after a catalog change.

To roll back this toolchain boundary, revert root targets, `.oxlintrc.json`,
`.oxfmtignore`, Oxfmt/Oxlint pins/lockfile, and this document together. No
product behavior is involved.
