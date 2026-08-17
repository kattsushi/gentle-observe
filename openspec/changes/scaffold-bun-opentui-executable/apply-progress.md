# Apply Progress: Scaffold Bun OpenTUI Executable

## PR 1 Slice

- Accepted delivery: `auto-chain`, three sequential `stacked-to-main` PRs; 800 authored lines per slice and no pending decision.
- Current boundary: Phase 1 CLI/project only. Its renderer, build, PTY, release, and later tasks were excluded.
- Snapshot: 758 authored lines excluding generated `bun.lock` (54 root/docs, 212 app, 492 candidate-owned OpenSpec); 23 generated lockfile lines remain part of rollback.
- Accepted identity: root package and root Nx project `gentle-observe`; internal app package and Nx project `app-tui` at `apps/gentle-observe`; public command, version, future executable, and asset prefix `gentle-observe`.
- Identity correction is PR 1-only; CI remains an approved post-PR 1 work unit and is not implemented here.

## Completed Tasks

- [x] 1.1 Issue #5 and branch `feat/opentui-cli-boundary` were supplied by the parent; no delivery mutation was made here.
- [x] 1.2 Effect CLI tests cover stable version, Help-only built-ins, ordinary unknown input, `--version extra` attribution, non-TTY rejection, and lazy renderer behavior.
- [x] 1.3 Internal `app-tui` owns catalog `effect` and `@effect/platform-bun`; local `Flag.boolean("version")`, `Command.make`, `Command.run`, `Command.runWith`, `Stdio.Stdio`, `BunRuntime.runMain`, and `BunServices.layer` replace manual routing/process I/O.
- [x] 1.4 Bun 1.3.14 regenerated the lockfile and proved isolated frozen installation; Nx discovers `projectType: "application"` and cacheable inferred test/typecheck targets.

## PR 2 Slice

- Delivery: the accepted three-PR `stacked-to-main` plan continues after PR 1 merged. This applies only Phase 2 tasks 2.1–2.4 on `feat/opentui-renderer-build`; no commit, push, PR, or review mutation was made by this apply phase.
- Scope: the renderer is imported only after the existing TTY gate, renders truthful discovery status at `50x14`, destroys idempotently on plain `q`, and compiles only `bun-linux-x64-baseline` with glibc selection.
- Exclusions: Phase 3 PTY/E2E, release/deployment, Homebrew, macOS, arm64, musl, checksums, signing, discovery integration, fake data, and smoke flags remain untouched.

## Completed Tasks

- [x] 2.1 RED evidence was captured before `src/app.tsx` existed: exact Bun 1.3.14 `bun test test/app.test.tsx` exited 1 with `Cannot find module '../src/app'`.
- [x] 2.2 Added the truthful `App` and deferred `startTui` module. `useKeyboard` accepts only plain `q`; both default and startup cleanup paths guard `CliRenderer.destroy()` with `isDestroyed`.
- [x] 2.3 Added exact catalog pins for OpenTUI 0.5.2 and Solid 1.9.12, preload configuration, a cacheable build target, and `build.ts` that cleans `dist/apps/gentle-observe`, injects the app package version, selects glibc, uses the Solid Bun plugin, and compiles `bun-linux-x64-baseline`.
- [x] 2.4 GREEN proof completed with exact Bun 1.3.14: app typecheck/tests and compile passed; the clean executable emitted `gentle-observe 0.1.0` for `--version` and non-TTY default launch exited 1 with the terminal-required error.

## Review-Correction Evidence

| Stage                | Command / result                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration RED        | `mise exec bun@1.3.14 -- bun test apps/gentle-observe/test/cli.test.ts` exited 1 before the Effect CLI implementation existed.                                                                                                            |
| Migration GREEN      | `mise exec bun@1.3.14 -- bunx nx run app-tui:test --skipNxCache` exited 0.                                                                                                                                                                |
| Typecheck            | `mise exec bun@1.3.14 -- bunx nx run app-tui:typecheck --skipNxCache` exited 0.                                                                                                                                                           |
| Metadata             | Current proof uses `nx show project gentle-observe` for root infrastructure and `nx show project app-tui` for the application with cache true for inferred `test` and `typecheck`.                                                        |
| Runtime              | Source `BunRuntime.runMain` execution: `--help`/`--version` exit 0; unknown, `--version extra`, `--wizard`, and piped no-arg launch exit 1. Help lists only `--help` and local `--version`; mixed input identifies `extra` as unexpected. |
| Bun gates            | `/bin/sh` mismatch and restricted-PATH missing-Bun commands both exit 1 with observed attribution.                                                                                                                                        |
| Clean frozen install | A temporary copy without `node_modules` ran direct Bun 1.3.14 `install --frozen-lockfile`, exited 0, and was removed; no temp directory remained.                                                                                         |
| Final checks         | Lint, root `check`, candidate Oxfmt, and `git diff --check` exit 0.                                                                                                                                                                       |
| Identity proof       | Bun 1.3.14 regenerated `bun.lock` with root `gentle-observe` and app workspace `app-tui`; both root/app Nx graph inspections exit 0.                                                                                                      |

