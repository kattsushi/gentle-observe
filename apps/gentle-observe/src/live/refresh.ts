import type { ShellProjection } from "../ui/projection";

export interface LiveRefreshClock {
  readonly now: () => number;
}

export interface LiveRefreshScheduler {
  readonly schedule: (at: number, task: () => void) => () => void;
}

export interface LiveRefreshDependencies {
  readonly acquire: (signal: AbortSignal) => Promise<ShellProjection>;
  readonly clock: LiveRefreshClock;
  readonly initialProjection: ShellProjection;
  readonly intervalMs: number;
  readonly onFailure: (cause: unknown) => void;
  readonly publish: (projection: ShellProjection) => void;
  readonly scheduler: LiveRefreshScheduler;
}

export type CancelLiveRefresh = () => void;

/** Schedules serialized refresh work after the supplied initial projection. */
export const startLiveRefresh = (dependencies: LiveRefreshDependencies): CancelLiveRefresh => {
  let cancelled = false;
  let failed = false;
  let running = false;
  let cancelScheduled: (() => void) | undefined;
  let activeController: AbortController | undefined;
  let previous = JSON.stringify(dependencies.initialProjection);

  const schedule = () => {
    const cancel = dependencies.scheduler.schedule(
      dependencies.clock.now() + dependencies.intervalMs,
      run,
    );
    if (cancelled || failed) cancel();
    else cancelScheduled = cancel;
  };

  const complete = (controller: AbortController) => {
    if (activeController !== controller) return;
    activeController = undefined;
    running = false;
    if (!cancelled && !failed) schedule();
  };

  const fail = (controller: AbortController, cause: unknown) => {
    if (!cancelled && !controller.signal.aborted) {
      failed = true;
      dependencies.onFailure(cause);
    }
    complete(controller);
  };

  const run = () => {
    if (cancelled || failed || running) return;
    cancelScheduled = undefined;
    running = true;
    const controller = new AbortController();
    activeController = controller;

    let acquisition: Promise<ShellProjection>;
    try {
      acquisition = dependencies.acquire(controller.signal);
    } catch (cause) {
      fail(controller, cause);
      return;
    }

    void acquisition.then(
      (projection) => {
        if (!cancelled) {
          const fingerprint = JSON.stringify(projection);
          if (fingerprint !== previous) {
            previous = fingerprint;
            dependencies.publish(projection);
          }
        }
        complete(controller);
      },
      (cause: unknown) => fail(controller, cause),
    );
  };

  schedule();

  return () => {
    if (cancelled) return;
    cancelled = true;
    cancelScheduled?.();
    cancelScheduled = undefined;
    activeController?.abort();
  };
};
