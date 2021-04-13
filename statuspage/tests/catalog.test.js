import { expect } from "chai";
import { URL_BERKELEYTIME } from "#root/config";
import axios from "axios";

describe("Catalog test", () => {
  it("should compare the /catalog_json endpoint", async () => {
    const restResponse = await axios.get(
      `${URL_BERKELEYTIME}/api/catalog/catalog_json`
    );

    const gqlResponse = await axios.post(`${URL_BERKELEYTIME}/api/graphql`, {
      query: "query PingQuery{ ping }",
    });
    expect(gqlResponse.status).to.equal(200);
    const gqlData = await gqlResponse.data;
  }).timeout(50000);
});
