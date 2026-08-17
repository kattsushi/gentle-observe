# Tasks: Bootstrap Workspace Toolchain

## Review Workload Forecast

| Field                   | Value                                      |
| ----------------------- | ------------------------------------------ |
| Estimated changed lines | 800 maximum for this bounded closure unit  |
| 400-line budget risk    | High                                       |
| Chained PRs recommended | No                                         |
| Delivery strategy       | exception-ok / size:exception              |
| Current work unit       | bootstrap-workspace-closure-reconciliation |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
400-line budget risk: High

The maintainer approved this reconciliation as `size:exception`, capped at 800
authored additions plus deletions. It must not commit, stage, push, edit a PR,
or change GitHub.

## Unit 1: Root graph baseline

- [x] 1.1 Preserve root Bun catalogs, exact pins, lockfile, and root Nx project
      discovery without a synthetic workspace project.
- [x] 1.2 Preserve graph documentation and frozen-install evidence.

## Unit 2: Nx-first quality loop

- [x] 2.1 Configure direct root Nx targets for Oxfmt and Oxlint; retain
      TypeScript and Effect pins for future durable project targets.
- [x] 2.2 Aggregate current targets with Nx `run-many`; verify independent
      targets, cache reuse, check-only formatting, and native failure attribution.
- [x] 2.3 Reject vacuous root typecheck and diagnostics targets; durable
      application typecheck and test targets are separately owned by `app-tui`.
- [x] 2.4 Version `.atl/`, preserve project-local `.agents/skills/`
      documentation as the only additional Oxfmt exclusion, and normalize all
      other compatible tracked files with Oxfmt write mode.
- [x] 2.5 Remove repository-local review-tool integrations, regenerate the
      versioned skill registry, and preserve generic product review concepts.

## Unit 3: Rejected host bootstrap

- [x] 3.1 Rejected/superseded: canonical `master` has no root
      `scripts/bootstrap`; do not add a frozen/offline installer.
- [x] 3.2 Rejected/superseded: do not add a root preparation or check runner;
      existing CI owns host setup and invokes Nx directly.
- [x] 3.3 Rejected/superseded: no host/install failure proof is applicable when
      the root host bootstrap does not exist.

## Unit 4: Deferred affected-selection CI

- [x] 4.1 Deferred: retain CI's full Nx `run-many` coverage; do not add
      `nrwl/nx-set-shas` or `nx affected` selection while global root gates
      could be skipped.
- [x] 4.2 Closed as confirmed unconfigured: do not add Nx Cloud or a remote
      cache to this change.
- [x] 4.3 Superseded by the separately merged `app-tui` project: it owns real
      typecheck and test targets; this closure does not change CI selection or
      reassess the workspace Strict TDD policy.

## Work Unit Evidence

| Evidence        | Required result                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused command | Bun 1.3.14 frozen install exited 0 with unchanged `bun.lock`; Nx discovered `["app-tui","gentle-observe"]`; root format and check exited 0.           |
| Runtime harness | N/A: this unit changes only reconciliation artifacts and no product or host-runtime behavior.                                                         |
| Rollback        | Revert only this change's proposal, specification, design, tasks, apply-progress, matching Engram topics, and the corrected workspace-graph sentence. |
