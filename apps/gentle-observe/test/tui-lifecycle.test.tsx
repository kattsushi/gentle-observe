import { describe, expect, test } from "bun:test";
import { createRendererOwner, runTui, type OwnedRenderer, type UiRoot } from "../src/tui";

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
