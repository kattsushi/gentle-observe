import { describe, expect, test } from "bun:test";
import { testRender } from "@opentui/solid";
import { Effect } from "effect";

import { App } from "../src/app";
import { acquireProjection } from "../src/ui/projection";

describe("truthful discovery shell", () => {
  test("renders persistent demo provenance and independent source health", async () => {
    const projection = await Effect.runPromise(
      acquireProjection({ demo: true, scenario: "degraded" }),
    );
    const rendered = await testRender(() => <App projection={projection} />, {
      width: 50,
      height: 14,
    });

    try {
      const frame = await rendered.waitForFrame(
        (candidate) =>
          candidate.includes("DEMO DATA") && candidate.includes("Runtime: degraded | demo"),
      );

      expect(frame).toContain("Processes: unavailable | demo");
      expect(frame).toContain("q quit");
    } finally {
      rendered.renderer.destroy();
    }
  });

  test("renders unavailable source health without substituting demo evidence", async () => {
    const projection = await Effect.runPromise(
      acquireProjection({ demo: false, scenario: "normal" }),
    );
    const rendered = await testRender(() => <App projection={projection} />, {
      width: 50,
      height: 14,
    });

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
    } finally {
      rendered.renderer.destroy();
    }
  });
});
