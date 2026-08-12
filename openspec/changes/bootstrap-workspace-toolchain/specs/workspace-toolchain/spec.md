# Workspace Toolchain Specification

## Purpose

Provide the first reproducible, cross-platform developer feedback loop without adding product behavior.

## Requirements

### Requirement: Canonical Fresh-Clone Bootstrap

The workspace SHALL expose one documented canonical command that makes a fresh supported clone check-ready. It MUST validate or install only approved prerequisites, resolve locked dependencies, run the aggregate check, and remain idempotent.

#### Scenario: Fresh supported clone
- GIVEN a clean Linux or macOS clone with reachable approved registries
- WHEN the canonical bootstrap command runs
- THEN dependencies and all required checks complete successfully

#### Scenario: Idempotent rerun
- GIVEN a clone already bootstrapped from its unchanged lockfile
- WHEN the canonical command runs again
- THEN it succeeds without changing resolved dependency state

### Requirement: Reviewed Dependency Resolution

The workspace MUST validate exact reviewed versions for Bun, Nx, TypeScript 7, the Effect 4 RC family, `@effect/tsgo`, and foundational tools against the committed lockfile. The root workspace manifest MUST centralize versions shared by future packages in Bun catalogs, and workspace consumers MUST use `catalog:` or `catalog:<name>` references instead of duplicating those versions. Root-only orchestration tooling MAY remain directly exact-pinned. Compatibility-dependent checks SHALL fail and block explicitly; they MUST NOT silently downgrade or substitute tooling.

#### Scenario: Reviewed resolution
- GIVEN manifests and lockfile match the approved compatibility matrix
- WHEN bootstrap validates dependencies
- THEN it reports the resolved versions and accepts the lockfile

#### Scenario: Incompatible resolution
- GIVEN a required TS7, tsgo, or Effect dependency is incompatible or unpinned
- WHEN validation runs
- THEN it exits nonzero with the blocking compatibility source

#### Scenario: Catalog-backed workspace dependency
- GIVEN the root workspace catalog defines exact shared runtime and tooling versions
- WHEN a workspace package consumes a shared dependency
- THEN its manifest uses the corresponding `catalog:` or `catalog:<name>` reference and `bun.lock` records the catalog definition and resolved exact version

### Requirement: Supply-Chain and Output Safety

Bootstrap MUST use lockfile-integrity validation and MUST NOT execute implicit remote scripts beyond approved package lifecycle behavior. It SHALL NOT emit credentials, tokens, or other secrets in human or CI output.

#### Scenario: Unsafe dependency input
- GIVEN lockfile integrity fails or an unapproved remote execution is requested
- WHEN bootstrap runs
- THEN it exits nonzero before reporting success and identifies the unsafe source

### Requirement: Workspace Graph Baseline

The workspace SHALL provide Bun workspace membership, root-owned shared dependency catalogs, and an Nx project/task graph that represent only this toolchain baseline and are inspectable through deterministic commands.

#### Scenario: Graph inspection
- GIVEN a validated workspace
- WHEN graph and task discovery commands run
- THEN they return the defined baseline projects and executable targets

### Requirement: Deterministic Quality Targets

The workspace MUST provide stable commands or targets for format checking, linting, TS7 typechecking, Effect diagnostics, deterministic unit/smoke tests, and one aggregate check. Each target SHALL use the locked toolchain and return an unambiguous result.

#### Scenario: Aggregate quality pass
- GIVEN the baseline workspace is valid
- WHEN the aggregate check runs
- THEN every required target completes successfully in its declared order or equivalent complete coverage

#### Scenario: Target failure isolation
- GIVEN one quality target fails
- WHEN the aggregate check runs
- THEN it exits nonzero and identifies that target as the failure source

### Requirement: Structured Execution Summary

Every bootstrap and aggregate execution MUST emit a machine-readable and human-readable summary containing platform, resolved versions, checks run, and final result. Failure summaries SHALL preserve the actionable source without a false success result.

#### Scenario: Successful summary
- GIVEN all required checks pass
- WHEN execution completes
- THEN the summary records platform, versions, checks, and success

#### Scenario: Failed summary
- GIVEN a prerequisite, network, or check failure occurs
- WHEN execution stops
- THEN the summary records failure, source, and a nonzero exit

### Requirement: Native Platform and CI Evidence

The change MUST produce native Linux and macOS CI evidence for bootstrap and required checks. CI SHALL fail on either platform if bootstrap or a required target fails.

#### Scenario: Native matrix success
- GIVEN supported Linux and macOS CI runners
- WHEN the CI workflow executes
- THEN each platform publishes a successful structured summary

#### Scenario: Platform-specific failure
- GIVEN one native runner cannot satisfy a prerequisite
- WHEN CI executes
- THEN that matrix entry fails nonzero with actionable platform evidence

### Requirement: Test Capability Proof and Handoff

The workspace MUST prove a repeatable deterministic test runner with unit or smoke evidence, then persist the testing-capability update that enables Strict TDD for subsequent changes. This bootstrap change SHALL NOT be retrospectively governed by Strict TDD.

#### Scenario: Runner proof
- GIVEN the locked workspace
- WHEN the deterministic test target runs repeatedly
- THEN it produces the same passing result and records the Strict-TDD handoff

### Requirement: Environmental Failure Behavior

Bootstrap SHALL distinguish missing prerequisites from unavailable or partial network access. It MUST NOT claim a valid setup when required locked artifacts cannot be obtained or validated.

#### Scenario: Offline or partial network
- GIVEN required artifacts are absent and registry access is unavailable or incomplete
- WHEN bootstrap runs
- THEN it exits nonzero and identifies the unavailable prerequisite or artifact

### Requirement: Scope, Reversibility, and Reproducibility

This change MUST NOT implement UI, domain, connectors, traces, persistence, packaging, or modify approved product documents. Work units SHALL be independently verifiable and reversible; a clean worktree plus committed configuration MUST reproduce the declared results.

#### Scenario: Clean-worktree reproduction
- GIVEN a clean clone at the reviewed revision
- WHEN bootstrap and aggregate checks run
- THEN results are reproducible without product behavior or untracked generated state

### Requirement: Proposal Acceptance Trace

The delivered evidence MUST trace each proposal success criterion to the canonical command, locked validation, graph/quality targets, deterministic test proof, structured summaries, and native CI results.

#### Scenario: Acceptance review
- GIVEN implementation evidence is available
- WHEN a reviewer evaluates the proposal outcomes
- THEN each outcome maps to a testable command, summary, or CI record
