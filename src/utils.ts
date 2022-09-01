export function waitMs(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export type NumberRange = [number, number];

export function mapRange(sourceRange: NumberRange, targetRange: NumberRange, value: number): number {
  if (value <= sourceRange[0]) {
    return targetRange[0];
  } else if (value >= sourceRange[1]) {
    return targetRange[1];
  }
  return targetRange[0] + (value - sourceRange[0]) * (targetRange[1] - targetRange[0]) / (sourceRange[1] - sourceRange[0]);
}

export function rangeMapper(sourceRange: NumberRange, targetRange: NumberRange) {
  return mapRange.bind(null, sourceRange, targetRange);
}

export function isInRange(value: number, range: NumberRange) {
  return range[0] <= value && value < range[1];
}

/**
 * https://fnune.com/typescript/2019/01/30/typescript-series-1-record-is-usually-not-the-best-choice/
 */
export type Dictionary<K extends keyof any, T> = Partial<Record<K, T>>

export function times<T>(n: number, callback: (i: number) => T): T[] {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(callback(i));
  }
  return result;
}

export function repeat<T>(array: T[], n: number): T[] {
  return times(n, () => array).flat();
}