/**
 * Unfortunately, the specs are severely rate limited by the SIS API.
 * Instead, we manually download the specs and generate the API client.
 */
import fs from "fs";
import path from "node:path";
import { generateApi } from "swagger-typescript-api";

const specs = await fs.promises.readdir(path.resolve(process.cwd(), "./specs"));

for (const spec of specs) {
  const name = spec.split(".")[0];

  await generateApi({
    name: `${name}.ts`,
    output: path.resolve(process.cwd(), "./dist"),
    input: path.resolve(process.cwd(), "./specs", spec),
    singleHttpClient: false,
    apiClassName: `${name[0].toUpperCase()}${name.slice(1)}API`,
  });
}
