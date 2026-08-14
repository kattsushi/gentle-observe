# Workspace Graph

The root infrastructure project is `gentle-observe`. It owns workspace format,
lint, and quality-test targets. The application project is `app-tui` at
`apps/gentle-observe`; it currently owns cacheable `test` and `typecheck`
targets. Its public CLI remains `gentle-observe`.

## Quick path

```sh
bun install --frozen-lockfile
bun nx show project gentle-observe
bun nx show project app-tui
bun nx run app-tui:test
bun nx run app-tui:typecheck
bun run check
```

`format` is Oxfmt check-only. Use `format:write` only for an intentional
rewrite. Root `check` remains the infrastructure aggregate; future app build
and E2E targets are not present in PR 1.

## CI target selection

The `.github/workflows/ci.yml` workflow is named `CI`. It runs `format`, `lint`,
`quality-test`, `test`, and `typecheck` when a pull request targeting `master` is
opened, updated, or reopened, and again on pushes to `master`. Nx tasks are
invoked through the installed CLI with `bunx nx run-many`; they do not require a
generic action `uses:` step. The root format and lint targets scan the whole
repository, but the application has no dependency edge to the root project.
Using `nx affected` could therefore skip those global gates for an
application-only change.

Checkout fetches full history and uses a treeless partial clone, materializing
required trees on demand, so CI is ready for a future move to `nx affected`.
Add `nrwl/nx-set-shas` only when `nx affected` can safely replace `run-many`
without reducing repository-wide coverage.

Local Nx caching can only benefit tasks within this single job. Remote caching
is intentionally deferred until Nx Cloud or a self-hosted remote cache is
approved and configured. No build artifacts currently exist to upload.

Build, E2E, release, and deployment targets remain outside the current target
surface. CD and release automation belong in a separate future workflow after
the required build and release prerequisites exist.
