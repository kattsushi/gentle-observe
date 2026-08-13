# Workspace Toolchain Specification

## Purpose

Provide a reproducible Nx-first Bun quality foundation without product behavior.

## Requirements

### Requirement: Exact workspace resolution

The workspace MUST lock exact approved versions for Bun, Nx, TypeScript 7,
Effect 4 RC, `@effect/tsgo`, Oxfmt, Oxlint, and `oxlint-tsgolint`. Shared future
workspace dependencies MUST use the root Bun catalog policy; root-only tools MAY
remain directly pinned.

#### Scenario: Frozen resolution

- GIVEN the approved manifest and lockfile
- WHEN `bun install --frozen-lockfile` runs
- THEN it exits successfully without changing the lockfile

#### Scenario: Incompatible resolution

- GIVEN a required pin or lock entry is incompatible
- WHEN dependency resolution runs
- THEN it fails without silently substituting a version

### Requirement: Root Nx quality targets

The root `gentle-observe` Nx project MUST expose check-only `format` and `lint`
targets. The root `check` command MUST invoke those targets through Nx
`run-many`; Nx owns task selection, cache behavior, output, exit status, and
failure attribution. The root MUST NOT expose `typecheck` or `diagnostics`
without durable source/configuration inputs.

#### Scenario: Aggregate quality pass

- GIVEN a valid locked workspace
- WHEN `bun run check` runs
- THEN both targets succeed

#### Scenario: Target failure attribution

- GIVEN one target command fails
- WHEN the aggregate runs
- THEN Nx exits nonzero and identifies the failing target

#### Scenario: Cache reuse

- GIVEN a successful aggregate with unchanged inputs
- WHEN the aggregate runs again
- THEN Nx reports cache reuse for eligible targets

### Requirement: Formatting safety

The `format` target MUST use Oxfmt check mode and MUST NOT modify checked files.
The separate `format-write` target MAY make an intentional rewrite.
`.oxfmtignore` MUST contain only `.atl/`; `.atl/` MUST remain versioned.

#### Scenario: Check-only formatting

- GIVEN formatted candidate files
- WHEN `bun run format` runs
- THEN it exits successfully and candidate file bytes are unchanged

#### Scenario: Versioned registry exclusion

- GIVEN `.atl/skill-registry.md` and `.atl/.skill-registry.cache.json`
- WHEN Git ignore and Oxfmt ignore behavior are inspected
- THEN Git does not ignore either file and Oxfmt excludes only `.atl/`

### Requirement: Honest quality ownership

The root MUST NOT define a passing TypeScript or Effect diagnostics target while
it has no durable source/configuration input. TypeScript 7, Effect, and
`@effect/tsgo` MUST remain exactly pinned for future project-owned targets.

#### Scenario: No vacuous quality proof

- GIVEN the root has no durable TypeScript or Effect input
- WHEN root target discovery runs
- THEN `typecheck` and `diagnostics` are not reported and no zero-input pass is
  claimed as quality evidence

### Requirement: Honest test ownership

The root MUST NOT define a passing test target while no durable test-bearing
project exists. Future projects MUST own their real typecheck, diagnostics, and
test targets. Aggregates and affected selection MAY include each target only
after Nx discovers a durable owner.

#### Scenario: No vacuous test proof

- GIVEN the quality-only root baseline
- WHEN root target discovery runs
- THEN no root `test` target is reported

### Requirement: Deferred host and CI integration

Unit 3 MAY add a narrow host bootstrap that validates exact Bun, performs frozen
or offline installation, performs justified preparation, and invokes root Nx
checks. Unit 4 MAY use `nrwl/nx-set-shas` followed by `nx affected -t
format,lint` for CI target selection. It MUST add typecheck, diagnostics, or
test only after projects own durable targets. Nx Cloud is optional and is not
configured by this change.

### Requirement: Strict TDD handoff

Strict TDD MUST remain disabled until a future durable test-bearing project
demonstrates a non-vacuous test runner and target. This quality-only change MUST
NOT claim test proof or activate the policy.

### Requirement: Scope and reversibility

This change MUST NOT add product behavior, CI YAML, Nx Cloud configuration,
`.repos` changes, or branch/remote mutations. Each work unit MUST be reversible
within its stated files.
