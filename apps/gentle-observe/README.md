# gentle-observe executable

`gentle-observe` is currently validated only as a native Linux x64 glibc-baseline executable built with Bun 1.3.14. It is an early, local executable boundary rather than a released distribution.

## Build and verify

From the workspace root:

```sh
mise exec bun@1.3.14 -- bunx nx run app-tui:build --skipNxCache
mise exec bun@1.3.14 -- bunx nx run app-tui:e2e --skipNxCache
```

The executable is written to `dist/apps/gentle-observe/gentle-observe`. The E2E target runs that compiled artifact from an unrelated temporary directory in a Linux x64 PTY.

## Support boundary

| Area                      | Status                            |
| ------------------------- | --------------------------------- |
| Linux x64 glibc baseline  | Validated locally with Bun 1.3.14 |
| Releases and distribution | Deferred                          |
| Homebrew                  | Deferred                          |
| macOS, arm64, and musl    | Deferred                          |
| Checksums and signing     | Deferred                          |

No release archive or platform support beyond Linux x64 glibc baseline is claimed.
