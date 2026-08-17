# Apply Progress: Validate Observability MVP/POC

## Slice 0 / PR0 Compatibility

- [x] 0.0 Completed: official `github/gh-stack` v0.1.0, its OpenCode skill, clean repositories, and local tracker/child stack metadata were verified.
- [x] 0.1 Completed: the corrected behavior-level RED test covers peer incompatibility, downgrade, overrides, legacy, and fallback packages; it deterministically fails on the unsupported baseline.
- [x] 0.2 PR2B admits the exact peer-compatible Atom React tuple without runtime use.

## PR0 RED Evidence

`mise exec bun@1.3.14 -- bun test --verbose apps/gentle-observe/test/dependency-compatibility.test.ts` exited 1 as expected: 0 pass / 1 fail. It reports six unsupported-baseline violations, including the Atom/Solid peer mismatch and the forbidden OpenTUI 0.1.6 TypeScript ^5 downgrade against workspace TypeScript 7.0.2.

## PR0 Compatibility Gate

At PR0, no non-downgrade compatible tuple existed. The rejected 0.1.6 proposal downgraded OpenTUI and excluded workspace TypeScript 7.0.2; PR2B later establishes the React tuple without overrides.

## Work Unit Evidence

| Evidence          | Result                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Focused test      | RED command above: exit 1, 0 pass / 1 expected failure.                                                                      |
| Runtime harness   | N/A: this work unit validates static dependency metadata only; it does not introduce a runtime boundary.                     |
| Rollback boundary | Revert `apps/gentle-observe/test/dependency-compatibility.test.ts` and the 0.1 task checkbox; no unrelated behavior changes. |

## Delivery Boundary

Feature Branch Chain PR0 targets `feat/validate-observability-mvp-poc`. The slice contains compatibility evidence only; no UI, contracts, demo, live integration, RDD, commit, push, or PR operation occurred.

Line accounting: 122 changed lines (120 added, 2 deleted), below the 180-line PR0 limit.

## Slice 2B / PR2B React Dependency Boundary

- Exact React/Atom React/OpenTUI pins, required direct peers/types, lockfile, compatibility test, and active guidance only.
- Chain: PR2B dependencies/guidance → PR2C renderer/runtime → PR2D Overview/navigation.
- React runtime, renderer, TSX, TypeScript/Bun/build configuration, and Atom bindings remain deferred.

## Slice 2C / PR2C React Renderer Boundary

- [x] React JSX/OpenTUI ordinary Bun compilation and explicit root lifecycle ownership.
- Lifecycle correction: unmount latches before invocation; an unmount throw still attempts renderer destroy; repeated shutdown is safe; the original unmount error is rethrown by identity; renderer-originated and `q` shutdown remain correct.
- Focused app/lifecycle verification through shims-first Bun 1.3.14 passed: 7 tests, 21 assertions, 0 failures. `tui-lifecycle.test.tsx` was intentionally explicit, not part of the configured app test target.
- Final Bun 1.3.14 matrix passed with Nx children reporting `bun test v1.3.14`: compatibility 1/1; observability contracts 4/11; CLI 7/18; focused app+lifecycle 7/21; configured app target 13/34; quality 22 tests; native e2e 3/19; all 0 failures. Unique total: 48 passed, 0 failed; raw rerun total: 58.
- Typecheck, lint, format check (38 files), native build, `git diff --check`, and manifest/lock integrity passed. Cleanup left root/app `node_modules`, root/app `dist`, `.nx`, coverage, temp, and `.tmp` absent.
- Compiled PTY/e2e proof:
  `PATH=/home/andresdavid/.local/share/mise/shims:$PATH mise exec bun@1.3.14 -- sh -c 'cd /home/andresdavid/devx-ops/gentle-observe-worktrees/validate-observability-mvp-poc-02c-react-renderer && bunx nx run app-tui:e2e --skipNxCache'`
  exited 0: 3 tests, 19 assertions, 0 failures; build dependency and e2e succeeded.
- Compiled non-retention/`q`-exit proof:
  `PATH=/home/andresdavid/.local/share/mise/shims:$PATH mise exec bun@1.3.14 -- sh -c 'cd /home/andresdavid/devx-ops/gentle-observe-worktrees/validate-observability-mvp-poc-02c-react-renderer && bun test apps/gentle-observe/test/e2e.test.ts -t "proves version, non-TTY rejection, unrelated-cwd ANSI readiness, and q exit"'`
  exited 0: 1 test passed, 2 filtered, 15 assertions, 0 failures; normal and demo PTYs exited 0 after `q` and terminal/child cleanup completed. The full e2e suite also proved TERM→KILL timeout cleanup leaves no child.
- Overview/navigation remains deferred to PR2D. At verification freeze, no stage or commit had occurred; no push, PR, GitHub write, RDD/native review, or SDD attempt occurred. Rollback is limited to PR2C renderer/config/tests and these progress markers.

## Slice 2A / PR2A Truthful Shell

- [x] 2.1a covers explicit demo/scenario forwarding, no-fallback health, persistent `DEMO DATA`, compact textual labels, and `q`.
- [x] 2.2a composes deterministic demo or default-unavailable source Layers into immutable shell props while preserving lazy renderer loading and cleanup.
- Focused CLI/app/PR1 contract tests: 13 pass, 0 fail, 35 assertions.
- Native executable proof: 3 pass, 0 fail, covering default-unavailable and `--demo --scenario normal` PTYs plus `q` cleanup.
- Focused typecheck and lint pass; format and quality tests pass. Full lint/typecheck retain only the intentional PR0 dependency-compatibility RED.
- Rollback boundary: PR2A CLI, acquisition, unavailable source, Solid shell, focused tests, and PTY assertions. Overview/navigation, React, Atom, Live, dependencies, manifests, lockfile, RDD, and GitHub remain excluded.
- Line accounting: 385 changed lines (286 additions, 99 deletions), below the 400-line cap.

## Slice 1 / PR1 Contracts + Demo

- [x] 1.1 RED tests cover malformed/private/RDD denial, bounds, health, token states, deterministic ordering, and substitution.
- [x] 1.2 GREEN adds bounded evidence/records, explicit availability/capabilities/missingness, source tags, and deterministic Layers.

| Evidence             | Result                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| RED/Focused tests    | Corrective RED: 4 tests, 3 failures; GREEN: 4 tests, 11 assertions, 0 failures.                                              |
| Runtime/type/quality | Layer substitution passed; focused typecheck/lint/format passed; `bun run check` only fails the inherited compatibility RED. |
| Rollback             | Revert `src/{domain/evidence,sources/evidence-sources,demo/layers}.ts` and `test/observability-contracts.test.ts`.           |

PR1 is local-only at commit `271fa76f8132e3cd17838826f254667b2f9622e1`: no UI, Live, persistence, dependency, GitHub, staging, or further commit changes. Inclusive candidate is 326 lines.

## Maintainer-Approved UI Authority Amendment

Stable immutable UI projections and component props remain the authority boundary; framework-local state may manage navigation/selection. PR2B admits the official Atom React dependency tuple but no runtime binding. Do not create an Atom-shaped abstraction; peer overrides, Solid, legacy/fallback, and unpublished packages remain forbidden.

PR2A remains the intermediate Solid/OpenTUI parent. PR2C migrates the same shell boundary to React/OpenTUI after PR2B; PR2D adds Overview/navigation. Dependency admission MUST NOT be reported as renderer or Atom runtime adoption.
