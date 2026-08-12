# Proposal: Bootstrap Workspace Toolchain

## Intent

Create the first developer-usable deliverable: a reproducible Nx/Bun monorepo feedback loop. One command must make a fresh Linux or macOS clone check-ready, establishing the foundation for later product work.

## Scope

### In Scope
- One canonical bootstrap command that installs or validates prerequisites, resolves the lockfile, runs checks, and reports platform, versions, checks, and terminal result for humans and CI.
- Nx graph/tasks; Bun workspaces/runtime and lockfile; TypeScript 7 typecheck; design-validated Effect 4 RC and `@effect/tsgo` diagnostics; formatter, linter, and test runner.
- A deterministic smoke/unit test plus native Linux and macOS CI evidence.
- Exact foundational versions and reviewed lockfile changes. Compatibility failure blocks the decision; it never silently downgrades the stack.
- Update testing capabilities after proof so subsequent implementation changes activate Strict TDD. Bootstrap itself is not retroactively classified as Strict TDD.

### Out of Scope
- TUI/UI, domain or connector logic, Pi/Gentle AI adapters, traces, persistence, and packaging.
- PRD or wireframe behavior; approved pre-SDD documents remain unchanged.

## Capabilities

### New Capabilities
- `workspace-toolchain`: Reproducible cross-platform bootstrap, orchestration, quality, diagnostics, tests, structured reporting, and CI proof.

### Modified Capabilities
None.

## Approach

Design validates one exact compatibility matrix for Bun, Nx, TypeScript 7, Effect 4 RC, `@effect/tsgo`, and foundational tools. Apply delivers manifests, configuration, lockfile, commands, smoke test, and CI as functional work units; each runs independently with verification and a precise rollback boundary.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| Root manifests/config | New | Workspace, pins, tasks, quality, diagnostics |
| `scripts/`, tests, CI | New | Bootstrap, summary, harness proof, native matrix |
| `openspec/config.yaml` | Modified | Proven commands and post-bootstrap Strict TDD |

## Risks and Alternatives

| Risk | Mitigation |
|---|---|
| TS7/tsgo or Effect RC incompatibility | Record blocked evidence and request a reviewed stack decision; no implicit fallback |
| Platform drift | Native matrix, idempotent checks, actionable non-zero failures |
| Review growth | Forecast 250–500 authored lines; ask before slicing if risk approaches the 800-line budget |

## Rollback Plan

Revert root toolchain configuration, bootstrap/tests/CI, lockfile, and testing-capability updates. No product code or approved document depends on this boundary.

## Dependencies

- Approved pre-SDD documents and exploration; design validation of exact pins.
- `synthetic-tui-shell` depends on this change and begins under Strict TDD.

## Success Criteria

- [ ] One fresh-clone command succeeds on native Linux and macOS and reports resolved versions/check results structurally.
- [ ] Graph, format, lint, TS7/Effect diagnostics, typecheck, and deterministic tests pass from locked dependencies.
- [ ] Failures are actionable, non-zero, and leave no false success; each work unit is independently verifiable and reversible.
