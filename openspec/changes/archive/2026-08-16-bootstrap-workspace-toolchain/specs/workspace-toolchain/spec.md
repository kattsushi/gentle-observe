# Workspace Toolchain Specification

## Purpose

Provide a reproducible Nx-first Bun infrastructure foundation without claiming
ownership of separately delivered product behavior.

## Requirements

### Requirement: Exact workspace resolution

The workspace MUST lock exact approved versions for Bun, Nx, TypeScript 7,
Effect 4 RC, `@effect/tsgo`, Oxfmt, Oxlint, and `oxlint-tsgolint`. Shared
workspace dependencies MUST use the root Bun catalog policy; root-only tools
MAY remain directly pinned.

#### Scenario: Frozen resolution

- GIVEN the approved manifest and lockfile
- WHEN Bun 1.3.14 runs `bun install --frozen-lockfile`
- THEN it exits successfully without changing the lockfile

### Requirement: Root Nx quality targets

The root `gentle-observe` Nx project MUST expose check-only `format`, `lint`,
and `quality-test` targets. The root `check` command MUST invoke those targets
through Nx `run-many`; Nx owns task selection, cache behavior, output, exit
status, and failure attribution. The root MUST NOT expose a vacuous
TypeScript or Effect diagnostics target.

#### Scenario: Aggregate quality pass

- GIVEN a valid locked workspace
- WHEN `bun run check` runs with Bun 1.3.14
- THEN the root format, lint, and quality-test targets succeed

#### Scenario: Target discovery

- GIVEN the canonical workspace at merge commit
  `523e3435ecd878a0026e17bbe63ebeac02fcd9f8`
- WHEN Nx project discovery runs
- THEN it reports the root infrastructure project and the separately owned
  `app-tui` application project

### Requirement: Formatting safety

The `format` target MUST use Oxfmt check mode and MUST NOT modify checked
files. The separate `format-write` target MAY make an intentional rewrite.
`.oxfmtignore` MUST contain only `.atl/` and `.agents/skills/`; `.atl/` MUST
remain versioned, and project-local skill documentation MUST remain excluded
from Oxfmt formatting.

#### Scenario: Check-only formatting

- GIVEN formatted candidate files
- WHEN `bun run format` runs
- THEN it exits successfully and candidate file bytes are unchanged

### Requirement: Honest project-owned testing

The root MUST NOT define a passing zero-input application test, TypeScript, or
Effect diagnostics target. Durable product validation MUST belong to the
project that owns the inputs. On canonical `master`, `app-tui` owns its
non-vacuous `test` and `typecheck` targets; their existence does not make the
root infrastructure change their implementation owner.

#### Scenario: No vacuous root proof

- GIVEN the root infrastructure project
- WHEN its target discovery runs
- THEN it reports no root `typecheck`, `diagnostics`, or product `test` target

### Requirement: Rejected host bootstrap and deferred CI selection

This change MUST NOT reintroduce `scripts/bootstrap` or a custom host runner.
Canonical `master` has no such root script, so Unit 3 is rejected/superseded.
The existing CI MUST retain full `run-many` coverage until affected selection
can preserve global root gates. `nrwl/nx-set-shas`, `nx affected` CI selection,
and Nx Cloud MUST remain deferred and unconfigured by this change.

#### Scenario: Closure boundaries

- GIVEN the canonical workspace
- WHEN root scripts, CI configuration, and package resolution are inspected
- THEN no root `scripts/bootstrap`, `nrwl/nx-set-shas`, or Nx Cloud
  configuration is present, and CI uses Nx `run-many`

### Requirement: Strict TDD handoff

Strict TDD MUST remain disabled for this closure. A future testing-policy
change MAY evaluate `app-tui`'s durable target evidence, but this change MUST
NOT activate a workspace-wide policy or claim TDD evidence.

### Requirement: Scope and reversibility

This change MUST NOT add product behavior, CI YAML, Nx Cloud configuration,
`.repos` changes, or branch/remote mutations. The closure artifact edits MUST
be reversible without removing merged application behavior.
