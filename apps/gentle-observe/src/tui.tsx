import { RegistryProvider } from "@effect/atom-react";
import { CliRenderEvents, createCliRenderer, type CliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Effect } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import type { ReactNode } from "react";

import { App } from "./app";
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

export const createRendererOwner = <R extends OwnedRenderer>(
  renderer: R,
  makeRoot: (renderer: R) => UiRoot,
) => {
  let root: UiRoot | undefined;
  let unmounted = false;
  const unmount = () => {
    if (unmounted) return;
    unmounted = true;
    root?.unmount();
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
    render(node: ReactNode) {
      try {
        root = makeRoot(renderer);
        root.render(node);
      } catch (cause) {
        shutdown();
        throw cause;
      }
    },
    shutdown,
  };
};

export interface TuiDependencies<R extends OwnedRenderer> {
  readonly acquire: (options: ShellOptions) => Promise<ShellProjection>;
  readonly createRenderer: () => Promise<R>;
  readonly makeRoot: (renderer: R) => UiRoot;
}

const liveDependencies: TuiDependencies<CliRenderer> = {
  acquire: (options) => Effect.runPromise(acquireProjection(options)),
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
  const owner = createRendererOwner(renderer, dependencies.makeRoot);

  try {
    const projection = Atom.make(await dependencies.acquire(options));
    owner.render(
      <RegistryProvider scheduleTask={scheduleAtomTask}>
        <App onQuit={owner.shutdown} projection={projection} />
      </RegistryProvider>,
    );
  } catch (cause) {
    owner.shutdown();
    throw cause;
  }
};

export const startTui = (options: ShellOptions) => runTui(options, liveDependencies);
