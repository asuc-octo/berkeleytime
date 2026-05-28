import { describe, expect, it } from "vitest";

import { findBuildingForLocation } from "./location";

describe("findBuildingForLocation", () => {
  it("matches a building from a room-qualified catalog location", () => {
    expect(findBuildingForLocation("Dwinelle 145")?.name).toBe("Dwinelle Hall");
  });

  it("prefers the longest matching building prefix", () => {
    expect(findBuildingForLocation("Hearst Gym North Field 1")?.name).toBe(
      "Hearst North Field"
    );
  });

  it("returns undefined for online or unrecognized locations", () => {
    expect(findBuildingForLocation("Online")).toBeUndefined();
  });
});
