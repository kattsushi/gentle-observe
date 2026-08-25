import { describe, expect, test } from "bun:test";
import { isValidElement, type ReactNode } from "react";
import type { Atom } from "effect/unstable/reactivity/Atom";
import type { AtomRegistry } from "effect/unstable/reactivity/AtomRegistry";

import { startLiveRefresh, type LiveRefreshDependencies } from "../src/live/refresh";
import { createRendererOwner, runTui, type OwnedRenderer, type UiRoot } from "../src/tui";
import type { ShellProjection } from "../src/ui/projection";

const fixture = () => {
  const events: Array<string> = [];
  let destroyed = false;
  let onDestroy: () => void = () => undefined;
  const renderer: OwnedRenderer = {
    destroy() {
      events.push("destroy:start");
      onDestroy();
      destroyed = true;
      events.push("destroy:end");
    },
    get isDestroyed() {
      return destroyed;
    },
    once(_event, listener) {
      onDestroy = listener;
    },
  };
  const root: UiRoot = {
    render() {
      events.push("render");
    },
    unmount() {
      events.push("unmount");
    },
  };
  return { events, renderer, root };
};

describe("renderer lifecycle ownership", () => {
  test("unmounts once before explicit destruction", () => {
    const { events, renderer, root } = fixture();
    const owner = createRendererOwner(renderer, () => root);
    owner.render(null);
    owner.shutdown();
    owner.shutdown();

    expect(events).toEqual(["render", "unmount", "destroy:start", "destroy:end"]);
  });

  test("unmounts before renderer-originated destruction", () => {
    const { events, renderer, root } = fixture();
    createRendererOwner(renderer, () => root).render(null);
    renderer.destroy();

    expect(events).toEqual(["render", "destroy:start", "unmount", "destroy:end"]);
  });

  test("destroys once and preserves an unmount failure", () => {
    const { events, renderer, root } = fixture();
    const unmountCause = new Error("unmount");
    const owner = createRendererOwner(renderer, () => ({
      ...root,
      unmount() {
        root.unmount();
        throw unmountCause;
      },
    }));
    owner.render(null);

    let reportedCause: unknown;
    try {
      owner.shutdown();
    } catch (cause) {
      reportedCause = cause;
    }
    expect(reportedCause).toBe(unmountCause);
    expect(renderer.isDestroyed).toBe(true);
    owner.shutdown();
    expect(events).toEqual(["render", "unmount", "destroy:start", "destroy:end"]);
  });

  test("cleans up root creation and render failures", () => {
    for (const stage of ["create", "render"] as const) {
      const { events, renderer, root } = fixture();
      const owner = createRendererOwner(renderer, () => {
        if (stage === "create") throw new Error(stage);
        return {
          ...root,
          render: () => {
            throw new Error(stage);
          },
        };
      });

      expect(() => owner.render(null)).toThrow(stage);
      expect(renderer.isDestroyed).toBe(true);
      expect(events.filter((event) => event === "unmount")).toHaveLength(
        stage === "render" ? 1 : 0,
      );
    }
  });

  test("cleans up when startup acquisition fails", async () => {
    const { events, renderer, root } = fixture();

    const error = await runTui(
      { demo: false, scenario: "normal" },
      {
        acquire: () => Promise.reject(new Error("acquire")),
        createRenderer: () => Promise.resolve(renderer),
        makeRoot: () => root,
      },
    ).catch((cause: unknown) => cause);

    expect(error).toMatchObject({ message: "acquire" });
    expect(events).toEqual(["destroy:start", "destroy:end"]);
  });
});

const liveProjection: ShellProjection = {
  demo: false,
  processes: {
    availability: "available",
    capabilities: { tokens: { state: "missing" } },
    freshness: "unknown",
    health: "available",
    missingness: "partial",
    provenance: { adapterVersion: "live-v1", kind: "live" },
    records: [],
  },
  runtime: {
    availability: "available",
    capabilities: { tokens: { state: "missing" } },
    freshness: "unknown",
    health: "available",
    missingness: "partial",
    provenance: { adapterVersion: "live-v1", kind: "live" },
    records: [],
  },
};

function deferred<A>() {
  let resolve: (value: A) => void = () => undefined;
  const promise = new Promise<A>((resolve_) => {
    resolve = resolve_;
  });
  return { promise, resolve };
}

const settle = async () => {
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
};

