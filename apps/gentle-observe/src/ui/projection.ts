import { Effect } from "effect";

import { type DemoScenario, makeDemoLayer } from "../demo/layers";
import { type GentleAIProcessProjection, type RuntimeAgentProjection } from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "../sources/evidence-sources";
import { unavailableLayer } from "../sources/unavailable";
import { acquireLiveProjection, defaultLiveRuntimeOptions } from "../live/runtime";
import { makeLiveSystemDependencies } from "../live/system";

export interface ShellOptions {
  readonly change?: string;
  readonly demo: boolean;
  readonly live?: boolean;
  readonly piSession?: string;
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

const acquireStaticProjection = (options: ShellOptions) =>
  readSources().pipe(
    Effect.provide(options.demo ? makeDemoLayer(options.scenario) : unavailableLayer),
    Effect.map(([runtime, processes]): ShellProjection => ({
      demo: options.demo,
      processes,
      runtime,
    })),
  );

/** Chooses one source authority: Demo, explicitly requested Live, or unavailable by default. */
export const acquireProjection = (options: ShellOptions) => {
  if (options.demo) return acquireStaticProjection(options);
  if (options.live && options.change !== undefined) {
    return acquireLiveProjection(
      makeLiveSystemDependencies(),
      defaultLiveRuntimeOptions({ change: options.change, piSession: options.piSession }),
    );
  }
  return acquireStaticProjection(options);
};
