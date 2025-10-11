export const decimalToPercentString = (
  decimal: number,
  decimalPlaces: number = 1
): string => {
  return `${decimal.toFixed(decimalPlaces)}%`;
};