describe("Live refresh TUI lifecycle", () => {
  test("aborts deferred startup and never renders or subscribes after destruction", async () => {
    const { events, renderer, root } = fixture();
    const acquisition = deferred<ShellProjection>();
    const started = deferred<void>();
    let aborted = 0;
    let refreshes = 0;
    let roots = 0;

    const running = runTui(
      { demo: false, live: true, scenario: "normal" },
      {
        acquire: (_options, signal?: AbortSignal) => {
          signal?.addEventListener("abort", () => {
            aborted += 1;
          });
          started.resolve();
          return acquisition.promise;
        },
        createRenderer: () => Promise.resolve(renderer),
        makeRoot: () => {
          roots += 1;
          return root;
        },
        startLiveRefresh: (_refresh: LiveRefreshDependencies) => {
          refreshes += 1;
          return () => undefined;
        },
      },
    );

    await started.promise;
    renderer.destroy();
    acquisition.resolve(liveProjection);
    await running;

    expect(aborted).toBe(1);
    expect(roots).toBe(0);
    expect(events).toEqual(["destroy:start", "destroy:end"]);
    expect(refreshes).toBe(0);
  });

  test("seeds delayed Live refresh and publishes changed projections once", async () => {
    const { renderer } = fixture();
    const changed: ShellProjection = {
      ...liveProjection,
      processes: { ...liveProjection.processes, health: "degraded" },
    };
    const snapshots = [liveProjection, changed, changed];
    const scheduled: Array<{ cancelled: boolean; task: () => void }> = [];
    let acquisitions = 0;
    let registry: AtomRegistry | undefined;
    let projection: Atom<ShellProjection> | undefined;

    await runTui(
      { demo: false, live: true, scenario: "normal" },
      {
        acquire: () => Promise.resolve(snapshots[acquisitions++] ?? liveProjection),
        createRenderer: () => Promise.resolve(renderer),
        makeRoot: () => ({
          render(node) {
            if (
              !isValidElement<{ readonly children: ReactNode; readonly value: AtomRegistry }>(node)
            ) {
              throw new Error("TUI root did not receive a registry provider");
            }
            const app = node.props.children;
            if (!isValidElement<{ readonly projection: Atom<ShellProjection> }>(app)) {
              throw new Error("TUI root did not receive an App projection");
            }
            registry = node.props.value;
            projection = app.props.projection;
          },
          unmount: () => undefined,
        }),
        startLiveRefresh: (refresh: LiveRefreshDependencies) =>
          startLiveRefresh({
            ...refresh,
            clock: { now: () => 100 },
            scheduler: {
              schedule: (_at, task) => {
                const entry = { cancelled: false, task };
                scheduled.push(entry);
                return () => {
                  entry.cancelled = true;
                };
              },
            },
          }),
      },
    );

    expect(acquisitions).toBe(1);
    expect(scheduled).toHaveLength(1);
    if (registry === undefined || projection === undefined)
      throw new Error("TUI projection was not captured");
    const updates: ShellProjection[] = [];
    const unsubscribe = registry.subscribe(projection, (value) => {
      updates.push(value);
    });
    scheduled[0]?.task();
    await settle();
    scheduled[1]?.task();
    await settle();

    expect(registry.get(projection)).toEqual(changed);
    expect(updates).toEqual([changed]);
    unsubscribe();
    renderer.destroy();
  });

  test("cancels refresh before unmount for quit and renderer destruction", async () => {
    for (const termination of ["quit", "destroy"] as const) {
      const { events, renderer, root } = fixture();
      let onQuit: (() => void) | undefined;
      await runTui(
        { demo: false, live: true, scenario: "normal" },
        {
          acquire: () => Promise.resolve(liveProjection),
          createRenderer: () => Promise.resolve(renderer),
          makeRoot: () => ({
            ...root,
            render(node) {
              root.render(node);
              if (isValidElement<{ readonly children: ReactNode }>(node)) {
                const app = node.props.children;
                if (isValidElement<{ readonly onQuit: () => void }>(app)) onQuit = app.props.onQuit;
              }
            },
          }),
          startLiveRefresh: () => {
            events.push("refresh:start");
            return () => events.push("refresh:cancel");
          },
        },
      );

      if (termination === "quit") onQuit?.();
      else renderer.destroy();
      renderer.destroy();
      expect(events.filter((event) => event === "refresh:cancel")).toHaveLength(1);
      expect(events.indexOf("refresh:cancel")).toBeLessThan(events.indexOf("unmount"));
    }
  });

  test("cancels a handle returned after destruction during refresh subscription", async () => {
    const { events, renderer, root } = fixture();
    await runTui(
      { demo: false, live: true, scenario: "normal" },
      {
        acquire: () => Promise.resolve(liveProjection),
        createRenderer: () => Promise.resolve(renderer),
        makeRoot: () => root,
        startLiveRefresh: () => {
          renderer.destroy();
          return () => events.push("refresh:cancel");
        },
      },
    );

    expect(renderer.isDestroyed).toBe(true);
    expect(events).toEqual(["render", "destroy:start", "unmount", "destroy:end", "refresh:cancel"]);
  });

  test("shuts down on refresh failure and never starts refresh outside Live", async () => {
    const { events, renderer, root } = fixture();
    const failure = new Error("refresh");
    await runTui(
      { demo: false, live: true, scenario: "normal" },
      {
        acquire: () => Promise.resolve(liveProjection),
        createRenderer: () => Promise.resolve(renderer),
        makeRoot: () => root,
        startLiveRefresh: (refresh: LiveRefreshDependencies) => {
          refresh.onFailure(failure);
          return () => events.push("refresh:cancel");
        },
      },
    );
    expect(renderer.isDestroyed).toBe(true);
    expect(events).toEqual(["render", "unmount", "destroy:start", "destroy:end", "refresh:cancel"]);

    for (const options of [
      { demo: true, scenario: "normal" },
      { demo: false, live: false, scenario: "normal" },
    ] as const) {
      const unavailable = fixture();
      let refreshes = 0;
      await runTui(options, {
        acquire: () => Promise.resolve(liveProjection),
        createRenderer: () => Promise.resolve(unavailable.renderer),
        makeRoot: () => unavailable.root,
        startLiveRefresh: () => {
          refreshes += 1;
          return () => undefined;
        },
      });
      unavailable.renderer.destroy();
      expect(refreshes).toBe(0);
    }
  });
});
