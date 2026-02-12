import { init } from "./interpreter";

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
