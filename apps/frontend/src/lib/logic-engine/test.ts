import { run } from "./interpreter";

const TESTS = [
  () => {
    const testCode = `
      // test comment
      boolean x false
      boolean y false
      boolean c contains([x, y, or([x, y])], true)
      boolean d contains([x, y, or([x, y, true])], true)
      boolean result get_element([x, y, or([x, y, true])], 2)
    `;
    
    try {
      const variable_map = run(testCode, true);
      if (variable_map.get("c")?.data !== false) return false;
      if (variable_map.get("d")?.data !== true) return false;
      if (variable_map.get("result")?.data !== true) return false;
      console.log("Test 1 passed");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  () => {
    const testCode = `
      string x "hello"
      string y "world"
      List<string> list [x, y]
      string result_1 get_element(list, 1)
      boolean result_2 contains(list, "world")
    `;
    try {
      const variable_map = run(testCode, true);
      if (variable_map.get("result_1")?.data !== "world") return false;
      if (variable_map.get("result_2")?.data !== true) return false;
      console.log("Test 2 passed");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
]

// Test function
const test = () => {
    const results = TESTS.map(test => test());
    console.log(results);
};

// Check if this file is being run directly
const isMainModule = () => {
  return process.argv[1] === new URL(import.meta.url).pathname ||
         process.argv.includes('--test');
};

// Only run tests if this file is executed directly
if (isMainModule()) {
  test();
}
