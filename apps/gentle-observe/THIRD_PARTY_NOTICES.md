# Third-party notices

## Termcn OpenTUI registry sources

The following files were copied from the official [Termcn](https://github.com/shadcn-labs/termcn)
registry at pinned upstream commit `628dd0bf88ba191907661a0fe80491be08302781`:

- Registry URLs:
  - https://termcn.dev/r/opentui/stack.json
  - https://termcn.dev/r/opentui/columns.json
  - https://termcn.dev/r/opentui/key-value.json
  - https://termcn.dev/r/opentui/types.json
  - https://termcn.dev/r/opentui/use-theme.json
  - https://termcn.dev/r/opentui/theme-default.json
- Copied paths:
  - `src/components/ui/stack.tsx`
  - `src/components/ui/columns.tsx`
  - `src/components/ui/key-value.tsx`
  - `src/components/ui/types.ts`
  - `src/hooks/use-theme.ts`
  - `src/lib/terminal-themes/default.ts`

Resolution was verified without applying registry writes using shims-first mise Bun 1.3.14 and
`bunx --bun shadcn@4.3.0 add --cwd apps/gentle-observe --yes --dry-run @termcn/opentui/stack @termcn/opentui/columns @termcn/opentui/key-value`.
The dry-run resolved six files and the existing `@opentui/react` dependency, then left the worktree
unchanged. No Termcn, shadcn, or Ink dependency was added.

### Local compatibility corrections

- **Repository Oxfmt normalization:** after exact registry extraction, repository Oxfmt normalization
  is applied to all copied source. This is a local formatting normalization only; it does not change
  copied-source semantics or introduce other source drift.
- **Stack compatibility correction:** the official `number | string` width and height declarations
  and unsafe `as number` casts are replaced with `BoxProps["width"]` and `BoxProps["height"]`
  imported from `@opentui/react`; both values are passed directly to `<box>`.
- **Columns:** no correction was made. The official React import remains because
  `React.Children.toArray(children)` uses it under this JSX runtime.

### Upstream MIT license

MIT License

Copyright (c) 2026 Aniket Pawar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
