import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRECTORIES = ["apps/frontend/src", "packages/theme/src"];
const GLOBAL_LAYER_THRESHOLD = 900;

/**
 * Temporary allowlist for existing global layers that have not been migrated
 * to tokens yet. Keep this list small and remove entries over time.
 */
const ALLOWLIST = new Set([
  "apps/frontend/src/components/Class/Class.module.scss",
  "apps/frontend/src/app/Catalog/Catalog.module.scss",
  "apps/frontend/src/app/Schedule/Editor/Week/Event/Event.module.scss",
  "apps/frontend/src/app/Schedule/Editor/SideBar/Event/Event.module.scss",
  "apps/frontend/src/app/GradTrak/Dashboard/SemesterBlock/ClassDetails/ClassDetails.module.scss",
  "apps/frontend/src/components/ReservedSeatingHoverCard/ReservedSeatingHoverCard.module.scss",
  "apps/frontend/src/components/Location/LocationHoverCard.module.scss",
  "apps/frontend/src/components/Layout/Feedback/Feedback.module.scss",
  "apps/frontend/src/components/Class/BookmarkPopover/BookmarkPopover.module.scss",
  "apps/frontend/src/app/Profile/Bookmarks/CollectionDetail/CollectionDetail.module.scss",
]);

const Z_INDEX_LITERAL_REGEX = /z-index\s*:\s*(\d+)\s*;/g;

const toPosixPath = (value) => value.split(path.sep).join("/");

const collectFiles = (directory, extension, files = []) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(absolutePath, extension, files);
      continue;
    }

    if (entry.isFile() && absolutePath.endsWith(extension)) {
      files.push(absolutePath);
    }
  }

  return files;
};

const getLineNumber = (content, index) => {
  return content.slice(0, index).split("\n").length;
};

const violations = [];
const allowlistedMatches = new Set();

for (const target of TARGET_DIRECTORIES) {
  const absoluteTarget = path.join(ROOT, target);
  const files = collectFiles(absoluteTarget, ".scss");

  for (const filePath of files) {
    const relativePath = toPosixPath(path.relative(ROOT, filePath));
    const content = readFileSync(filePath, "utf8");

    let match;
    while ((match = Z_INDEX_LITERAL_REGEX.exec(content)) !== null) {
      const value = Number(match[1]);
      if (value < GLOBAL_LAYER_THRESHOLD) continue;

      if (ALLOWLIST.has(relativePath)) {
        allowlistedMatches.add(relativePath);
        continue;
      }

      violations.push({
        relativePath,
        value,
        line: getLineNumber(content, match.index),
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `Found raw global z-index literals (>= ${GLOBAL_LAYER_THRESHOLD}) outside allowlist.\n` +
      "Use semantic tokens (e.g. var(--z-index-...)) or stack helpers from @repo/theme.\n"
  );

  for (const violation of violations) {
    console.error(
      `- ${violation.relativePath}:${violation.line} -> z-index: ${violation.value}`
    );
  }

  process.exit(1);
}

const staleAllowlistEntries = [...ALLOWLIST].filter(
  (entry) => !allowlistedMatches.has(entry)
);

if (staleAllowlistEntries.length > 0) {
  console.warn("Stale z-index allowlist entries (safe to remove):");
  for (const entry of staleAllowlistEntries) {
    console.warn(`- ${entry}`);
  }
}

console.log("Z-index policy check passed.");
