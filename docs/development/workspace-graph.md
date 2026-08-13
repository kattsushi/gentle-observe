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