## Work Unit Evidence

| Evidence        | Result                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused tests   | `Command.runWith` unit tests provide deterministic `Stdio.layerTest` and Bun platform services; they do not invoke `BunRuntime.runMain`. Version/help/invalid/non-TTY keep the renderer at zero; TTY invokes it once. |
| Runtime harness | `Command.run` reads production `Stdio` under `BunRuntime.runMain` and `BunServices.layer`; no manual `Bun.argv`, process exit, Promise runtime, or direct stream write remains.                                       |
| Rollback        | Revert `apps/gentle-observe/`, root manifest/catalog changes, `bun.lock`, PR 1 OpenSpec artifacts, and `docs/development/workspace-graph.md` together.                                                                |

## PR 2 Work Unit Evidence

| Evidence                     | Result                                                                                                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED                          | `mise exec bun@1.3.14 -- bun test test/app.test.tsx` from `apps/gentle-observe` exited 1 before `src/app.tsx` existed; Bun reported `Cannot find module '../src/app'`.                                                                             |
| Focused test                 | `mise exec bun@1.3.14 -- bun test test/app.test.tsx` exited 0: 1 pass, 0 fail, 2 assertions. `mise exec bun@1.3.14 -- bunx nx run app-tui:test --skipNxCache` exited 0.                                                                            |
| Typecheck                    | `mise exec bun@1.3.14 -- bunx nx run app-tui:typecheck --skipNxCache` exited 0.                                                                                                                                                                    |
| Build                        | `mise exec bun@1.3.14 -- bunx nx run app-tui:build --skipNxCache` exited 0 after cleaning `dist/apps/gentle-observe`; it produced only `dist/apps/gentle-observe/gentle-observe` (145016960 bytes).                                                |
| Compiled runtime             | `dist/apps/gentle-observe/gentle-observe --version` exited 0 with `gentle-observe 0.1.0`; a default launch with empty piped stdin exited 1 with `gentle-observe requires an interactive terminal.`                                                 |
| Runtime harness              | N/A for this Phase 2 boundary: the required real PTY, unrelated-directory, asset-readiness, timeout, and cleanup proof is exclusively Phase 3 and was not launched.                                                                                |
| Dependency and format checks | `mise exec bun@1.3.14 -- bun install --frozen-lockfile` exited 0 (250 installs checked, no changes); the targeted Oxfmt check and `git diff --check` exited 0.                                                                                     |
| Rollback                     | Revert only `package.json`, `bun.lock`, `apps/gentle-observe/{package.json,tsconfig.json,bunfig.toml,build.ts,src/app.tsx,src/cli.ts,src/tui.tsx,src/version.ts,test/app.test.tsx}`, and these Phase 2 task/progress updates. PR 1 remains intact. |

## Risks

- Default Bun is 1.3.11; all positive evidence uses exact Bun 1.3.14.
- The actual native PTY asset/readiness proof remains a Phase 3 delivery gate; compilation and non-TTY execution alone do not establish native runtime support.

## Phase 2 Effect-First Build Review Correction

- Scope: a human review correction changed only `apps/gentle-observe/build.ts` within completed tasks 2.1–2.4. It replaces direct `node:*` filesystem/path access and imperative top-level flow with `Effect.fn` operations using shared `FileSystem.FileSystem` and `Path.Path` services.
- Runtime: `BunRuntime.runMain` runs the build program after `BunServices.layer` provisions the Bun-backed shared services. `Bun.env.OPENTUI_LIBC` remains `glibc`; the Solid plugin, package-version define, `bun-linux-x64-baseline` target, output directory, and executable name are unchanged.
- Failure contract: `CompilationError` retains `[compilation]` attribution, Bun log messages, and a caught build cause without direct `console.*`, `process.exit`, unchecked casts, or non-null assertions.
- Native attempt: token `sha256:8c3f0e4fd9ef0faa47cf7a3372d2ac0000e3207e23e750c2521e3ede1461f8c9`; acquire request `phase2-effect-build-correction-acquire-20260814-009`; distinct settlement request `phase2-effect-build-correction-settle-20260814-010`; one passed attempt, no successor lineage.

