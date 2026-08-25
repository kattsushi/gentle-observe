import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { Effect } from "effect";

import type { EvidenceRejected } from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "../sources/evidence-sources";
import type { ShellProjection } from "../ui/projection";
import { readGentleStatus, GentleStatusRejected } from "./gentle-status";
import { makeLiveLayer } from "./layer";
import { readPiSession, LiveSourceRejected } from "./pi-session";
import { selectPiSession, type LiveSystemDependencies } from "./system";

const maximumPiSessionBytes = 1_048_576;
const livePlaneDeadlineMs = 5_000;
const maximumGentleStdoutBytes = 1_048_576;

export interface LiveRuntimeOptions {
  readonly change: string;
  readonly changeRoot: string;
  readonly piSession?: string;
  readonly repository: string;
  readonly sessionRoot: string;
}

export interface LiveRuntimeDefaults {
  readonly change: string;
  readonly piSession?: string;
}

/** Pi stores coding-agent sessions below this documented directory, overridable by PI_CODING_AGENT_DIR. */
export const defaultLiveRuntimeOptions = ({
  change,
  piSession,
}: LiveRuntimeDefaults): LiveRuntimeOptions => {
  const repository = process.cwd();
  const codingAgentDirectory = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");

  return {
    change,
    changeRoot: resolve(repository, "openspec", "changes", change),
    piSession,
    repository,
    sessionRoot: join(codingAgentDirectory, "sessions"),
  };
};

/** Acquires one normalized projection from persisted Pi and Gentle/OpenSpec metadata only. */
export const acquireLiveProjection = (
  dependencies: LiveSystemDependencies,
  options: LiveRuntimeOptions,
): Effect.Effect<ShellProjection, EvidenceRejected> => {
  const readPi = Effect.fn("GentleObserveLive.readPi")(function* () {
    const selection = yield* selectPiSession(dependencies, {
      repository: options.repository,
      sessionFile: options.piSession,
      sessionRoot: options.sessionRoot,
    }).pipe(Effect.mapError((error) => new LiveSourceRejected({ reason: error.reason })));

    return yield* readPiSession(
      {
        readText: (path, requestedMaximumBytes) =>
          dependencies
            .readText(path, Math.min(maximumPiSessionBytes, requestedMaximumBytes))
            .pipe(Effect.mapError((error) => new LiveSourceRejected({ reason: error.reason }))),
      },
      {
        maximumBytes: maximumPiSessionBytes,
        repository: options.repository,
        sessionFile: selection.sessionFile,
      },
    );
  });

  const readGentle = Effect.fn("GentleObserveLive.readGentle")(function* () {
    return yield* readGentleStatus(
      {
        now: () => new Date(),
        run: (file, arguments_) =>
          dependencies
            .run(file, arguments_, {
              deadlineMs: livePlaneDeadlineMs,
              maximumStdoutBytes: maximumGentleStdoutBytes,
            })
            .pipe(Effect.mapError((error) => new GentleStatusRejected({ reason: error.reason }))),
        stat: (path) =>
          dependencies
            .stat(path)
            .pipe(Effect.mapError((error) => new GentleStatusRejected({ reason: error.reason }))),
      },
      {
        change: options.change,
        changeRoot: options.changeRoot,
        repository: options.repository,
        store: "openspec",
      },
    );
  });

  return Effect.gen(function* () {
    const runtime = yield* AgentTelemetrySource;
    const processes = yield* GentleAIProcessSource;
    const planes = yield* Effect.all(
      { processes: processes.snapshot(), runtime: runtime.snapshot() },
      { concurrency: "unbounded" },
    );

    return {
      demo: false,
      processes: planes.processes,
      runtime: planes.runtime,
    };
  }).pipe(
    Effect.provide(
      makeLiveLayer({
        gentle: readGentle().pipe(Effect.timeout(livePlaneDeadlineMs)),
        pi: readPi().pipe(Effect.timeout(livePlaneDeadlineMs)),
      }),
    ),
  );
};
