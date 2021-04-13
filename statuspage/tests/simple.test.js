import { expect } from "chai";

describe("Simple test", () => {
  it("should banana", () => {
    const banana = ("b" + "a" + +"a" + "a").toLowerCase();
    expect(banana).to.equal("banana");
  });
});
