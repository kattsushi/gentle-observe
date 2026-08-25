import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { readPiSession } from "../src/live/pi-session";

const execute = async <A, E>(program: Effect.Effect<A, E>) => {
  try {
    return { result: "success" as const, value: await Effect.runPromise(program) };
  } catch (error) {
    return { error, result: "failure" as const };
  }
};

const sessionHeader = {
  cwd: "/workspace/repository",
  id: "session-123",
  timestamp: "2026-03-21T10:00:00.000Z",
  type: "session",
  version: 3,
};

const piRequest = {
  maximumBytes: 4_096,
  repository: "/workspace/repository",
  sessionFile: "/pi/sessions/session-123.jsonl",
} as const;

const piSession = (header = sessionHeader) =>
  [
    JSON.stringify(header),
    JSON.stringify({
      id: "entry-1",
      modelId: "private-model-id",
      provider: "private-provider",
      timestamp: "2026-03-21T10:00:15.000Z",
      type: "model_change",
    }),
    JSON.stringify({
      id: "entry-2",
      settings: { apiKey: "private-api-key", reasoning: "private reasoning" },
      thinkingLevel: "private-thinking-level",
      timestamp: "2026-03-21T10:00:30.000Z",
      type: "thinking_level_change",
    }),
    '{"type":"message",',
  ].join("\n");

describe("Pi persisted session metadata", () => {
  test("projects only documented Pi v3 model and thinking metadata from complete lines", async () => {
    const reads: Array<readonly [string, number]> = [];
    const outcome = await execute(
      readPiSession(
        {
          readText: (path, maximumBytes) => {
            reads.push([path, maximumBytes]);
            return Effect.succeed(piSession());
          },
        },
        piRequest,
      ),
    );

    expect(outcome).toEqual({
      result: "success",
      value: {
        cwd: "/workspace/repository",
        latestEntry: {
          timestamp: "2026-03-21T10:00:30.000Z",
          type: "thinking_level_change",
        },
        sessionId: "session-123",
      },
    });
    expect(reads).toEqual([[piRequest.sessionFile, piRequest.maximumBytes]]);
    expect(JSON.stringify(outcome)).not.toContain("private-model-id");
    expect(JSON.stringify(outcome)).not.toContain("private-api-key");
    expect(JSON.stringify(outcome)).not.toContain("private reasoning");
  });

  test("rejects invalid Pi v3 headers and mismatched repository cwd exactly", async () => {
    const invalidHeader = piSession({ ...sessionHeader, version: 2 });
    const mismatchedCwd = piSession({ ...sessionHeader, cwd: "/other/repository" });

    for (const [text, reason] of [
      [invalidHeader, "Pi session header is invalid"],
      [mismatchedCwd, "Pi session cwd does not match repository"],
    ] as const) {
      const outcome = await execute(
        readPiSession({ readText: () => Effect.succeed(text) }, piRequest),
      );

      expect(outcome).toEqual({
        error: { _tag: "LiveSourceRejected", reason },
        result: "failure",
      });
    }
  });

  test("rejects a Pi session whose UTF-8 byte length exceeds the exact request bound", async () => {
    const outcome = await execute(
      readPiSession(
        { readText: () => Effect.succeed(piSession()) },
        { ...piRequest, maximumBytes: 1 },
      ),
    );

    expect(outcome).toEqual({
      error: { _tag: "LiveSourceRejected", reason: "Pi session exceeds maximum bytes" },
      result: "failure",
    });
  });
});
