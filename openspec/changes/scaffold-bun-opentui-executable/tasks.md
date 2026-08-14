# Tasks: Scaffold Bun OpenTUI Executable

## Review Workload Forecast

| Field                         | Value                                                              |
| ----------------------------- | ------------------------------------------------------------------ |
| Estimated changed lines       | 650–800 authored across three sequential slices, plus `bun.lock`   |
| 800-line authored budget risk | Low; every work unit fits its slice                                |
| Generated lockfile accounting | Included in snapshot identity; excluded from authored review lines |
| Chained PRs recommended       | Yes                                                                |
| Suggested split               | PR 1 → PR 2 → PR 3                                                 |
| Delivery strategy             | accepted `auto-chain` sequential PRs                               |
| Chain strategy                | stacked-to-main                                                    |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
800-line authored budget risk: Low
PR 1 is the current CLI/project-boundary slice. Each PR merges to `master` before the next branch starts; no `size:exception` or further decision is needed while a slice remains ≤800 authored lines.

### Suggested Work Units

| Unit | Goal                                                                  | Likely PR                                          | Focused test command  | Runtime harness                               | Rollback boundary                      |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------- | --------------------- | --------------------------------------------- | -------------------------------------- |
| 1    | Functional CLI/project boundary (220–280 authored; fits 800)          | PR 1; branch from `master`, then merge to `master` | `nx run app-tui:test` | compiled `--version` and piped default launch | root manifest, lockfile, app CLI/tests |
| 2    | Truthful Solid/OpenTUI shell and compile (240–300 authored; fits 800) | PR 2; start from merged `master`                   | `nx run app-tui:test` | compiled Linux x64 shell at 50x14             | TUI/build files and component tests    |
| 3    | Relocated native PTY release proof (190–220 authored; fits 800)       | PR 3; start from merged `master`                   | `nx run app-tui:e2e`  | executable-only unrelated-cwd PTY             | E2E harness, target docs, evidence     |

## Phase 1: Delivery and Functional CLI

- [x] 1.1 Create the approved issue and PR 1 branch from `master`; merge each autonomous PR to `master` before creating the next branch; record hybrid apply progress.
- [x] 1.2 RED: add `apps/gentle-observe/test/cli.test.ts` for stable `--version`, unknown-argument usage, and non-TTY terminal-required nonzero behavior without renderer import.
- [x] 1.3 Create `apps/gentle-observe/package.json`, `tsconfig.json`, `bunfig.toml`, `src/{main.ts,cli.ts,version.ts}`; retain root package/project `gentle-observe`, use internal app project `app-tui`, and add only functional catalog pins/scripts.
- [x] 1.4 GREEN: expose app `typecheck`/`test`; prove exact Bun 1.3.14 and clean `bun install --frozen-lockfile`; reject a missing or mismatched Bun with attribution.

## Phase 2: Renderer and Linux Build

- [x] 2.1 RED: add `test/app.test.tsx` using `testRender` at 50x14 for “Discovery is not connected.”, no fabricated count, and plain-`q` destroy/exit behavior.
- [x] 2.2 Implement `src/{tui.tsx,app.tsx}` with deferred renderer import, idempotent `CliRenderer.destroy()`, and no Effect Atom, demo data, or smoke flag.
- [x] 2.3 Add `build.ts` and app build target: verify exact Bun, clean `dist/apps/gentle-observe`, inject package version, set glibc, use Solid Bun plugin and `bun-linux-x64-baseline`.
- [x] 2.4 GREEN: run `nx run app-tui:typecheck`/component tests and clean compiled `gentle-observe`; fail nonzero with compilation/asset attribution.

## Phase 3: Native Release-Boundary Proof

- [ ] 3.1 RED: add `test/e2e.test.ts` for compiled binary version/non-TTY, unrelated-cwd ANSI readiness, `q` zero exit, timeout TERM→KILL cleanup, and cleanup/failure attribution.
- [ ] 3.2 GREEN: implement bounded 80x24 `Bun.spawn` PTY with isolated HOME/XDG/TMP, ANSI-only normalization, 10s deadline, bounded capture, and executable-only relocation.
- [ ] 3.3 Run `nx run app-tui:e2e`; record Bun version, target, native package, artifact, relocation cwd, readiness, exit, and timeout-cleanup results in tasks/apply evidence.

## Phase 4: Review, Closure, and Deferrals

- [ ] 4.1 Run app targets and root `check`; update `apps/gentle-observe/README.md` with Linux-x64-only support and explicitly defer releases, Homebrew, macOS, arm64, musl, checksums, and signing.
- [ ] 4.2 Complete human `tuicr`, focused evidence, sequential PR review/merge to `master`, and hybrid apply-progress updates; rollback app, root manifest/catalog/scripts, and lockfile together.
- [ ] 4.3 Create a separate planning/closure work unit for `bootstrap-workspace-toolchain`: mark Unit 3 rejected, defer generic CI Unit 4, reconcile OpenSpec/Engram with `master`, then archive; do not modify it here.
