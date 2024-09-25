import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/modules/**/typedefs/*.ts",
  generates: {
    "./src/modules/": {
      preset: "graphql-modules",
      presetConfig: {
        baseTypesPath: "../generated-types/graphql.ts",
        filename: "generated-types/module-types.ts",
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
