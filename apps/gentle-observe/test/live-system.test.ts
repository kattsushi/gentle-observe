import { mkdir, mkdtemp, symlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import {
  LiveSystemRejected,
  type PiSessionFilesystemDependencies,
  derivePiSessionDirectory,
  makePiSessionFilesystemDependencies,
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

const dependencies = (
  overrides: Partial<PiSessionFilesystemDependencies> = {},
): PiSessionFilesystemDependencies => ({
  canonicalize: (path) => Effect.succeed(path),
  listDirectory: () => Effect.succeed([]),
  readText: () => Effect.succeed("persisted metadata"),
  stat: () => Effect.succeed(undefined),
  ...overrides,
});

const sessionFixture = async () => {
  const sessionRoot = await mkdtemp(join(tmpdir(), "gentle-observe-live-system-"));
  const lookup = { repository: "/workspace/repository", sessionRoot };
  const sessionDirectory = await Effect.runPromise(derivePiSessionDirectory(lookup));
  await mkdir(sessionDirectory);
  return { lookup, sessionDirectory };
};

const writeSession = async (directory: string, name: string, mtime: string) => {
  const path = join(directory, name);
  await writeFile(path, "persisted metadata");
  await utimes(path, new Date(mtime), new Date(mtime));
  return path;
};

const createFifo = (path: string) => {
  const result = Bun.spawnSync({ cmd: ["mkfifo", path], stderr: "pipe", stdout: "pipe" });
  if (result.exitCode !== 0) throw new Error(`mkfifo failed: ${result.stderr.toString()}`);
};

describe("live system boundary", () => {
  test("derives Pi's documented cwd-encoded session directory from an explicit root", async () => {
    expect(
      await execute(
        derivePiSessionDirectory({
          repository: "/workspace/repository",
          sessionRoot: "/pi/agent/sessions",
        }),
      ),
    ).toEqual({ result: "success", value: piSessionDirectory });
  });

  test("selects the newest persisted JSONL deterministically by mtime then name, never as active", async () => {
    const stats: string[] = [];
    const outcome = await execute(
      selectPiSession(
        dependencies({
          listDirectory: () =>
            Effect.succeed(["older.jsonl", "tie-a.jsonl", "tie-b.jsonl", "ignored.txt"]),
          stat: (path) => {
            stats.push(path);
            const mtime = path.endsWith("older.jsonl")
              ? new Date("2026-03-20T10:00:00.000Z")
              : new Date("2026-03-21T10:00:00.000Z");
            return Effect.succeed({ isRegular: true, mtime });
          },
        }),
        { repository: "/workspace/repository", sessionRoot: "/pi/agent/sessions" },
      ),
    );

    expect(outcome).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: `${piSessionDirectory}/tie-b.jsonl` },
    });
    expect(stats).toHaveLength(3);
  });

  test("rejects escaping, non-JSONL, and repository-mismatched explicit selections before filesystem access", async () => {
    const accesses: string[] = [];
    const denied = dependencies({
      canonicalize: () => {
        accesses.push("canonicalize");
        return Effect.fail(new LiveSystemRejected({ reason: "unexpected access" }));
      },
    });
    for (const sessionFile of [
      `${piSessionDirectory}/../escape.jsonl`,
      `${piSessionDirectory}/not-a-session.txt`,
      "/pi/agent/sessions/--workspace-other--/latest.jsonl",
    ]) {
      expect(
        await execute(
          selectPiSession(denied, {
            repository: "/workspace/repository",
            sessionFile,
            sessionRoot: "/pi/agent/sessions",
          }),
        ),
      ).toEqual({
        error: new LiveSystemRejected({ reason: "Pi session selection is invalid" }),
        result: "failure",
      });
    }
    expect(accesses).toEqual([]);
  });

  test("rejects final symlinks and non-regular Pi session candidates without reading them", async () => {
    const { lookup, sessionDirectory } = await sessionFixture();
    const system = makePiSessionFilesystemDependencies();
    const regular = await writeSession(sessionDirectory, "regular.jsonl", "2026-03-20T10:00:00Z");
    const outside = await writeSession(lookup.sessionRoot, "outside.jsonl", "2026-03-22T10:00:00Z");
    const link = join(sessionDirectory, "link.jsonl");
    const directory = join(sessionDirectory, "directory.jsonl");
    const fifo = join(sessionDirectory, "fifo.jsonl");
    await symlink(outside, link);
    await mkdir(directory);
    createFifo(fifo);

    const selected = await execute(selectPiSession(system, lookup));
    expect(selected).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: regular },
    });

    expect(await execute(selectPiSession(system, { ...lookup, sessionFile: regular }))).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: regular },
    });
    for (const sessionFile of [link, directory, fifo]) {
      expect(await execute(selectPiSession(system, { ...lookup, sessionFile }))).toEqual({
        error: new LiveSystemRejected({ reason: "Pi session file is not a regular file" }),
        result: "failure",
      });
    }
    const unsafeReads = await Promise.all(
      [link, directory, fifo].map((path) => execute(system.readText(path, 128))),
    );
    expect(unsafeReads.every((outcome) => outcome.result === "failure")).toBe(true);
    expect(await execute(system.readText(regular, 18))).toEqual({
      result: "success",
      value: "persisted metadata",
    });
    expect((await execute(system.readText(regular, 17))).result).toBe("failure");
    for (const missing of [
      { ...lookup, sessionFile: join(sessionDirectory, "missing.jsonl") },
      { ...lookup, sessionRoot: join(lookup.sessionRoot, "missing") },
    ]) {
      expect(await execute(selectPiSession(system, missing))).toEqual({
        error: new LiveSystemRejected({ reason: "No persisted Pi sessions found" }),
        result: "failure",
      });
    }
  });

  test("bounds directory inspection before candidate stats and leaves payload reads to consumers", async () => {
    const inspect = async (count: number) => {
      const stats: string[] = [];
      let reads = 0;
      const outcome = await execute(
        selectPiSession(
          dependencies({
            listDirectory: () =>
              Effect.succeed(Array.from({ length: count }, (_, index) => `session-${index}.jsonl`)),
            readText: () => {
              reads += 1;
              return Effect.succeed("payload");
            },
            stat: (path) => {
              stats.push(path);
              return Effect.succeed({
                isRegular: true,
                mtime: new Date("2026-03-21T10:00:00.000Z"),
              });
            },
          }),
          { repository: "/workspace/repository", sessionRoot: "/pi/agent/sessions" },
        ),
      );
      return { outcome, reads, stats };
    };
    const accepted = await inspect(256);
    expect(accepted.outcome).toEqual({
      result: "success",
      value: {
        selection: "latest-persisted",
        sessionFile: `${piSessionDirectory}/session-99.jsonl`,
      },
    });
    expect(accepted.stats).toHaveLength(256);
    expect(accepted.reads).toBe(0);
    const rejected = await inspect(257);
    expect(rejected.outcome).toEqual({
      error: new LiveSystemRejected({ reason: "Pi session directory exceeds 256 entries" }),
      result: "failure",
    });
    expect(rejected.stats).toEqual([]);
    expect(rejected.reads).toBe(0);
  });
});
