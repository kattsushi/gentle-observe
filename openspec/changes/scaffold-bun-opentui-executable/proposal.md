# Proposal: Scaffold Bun OpenTUI Executable

## Intent

Establish an honest Linux x64 baseline `gentle-observe` executable using TypeScript, Bun, SolidJS, OpenTUI, and Effect 4 without fabricating discovery or release support.

## Scope

### In Scope

- Create the internal `app-tui` Nx project at `apps/gentle-observe` with exact dependencies and quality targets; its public CLI remains `gentle-observe`.
- Compile a Bun standalone `bun-linux-x64-baseline` executable named `gentle-observe`.
- Provide stable `--version`; reject non-interactive default launch with an actionable error.
- In a PTY, render a deterministic shell stating discovery is not connected and exit on `q`.
- Validate only the compiled executable through bounded real-PTY E2E.

### Out of Scope

- Discovery, persistence, demo data, or a false “zero sessions” state.
- Public/test-only `--smoke`, Effect Atom Solid before a real state/effect boundary, Termcn, or Vite.
- macOS, arm64, musl, and any platform claim lacking execution on a native runner.
- Release archives, checksums, signing, notarization, SBOM, provenance, GitHub Releases, and Homebrew.

## Capabilities

### New Capabilities

- `executable-shell`: CLI lifecycle, Linux x64 compilation, truthful TUI, TTY enforcement, version output, and PTY quit behavior.

### Modified Capabilities

None.

## Approach

Use basic `@opentui/solid` primitives and its Bun plugin. Keep Effect 4 without an unused Effect Atom layer. Only native execution establishes support.

## Affected Areas

| Area                    | Impact   | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `apps/gentle-observe/`  | New      | App, Nx targets, shell, build, PTY tests |
| Root manifests/lockfile | Modified | Dependencies and workspace identity      |

## Dependencies

- Delivered Units 1–2 of `bootstrap-workspace-toolchain`.
- Bun 1.3.14 and Linux x64 glibc PTY environment.

## Risks

| Risk                                     | Likelihood | Mitigation                                                                               |
| ---------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| OpenTUI native assets fail after compile | Med        | Execute compiled binary in native PTY                                                    |
| Slice exceeds 800 authored lines         | Low        | Accepted automatic chaining keeps each autonomous slice within the session review budget |
| Local Bun differs from pin               | High       | Reject evidence not produced with Bun 1.3.14                                             |

## Delivery Forecast

Delivery uses the accepted `auto-chain` strategy: three sequential `stacked-to-main` PRs, each with an 800-authored-line review budget. PR 1 is the current CLI/project-boundary slice; PR 2 adds the truthful renderer and Linux build; PR 3 adds native PTY release-boundary proof. No delivery decision is pending. Each PR merges to `master` before the next begins; direct `master` delivery remains prohibited.

## Old Change Relationship

This change depends on delivered Units 1–2, supersedes rejected/unmerged Unit 3, and moves app-owned build/test/E2E portions of Unit 4 here; generic CI selection remains deferred. After approval, reconcile `bootstrap-workspace-toolchain`: mark Unit 3 rejected, narrow Unit 4 to future CI selection, sync OpenSpec/Engram to `master`, then archive separately.

## Rollback Plan

Revert the app and its root manifest/lockfile entries together; Units 1–2 remain intact.

## Success Criteria

- [ ] Pinned Bun compiles `gentle-observe` for Linux x64 baseline.
- [ ] `--version` exits zero with stable output; non-TTY default launch fails actionably.
- [ ] Real PTY E2E observes the truthful shell, sends `q`, and receives exit code zero.
