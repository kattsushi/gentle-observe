# Proposal: Bootstrap Workspace Toolchain

## Intent

Provide the reproducible Nx-first Bun infrastructure baseline that later
projects can use without claiming ownership of their product behavior.

## Canonical closure state

This change is reconciled against `master` merge commit
`523e3435ecd878a0026e17bbe63ebeac02fcd9f8` (PR #12). The canonical workspace
now has the root `gentle-observe` infrastructure project and the separately
delivered `app-tui` application project. This change owns only the root
toolchain baseline; it does not retroactively claim the application's CLI,
renderer, build, tests, or native PTY proof.

## In scope

- Root Bun catalogs and exact pins for Bun, Nx, TypeScript 7, Effect 4 RC,
  `@effect/tsgo`, Oxfmt, Oxlint, and `oxlint-tsgolint`.
- Root Nx `format`, `format-write`, `lint`, and `quality-test` targets with a
  cached `run-many` aggregate.
- Versioned `.atl/` registry state and project-local `.agents/skills/`
  documentation excluded from Oxfmt formatting.
- Documentation of target ownership, cache behavior, deferred CI selection,
  and rollback.
- Truthful closure decisions for the rejected Unit 3 host bootstrap and
  deferred generic Unit 4 CI selection.

## Out of scope

- Product code, UI, adapters, persistence, packaging, release/CD behavior,
  `.repos`, branch or remote changes, and new CI workflow files.
- Nx Cloud configuration and `nrwl/nx-set-shas` adoption.
- Any change to the separately owned `app-tui` test policy or Strict TDD mode.

## Success criteria

- [x] Frozen installation resolves the approved lockfile and Nx discovers the
      root infrastructure project and the separately owned application project.
- [x] Root format, lint, quality-test, and aggregate checks are available under
      native Nx ownership.
- [x] The root has no vacuous TypeScript or Effect diagnostics target; durable
      application typecheck and test targets remain application-owned.
- [x] Unit 3 is rejected/superseded: canonical `master` has no root
      `scripts/bootstrap`, and this closure does not reintroduce one.
- [x] Unit 4 is explicitly deferred: the existing CI uses full `run-many`
      coverage, with affected selection and Nx Cloud left for a future change.

## Testing handoff

Strict TDD remains disabled for this closure. `app-tui` now owns durable
`test` and `typecheck` targets, but changing the workspace testing policy is
outside this infrastructure reconciliation. A future policy change must use
that project's non-vacuous evidence rather than a root zero-input target.

## Rollback

Revert `docs/development/workspace-graph.md` and this change's reconciled
OpenSpec artifacts (`proposal.md`, `design.md`, `tasks.md`,
`apply-progress.md`, `verify-report.md`, and
`specs/workspace-toolchain/spec.md`) together with their matching Engram topics.
This removes only the closure decisions and leaves merged workspace and
application behavior untouched.
