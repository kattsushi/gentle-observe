# Executable Shell Specification

## Requirements

### Requirement: App Ownership and Boundaries

The workspace MUST expose `app-tui` at `apps/gentle-observe` as an independently invokable Nx app. It MUST own the TypeScript, Bun, SolidJS, and OpenTUI boundary; Effect Atom Solid MUST NOT precede a real state boundary. The public executable remains `gentle-observe`.

#### Scenario: App project is discoverable

- GIVEN the workspace is ready
- WHEN Nx lists or runs the app project
- THEN it exposes app-owned targets without a custom root runner

### Requirement: CLI Lifecycle

The executable MUST be `gentle-observe`. `--version` MUST emit stable text and exit zero without a TTY. Default non-TTY launch MUST fail nonzero, explain the terminal requirement, and MUST NOT render.

#### Scenario: Version and non-TTY invocation

- GIVEN the compiled executable is invoked outside a terminal
- WHEN `--version` and then default launch are run
- THEN version succeeds and default launch reports the non-TTY failure

### Requirement: Honest Deterministic Shell

In a PTY, the executable MUST render a deterministic shell stating discovery is not connected, with no fabricated data. `q` MUST exit zero.

#### Scenario: Interactive quit

- GIVEN a supported PTY launches the executable
- WHEN the ready shell is observed and `q` is sent
- THEN truthful shell text is present and the process exits zero

### Requirement: Linux Baseline Artifact

The build MUST use Bun 1.3.14 and `bun build --compile --target=bun-linux-x64-baseline` to produce the Linux x64 artifact. Compilation alone MUST NOT establish support.

#### Scenario: Pinned build

- GIVEN Bun is exactly 1.3.14
- WHEN the app build target runs
- THEN it produces the Linux baseline executable or fails with attributable nonzero status

### Requirement: Native Runtime Completeness

The artifact MUST include or accompany OpenTUI native assets and run from an unrelated directory. Missing assets MUST fail visibly and nonzero; source and development dependencies MUST NOT be required at runtime.

#### Scenario: Relocated execution

- GIVEN the artifact is placed in a clean unrelated directory
- WHEN it launches in a Linux x64 PTY
- THEN the shell renders without a native-asset load failure

### Requirement: Real PTY E2E

The E2E target MUST execute the compiled release binary in a real Linux x64 PTY with bounded dimensions, environment, capture, and timeout. It MUST prove version, readiness, `q`, zero exit, and cleanup; smoke flags, test-only modes, and fake states are prohibited.

#### Scenario: Bounded executable proof

- GIVEN the release artifact and controlled PTY environment
- WHEN E2E runs
- THEN it observes the shell, quits it, and completes before its timeout

### Requirement: Truthful Quality Targets

The app MUST own independently invokable `build`, `typecheck`, `diagnostics`, `test`, and `e2e` only where each checks real source or artifacts. A target MUST NOT pass without input or runner. Strict TDD MUST remain disabled until a durable non-vacuous runner is evidenced.

#### Scenario: Absent diagnostic capability

- GIVEN a proposed quality command lacks real app input or a durable runner
- WHEN its target is invoked
- THEN it is unavailable or fails explicitly rather than passing vacuously

### Requirement: Failure Attribution

CLI, build, asset, and PTY-E2E failures MUST be nonzero and identify environment, compilation, asset, readiness, timeout, exit-code, or cleanup.

#### Scenario: PTY readiness timeout

- GIVEN the binary does not emit its required ready shell before the deadline
- WHEN E2E reaches the timeout
- THEN it fails nonzero with readiness/timeout attribution and terminates the child

### Requirement: Excluded Claims

This slice MUST NOT claim discovery, persistence, connectors, demo data, releases, checksums, signing, Homebrew, macOS, arm64, musl, Vite, Termcn, or Effect Atom Solid. Only native Linux x64 MAY be supported.

#### Scenario: Unsupported platform request

- GIVEN a non-Linux-x64 target is requested
- WHEN documentation or build evidence is evaluated
- THEN it is marked deferred rather than supported or distributable

### Requirement: Delivery, Rollback, and Evidence

Delivery MUST use an approved issue, feature branch, and pull request; direct `main` delivery is prohibited. Evidence MUST record Bun version, target, artifact, and PTY result. Rollback MUST revert app and dependency changes together.

#### Scenario: Reviewable rollback

- GIVEN the change requires reversal
- WHEN its rollback is applied
- THEN app and dependency changes are reverted together without altering prior bootstrap Units 1–2
