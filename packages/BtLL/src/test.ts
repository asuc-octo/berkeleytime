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
        const result = init(testCode, true);
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
        if (init(testCode, true) !== true) return false;
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
        if (init(testCode, true) !== 9) return false;
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
        if (init(testCode, true) !== true) return false;
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
  const greenColor = "\x1b[32m";
  const resetColor = "\x1b[0m";
  console.log(
    `${greenColor}Passed tests\n✓\t${passedTests.join("\n✓\t")}${resetColor}`
  );
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
