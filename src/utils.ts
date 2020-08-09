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
