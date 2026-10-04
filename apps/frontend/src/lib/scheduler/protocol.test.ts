import { describe, expect, it } from "vitest";

import { MON, preferences, scheduleClass, section } from "./fixtures";
import { GenerateRequest, handleRequest, toGeneratorClasses } from "./protocol";

describe("toGeneratorClasses", () => {
  it("keeps only the fields the solver reads", () => {
    const lecture = {
      ...section("LEC", [MON], 10),
      instructors: ["not needed"],
      exams: [],
    };
    const [stripped] = toGeneratorClasses([
      {
        ...scheduleClass(lecture, []),
        selectedSections: [{ sectionId: lecture.sectionId }],
      },
    ]);

    expect(stripped.class.primarySection).not.toHaveProperty("instructors");
    expect(stripped.class.primarySection).not.toHaveProperty("exams");
    expect(stripped.class.primarySection?.meetings).toEqual(lecture.meetings);
    expect(stripped.selectedSections).toEqual([
      { sectionId: lecture.sectionId },
    ]);
  });
});

describe("handleRequest", () => {
  it("answers with the request id and the result", () => {
    const request: GenerateRequest = {
      id: 7,
      classes: [scheduleClass(section("LEC", [MON], 10), [])],
      events: [],
      preferences: preferences(),
    };

    const response = handleRequest(request);

    expect(response.id).toBe(7);
    expect("result" in response && response.result.schedules).toHaveLength(1);
  });

  it("reports errors instead of throwing", () => {
    const response = handleRequest({
      id: 8,
      classes: null,
      events: [],
      preferences: preferences(),
    } as unknown as GenerateRequest);

    expect(response).toMatchObject({ id: 8 });
    expect("error" in response).toBe(true);
  });
});
