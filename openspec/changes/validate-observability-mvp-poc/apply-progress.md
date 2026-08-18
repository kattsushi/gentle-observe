# Apply Progress: Validate Observability MVP/POC

## Slice 0 / PR0 Compatibility

- [x] 0.0 Completed: official `github/gh-stack` v0.1.0, its OpenCode skill, clean repositories, and local tracker/child stack metadata were verified.
- [x] 0.1 Completed: the corrected behavior-level RED test covers peer incompatibility, downgrade, overrides, legacy, and fallback packages; it deterministically fails on the unsupported baseline.
- [ ] 0.2 GREEN has not been attempted.

## RED Evidence

`mise exec bun@1.3.14 -- bun test --verbose apps/gentle-observe/test/dependency-compatibility.test.ts` exited 1 as expected: 0 pass / 1 fail. It reports six unsupported-baseline violations, including the Atom/Solid peer mismatch and the forbidden OpenTUI 0.1.6 TypeScript ^5 downgrade against workspace TypeScript 7.0.2.

## Compatibility Gate

No non-downgrade, all-peer-compatible tuple has been established. The prior 0.1.6 proposal is forbidden because it downgrades OpenTUI and its TypeScript ^5 peer is incompatible with the workspace TypeScript 7.0.2. No manifest, lockfile, install, dependency resolution, or GREEN attempt occurred in this corrective rerun.

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test | RED command above: exit 1, 0 pass / 1 expected failure. |
| Runtime harness | N/A: this work unit validates static dependency metadata only; it does not introduce a runtime boundary. |
| Rollback boundary | Revert `apps/gentle-observe/test/dependency-compatibility.test.ts` and the 0.1 task checkbox; no unrelated behavior changes. |

## Delivery Boundary

Feature Branch Chain PR0 targets `feat/validate-observability-mvp-poc`. The slice contains compatibility evidence only; no UI, contracts, demo, live integration, RDD, commit, push, or PR operation occurred.

Line accounting: 122 changed lines (120 added, 2 deleted), below the 180-line PR0 limit.

## Next Safe Local Work Unit

Task 1.1 (RED contract/privacy/demo tests) is the only later work unit that is dependency-independent from the unresolved Atom/Solid tuple; prepare it on the next local feature-chain child after PR0 is clean. All GREEN/UI/demo/executable/Live tasks remain dependent on their preceding slices or the later dual-continue gate.

## Slice 1 / PR1 Contracts + Demo

- [x] 1.1 RED tests cover malformed/private/RDD denial, bounds, health, token states, deterministic ordering, and substitution.
- [x] 1.2 GREEN adds bounded evidence/records, explicit availability/capabilities/missingness, source tags, and deterministic Layers.

| Evidence | Result |
|---|---|
| RED/Focused tests | Corrective RED: 4 tests, 3 failures; GREEN: 4 tests, 11 assertions, 0 failures. |
| Runtime/type/quality | Layer substitution passed; focused typecheck/lint/format passed; `bun run check` only fails the inherited compatibility RED. |
| Rollback | Revert `src/{domain/evidence,sources/evidence-sources,demo/layers}.ts` and `test/observability-contracts.test.ts`. |

PR1 is local-only: no UI, Live, persistence, dependency, GitHub, staging, or commit changes. Inclusive candidate is 326 lines.
