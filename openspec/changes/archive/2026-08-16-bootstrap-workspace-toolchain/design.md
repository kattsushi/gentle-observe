# Design: Bootstrap Workspace Toolchain

## Decision

The root `gentle-observe` package owns infrastructure quality targets and
invokes Nx directly from package scripts. Nx `run-many` owns aggregate
scheduling, cache behavior, exit status, and failure attribution. No custom
quality runner, report mapper, or synthetic workspace project exists.

At merge commit `523e3435ecd878a0026e17bbe63ebeac02fcd9f8`, `app-tui` is a
separate application project. Its CLI, build, `test`, `typecheck`, and E2E
targets are product-owned and outside this change's implementation boundary.

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

## Root targets

| Target         | Command                                                                         | Responsibility                 |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| `format`       | `oxfmt --check . --ignore-path .oxfmtignore`                                    | Check-only formatting          |
| `format-write` | `oxfmt . --ignore-path .oxfmtignore`                                            | Intentional formatting rewrite |
| `lint`         | `oxlint --no-error-on-unmatched-pattern --type-aware --config .oxlintrc.json .` | Syntax and type-aware linting  |
| `quality-test` | `node --test tools/quality/evidence-driven.test.mjs`                            | Root quality-rule tests        |

`.oxfmtignore` contains only `.atl/` and `.agents/skills/`: the first preserves
versioned registry state, and the second preserves project-local skill
documentation. Root `check` uses `nx run-many -p gentle-observe -t
format,lint,quality-test`. The root does not own application `typecheck`,
diagnostics, or test targets.

## Closure decisions

### Unit 3: Rejected host bootstrap

The previously recorded host-bootstrap implementation is not present in the
canonical merged tree: `scripts/bootstrap` and `scripts/bootstrap.test` are
absent. Reintroducing a root installer/runner would duplicate the established
CI host setup and expand this change's scope. Unit 3 is therefore rejected and
superseded, not implemented by this closure.

### Unit 4: Deferred affected-selection CI

CI currently runs the full root and application target set through Nx
`run-many`. Because root format and lint scan the repository, `nx affected`
could skip required global gates for an application-only change. Do not add
`nrwl/nx-set-shas`, affected selection, or Nx Cloud until a future CI change
can preserve that coverage.

## Test policy

Strict TDD remains disabled for this closure. `app-tui` has durable tests and
typechecking, but its testing-policy decision is separate from this root
toolchain reconciliation.

## Files and rollback

This closure changes `docs/development/workspace-graph.md` and this OpenSpec
change's `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`,
`verify-report.md`, and `specs/workspace-toolchain/spec.md`, plus matching
Engram topics. Revert them together to remove the closure record without
changing workspace or application behavior.
