import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";

const appRoot = resolve(import.meta.dir, "..");
const workspaceRoot = resolve(appRoot, "..", "..");
const upstreamCommit = "628dd0bf88ba191907661a0fe80491be08302781";
const registryBase = "https://termcn.dev/r/opentui";
const lockfileHash = "1b9e7be72a15a734f88af6787bf571c02a4eee6a95affd86383a4c1f8dd7c6ff";

const officialFiles = [
  ["src/components/ui/stack.tsx", "stack"],
  ["src/components/ui/columns.tsx", "columns"],
  ["src/components/ui/key-value.tsx", "key-value"],
  ["src/components/ui/types.ts", "types"],
  ["src/hooks/use-theme.ts", "use-theme"],
  ["src/lib/terminal-themes/default.ts", "theme-default"],
] as const;

const formattedLocalSourceHashes = {
  "src/components/ui/stack.tsx": "1effdabbbce73f8b777e39fd04b49a18f654cbae524737fb4ea3d86ba18fbb01",
  "src/components/ui/columns.tsx":
    "d2892729a01fcb155bea46ace87309c1c2572e8d14c21c04f22d4caf9e7e7abf",
  "src/components/ui/key-value.tsx":
    "132c4506c0871b91b1659b7374a53335228e79b58469becca3b588841f089abe",
  "src/components/ui/types.ts": "c0950d0e4fafd04295f7a9b20409715c8cdc8e510eefab9059b899f94f016ac5",
  "src/hooks/use-theme.ts": "a9b07350eee38f9718025d0aac9cef6474e16a5a46e817417ef17b822ca54f0c",
  "src/lib/terminal-themes/default.ts":
    "6056ea0bf72a9c5a151cea58b1d59cea0c57b99c8a381b1176061cc59a216f97",
} as const;

const source = async (path: string) => {
  const file = Bun.file(resolve(appRoot, path));
  expect(await file.exists(), `${path} must be copied from the pinned Termcn registry`).toBe(true);
  return (await file.exists()) ? file.text() : "";
};

const dependencies = (manifest: Record<string, unknown>) => [
  ...Object.keys((manifest.dependencies as Record<string, string> | undefined) ?? {}),
  ...Object.keys((manifest.devDependencies as Record<string, string> | undefined) ?? {}),
];

describe("Termcn OpenTUI registry adoption", () => {
  test("configures the official registry and TypeScript 7 app-local alias", async () => {
    const components = JSON.parse(await source("components.json"));
    const tsconfig = JSON.parse(await source("tsconfig.json"));

    expect(components.$schema).toBe("https://ui.shadcn.com/schema.json");
    expect(components.rsc).toBe(false);
    expect(components.tsx).toBe(true);
    expect(components.tailwind.config).toBe("");
    expect(components.tailwind.css).toBe("");
    expect(components.aliases).toMatchObject({
      components: "@/components",
      hooks: "@/hooks",
      lib: "@/lib",
      ui: "@/components/ui",
      utils: "@/lib/utils",
    });
    expect(components.registries).toEqual({
      "@termcn": "https://termcn.dev/r/{name}.json",
    });
    expect(tsconfig.compilerOptions.baseUrl).toBeUndefined();
    expect(tsconfig.compilerOptions.paths).toEqual({ "@/*": ["./src/*"] });
  });

  test("copies the pinned OpenTUI registry sources with local compatibility boundaries", async () => {
    expect(Object.keys(formattedLocalSourceHashes).sort()).toEqual(
      officialFiles.map(([path]) => path).sort(),
    );
    for (const [path, name] of officialFiles) {
      const contents = await source(path);
      expect(contents).toContain(`${registryBase}/${name}.json`);
      expect(contents).toContain(upstreamCommit);
      expect(contents).toContain("SPDX-License-Identifier: MIT");
      expect(createHash("sha256").update(contents).digest("hex")).toBe(
        formattedLocalSourceHashes[path],
      );
    }

    const [stack, columns, keyValue] = await Promise.all([
      source("src/components/ui/stack.tsx"),
      source("src/components/ui/columns.tsx"),
      source("src/components/ui/key-value.tsx"),
    ]);
    for (const contents of [stack, columns, keyValue]) {
      expect(contents).toContain("@opentui/react");
      expect(contents).toMatch(/from "react"/);
      expect(contents).not.toMatch(/from ["'](?:ink|termcn)["']/);
    }
    expect(stack).toContain('import type { BoxProps } from "@opentui/react"');
    expect(stack).toContain('width?: BoxProps["width"]');
    expect(stack).toContain('height?: BoxProps["height"]');
    expect(stack).not.toContain(" as number");
  });

  test("uses Stack for every route, Columns for standard source health, and KeyValue for standard metadata", async () => {
    const [app, shell, agent, process, timeline] = await Promise.all([
      source("src/app.tsx"),
      source("src/ui/AppShell.tsx"),
      source("src/ui/AgentDetail.tsx"),
      source("src/ui/ProcessDetail.tsx"),
      source("src/ui/Timeline.tsx"),
    ]);

    expect(app).toContain("const compact = layoutFor(width, height).compact");
    expect(app).toContain("<AppShell compact={compact} projection={projection}>");
    expect(shell).toContain('import { Stack } from "@/components/ui/stack"');
    expect(shell).toContain('import { Columns } from "@/components/ui/columns"');
    expect(shell).toContain("<Stack>");
    expect(shell).toContain("<Columns>");
    for (const contents of [agent, process, timeline]) {
      expect(contents).toContain('import { KeyValue } from "@/components/ui/key-value"');
      expect(contents).toContain("<KeyValue");
    }
  });

  test("keeps manifests and the lockfile free of Termcn, shadcn, and Ink mutations", async () => {
    const rootManifest = JSON.parse(await Bun.file(resolve(workspaceRoot, "package.json")).text());
    const appManifest = JSON.parse(await Bun.file(resolve(appRoot, "package.json")).text());
    const names = new Set([...dependencies(rootManifest), ...dependencies(appManifest)]);

    expect(["termcn", "shadcn", "ink"].some((name) => names.has(name))).toBe(false);
    const lockfile = await Bun.file(resolve(workspaceRoot, "bun.lock")).text();
    expect(createHash("sha256").update(lockfile).digest("hex")).toBe(lockfileHash);
    expect(lockfile).not.toMatch(/(?:^|["@/])(?:termcn|shadcn|ink)(?:["@/:]|$)/m);
  });

  test("records complete pinned provenance, dry-run resolution, correction, and MIT notice", async () => {
    const notice = await source("THIRD_PARTY_NOTICES.md");

    expect(notice).toContain("https://github.com/shadcn-labs/termcn");
    expect(notice).toContain(upstreamCommit);
    for (const [, name] of officialFiles) expect(notice).toContain(`${registryBase}/${name}.json`);
    expect(notice).toContain("shadcn@4.3.0");
    expect(notice).toContain("bunx --bun shadcn@4.3.0 add");
    expect(notice).toContain("Repository Oxfmt normalization");
    expect(notice).toContain("after exact registry extraction");
    expect(notice).toContain("Stack compatibility correction");
    expect(notice).toContain('BoxProps["width"]');
    expect(notice).toContain('BoxProps["height"]');
    expect(notice).toContain("MIT License");
    expect(notice).toContain("Copyright (c) 2026 Aniket Pawar");
    expect(notice).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
  });
});