## Phase 2 Effect-First Correction Evidence

| Evidence             | Exact result                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Host-boundary scan   | A targeted `rg` scan found no direct Node imports, console calls, or process exits in `build.ts`.                                                                                                                                                            |
| Focused typecheck    | `mise exec bun@1.3.14 -- bunx nx run app-tui:typecheck --skipNxCache` exited 0.                                                                                                                                                                              |
| Focused tests        | `mise exec bun@1.3.14 -- bunx nx run app-tui:test --skipNxCache` exited 0 under Bun 1.3.14.                                                                                                                                                                  |
| Build                | `mise exec bun@1.3.14 -- bunx nx run app-tui:build --skipNxCache` exited 0 and emitted `dist/apps/gentle-observe/gentle-observe`.                                                                                                                            |
| Runtime harness      | Compiled `--version` exited 0 with `gentle-observe 0.1.0`; empty-piped default launch exited 1 with `gentle-observe requires an interactive terminal.` No Phase 3 PTY was launched.                                                                          |
| Root quality         | `bun run check`, `bun run format`, and `git diff --check` exited 0; root quality reported one pre-existing `src/app.tsx` warning only.                                                                                                                       |
| Workload             | Candidate authored-line accounting excludes generated `bun.lock` and remains within the 800-line slice budget; the correction itself stays within its 120-line native-attempt limit.                                                                         |
| Cleanup and rollback | Generated `dist/apps/gentle-observe`, command captures, and correction processes are removed after validation. Revert `apps/gentle-observe/build.ts` and this evidence section to restore the prior Phase 2 build boundary without touching PR 1 or Phase 3. |

## Phase 2 Data Tagged Error Human-Review Correction

- Scope: `CompilationError` now uses the lightweight `Data.TaggedError` API for this internal build-only failure instead of a manual `Error` subclass or schema-backed model.
- Failure shape: the tagged error carries the fixed `Bun.build` operation, Bun diagnostics, a human-readable message, and the original cause without manual `_tag`, casts, console calls, or process exits.
- Output: the message still begins `[compilation] Unable to compile gentle-observe.` so `BunRuntime.runMain` preserves the existing attribution contract.

## Phase 2 Data Tagged Error Correction Evidence

| Evidence          | Exact result                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static error scan | `build.ts` contains `Data.TaggedError` and no `Schema`, manual `extends Error`, manual `_tag`, `node:*`, `console.*`, or `process.exit`.                      |
| Focused checks    | Exact Bun 1.3.14 app typecheck and build completed with Nx cache skipped; compiled `--version` exited 0 with `gentle-observe 0.1.0`.                          |
| Evidence reuse    | Existing Phase 2 tests and runtime evidence remain valid because this correction changes only the internal typed error representation, not renderer behavior. |
| Rollback          | Revert only `apps/gentle-observe/build.ts` and this Data correction section; Phase 1 and Phase 3 remain unchanged.                                            |

## PR 3 Slice

- Delivery: accepted `auto-chain` in the sequential `stacked-to-main` plan; this Phase 3-only PR slice runs on `feat/opentui-native-pty` from clean `master` commit `1948abcb`. No commit, push, PR, GitHub, or native-review mutation was made by this apply phase.
- Scope: the test-owned E2E harness executes only a copied compiled `gentle-observe` artifact. It never launches source mode, runs the copy from a unique unrelated `/tmp/gentle-observe-e2e.XXXXXX/run` directory, and deletes the artifact copy plus isolated HOME/XDG/TMP hierarchy in `finally`.
- Exclusions: release/CD, Homebrew, macOS, arm64, musl, checksums, signing, deployment, discovery integration, fake data, smoke flags, Phase 4 closure, and unrelated warning cleanup remain untouched.

## Completed Tasks

