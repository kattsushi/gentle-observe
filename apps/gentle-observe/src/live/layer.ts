import { Effect, Layer } from "effect";

import type { GentleProcessStatus } from "./gentle-status";
import type { PiRuntimeActivity } from "./pi-session";
import { GentleAIProcessProjection, RuntimeAgentProjection } from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "../sources/evidence-sources";

type Runtime = typeof RuntimeAgentProjection.Type;
type Processes = typeof GentleAIProcessProjection.Type;

export interface LiveSourceReaders {
  readonly gentle: Effect.Effect<GentleProcessStatus, unknown>;
  readonly pi: Effect.Effect<PiRuntimeActivity, unknown>;
}

const metadata = (health: "available" | "degraded") => ({
  availability: "available" as const,
  capabilities: { tokens: { state: "missing" as const } },
  freshness: "unknown" as const,
  health,
  missingness: "partial" as const,
  provenance: { adapterVersion: "live-v1", kind: "live" as const },
});

const piProjection = (activity: PiRuntimeActivity): Runtime => ({
  ...metadata("available"),
  records: [
    {
      durationMs: 0,
      id: activity.sessionId,
      model: "unobserved",
      parentId: null,
      provider: "pi",
      repoId: activity.cwd,
      sessionId: activity.sessionId,
      status: "idle" as const,
      steps: [
        {
          id: `${activity.sessionId}:${activity.latestEntry.type}:${activity.latestEntry.timestamp}`,
          status: "completed" as const,
        },
      ],
    },
  ],
});

const gentleStepStatus = (state: string): "completed" | "idle" =>
  state === "done" ? "completed" : "idle";

const gentleProjection = (status: GentleProcessStatus): Processes => ({
  ...metadata("available"),
  records: [
    {
      activity: status.nextRecommended,
      durationMs: 0,
      id: status.change,
      parentId: null,
      repoId: status.change,
      sessionId: status.change,
      status: "waiting" as const,
      steps: status.artifacts.slice(0, 2).map((artifact, index) => ({
        id: `${artifact.name}:${index}`,
        status: gentleStepStatus(artifact.state),
      })),
      type: "sdd" as const,
    },
  ],
});

const unavailableRuntime = (): Runtime => ({ ...metadata("degraded"), records: [] });
const unavailableGentle = (): Processes => ({ ...metadata("degraded"), records: [] });

export const makeLiveLayer = (readers: LiveSourceReaders) =>
  Layer.merge(
    Layer.succeed(
      AgentTelemetrySource,
      AgentTelemetrySource.of({
        snapshot: () =>
          readers.pi.pipe(
            Effect.map(piProjection),
            Effect.catch(() => Effect.succeed(unavailableRuntime())),
          ),
      }),
    ),
    Layer.succeed(
      GentleAIProcessSource,
      GentleAIProcessSource.of({
        snapshot: () =>
          readers.gentle.pipe(
            Effect.map(gentleProjection),
            Effect.catch(() => Effect.succeed(unavailableGentle())),
          ),
      }),
    ),
  );
