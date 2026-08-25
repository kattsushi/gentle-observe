import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import {
  LiveSystemRejected,
  type LiveSystemDependencies,
  derivePiSessionDirectory,
  selectPiSession,
} from "../src/live/system";

const execute = async <A, E>(program: Effect.Effect<A, E>) => {
  try {
    return { result: "success" as const, value: await Effect.runPromise(program) };
  } catch (error) {
    return { error, result: "failure" as const };
  }
};

const piSessionDirectory = "/pi/agent/sessions/--workspace-repository--";

const dependencies = (overrides: Partial<LiveSystemDependencies> = {}): LiveSystemDependencies => ({
  listDirectory: () => Effect.succeed([]),
  readText: () => Effect.succeed("persisted metadata"),
  run: () => Effect.succeed({ stdout: "status metadata" }),
  stat: () => Effect.succeed(undefined),
  ...overrides,
});

describe("live system boundary", () => {
  test("derives Pi's documented cwd-encoded session directory from an explicit root", async () => {
    const outcome = await execute(
      derivePiSessionDirectory({
        repository: "/workspace/repository",
        sessionRoot: "/pi/agent/sessions",
      }),
    );

    expect(outcome).toEqual({ result: "success", value: piSessionDirectory });
  });

  test("selects the newest persisted JSONL deterministically by mtime then name, never as active", async () => {
    const stats: string[] = [];
    const outcome = await execute(
      selectPiSession(
        dependencies({
          listDirectory: (path) => {
            expect(path).toBe(piSessionDirectory);
            return Effect.succeed(["older.jsonl", "tie-a.jsonl", "tie-b.jsonl", "ignored.txt"]);
          },
          stat: (path) => {
            stats.push(path);
            const mtime = path.endsWith("older.jsonl")
              ? new Date("2026-03-20T10:00:00.000Z")
              : new Date("2026-03-21T10:00:00.000Z");
            return Effect.succeed({ mtime });
          },
        }),
        { repository: "/workspace/repository", sessionRoot: "/pi/agent/sessions" },
      ),
    );

    expect(outcome).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: `${piSessionDirectory}/tie-b.jsonl` },
    });
    expect(stats).toEqual([
      `${piSessionDirectory}/older.jsonl`,
      `${piSessionDirectory}/tie-a.jsonl`,
      `${piSessionDirectory}/tie-b.jsonl`,
    ]);
  });

  test("rejects escaping, non-JSONL, and repository-mismatched explicit selections before filesystem access", async () => {
    const accesses: string[] = [];
    const invalidLookups = [
      {
        repository: "/workspace/repository",
        sessionFile: `${piSessionDirectory}/../escape.jsonl`,
        sessionRoot: "/pi/agent/sessions",
      },
      {
        repository: "/workspace/repository",
        sessionFile: `${piSessionDirectory}/not-a-session.txt`,
        sessionRoot: "/pi/agent/sessions",
      },
      {
        repository: "/workspace/repository",
        sessionFile: "/pi/agent/sessions/--workspace-other--/latest.jsonl",
        sessionRoot: "/pi/agent/sessions",
      },
    ] as const;

    for (const lookup of invalidLookups) {
      const outcome = await execute(
        selectPiSession(
          dependencies({
            listDirectory: (path) => {
              accesses.push(`list:${path}`);
              return Effect.succeed([]);
            },
            readText: (path) => {
              accesses.push(`read:${path}`);
              return Effect.succeed("persisted metadata");
            },
            stat: (path) => {
              accesses.push(`stat:${path}`);
              return Effect.succeed(undefined);
            },
          }),
          lookup,
        ),
      );

      expect(outcome).toEqual({
        error: new LiveSystemRejected({ reason: "Pi session selection is invalid" }),
        result: "failure",
      });
    }
    expect(accesses).toEqual([]);
  });
});
