/// <reference types="node" />
// Runs the refinement agent (headless Claude Code, see refine.md) on
// each catalog program, then regenerates.
// Usage: npm run refine:catalog -w @repo/BtLL [-- <programGroupId>...] [--force]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

function allProgramIds(): string[] {
  const rules = JSON.parse(
    readFileSync(here("./rules.generated.json"), "utf8")
  );
  return rules.map((p: { programGroupId: string }) => p.programGroupId);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const ids = args.filter((a) => !a.startsWith("--"));
const programs = ids.length ? ids : allProgramIds();
const instructions = readFileSync(here("./refine.md"), "utf8");

// Anything else is denied in headless mode
const allowedTools = [
  "WebSearch",
  "WebFetch",
  "Read",
  "Glob",
  "Grep",
  "Edit(packages/BtLL/catalog/overrides/**)",
  "Bash(npm run import:catalog *)",
  "Bash(node -e *)",
];

for (const id of programs) {
  if (!force && existsSync(here(`./overrides/${id}.json`))) {
    console.log(`- ${id}: already refined (use --force to redo)`);
    continue;
  }
  console.log(`> ${id}: refining...`);
  const { status } = spawnSync(
    "claude",
    [
      "-p",
      `Refine catalog program ${id}`,
      "--model",
      "opus", // Sonnet was noticeably shallower on complex programs
      "--append-system-prompt",
      instructions,
      // Local hooks (e.g. a docs-check Stop hook) shouldn't steer the agent
      "--settings",
      JSON.stringify({ disableAllHooks: true }),
      "--allowedTools",
      ...allowedTools,
    ],
    { cwd: here("../../.."), stdio: "inherit" }
  );
  console.log(
    status === 0 ? `+ ${id}: done` : `! ${id}: claude exited with ${status}`
  );
}

spawnSync("npm", ["run", "import:catalog"], {
  cwd: here(".."),
  stdio: "inherit",
  shell: true,
});
