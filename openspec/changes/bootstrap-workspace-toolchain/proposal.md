# Proposal: Bootstrap Workspace Toolchain

## Intent

Provide an Nx-first Bun workspace foundation that gives later product projects
an exact dependency baseline and a non-vacuous quality feedback loop.

## In scope

- Root Bun catalogs and locked exact versions for Bun, Nx, TypeScript 7,
  Effect 4 RC, `@effect/tsgo`, Oxfmt, Oxlint, and `oxlint-tsgolint`.
- One root Nx project with Oxfmt `format`/`format-write` and Oxlint `lint`
  targets plus a cached `run-many` aggregate.
- Versioned `.atl/` registry state excluded only from Oxfmt formatting.
- Documentation of local discovery, target ownership, cache behavior, and
  rollback.
- Future Unit 3 host bootstrap and Unit 4 official Nx affected-selection design.

## Out of scope

- Product code, UI, adapters, persistence, packaging, pre-SDD product docs,
  `.repos`, branch or remote changes.
- CI workflow files and Nx Cloud configuration.
- A test target until a durable project has executable behavior to test.

## Success criteria

- [x] Frozen installation resolves the approved lockfile and Nx discovers only
      the root project.
- [x] Format, lint, and the aggregate succeed; a second aggregate run
      demonstrates Nx cache reuse.
- [x] Check-only formatting preserves candidate bytes and an induced target
      failure receives native Nx attribution.
- [ ] Unit 3 validates the host and performs frozen/offline installation before
      invoking root Nx checks.
- [ ] Unit 4 selects currently existing targets with `nrwl/nx-set-shas` and
      `nx affected`.

## Testing handoff

Strict TDD is deferred. The root deliberately has no `typecheck`,
`diagnostics`, or `test` target because it has no durable inputs. A future
project must establish real source/configuration/tests and its own non-vacuous
Nx targets before it can supply typecheck, diagnostics, test evidence, or
update the testing policy.

## Rollback

Revert root manifests, Nx targets, quality configuration, lockfile, graph
documentation, and their SDD artifacts together. This removes only workspace
toolchain behavior and no product behavior.
