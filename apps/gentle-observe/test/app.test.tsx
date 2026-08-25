import { describe, expect, test } from "bun:test";
import { RegistryProvider, useAtomSet } from "@effect/atom-react";
import { testRender } from "@opentui/react/test-utils";
import { Effect } from "effect";
import { act } from "react";
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

  test("preserves plane selection through navigation, resize, and stale Atom updates", async () => {
    const projection = await Effect.runPromise(
      acquireProjection({ demo: true, scenario: "complex" }),
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
      { width: 90, height: 24 },
    );
    const settle = (input: () => void) => act(() => (input(), rendered.flush()));
    const runtimeFrame = (agent: string) =>
      rendered.waitForFrame(
        (candidate) => candidate.includes("Runtime [active]") && candidate.includes(`> ${agent}`),
      );

    try {
      expect(await runtimeFrame("agent-alpha")).toContain("observed running");
      await settle(() => rendered.mockInput.pressArrow("down"));
      const selectedRuntime = await rendered.waitForFrame(
        (candidate) => candidate.includes("> agent-beta") && candidate.includes("observed idle"),
      );
      expect(selectedRuntime).toContain("DEMO DATA");
      await settle(() => rendered.mockInput.pressTab());
      await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("Processes [active]") && candidate.includes("> process-build"),
      );
      await rendered.mockInput.pressKeys(["j"]);
      const selectedProcess = await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("> process-check") && candidate.includes("reported active"),
      );
      expect(selectedProcess).toContain("Tab plane");
      await settle(() => rendered.mockInput.pressEnter());
      const boundary = await rendered.waitForFrame((candidate) =>
        candidate.includes("Detail view is not available in this build."),
      );
      expect(boundary).toContain("Processes | process-check");
      expect(boundary).not.toContain("durationMs");
      await settle(() => rendered.mockInput.pressEscape());
      rendered.resize(50, 14);
      const compact = await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("DEMO DATA") &&
          candidate.includes("Processes [active]") &&
          candidate.includes("> process-check"),
      );
      expect(compact).toContain("reported active");
      expect(compact).toContain("Tab plane");
      await settle(() => rendered.mockInput.pressTab());
      expect(await runtimeFrame("agent-beta")).toContain("observed idle");
      if (setProjection === undefined) throw new Error("Atom setter was not mounted");
      const updateProjection = setProjection;
      const update = (next: typeof projection) =>
        act(async () => {
          updateProjection(next);
          await rendered.flush();
        });
      await update(await Effect.runPromise(acquireProjection({ demo: true, scenario: "normal" })));
      const fallback = await runtimeFrame("agent-alpha");
      expect(fallback).toContain("observed running");
      expect(fallback).not.toContain("> agent-beta");
      await update(projection);
      expect(await runtimeFrame("agent-alpha")).not.toContain("> agent-beta");
      await settle(() => rendered.mockInput.pressEnter());
      await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("Detail view is not available in this build.") &&
          candidate.includes("Runtime | agent-alpha"),
      );
      const unavailable = await Effect.runPromise(
        acquireProjection({ demo: false, scenario: "normal" }),
      );
      await update(unavailable);
      const overview = await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("Runtime has no records.") &&
          candidate.includes("Runtime: unavailable | source unavailable"),
      );
      expect(overview).not.toContain("Detail view is not available in this build.");
      await update(projection);
      const reopened = await runtimeFrame("agent-alpha");
      expect(reopened).not.toContain("Detail view is not available in this build.");
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

      rendered.mockInput.pressEscape();
      rendered.mockInput.pressEnter();
      const unchanged = await rendered.waitForFrame((candidate) =>
        candidate.includes("Runtime: unavailable | source unavailable"),
      );
      expect(unchanged).not.toContain("Detail view is not available in this build.");

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
