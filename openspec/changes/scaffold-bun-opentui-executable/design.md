# Design: Scaffold Bun OpenTUI Executable

## Technical Approach

Create the first product-owned Nx package at `apps/gentle-observe`, separate CLI routing from renderer startup, and compile one `bun-linux-x64-baseline` executable. Support requires rendering from an unrelated directory in a real PTY and exiting on `q`.

## PR 1 Review Correction

The CLI boundary is Effect-first: local `Flag.boolean("version")`, `Command.make`, `Command.run`, and `Command.runWith` own parsing and test execution. `CliConfig.layer({ builtIns: [GlobalFlag.Help] })` intentionally exposes Help only. Handlers read TTY state from `Stdio.Stdio`; the renderer remains a lazy typed `CliError.UserError` boundary until Phase 2. Production uses `BunRuntime.runMain` with `BunServices.layer`; `gentle-observe` is the root infrastructure Nx project and `app-tui` is the application Nx project at `apps/gentle-observe`, with cacheable inferred `test`/`typecheck` targets.

## Architecture Decisions

| Option                            | Tradeoff                      | Decision and rationale                                                                                                                                                                                                         |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App `package.json` as Nx manifest | Distinct internal Nx identity | Keep root Nx project `gentle-observe`; name the app package/project `app-tui` at `apps/gentle-observe`; retain public executable `gentle-observe`. This preserves package-json discovery without `project.json`.               |
| Thin CLI plus TUI module          | One dynamic import            | `src/main.ts` handles `--version`, unknown arguments, and stdin/stdout TTY gates before importing `src/tui.tsx`; `src/app.tsx` only renders. This keeps non-TTY paths free of native renderer startup without invented layers. |
| Package version injected at build | Build configuration is code   | App `package.json` owns `0.1.0`; source fallback reads it, while `build.ts` injects `__GENTLE_OBSERVE_VERSION__` with Bun `define`. Source and compiled output therefore share one authority.                                  |
| Explicit renderer ownership       | `render()` returns no handle  | `tui.tsx` creates and passes `CliRenderer`; `useKeyboard` calls idempotent `renderer.destroy()` on plain `q`. Startup errors fail nonzero; destroy disposes Solid.                                                             |
| Native executable as support gate | Linux runner required         | Pin the Linux x64 native package, compile with the Solid plugin and glibc selection, then relocate the executable. No platform expansion is implied.                                                                           |

## Data Flow

```text
Stdio args -> Command.run -> version/error OR TTY gate -> lazy renderer effect -> App
PTY E2E -> relocated executable -> ready text -> q -> destroy -> exit 0
```

## File Changes

| File                                                                  | Action | Description                                                                                        |
| --------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `package.json`, `bun.lock`                                            | Modify | Preserve the root owner; add exact app catalog pins and aggregate quality scripts.                 |
| `apps/gentle-observe/package.json`                                    | Create | Version, exact catalog dependencies, Nx targets and outputs.                                       |
| `apps/gentle-observe/{tsconfig.json,bunfig.toml}`                     | Create | Extend root; `jsx: preserve`, `jsxImportSource: @opentui/solid`; preload `@opentui/solid/preload`. |
| `apps/gentle-observe/src/{main.ts,cli.ts,tui.tsx,app.tsx,version.ts}` | Create | CLI boundary, renderer lifecycle, truthful shell, version contract.                                |
| `apps/gentle-observe/build.ts`                                        | Create | Bun API build with Solid plugin, define, glibc native selection, clean output.                     |
| `apps/gentle-observe/test/{cli.test.tsx,app.test.tsx,e2e.test.ts}`    | Create | Pure CLI, `testRender`, and compiled-binary PTY proof.                                             |

## Interfaces / Contracts

The local Effect command owns `--version`, parsing, and the `Stdio` TTY gate; version is `gentle-observe 0.1.0`. Default non-TTY returns a terminal-required error; unknown args return usage error. Shell text includes “Discovery is not connected.” and `q quit`; it contains no session count.

## Target and Testing Strategy

| Target        | Policy                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typecheck`   | `tsc --noEmit -p` over real TS/TSX; cacheable.                                                                                                                          |
| `diagnostics` | Admit cacheable `effect-tsgo --noEmit -p` only after a pinned-tool spike proves it consumes this project; otherwise omit and report unavailable, never vacuous success. |
| `test`        | Bun unit/component tests; cacheable.                                                                                                                                    |
| `build`       | Verify Bun `1.3.14`; clean and emit `dist/apps/gentle-observe/gentle-observe`; cacheable with declared output.                                                          |
| `e2e`         | Depends on build; non-cacheable native PTY/process evidence. Root `check`/`affected:check` aggregate only proven quality targets, not build/E2E.                        |

Component tests assert a `50x14` frame and `q`. E2E uses `Bun.spawn` terminal at `80x24`, `TERM=xterm-256color`, isolated HOME/XDG/TMP, unrelated cwd, bounded output and 10s deadlines. It strips ANSI only for assertions, checks version/non-TTY separately, writes `q`, awaits zero, and finally closes the terminal and TERM-then-KILLs survivors. Failures name environment, build, asset, readiness, timeout, exit, or cleanup.

## Native Asset Gate

Catalog pins: `@opentui/core@0.5.2`, `@opentui/solid@0.5.2`, `solid-js@1.9.12`; app also pins optional `@opentui/core-linux-x64@0.5.2`; Effect remains `catalog:` at `4.0.0-rc.108`. Build uses `@opentui/solid/bun-plugin`, `bun-linux-x64-baseline`, and compile-time `process.env.OPENTUI_LIBC="glibc"`. A frozen clean install, clean build, executable-only relocation, isolated environment, and PTY render are mandatory. Any native-load failure blocks delivery; asset copying is a follow-up spike, not an assumed workaround.

## Threat Matrix

| Boundary                 | Applicability                                | Response / planned RED test                                                                                                                         |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation-like paths | N/A: no executable classification            | None.                                                                                                                                               |
| Git repository selection | N/A: no Git invocation                       | None.                                                                                                                                               |
| Commit state             | N/A: no commit automation                    | None.                                                                                                                                               |
| Push state               | N/A: no push automation                      | None.                                                                                                                                               |
| PR commands              | N/A: delivery is procedural, not implemented | None.                                                                                                                                               |
| Executable/PTY process   | Applicable                                   | RED tests: non-TTY blocks render; unrelated-cwd PTY reaches truthful readiness; timeout kills child; `q` exits zero; cleanup failure is attributed. |

## Migration / Rollout

Deliver via approved issue/branch/PR. Roll back app, root identity/catalog/scripts, and lockfile together. Record Bun version, target, artifact path, relocation cwd, native package, and PTY result. Strict TDD remains disabled during this change: the runner does not exist before implementation; successful verification makes a later config decision eligible.

## Open Questions

- [ ] Gate: confirm Bun 1.3.14 `Bun.spawn` exposes writable `proc.terminal` with the selected callback shape on the Linux runner.
- [ ] Gate: prove `@effect/tsgo` 0.36.4 accepts this TS 7/OpenTUI project before adding `diagnostics`.
