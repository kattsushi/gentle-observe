# Apply Progress: Scaffold Bun OpenTUI Executable

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
