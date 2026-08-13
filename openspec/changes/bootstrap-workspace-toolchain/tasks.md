# Tasks: Bootstrap Workspace Toolchain

## Review Workload Forecast

| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| Estimated changed lines | 2,400 maximum for the approved removal |
| 400-line budget risk    | High                                   |
| Chained PRs recommended | No                                     |
| Delivery strategy       | exception-ok / size:exception          |
| Current work unit       | remove-repository-crit-integrations    |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

The maintainer authorized this one removal as `size:exception`, capped at 2,400
changed lines. No commit or push is part of this work unit.

## Unit 1: Root graph baseline

- [x] 1.1 Preserve root Bun catalogs, exact pins, lockfile, and root Nx project
      discovery without a synthetic workspace project.
- [x] 1.2 Preserve graph documentation and frozen-install evidence.

## Unit 2: Nx-first quality loop

- [x] 2.1 Configure direct root Nx targets for Oxfmt and Oxlint; retain
      TypeScript and Effect pins for future durable project targets.
- [x] 2.2 Aggregate current targets with Nx `run-many`; verify independent
      targets, cache reuse, check-only formatting, and native failure attribution.
- [x] 2.3 Remove vacuous root typecheck, diagnostics, and test targets; defer
      real project-owned quality and tests until durable inputs exist.
- [x] 2.4 Version `.atl/`, keep it as the sole Oxfmt exclusion, and normalize
      all other compatible tracked files with Oxfmt write mode.
- [x] 2.5 Remove repository-local review-tool integrations, regenerate the
      versioned skill registry, and preserve generic product review concepts.

## Unit 3: Narrow host bootstrap

- [ ] 3.1 Validate exact Bun and perform frozen or offline installation.
- [ ] 3.2 Perform only justified preparation, then invoke root Nx checks.
- [ ] 3.3 Prove host and install failures without adding a custom runner,
      report, or project.

## Unit 4: Official Nx CI selection

- [ ] 4.1 Use `nrwl/nx-set-shas` and `nx affected -t format,lint` in future CI
      selection; add targets only when they exist.
- [ ] 4.2 Keep Nx Cloud optional and unconfigured.
- [ ] 4.3 Add real typecheck, diagnostics, test selection, and reassess Strict
      TDD only after Nx discovers durable, non-vacuous project targets.

## Work Unit Evidence

| Evidence        | Required result                                                             |
| --------------- | --------------------------------------------------------------------------- |
| Focused command | Integration-path, registry, config, and formatter checks exit successfully. |
| Runtime harness | Two `check` runs demonstrate native Nx execution and cache reuse.           |
| Rollback        | Restore only deleted integration assets, registry state, and SDD evidence.  |
