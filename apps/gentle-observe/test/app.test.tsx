import { describe, expect, test } from "bun:test";
import { testRender } from "@opentui/solid";

import { App } from "../src/app";

describe("truthful discovery shell", () => {
  test("renders truthful discovery status at 50x14 and exits on q", async () => {
    const rendered = await testRender(() => <App />, { width: 50, height: 14 });

    try {
      const frame = await rendered.waitForFrame((candidate) =>
        candidate.includes("Discovery is not connected."),
      );

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
