export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 250,
) {
  let delayFlag = false;
  let previousResult: ReturnType<T>;

  return (...args: Parameters<T>): ReturnType<T> => {
    if (delayFlag) {
      return previousResult;
    }

    delayFlag = true;
    const result = fn(...args);

    setTimeout(() => {
      delayFlag = false;
    }, delay);

    previousResult = result;
    return result;
  };
}
