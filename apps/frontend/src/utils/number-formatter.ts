export const proportionToPercent = (
  proportion: number,
  decimalPlaces: number = 2
) => {
  return `${proportion.toFixed(decimalPlaces)}%`;
};
