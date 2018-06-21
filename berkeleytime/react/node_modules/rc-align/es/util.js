export function buffer(fn, ms) {
  var timer = void 0;

  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function bufferFn() {
    clear();
    timer = setTimeout(fn, ms);
  }

  bufferFn.clear = clear;

  return bufferFn;
}

export function isSamePoint(prev, next) {
  if (prev === next) return true;
  if (!prev || !next) return false;

  return prev.pageX === next.pageX && prev.pageY === next.pageY || prev.clientX === next.clientX && prev.clientY === next.clientY;
}

export function isWindow(obj) {
  return obj && typeof obj === 'object' && obj.window === obj;
}