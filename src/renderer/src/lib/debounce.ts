export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  wait = 250,
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
};
