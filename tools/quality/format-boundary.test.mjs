import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ignoredProofPaths = [
  join("openspec", "changes", ".oxfmt-boundary-proof.ts"),
  join("openspec", "changes", "archive", ".oxfmt-boundary-proof.ts"),
  join("openspec", "specs", ".oxfmt-boundary-proof.ts"),
  join("openspec", "config.yaml"),
];
const scannedProofPath = ".oxfmt-boundary-proof.ts";
const cleanControlPath = ".oxfmt-boundary-control.ts";
const malformedSource = "const value={alpha:1,beta:2}\n";
const oxfmtCliPath = fileURLToPath(
  new URL("./bin/oxfmt", import.meta.resolve("oxfmt/package.json")),
);

const runOxfmtCheck = (cwd) =>
  spawnSync(process.execPath, [oxfmtCliPath, "--check", ".", "--ignore-path", ".oxfmtignore"], {
    cwd,
    encoding: "utf8",
  });

void test("Oxfmt ignores the root OpenSpec tree but checks comparable repository files", async () => {
  const proofRoot = await mkdtemp(join(tmpdir(), "gentle-observe-oxfmt-"));

  try {
    await writeFile(join(proofRoot, ".oxfmtignore"), await readFile(".oxfmtignore"));
    for (const ignoredProofPath of ignoredProofPaths) {
      await mkdir(dirname(join(proofRoot, ignoredProofPath)), { recursive: true });
      await writeFile(
        join(proofRoot, ignoredProofPath),
        ignoredProofPath.endsWith(".yaml") ? "alpha:   1\n" : malformedSource,
      );
    }
    await writeFile(join(proofRoot, scannedProofPath), malformedSource);
    await writeFile(join(proofRoot, cleanControlPath), "const control = true;\n");

    const withComparableFile = runOxfmtCheck(proofRoot);
    const output = `${withComparableFile.stdout}${withComparableFile.stderr}`;

    assert.notEqual(withComparableFile.status, 0, output);
    assert.match(output, new RegExp(scannedProofPath.replaceAll(".", "\\.")));
    for (const ignoredProofPath of ignoredProofPaths) {
      assert.doesNotMatch(output, new RegExp(ignoredProofPath.replaceAll(".", "\\.")));
    }

    await rm(join(proofRoot, scannedProofPath));

    const withOnlyIgnoredFile = runOxfmtCheck(proofRoot);
    assert.equal(
      withOnlyIgnoredFile.status,
      0,
      `${withOnlyIgnoredFile.stdout}${withOnlyIgnoredFile.stderr}`,
    );
  } finally {
    await rm(proofRoot, { force: true, recursive: true });
  }
});
