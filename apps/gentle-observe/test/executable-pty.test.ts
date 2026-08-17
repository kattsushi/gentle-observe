import { describe, expect, test } from "bun:test";

import {
  appendCapture,
  normalizeAnsi,
  PtyE2eError,
  runEarlyExitProof,
  runExecutableProof,
} from "./support/executable-pty";

const encoder = new TextEncoder();
const escape = String.fromCodePoint(27);

describe("executable PTY support", () => {
  test("removes Kitty APC sequences without leaving escape bytes", () => {
    const output = `before${escape}_kitty-payload${escape}\\after`;

    expect(normalizeAnsi(output)).toBe("beforeafter");
    expect(normalizeAnsi(output)).not.toContain(escape);
  });

  test("retains at most the final 64 KiB of raw multibyte output", () => {
    const capture = appendCapture(new Uint8Array(), encoder.encode("🙂".repeat(20_000)));

    expect(capture.byteLength).toBe(64 * 1024);
    expect(new TextDecoder().decode(capture).length).toBeLessThan(20_000 * 2);
  });

  test("attributes a missing executable as an asset failure", async () => {
    const error = await runExecutableProof({ artifactPath: "/missing/gentle-observe" }).catch(
      (cause: unknown) => cause,
    );

    expect(error).toBeInstanceOf(PtyE2eError);
    expect(error).toMatchObject({ stage: "asset" });
  });

  test("attributes child exit before readiness as an exit-code failure", async () => {
    const error = await runEarlyExitProof().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(PtyE2eError);
    expect(error).toMatchObject({ stage: "exit-code" });
  });
});
