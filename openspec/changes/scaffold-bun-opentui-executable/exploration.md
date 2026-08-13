# Exploration: Scaffold Bun OpenTUI Executable

> **Current identity correction (PR 1):** The root package and infrastructure Nx project are `gentle-observe`. The app at `apps/gentle-observe` is the internal `app-tui` Nx project. `gentle-observe` remains the public command, version-output name, future executable, and release-asset prefix. Earlier exploratory references to a single root-only project or older delivery strategy are historical and not authoritative.

## Decision summary

Create one real `apps/gentle-observe` Nx project that renders a deterministic, read-only health shell with SolidJS and OpenTUI, compiles it with Bun, and proves the produced executable through native terminal execution. This is a product-shell and executable-boundary proof, not an implementation of Pi, Gentle AI, persistence, release publishing, or the broader PRD.

The change should be delivered through a new issue, feature branch, and reviewable PR slices. The session budget is 800 changed lines, but each autonomous slice should target fewer than 400 authored changed lines. Delivery strategy is `ask-on-risk`.

## Current State

- Historical snapshot: the repository then had only the root Nx project. The accepted PR 1 architecture now has root infrastructure project `gentle-observe` and internal application project `app-tui` at `apps/gentle-observe`, with real app `test` and `typecheck` targets.
- `package.json` declares Bun `1.3.14` and locks it with the workspace, but the active local `bun` command is `1.3.11+af24e281e`. The first implementation must run with the pinned Bun before treating a compile or test result as valid.
- Exact workspace pins already exist for TypeScript `7.0.2`, Effect `4.0.0-rc.108`, and `@effect/tsgo` `0.36.4`. Strict TDD remains disabled because no durable test-bearing project exists.
- The PRD requires a production TUI using the Bun build path, Linux/macOS startup, keyboard-first interaction, and no Vite. The wireframes specify a global shell, health labels, a `q` quit key, and a minimum interactive viewport of `50x14`; the first screen can safely implement only the shell and health values.
- The local source tree has no `scripts/bootstrap`. GitHub issue #1 and draft PR #2 are closed and PR #2 was not merged. Active bootstrap OpenSpec artifacts contradict one another about Unit 3, so they cannot be treated as evidence that host bootstrap exists.

## Validated Dependencies and APIs

| Area                   | Verified evidence                                                                                                                                                                                                                                        | Consequence for this change                                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenTUI packages       | Current upstream packages are `@opentui/solid@0.5.2`, which depends on `@opentui/core@0.5.2`, plus peer `solid-js@1.9.12`. `@opentui/core` requires Bun `>=1.3.0`.                                                                                       | Pin all three application dependencies to these compatible versions, rather than adding a React/Ink/Vite stack.                                                                                                                                          |
| Solid integration      | OpenTUI documents `jsx: "preserve"`, `jsxImportSource: "@opentui/solid"`, `preload = ["@opentui/solid/preload"]`, `render(() => <App />)`, `useKeyboard`, `useRenderer`, and `testRender`. A production compile uses `@opentui/solid/bun-plugin`.        | The app needs a project `tsconfig`, a Bun preload declaration, and a build script/API that registers the Solid Bun plugin.                                                                                                                               |
| Native runtime         | `@opentui/core` selects an optional platform package at runtime: darwin x64/arm64, Linux x64/arm64, and Linux x64/arm64 musl. Its Bun runtime source dynamically imports the selected package and uses bundled file imports for parser/wasm assets.      | Native assets are the primary compile risk. Do not claim that a cross-compiled binary is standalone until a native-run acceptance test proves the rendered shell on that target/libc. Build-time must resolve every intended target asset.               |
| Bun executable build   | Bun documents `bun build --compile --target=...` as a standalone executable containing bundled code, imported packages, and Bun. It supports embedded file imports and `--asset` directory trees. It can compile across operating systems/architectures. | Use one explicit build entrypoint and no Vite. Disable runtime `.env` and `bunfig.toml` autoloading for deterministic smoke execution unless a future config requirement needs them.                                                                     |
| OpenTUI upstream proof | OpenTUI itself has a standalone Bun acceptance script that compiles an executable and runs it on the native host. Its Solid examples compile with `Bun.build`, the Solid plugin, and platform targets.                                                   | This validates feasibility, but it is not sufficient project evidence: Gentle Observe must render its own shell and execute its binary in its own target harness.                                                                                        |
| Component tests        | OpenTUI's test renderer supplies fixed dimensions, keyboard input, resize, `renderOnce`, `captureCharFrame`, and `waitForFrame`; `@opentui/solid` supplies `testRender`.                                                                                 | Use this for fast, deterministic layout/key tests, then keep a smaller real-executable test as the distribution boundary.                                                                                                                                |
| Executable PTY test    | Bun documents `Bun.spawn({ terminal: { cols, rows, data } })`, with terminal input through `proc.terminal.write`, plus timeout/AbortSignal process control.                                                                                              | A Bun-test PTY harness can run the executable with a fixed terminal size, assert the ready frame, send `q`, and require an orderly zero exit. Use output normalization only for terminal control sequences; do not snapshot timing or environment paths. |
| Effect Atom Solid      | The current Effect Atom package family includes `@effect-atom/atom-solid`; the registry reports `0.1.0`, while core `@effect-atom/atom` is `0.5.3`.                                                                                                      | The first static health shell has no asynchronous effectful state, so defer Effect Atom Solid until it owns a real source/state boundary. Adding it now would be a non-functional dependency.                                                            |

