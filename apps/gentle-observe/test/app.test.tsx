import { describe, expect, test } from "bun:test";
import { RegistryProvider, useAtomSet } from "@effect/atom-react";
import { testRender } from "@opentui/react/test-utils";
import { Effect } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";

import { App } from "../src/app";
import { acquireProjection } from "../src/ui/projection";

describe("truthful discovery shell", () => {
  test("renders persistent demo provenance and independent source health", async () => {
    const projection = await Effect.runPromise(
      acquireProjection({ demo: true, scenario: "degraded" }),
    );
    const projectionAtom = Atom.make(projection);
    let setProjection: ((value: typeof projection) => void) | undefined;
    const Harness = () => {
      setProjection = useAtomSet(projectionAtom);
      return <App onQuit={() => rendered.renderer.destroy()} projection={projectionAtom} />;
    };
    const rendered = await testRender(
      <RegistryProvider>
        <Harness />
      </RegistryProvider>,
      { width: 50, height: 14 },
    );

    try {
      const frame = await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("DEMO DATA") && candidate.includes("Runtime: degraded | demo"),
      );

      expect(frame).toContain("Processes: unavailable | demo");
      expect(frame).toContain("q quit");

      const unavailable = await Effect.runPromise(
        acquireProjection({ demo: false, scenario: "normal" }),
      );
      if (setProjection === undefined) throw new Error("Atom setter was not mounted");
      setProjection(unavailable);
      const updated = await rendered.waitForFrame((candidate) =>
        candidate.includes("Runtime: unavailable | source unavailable"),
      );
      expect(updated).not.toContain("DEMO DATA");
    } finally {
      rendered.renderer.destroy();
    }
  });

  test("renders unavailable source health without substituting demo evidence", async () => {
    const projection = await Effect.runPromise(
      acquireProjection({ demo: false, scenario: "normal" }),
    );
    let quitCount = 0;
    const rendered = await testRender(
      <RegistryProvider>
        <App
          onQuit={() => {
            quitCount += 1;
            rendered.renderer.destroy();
          }}
          projection={Atom.make(projection)}
        />
      </RegistryProvider>,
      { width: 50, height: 14 },
    );

    try {
      const frame = await rendered.waitForFrame((candidate) =>
        candidate.includes("Runtime: unavailable | source unavailable"),
      );

      expect(frame).toContain("Processes: unavailable | source unavailable");
      expect(frame).not.toContain("DEMO DATA");
      expect(frame).not.toMatch(/\b\d+\s+(?:sessions?|discoveries)\b/i);

      await rendered.flush();
      await rendered.renderOnce();
      await rendered.mockInput.pressKeys(["q"]);
      await rendered.waitFor(() => rendered.renderer.isDestroyed);

      expect(rendered.renderer.isDestroyed).toBe(true);
      expect(quitCount).toBe(1);
    } finally {
      rendered.renderer.destroy();
    }
  });
});
