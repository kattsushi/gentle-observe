import { describe, expect, test } from "bun:test";

import { PtyE2eError, runExecutableProof, runTimeoutCleanupProof } from "./support/executable-pty";

const artifactPath = `${import.meta.dir}/../../../dist/apps/gentle-observe/gentle-observe`;

describe("compiled gentle-observe executable", () => {
  test("proves version, non-TTY rejection, unrelated-cwd ANSI readiness, and q exit", async () => {
    const result = await runExecutableProof({ artifactPath });

    expect(result.version.output).toBe("gentle-observe 0.1.0\n");
    expect(result.nonTty.exitCode).toBe(1);
    expect(result.nonTty.output).toContain("requires an interactive terminal");
    expect(result.pty.cwd).not.toBe(import.meta.dir);
    expect(result.pty.output).toContain("Discovery is not connected.");
    expect(result.pty.output).toContain("q quit");
    expect(result.pty.output).not.toContain(String.fromCodePoint(27));
    expect(result.pty.exitCode).toBe(0);
    expect(result.pty.cleanup.terminalClosed).toBe(true);
  });

  test("attributes missing executable assets before launching a PTY", async () => {
    const error = await runExecutableProof({ artifactPath: "/missing/gentle-observe" }).catch(
      (cause: unknown) => cause,
    );

    expect(error).toBeInstanceOf(PtyE2eError);
    expect(error).toMatchObject({ stage: "asset" });
  });

  test("sends TERM then KILL on timeout and leaves no child", async () => {
    const error = await runTimeoutCleanupProof().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(PtyE2eError);
    expect(error).toMatchObject({
      stage: "readiness",
      cleanup: {
        killSent: true,
        noLeaks: true,
        terminalClosed: true,
        termSent: true,
      },
    });
  });
});
