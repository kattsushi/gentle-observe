import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noCatchBindingCast, noUnvalidatedJsonParseCast } from "./evidence-driven.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    env: {
      builtin: true,
    },
    parserOptions: {
      lang: "ts",
    },
  },
});

ruleTester.run("no-unvalidated-json-parse-cast", noUnvalidatedJsonParseCast, {
  valid: [
    {
      name: "keeps parsed input unknown for later validation",
      code: "const payload = JSON.parse(raw) as unknown",
    },
    {
      name: "passes the parsed value to an Effect Schema decoder",
      code: `
        const payload = Schema.decodeUnknownSync(Payload)(JSON.parse(raw))
      `,
    },
    {
      name: "allows the exact Effect recursive JSON domain",
      code: "const payload = JSON.parse(raw) as Schema.Json",
    },
    {
      name: "allows unknown, typeof, branded assertions, spread, and domain terms",
      code: `
        const payload: unknown = input
        const kind = typeof payload
        const userId = "user-1" as UserId
        const observationShape = { ...defaults, kind, userId }
      `,
    },
    {
      name: "allows a local parser fake with its own typed contract",
      code: `
        const JSON = { parse: (_raw: string) => ({ id: "fixture" }) }
        const fixture = JSON.parse(raw) as Fixture
      `,
    },
  ],
  invalid: [
    {
      name: "rejects a direct concrete assertion",
      code: "const payload = JSON.parse(raw) as Payload",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects angle-bracket assertions",
      code: "const payload = <Payload>JSON.parse(raw)",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects a concrete assertion after an unknown bridge",
      code: "const payload = (JSON.parse(raw) as unknown) as Payload",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects static computed parse access",
      code: 'const payload = JSON["parse"](raw) as Payload',
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects a non-null parse result",
      code: "const payload = JSON.parse(raw)! as Payload",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects optional access to built-in JSON parse",
      code: "const payload = JSON?.parse(raw) as Payload",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "rejects an optional built-in JSON parse call",
      code: "const payload = JSON.parse?.(raw) as Payload",
      errors: [{ messageId: "validate" }],
    },
    {
      name: "does not exempt another namespace Json type",
      code: "const payload = JSON.parse(raw) as Domain.Json",
      errors: [{ messageId: "validate" }],
    },
  ],
});

ruleTester.run("no-catch-binding-cast", noCatchBindingCast, {
  valid: [
    {
      name: "narrows a caught value with typeof",
      code: `
        try { run() } catch (cause) {
          if (typeof cause === "string") console.error(cause)
        }
      `,
    },
    {
      name: "decodes a caught value with Effect Schema",
      code: `
        try { run() } catch (cause) {
          const error = Schema.decodeUnknownResult(ServiceError)(cause)
        }
      `,
    },
    {
      name: "keeps a caught value unknown for propagation",
      code: `
        try { run() } catch (cause) {
          const deferred = cause as unknown
        }
      `,
    },
    {
      name: "allows casts of a shadowing fake parameter",
      code: `
        try { run() } catch (cause) {
          const fake = (cause: unknown) => cause as Error
        }
      `,
    },
  ],
  invalid: [
    {
      name: "rejects a direct Error assertion",
      code: `
        try { run() } catch (cause) {
          const error = cause as Error
        }
      `,
      errors: [{ messageId: "narrow" }],
    },
    {
      name: "rejects angle-bracket assertions",
      code: `
        try { run() } catch (cause) {
          const error = <Error>cause
        }
      `,
      errors: [{ messageId: "narrow" }],
    },
    {
      name: "rejects a concrete assertion after an unknown bridge",
      code: `
        try { run() } catch (cause) {
          const error = (cause as unknown) as Error
        }
      `,
      errors: [{ messageId: "narrow" }],
    },
    {
      name: "rejects a non-null catch binding",
      code: `
        try { run() } catch (cause) {
          const error = cause! as Error
        }
      `,
      errors: [{ messageId: "narrow" }],
    },
  ],
});
