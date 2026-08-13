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

## Host bootstrap

Run `scripts/bootstrap` from any directory to validate a Linux or macOS host,
validate the exact Bun version declared by both `packageManager` and
`engines.bun`, install the frozen lockfile, and delegate quality to one
`bun run check` invocation:

```sh
scripts/bootstrap
scripts/bootstrap --offline
```

The script does not download Bun or alter the manifest/lockfile. Install the
repository-pinned Bun through an approved host mechanism before running it.
Bun 1.3.14 has no install option that can prove an offline install cannot use a
proxy or absolute lockfile URL. Therefore `--offline` is intentionally
fail-closed: after host and manifest validation, it only verifies that the
existing `node_modules` tree is present and exits without invoking Bun's package
manager or Nx. This preflight makes no network-capable subprocess call. Run
`scripts/bootstrap` online to perform the frozen install and quality check.

The online install and check run as tracked child processes. `HUP`, `INT`, and
`TERM` are forwarded to the active child, which is reaped before the script
exits with the corresponding stable signal status. A Bun-version, manifest,
host, or install failure stops before quality checks; an Nx failure retains its
native nonzero status. Re-running the online command repeats the frozen install
and root Nx check without creating repository-local state. Roll it back by
deleting `scripts/bootstrap`, its behavior test, and this section.

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

`scripts/bootstrap` is host setup only: validate exact Bun, perform frozen
installation online or the fail-closed offline preflight, then invoke these root
Nx commands only for the online path. It is not an Nx package, quality runner,
or CI adapter.

## Catalogs and rollback

The root owns exact Bun catalogs. Future workspace consumers use `catalog:` or
`catalog:<name>`; the root tooling owner stays directly pinned. Review and
regenerate `bun.lock` after a catalog change.

To roll back this toolchain boundary, revert root targets, `.oxlintrc.json`,
`.oxfmtignore`, Oxfmt/Oxlint pins/lockfile, and this document together. No
product behavior is involved.
