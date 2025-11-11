import type { CodegenConfig } from "@graphql-codegen/cli";
import path from "path";

const config: CodegenConfig = {
  schema: path.resolve(__dirname, "../backend/src/modules/**/typedefs/*.ts"),
  documents: ["./src/lib/api/*.ts", "../../packages/shared/queries.ts"], 
  generates: {
    "./src/lib/generated/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        // filename: "generated-types/module-types.ts",
      },
      // plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
