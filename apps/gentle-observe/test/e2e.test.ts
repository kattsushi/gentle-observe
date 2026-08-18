import { describe, expect, test } from "bun:test";

import {
  PtyE2eError,
  runCompiledNavigationProof,
  runExecutableProof,
  runTimeoutCleanupProof,
} from "./support/executable-pty";

const artifactPath = `${import.meta.dir}/../../../dist/apps/gentle-observe/gentle-observe`;

describe("compiled gentle-observe executable", () => {
  test("proves version, non-TTY rejection, unrelated-cwd ANSI readiness, and q exit", async () => {
    const result = await runExecutableProof({ artifactPath });

    expect(result.version.output).toBe("gentle-observe 0.1.0\n");
    expect(result.nonTty.exitCode).toBe(1);
    expect(result.nonTty.output).toContain("requires an interactive terminal");
    expect(result.pty.cwd).not.toBe(import.meta.dir);
    expect(result.pty.output).toContain("Runtime: unavailable | source unavailable");
    expect(result.pty.output).toContain("Processes: unavailable | source unavailable");
    expect(result.pty.output).toContain("q quit");
    expect(result.pty.output).not.toContain(String.fromCodePoint(27));
    expect(result.pty.exitCode).toBe(0);
    expect(result.pty.cleanup.terminalClosed).toBe(true);
    expect(result.demoPty.output).toContain("DEMO DATA");
    expect(result.demoPty.output).toContain("Runtime: available | demo");
    expect(result.demoPty.output).toContain("Processes: available | demo");
    expect(result.demoPty.exitCode).toBe(0);
    expect(result.demoPty.cleanup.terminalClosed).toBe(true);
  });

  test("proves the compact Complex navigation journey and natural q cleanup", async () => {
    const result = await runCompiledNavigationProof({ artifactPath });

    expect(result.output).toContain("DEMO DATA");
    expect(result.output).toContain("Processes [active]");
    expect(result.steps).toEqual([
      "processes-active",
      "process-check-selected",
      "generic-detail",
      "generic-back",
      "process-build-selected",
      "sdd-detail",
      "timeline",
      "timeline-back",
      "overview-back",
    ]);
    expect(result.semanticEvidence).toEqual([
      "Processes [active] | process-build | reported",
      "Timeline | Processes | process-build | timestamps unavailable | normalized contract",
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.cleanup).toEqual({
      killSent: false,
      noLeaks: true,
      terminalClosed: true,
      termSent: false,
    });
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