## Compile Matrix and Execution Boundary

| Initial artifact  | Bun target                | Native OpenTUI selection     | Build location   | Required execution proof     |
| ----------------- | ------------------------- | ---------------------------- | ---------------- | ---------------------------- |
| Linux x64 glibc   | `bun-linux-x64-baseline`  | `@opentui/core-linux-x64`    | Cross-compilable | Linux x64 glibc PTY runner   |
| Linux arm64 glibc | `bun-linux-arm64`         | `@opentui/core-linux-arm64`  | Cross-compilable | Linux arm64 glibc PTY runner |
| macOS x64         | `bun-darwin-x64-baseline` | `@opentui/core-darwin-x64`   | Cross-compilable | macOS x64 PTY runner         |
| macOS arm64       | `bun-darwin-arm64`        | `@opentui/core-darwin-arm64` | Cross-compilable | macOS arm64 PTY runner       |

- Prefer `baseline` for x64 initial public artifacts: Bun documents that the ordinary x64 target needs AVX2 and `baseline` supports older CPUs. There is no baseline variant for arm64.
- Do not add musl artifacts in the first slice. OpenTUI has dedicated musl native packages and switches them via `OPENTUI_LIBC=musl`; that is a separate compatibility surface which needs an Alpine/musl native runner and explicit artifact selection.
- Cross-compilation establishes buildability only. A target must execute on a native runner because the executable contains a target-specific Bun runtime and OpenTUI loads a target-specific shared library. Local Linux cannot validate macOS execution.
- `--version` and `--smoke` are appropriate non-interactive entry modes. `--version` should print a compile-time version and exit zero. `--smoke` should create/render/destroy the shell under fixed dimensions and exit zero without requiring a human terminal. The interactive default must retain the real keyboard `q` path.

## Smallest Useful Application Contract

The first app should be a deterministic health shell, not an imitation of the full overview:

```text
Gentle Observe | local shell
Runtime: UNKNOWN | Process: UNKNOWN
No sources connected in this executable proof.
q quit | ? help
```

- It uses a basic OpenTUI `box` and `text`, with a persistent text key hint.
- It reports static `UNKNOWN` source states and explicitly says no sources are connected, preserving the PRD's evidence-plane distinction without inventing data.
- `q` destroys the renderer and exits cleanly; Ctrl-C retains the renderer's configured safe exit behavior.
- The same shell is used by fixed-size component snapshots and by the executable PTY test. A `--smoke` mode may emit a short stable success marker after render/cleanup; it must not bypass renderer construction.
- Excluded from this change: connectors, adapters, repositories, discovery, storage, effectful polling, UI routing, tables, timelines, colors as meaning, Termcn, release publication, archives, checksums, signing, notarization, Homebrew, and any mutation capability.

