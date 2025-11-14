export const argSplit = (argString: string) => {
  argString = argString.trim();
  const args: string[] = [];
  let lastComma = -1;
  let bracketCounter = 0;
  for (let i = 0; i < argString.length; i++) {
    if (argString.charAt(i) === "(" || argString.charAt(i) === "[" || argString.charAt(i) === "{") bracketCounter++;
    if (argString.charAt(i) === ")" || argString.charAt(i) === "]" || argString.charAt(i) === "}") bracketCounter--;
    if (argString.charAt(i) === "," && bracketCounter === 0) {
      const arg = argString.substring(lastComma + 1, i).trim();
      lastComma = i;
      args.push(arg);
    }
  }
  args.push(argString.substring(lastComma + 1).trim());
  return args;
}