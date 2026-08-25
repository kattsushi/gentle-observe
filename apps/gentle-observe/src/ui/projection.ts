import { Effect } from "effect";

import { type DemoScenario, makeDemoLayer } from "../demo/layers";
import { type GentleAIProcessProjection, type RuntimeAgentProjection } from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "../sources/evidence-sources";
import { unavailableLayer } from "../sources/unavailable";

export interface ShellOptions {
  readonly demo: boolean;
  readonly scenario: DemoScenario;
}

export interface ShellProjection {
  readonly demo: boolean;
  readonly processes: typeof GentleAIProcessProjection.Type;
  readonly runtime: typeof RuntimeAgentProjection.Type;
}

const readSources = Effect.fn("GentleObserveUi.readSources")(function* () {
  const runtime = yield* AgentTelemetrySource;
  const processes = yield* GentleAIProcessSource;

  return [yield* runtime.snapshot(), yield* processes.snapshot()] as const;
});

export const acquireProjection = (options: ShellOptions) =>
  readSources().pipe(
    Effect.provide(options.demo ? makeDemoLayer(options.scenario) : unavailableLayer),
    Effect.map(([runtime, processes]): ShellProjection => ({
      demo: options.demo,
      processes,
      runtime,
    })),
  );
