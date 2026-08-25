import { RegistryContext } from "@effect/atom-react";
import { CliRenderEvents, createCliRenderer, type CliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Effect } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import type { ReactNode } from "react";

import { App } from "./app";
import { startLiveRefresh } from "./live/refresh";
import { acquireProjection, type ShellOptions, type ShellProjection } from "./ui/projection";

export interface OwnedRenderer {
  readonly isDestroyed: boolean;
  destroy(): void;
  once(event: CliRenderEvents.DESTROY, listener: () => void): unknown;
}

export interface UiRoot {
  render(node: ReactNode): void;
  unmount(): void;
}

export interface RendererLifecycle {
  readonly afterUnmount?: () => void;
  readonly beforeUnmount?: () => void;
}

export const createRendererOwner = <R extends OwnedRenderer>(
  renderer: R,
  makeRoot: (renderer: R) => UiRoot,
  lifecycle: RendererLifecycle = {},
) => {
  let root: UiRoot | undefined;
  let unmounted = false;
  const isShutdown = () => unmounted || renderer.isDestroyed;
  const unmount = () => {
    if (unmounted) return;
    unmounted = true;
    lifecycle.beforeUnmount?.();
    try {
      root?.unmount();
    } finally {
      lifecycle.afterUnmount?.();
    }
  };
  renderer.once(CliRenderEvents.DESTROY, unmount);

  const shutdown = () => {
    let unmountFailed = false;
    let unmountCause: unknown;
    try {
      unmount();
    } catch (cause) {
      unmountFailed = true;
      unmountCause = cause;
    }
    try {
      if (!renderer.isDestroyed) renderer.destroy();
    } catch (destroyCause) {
      if (unmountFailed) {
        throw new AggregateError([unmountCause, destroyCause], "Renderer shutdown failed");
      }
      throw destroyCause;
    }
    if (unmountFailed) throw unmountCause;
  };

  return {
    isShutdown,
    render(node: ReactNode) {
      if (isShutdown()) return;
      try {
        const nextRoot = makeRoot(renderer);
        root = nextRoot;
        if (isShutdown()) {
          nextRoot.unmount();
          return;
        }
        nextRoot.render(node);
      } catch (cause) {
        shutdown();
        throw cause;
      }
    },
    shutdown,
  };
};

export interface TuiDependencies<R extends OwnedRenderer> {
  readonly acquire: (options: ShellOptions, signal: AbortSignal) => Promise<ShellProjection>;
  readonly createRenderer: () => Promise<R>;
  readonly makeRoot: (renderer: R) => UiRoot;
  readonly startLiveRefresh?: typeof startLiveRefresh;
}

const liveDependencies: TuiDependencies<CliRenderer> = {
  acquire: (options, signal) => Effect.runPromise(acquireProjection(options), { signal }),
  createRenderer: () => createCliRenderer({ exitOnCtrlC: true }),
  makeRoot: createRoot,
};

const scheduleAtomTask = (task: () => void) => {
  let cancelled = false;
  queueMicrotask(() => {
    if (!cancelled) task();
  });
  return () => {
    cancelled = true;
  };
};

export const runTui = async <R extends OwnedRenderer>(
  options: ShellOptions,
  dependencies: TuiDependencies<R>,
) => {
  const renderer = await dependencies.createRenderer();
  const startupController = new AbortController();
  const registry = AtomRegistry.make({ scheduleTask: scheduleAtomTask });
  let cancelRefresh: (() => void) | undefined;
  const owner = createRendererOwner(renderer, dependencies.makeRoot, {
    afterUnmount: () => registry.dispose(),
    beforeUnmount: () => {
      startupController.abort();
      cancelRefresh?.();
      cancelRefresh = undefined;
    },
  });

  if (owner.isShutdown()) {
    owner.shutdown();
    return;
  }

  let initialProjection: ShellProjection;
  try {
    initialProjection = await dependencies.acquire(options, startupController.signal);
  } catch (cause) {
    if (owner.isShutdown()) return;
    owner.shutdown();
    throw cause;
  }

  if (owner.isShutdown()) return;

  try {
    const projection = Atom.make(initialProjection);
    owner.render(
      <RegistryContext.Provider value={registry}>
        <App onQuit={owner.shutdown} projection={projection} />
      </RegistryContext.Provider>,
    );
    if (owner.isShutdown() || !options.live || options.demo) return;

    const cancel = (dependencies.startLiveRefresh ?? startLiveRefresh)({
      acquire: (signal) => dependencies.acquire(options, signal),
      clock: { now: () => Date.now() },
      initialProjection,
      intervalMs: 2_000,
      onFailure: () => owner.shutdown(),
      publish: (next) => {
        if (!owner.isShutdown()) registry.set(projection, next);
      },
      scheduler: {
        schedule: (at, task) => {
          const timer = setTimeout(task, Math.max(0, at - Date.now()));
          return () => clearTimeout(timer);
        },
      },
    });
    if (owner.isShutdown()) cancel();
    else cancelRefresh = cancel;
  } catch (cause) {
    if (!owner.isShutdown()) owner.shutdown();
    throw cause;
  }
};

export const startTui = (options: ShellOptions) => runTui(options, liveDependencies);
