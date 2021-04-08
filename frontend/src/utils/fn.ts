export function debounce<T extends any[]>(
  f: (...args: T) => void,
  timeout: number
): (...args: T) => void {
  var timer: number;
  const debounced = (...args: T) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => f(...args), timeout);
  };
  return debounced;
}