## Nx Ownership and Quality Boundary

The accepted internal `app-tui` project manifest/configuration at `apps/gentle-observe` gives Nx a real product owner. It exposes only non-vacuous targets:

| Target        | Evidence it owns                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `typecheck`   | Project TSX and app `tsconfig`; validates Solid/OpenTUI types.                                                                  |
| `diagnostics` | Project Effect/TypeScript diagnostics against actual app source, only after its command is proven against the pinned toolchain. |
| `test`        | OpenTUI test-renderer keyboard/frame tests and executable/PTY test harness.                                                     |
| `build`       | Compiled named executable(s) for selected Bun targets.                                                                          |
| `e2e`         | Builds or consumes the native artifact and proves `--version`, `--smoke`, ready frame, `q`, exit code, timeout, and cleanup.    |

Root `check` and `affected:check` must not be broadened until the app targets are proven and the change explicitly decides the aggregate policy. The app target must be independently invokable with `nx run`; no custom root quality runner should be introduced. Strict TDD remains disabled until the test target has proven durable, non-vacuous execution in the repository; after that proof, a later SDD decision may enable it.

## Approaches

1. **Solid/OpenTUI executable proof with component and PTY tests** — Build the simple shell with `@opentui/solid`, compile with the documented Bun plugin, use `testRender` for deterministic UI behavior, and run the produced executable under a PTY.
   - Pros: Validates the approved stack and real distribution boundary; matches wireframe primitives; isolates native/compile risks early; keeps tests deterministic.
   - Cons: Requires target-native runners for platform claims; OpenTUI's native optional assets make packaging sensitive; includes initial build configuration work.
   - Effort: Medium.

2. **Plain OpenTUI core proof first, add Solid later** — Render the static shell directly through `@opentui/core` and prove Bun compilation before adding Solid.
   - Pros: Fewer dependencies and less JSX build configuration in the first PR.
   - Cons: Defers the actual approved Solid integration, risks a second scaffold rewrite, and fails the requested SolidJS + OpenTUI validation slice.
   - Effort: Low initially, Medium overall.

3. **Component-only test proof** — Use OpenTUI's headless test renderer without executing compiled binaries.
   - Pros: Fast, stable, broad key/resize coverage.
   - Cons: Cannot prove Bun compile output, native library loading, terminal-mode behavior, or packaging. It is insufficient as the deliverable.
   - Effort: Low, but unacceptable alone.

## Recommendation

Choose Approach 1. Start with a Linux x64 glibc baseline executable and its PTY acceptance in the first reviewable slice, because it establishes the durable runner needed to reconsider Strict TDD. Add platform-native execution in a separate slice rather than publishing artifacts. The SDD proposal should state that every claimed target is both compiled and executed natively; unexecuted cross-built artifacts are experimental and must not be distributed.

## Work-Unit Forecast

| Slice | Deliverable and verification                                                                                                                                                             | Forecasted authored lines | Review risk                                |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------: | ------------------------------------------ |
| 1     | New issue/feature branch; app project, exact dependencies, Solid/OpenTUI shell, compile build, component frame/key tests, Linux x64 compiled-binary `--version`/`--smoke`/PTY quit proof |                   330–430 | Medium; ask before apply if it exceeds 400 |
| 2     | Native-execution matrix harness and CI runners for macOS x64, macOS arm64, and Linux arm64; target artifact naming and deterministic environment                                         |                   220–360 | Medium; runner availability is the gate    |
| 3     | Project-owned `typecheck`/diagnostics/test aggregation decision, docs, and a narrow update of testing capabilities after real runner evidence                                            |                   120–220 | Low                                        |

Estimated authored total: **670–1,010 lines**. Dependency lockfile changes are generated and excluded from authored-risk counting but remain reviewed as exact dependency identity. The plan crosses the 800-line session budget at the high end, so preserve the three delivery units; do not use a single PR or introduce release tooling to collapse them.

