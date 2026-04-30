import { init } from "./interpreter";
import type { Course } from "./lib/course";
import {
  isUpperDivision,
  runBipartiteMatch,
  runJointAssignment,
  runUnitAssignment,
} from "./lib/course_assignment";
import {
  computeOverlapCap,
  runJointReassignment,
} from "./lib/joint_assignment";
import type {
  AndRequirement,
  NCoursesRequirement,
  NumberRequirement,
  OrRequirement,
} from "./lib/requirement";

const TESTS = [
  {
    name: "boolean logic test",
    test: () => {
      const testCode = `
      Function<List<boolean>>() main (){ 
        // test comment
        boolean x false
        boolean y false
        boolean c contains([x, y, or([x, y])], true)
        boolean d contains([x, y, or([x, y, true])], true)
        boolean e get_element([x, y, or([x, y, true])], 2)
        List<boolean> return [c, d, e]
      }
      `;

      try {
        const result = init(testCode, new Map(), { debug: true });
        if (result[0] !== false) return false;
        if (result[1] !== true) return false;
        if (result[2] !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "string list test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){ 
        string x "hello"
        string y "world"
        List<string> list [x, y]
        string result_1 get_element(list, 1)
        boolean result_2 contains(list, "hello")
        boolean return and([result_2, equal([result_1, "world"])])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "function call test",
    test: () => {
      const testCode = `
      Function<number>(number) times_three (a, b){
        number return add([a, a, a])
      }
      Function<boolean>() main (){ 
        number result times_three(3)
        number return result
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== 9) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "find, filter, reduce test",
    test: () => {
      const testCode = `
      Function<boolean>(number) find_func (n){
        boolean return equal([n, 3])
      }
      Function<number>(number, number) add_func (acc, n){
        number return add([acc, n])
      }
      Function<boolean>() main (){ 
        List<number> list [1, 3, 2, 3, 4, 5, 3]
        number res1 find(list, find_func)
        // matches three 3s
        List<number> res2 filter(list, find_func)
        // should be 21
        number res3 reduce(list, add_func, 0)
        boolean return and([equal([res1, length(res2)]), equal([res3, 21])])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "inline function def test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){ 
        List<number> list [1, 3, 2, 3, 4, 5, 3]
        number res1 find(list, (n){
          boolean return equal([n, 3])
        })
        boolean return equal([res1, 3])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "if else test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){ 
        boolean x true
        boolean y false
        number result if_else(x, (){
          number return add([1, 2])
        }(), (){
          number return add([3, 4])
        }())
        boolean result2 if_else(y, false, true)
        boolean return and([equal([result, 3]), result2])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "BooleanRequirement test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Requirement req1 BooleanRequirement(true, "Test requirement")
        Requirement req2 BooleanRequirement(false, "Failed requirement")
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "NCoursesRequirement test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Course course1 {"CS", "61A"}
        Course course2 {"CS", "61B"}
        Course course3 {"CS", "70"}
        List<Course> courses [course1, course2, course3]
        Requirement req1 NCoursesRequirement(courses, 3, "Need 3 courses")
        Requirement req2 NCoursesRequirement(courses, 5, "Need 5 courses")
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "NumberRequirement test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Requirement req1 NumberRequirement(10, 5, "Have 10 need 5")
        Requirement req2 NumberRequirement(3, 8, "Have 3 need 8")
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "AndRequirement test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Requirement req1 BooleanRequirement(true, "First")
        Requirement req2 BooleanRequirement(true, "Second")
        Requirement req3 BooleanRequirement(false, "Third")
        List<Requirement> all_true [req1, req2]
        List<Requirement> has_false [req1, req2, req3]
        Requirement and1 AndRequirement(all_true, "All true")
        Requirement and2 AndRequirement(has_false, "Has false")
        boolean result1 get_attr(and1, "result")
        boolean result2 get_attr(and2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "OrRequirement test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Requirement req1 BooleanRequirement(false, "First")
        Requirement req2 BooleanRequirement(true, "Second")
        Requirement req3 BooleanRequirement(false, "Third")
        List<Requirement> has_true [req1, req2, req3]
        List<Requirement> all_false [req1, req3]
        Requirement or1 OrRequirement(has_true, "Has true")
        Requirement or2 OrRequirement(all_false, "All false")
        boolean result1 get_attr(or1, "result")
        boolean result2 get_attr(or2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "BooleanRequirement constructor test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        BooleanRequirement req1 {true, "Test requirement"}
        BooleanRequirement req2 {false, "Failed requirement"}
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        boolean value1 get_attr(req1, "value")
        boolean return and([result1, not(result2), value1])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "NCoursesRequirement constructor test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        Course course1 {"CS", "61A"}
        Course course2 {"CS", "61B"}
        List<Course> courses [course1, course2]
        NCoursesRequirement req1 {courses, 2, "Need 2 courses"}
        NCoursesRequirement req2 {courses, 5, "Need 5 courses"}
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        number count get_attr(req1, "required_count")
        boolean return and([result1, not(result2), equal([count, 2])])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "NumberRequirement constructor test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        NumberRequirement req1 {10, 5, "Have 10 need 5"}
        NumberRequirement req2 {3, 8, "Have 3 need 8"}
        boolean result1 get_attr(req1, "result")
        boolean result2 get_attr(req2, "result")
        number actual get_attr(req1, "actual")
        number required get_attr(req1, "required")
        boolean return and([result1, not(result2), equal([actual, 10]), equal([required, 5])])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "AndRequirement constructor test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        BooleanRequirement req1 {true, "First"}
        BooleanRequirement req2 {true, "Second"}
        BooleanRequirement req3 {false, "Third"}
        List<Requirement> all_true [req1, req2]
        List<Requirement> has_false [req1, req2, req3]
        AndRequirement and1 {all_true, "All true"}
        AndRequirement and2 {has_false, "Has false"}
        boolean result1 get_attr(and1, "result")
        boolean result2 get_attr(and2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  {
    name: "OrRequirement constructor test",
    test: () => {
      const testCode = `
      Function<boolean>() main (){
        BooleanRequirement req1 {false, "First"}
        BooleanRequirement req2 {true, "Second"}
        BooleanRequirement req3 {false, "Third"}
        List<Requirement> has_true [req1, req2, req3]
        List<Requirement> all_false [req1, req3]
        OrRequirement or1 {has_true, "Has true"}
        OrRequirement or2 {all_false, "All false"}
        boolean result1 get_attr(or1, "result")
        boolean result2 get_attr(or2, "result")
        boolean return and([result1, not(result2)])
      }
      `;
      try {
        if (init(testCode, new Map(), { debug: true }) !== true) return false;
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  // ---------------------------------------------------------------------------
  // course_assignment tests
  // ---------------------------------------------------------------------------

  {
    name: "isUpperDivision — true cases",
    test: () => {
      const mkCourse = (number: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: number, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const trueCases = [
        "100",
        "170",
        "199",
        "C100",
        "170L",
        "C170A",
        "N130",
        "W140B",
        "170AC",
      ];
      return trueCases.every((n) => isUpperDivision(mkCourse(n)));
    },
  },
  {
    name: "isUpperDivision — false cases",
    test: () => {
      const mkCourse = (number: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: number, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const falseCases = ["61", "61A", "99", "200", "C50", "1", "99B"];
      return falseCases.every((n) => !isUpperDivision(mkCourse(n)));
    },
  },
  {
    name: "runUnitAssignment — single-major regression",
    test: () => {
      // 2 buckets needing 4 units each. Course a (4 units) eligible for both;
      // course b (4 units) eligible for bucket 1 only. Optimal: a→0, b→1.
      const mkC = (num: string, units: number): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: units, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const a = mkC("170", 4);
      const b = mkC("161", 4);
      const result = runUnitAssignment([[a, b], [b]], [4, 4]);
      return result[0].length > 0 && result[1].length > 0;
    },
  },
  {
    name: "runUnitAssignment — bucket needing multiple courses to meet threshold",
    test: () => {
      const mkC = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const [a, b, c] = ["100", "110", "120"].map(mkC);
      const result = runUnitAssignment([[a, b, c]], [12]);
      return result[0].length === 3;
    },
  },
  {
    name: "runUnitAssignment — zero-unit course cannot satisfy a non-zero threshold",
    test: () => {
      const zeroUnit: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 0, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runUnitAssignment([[zeroUnit]], [4]);
      return result[0].length === 0;
    },
  },
  {
    name: "runJointAssignment — UD overlap respects cap=2",
    test: () => {
      // UD course CS 170 eligible for a leaf in each major. With cap=2 both
      // leaves should be satisfied (course counts in both).
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
          {
            ownerIdx: 1,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
        ],
        2
      );
      return result[0].length === 1 && result[1].length === 1;
    },
  },
  {
    name: "runJointAssignment — UD overlap blocked at cap=0",
    test: () => {
      // Same setup but cap=0 means CS 170 can go to only one major.
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
          {
            ownerIdx: 1,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
        ],
        0
      );
      const satisfied = result.filter((r) => r.length >= 1).length;
      return satisfied === 1; // only one major gets the course
    },
  },
  {
    name: "runJointAssignment — LD overlap is free (no budget cost)",
    test: () => {
      // LD course CS 61A can satisfy a leaf in each major without consuming
      // any overlap budget. Even with cap=0 for UD, LD overlaps are free.
      const cs61a: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "61A", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs61a],
          },
          {
            ownerIdx: 1,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs61a],
          },
        ],
        0 // cap=0 only restricts UD courses
      );
      return result[0].length === 1 && result[1].length === 1;
    },
  },
  {
    name: "runJointAssignment — cap=2 vs cap=1 with two contested UD courses",
    test: () => {
      // Two UD courses, each contested between one leaf per major.
      // cap=2 → all 4 leaves satisfied; cap=1 → 3 leaves satisfied.
      const mkUD = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const c170 = mkUD("170");
      const c161 = mkUD("161");
      const leaves = [
        {
          ownerIdx: 0 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [c170],
        },
        {
          ownerIdx: 0 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [c161],
        },
        {
          ownerIdx: 1 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [c170],
        },
        {
          ownerIdx: 1 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [c161],
        },
      ];
      const r2 = runJointAssignment(leaves, 2).filter(
        (r) => r.length >= 1
      ).length;
      const r1 = runJointAssignment(leaves, 1).filter(
        (r) => r.length >= 1
      ).length;
      return r2 === 4 && r1 === 3;
    },
  },
  {
    name: "runJointAssignment — mixed count+units",
    test: () => {
      // CS 170 (4 units, UD) can satisfy a count leaf in major 0 AND a units
      // leaf (needing 4 units) in major 1 simultaneously.
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
          {
            ownerIdx: 1,
            constraint: { kind: "units", threshold: 4 },
            eligible: [cs170],
          },
        ],
        2
      );
      return result[0].length === 1 && result[1].length === 1;
    },
  },
  {
    name: "runJointAssignment — leaf with empty eligible list is never satisfied",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [],
          },
        ],
        0
      );
      return result[0].length === 1 && result[1].length === 0;
    },
  },
  {
    name: "runJointAssignment — course cannot fill two leaves in the same owner",
    test: () => {
      // Per-major exclusivity: cs170 is eligible for two owner-0 leaves but can
      // only be used once per owner, so at most one of the two leaves is satisfied.
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const result = runJointAssignment(
        [
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
          {
            ownerIdx: 0,
            constraint: { kind: "count", threshold: 1 },
            eligible: [cs170],
          },
        ],
        2
      );
      return result.filter((r) => r.length >= 1).length === 1;
    },
  },
  {
    name: "computeOverlapCap — single major → 0",
    test: () => computeOverlapCap(["CS"], ["College of Engineering"]) === 0,
  },
  {
    name: "computeOverlapCap — two majors default → 2",
    test: () =>
      computeOverlapCap(
        ["CS", "Math"],
        ["College of Letters & Science", "College of Letters & Science"]
      ) === 2,
  },
  {
    name: "computeOverlapCap — two CoE majors → 5",
    test: () =>
      computeOverlapCap(
        ["EECS", "ME"],
        ["College of Engineering", "College of Engineering"]
      ) === 5,
  },
  {
    name: "computeOverlapCap — cross-college (L&S + CoE) → 2",
    test: () =>
      computeOverlapCap(
        ["CS", "Math"],
        ["College of Engineering", "College of Letters & Science"]
      ) === 2,
  },
  {
    name: "runJointReassignment — single major is no-op equivalent",
    test: () => {
      // Build a minimal NCoursesRequirement tree manually and verify that
      // running joint reassignment with 1 tree leaves it correctly filled.
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const req: NCoursesRequirement = {
        courses: { data: [cs170], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" }, // starts false; should become true
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      };
      runJointReassignment([[req as any]], 0);
      return req.result.data === true && req.courses.data.length === 1;
    },
  },
  {
    name: "runJointReassignment — two majors share LD course freely",
    test: () => {
      const cs61a: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "61A", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const mkReq = (): NCoursesRequirement => ({
        courses: { data: [cs61a], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      });
      const req0 = mkReq();
      const req1 = mkReq();
      runJointReassignment([[req0 as any], [req1 as any]], 0);
      // Both satisfied: LD overlap is free even with cap=0
      return req0.result.data === true && req1.result.data === true;
    },
  },
  {
    name: "runBipartiteMatch — augmenting path forces reassignment",
    test: () => {
      // slot0: eligible [A, B], slot1: eligible [A] only, slot2: eligible [C].
      // Greedy without augmenting: A→slot0, then slot1 can't get A → only 2/3
      // satisfied. With augmenting path: B→slot0, A freed → A→slot1, C→slot2.
      const mkC = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const A = mkC("170");
      const B = mkC("161");
      const C = mkC("189");
      const result = runBipartiteMatch([[A, B], [A], [C]]);
      return result.every((r) => r.length === 1); // all 3 satisfied
    },
  },
  {
    name: "runBipartiteMatch — slot with no eligible courses stays empty",
    test: () => {
      const mkC = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const result = runBipartiteMatch([[mkC("170")], [], [mkC("189")]]);
      return (
        result[0].length === 1 &&
        result[1].length === 0 &&
        result[2].length === 1
      );
    },
  },
  {
    name: "runJointAssignment — cap=2 is binding with 3 contested UD courses",
    test: () => {
      // 3 UD courses (A, B, C), each eligible for one leaf in owner 0 and one
      // in owner 1 (6 leaves total). cap=2 allows only 2 overlaps → 5 satisfied
      // (2 courses double-count, 1 goes to one owner only). cap=3 → all 6.
      const mkUD = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const [cA, cB, cC] = ["170", "161", "189"].map(mkUD);
      const leaves = [
        {
          ownerIdx: 0 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cA],
        },
        {
          ownerIdx: 0 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cB],
        },
        {
          ownerIdx: 0 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cC],
        },
        {
          ownerIdx: 1 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cA],
        },
        {
          ownerIdx: 1 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cB],
        },
        {
          ownerIdx: 1 as const,
          constraint: { kind: "count" as const, threshold: 1 },
          eligible: [cC],
        },
      ];
      const r2 = runJointAssignment(leaves, 2).filter(
        (r) => r.length >= 1
      ).length;
      const r3 = runJointAssignment(leaves, 3).filter(
        (r) => r.length >= 1
      ).length;
      return r2 === 5 && r3 === 6;
    },
  },
  {
    name: "runJointReassignment — cap=1 allows only 1 UD overlap in tree mutation",
    test: () => {
      // Two UD courses (A=170, B=161). Major 0 has a leaf for each; major 1
      // has a leaf for each. With cap=1, at most one course can double-count.
      // Optimal: one course overlaps (satisfies 2 leaves in 1 shot) + the other
      // goes to one major only → 3 leaves satisfied. cap=2 → all 4.
      const mkUD = (num: string): Course => ({
        subject: { data: "CS", type: "string" },
        number: { data: num, type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      });
      const mkReq = (course: Course): NCoursesRequirement => ({
        courses: { data: [course], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      });
      const cA = mkUD("170");
      const cB = mkUD("161");
      const [r0A, r0B] = [mkReq(cA), mkReq(cB)];
      const [r1A, r1B] = [mkReq(cA), mkReq(cB)];

      // cap=1: only 1 UD overlap allowed → 3 leaves satisfied
      runJointReassignment(
        [
          [r0A as any, r0B as any],
          [r1A as any, r1B as any],
        ],
        1
      );
      const sat1 = [r0A, r0B, r1A, r1B].filter((r) => r.result.data).length;

      // Reset and try cap=2: both overlap → 4 leaves satisfied
      [r0A, r0B, r1A, r1B].forEach((r, i) => {
        r.result.data = false;
        r.courses.data = [i < 2 ? cA : cA]; // reset eligible lists
      });
      r0A.courses.data = [cA];
      r0B.courses.data = [cB];
      r1A.courses.data = [cA];
      r1B.courses.data = [cB];
      runJointReassignment(
        [
          [r0A as any, r0B as any],
          [r1A as any, r1B as any],
        ],
        2
      );
      const sat2 = [r0A, r0B, r1A, r1B].filter((r) => r.result.data).length;

      return sat1 === 3 && sat2 === 4;
    },
  },
  {
    name: "runJointReassignment — AndRequirement parent result propagates",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const leaf: NCoursesRequirement = {
        courses: { data: [cs170], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      };
      const parent: AndRequirement = {
        requirements: { data: [leaf as any], type: "List<Requirement>" },
        result: { data: false, type: "boolean" },
        description: { data: "And wrapper", type: "string" },
        type: { data: "AndRequirement", type: "string" },
      };
      runJointReassignment([[parent as any]], 0);
      return leaf.result.data === true && parent.result.data === true;
    },
  },
  {
    name: "runJointReassignment — OrRequirement parent result propagates",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const satisfiable: NCoursesRequirement = {
        courses: { data: [cs170], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      };
      const unsatisfiable: NCoursesRequirement = {
        courses: { data: [], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      };
      const parent: OrRequirement = {
        requirements: {
          data: [satisfiable as any, unsatisfiable as any],
          type: "List<Requirement>",
        },
        result: { data: false, type: "boolean" },
        description: { data: "Or wrapper", type: "string" },
        type: { data: "OrRequirement", type: "string" },
      };
      runJointReassignment([[parent as any]], 0);
      return (
        satisfiable.result.data === true &&
        unsatisfiable.result.data === false &&
        parent.result.data === true
      );
    },
  },
  {
    name: "runJointReassignment — actual_count updated after assignment",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const req: NCoursesRequirement = {
        courses: { data: [cs170], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        actual_count: { data: 0, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      };
      runJointReassignment([[req as any]], 0);
      return req.actual_count!.data === 1 && req.result.data === true;
    },
  },
  {
    name: "runJointReassignment — NumberRequirement units leaf fills and sets actual",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const req: NumberRequirement = {
        courses: { data: [cs170], type: "List<Course>" },
        actual: { data: 0, type: "number" },
        required: { data: 4, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 4 units", type: "string" },
        type: { data: "NumberRequirement", type: "string" },
      };
      runJointReassignment([[req as any]], 0);
      return req.actual.data === 4 && req.result.data === true;
    },
  },
  {
    name: "runJointReassignment — third major tree is silently ignored",
    test: () => {
      const cs170: Course = {
        subject: { data: "CS", type: "string" },
        number: { data: "170", type: "string" },
        units: { data: 4, type: "number" },
        breadthRequirements: { data: [], type: "List<string>" },
        universityRequirement: { data: "", type: "string" },
        languageLevel: { data: "", type: "string" },
      };
      const mkReq = (): NCoursesRequirement => ({
        courses: { data: [cs170], type: "List<Course>" },
        required_count: { data: 1, type: "number" },
        result: { data: false, type: "boolean" },
        description: { data: "Need 1 course", type: "string" },
        type: { data: "NCoursesRequirement", type: "string" },
      });
      const req2 = mkReq();
      runJointReassignment(
        [[mkReq() as any], [mkReq() as any], [req2 as any]],
        2
      );
      return req2.result.data === false;
    },
  },
];

// Test function
const test = () => {
  const results = TESTS.map(({ name, test }) => ({
    name,
    passed: (() => {
      console.log(`\nStarting test: ${name}`);
      const result = test();
      console.log(`Test ${name} ${result ? "passed" : "failed"}\n\n`);
      return result;
    })(),
  }));
  const passedTests = results.filter((r) => r.passed).map((r) => r.name);
  const failedTests = results.filter((r) => !r.passed).map((r) => r.name);
  const greenColor = "\x1b[32m";
  const redColor = "\x1b[31m";
  const resetColor = "\x1b[0m";
  console.log(
    `${greenColor}Passed tests\n✓\t${passedTests.join("\n✓\t")}${resetColor}`
  );
  if (failedTests.length > 0) {
    console.log(
      `${redColor}Failed tests\n✗\t${failedTests.join("\n✗\t")}${resetColor}`
    );
  }
};

// Check if this file is being run directly
const isMainModule = () => {
  return (
    process.argv[1] === new URL(import.meta.url).pathname ||
    process.argv.includes("--test")
  );
};

// Only run tests if this file is executed directly
if (isMainModule()) {
  test();
}
