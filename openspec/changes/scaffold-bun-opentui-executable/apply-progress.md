# Apply Progress: Scaffold Bun OpenTUI Executable

## PR 1 Slice

- Accepted delivery: `auto-chain`, three sequential `stacked-to-main` PRs; 800 authored lines per slice and no pending decision.
- Current boundary: Phase 1 CLI/project only. Renderer, build, PTY, release, and later tasks remain excluded.
- Snapshot: 758 authored lines excluding generated `bun.lock` (54 root/docs, 212 app, 492 candidate-owned OpenSpec); 23 generated lockfile lines remain part of rollback.
- Accepted identity: root package and root Nx project `gentle-observe`; internal app package and Nx project `app-tui` at `apps/gentle-observe`; public command, version, future executable, and asset prefix `gentle-observe`.
- Identity correction is PR 1-only; CI remains an approved post-PR 1 work unit and is not implemented here.

## Completed Tasks

- [x] 1.1 Issue #5 and branch `feat/opentui-cli-boundary` were supplied by the parent; no delivery mutation was made here.
- [x] 1.2 Effect CLI tests cover stable version, Help-only built-ins, ordinary unknown input, `--version extra` attribution, non-TTY rejection, and lazy renderer behavior.
- [x] 1.3 Internal `app-tui` owns catalog `effect` and `@effect/platform-bun`; local `Flag.boolean("version")`, `Command.make`, `Command.run`, `Command.runWith`, `Stdio.Stdio`, `BunRuntime.runMain`, and `BunServices.layer` replace manual routing/process I/O.
- [x] 1.4 Bun 1.3.14 regenerated the lockfile and proved isolated frozen installation; Nx discovers `projectType: "application"` and cacheable inferred test/typecheck targets.

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

## Risks

- Default Bun is 1.3.11; all positive evidence uses exact Bun 1.3.14.
- The TTY renderer path deliberately yields a typed unavailable CLI error until Phase 2.
