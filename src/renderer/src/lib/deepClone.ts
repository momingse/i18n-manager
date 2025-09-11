export function deepClone<T>(
  value: T,
  hashmap = new WeakMap<object, any>(),
): T {
  // primitives (number, string, boolean, null, undefined, symbol, bigint)
  if (typeof value !== "object" || value === null) {
    return value;
  }

  // if already cloned, return the clone
  if (hashmap.has(value as object)) {
    return hashmap.get(value as object);
  }

  // handle arrays vs plain objects
  const clone: any = Array.isArray(value) ? [] : {};
  hashmap.set(value as object, clone);

  for (const key in value as any) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      clone[key] = deepClone((value as any)[key], hashmap);
    }
  }

  return clone;
}
