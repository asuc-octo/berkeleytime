import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../../packages/gql-typedefs/*.ts",
  documents: ["./src/lib/api/*.ts", "../../packages/shared/queries.ts"],
  generates: {
    "./src/lib/generated/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
};

export default config;
