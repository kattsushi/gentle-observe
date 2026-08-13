# Apply Progress: Bootstrap Workspace Toolchain

## Authority and delivery

- **State:** repository-local review-tool integrations removed.
- **Proceed token:** retained by parent as
  `sha256:acd9048175b6c44df5e61b3a08235ec81504cde4de97ca685e73cab3a0803e7b`.
- **Work unit:** `remove-repository-crit-integrations`.
- **Delivery:** one writer, no commit or push; maximum 2,400 changed lines.
- **Mode:** Standard. Strict TDD remains deferred because no durable,
  non-vacuous test-bearing project exists.

## Cumulative state

- [x] Unit 1 root graph baseline: exact catalogs, lockfile, and root Nx
      discovery are preserved.
- [x] Unit 2 Nx-first quality loop: direct root Oxfmt/Oxlint targets,
      versioned `.atl/` outside Oxfmt, and no vacuous zero-input targets.
- [x] Unit 2.5 repository-local review-tool integration removal: all local
      skills, commands, rules, plugins, and registrations are removed; the
      versioned skill registry is regenerated without integration rows.
- [ ] Unit 3 narrow host bootstrap.
- [ ] Unit 4 official Nx CI selection and future project-target reassessment.

## Review history

The first human review replaced the rejected Biome/custom-report candidate with
direct root Nx ownership. The second human review found that the remaining
`tsconfig.quality.json` (`files: []`), TypeScript command, and Effect diagnostics
command had no durable input and could only provide vacuous passes. This
correction deletes the empty configuration and removes root `typecheck` and
`diagnostics` scripts/targets. TypeScript 7, Effect, and `@effect/tsgo` remain
exactly pinned for future project-owned targets; they are not current runtime
validation.

`.atl/` remains versioned project state. Oxfmt retains `.oxfmtignore` with only
`.atl/`, so the registry is not rewritten while all other compatible tracked
files are formatter scope. The registry was regenerated after removing every
project-local skill copy for the removed integration: it now indexes 19
user-level skills, has no removed-integration rows, and has cache fingerprint
`a7cc6c1cdbb2f3145962395fd13834bc389efc48`.

The repository no longer contains the integration's agent marketplace entries,
skills, commands, rules, Gemini hooks, OpenCode plugin registration, or plugin
package. `opencode.jsonc` was solely that plugin registration and was removed.
Generic product/review terminology, RDD/Judgment Day concepts, review budgets,
and unrelated critical/criteria language remain outside this removal boundary.

## Work Unit Evidence

| Evidence            | Exact result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused command     | `bun install --frozen-lockfile` under host Bun 1.3.11 exited 0 (`Checked 150 installs across 228 packages (no changes)`) with unchanged `bun.lock` SHA-256 `5694f00344a495bda3c62a5bbde041c043626ca3911d9a9e76bf8c13ed9ec666`. `.atl/skill-registry.md` and `.atl/.skill-registry.cache.json` are not ignored; `.oxfmtignore` is exactly `.atl/`; `bun nx show projects --json` returned `["gentle-observe"]`; target discovery reported only `format`, `format-write`, and `lint` plus script metadata. |
| Formatting safety   | `bun x --no-install oxfmt . --ignore-path .oxfmtignore` performed the single required source-mutating normalization on 49 files. Two later `bun x --no-install oxfmt --check . --ignore-path .oxfmtignore` runs passed and preserved the same candidate SHA-256 `aeee8e6335e43cbb4aa52191a072b1c31f2d9da74a8d818fb3c2dfbefcc1db2c`.                                                                                                                                                                      |
| Runtime harness     | `bun run format` and `bun run lint` exited 0 independently. Two consecutive `bun run check` executions exited 0 with native Nx `run-many`; each reported `2/2 hit (100%)` cache reuse for format and lint. `bun run affected:check --base=HEAD --head=HEAD` exited 0 with `NX No tasks were run`.                                                                                                                                                                                                        |
| Failure attribution | A bounded temporary replacement of only the `lint` command with `sh -c "exit 23"` made `bun run check` exit 1 and report `- gentle-observe:lint`; the exact `package.json` SHA-256 `61b0d5f16e01d06e1ca8b703e78a330801e0771dd8e4601af74c945a095106d8` was restored, then lint and aggregate checks passed.                                                                                                                                                                                               |
| Rollback boundary   | Revert `.gitignore`, `.oxfmtignore`, `package.json`, the deletion of `tsconfig.quality.json`, `.oxlintrc.json`, documentation, and reconciled SDD artifacts together. This removes only the current root quality boundary.                                                                                                                                                                                                                                                                               |

## Work Unit Evidence: repository-local integration removal

| Evidence          | Exact result                                                                                                                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused command   | The exact removed-integration path scan over `git ls-files -co --exclude-standard` returned zero matches after the deleted paths were staged; tracked candidate reference scanning also returned zero matches.                                                       |
| Runtime harness   | N/A: deleted configuration assets have no runtime boundary. The remaining root quality commands are run separately; OpenCode startup configuration has no project file because it was exclusively the removed plugin registration.                                   |
| Rollback boundary | Restore only the deleted local agent assets, the removed plugin package, `opencode.jsonc`, `.aider.conf.yml`, `.atl/skill-registry.md`, `.atl/.skill-registry.cache.json`, and this current-state evidence. Generic product review content is outside this boundary. |

No CI YAML, Nx Cloud configuration, product code, `.repos`, branch/remote, PRD,
research, wireframe, commit, or push changes are part of this correction.
