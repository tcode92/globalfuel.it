export function debounce(callback: (...args: any[]) => void, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return function (this: any, ...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, ms);
  };
}
export function throttle(callback: (...args: any[]) => void, ms = 300) {
  let inThrottle = false;
  let timer: NodeJS.Timeout | null = null;

  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      callback.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, ms);
    } else {
      // If already in throttle, cancel the timer and reset it
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        callback.apply(this, args);
        timer = null;
      }, ms);
    }
  };
}
export function debounceAndThrottle(
  callback: (...args: any[]) => void,
  ms = 300
) {
  const throttled = throttle(callback, ms);
  return debounce(throttled, ms);
}
export function throttleAndDebounce(
  callback: (...args: any[]) => void,
  ms = 300
) {
  const debounced = debounce(callback, ms);
  return throttle(debounced, ms);
}
