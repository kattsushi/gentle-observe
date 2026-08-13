---
name: evidence-driven-typescript-quality
description: "Trigger: TypeScript quality, Oxlint rule, unsafe cast, code-quality guardrail. Add narrow guardrails backed by concrete failure evidence."
license: Apache-2.0
metadata:
  author: "kattsushi"
  version: "1.0"
---

# Evidence-Driven TypeScript Quality

## Activation Contract

Use this skill when proposing TypeScript quality guidance or automated Oxlint enforcement. Start from a demonstrated unsafe behavior, not a disliked syntax form.

## Hard Rules

- State the runtime or maintenance failure the guardrail prevents.
- Preserve legitimate `unknown`, `typeof`, Effect Schema, object spread, domain terms, and test doubles.
- Prefer validation, narrowing, and explicit domain modeling over assertions at untrusted boundaries.
- Keep each rule syntax- or type-aware enough to avoid global keyword and naming bans.
- Add valid and invalid behavior tests with every rule change.
- Use exact existing dependencies; do not install a package when the local Oxlint plugin API is sufficient.

Current guardrails:

- `no-unvalidated-json-parse-cast` rejects concrete assertions around built-in `JSON.parse`, including static computed access, optional chains, non-null wrappers, and an `unknown` assertion bridge. It allows `unknown`, decoder calls, the exact recursive JSON-domain assertion `as Schema.Json`, and locally shadowed parser fakes; other `*.Json` types are not exempt.
- `no-catch-binding-cast` rejects concrete assertions of a reference that resolves to a catch binding, including an `unknown` assertion bridge. It allows narrowing, decoder calls, `unknown`, and shadowing test helpers.

## Decision Gates

| Evidence | Action |
| --- | --- |
| Concrete unsafe behavior with a stable AST boundary | Add or refine a local rule and tests |
| Convention needs contextual judgment | Document guidance only |
| Rule would ban a keyword, naming fragment, spread, mock, or assertion globally | Reject or narrow it |
| Existing Oxlint rule exactly covers the behavior | Configure the existing rule |

## Execution Steps

1. Record one failing example and the observable risk.
2. Define scope and explicit exceptions before implementation.
3. Implement the smallest visitor in `tools/quality/evidence-driven.mjs`.
4. Add valid and invalid cases in the adjacent RuleTester suite.
5. Run `bun run quality:test`, then `bun run check`.
6. Update this skill and `skills-lock.json` when policy or skill bytes change.

## Output Contract

Report the guarded behavior, exceptions, focused test result, Nx quality result, and rollback boundary. Treat runtime harness verification as N/A for static-only rules unless runtime behavior is also changed.

## References

- `tools/quality/evidence-driven.mjs` - enforced rule definitions and diagnostic scope.
- `tools/quality/evidence-driven.test.mjs` - executable valid and invalid examples.
