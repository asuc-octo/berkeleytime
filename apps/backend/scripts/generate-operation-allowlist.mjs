import { addTypenameToDocument } from "@apollo/client/utilities";
import { Kind, parse, print, stripIgnoredCharacters, visit } from "graphql";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(backendDirectory, "../..");
const outputPath = resolve(
  backendDirectory,
  "src/bootstrap/graphql/generated/persistedOperations.ts"
);
const previousOutputPath = resolve(
  backendDirectory,
  "src/bootstrap/graphql/generated/previousPersistedOperations.ts"
);
const semanticSearchOutputPath = resolve(
  repositoryRoot,
  "apps/semantic-search/app/generated_operations.py"
);
const sourceRoots = [
  "apps/frontend/src",
  "apps/ag-frontend/src",
  "apps/staff-frontend/src",
  "apps/semantic-search/app/graphql",
];

function sourceFiles(path) {
  if (!existsSync(path)) {
    throw new Error(
      `Persisted-operation source root does not exist: ${relative(repositoryRoot, path)}`
    );
  }
  if (statSync(path).isFile()) return [path];

  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) return sourceFiles(child);
    return /\.(?:ts|tsx|graphql)$/i.test(entry.name) ? [child] : [];
  });
}

function graphqlDocuments(file, source) {
  if (/\.graphql$/i.test(file)) return [source];

  const scriptKind = /\.tsx$/i.test(file)
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  const documents = [];

  function walk(node) {
    if (
      ts.isTaggedTemplateExpression(node) &&
      ts.isIdentifier(node.tag) &&
      node.tag.text === "gql"
    ) {
      if (!ts.isNoSubstitutionTemplateLiteral(node.template)) {
        throw new Error(
          `Interpolated GraphQL documents cannot be allowlisted: ${relative(repositoryRoot, file)}`
        );
      }

      documents.push(
        source.slice(
          node.template.getStart(sourceFile) + 1,
          node.template.getEnd() - 1
        )
      );
    }
    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
  return documents;
}

function compareIds([left], [right]) {
  return left < right ? -1 : left > right ? 1 : 0;
}

const operations = new Map();

for (const root of sourceRoots) {
  for (const file of sourceFiles(resolve(repositoryRoot, root))) {
    const source = readFileSync(file, "utf8");
    const documents = graphqlDocuments(file, source);

    for (const documentSource of documents) {
      const document = parse(documentSource);
      const definitions = document.definitions.filter(
        (definition) => definition.kind === Kind.OPERATION_DEFINITION
      );

      // Cache-only fragments are not sent over HTTP.
      if (definitions.length === 0) continue;
      if (definitions.length !== 1) {
        throw new Error(
          `Each allowlisted document must contain exactly one operation: ${relative(repositoryRoot, file)}`
        );
      }

      const definition = definitions[0];
      if (!definition.name) {
        throw new Error(
          `Anonymous GraphQL operations cannot be allowlisted: ${relative(repositoryRoot, file)}`
        );
      }
      if (definition.operation === "subscription") {
        throw new Error(
          `Subscriptions are not supported by the public operation gateway: ${relative(repositoryRoot, file)}`
        );
      }

      visit(document, {
        Field(node) {
          if (node.name.value === "__typename") {
            throw new Error(
              `Authored __typename fields are not supported; Apollo adds them automatically: ${relative(repositoryRoot, file)}`
            );
          }
          if (node.name.value === "__schema" || node.name.value === "__type") {
            throw new Error(
              `Introspection fields cannot be allowlisted: ${relative(repositoryRoot, file)}`
            );
          }
        },
      });

      const canonicalSourceDocument = stripIgnoredCharacters(print(document));
      const executableDocument = stripIgnoredCharacters(
        print(addTypenameToDocument(document))
      );
      const id = createHash("sha256")
        .update(canonicalSourceDocument)
        .digest("hex");
      const sourcePath = relative(repositoryRoot, file).replaceAll("\\", "/");
      const existing = operations.get(id);

      if (existing) {
        existing.sources.add(sourcePath);
      } else {
        operations.set(id, {
          document: executableDocument,
          operationName: definition.name.value,
          variableNames: (definition.variableDefinitions ?? []).map(
            (variable) => variable.variable.name.value
          ),
          sources: new Set([sourcePath]),
        });
      }
    }
  }
}

const entries = [...operations.entries()]
  .sort(compareIds)
  .map(([id, operation]) => {
    const sources = [...operation.sources].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    );
    return `  ${JSON.stringify(id)}: {\n    operationName: ${JSON.stringify(operation.operationName)},\n    document: ${JSON.stringify(operation.document)},\n    variableNames: ${JSON.stringify(operation.variableNames)},\n    sources: ${JSON.stringify(sources)},\n  },`;
  })
  .join("\n");

const generated = `// Generated by scripts/generate-operation-allowlist.mjs. Do not edit manually.\n\nexport interface PersistedOperation {\n  operationName: string;\n  document: string;\n  variableNames: readonly string[];\n  sources: readonly string[];\n}\n\nexport const persistedOperations: Readonly<Record<string, PersistedOperation>> = {\n${entries}\n};\n`;

const semanticSearchOperations = Object.fromEntries(
  [...operations.entries()]
    .filter(([, operation]) =>
      [...operation.sources].some((source) =>
        source.startsWith("apps/semantic-search/")
      )
    )
    .sort(([, left], [, right]) =>
      left.operationName < right.operationName
        ? -1
        : left.operationName > right.operationName
          ? 1
          : 0
    )
    .map(([id, operation]) => [operation.operationName, id])
);
const generatedSemanticSearch = `# Generated by apps/backend/scripts/generate-operation-allowlist.mjs. Do not edit.\n\nSEMANTIC_SEARCH_OPERATION_IDS = ${JSON.stringify(semanticSearchOperations, null, 2)}\n`;

function normalized(value) {
  return value.replaceAll("\r\n", "\n");
}

if (process.argv.includes("--check")) {
  const current = existsSync(outputPath)
    ? readFileSync(outputPath, "utf8")
    : "";
  const currentSemanticSearch = existsSync(semanticSearchOutputPath)
    ? readFileSync(semanticSearchOutputPath, "utf8")
    : "";
  if (
    normalized(current) !== generated ||
    normalized(currentSemanticSearch) !== generatedSemanticSearch
  ) {
    console.error(
      "Persisted operation allowlist is stale. Run: npm run generate:operations"
    );
    process.exit(1);
  }
} else {
  mkdirSync(dirname(outputPath), { recursive: true });
  const current = existsSync(outputPath)
    ? readFileSync(outputPath, "utf8")
    : "";
  if (current && normalized(current) !== generated) {
    copyFileSync(outputPath, previousOutputPath);
  }
  writeFileSync(outputPath, generated);
  mkdirSync(dirname(semanticSearchOutputPath), { recursive: true });
  writeFileSync(semanticSearchOutputPath, generatedSemanticSearch);
  console.log(`Generated ${operations.size} persisted GraphQL operations.`);
}