Decision needed before apply: Yes
Chained PRs recommended: Yes
400-line budget risk: Medium

## Security and Release Sequencing

**Now:** exact dependency/version pins; a named target matrix; no runtime config autoload during smoke tests; timeouts and bounded captured PTY output; isolated temporary data/home directories; executable names that encode platform/arch/libc; native execution evidence; no secrets embedded in the executable.

**Later:** archives, SHA-256 checksums, GitHub Release uploads, SBOM/provenance attestations, macOS codesigning/notarization, release signing keys, Homebrew formula/tap, updater behavior, and musl artifact support. Checksums become mandatory when files leave CI as distributable release assets; signing/notarization belongs with the first public macOS release, not the scaffold.

## Bootstrap-Workspace-Toolchain Reconciliation

Do not carry the rejected host bootstrap into this change. Units 1–2 are delivered on `master`; the actual tree confirms their root Nx quality baseline. Unit 3 did not merge, despite stale SDD artifacts that describe it as implemented, and GitHub PR #2 is closed/unmerged. Unit 4 should be narrowed: its current `affected -t format,lint` concept remains a future CI-selection policy, while app `typecheck`, diagnostics, build, test, and E2E targets belong to this executable change only after they are durable.

After the new app establishes durable target evidence, create a dedicated reconciliation/archival step for `bootstrap-workspace-toolchain`: mark Unit 3 rejected, retain Units 1–2, move Unit 4's generic affected-selection statement to a future CI change or close it as deferred, and archive only after canonical OpenSpec/Engram artifacts match `master`. Do not edit those canonical artifacts as part of this exploration.

## Risks and Unknowns

- **Native asset embedding:** OpenTUI dynamically imports an optional platform package. Upstream proves a native Bun executable, but the project must empirically prove that the compiled renderer works for every claimed target, especially cross-compiled binaries.
- **Runner availability:** Linux/macOS x64/arm64 native PTY runners may not all be available under the repository's GitHub Actions plan. This is a delivery decision before asserting all four support targets.
- **Pinned Bun mismatch:** The active local Bun is `1.3.11` while the repository pin is `1.3.14`; builds/tests must use the pinned host runtime.
- **OpenTUI release cadence:** `0.5.2` is current but early-stage. Exact pins and a small compile-surface isolate upgrades.
- **Effect Atom scope:** Product direction names Effect Atom Solid, but it adds no value before a real effectful state/source boundary. Product confirmation is needed only if the first scaffold must import it despite being unused.
- **CLI semantics:** Confirm whether `--smoke` is a permanent supported operator command or test-only. `--version` is recommended as a stable public command; `--smoke` should not become product surface accidentally.

## Ready for Proposal

**Yes, conditionally.** The proposal should authorize a minimal static health shell plus native executable proof, record `@opentui/core` / `@opentui/solid` / `solid-js` exact pins, choose a first supported native target (recommended Linux x64 glibc baseline), and require a decision on CI-native runner availability before promising the full Linux/macOS x64/arm64 matrix. It should explicitly defer release publication/security packaging and reconcile the prior bootstrap change in a separate archival/rescope action.

## Evidence Sources

- Repository: `package.json`, `nx.json`, `tsconfig.base.json`, `docs/development/workspace-graph.md`, `docs/product/prd.md`, `docs/design/tui-wireframes.md`, and active `openspec/changes/bootstrap-workspace-toolchain/*`.
- Bun official documentation: Single-file executable / supported targets / embedded assets / runtime autoload behavior.
- OpenTUI upstream: `packages/solid/README.md`, `packages/core/package.json`, `packages/solid/package.json`, `packages/solid/index.ts`, `packages/solid/examples/build.ts`, `packages/core/src/testing/README.md`, and `packages/core/scripts/standalone-test.ts`.
- GitHub: closed issue #1 and closed-unmerged draft PR #2 in `kattsushi/gentle-observe`.
