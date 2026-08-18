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

  test("drills through bounded process detail and timeline without reviving a removed generic route", async () => {
    const complex = await Effect.runPromise(acquireProjection({ demo: true, scenario: "complex" }));
    const projectionAtom = Atom.make(complex);
    let setProjection: ((value: typeof complex) => void) | undefined;
    const Harness = () => {
      setProjection = useAtomSet(projectionAtom);
      return <App onQuit={() => rendered.renderer.destroy()} projection={projectionAtom} />;
    };
    const rendered = await testRender(
      <RegistryProvider>
        <Harness />
      </RegistryProvider>,
      {
        width: 90,
        height: 24,
      },
    );
    const settle = async (input: () => void | Promise<void>) => {
      await act(async () => {
        await input();
        await rendered.flush();
      });
    };
    const update = async (next: typeof complex) => {
      if (setProjection === undefined) throw new Error("Atom setter was not mounted");
      await act(async () => {
        setProjection?.(next);
        await rendered.flush();
      });
    };

    try {
      await settle(() => rendered.mockInput.pressTab());
      await settle(() => rendered.mockInput.pressEnter());
      const sdd = await rendered.waitForFrame((frame) =>
        frame.includes("Process Detail | process-build"),
      );
      expect(sdd).toContain("SDD specialization");
      expect(sdd).toContain("reported active");
      expect(sdd).toContain("Token usage: unsupported");
      expect(sdd).toContain(
        "SDD specialization: phase/progress/artifacts/attempts/dependencies/Strict TDD",
      );
      expect(sdd).toContain("unavailable");
      expect(sdd).toContain("not runtime liveness and gives no delivery authority");
      expect(sdd).not.toMatch(/cost|private/i);
      await settle(() => rendered.mockInput.pressKeys(["2"]));
      await rendered.waitForFrame((frame) =>
        frame.includes("Timeline | Processes | process-build"),
      );
      rendered.resize(50, 14);
      const compact = await rendered.waitForFrame(
        (frame) =>
          frame.includes("DEMO DATA") &&
          frame.includes("timestamps unavailable in normalized contract"),
      );
      expect(compact).toContain("source: demo / demo-v1");
      await settle(async () => {
        await rendered.mockInput.pressKeys(["ESCAPE"]);
        await Bun.sleep(30);
      });
      await rendered.waitForFrame((frame) => frame.includes("Process Detail | process-build"));
      await settle(() => rendered.mockInput.pressKeys(["1"]));
      await settle(() => rendered.mockInput.pressKeys(["j"]));
      await settle(() => rendered.mockInput.pressKeys(["5"]));
      const generic = await rendered.waitForFrame((frame) =>
        frame.includes("Process Detail | process-check"),
      );
      expect(generic).toContain("DEMO DATA");
      expect(generic).toContain("id: process-check | type: generic");
      expect(generic).toContain("canonical name/category/version: unavailable");
      expect(generic).toContain("specialized semantics: unavailable");
      expect(generic).not.toContain("generic canonical process-check | category generic");
      expect(generic).not.toContain("SDD specialization");
      await update(await Effect.runPromise(acquireProjection({ demo: true, scenario: "normal" })));
      await rendered.waitForFrame(
        (frame) => frame.includes("Processes [active]") && frame.includes("process-build"),
      );
      await update(complex);
      const restored = await rendered.waitForFrame((frame) => frame.includes("Processes [active]"));
      expect(restored).not.toContain("Process Detail | process-check");
    } finally {
      rendered.renderer.destroy();
    }
  });

  test("renders source-level runtime token states while valid routes survive and stale routes are discarded", async () => {
    const normal = await Effect.runPromise(acquireProjection({ demo: true, scenario: "normal" }));
    const projectionAtom = Atom.make(normal);
    let setProjection: ((value: typeof normal) => void) | undefined;
    const Harness = () => {
      setProjection = useAtomSet(projectionAtom);
      return <App onQuit={() => rendered.renderer.destroy()} projection={projectionAtom} />;
    };
    const rendered = await testRender(
      <RegistryProvider>
        <Harness />
      </RegistryProvider>,
      {
        width: 50,
        height: 14,
      },
    );
    const settle = async (input: () => void | Promise<void>) => {
      await act(async () => {
        await input();
        await rendered.flush();
      });
    };
    const update = async (next: typeof normal) => {
      if (setProjection === undefined) throw new Error("Atom setter was not mounted");
      await act(async () => {
        setProjection?.(next);
        await rendered.flush();
      });
    };

    try {
      await settle(() => rendered.mockInput.pressKeys(["3"]));
      const supported = await rendered.waitForFrame((frame) =>
        frame.includes("Agent Detail | agent-alpha"),
      );
      expect(supported).toContain("Token usage: supported input 20 output 10");
      await settle(() => rendered.mockInput.pressKeys(["2"]));
      await rendered.waitForFrame((frame) => frame.includes("Timeline | Runtime | agent-alpha"));
      await settle(async () => {
        await rendered.mockInput.pressKeys(["ESCAPE"]);
        await Bun.sleep(30);
      });
      await rendered.waitForFrame((frame) => frame.includes("Agent Detail | agent-alpha"));
      await settle(() => rendered.mockInput.pressKeys(["2"]));
      await settle(() => rendered.mockInput.pressEnter());
      await rendered.waitForFrame((frame) => frame.includes("Agent Detail | agent-alpha"));
      await update(await Effect.runPromise(acquireProjection({ demo: true, scenario: "complex" })));
      const missing = await rendered.waitForFrame((frame) =>
        frame.includes("Token usage: missing"),
      );
      expect(missing).toContain("observed running");
      await update(
        await Effect.runPromise(acquireProjection({ demo: true, scenario: "degraded" })),
      );
      const unsupported = await rendered.waitForFrame((frame) =>
        frame.includes("Token usage: unsupported"),
      );
      expect(unsupported).toContain("observed failed");
      await update(await Effect.runPromise(acquireProjection({ demo: false, scenario: "normal" })));
      await rendered.waitForFrame((frame) => frame.includes("Runtime has no records."));
      await update(normal);
      const restored = await rendered.waitForFrame((frame) => frame.includes("Runtime [active]"));
      expect(restored).not.toContain("Agent Detail | agent-alpha");
      expect(restored).not.toContain("Timeline | Runtime | agent-alpha");
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