- [x] 3.1 RED: added `test/e2e.test.ts` before its harness existed. Exact Bun 1.3.14 `bun test test/e2e.test.ts` exited 1, establishing the missing-harness RED state.
- [x] 3.2 GREEN: added test-owned `Bun.spawn` PTY support with `80x24`, `TERM=xterm-256color`, isolated HOME/XDG/TMP, 64 KiB capture, ANSI-only normalization, a 10s readiness/quit deadline, and deterministic `TERM` then `KILL` cleanup.
- [x] 3.3 GREEN: exact Bun 1.3.14 `mise exec bun@1.3.14 -- bunx nx run app-tui:e2e --skipNxCache` exited 0 after its `app-tui:build` dependency. It proved compiled version, non-TTY rejection, truthful PTY readiness, plain `q` zero exit, and forced timeout cleanup.

## PR 3 Work Unit Evidence

| Evidence                       | Exact result                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED                            | `mise exec bun@1.3.14 -- bun test test/e2e.test.ts` from `apps/gentle-observe` exited 1 before `test/support/executable-pty.ts` existed.                                                                                                                                                                                                          |
| Focused test                   | `mise exec bun@1.3.14 -- bun test test/e2e.test.ts` exited 0 after GREEN, covering compiled version/non-TTY plus unrelated-cwd PTY readiness and `q`; asset-stage attribution; forced TERM-to-KILL readiness-deadline cleanup.                                                                                                                    |
| Runtime harness                | `mise exec bun@1.3.14 -- bunx nx run app-tui:e2e --skipNxCache` exited 0. Its non-cacheable E2E target depends on `app-tui:build` and executes only `dist/apps/gentle-observe/gentle-observe`, copied with preserved mode to an isolated artifact directory.                                                                                      |
| Bun and build target           | Bun `1.3.14` (`0d9b296a`); `bun-linux-x64-baseline`; `@opentui/core-linux-x64@0.5.2`; artifact `dist/apps/gentle-observe/gentle-observe`.                                                                                                                                                                                                         |
| Relocation and readiness       | The executable copy ran from unique unrelated cwd `/tmp/gentle-observe-e2e.XXXXXX/run` with isolated `HOME`, `TMPDIR`, `XDG_CACHE_HOME`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME`; ANSI-only normalized output contained `Discovery is not connected.` and `q quit`.                                                                                |
| Exit and cleanup               | Compiled `--version` exited 0 with `gentle-observe 0.1.0`; compiled default non-TTY exited 1 with `requires an interactive terminal`; plain `q` exited 0. The forced child ignored TERM, received TERM then KILL, reported `terminalClosed: true` and `noLeaks: true`, and its isolated directory was removed.                                    |
| Failure attribution and bounds | `PtyE2eError` uses `Data.TaggedError` and stages `asset`, `environment`, `version`, `non-tty`, `readiness`, `timeout`, `exit-code`, and `cleanup`. Capture retains only the final 64 KiB by raw bytes, and all readiness/exit waits are deadline-bound without synchronization sleeps.                                                            |
| Quality                        | Exact Bun 1.3.14 `nx run app-tui:typecheck --skipNxCache`, `nx run app-tui:test --skipNxCache`, targeted Oxfmt check, and `nx run app-tui:e2e --skipNxCache` exited 0. `bun run check`, forced root format/lint/quality checks, check-only root Oxfmt, and `git diff --check` exited 0; only the pre-existing `src/app.tsx` lint warning remains. |
| Rollback                       | Revert only `apps/gentle-observe/package.json`, `apps/gentle-observe/test/e2e.test.ts`, `apps/gentle-observe/test/support/executable-pty.ts`, and Phase 3 task/progress updates. Phase 1 and Phase 2 remain intact.                                                                                                                               |

## PR 3 Native Attempt Settlement

- Token: `sha256:41205a1f3cc81ea68e7a4efaa1338cfaf207c56b3dfd2115f42c5ed79e9fabe2`.
- Acquire request: `phase3-apply-acquire-20260814-022`.
- Settlement request: `phase3-apply-settle-20260814-023`.
- Attempts: 2 of 2 maximum. Attempt 1 exposed that terminal close could leave a trailing ANSI DCS response after readiness; the harness now snapshots normalized output exactly when deterministic readiness is observed. Attempt 2 passed the exact Nx E2E target. Settlement: passed; no successor lineage or remediation was created.

## Phase 3 Bounded Correction

- Scope: correction of four independent-validator blockers only: non-E2E unit targeting, APC normalization, raw-byte capture, and early-exit attribution. Phase 4 and all release, delivery, discovery, and platform work remain excluded.
- `app-tui:test` now names only CLI, component, and PTY-support regressions; `app-tui:e2e` remains non-cacheable and depends on `build`.
- Capture retains the final 65,536 raw bytes before a single decode. CSI, OSC, DCS, and Kitty APC sequences are removed for assertions; normalized readiness output has no ESC byte.
- Missing/non-executable artifacts report `asset`; setup/terminal failures report `environment`; child exit before readiness reports `exit-code`; an unmet readiness deadline reports `readiness`; post-quit deadline remains `timeout`; cleanup is unchanged.

| Evidence             | Exact result                                                                                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED → GREEN          | Before exports/implementation, `mise exec bun@1.3.14 -- bun test test/executable-pty.test.ts` exited 1. After correction it exited 0; the app unit target then reported 11 pass, 0 fail, 26 assertions across 3 files without `dist`.                                                                |
| Focused unit proof   | After `rm -rf dist/apps/gentle-observe`, `mise exec bun@1.3.14 -- bunx nx run app-tui:test --skipNxCache` exited 0 and confirmed `CLEAN_DIST=0`.                                                                                                                                                     |
| Runtime harness      | From clean state, `mise exec bun@1.3.14 -- bunx nx run app-tui:e2e --skipNxCache` built then passed. It retained compiled-only unrelated-cwd, 80x24, TERM→KILL, isolated environment, and plain-`q` evidence.                                                                                        |
| Quality and CI       | `app-tui:typecheck`, `app-tui:build`, targeted check-only Oxfmt, and `git diff --check` exited 0. Clean `bunx nx run-many -t format,lint,quality-test,test,typecheck --outputStyle=static --nxBail` passed 5/5 tasks with no `dist`; the only lint output is the pre-existing `src/app.tsx` warning. |
| Rollback and cleanup | Revert only the Phase 3 harness/tests, its app test script, and this correction section. The final cleanup removed `dist/apps/gentle-observe` and isolated `/tmp/gentle-observe-e2e.*` trees; no child remained.                                                                                     |

## Phase 3 Correction Native Attempt Settlement

- Token: `sha256:e387310448ea7308fa7a3392b25e2c75637937889e760e68b2a523f8c5657349`.
- Acquire request: `phase3-correction-acquire-20260814-029`; settlement request: `phase3-correction-settle-20260814-030`.
- Attempts: 1 of 1. Settlement: passed; no successor lineage. The correction is within its 200-line budget and the complete authored candidate remains within 800 lines.

## PR 3 Phase 4.1 Support Documentation and Checks

- Scope: completed task 4.1 only. `apps/gentle-observe/README.md` states the validated native Linux x64 glibc-baseline boundary and explicitly defers releases, Homebrew, macOS, arm64, musl, checksums, and signing.
- Exclusions: task 4.2 human review/delivery and task 4.3 bootstrap-workspace closure remain pending. No Phase 3 runtime code or native-attempt ledger state changed.

## PR 3 Phase 4.1 Work Unit Evidence

| Evidence                | Exact result                                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused test command    | `mise exec bun@1.3.14 -- bunx nx run app-tui:test --skipNxCache` exited 0.                                                                                                                                                         |
| App target sweep        | Exact Bun 1.3.14 `app-tui:typecheck`, `app-tui:test`, `app-tui:build`, and non-cacheable `app-tui:e2e` each exited 0 with Nx cache skipped; E2E rebuilt the executable.                                                            |
| Runtime harness         | `mise exec bun@1.3.14 -- bunx nx run app-tui:e2e --skipNxCache` exited 0 and retained the compiled-only unrelated-cwd Linux x64 PTY, readiness, plain-`q`, and cleanup proof.                                                      |
| Root quality            | `mise exec bun@1.3.14 -- bunx nx run gentle-observe:check --skipNxCache` exited 0: format passed, quality-test reported 21 pass/0 fail, and lint emitted only the pre-existing `src/app.tsx` warning. `git diff --check` exited 0. |
| Formatter normalization | The first root check correctly exposed only a new README formatting issue; `gentle-observe:format-write` normalized it before the passing proof.                                                                                   |
| Rollback boundary       | Revert only `apps/gentle-observe/README.md` and this task/progress evidence; Phase 1–3 source, package target, and runtime behavior remain intact.                                                                                 |
